/**
 * FileName: customer.email.quality.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerEmailQuality = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailQuality.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');
    this.$quality_depth1 = this.$container.find('.fe-quality_depth1');
  },

  _bindEvent: function () {
    this.$container.on('change', '[required]', $.proxy(this._validateForm, this));
    this.$wrap_tpl_quality.on('click', '.fe-quality_register', $.proxy(this._request, this));
  },

  _request: function () {
    var qualityCategory = this.$quality_depth1.data('quality-depth1');

    switch ( qualityCategory ) {
      case 'cell':
        this._requestCell();
        break;
      case 'internet':
        this._requestInternet();
        break;
      default:
    }
  },

  _requestCell: function () {
    var htParams = $.extend(this._makeParams(), {
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15'
    });

    this._apiService.request(Tw.API_CMD.BFF_08_0044, htParams)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _requestInternet: function () {
    var htParams = $.extend(this._makeParams(), {
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15'
    });

    this._apiService.request(Tw.API_CMD.BFF_08_0045, htParams)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _makeParams: function () {
    var arrPhoneNumber = $('.fe-quality_phone').val().split('-');
    var params = {
      cntcNumClCd: $('.fe-quality-cntcNumClCd').find(':checked').val(),
      cntcNum1: arrPhoneNumber[0],
      cntcNum2: arrPhoneNumber[1],
      cntcNum3: arrPhoneNumber[2],
      email: $('.fe-quality_email').val(),
      subject: this.$wrap_tpl_quality.find('.fe-text_title').val(),
      content: this.$wrap_tpl_quality.find('.fe-text_content').val(),
      smsRcvYn: $('.fe-quality_sms').prop('checked') ? 'Y' : 'N'
    };

    return params;
  },

  _onSuccessRequest: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/email/complete?email=' + $('.fe-quality_email').val());
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _validateForm: function () {
    var arrValid = [];

    this.$wrap_tpl_quality.find('[required]').each(function (nIndex, item) {
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

    if ( arrValid.indexOf(false) === -1 && !!this.$quality_depth1.data('qualityDepth1') ) {
      $('.fe-quality_register').prop('disabled', false);
    } else {
      $('.fe-quality_register').prop('disabled', true);
    }
  }
};