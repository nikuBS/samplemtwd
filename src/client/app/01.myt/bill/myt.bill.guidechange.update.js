/**
 * FileName: myt.bill.guidechange.update.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.12
 */

Tw.MyTBillGuidechangeUpdatePrototype = {
  _construct: function (rootEl, options) {
    this.$container = rootEl;
    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;
    this._options = options || {};
    this._history = new Tw.HistoryService();

    this._assign();
    this._bindEvent();
    this._init();
    return this;
  },

  _assign: function () {
    this._curBillGuideType = this.$container.attr('cur-bill-type');
    this._curBillGuideTypeNm = this.$container.attr('cur-bill-type-nm');
    this._wireCurBillGuideType = this.$container.attr('wire-cur-bill-type');
    this._svcAttrCd = this.$container.attr('svc-attr-cd');
    this._$btnSubmit = this.$container.find('.btn-submit');
    this._$btnNext = this.$container.find('.btn-next');
    this._$steps = this.$container.find('.step');
  },

  _bindEvent: function () {
    this._$btnNext.on('click', $.proxy(this._setNext, this));
    this._$btnSubmit.on('click', $.proxy(this._checkToSubmit, this));
  },

  _init: function () {
  },

  _openConfirm: function() {
    if (this._popupService) {
      this._popupService.close();
    }
    window.setTimeout($.proxy(function() {
      this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_MYT.BILL_GUIDECHANGE_A01, '', null, $.proxy(this._submitBillGuideType, this));
    }, this), 500);
  },

  _checkToSubmit: function () {
    var isValid = this._checkValidation();
    if ( !isValid ) {
      return;
    }
    // 미성년인경우, 법정대리인 전화번호가 없을 시 얼럿 확인 후 진행
    if (this._$inputCcurNotiSvcNum && this._$inputCcurNotiSvcNum.length > 0) {
      var alertMsg = (Tw.FormatHelper.isEmpty(this._$inputCcurNotiSvcNum.val())) ? Tw.MSG_MYT.BILL_GUIDECHANGE_A05 : Tw.MSG_MYT.BILL_GUIDECHANGE_A07;
      this._popupService.openAlert(alertMsg, null, $.proxy(this._openConfirm, this));
    } else {
      this._openConfirm();
    }
  },

  _submitBillGuideType: function () {
    if (this._popupService) {
      this._popupService.close();
    }
    var requestParams = this._getRequestParams();
    var isWire = (this._svcAttrCd === 'S1' || this._svcAttrCd === 'S2' || this._svcAttrCd === 'S3') ? true : false;
    var apiUrl =  isWire ? Tw.API_CMD.BFF_05_0050 : Tw.API_CMD.BFF_05_0027;

    console.log('~~~~~isWire', isWire);
    console.log('~~~~~apiUrl', apiUrl);
    console.log('~~~~~requestParams', requestParams);
    this._apiService.request(apiUrl, requestParams)
      .done($.proxy(this._submitSuccess, this))
      .fail($.proxy(this._submitFail, this));
  },

  _showErrorAlert: function(msg) {
    this._popupService.openAlert(msg);
  },

  _submitSuccess: function(resp) {
    if (resp.code === '00') {
      window.setTimeout($.proxy(function () {
        var tmpMsg = this._options.fromChange ? Tw.MSG_MYT.BILL_GUIDECHANGE_A02 : Tw.MSG_MYT.BILL_GUIDECHANGE_A12;
        var alertMsg = tmpMsg.replace(/\[T\]/gi, this._curBillGuideTypeNm);
        this._popupService.openAlert(alertMsg, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._onClickBtnChangeConfirm, this, resp.result));
      }, this), 500);
    } else {
      if (resp.data) {
        this._showErrorAlert(resp.data && resp.data.msg);
      } else {
        this._showErrorAlert(resp.error && resp.error.msg);
      }
      return;
    }
  },

  _submitFail: function(resp) {
    this._showErrorAlert(resp.data && resp.data.msg);
    return;
  },
  
  _showEmailChangedAlert: function(result) {
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A09, Tw.POPUP_TITLE.NOTIFY, $.proxy(function() {
      this._goComplete(result);
    }, this));

  },

  _onClickBtnChangeConfirm: function (result) {
    if (this._popupService) {
      this._popupService.close();
    }
    if (this._options.fromChange && this._curBillGuideType === '2' ) {
      window.setTimeout($.proxy(this._showEmailChangedAlert, this, result), 500);
    } else {
      this._goComplete(result);
    }
  },

  _goComplete: function(result) {
    this._history.pushUrl('/myt/bill/guidechange');
    if (this._options.fromChange) {
      window.location.href = '/myt/bill/guidechange/change-complete?beforeBillGuideType=' + result.beforeBillIsueTypeCd;
    } else {
      window.location.href = '/myt/bill/guidechange/update-complete';
    }
  },

  _setNext: function () {
    if ( this._checkHalfValidation ) {
      if ( this._checkHalfValidation() ) {
        this._setStep(2);
      } else {
        this._failHalfValidation();
      }
    } else {
      this._setStep(2);
    }
  },

  _setStep: function (stepIdx) {
    var $selectedStep = this.$container.find('[step="' + stepIdx + '"]');
    this._$steps.hide();
    if ( $selectedStep.length > 0 ) {
      $selectedStep.show();
    }
  },

  _phoneNumValidation: function (target) {
    var phoneNum = target.value;
    if (Tw.FormatHelper.isEmpty(phoneNum) ||
        !Tw.ValidationHelper.isCellPhone(phoneNum) ) {
      this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A04);
      return false;
    }
    return true;
  },

  _representativePhoneNumValidation: function (target) {
    var phoneNum = target.value;
    if (!Tw.FormatHelper.isEmpty(phoneNum) &&
        !Tw.ValidationHelper.isCellPhone(phoneNum) ) {
      this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A06);
      return false;
    }
    return true;
  },

  _getRequestParams: function() {
    var KEY_ATTR_NAME = 'form-element-key';
    var VALUE_ATTR_NAME = 'form-element-value';
    var isWire = (this._svcAttrCd === 'S1' || this._svcAttrCd === 'S2' || this._svcAttrCd === 'S3') ? true : false;
    var paramsObj = {
      toBillTypeCd: isWire ? this._wireCurBillGuideType: this._curBillGuideType
    };

    this.$container.find('[form-element="radio"]').each(function() {
      var $elem = $(this);
      var key = $elem.attr(KEY_ATTR_NAME);
      var value = $elem.find('[aria-checked="true"]').attr(VALUE_ATTR_NAME);
      paramsObj[key] = value;
    });
    this.$container.find('[form-element="checkbox"]').each(function() {
      var $elem = $(this);
      var key = $elem.attr(KEY_ATTR_NAME);
      var value = ($elem.find('[aria-checked]').attr('aria-checked') === 'true') ? 'Y' : 'N';
      paramsObj[key] = value;
    });
    this.$container.find('[form-element="input"]').each(function() {
      var $elem = $(this);
      var key = $elem.attr(KEY_ATTR_NAME);
      var value = $elem.val();
      paramsObj[key] = value;
      if (key === 'ccurNotiSvcNum') {
        paramsObj.ccurNotiYn = 'Y';
      }
    });
    return paramsObj;
  },

  destroy: function() {
    this.$container = null;
    this._apiService = null;
    this._popupService = null;
    this._options = null;
    this._history = null;
    this._curBillGuideType = null;
    this._curBillGuideTypeNm = null;

    this._$btnNext.off('click');
    this._$btnSubmit.off('click');

    this._$btnSubmit = null;
    this._$btnNext = null;
    this._$steps = null;
  }

};
Tw.MyTBillGuidechangeUpdateClasses = {
  'tworld': function () {
    return this._construct.apply(this, arguments);
  },
  'email': function () {
    return this._construct.apply(this, arguments);
  },
  'etc': function () {
    return this._construct.apply(this, arguments);
  },
  'billLetter': function () {
    return this._construct.apply(this, arguments);
  },
  'sms': function () {
    return this._construct.apply(this, arguments);
  },
  'billLetterEmail': function () {
    return this._construct.apply(this, arguments);
  },
  'smsEmail': function () {
    return this._construct.apply(this, arguments);
  },
  'billLetterSms': function () {
    return this._construct.apply(this, arguments);
  }
};

