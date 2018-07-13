/**
 * FileName: myt.bill.billguide.combineRepresentPage.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.08
 * Info: 통합청구(대표)
 */

Tw.mytBillBillguideCombineRepresentPage = function (rootEl, dataObj) {
  this.dataObj = dataObj;
  Tw.Logger.info('[서버에서 데이터 받음]', dataObj);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();
  this._bindEvent();
};

Tw.mytBillBillguideCombineRepresentPage.prototype = {
  _init: function () {
    //this.$refillBtn = this.$container.find('.link-long > a');
  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="testTg"]', $.proxy(this._goDetailSpecification, this));
  },
  _goDetailSpecification: function () {//상세요금
    Tw.Logger.info('상세요금 내역');
    this._go('#DetailsOfCharges');
  },






  _onOpenSelectPopup: function () {
    //$('.popup-info').addClass('scrolling');
  },
  _goHistory: function () {
    this._goLoad('/recharge/cookiz/history');
  },
  _goBack: function () {
    this._history.go(-1);
  },
  _goLoad: function (url) {
    location.href = url;
  },
  _go: function (hash) {
    window.location.hash = hash;
  }
};
