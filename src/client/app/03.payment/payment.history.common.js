/**
 * FileName: payment.history.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.06
 */

Tw.PaymentHistoryCommon = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();
  this._bindDOM();
  this._bindEvent();
};

Tw.PaymentHistoryCommon.prototype = {
  _init: function () {
    this.paymentTypePopupValues = {
      title: Tw.MSG_PAYMENT.HISTORY_MENU_TITLE,
      menus: Tw.MSG_PAYMENT.HISTORY_MENU.split(',')
    };
  },

  _bindDOM: function () {

  },

  _bindEvent: function () {
    // this.$container.on('click', '.dev-payment-button button', $.proxy(this.handlePaymentTypeButton, this));
  },

  setMenuChanger: function (target, eventType, callback) {
    target.on(eventType, callback);
  },

  handlePaymentTypeButton: function () {
    // switch ($(buttons).index(e.target)) {
    //   case 0 :
    //     this._goLoad('/payment/history');
    //     break;
    //   case 1 :
    //     this._goLoad('/payment/history/immediate');
    //     break;
    //   case 2 :
    //     this._goLoad('/payment/history/auto');
    //     break;
    //   case 3 :
    //     this._goLoad('/payment/history/auto/unitedwithdrawal');
    //     break;
    //   case 4 :
    //     this._goLoad('/payment/history/point/reserve');
    //     break;
    //   case 5 :
    //     this._goLoad('/payment/history/point/auto');
    //     break;
    // }
  },

  openPaymentTypePopup: function () {
    this.popup.open({
      hbs: 'choice',
      title: this.paymentTypePopupValues.title,
      close_bt: true,
      list_tag: true,
      list: this.paymentTypePopupValues.menus
    });
  },

  _goLoad: function (url) {
    location.href = url;
  }
};
