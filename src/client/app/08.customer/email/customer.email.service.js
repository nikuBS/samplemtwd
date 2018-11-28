/**
 * FileName: customer.email.service.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerEmailService = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailService.prototype = {
  _init: function () {
    this._validateForm();
  },

  _cachedElement: function () {
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    this.$service_depth1 = this.$container.find('.fe-service_depth1');
    this.$service_depth2 = this.$container.find('.fe-service_depth2');
  },

  _bindEvent: function () {
    this.$container.on('validateForm', $.proxy(this._validateForm, this));
    this.$container.on('change', '[required]', $.proxy(this._validateForm, this));
    this.$wrap_tpl_service.on('click', '.fe-service_register', $.proxy(this._request, this));
  },

  _request: function () {
    var serviceCategory = this.$service_depth1.data('service-depth1');

    switch ( serviceCategory ) {
      case 'CELL':
        this._requestCell();
        break;
      case 'INTERNET':
        this._requestInternet();
        break;
      case 'DIRECT':
        this._requestDirect();
        break;
      case 'CHOCO':
        this._requestChocolate();
        break;
      default:
    }
  },

  _makeParams: function () {
    var arrPhoneNumber = $('.fe-service_phone').val().split('-');

    var params = {
      cntcNum1: arrPhoneNumber[0],
      cntcNum2: arrPhoneNumber[1],
      cntcNum3: arrPhoneNumber[2],
      email: $('.fe-service_email').val(),
      subject: this.$wrap_tpl_service.find('.fe-text_title').val(),
      content: this.$wrap_tpl_service.find('.fe-text_content').val(),
      smsRcvYn: $('.fe-service_sms').prop('checked') ? 'Y' : 'N'
    };

    return params;
  },

  _requestCell: function () {
    var htParams = $.extend(this._makeParams(), {
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15',
      ofrCtgSeq: this.$service_depth2.data('serviceDepth2'),
      cntcNumClCd: $('.fe-service-cntcNumClCd').find(':checked').val(),
      atchFileNameArr: _.map(this.$wrap_tpl_service.find('.filename-list li'), function (item) {
        return $.trim($(item).find('.text').text() + ':' + '/uploads' + $(item).data('hashfile'));
      })
    });

    this._apiService.request(Tw.API_CMD.BFF_08_0042, htParams)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _requestInternet: function () {
    var htParams = $.extend(this._makeParams(), {
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15',
      ofrCtgSeq: this.$service_depth2.data('serviceDepth2'),
      cntcNumClCd: $('.fe-service-cntcNumClCd').find(':checked').val(),
      atchFileNameArr: _.map(this.$wrap_tpl_service.find('.filename-list li'), function (item) {
        return $.trim($(item).find('.text').text() + ':' + '/uploads' + $(item).data('hashfile'));
      })
    });

    this._apiService.request(Tw.API_CMD.BFF_08_0043, htParams)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _requestDirect: function () {
    var depth2Category = this.$service_depth2.data('serviceDepth2');
    var htParams;
    if ( depth2Category === '08' || depth2Category === '09' || depth2Category === '12' ) {
      htParams = $.extend(this._makeParams(), {
        category: this.$service_depth2.data('serviceDepth2'),
        orderNo: ''
      });
    } else {
      htParams = $.extend(this._makeParams(), {
        category: this.$service_depth2.data('serviceDepth2'),
        phoneId: $('.fe-select-device').data().phoneid
      });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0020, htParams)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _requestChocolate: function () {
    var htParams = $.extend(this._makeParams(), {
      category: this.$service_depth2.data('serviceDepth2')
    });

    this._apiService.request(Tw.API_CMD.BFF_08_0021, htParams)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _onSuccessRequest: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/emailconsult/complete?email=' + $('.fe-service_email').val());
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _validateForm: function () {
    var arrValid = [];

    this.$wrap_tpl_service.find('[required]').each(function (nIndex, item) {
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

    if ( arrValid.indexOf(false) === -1 && !!this.$service_depth2.data('serviceDepth2') ) {
      $('.fe-service_register').prop('disabled', false);
    } else {
      $('.fe-service_register').prop('disabled', true);
    }
  }
};