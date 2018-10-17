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
    this.$container.on('click', '[data-target="select_building"]', $.proxy(this.select_buildingEvt, this));
    this.$container.on('click', '[data-target="select_house"]', $.proxy(this._testEvt, this));
    this.$container.on('click', '[data-target="select_stop"]', $.proxy(this._testEvt, this));
    this.$container.on('click', '[data-target="select_install"]', $.proxy(this._testEvt, this));
    this.$container.on('click', '[data-target="input_hp"]', $.proxy(this._testEvt, this));
    this.$container.on('click', '[data-target="input_phone"]', $.proxy(this._testEvt, this));

  },
  //--------------------------------------------------------------------------[EVENT]
  _testEvt: function() {

  },
  select_buildingEvt: function(event) {
    Tw.Logger.info('[건물유형클릭]', event);
    var $target = $(event.currentTarget);
    var hbsName = 'actionsheet_select_a_type';
    var hashName = 'select_building';

    // '단독주택', '아파트', '공통주택', '일반건물', '지하', '사서함', '임시건물', '비건물'
    var data = [{
      list: [
        {
          value: '단독주택',
          option: 'class',
          attr: 'attr'
        }
      ]
    }];
    // data[0].list = listData;

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: data,
        title: Tw.MYT_FARE_BILL_GUIDE.POP_TITLE_TYPE_0
      },
      $.proxy(this.select_buildingEvtOpen, this, $target),
      $.proxy(this.select_buildingEvtClose, this, $target),
      hashName);
  },

  //--------------------------------------------------------------------------[SVC]
  select_buildingEvtOpen: function() {
    Tw.Logger.info('[팝업 open > select_buildingEvtOpen]');
  },
  select_buildingEvtClose: function() {
    Tw.Logger.info('[팝업 close > select_buildingEvtClose]');
  },
  //--------------------------------------------------------------------------[API]

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