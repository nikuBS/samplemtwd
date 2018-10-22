/**
 * FileName: myt-join.wire.feeCallCheck.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.10.15
 */
Tw.MyTJoinWireFreeCallCheck = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();

};

Tw.MyTJoinWireFreeCallCheck.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();


  },
  _cachedElement: function () {
    // this.$entryTpl = $('#fe-entryTpl');
    this.$inputPhone = $('[data-target="inputPhone"]');
    this.$lookupBtn = $('[data-target="lookupBtn"]');

  },
  _bindEvent: function () {
    this.$container.on('keyup', '[data-target="inputPhone"]', $.proxy(this._onFormatHpNum, this));
    this.$container.on('click', '[data-target="lookupBtn"]', $.proxy(this._lookupBtnEvt, this));
  },
  //--------------------------------------------------------------------------[EVENT]
  _lookupBtnEvt: function(event) {
    Tw.Logger.info('[_lookupBtnEvt]', this.$inputPhone.val(), event );
    // var $target = $(event.currentTarget);
    var phoneNm = this._vdPhoneNm( this.$inputPhone.val() );
    var phoneNmArr = phoneNm.split('-');
    Tw.Logger.info('[phoneNmArr]', phoneNmArr);
    var param = {
      tel01: phoneNmArr[0],
      tel02: phoneNmArr[1],
      tel03: phoneNmArr[2]
    };
    this._freeCallCheckInfo(param);
  },
  //--------------------------------------------------------------------------[API]
  _freeCallCheckInfo: function (param) {

    return this._apiService.request(Tw.API_CMD.BFF_05_0160, param).done($.proxy(this._freeCallCheckInfoInit, this));

    // var thisMain = this;
    // $.ajax('http://localhost:3000/mock/wire.BFF_05_0160.json')
    //   .done(function (resp) {
    //     Tw.Logger.info(resp);
    //     thisMain._freeCallCheckInfoInit(resp);
    //   })
    //   .fail(function (err) {
    //     Tw.Logger.info(err);
    //   });

  },
  _freeCallCheckInfoInit: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('[결과] _freeCallCheckInfoInit', res);

      // freeCallYn : "Y", noChargeYn : "Y" 중 하나라도 "N"이 나오면 해당 문구를 보여줘야한다.
      if (res.result.freeCallYn === 'N' || res.result.noChargeYn === 'N') {
        this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A80.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A80.TITLE);

      }
    }
  },
  //--------------------------------------------------------------------------[SVC]
  _resultTextAreaView: function() {

  },
  //--------------------------------------------------------------------------[Validation]
  _vdPhoneNm:function( $phoneNm ) {
    Tw.Logger.info('[휴대폰 유효성 체크]', $phoneNm);
    var phoneNm = $phoneNm;
    Tw.ValidationHelper.checkMoreLength(phoneNm, 10, Tw.ALERT_MSG_MYT_FARE.V18);
    // phoneNm = this._noDash( phoneNm ); // 대시 삭제
    Tw.Logger.info('[휴대폰 유효성 체크 결과]', phoneNm);
    return phoneNm;
  },
  //--------------------------------------------------------------------------[COM]
  _noDash: function(str) {
    str = String(str);
    return str.split('-').join('');
  },
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  },
  _comUnComma: function (str) {
    str = String(str);
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