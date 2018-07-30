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
  this._init();
};

Tw.CustomerVoice.prototype = {
  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0009, {})
      .done($.proxy(this._onSuccessVoiceStatus, this));
  },
  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-go-sms', $.proxy(this._goToVoiceSms, this));
    this.$container.on('click', '.fe-btn-auth', $.proxy(this._openAuthConfirm, this));
    this.$container.on('click', '.fe-btn-auth-cancel', $.proxy(this._openAuthCancel, this));
    this.$container.on('click', '.fe-inp-term', $.proxy(this._checkTerms, this));
    this.$container.on('click', '.close-step', $.proxy(this._openCloseProcess, this));
    this.$container.on('click', '.fe-select-line', $.proxy(this._openSelectLine, this));
    this.$container.on('click', '.fe-select-line-confirm', $.proxy(this._selectLine, this));
  },

  _onSuccessVoiceStatus: function (res) {
    this.voiceCustomer = res.result;
  },

  _checkTerms: function (e) {
    $('.fe-btn-auth').prop('disabled', !$(e.currentTarget).prop('checked'));
  },

  _openSelectLine: function () {
    var htOptions = _.map(this.voiceCustomer.svcInfo, function (svcInfo) {
      return { title: svcInfo.svcNum, checked: false, value: svcInfo.svcMgmtNum, text: svcInfo.svcNum };
    });
    // [
    //   { 'title': '010-21**-43**', checked: true, value: '값1', text: '010-21**-43**' },
    //   { 'title': '010-21**-21**', checked: false, value: '값2', text: '010-21**-21**' },
    //   { 'title': '010-21**-22**', checked: false, value: '값3', text: '010-21**-39**' }
    // ]

    this._popupService.open({
      hbs: 'select',
      title: Tw.POPUP_TITLE.SELECT_LINE,
      select: [
        {
          options: htOptions
        }
      ],
      bt_num: 'one',
      type: [{
        style_class: 'bt-red1 fe-select-line-confirm',
        txt: '확인'
      }]
    });
  },

  _selectLine: function () {
    this._popupClose();
  },

  _openAuthConfirm: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0034, {
      svcMgmtNum: this.voiceCustomer.svcInfo[0].svcMgmtNum,
      svcNum: this.voiceCustomer.svcInfo[0].svcMgmtNum
    }).done($.proxy(this._onSuccessSMS, this));
  },

  _onSuccessSMS: function () {
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
      $.proxy(this._popupClose, this));
  },

  _openCloseProcess: function () {
    this._popupService.openConfirm(
      Tw.BUTTON_LABEL.CONFIRM,
      Tw.MSG_CUSTOMER.VOICE_A03,
      null,
      null,
      $.proxy(this._authConfirm, this),
      $.proxy(this._popupClose, this));
  },

  _authConfirm: function () {
    this._popupClose();
    this._history.goBack();
  },

  _popupClose: function () {
    this._popupService.close();
  },

  _goToVoiceSms: function () {
    if ( this.voiceCustomer.hitoriesYn === 'Y' ) {
      this._popupService.openAlert(Tw.MSG_CUSTOMER.VOICE_A01, Tw.BUTTON_LABEL.CONFIRM, $.proxy(this._authCancel, this));
      return false;
    } else {
      this._history.goLoad('/customer/voice/sms');
    }
  }
};