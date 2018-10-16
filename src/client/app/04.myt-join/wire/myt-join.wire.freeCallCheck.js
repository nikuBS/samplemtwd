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

    this._freeCallCheckInfo();
  },
  _cachedElement: function () {
    // this.$entryTpl = $('#fe-entryTpl');
    this.$inputPhone = $('[data-target="inputPhone"]');

  },
  _bindEvent: function () {
    // this.$container.on('click', '[data-target="monBtn"]', $.proxy(this._monthBtnEvt, this));

    this.$container.on('keypress', '[data-target="inputPhone"]', $.proxy(this._inputPhoneKeypressEvt, this));
    this.$container.on('keyup', '[data-target="inputPhone"]', $.proxy(this._inputPhoneKeyupEvt, this));
    //onkeypress="return fn_press(event, 'numbers');" onkeydown="fn_press_han(this);"
  },
  //--------------------------------------------------------------------------[EVENT]
  _inputPhoneKeypressEvt: function(event) {
    // Tw.Logger.info('[keypress event]', event);
    this._fn_press(event, 'numbers');
  },
  _inputPhoneKeyupEvt: function (event) {
    // Tw.Logger.info('[keyup event]', event);
    var $target = $(event.currentTarget);
    this._fn_press_han(event, $target);

  },
  //--------------------------------------------------------------------------[API]
  _freeCallCheckInfo: function () {
    var thisMain = this;
    $.ajax('http://localhost:3000/mock/wire.BFF_05_0160.json')
      .done(function (resp) {
        Tw.Logger.info(resp);
        thisMain._freeCallCheckInfoInit(resp);
      })
      .fail(function (err) {
        Tw.Logger.info(err);
      });
  },
  _freeCallCheckInfoInit: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('[결과] _freeCallCheckInfoInit', res);
    }
  },
  //--------------------------------------------------------------------------[SVC]


  //--------------------------------------------------------------------------[COM]
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


  _fn_press: function (event, type) {
    Tw.Logger.info('[key code]', event.which?event.which:event.keyCode);
    if ( type === 'numbers' ) {
      Tw.Logger.info('[numbers]');
      if ( event.keyCode < 48 || event.keyCode > 57 ) return false;
    }
  },
  _fn_press_han: function (event, obj) {
    Tw.Logger.info('[_fn_press_han]', obj, obj.val());
    //좌우 방향키, 백스페이스, 딜리트, 탭키에 대한 예외
    if ( event.keyCode === 8 || event.keyCode === 9 || event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 46 ) return;

    var inputVal = obj.val();
    var inputValReplace = inputVal.replace(/[^0-9]/g, '');

    Tw.Logger.info('[inputValReplace2]', inputValReplace);
    obj.val(inputValReplace);
  }



};