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
    // this.$dateSelect= $('[data-target="dateSelect"]');

  },
  _bindEvent: function () {
    // this.$container.on('click', '[data-target="monBtn"]', $.proxy(this._monthBtnEvt, this));



  },
  //--------------------------------------------------------------------------[EVENT]

  //--------------------------------------------------------------------------[API]
  _freeCallCheckInfo: function() {
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
  _freeCallCheckInfoInit: function(res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('[결과] _freeCallCheckInfoInit', res );
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
  }

};