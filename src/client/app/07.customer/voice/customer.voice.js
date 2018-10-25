/**
 * FileName: customer.voice.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.24
 */

Tw.CustomerVoice = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService();

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
    this.$btn_register = this.$container.find('.fe-btn_register');
  },

  _bindEvent: function () {
    this.$btn_register.on('click', $.proxy(this._onClickRegister, this));
  },

  _onSuccessVoiceStatus: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.historiesYn = res.result.hitoriesYn;
    }
  },

  _onClickRegister: function () {
    if ( this.historiesYn === 'N' ) {
      this._history.goLoad('/customer/voice/register');
    } else {
      this._popupService.openOneBtTypeB(
        Tw.CUSTOMER_VOICE.EXIST_PREVIOUS_INFO,
        Tw.CUSTOMER_VOICE.CALL_TO_CUSTOMER_CENTER,
        [{
          style_class: 'fe-call-customer-center',
          txt: Tw.ALERT_MSG_MYT_DATA.CALL_CUSTOMER_CENTER
        }],
        'type1'
      );
    }
  }
};