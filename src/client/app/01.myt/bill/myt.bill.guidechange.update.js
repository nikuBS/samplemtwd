/**
 * FileName: myt.bill.guidechange.update.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.12
 */

Tw.MyTBillGuideUpdatePrototype = {
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
    if (this._$inputCcurNotiSvcNum && this._$inputCcurNotiSvcNum.length > 0 && Tw.FormatHelper.isEmpty(this._$inputCcurNotiSvcNum.val())) {
      this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A05, null, $.proxy(this._openConfirm, this));
    } else {
      this._openConfirm();
    }
  },

  _submitBillGuideType: function () {
    if (this._popupService) {
      this._popupService.close();
    }
    var requestParams = this._getRequestParams();
    console.log('~~~~~~~~~~~requestParams', requestParams);
    this._apiService.request(Tw.API_CMD.BFF_05_0027, requestParams)
      .done($.proxy(this._submitSuccess, this))
      .fail($.proxy(this._submitFail, this));
  },

  _submitSuccess: function() {
    return;
    // window.setTimeout($.proxy(function () {
    //   var tmpMsg = this._options.fromChange ? Tw.MSG_MYT.BILL_GUIDECHANGE_A02 : Tw.MSG_MYT.BILL_GUIDECHANGE_A12;
    //   var alertMsg = tmpMsg.replace(/\[T\]/gi, this._curBillGuideTypeNm);
    //   this._popupService.openAlert(alertMsg, Tw.POPUP_TITLE.NOTIFY, $.proxy(this.onClickBtnChangeConfirm, this));
    // }, this), 500);
  },

  _submitFail: function() {

  },

  onClickBtnChangeConfirm: function () {
    if (this._popupService) {
      this._popupService.close();
    }
    this._history.pushUrl('/myt/bill/guidechange');
    if (this._options.fromChange) {
      var beforeBillGuideType = this._options.beforeBillGuideType; //수정해야함
      var selectedBillGuideType = this._curBillGuideType;
      window.location.href = '/myt/bill/guidechange/change-complete?beforeBillGuideType=' + beforeBillGuideType + '&afterBillGuideType=' + selectedBillGuideType;
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
    var paramsObj = {
      toBillTypeCd: this._curBillGuideType
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
    });
    return paramsObj;
  },

  destroy: function() {
    this.$container = null;
    this._apiService = null;
    this._popupService = null;
    this.options = null;

    this._$btnNext.off('click');
    this._$btnSubmit.off('click');

    this._$btnSubmit = null;
    this._$btnNext = null;
    this._$steps = null;
  }

};
Tw.MyTBillGuideUpdateClasses = {
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

Tw.MyTBillGuideUpdateClasses.tworld.prototype = $.extend({}, Tw.MyTBillGuideUpdatePrototype, {
  _checkValidation: function () {
    return true;
  }
});

Tw.MyTBillGuideUpdateClasses.email.prototype = $.extend({}, Tw.MyTBillGuideUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuideUpdatePrototype._assign.apply(this, arguments);
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
    Tw.MyTBillGuideUpdatePrototype.destroy.apply(this, arguments);
    this._$inputEmail = null;
  }
});

Tw.MyTBillGuideUpdateClasses.etc.prototype = $.extend({}, Tw.MyTBillGuideUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuideUpdatePrototype._assign.apply(this, arguments);
    this._$inputAddr1 = this.$container.find('.input-addr1');
    this._$inputAddr2 = this.$container.find('.input-addr2');
    this._$inputAddr3 = this.$container.find('.input-addr3');
    this._$inputPhone = this.$container.find('.input-phone');
  },
  _checkValidation: function () {
    return this._phoneNumValidation.apply(this, this._$inputPhone);
  },
  _checkHalfValidation: function () {
    // return !!this._$inputAddr1.val() && !!this._$inputAddr2.val() && !!this._$inputAddr3.val();
    return !!this._$inputAddr3.val();
  },
  _failHalfValidation: function () {
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A10);
  },
  destroy: function() {
    Tw.MyTBillGuideUpdatePrototype.destroy.apply(this, arguments);
    this._$inputAddr1 = null;
    this._$inputAddr2 = null;
    this._$inputAddr3 = null;
  }
});

Tw.MyTBillGuideUpdateClasses.billLetter.prototype = $.extend({}, Tw.MyTBillGuideUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuideUpdatePrototype._assign.apply(this, arguments);
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
    Tw.MyTBillGuideUpdatePrototype.destroy.apply(this, arguments);
    this._$inputCcurNotiSvcNum = null;
  }
});

Tw.MyTBillGuideUpdateClasses.sms.prototype = $.extend({}, Tw.MyTBillGuideUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuideUpdatePrototype._assign.apply(this, arguments);
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
    Tw.MyTBillGuideUpdatePrototype.destroy.apply(this, arguments);
    this._$inputCcurNotiSvcNum = null;
  }
});

Tw.MyTBillGuideUpdateClasses.billLetterEmail.prototype = $.extend({}, Tw.MyTBillGuideUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuideUpdatePrototype._assign.apply(this, arguments);
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
    Tw.MyTBillGuideUpdatePrototype.destroy.apply(this, arguments);
    this._$inputEmail = null;
    this._$inputCcurNotiSvcNum = null;
  }
});

Tw.MyTBillGuideUpdateClasses.smsEmail.prototype = $.extend({}, Tw.MyTBillGuideUpdatePrototype, {
  _assign: function () {
    Tw.MyTBillGuideUpdatePrototype._assign.apply(this, arguments);
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
    Tw.MyTBillGuideUpdatePrototype.destroy.apply(this, arguments);
    this._$inputEmail = null;
    this._$inputCcurNotiSvcNum = null;
  }
});

Tw.MyTBillGuideUpdateClasses.billLetterSms.prototype = $.extend({}, Tw.MyTBillGuideUpdatePrototype, {
  _checkValidation: function () {
    return true;
  }
});