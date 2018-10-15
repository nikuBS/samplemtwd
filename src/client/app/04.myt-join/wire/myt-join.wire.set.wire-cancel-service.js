/**
 * FileName: myt-join.wire.set.wire-cancel-service.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.10.15
 */
Tw.MyTJoinWireSetWireCancelService = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();

};

Tw.MyTJoinWireSetWireCancelService.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();

  },
  _cachedElement: function () {
    // this.$entryTpl = $('#fe-entryTpl');
    // this.$dateSelect= $('[data-target="dateSelect"]');

  },
  _bindEvent: function () {
    // this.$container.on('click', '[data-target="monBtn"]', $.proxy(this._monthBtnEvt, this));


  },
  //--------------------------------------------------------------------------[EVENT]

  //--------------------------------------------------------------------------[API]


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
  }

};