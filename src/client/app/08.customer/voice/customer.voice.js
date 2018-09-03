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
  historiesYn: 'Y',
  voiceCustomer: {},

  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0002, {})
      .done($.proxy(this._onSuccessLine, this));
  },

  _cachedElement: function () {
    this.$select_line = this.$container.find('.fe-select-line');
    this.$btn_auth = this.$container.find('.fe-btn-auth');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-inp-term', $.proxy(this._checkTerms, this));
    this.$container.on('click', '.fe-btn-go-sms', $.proxy(this._goToVoiceSms, this));
    this.$container.on('click', '.fe-btn-auth', $.proxy(this._openAuthConfirm, this));
    this.$container.on('click', '.close-step', $.proxy(this._openCloseProcess, this));
    this.$container.on('click', '.fe-select-line', $.proxy(this._openSelectLine, this));
    this.$container.on('click', '.fe-select-line-confirm', $.proxy(this._selectLine, this));
    this.$container.on('click', '.fe-btn-auth-cancel', $.proxy(this._openAuthCancel, this));
  },

  _onSuccessLine: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.voiceCustomer.svcInfo = res.result.M;

      this._apiService.request(Tw.API_CMD.BFF_08_0009, {})
        .done($.proxy(this._onSuccessVoiceStatus, this));
    }
  },

  _onSuccessVoiceStatus: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.historiesYn = res.result.hitoriesYn;
    }
  },

  _checkTerms: function (e) {
    this.$btn_auth.prop('disabled', !$(e.currentTarget).prop('checked'));
  },

  _openSelectLine: function () {
    var fnMapIterator = function (svcInfo) {
      var maskNumber = Tw.FormatHelper.conTelFormatWithDash(svcInfo.svcNum);

      return {
        checked: maskNumber === this.$select_line.text(),
        value: svcInfo.svcMgmtNum,
        text: maskNumber
      };
    };

    var htOptions = _.map(this.voiceCustomer.svcInfo, $.proxy(fnMapIterator, this));

    this._popupService.open({
      hbs: 'select',
      title: Tw.POPUP_TITLE.SELECT_LINE,
      select: [{ options: htOptions }],
      bt_num: 'one',
      type: [{
        style_class: 'bt-red1 fe-select-line-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    });
  },

  _selectLine: function () {
    var $checkedLine = $('.popup').find('input:checked');

    var nSelectMaskNumber = $('.popup').find('li.checked').text().trim();
    this.$select_line.text(nSelectMaskNumber);
    this.$select_line.attr('data-svcmgmtnum', $checkedLine.val());

    this._popupClose();
  },

  _openAuthConfirm: function () {
    var currentServiceNumber = this.$select_line.data('svcmgmtnum');

    if ( currentServiceNumber ) {
      this._apiService.request(Tw.API_CMD.BFF_08_0034, currentServiceNumber).done($.proxy(this._onSuccessSMS, this));
    } else {
      this._popupService.openAlert(Tw.MSG_RECHARGE.REFILL_GIFT_03, Tw.POPUP_TITLE.CONFIRM, $.proxy(this._popupClose, this));
    }
  },

  _onSuccessSMS: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      $('.sended-info-num').text(this.$select_line.text());

      this._history.replaceURL('/customer/voice/sms#complete');
    }
  },

  _openAuthCancel: function () {
    this._popupService.openConfirm(
      Tw.POPUP_TITLE.CONFIRM,
      Tw.MSG_CUSTOMER.VOICE_A02,
      null,
      null,
      $.proxy(this._authConfirm, this),
      $.proxy(this._popupClose, this));
  },

  _openCloseProcess: function () {
    this._popupService.openConfirm(
      Tw.POPUP_TITLE.CONFIRM,
      Tw.MSG_CUSTOMER.VOICE_A03,
      null,
      null,
      $.proxy(this._authConfirm, this),
      $.proxy(this._popupClose, this));
  },

  _authConfirm: function () {
    this._popupClose();
    this._history.replaceURL('/customer/voice/info');
  },

  _popupClose: function () {
    this._popupService.close();
  },

  _goToVoiceSms: function () {
    if ( this.historiesYn === 'Y' ) {
      this._popupService.openAlert(Tw.MSG_CUSTOMER.VOICE_A01, Tw.POPUP_TITLE.CONFIRM, $.proxy(this._popupClose, this));
      return false;
    } else {
      this._history.replaceURL('/customer/voice/sms');
    }
  }
};