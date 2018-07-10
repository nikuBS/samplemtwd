/**
 * FileName: myt.bill.billguide.individualPage.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.08
 * Info: 개별청구
 */

Tw.mytBillBillguideIndividualPage = function (rootEl) {
  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService();
  this._history.init();

  this._init();
  this._bindEvent();
};

Tw.mytBillBillguideIndividualPage.prototype = {
  _init: function () {
    //this.$refillBtn = this.$container.find('.link-long > a');
  },
  _bindEvent: function () {
    //this.$container.on('click', '.slick-slide', $.proxy(this._selectCoupon, this));
  }
};
