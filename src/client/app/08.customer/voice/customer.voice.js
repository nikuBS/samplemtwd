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
  },

  _cachedElement: function () {
    this.$btn_register = this.$container.find('.fe-btn_register');
  },

  _bindEvent: function () {
    this.$btn_register.on('click', $.proxy(this._checkHistories, this));
    // this.$container.on('click', '.prev-step', $.proxy(this._stepBack, this));
  },

  _checkHistories: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0009, {})
      .done($.proxy(this._onSuccessVoiceStatus, this));
  },

  _onSuccessVoiceStatus: function (res) {
    // this._history.goLoad('/customer/svc-info/voice/register');
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.historiesYn = res.result.hitoriesYn;
      this._onClickRegister();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onClickRegister: function () {
    // this._history.goLoad('/customer/svc-info/voice/register');
    if ( this.historiesYn === 'N' ) {
      this._history.goLoad('/customer/svc-info/voice/register');
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
  },

  _stepBack: function () {
    var confirmed = false;
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy(function () {
        confirmed = true;
        this._popupService.close();
      }, this),
      $.proxy(function () {
        if (confirmed) {
          this._history.goBack();
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES
    );
  },

  _goBack: function () {
    this._history.goBack();
  }
};