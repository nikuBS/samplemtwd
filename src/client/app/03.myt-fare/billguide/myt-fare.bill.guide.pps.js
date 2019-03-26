/**
 * MenuName: 나의 요금 > 요금안내서 > 선불폰(PPS)(MF_02_04)
 * FileName: myt-fare.bill.guide.pps.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 * Summary: 선불폰 이용내역 조회 및 화면 처리
 */
Tw.MyTFareBillGuidePps = function (rootEl, resData) {
  this.resData = resData;
  // Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService();

  this.selDateObj = {
    maxDt: null,
    minDt: null,
    curDt: null, // 현재 date
    defaultDt: null, // 기준 date
    startDt: null, // start date
    endDt: null, // end date
    startRangeNum: 6,
    endRangeNum: 2,
    selectList: null,
    selectEndList: null
  };

  this.bffListData = null; //원본 리스트 데이터
  this.detailListObj = [{
    listData: null,
    curLen: 0, //현재 데이터 카운트
    startCount: 20, // 시작 데이터 카운트
    addCount: 20, // 추가 데이터 카운트
    viewData: [], // 잘라서 넣는 데이터
    searchType: '' // 검색 타입 : 음성 or 데이터
  }];

  this._init();
};

Tw.MyTFareBillGuidePps.prototype = {
  _init: function () {
    this._registerHelper();
    this._cachedElement();
    this._bindEvent();
    this._dateInit();

  },
  /**
   * hbs 헬퍼 등록
   * @private
   */
  _registerHelper: function () {
    // v1,v2가 동일한지 검사
    Handlebars.registerHelper('if_eq', function (v1, v2, options) {
      if ( v1 === v2 ) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
  },
  /**
   * element cache
   * @private
   */
  _cachedElement: function () {
    this.$entryTplList = $('#fe-entryTplList');

    this.$startDtBtn = $('[data-target="startDtBtn"]'); // 조회 기간 선택(시작)
    this.$endDtBtn = $('[data-target="endDtBtn"]'); // 조회 기간 선택(끝)

    this.$detailList = $('[data-target="detailList"]'); // 리스트 영역
    this.$addBtn = $('[data-target="addBtn"]'); // 더보기 버튼
    this.$curNum = $('[data-target="curNum"]'); // curNum

    this.$addBtnArea = $('[data-target="addBtnArea"]'); // 더보기 버튼 영

    this.$searchType = $('[data-target="searchType"]');

    this.$fingerprint = $('[data-target="fingerprint"]'); // 원하시는 기간을 선택후 조회해주세요.

  },
  /**
   * even bind
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '[data-target="startDtBtn"]', $.proxy(this._startDtBtnEvt, this));
    this.$container.on('click', '[data-target="endDtBtn"]', $.proxy(this._endDtBtnEvt, this));
    this.$container.on('click', '[data-target="searchBtn"]', $.proxy(this._searchBtnEvt, this));
    this.$container.on('click', '[data-target="addBtn"]', $.proxy(this._addView, this));

  },

  _proData: function () { //데이터 가공
    var thisMain = this;
    // Tw.Logger.info('[ _proData ]');
    this.detailListObj[0].listData = $.extend(true, [], this.bffListData); // deep copy array
    this.detailListObj[0].curLen = this.detailListObj[0].listData.length;

    _.map(this.detailListObj[0].listData, function (item) {
      item.usedDt = Tw.DateHelper.getShortDate(item.usedDt);

      // 0보다 작을 경우 데이터 이외 사용 항목(음성/sms/충전 등)
      if ( Number(item.used) < 0 ) {
        item.used = '-';
        item.dataUnit = '';
      } else {
        item.used = (Number(item.used) / 1024).toFixed();
        item.used = thisMain._comComma(item.used);
        item.dataUnit = Tw.DATA_UNIT.MB;
      }

      item.rate = thisMain._comComma(Number(item.rate||0).toFixed());
      return item;
    });
    // Tw.Logger.info('[ _proData end ]', this.detailListObj[0]);
  },

  /**
   * 화면에 데이터 세팅
   * @private
   */
  _ctrlInit: function () {
    var thisMain = this;
    this._cachedElement();

    /*
    * A. 데이터 요금제 : searchType => typeData
    * B. 음성 요금제 : searchType => typeVoice
    * C. 음성 + 데이터 요금제 : 라디오버튼의 선택에따라 typeData or typeVoice
     */
    if ( thisMain.resData.commDataInfo.ppsType === 'A' ) {
      this.detailListObj[0].searchType = 'typeData';
    } else if ( thisMain.resData.commDataInfo.ppsType === 'B' ) {
      this.detailListObj[0].searchType = 'typeVoice';
    } else if ( thisMain.resData.commDataInfo.ppsType === 'C' ) {
      var searchType = this.$searchType.find('input[name="radio1"]:checked').val();
      this.detailListObj[0].searchType = searchType;
    }

    this._dataSplice(this.detailListObj[0].listData, this.detailListObj[0].startCount);
    this._svcHbDetailList(this.detailListObj, this.$detailList, this.$entryTplList);

    // this.$curNum.html('( ' + this.detailListObj[0].curLen + ' )');

    if ( this.detailListObj[0].curLen <= 0 ) {
      this.$addBtnArea.hide().attr('aria-hidden', true);
    }

  },
  _addView: function () {
    if ( this.detailListObj[0].curLen <= 0 ) {
      return;
    }

    this._cachedElement();
    this._dataSplice(this.detailListObj[0].listData, this.detailListObj[0].addCount);
    this._svcHbDetailList(this.detailListObj, this.$detailList, this.$entryTplList);

    // this.$curNum.html('( ' + this.detailListObj[0].curLen + ' )');

    // Tw.Logger.info('[ detailListObj.curLen 2 ]', this.detailListObj[0].curLen);
    if ( this.detailListObj[0].curLen <= 0 ) {
      this.$addBtnArea.hide().attr('aria-hidden', true);
    }
  },
  //--------------------------------------------------------------------------[EVENT]
  /**
   * 조회 시작일자 선택 actionsheet 팝업
   * @param event
   * @private
   */
  _startDtBtnEvt: function (event) {
    var listData = this.selDateObj.selectList;
    this._selectDatePopEvt(event, 'start', listData);

  },
  /**
   * 조회 종료일자 선택 actionsheet팝업
   * 종료일자 선택 조건 = 선택 시작월부터 +2개월까지
   * @param event
   * @private
   */
  _endDtBtnEvt: function (event) {

    var startDt = this.selDateObj.startDt;
    var maxDt = this.selDateObj.maxDt;
    var momentStart = moment(startDt, 'YYYYMM');
    // var momentEnd = '';
    var momentMax = moment(maxDt, 'YYYYMM');

    this.selDateObj.selectEndList = [];

    var pushData = '';
    var momentTemp = '';

    // 순차적으로 0, +1, +2 를 더한다.
    for ( var i=1, len=2; i<=len; i++ ) {
      momentTemp = momentStart.add(1, 'months');
      var diffNum = momentMax.diff(momentTemp, 'months');

      if (diffNum < 0) {break;}

      // Tw.Logger.info('[ momentStart]', momentStart.format('YYYYMM'));
      // Tw.Logger.info('[ momentMax]', momentMax.format('YYYYMM'));

      // Tw.Logger.info('[ diffNum]', diffNum);

      if ( diffNum >= 0 ) {
        // Tw.Logger.info('[ start 는 max]');

        var radioAttr = 'id="ra'+i+'" name="r1" data-value="' + momentTemp.format('YYYYMM') + '"';
        // if(reqDate === invDtArr[idx]){
        //   radioAttr += ' checked';
        // }
        pushData = {
          'label-attr': 'id="ra'+i+'"',
          'radio-attr': radioAttr,
          'txt': momentTemp.format(Tw.MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE)
        };

        // pushData = {
        //   value: momentTemp.format(Tw.MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE),
        //   option: '',
        //   attr: 'data-value="' + momentTemp.format('YYYYMM') + '", data-target="selectBtn"'
        // };
        this.selDateObj.selectEndList.push(pushData);
      }
    }

    this.selDateObj.selectEndList.reverse();

    // Tw.Logger.info('[selDateObj] ', this.selDateObj);

    var listData = this.selDateObj.selectEndList;
    this._selectDatePopEvt(event, 'end', listData);
  },

  /**
   * 날짜 선택 actionsheet 팝업 호출
   * @param event
   * @param state
   * @param listData - 선택 날짜 list
   * @private
   */
  _selectDatePopEvt: function (event, state, listData) {
    var $target = $(event.currentTarget);
    var hbsName = 'actionsheet01';
    var data = [{
      list: null
    }];
    var hashName = 'selectDatePopEvt';
    var titleStr = Tw.MYT_FARE_BILL_GUIDE_PPS.POP_TITLE_TYPE_2;

    data[0].list = listData;

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: data,
        title: titleStr,
        btnfloating : { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE }
      },
      $.proxy(this._selectDatePopEvtInit, this, $target, state),
      $.proxy(this._selectDatePopEvtClose, this, $target),
      hashName);

  },
  // 날짜선택 팝업 init
  _selectDatePopEvtInit: function ($target, state, $layer) {
    // Tw.Logger.info('[_selectDatePopEvtInit > $layer]', $layer);

    // 현재 선택된 날짜 체크
    var selectVal = $target.attr('data-value');
    var $selectBtnTg = $layer.find('[data-value="' + selectVal + '"]');

    $selectBtnTg.prop('checked', true);

    // 이벤트 설정
    $layer.one('click', 'li.type1', $.proxy(this._setSelectedValue, this, $target, state));
  },
  /**
   * [날짜선택 팝업] 날짜 선택시
   * @param $target
   * @param state
   * @param event
   * @private
   */
  _setSelectedValue: function ($target, state, event) {

    var $tg = $(event.currentTarget);
    var selectDateVal = $tg.find('input[type=radio]').attr('data-value');
    // Tw.Logger.info('[선택 : ]', selectDateVal);

    var momentObj = moment(selectDateVal, 'YYYYMM');

    var dataVal;

    if ( state === 'start' ) {
      dataVal = momentObj.startOf('month').format('YYYYMM');
      this.selDateObj.startDt = dataVal;
    } else {
      dataVal = momentObj.endOf('month').format('YYYYMM');
      this.selDateObj.endDt = dataVal;
    }
    $target.attr('data-value', dataVal);
    $target.text(momentObj.format('YYYY.M.'));

    // Tw.Logger.info(this.selDateObj);

    this._popupService.close();
  },
  // 날짜선택 팝업 닫기시
  _selectDatePopEvtClose: function () {
    // Tw.Logger.info('[팝업 닫기 : actionsheet_select_a_type]');
    //this._popupService.close();
  },

  // 조회 버튼 클릭시
  _searchBtnEvt: function () {


    var momentStart = moment(this.selDateObj.startDt, 'YYYYMM');
    var momentEnd = moment(this.selDateObj.endDt, 'YYYYMM');

    var diffMontsVal = momentEnd.diff(momentStart, 'months'); // end - start = 비교

    if ( diffMontsVal >= 0 ) {

      if ( diffMontsVal <= this.selDateObj.endRangeNum ) {
        // 유효성 완료, 조회 진행
        // Tw.Logger.info('[유효성 완료, 조회 진행] ');
        // console.info('[selDateObj] ', this.selDateObj);
        this._getHistoriesInfo();

      } else {
        // 검색 범위 초과
        // Tw.Logger.info('[검색 범위 초과] ');
        this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.A59, Tw.POPUP_TITLE.NOTIFY, null,
          $.proxy(function () {

          }, this));
      }

    } else {
      // end 값이 큰 경우
      // Tw.Logger.info('[시작일이 종료일보다 큰경우] ');
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.A60, Tw.POPUP_TITLE.NOTIFY, null,
        $.proxy(function () {

        }, this));


    }
    // Tw.Logger.info('[end - start = 비교] ', diffMontsVal);

  },


  //--------------------------------------------------------------------------[API]
  /**
   * 사용내역 조회
   * @returns {*}
   * @private
   */
  _getHistoriesInfo: function () {
    return this._apiService.request(Tw.API_CMD.BFF_05_0014, {
      startMM: this.selDateObj.startDt,
      endMM: this.selDateObj.endDt
    }).done($.proxy(this._getHistoriesInfoInit, this));


  },
  /**
   * 사용내역 조회결과
   * @param res
   * @private
   */
  _getHistoriesInfoInit: function (res) {

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.$fingerprint.hide().attr('aria-hidden', true);
      if(!res.result || res.result.length === 0){
        $('#div-usage-empty').show().attr('aria-hidden', false);
      }else {
        $('#div-usage-empty').hide().attr('aria-hidden', true);
      }

      // Tw.Logger.info('[res] ', res);
      var dataArr = res.result;
      /*
      * 상세 내역 리스트
      */
      this.$addBtnArea.show().attr('aria-hidden', false);
      this.$detailList.empty();
      this._listDataInit(dataArr); // 데이터 초기화
      this._proData(); // 데이터 가공
      this._ctrlInit(); // 데이터 뿌려주기


    }
  },
  //--------------------------------------------------------------------------[SVC]

  /**
   * 사용내역 데이터 초기화
   * @param res
   * @private
   */
  _listDataInit: function (dataArr) {
    /*
    * 데이터 초기화
     */
    this.bffListData = dataArr;
    this.detailListObj[0].listData = null;
    this.detailListObj[0].curLen = 0;
    this.detailListObj[0].viewData = [];
    this.detailListObj[0].searchType = '';

  },
  // 목록 나누기
  _dataSplice: function (listData, count) {
    var tempListData = listData;
    var tempCount = count;
    var spliceData = tempListData.splice(0, tempCount);
    this.detailListObj[0].viewData = spliceData;
    this.detailListObj[0].curLen = this.detailListObj[0].listData.length;
    // Tw.Logger.info('[ _dataSplice end ]', this.detailListObj[0]);
  },
  // 최초 날짜 등 데이터 초기화
  _dateInit: function () {
    this.selDateObj.curDt = moment().format('YYYYMM'); // 현재
    this.selDateObj.defaultDt = moment().subtract('1', 'months').format('YYYYMM'); // 기준
    this.selDateObj.startDt = this.resData.commDataInfo.ppsStartDateVal; // start date
    this.selDateObj.endDt = this.resData.commDataInfo.ppsEndDateVal; // end date
    this._getMaxMinDate(this.selDateObj.defaultDt); // 최대값, 최소값 설정

    /*
    * 선택 데이터 리스트
     */
    this.selDateObj.selectList = [];
    // this.selDateObj.selectEndList = [];

    for ( var i = 1, len = this.selDateObj.startRangeNum; i <= len; i++ ) {

      var defaultVal = moment().subtract(i, 'months').format('YYYYMM');
      var pushData = {
        'label-attr': 'id="ra1'+i+'"',
        'radio-attr': 'id="ra1'+i+'" name="r1" data-value="' + defaultVal + '"',
        'txt': moment().subtract(i, 'months').format(Tw.MYT_FARE_BILL_GUIDE.DATE_FORMAT.YYYYMM_TYPE)
      };
      this.selDateObj.selectList.push(pushData);
      // this.selDateObj.selectEndList.push(pushData);
    }

    // console.info('[selDateObj] ', this.selDateObj);

  },

  _getMaxMinDate: function(strVal) {
    var tempVal = strVal;
    var maxVal = moment(tempVal, 'YYYYMM').format('YYYYMM'); // 최대 moment
    var minVal = moment(tempVal, 'YYYYMM').subtract( 5, 'months').format('YYYYMM'); // 최소 moment
    this.selDateObj.maxDt = maxVal;
    this.selDateObj.minDt = minVal;

    // Tw.Logger.info('[tempVal] ', tempVal);
    // Tw.Logger.info('[maxVal] ', maxVal);
    // Tw.Logger.info('[minVal] ', minVal);
  },

  /**
   * 데이터 화면에 출력
   * @param resData - 데이터
   * @param $jqTg - 출력될 html area
   * @param $hbTg - hbs 템플릿
   * @private
   */
  _svcHbDetailList: function (resData, $jqTg, $hbTg) {
    var jqTg = $jqTg;
    var hbTg = $hbTg;
    var source = hbTg.html();
    var template = Handlebars.compile(source);
    var data = {
      resData: resData
    };
    var html = template(data);
    jqTg.append(html);
  },

  //--------------------------------------------------------------------------[COM]
  _comComma: function (str) {
    if(!str) return '';
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  }

};