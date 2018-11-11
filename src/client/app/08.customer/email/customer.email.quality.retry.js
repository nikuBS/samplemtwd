/**
 * FileName: customer.email.quality.retry.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.08
 */

Tw.CustomerEmailQualityRetry = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailQualityRetry.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-quality_register', $.proxy(this._retry_inquiry, this));
    this.$container.on('change', '[required]', $.proxy(this._validateForm, this));
    this.$container.on('validateForm', $.proxy(this._validateForm, this));
  },

  _makeParams: function () {
    var arrPhoneNumber = $('.fe-quality_phone').val().split('-');

    return {
      supInqId: $('.fe-inqid').text(),
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15',
      cntcNum1: arrPhoneNumber[0],
      cntcNum2: arrPhoneNumber[1],
      cntcNum3: arrPhoneNumber[2],
      email: $('.fe-quality_email').val(),
      subject: this.$container.find('.fe-text_title').val(),
      content: this.$container.find('.fe-text_content').val(),
      smsRcvYn: $('.fe-quality_sms').prop('checked') ? 'Y' : 'N'
    };
  },

  _retry_inquiry: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0012, this._makeParams())
      .done($.proxy(this._request_inquiry, this));
  },

  _request_inquiry: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/email/complete?email=' + $('.fe-quality_email').val());
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _validateForm: function () {
    var arrValid = [];

    this.$container.find('[required]').each(function (nIndex, item) {
      if ( $(item).prop('type') === 'checkbox' ) {
        arrValid.push($(item).prop('checked'));
      }

      if ( $(item).prop('type') === 'number' ) {
        var isValidNumber = $(item).val().length !== 0 ? true : false;
        arrValid.push(isValidNumber);
      }

      if ( $(item).prop('type') === 'text' ) {
        var isValidText = $(item).val().length !== 0 ? true : false;
        arrValid.push(isValidText);
      }

      if ( $(item).prop('type') === 'textarea' ) {
        var isValidTextArea = $(item).val().length !== 0 ? true : false;
        arrValid.push(isValidTextArea);
      }
    });

    if ( arrValid.indexOf(false) === -1 ) {
      $('.fe-quality_register').prop('disabled', false);
    } else {
      $('.fe-quality_register').prop('disabled', true);
    }
  }
};

