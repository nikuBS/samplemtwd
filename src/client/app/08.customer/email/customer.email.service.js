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

  _request: function (e) {
    var serviceCategory = this.$service_depth1.data('service-depth1');

    if ( !this._isValidServicePhone() ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.INVALID_PHONE,
        Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(function () {
          setTimeout(function () {
            $('.fe-service_phone').click();
            $('.fe-service_phone').focus();
          }, 500);
        }, this),
        null,
        $(e.currentTarget)
      );

      return false;
    }

    if ( !this._isValidServiceEmail() ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.INVALID_EMAIL,
        Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(function () {
          setTimeout(function () {
            $('.fe-service_email').click();
            $('.fe-service_email').focus();
          }, 500);
        }, this),
        null,
        $(e.currentTarget)
      );

      return false;
    }

    switch ( serviceCategory ) {
      case 'CELL':
        this._requestCell($(e.currentTarget));
        break;
      case 'INTERNET':
        this._requestInternet($(e.currentTarget));
        break;
      case 'DIRECT':
        this._requestDirect($(e.currentTarget));
        break;
      case 'CHOCO':
        this._requestChocolate($(e.currentTarget));
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

  _requestCell: function ($target) {
    var elSelectedLine = this.$wrap_tpl_service.find('[data-svcmgmtnum]').data('svcmgmtnum');
    var $elInputLine = this.$wrap_tpl_service.find('.fe-service-line');
    var elInputlineVal = $elInputLine.is('button') ? $elInputLine.text() : $elInputLine.val();
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString() : '0';
    var selSvcNum = !!elInputlineVal ? elInputlineVal : '';

    var htParams = $.extend(this._makeParams(), {
      selSvcMgmtNum: selSvcMgmtNum,
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15',
      ofrCtgSeq: this.$service_depth2.data('serviceDepth2'),
      cntcNumClCd: $('.fe-service-cntcNumClCd').find(':checked').val(),
      atchFileNameArr: _.map(this.$wrap_tpl_service.find('.filename-list li'), function (item) {
        return $.trim($(item).find('.text').text() + ':' + $(item).data('hashfile'));
      })
    });

    if ( selSvcMgmtNum === '0' ) {
      htParams = $.extend(htParams, { selSvcNum: selSvcNum });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0042, htParams)
      .done($.proxy(this._onSuccessRequest, this, $target)).fail($.proxy(this._apiError, this, $target));
  },

  _requestInternet: function ($target) {
    var elSelectedLine = this.$wrap_tpl_service.find('[data-svcmgmtnum]').data('svcmgmtnum');
    var elInputline = this.$wrap_tpl_service.find('.fe-service-line').val();
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString() : '0';
    var selSvcNum = !!elInputline ? elInputline : '';

    var htParams = $.extend(this._makeParams(), {
      selSvcMgmtNum: selSvcMgmtNum,
      inqSvcClCd: 'I',
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15',
      ofrCtgSeq: this.$service_depth2.data('serviceDepth2'),
      cntcNumClCd: $('.fe-service-cntcNumClCd').find(':checked').val(),
      atchFileNameArr: _.map(this.$wrap_tpl_service.find('.filename-list li'), function (item) {
        return $.trim($(item).find('.text').text() + ':' + $(item).data('hashfile'));
      })
    });

    if ( selSvcMgmtNum === '0' ) {
      htParams = $.extend(htParams, { selSvcNum: selSvcNum });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0043, htParams)
      .done($.proxy(this._onSuccessRequest, this, $target)).fail($.proxy(this._apiError, this, $target));
  },

  _requestDirect: function ($target) {
    var depth2Category = this.$service_depth2.data('serviceDepth2');
    var htParams;

    if ( depth2Category === '07' || depth2Category === '10' ) {
      htParams = $.extend(this._makeParams(), {
        category: this.$service_depth2.data('serviceDepth2'),
        phoneId: $('.fe-select-device').data('phoneid')
      });
    } else {
      htParams = $.extend(this._makeParams(), {
        category: this.$service_depth2.data('serviceDepth2'),
        orderNo: $('.fe-text_order').val()
      });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0020, htParams)
      .done($.proxy(this._onSuccessRequest, this, $target)).fail($.proxy(this._apiError, this, $target));
  },

  _requestChocolate: function ($target) {
    var htParams = $.extend(this._makeParams(), {
      category: this.$service_depth2.data('serviceDepth2')
    });

    this._apiService.request(Tw.API_CMD.BFF_08_0021, htParams)
      .done($.proxy(this._onSuccessRequest, this, $target)).fail($.proxy(this._apiError, this, $target));
  },

  _onSuccessRequest: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/emailconsult/complete?email=' + $('.fe-service_email').val());
    } else {
      Tw.Error(res.code, res.msg).pop(null, $target);
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
  },

  _isValidServicePhone: function () {
    var sPhone = $('.fe-service_phone').val();

    return Tw.ValidationHelper.isCellPhone(sPhone) || Tw.ValidationHelper.isTelephone(sPhone);
  },

  _isValidServiceEmail: function () {
    var sEmail = $('.fe-service_email').val();

    return Tw.ValidationHelper.isEmail(sEmail);
  },

  _apiError: function ($target, res) {
    Tw.Error(res.code, res.msg).pop(null, $target);
  }
};