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

  // 클라이언트 파일 변경 테스트 코드
  // this.$container.find('.fe-test').css({backgroundColor: 'red'});


  // this._resultHandlerTRoamingShare({
  //   dispRemainDay : '4000',
  //   roamProdNm : 'T로밍 함께쓰기 3GB',
  //   dataSharing : {
  //     data : {
  //       total : '3000000',
  //       remained : '2000000',
  //       used : '1000000'
  //     },
  //     childList : [{
  //       role : 'Y',
  //       svcNum : '01012**56**',
  //       svcMgmtNum : '722xxxxxx',
  //       used : '300000',
  //       auditDtm : '20180523'
  //     }]
  //   }
  // });


  // this._resultHandler24Data50per({
  //   'prodId': 'NA00003458',
  //   'prodNm': '올인원34 한도관리',
  //   'skipId': 'DP',
  //   'skipNm': '충전금액 20,000원',
  //   'unlimit': '',
  //   'total': '20000',
  //   'used': '14551',
  //   'remained': '5449',
  //   'unit': '110',
  //   'rgstDtm': '20180728030101',
  //   'exprDtm': '20180728235959'
  // });

  // this._resultHandlerBandDataShare({
  //   data: {
  //     used: '300000'
  //   },
  //   'childList': [{
  //     'svcMgmtNum': '722xxxxxx',
  //     'svcNum': '01012345678',
  //     'feeProdId': 'NA000xxx',
  //     'feeProdNm': 'LTE함께쓰기',
  //     'auditDtm': '20141010'
  //   }]
  // });
};

Tw.MyTDataUsage.prototype = {

  _cachedElement: function () {
    this._$sharedDataUsed = this.$container.find('#sharedDataUsed');
  },

  _init: function () {
    if ( _.size(this._$sharedDataUsed) ) { // T/O플랜아님 && 기본제공데이터 존재
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
    if ( this._options.tdataSharing === 'Y' ) {
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
      this._historyService.goLoad('/myt-fare/hotbill');
    }, this));

    // 데이터 한도 요금제 - 충전 가능 금액 확인 버튼 - 데이터 한도 요금제로 이동
    this.$container.on('click', '#fe-cont-data-limit .fe-btn-recharge', $.proxy(function () {
      this._historyService.goLoad('/myt-data/recharge/limit');
    }, this));

    // 내폰끼리 결합 상세 조회
    this.$container.on('click', '#list-band-data-share .fe-btn-request', $.proxy(this._requestBandDetail, this));


    // 내폰끼리 결합 상세 조회
    this.$container.on('click', '.fe-btn-share', $.proxy(function () {
      this._historyService.goLoad('/myt-data/hotdata/total-sharing');
    }, this));

  },

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

  _setDailyUsed: function (event) {
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_05_0001)
      .done($.proxy(function (resp) {
        Tw.CommonHelper.endLoading('.container');
        if ( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result ) {
          this._showErrorAlert(resp.code, resp.msg);
          return;
        }
        var $button = $(event.currentTarget);
        var $used = $button.closest('li').find('.fe-use');
        var dailyUsed = this._getDailyUsed(resp.result, $button.data('prodid'));
        if (Tw.FormatHelper.isEmpty(dailyUsed)) {
          this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.DAILY_USED_USAGE_ERROR);
          return;
        }
        if (dailyUsed) {
          $button.hide();
          dailyUsed.showUsed = this._convFormat(dailyUsed.used, dailyUsed.unit);
          $used.find('strong').text(dailyUsed.showUsed.data + dailyUsed.showUsed.unit);
          $used.show();
        }
      }, this))
      .fail(function() {
        Tw.CommonHelper.endLoading('.container');
      });
  },

  _convFormat: function (data, unit) {
    switch ( unit ) {
      case Tw.UNIT_E.DATA:
        return Tw.FormatHelper.convDataFormat(data, Tw.UNIT[unit]);
      case Tw.UNIT_E.VOICE:
      case Tw.UNIT_E.VOICE_2:
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

    if ( reqList.length <= 0 ) {
      return;
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);

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
            default :
              break;
          }
        }
        Tw.CommonHelper.endLoading('.container');

      }, this))
      .fail($.proxy(this._requestFail, this));

  },

  _requestFail: function (resp) {
    this._showErrorAlert(resp.code, resp.msg);
    Tw.CommonHelper.endLoading('.container');
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

    var childHtml = this._dataToHtml(data.dataSharing.childList, '#fe-troaming-share-child-item');
    $('#fe-list-troaming-share').append(childHtml);

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
    $('#fe-cont-data-limit .fe-skipnm').text(data.skipNm);
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
   * 내폰끼리 결합 사용량 상세 조회
   * @private
   */
  _requestBandDetail: function (event) {
    var $btnContainer = $(event.target).parent();
    var svcNum = $btnContainer.attr('data-child-svcnum');

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_05_0009, { cSvcMgmtNum: svcNum })
      .done($.proxy(function (resp) {

        if ( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result ) {
          this._showErrorAlert(resp.code, resp.msg);
          Tw.CommonHelper.endLoading('.container');
          return;
        }

        var tmpl = Handlebars.compile($('#fe-band-data-share-li-detail').html());
        var html = tmpl(resp.result);

        $btnContainer.html(html);
        Tw.CommonHelper.endLoading('.container');
      }, this))
      .fail($.proxy(this._requestFail, this));

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
    Handlebars.registerHelper('dashPhoneNum', Tw.FormatHelper.getFormattedPhoneNumber);
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
  }

};
