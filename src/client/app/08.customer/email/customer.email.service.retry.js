/**
 * FileName: customer.email.service.retry.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.07
 */

Tw.CustomerEmailServiceRetry = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailServiceRetry.prototype = {
  _init: function () {
    var htParams = Tw.UrlHelper.getQueryParams();
    // this.serviceCategory = Tw.CUSTOMER_EMAIL_SERVICE_CATEGORY;
    // this._apiService.request(Tw.API_CMD.BFF_08_0061, {
    //   inqId: htParams.inqid,
    //   inqClCd: htParams.inqclcd,
    //   svcDvcClCd: 'M'
    // }).done($.proxy(this._getInquiryDetail, this));
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('validateForm', $.proxy(this._validateForm, this));
    this.$container.on('change', '[required]', $.proxy(this._validateForm, this));
    this.$container.on('click', '.fe-service_register', $.proxy(this._retry_inquiry, this));
    this.$container.on('click', '.prev-step', $.proxy(this._stepBack, this));
  },

  _getInquiryDetail: function (res) {
    //
    // if ( res.code === Tw.API_CODE.CODE_00 ) {
    //   var categoryDepth1 = _.find(this.serviceCategory, function (item) {
    //     var categoryDepth2 = _.find(item.list, function (detail) {
    //       return res.result.ofrCtgSeq.indexOf(detail.ofrCtgSeq) !== -1;
    //     });
    //     if ( categoryDepth2 ) {
    //       $('.fe-category_depth2').text(categoryDepth2.title);
    //     }
    //     return categoryDepth2;
    //   });
    //
    //   $('.fe-category_depth1').text(categoryDepth1.title);
    // } else {
    //   Tw.Error(res.code, res.msg).pop();
    // }
  },

  _makeParams: function () {
    var arrPhoneNumber = $('.fe-service_phone').val().split('-');

    return {
      supInqId: $('.fe-inqid').text(),
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15',
      cntcNum1: arrPhoneNumber[0],
      cntcNum2: arrPhoneNumber[1],
      cntcNum3: arrPhoneNumber[2],
      email: $('.fe-service_email').val(),
      subject: this.$container.find('.fe-text_title').val(),
      content: this.$container.find('.fe-text_content').val(),
      smsRcvYn: $('.fe-service_sms').prop('checked') ? 'Y' : 'N'
    };
  },

  _retry_inquiry: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0012, this._makeParams())
      .done($.proxy(this._request_inquiry, this));
  },

  _request_inquiry: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/emailconsult/complete?email=' + $('.fe-service_email').val());
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
      $('.fe-service_register').prop('disabled', false);
    } else {
      $('.fe-service_register').prop('disabled', true);
    }
  },

  _stepBack: function () {
    this._popupService.openConfirm(
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy(function () {
        this._popupService.close();
        this._history.goBack();
      }, this));
  }
};

