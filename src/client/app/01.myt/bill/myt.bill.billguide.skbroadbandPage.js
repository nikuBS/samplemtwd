/**
 * FileName: myt.bill.billguide.skbroadbandPage.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.08
 * Info: sk브로드밴드(인터넷/IPTV/집전화)
 */

Tw.mytBillBillguideSkbroadbandPage = function (rootEl) {
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

Tw.mytBillBillguideSkbroadbandPage.prototype = {
  _init: function () {
    //this.$refillBtn = this.$container.find('.link-long > a');
  },
  _bindEvent: function () {
    //this.$container.on('click', '.slick-slide', $.proxy(this._selectCoupon, this));
  }
};
