/**
 * MenuName: 나의 데이터/통화 > 실시간 잔여량
 * @file myt-data.usage.js
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018.11.28
 * Summary: 실시간 잔여량 및 부가 서비스 조회
 */
Tw.MyTDataUsage = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._options = options;

  this._cachedElement();
  this._bindEvent();
  this._registerHelper();
  this._requestServices();
  this._init();
  this._setCoachMark();

};

Tw.MyTDataUsage.prototype = {

  _cachedElement: function () {
    this._$sharedDataUsed = this.$container.find('#sharedDataUsed');
  },

  _init: function () {
    // [DV001-6336] 기본제공 데이터 존재 && 가족모아데이터가 가능한 상품(T/O플랜 등)이 아닌 경우
    // T끼리데이터선물 + 데이터 함께쓰기 사용량을 합쳐서 통합공유 데이터 영역의 사용량에 표시(참고: 잔여량은 기본제공데이터의 잔여량)
    if ( _.size(this._$sharedDataUsed) ) {
      this._setSharedDataUsed();
    }
  },

  _setSharedDataUsed: function () {
    var reqList = [];
    var today = new Date();
    // T끼리 선물하기
    reqList.push({
      command: Tw.API_CMD.BFF_06_0018,
      params: {
        fromDt: Tw.DateHelper.getShortDateWithFormat(today, 'YYYYMM01'),
        toDt: Tw.DateHelper.getShortDateWithFormat(today, 'YYYYMMDD'),
        type: '1'
      }
    });
    // 데이터 함께쓰기
    if ( this._options.dataSharing === 'Y' ) {
      reqList.push({
        command: Tw.API_CMD.BFF_05_0004,
        params: {}
      });
    }
    new Tw.SharedDataUsedCalculation({
      reqList: reqList,
      done: $.proxy(function (totalSumConv) {
        this._$sharedDataUsed.text(totalSumConv.data + totalSumConv.unit);
      }, this)
    });
  },

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    // 당일사용량 조회버튼
    this.$container.on('click', 'button.fe-btn-daily-used', $.proxy(this._setDailyUsed, this));

    // 24시간 데이터 50% 할인 사용량 - 실시간 사용 요금 바로가기 버튼 - 실시간 사용 요금으로 이동
    this.$container.on('click', '#fe-cont-discount .btn-more button', $.proxy(function () {
      this._historyService.goLoad('/myt-fare/bill/hotbill');
    }, this));

    // 데이터 한도 요금제 - 충전 가능 금액 확인 버튼 - 데이터 한도 요금제로 이동
    this.$container.on('click', '#fe-cont-data-limit .fe-btn-recharge', $.proxy(function () {
      this._historyService.goLoad('/myt-data/recharge/limit');
    }, this));

    // 내폰끼리 결합 상세 조회
    this.$container.on('click', '#list-band-data-share .fe-btn-request', $.proxy(this._requestBandDetail, this));


    // 통합공유 데이터 상세
    this.$container.on('click', '.fe-btn-share', $.proxy(function () {
      this._historyService.goLoad('/myt-data/hotdata/total-sharing');
    }, this));


    // 데이터 함께쓰기 상세 조회
    this.$container.on('click', '#fe-data-share .fe-btn-used-data', $.proxy(this._onClickBtnDataShareDetail, this));


  },

  /**
   * usageDataResp 데이터중 prodId에 해당하는 데이터 반환
   * @param usageDataResp
   * @param prodId
   * @return object
   */
  _getDailyUsed: function (usageDataResp, prodId) {
    var datas = [];
    if ( _.size(usageDataResp.gnrlData) ) {
      datas = datas.concat(usageDataResp.gnrlData);
    }
    if ( _.size(usageDataResp.spclData) ) {
      datas = datas.concat(usageDataResp.spclData);
    }
    return _.find(datas, {
      prodId: prodId,
      skipId: 'PA'
    });
  },


  /**
   * 당일사용량 조회 데이터 표시
   * @param event
   */
  _setDailyUsed: function (event) {
    this._apiService.request(Tw.SESSION_CMD.BFF_05_0001)
      .done($.proxy(function (resp) {
        if ( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result ) {
          this._showErrorAlert(resp.code, resp.msg);
          return;
        }
        var $button = $(event.currentTarget);
        var $used = $button.closest('li').find('.fe-use');
        var dailyUsed = this._getDailyUsed(resp.result, $button.data('prodid'));
        if ( Tw.FormatHelper.isEmpty(dailyUsed) ) {
          this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.DAILY_USED_USAGE_ERROR);
          return;
        }
        if ( dailyUsed ) {
          $button.hide();
          dailyUsed.showUsed = this._convFormat(dailyUsed.used, dailyUsed.unit);
          $used.find('strong').text(dailyUsed.showUsed.data + dailyUsed.showUsed.unit);
          $used.show();
        }
      }, this))
      .fail(function () {
      });
  },

  _convFormat: function (data, unit) {
    switch ( unit ) {
      case Tw.UNIT_E.DATA:
        return Tw.FormatHelper.convDataFormat(data, Tw.UNIT[unit]);
      case Tw.UNIT_E.VOICE:
      case Tw.UNIT_E.VOICE_2:
      case Tw.UNIT_E.VOICE_3:
        return Tw.FormatHelper.convVoiceFormat(data);
      case Tw.UNIT_E.SMS:
      case Tw.UNIT_E.SMS_2:
        return Tw.FormatHelper.addComma(data);
      case Tw.UNIT_E.FEE:
        return Tw.FormatHelper.addComma(data);
      default:
    }
    return '';
  },

  /**
   * 서비스 호출
   * @private
   */
  _requestServices: function () {

    var reqList = [];

    if ( 'Y' === this._options.tdataSharing ) {
      reqList.push({ command: Tw.API_CMD.BFF_05_0005, params: {} }); // T데이터셰어링 사용량 조회
    }
    if ( 'Y' === this._options.troamingSharing ) {
      reqList.push({ command: Tw.API_CMD.BFF_05_0003, params: {} }); // T로밍 함께쓰기
    }
    if ( 'Y' === this._options.dataTopUp ) {
      reqList.push({ command: Tw.API_CMD.BFF_05_0006, params: {} }); // 데이터한도요금제 조회
    }
    if ( 'Y' === this._options.ting ) {
      reqList.push({ command: Tw.API_CMD.BFF_05_0007, params: {} }); // 팅요금상품 사용량 조회
    }
    if ( 'Y' === this._options.dataDiscount ) {
      reqList.push({ command: Tw.API_CMD.BFF_05_0008, params: {} }); // 24시간 데이터 50% 할인 조회
    }
    if ( 'Y' === this._options.bandDataSharing ) {
      reqList.push({ command: Tw.API_CMD.BFF_05_0078, params: {} }); // 내 폰끼리 결합
    }
    if ( 'Y' === this._options.dataSharing && !JSON.parse(this._options.hasDefaultData) ) { // 기본제공 데이터 없음 && 데이터 함께쓰기 이용중
      reqList.push({ command: Tw.API_CMD.BFF_05_0004, params: {} });
    }

    if ( reqList.length <= 0 ) {
      return;
    }

    this._apiService.requestArray(reqList)
      .done($.proxy(function () {

        for ( var i = 0; i < reqList.length; i++ ) {
          var resp = arguments[i];

          if ( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result ) {
            this._showErrorAlert(resp.code, resp.msg);
            continue;
          }

          switch ( reqList[i].command.path ) {
            case Tw.API_CMD.BFF_05_0005.path :
              this._resultHandlerTDataShare(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0003.path :
              this._resultHandlerTRoamingShare(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0006.path :
              this._resultHandlerDataLimit(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0007.path :
              this._resultHandlerTing(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0008.path :
              this._resultHandler24Data50per(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0078.path :
              this._resultHandlerBandDataShare(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0004.path :
              this._resultHandlerDataShare(resp.result);
              break;
            default :
              break;
          }
        }

      }, this))
      .fail($.proxy(this._requestFail, this));

  },

  _requestFail: function (resp) {
    this._showErrorAlert(resp.code, resp.msg);
  },


  /**
   * t데이터 세어링 result handler
   * @param data
   * @private
   */
  _resultHandlerTDataShare: function (data) {
    //console.log('== RESP T데이터셰어링 ==');
    //console.log(data);

    var fmtData = { data: '', unit: '' };

    // 사용 중인 요금상품 + 기본제공량
    if ( data.opmdBasic !== '-1' ) {
      fmtData = Tw.FormatHelper.convDataFormat(data.opmdBasic, Tw.DATA_UNIT.KB);
      $('#fe-head-tdata-share .tit span').text(fmtData.data + fmtData.unit);
    }

    // 총데이터 사용량
    fmtData = Tw.FormatHelper.convDataFormat(data.totShar, Tw.DATA_UNIT.KB);
    $('#fe-head-tdata-share .num em').text(fmtData.data);
    $('#fe-head-tdata-share .num span').text(fmtData.unit);

    _.each(data.childList, function (child) {
      child.isUsing = data.adultYn === 'Y' && child.svcStCd === 'AC';
    });

    var childHtml = this._dataToHtml(data.childList, '#fe-tdata-share-child-item');
    $('#fe-list-tdata-share').append(childHtml);

  },

  /**
   * t로밍 함께쓰기 result handler
   * @param data
   * @private
   */
  _resultHandlerTRoamingShare: function (data) {
    //console.log('== RESP T로밍 함께쓰기 ==');
    //console.log(data);
    if (!data.dataSharing) {
      return;
    }
    var fmtData = { data: '', unit: '' };
    // 상단 잔여량
    fmtData = Tw.FormatHelper.convDataFormat(data.dataSharing.data.remained, Tw.DATA_UNIT.KB);
    $('#fe-head-troaming-share .num em').text(fmtData.data);
    $('#fe-head-troaming-share .num span').text(fmtData.unit);
    // t로밍상품명
    $('#fe-cont-troaming-share .graphbox-title').text(data.roamProdNm);
    // 잔여량
    fmtData = Tw.FormatHelper.convDataFormat(data.dataSharing.data.remained, Tw.DATA_UNIT.KB);
    $('#fe-cont-troaming-share .data-state:eq(0) em:eq(0)').text(fmtData.data);
    $('#fe-cont-troaming-share .data-state:eq(0) em:eq(1)').text(fmtData.unit);
    // 사용량
    fmtData = Tw.FormatHelper.convDataFormat(data.dataSharing.data.used, Tw.DATA_UNIT.KB);
    $('#fe-cont-troaming-share .data-state:eq(1) em:eq(0)').text(fmtData.data);
    $('#fe-cont-troaming-share .data-state:eq(1) em:eq(1)').text(fmtData.unit);

    // 그래프 표시
    var per = parseInt(parseInt(data.dataSharing.data.remained, 10) / parseInt(data.dataSharing.data.total, 10) * 100, 10);
    // $('#fe-cont-troaming-share .data-bar').width(per + '%');
    $('#fe-cont-troaming-share #fe-troaming-share-graph').attr('class', 'c100 p' + per);

    // 잔여일시
    var times = this.minToDayHourMin(data.dispRemainDay);
    var strTimes = times.days > 0 ? times.days + Tw.PERIOD_UNIT.DAYS : '';
    strTimes = strTimes + times.hours + Tw.PERIOD_UNIT.HOURS + times.minutes + Tw.PERIOD_UNIT.MINUTES;
    $('#fe-cont-troaming-share .fe-chargedate-box span').text(strTimes);

    if (data.dataSharing.childList && data.dataSharing.childList.length > 0) {
      data.dataSharing.childList = _.reject(data.dataSharing.childList, function(item){
        return item.role === 'Y';
      });
      var childHtml = this._dataToHtml(data.dataSharing.childList, '#fe-troaming-share-child-item');
      $('#fe-list-troaming-share').append(childHtml);
    }

  },

  /**
   * 데이터 한도 요금제 잔여량
   * @param data
   * @private
   */
  _resultHandlerDataLimit: function (data) {
    //console.log('== RESP 데이터한도요금제 ==');
    //console.log(data);

    // 공제항목명
    // $('#fe-cont-data-limit .fe-skipnm').text(data.skipNm);
    // 충전금액
    var tot = Tw.FormatHelper.addComma(data.total) || 0;
    $('#fe-cont-data-limit .fe-recharge-amt').text(tot);
    // 잔여량
    var remained = Tw.FormatHelper.addComma(data.remained) || 0;
    $('#fe-cont-data-limit .fe-remain-amt').text(remained);
  },

  /**
   * 팅 요금상품 잔여량
   * @param data
   * @private
   */
  _resultHandlerTing: function (data) {
    //console.log('== RESP 팅요금상품 사용량 ==');
    //console.log(data);

    for ( var i = 0; i < data.length; i++ ) {
      data[i].skipLabel = Tw.TING_TITLE[data[i].skipId];
      data[i].skipNm = Tw.MYT_DATA_USAGE.TING_SKIPNM_PREFIX + data[i].skipNm;
      data[i].unitLabel = Tw.CURRENCY_UNIT.WON;
    }

    var childHtml = this._dataToHtml(data, '#fe-ting-child-item');
    $('#fe-list-ting').append(childHtml);

  },

  /**
   * 24시간 데이터 50% 할인 사용량
   * @param data
   * @private
   */
  _resultHandler24Data50per: function (data) {
    // 쿠폰 적용 기간
    $('#fe-cont-discount .fe-use-date')
      .text(Tw.DateHelper.getShortDateAndTime(data.rgstDtm) + '~' + Tw.DateHelper.getShortDateAndTime(data.exprDtm));

    // 사용량
    var fmtData = Tw.FormatHelper.convDataFormat(data.used, Tw.DATA_UNIT.KB);
    $('#fe-cont-discount .fe-use-data span:eq(0)').text(fmtData.data);
    $('#fe-cont-discount .fe-use-data span:eq(1)').text(fmtData.unit);
  },

  /**
   * 내폰끼리 결합 사용량 목록 result handler
   * @param data
   * @private
   */
  _resultHandlerBandDataShare: function (data) {
    //console.log('== RESP 내폰끼리결합 사용량 ==');
    //console.log(data);

    // 총 사용량
    var fmtData = Tw.FormatHelper.convDataFormat(data.data.used, Tw.DATA_UNIT.KB);
    $('#head-band-data-share .num em').text(fmtData.data);
    $('#head-band-data-share .num span').text(fmtData.unit);

    var childHtml = this._dataToHtml(data.childList, '#fe-band-data-share-li');
    $('#list-band-data-share').append(childHtml);

  },


  /**
   * 데이터 함께쓰기 사용량 목록 result handler
   * @param result
   * @private
   */
  _resultHandlerDataShare: function (result) {
    var _$dataChildTmpl = this.$container.find('#fe-child-tmpl');
    var $dataShareContainer = this.$container.find('#fe-data-share');
    var $children = $dataShareContainer.find('.fe-children');
    var children = result.childList || [];
    var source = _$dataChildTmpl.html();
    var template = Handlebars.compile(source);

    if (result.data) {
      var usedData = Tw.FormatHelper.convDataFormat(result.data.used, Tw.DATA_UNIT.KB);
      $dataShareContainer.find('.fe-data-share-header .num em').text(usedData.data);
      $dataShareContainer.find('.fe-data-share-header .num span').text(usedData.unit);
    }

    $children.empty();
    _.each(children, $.proxy(function (child) {
      child.auditDtm = Tw.DateHelper.getShortDate(child.auditDtm);
      child.svcNum = Tw.FormatHelper.getDashedCellPhoneNumber(child.svcNum);
      var $child = template(child);
      $children.append($child);
    }, this));
  },

  /**
   * 내폰끼리 결합 사용량 상세 조회
   * @private
   */
  _requestBandDetail: function (event) {
    var $btnContainer = $(event.target).parent();
    var svcNum = $btnContainer.attr('data-child-svcnum');

    this._apiService.request(Tw.API_CMD.BFF_05_0009, { cSvcMgmtNum: svcNum })
      .done($.proxy(function (resp) {

        if ( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result ) {
          this._showErrorAlert(resp.code, resp.msg);
          return;
        }

        var tmpl = Handlebars.compile($('#fe-band-data-share-li-detail').html());
        var html = tmpl(resp.result);

        $btnContainer.html(html);
      }, this))
      .fail($.proxy(this._requestFail, this));

  },

  /**
   * 데이터 함께쓰기 사용량 상세 조회
   * @private
   */
  _onClickBtnDataShareDetail: function(event) {
    event.preventDefault();
    var targetSelector = $(event.target);
    var svcMgmtNum = targetSelector.data('svcmgmtnum');
    this._apiService.request(Tw.API_CMD.BFF_05_0009, { cSvcMgmtNum: svcMgmtNum })
      .done($.proxy(this._reqDataShareDetailDone, this, targetSelector))
      .fail($.proxy(this._reqDataShareDetailFail, this, targetSelector));
  },

  /**
   * 데이터 함께쓰기 사용량 상세 조회 성공
   * @private
   */
  _reqDataShareDetailDone: function (targetSelector, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var used = Tw.FormatHelper.convDataFormat(resp.result.used, Tw.DATA_UNIT.KB);
      var $feUsedDataResult = targetSelector.parent().find('.fe-used-data-result');
      $feUsedDataResult.find('.fe-data').text(used.data);
      $feUsedDataResult.find('.fe-unit').text(used.unit);
      targetSelector.hide();
      $feUsedDataResult.show();
    } else {
      this._popupService.openAlert(resp.msg, resp.code, null, null, null, targetSelector);
    }
  },


  /**
   * 데이터 함께쓰기 사용량 상세 조회 실패
   * @private
   */
  _reqDataShareDetailFail: function (targetSelector, resp) {
    this._popupService.openAlert(resp.msg, resp.code, null, null, null, targetSelector);
  },


  /**
   * 핸들바 helper 등록
   * @private
   */
  _registerHelper: function () {
    Handlebars.registerHelper('byteFormat', function (amt) {
      return Tw.FormatHelper.convDataFormat(amt, Tw.DATA_UNIT.KB).data;
    });
    Handlebars.registerHelper('byteUnit', function (amt) {
      return Tw.FormatHelper.convDataFormat(amt, Tw.DATA_UNIT.KB).unit;
    });
    Handlebars.registerHelper('dateFormat', Tw.DateHelper.getShortDate);
    Handlebars.registerHelper('dashPhoneNum', Tw.FormatHelper.getDashedCellPhoneNumber);
    Handlebars.registerHelper('numComma', Tw.FormatHelper.addComma);
    Handlebars.registerHelper('usimFormat', this.convUsimFormat);
  },

  /**
   * 팝업 - 정보보기 버튼 클릭
   * @param title
   * @param contents
   */
  // showGuidePopup : function (title, contents) {
  //   this._popupService.openTypeA(title, contents);
  // },

  /**
   * data로 html을 만들어서 리턴
   * @param list - data list
   * @param tmpId - hbs script
   * @returns list html {string}
   * @private
   */
  _dataToHtml: function (list, tmpId) {
    if ( !list || list.length < 0 ) {
      return '';
    }

    var tmpl = Handlebars.compile($(tmpId).html());
    var html = '';
    for ( var i = 0; i < list.length; i++ ) {
      html += tmpl(list[i]);
    }

    return html;
  },

  /**
   * show error alert popup
   * @param code
   * @param msg
   * @private
   */
  _showErrorAlert: function (code, msg) {
    return Tw.Error(code, msg).pop();
  },


  /**
   * minutes -> {days, hours, minutes}
   * @param min
   * @return object {days, hours, minutes}
   */
  minToDayHourMin: function (min) {
    var endDate = moment().add(min, 'minutes');
    var diff = moment(endDate).diff(new Date());
    var diffDuration = moment.duration(diff);
    return {
      days: diffDuration.days(),
      hours: diffDuration.hours(),
      minutes: diffDuration.minutes()
    };
  },

  /**
   * usim format
   * @param v(string)
   * @returns 'xxxx-xxxx-xxxx-xx'(string) format
   */
  convUsimFormat: function (v) {
    if ( !v || v.replace(/-/g).trim().length < 14 ) return v || '';
    var ret = v.replace(/-/g).trim();
    ret = ret.substr(0, 4) + '-' + ret.substr(4, 4) + '-' + ret.substr(8, 4) + '-' + ret.substr(12, 2);
    return ret;
  },

  /**
   * @function
   * @desc 코치마크 처리
   * @private
   */
  _setCoachMark: function () {
    new Tw.CoachMark(this.$container, '.fe-coach-share', '.fe-coach-share-target', Tw.NTV_STORAGE.COACH_MYTDATA_HOTDATA_SHARE);
  }

};
