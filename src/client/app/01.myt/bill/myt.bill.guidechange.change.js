/**
 * FileName: myt.bill.guidechange.change.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.05
 */
Tw.MyTBillGuideChangePrototype = {
  _construct: function (rootEl, isUpdate) {
    this.$container = rootEl;
    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;
    this._selectedBillGuide = null;
    this._billGuideTypesData = null;
    this._isUpdate = isUpdate;

    this._setBillGuideTypes();
    this._assign();
    this._bindEvent();
    this._init();
  },

  _assign: function () {
    this._selectedBillGuide = this.$container.data('selected-bill-guide-data');
    this._$btnSubmit = this.$container.find('.btn-submit');
    this._$btDopdown = this.$container.find('.bt-dropdown');
    this._$btnNext = this.$container.find('.btn-next');
    this._$steps = this.$container.find('.step');
  },

  _bindEvent: function () {
    this._$btnSubmit.on('click', $.proxy(this._checkToSubmit, this));
    this._$btDopdown.on('click', $.proxy(this._openTypeSelectPopup, this));
    this._$btnNext.on('click', $.proxy(this._setNext, this));
  },

  _init: function () {
  },

  _openTypeSelectPopup: function (event) {
    if ( this._isUpdate ) {
      return;
    }
    var $target = $(event.currentTarget);
    this._popupService.openChoice(Tw.POPUP_TITLE.CHANGE_BILL_GUIDE_TYPE, this._billGuideTypesData, 'type3', $.proxy(this._onOpenChoicePopup, this, $target));
  },

  _checkToSubmit: function () {
    var isValid = this._checkValidation();
    if ( !isValid ) {
      window.alert('~~~~~~~not valid!');
      return;
    }
    // var requestParams = this._getRequestParams();
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_MYT.BILL_GUIDECHANGE_A01, '', $.proxy(this._submit, this));
  },

  _submit: function () {
    var alertMsg = Tw.MSG_MYT.BILL_GUIDECHANGE_A02.replace(/\[T\]/gi, this._selectedBillGuide.curBillTypeNm);
    this._popupService.openAlert(alertMsg);
    return;
    // var tmpAfterBillTypeCode = 'Q';
    // window.location.href='/myt/bill/guidechange/change-complete?beforeBillTypeCd='+this._selectedBillGuide.curBillType+'&afterBillTypeCd='+tmpAfterBillTypeCode;
  },

  _setBillGuideTypes: function () {
    this._billGuideTypesData = _.map(this.$container.data('bill-guide-types-data'), function (billGuideType) {
      return {
        attr: 'id="' + billGuideType.curBillType + '"',
        text: billGuideType.selectorLabel
      };
    });
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

  _onOpenChoicePopup: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._onClickBillGuideType, this, $target));
  },

  _onClickBillGuideType: function ($target, event) {
    var selectedBillGuideType = $(event.currentTarget).find('button').attr('id');
    location.href = '/myt/bill/guidechange/change?curBillTypeCd=' + selectedBillGuideType;
  }

};
Tw.MyTBillGuideChangeClasses = {
  'tworld': function () {
    this._construct.apply(this, arguments);
  },
  'email': function () {
    this._construct.apply(this, arguments);
  },
  'etc': function () {
    this._construct.apply(this, arguments);
  },
  'billLetter': function () {
    this._construct.apply(this, arguments);
  },
  'sms': function () {
    this._construct.apply(this, arguments);
  },
  'billLetterEmail': function () {
    this._construct.apply(this, arguments);
  },
  'smsEmail': function () {
    this._construct.apply(this, arguments);
  },
  'billLetterSms': function () {
    this._construct.apply(this, arguments);
  }
};

Tw.MyTBillGuideChangeClasses.tworld.prototype = $.extend({}, Tw.MyTBillGuideChangePrototype, {
  _checkValidation: function () {
    return true;
  },
  _getRequestParams: function () {
    return {};
  }
});
Tw.MyTBillGuideChangeClasses.email.prototype = $.extend({}, Tw.MyTBillGuideChangePrototype, {
  _assign: function () {
    Tw.MyTBillGuideChangePrototype._assign.apply(this, arguments);
    this._$inputEmail = this.$container.find('.input-email');
  },
  _checkValidation: function () {
    return true;
  },
  _getRequestParams: function () {
    return {};
  },
  _checkHalfValidation: function () {
    return Tw.ValidationHelper.isEmail(this._$inputEmail.val());
  },
  _failHalfValidation: function () {
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A08);
  }
});
Tw.MyTBillGuideChangeClasses.etc.prototype = $.extend({}, Tw.MyTBillGuideChangePrototype, {
  _assign: function () {
    Tw.MyTBillGuideChangePrototype._assign.apply(this, arguments);
    this._$inputAddr1 = this.$container.find('.input-addr1');
    this._$inputAddr2 = this.$container.find('.input-addr2');
    this._$inputAddr3 = this.$container.find('.input-addr3');
  },
  _checkValidation: function () {
    return false;
  },
  _getRequestParams: function () {
    return {};
  },
  _checkHalfValidation: function () {
    return !!this._$inputAddr1.val() && !!this._$inputAddr2.val() && !!this._$inputAddr3.val();
  },
  _failHalfValidation: function () {
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A10);
  }
});
Tw.MyTBillGuideChangeClasses.billLetter.prototype = $.extend({}, Tw.MyTBillGuideChangePrototype, {
  _checkValidation: function () {
    return true;
  },
  _getRequestParams: function () {
    return {};
  }
});
Tw.MyTBillGuideChangeClasses.sms.prototype = $.extend({}, Tw.MyTBillGuideChangePrototype, {
  _checkValidation: function () {
    return true;
  },
  _getRequestParams: function () {
    return {};
  }
});
Tw.MyTBillGuideChangeClasses.billLetterEmail.prototype = $.extend({}, Tw.MyTBillGuideChangePrototype, {
  _assign: function () {
    Tw.MyTBillGuideChangePrototype._assign.apply(this, arguments);
    this._$inputEmail = this.$container.find('.input-email');
  },
  _checkValidation: function () {
    return true;
  },
  _getRequestParams: function () {
    return {};
  },
  _checkHalfValidation: function () {
    return Tw.ValidationHelper.isEmail(this._$inputEmail.val());
  },
  _failHalfValidation: function () {
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A08);
  }
});
Tw.MyTBillGuideChangeClasses.smsEmail.prototype = $.extend({}, Tw.MyTBillGuideChangePrototype, {
  _assign: function () {
    Tw.MyTBillGuideChangePrototype._assign.apply(this, arguments);
    this._$inputEmail = this.$container.find('.input-email');
  },
  _checkValidation: function () {
    return true;
  },
  _getRequestParams: function () {
    return {};
  },
  _checkHalfValidation: function () {
    return Tw.ValidationHelper.isEmail(this._$inputEmail.val());
  },
  _failHalfValidation: function () {
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A08);
  }
});
Tw.MyTBillGuideChangeClasses.billLetterSms.prototype = $.extend({}, Tw.MyTBillGuideChangePrototype, {
  _checkValidation: function () {
    return true;
  },
  _getRequestParams: function () {
    return {};
  }
});