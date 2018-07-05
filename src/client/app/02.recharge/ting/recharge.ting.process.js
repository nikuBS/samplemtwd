/**
 * FileName: recharge.ting.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeTingProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeTingProcess.prototype = {
  target: {
    phone: '',
    amount: ''
  },

  _init: function () {
    $('#wrap_tpl_contact').html(this.tpl_contact({ isMobile: Tw.BrowserHelper.isMobile() }));
  },

  _cachedElement: function () {
    this.tpl_contact = Handlebars.compile(this.$container.find('#tpl_contact').text());
  },

  _bindEvent: function () {
    this.$container.on('input', '.input input', $.proxy(this._setPhoneNumber, this));
    this.$container.on('click', '.btn_validateStep1', $.proxy(this._validateStep1, this));
  },

  _setPhoneNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);

    this.target.phone = $(e.currentTarget).val();
  },

  _validateStep1: function () {
    // this._apiService.request(Tw.API_CMD.BFF_06_0022, { befrSvcNum: this.target.phone })
    //   .done(function () {
    //   })
    //   .fail($.proxy(this._sendFail, this));
    this._go('#step2');
  },

  _validateStep2: function () {
    // console.log('onClick Step2');
  },

  _sendFail: function () {
  },

  _goHistory: function () {
    this._goLoad('/recharge/ting/history');
  },

  _goLoad: function (url) {
    location.href = url;
  },

  _go: function (hash) {
    window.location.hash = hash;
  }
};