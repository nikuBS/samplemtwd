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
    this.$input_sms = $('#tab2-tab .fe-inp-chk-sms');
    this.$input_email = $('#tab2-tab .fe-input-email');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-email-register', $.proxy(this._registerEmail, this));
  },

  _registerEmail: function () {
    var currentState = this._oEmailTemplate.state;

    if ( currentState.tabIndex === 1 ) {
      switch ( currentState.callCategory ) {
        case 'WIBRO':
          this._requestQualityWibro();
          break;
        case 'INTERNET':
          this._requestQualityInternet();
          break;
      }
    }
  },

  _requestQualityWibro: function () {
    var params = {
      connSite: Tw.BrowserHelper.isApp() ? 15 : 19,
      ofrCtgSeq: this._oEmailTemplate.getState().callCategory,
      cntcNum1: this._getPhoneParams(0),
      cntcNum2: this._getPhoneParams(1),
      cntcNum3: this._getPhoneParams(2),
      email: $('#tab2-tab .fe-input-email').val(),
      subject: $('#tab2-tab .fe-inquiry-title').val(),
      content: $('#tab2-tab .fe-inquiry-content').val(),
      smsRcvYn: $('#tab2-tab .fe-inp-chk-sms').prop('checked') ? 'Y' : 'N'
    };

    this._apiService.request(Tw.API_CMD.BFF_08_0044, params)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _requestQualityInternet: function () {
    var params = {
      connSite: Tw.BrowserHelper.isApp() ? 15 : 19,
      inqSvcClCd: $('[name=radio_call_internet]:checked').val(),
      ofrCtgSeq: this._oEmailTemplate.getState().callCategory,
      cntcNum1: this._getPhoneParams(0),
      cntcNum2: this._getPhoneParams(1),
      cntcNum3: this._getPhoneParams(2),
      email: $('#tab2-tab .fe-input-email').val(),
      subject: $('#tab2-tab .fe-inquiry-title').val(),
      content: $('#tab2-tab .fe-inquiry-content').val(),
      smsRcvYn: $('#tab2-tab .fe-inp-chk-sms').prop('checked') ? 'Y' : 'N'
    };

    this._apiService.request(Tw.API_CMD.BFF_08_0045, params)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _getPhoneParams: function (nIndex) {
    var sPhone = $('#tab2-tab .fe-input-phone').val();

    return Tw.FormatHelper.conTelFormatWithDash(sPhone).split('-')[nIndex];
  },

  _onSuccessRequest: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/email/complete?email=' + this.$input_email.val());
    } else {
      this._popupService.openAlert(res.code + ' ' + res.msg);
    }
  }
};