Tw.MyTBillGuidechangeUpdateClasses.tworld.prototype = $.extend({}, Tw.MyTBillGuidechangeUpdatePrototype, {
  _checkValidation: function () {
    return true;
  }
});

Tw.MyTBillGuidechangeUpdateClasses.email.prototype = $.extend({}, Tw.MyTBillGuidechangeUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuidechangeUpdatePrototype._assign.apply(this, arguments);
    this._$inputEmail = this.$container.find('.input-email');
  },
  _checkValidation: function () {
    return true;
  },
  _checkHalfValidation: function () {
    return Tw.ValidationHelper.isEmail(this._$inputEmail.val());
  },
  _failHalfValidation: function () {
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A08);
  },
  destroy: function() {
    Tw.MyTBillGuidechangeUpdatePrototype.destroy.apply(this, arguments);
    this._$inputEmail = null;
  }
});

Tw.MyTBillGuidechangeUpdateClasses.etc.prototype = $.extend({}, Tw.MyTBillGuidechangeUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuidechangeUpdatePrototype._assign.apply(this, arguments);
    this._$inputAddr1 = this.$container.find('.input-addr1');
    this._$inputAddr2 = this.$container.find('.input-addr2');
    this._$inputAddr3 = this.$container.find('.input-addr3');
    this._$inputPhone = this.$container.find('.input-phone');
  },
  _checkValidation: function () {
    return this._phoneNumValidation.apply(this, this._$inputPhone);
  },
  _checkHalfValidation: function () {
    return !!this._$inputAddr1.val() && !!this._$inputAddr2.val() && !!this._$inputAddr3.val();
    // return !!this._$inputAddr3.val();
  },
  _failHalfValidation: function () {
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A10);
  },
  destroy: function() {
    Tw.MyTBillGuidechangeUpdatePrototype.destroy.apply(this, arguments);
    this._$inputAddr1 = null;
    this._$inputAddr2 = null;
    this._$inputAddr3 = null;
    this._$inputPhone = null;
  }
});

