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

};

Tw.MyTJoinWireModifyAddress.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();

  },
  _cachedElement: function () {
    // this.$entryTpl = $('#fe-entryTpl');
    this.$select_building= $('[data-target="select_building"]'); // 건물 유형
    this.$select_house= $('[data-target="select_house"]'); // 이사 날짜
    this.$select_stop= $('[data-target="select_stop"]'); // 중단 희망 날짜
    this.$select_install= $('[data-target="select_install"]'); // 설치 희망 날짜
    this.$input_hp= $('[data-target="input_hp"]'); // 휴대폰 번호
    this.$input_phone= $('[data-target="input_phone"]'); // 일반전화 (선택항목)

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="select_building"]', $.proxy(this._testEvt, this));
    this.$container.on('click', '[data-target="select_house"]', $.proxy(this._testEvt, this));
    this.$container.on('click', '[data-target="select_stop"]', $.proxy(this._testEvt, this));
    this.$container.on('click', '[data-target="select_install"]', $.proxy(this._testEvt, this));
    this.$container.on('click', '[data-target="input_hp"]', $.proxy(this._testEvt, this));
    this.$container.on('click', '[data-target="input_phone"]', $.proxy(this._testEvt, this));

  },
  //--------------------------------------------------------------------------[EVENT]
  _testEvt: function() {

  },
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