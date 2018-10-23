/**
 * FileName: myt-join.wire.modify.address.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.10.15
 */
Tw.MyTJoinWireModifyAddress = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();

  this.addressFormData = {
    building: '',   // 건물 유형
    houseDt: '',    // 이사 날짜
    stopDt: '',     // 중단 희망 날짜
    installDt: '',  // 설치 희망 날짜
    hp: '',
    phone: ''
  };

  this.addressFormData2 = {
    basAddr: '',              // 기본 주소
    bldTypNm: '',             // 건물유형명
    cntcPrefrMblPhonNum: '',  // 연락희망이동전화번호
    cntcPrefrPhonNum: '',     // 연락희망전화번호
    dtlAddr: '',              // 설치장소 변경후 상세주소
    mvDt: '',                 // 이사일자
    occrDt: '',               // 발생일자
    occrTm: '',               // 발생시각
    reqrNm: '',               // 신청인명
    reqSiteClCd: '',          // 요청사이트구분 (01:T-WORLD, 02:SKB사이버고객센터, 03:모바일 T)
    setPrefrDt: '',           // 설치희망일자
    stopPrefrDt: '',          // 중단희망일자
    svcNm: ''                 // 서비스명
  };

};

Tw.MyTJoinWireModifyAddress.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();

  },
  _cachedElement: function () {

    this.$select_building= $('[data-target="select_building"]'); // 건물 유형

    this.$select_house_input= $('[data-target="select_house_input"]'); // 이사 날짜

    this.$select_stop_input= $('[data-target="select_stop_input"]'); // 중단 희망 날짜

    this.$select_install_input= $('[data-target="select_install_input"]'); // 설치 희망 날짜

    this.$input_hp= $('[data-target="input_hp"]'); // 휴대폰 번호
    this.$input_phone= $('[data-target="input_phone"]'); // 일반전화 (선택항목)

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="select_building"]', $.proxy(this.select_buildingEvt, this));

    this.$container.on('change', '[data-target="select_house_input"]', $.proxy(this.select_house_input_changeEvt, this));

    this.$container.on('change', '[data-target="select_stop_input"]', $.proxy(this.select_stop_input_changeEvt, this));

    this.$container.on('change', '[data-target="select_install_input"]', $.proxy(this.select_install_input_changeEvt, this));

    this.$container.on('keyup', '[data-target="input_hp"]', $.proxy(this.input_hpEvt, this));
    this.$container.on('keyup', '[data-target="input_phone"]', $.proxy(this.input_phoneEvt, this));

  },
  //--------------------------------------------------------------------------[EVENT]

  select_buildingEvt: function(event) {
    Tw.Logger.info('[건물유형클릭]', event);
    var $target = $(event.currentTarget); // 클릭 한 버튼
    var hbsName = 'actionsheet_select_a_type';
    var hashName = 'select_building';

    // '단독주택', '아파트', '공통주택', '일반건물', '지하', '사서함', '임시건물', '비건물'
    // Tw.MYT_JOIN_WIRE_MODIFY_ADDRESS.BUILDING
    var data = [{
      list: []
    }];

    var listData = _.map(Tw.MYT_JOIN_WIRE_MODIFY_ADDRESS.BUILDING, function (item, idx) {
      Tw.Logger.info('[건물유형 IDX]', idx);
      return {
        value: item,
        option: '',
        attr: 'data-value="' + item + '", data-target="selectBtn"'
      };
    });

    data[0].list = listData;

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: data,
        title: Tw.MYT_FARE_BILL_GUIDE_PPS.POP_TITLE_TYPE_0
      },
      $.proxy(this.select_buildingEvtOpen, this, $target),
      $.proxy(this.select_buildingEvtClose, this, $target),
      hashName);
  },

  //--------------------------------------------------------------------------[SVC]
  // 건물 유형
  select_buildingEvtOpen: function( $target, $layer ) {
    // Tw.Logger.info('[팝업 open > $target > 클릭한 버튼]', $target);
    // Tw.Logger.info('[팝업 open > $layer > 레이어 팝업]', $layer);

    var building = this.addressFormData.building;
    var indexOfVal = Tw.MYT_JOIN_WIRE_MODIFY_ADDRESS.BUILDING.indexOf(building);

    if ( indexOfVal !== -1 ) { // 존재할때 실행 체크
      Tw.Logger.info('[건물 유형 존재할때 실행]', indexOfVal );
      $layer.find('.chk-link-list > li').eq(indexOfVal).find('button').addClass('checked');
    }

    //팝업 속 버튼을 클릭했을 때
    $layer.on('click', '[data-target="selectBtn"]', $.proxy( function(event) {
      var $targetChild = $(event.currentTarget);
      var tempDataVal = $targetChild.attr('data-value');
      this.addressFormData.building = tempDataVal;
      $target.text( tempDataVal );

      $layer.find('.chk-link-list li > button').removeClass('checked');
      $targetChild.addClass('checked');
      this._popupService.close();

    }, this));

  },
  select_buildingEvtClose: function() {
    Tw.Logger.info('[팝업 close > select_buildingEvtClose]');
    Tw.Logger.info('[addressFormData]', this.addressFormData);
  },

  // 이사 날짜
  select_house_input_changeEvt: function () {
    Tw.Logger.info('[select_house_input_changeEvt]');
    var tempDt = this.$select_house_input.val();
    this.addressFormData.houseDt = tempDt;
    this.$select_house_input.val( tempDt );
    Tw.Logger.info('[addressFormData]', this.addressFormData);
  },

  // 중단 희망 날짜
  select_stop_input_changeEvt: function () {
    Tw.Logger.info('[select_stop_input_changeEvt]');
    var tempDt = this.$select_stop_input.val();
    this.addressFormData.stopDt = tempDt;
    this.$select_stop_input.val( tempDt );
    Tw.Logger.info('[addressFormData]', this.addressFormData);
  },

  // 설치 희망 날짜
  select_install_input_changeEvt: function () {
    // Tw.Logger.info('[select_install_input_changeEvt]');
    var curDt = Tw.DateHelper.getCurrentDateTime('YYYY-MM-DD');
    var endDt = Tw.DateHelper.getShortDateWithFormatAddByUnit(curDt, 14, 'day', 'YYYY-MM-DD', 'YYYY-MM-DD');
    var tempDt = this.$select_install_input.val();
    Tw.Logger.info('[설치희망날짜]', tempDt, curDt, endDt);

    //유효성 체크
    if ( this._dateChkBetween(tempDt, curDt, endDt) ) {
      Tw.Logger.info('[범위에 포함]');
      this.addressFormData.installDt = tempDt;
      this.$select_install_input.val( tempDt );
    } else {
      Tw.Logger.info('[범위에 포함 안됨!!]', this.$select_install_input);
      this.$select_install_input.val('');
    }

    Tw.Logger.info('[addressFormData]', this.addressFormData);
  },
  //--------------------------------------------------------------------------[Validation]
  /*
  * @param {string} date, {string} date, {string} date
  * @return boolean
   */
  _dateChkBetween: function($search, $betweenStart, $betweenEnd) {
    var search = $search;
    var betweenStart = $betweenStart;
    var betweenEnd = $betweenEnd;
    return moment(search).isBetween(betweenStart, betweenEnd, null, '[)');
  },

  //--------------------------------------------------------------------------[API]

  //--------------------------------------------------------------------------[COM]
  _comComma: function ($str) {
    var str = String($str);
    return Tw.FormatHelper.addComma(str);
  },
  _comUnComma: function ($str) {
    var str = String($str);
    // return str.replace(/[^\d]+/g, '');
    return str.replace(/,/g, '');
  },
  _phoneStrToDash: function (str) {
    var strVal = String(str);
    return strVal.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  },
  _goBack: function () {
    this._history.go(-1);
  },
  _goLoad: function (url) {
    location.href = url;
  },
  _go: function (hash) {
    this._history.setHistory();
    window.location.hash = hash;
  },
  // 휴대폰 번호 입력 시 자동 하이픈 넣기
  _onFormatHpNum : function (e) {
    var _$this = $(e.currentTarget);
    var data = _$this.val();
    data = data.replace(/[^0-9]/g,'');

    var tmp = '';

    if (data.length > 3 && data.length <= 6) {
      tmp += data.substr(0, 3);
      tmp += '-';
      tmp += data.substr(3);
      data = tmp;
    } else if (data.length > 6) {
      tmp += data.substr(0, 3);
      tmp += '-';
      var size = data.length < 11 ? 3 : 4;
      tmp += data.substr(3, size);
      tmp += '-';
      tmp += data.substr(3+size);
      data = tmp;
    }
    _$this.val(data);
  }

};