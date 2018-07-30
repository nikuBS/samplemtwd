/**
 * FileName: customer.voice.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.07.25
 */

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
    this.$btn_go_voice_sms = $('#fe-btn-go-sms');
  },

  _bindEvent: function () {
    this.$btn_go_voice_sms.on('click', $.proxy(this._goToVoiceSms, this));
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

  _goToVoiceSms: function () {
    var response = {
      code: '00',
      msg: 'success',
      result: {
        hitoriesYn: 'N',
        svcInfo: [
          {
            svcMgmtNum: '7016134141',
            svcNum: '01053573886'
          },
          {
            svcMgmtNum: '7039762321',
            svcNum: '01063753891'
          }
        ]
      }
    };

    if ( response.result.historyYn === 'N' ) {
      //TODO: alert
      // this._history.goLoad('/customer/voice/sms');
      return false;
    }

    return true;
  }
};