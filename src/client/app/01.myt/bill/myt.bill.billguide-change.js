/**
 * FileName: myt.bill.billguide-change.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.05
 */
Tw.MyTBillGuideChangePrototype = {
  _construct: function(rootEl) {
    this.$container = rootEl;
    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;

    this._assign();
    this._bindEvent();
    this._init();
  },

  _assign: function () {
    this._$btnSubmit = this.$container.find('.btn-submit');
  },

  _bindEvent: function () {
    this._$btnSubmit.on('click', $.proxy(this._submit, this));
  },

  _submit: function() {
    window.alert(1);
  },

  _init: function () {
  }
};
Tw.MyTBillGuideChangeClasses = {
  'tworld': function(rootEl) {
    this._construct(rootEl);
  },
  'email': function(rootEl) {
    this._construct(rootEl);
  },
  'etc': function(rootEl) {
    this._construct(rootEl);
  },
  'billLetter': function(rootEl) {
    this._construct(rootEl);
  },
  'sms': function(rootEl) {
    this._construct(rootEl);
  },
  'billLetterEmail': function(rootEl) {
    this._construct(rootEl);
  },
  'smsEmail': function(rootEl) {
    this._construct(rootEl);
  },
  'billLetterSms': function(rootEl) {
    this._construct(rootEl);
  }
};

Tw.MyTBillGuideChangeClasses.tworld.prototype = $.extend(Tw.MyTBillGuideChangePrototype, {
  _init: function() {
    // window.alert('MyTBillTworldBillGuideChange');
  }
});