Tw.MyTBillGuidechangeUpdateClasses.billLetter.prototype = $.extend({}, Tw.MyTBillGuidechangeUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuidechangeUpdatePrototype._assign.apply(this, arguments);
    this._$inputPhone = this.$container.find('.input-phone');
    this._$inputCcurNotiSvcNum = this.$container.find('.input-ccur-noti-svc-num');
  },
  _checkValidation: function () {
    if (this._$inputPhone.length > 0) {
      return this._phoneNumValidation.apply(this, this._$inputPhone);
    }
    if (this._$inputCcurNotiSvcNum.length > 0) {
      return this._representativePhoneNumValidation.apply(this, this._$inputCcurNotiSvcNum);
    }
    return true;
  },
  destroy: function() {
    Tw.MyTBillGuidechangeUpdatePrototype.destroy.apply(this, arguments);
    this._$inputPhone = null;
    this._$inputCcurNotiSvcNum = null;
  }
});

Tw.MyTBillGuidechangeUpdateClasses.sms.prototype = $.extend({}, Tw.MyTBillGuidechangeUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuidechangeUpdatePrototype._assign.apply(this, arguments);
    this._$inputPhone = this.$container.find('.input-phone');
    this._$inputCcurNotiSvcNum = this.$container.find('.input-ccur-noti-svc-num');
  },
  _checkValidation: function () {
    if (this._$inputPhone.length > 0) {
      return this._phoneNumValidation.apply(this, this._$inputPhone);
    }
    if (this._$inputCcurNotiSvcNum.length > 0) {
      return this._representativePhoneNumValidation.apply(this, this._$inputCcurNotiSvcNum);
    }
    return true;
  },
  destroy: function() {
    Tw.MyTBillGuidechangeUpdatePrototype.destroy.apply(this, arguments);
    this._$inputPhone = null;
    this._$inputCcurNotiSvcNum = null;
  }
});

Tw.MyTBillGuidechangeUpdateClasses.billLetterEmail.prototype = $.extend({}, Tw.MyTBillGuidechangeUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuidechangeUpdatePrototype._assign.apply(this, arguments);
    this._$inputEmail = this.$container.find('.input-email');
    this._$inputPhone = this.$container.find('.input-phone');
    this._$inputCcurNotiSvcNum = this.$container.find('.input-ccur-noti-svc-num');
  },
  _checkValidation: function () {
    if (this._$inputPhone.length > 0) {
      return this._phoneNumValidation.apply(this, this._$inputPhone);
    }
    if (this._$inputCcurNotiSvcNum.length > 0) {
      return this._representativePhoneNumValidation.apply(this, this._$inputCcurNotiSvcNum);
    }
    return true;
  },
  _checkHalfValidation: function () {
    return Tw.ValidationHelper.isEmail(this._$inputEmail.val());
  },
  _failHalfValidation: function () {
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A08);
  },
  destroy: function() {
    Tw.MyTBillGuidechangeUpdatePrototype.destroy.apply(this, arguments);
    this._$inputEmail = null;
    this._$inputPhone = null;
    this._$inputCcurNotiSvcNum = null;
  }
});

Tw.MyTBillGuidechangeUpdateClasses.smsEmail.prototype = $.extend({}, Tw.MyTBillGuidechangeUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuidechangeUpdatePrototype._assign.apply(this, arguments);
    this._$inputEmail = this.$container.find('.input-email');
    this._$inputPhone = this.$container.find('.input-phone');
    this._$inputCcurNotiSvcNum = this.$container.find('.input-ccur-noti-svc-num');
  },
  _checkValidation: function () {
    if (this._$inputPhone.length > 0) {
      return this._phoneNumValidation.apply(this, this._$inputPhone);
    }
    if (this._$inputCcurNotiSvcNum.length > 0) {
      return this._representativePhoneNumValidation.apply(this, this._$inputCcurNotiSvcNum);
    }
    return true;
  },
  _checkHalfValidation: function () {
    return Tw.ValidationHelper.isEmail(this._$inputEmail.val());
  },
  _failHalfValidation: function () {
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A08);
  },
  destroy: function() {
    Tw.MyTBillGuidechangeUpdatePrototype.destroy.apply(this, arguments);
    this._$inputEmail = null;
    this._$inputPhone = null;
    this._$inputCcurNotiSvcNum = null;
  }
});

Tw.MyTBillGuidechangeUpdateClasses.billLetterSms.prototype = $.extend({}, Tw.MyTBillGuidechangeUpdatePrototype, {
  _checkValidation: function () {
    return true;
  }
});