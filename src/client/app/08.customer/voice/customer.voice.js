Tw.CustomerVoice = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerVoice.prototype = {
  _cachedElement: function () {

  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-go-sms', $.proxy(this._goToSms, this));
    this.$container.on('click', '.fe-btn-go-info', $.proxy(this._goToInfo, this));
    this.$container.on('click', '.fe-btn-auth', $.proxy(this._openAuthConfirm, this));
    this.$container.on('click', '.fe-btn-auth-cancel', $.proxy(this._openAuthCancel, this));
    this.$container.on('click', '.fe-inp-term', $.proxy(this._checkTerms, this));
    this.$container.on('click', '.close-step', $.proxy(this._openCloseProcess, this));
  },

  _checkTerms: function (e) {
    $('.fe-btn-auth').prop('disabled', !$(e.currentTarget).prop('checked'));
  },

  _openAuthConfirm: function () {
    this._history.setHistory();
    location.hash = 'complete';
  },

  _openAuthCancel: function () {
    this._popupService.openConfirm(
      Tw.BUTTON_LABEL.CONFIRM,
      Tw.MSG_CUSTOMER.VOICE_A02,
      null,
      null,
      $.proxy(this._authConfirm, this),
      $.proxy(this._authCancel, this));
  },

  _openCloseProcess: function () {
    this._popupService.openConfirm(
      Tw.BUTTON_LABEL.CONFIRM,
      Tw.MSG_CUSTOMER.VOICE_A03,
      null,
      null,
      $.proxy(this._authConfirm, this),
      $.proxy(this._authCancel, this));
  },

  _authConfirm: function () {

  },

  _authCancel: function () {
    this._popupService.close();
  },

  _goToInfo: function () {
    // this._history.resetHistory();
    // location.href = '/customer/voice/info';
    this._history.resetHashHistory();
    location.href = '/customer/voice/info';
  },

  _goToSms: function () {
    location.href = '/customer/voice/sms';
  }
};