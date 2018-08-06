/**
 * FileName: customer.email.call.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.08.01
 */

Tw.CustomerEmailCall = function (rootEl, oEmailTemplate) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._oEmailTemplate = oEmailTemplate;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailCall.prototype = {
  _init: function () {

  },

  _cachedElement: function () {

  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-email-register', $.proxy(this._registerEmail, this));
  },

  _registerEmail: function () {
    var currentState = this._oEmailTemplate.state;

    if ( currentState.tabIndex === 1 ) {
      this._history.replaceURL('/customer/email/complete?email=test@naver.com');
    }
  }
};

