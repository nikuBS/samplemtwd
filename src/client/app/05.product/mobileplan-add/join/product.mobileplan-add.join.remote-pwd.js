/**
 * FileName: product.mobileplan-add.join.remote-pwd.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.15
 */

Tw.ProductMobileplanAddJoinRemotePwd = function(rootEl, prodId, displayId, confirmOptions) {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();
  this._procWebkitCheck();
};

Tw.ProductMobileplanAddJoinRemotePwd.prototype = {

  _data: {
    addList: []
  },

  _cachedElement: function() {
    this.$inputPassword = this.$container.find('.fe-input-password');
    this.$confirmPassword = this.$container.find('.fe-confirm-password');
    this.$error0 = this.$container.find('.fe-error0');
    this.$error1 = this.$container.find('.fe-error1');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$btnCancel = this.$container.find('.fe-btn_cancel');
  },

  _bindEvent: function() {
    this.$container.on('keyup', 'input', $.proxy(this._checkIsAbled, this));
    this.$container.on('keypress keydown', 'input', $.proxy(this._preventDot, this));

    this.$btnCancel.on('click', $.proxy(this._clear, this));
    this.$btnSetupOk.on('click', $.proxy(this._procConfirm, this));
  },

  _clear: function(e) {
    var $elem = $(e.currentTarget),
      $elemParent = $elem.parents('li');

    this._toggleError($elemParent.find('.error-txt'), false);
    this.$btnSetupOk.attr('disabled', 'disabled');

    if ($elemParent.find('input').hasClass('fe-input-password') && this.$confirmPassword.val().length > 0) {
      setTimeout(function() {
        this._isPasswordConfirmInputError(true);
      }.bind(this), 100);
    }
  },

  _procWebkitCheck: function() {
    if ('webkitLineBreak' in document.documentElement.style) {
      return;
    }

    this.$inputPassword.attr('type', 'password');
    this.$confirmPassword.attr('type', 'password');
  },

  _preventDot: function(e) {
    var key = e.charCode ? e.charCode : e.keyCode;

    if (key === 46) {
      e.preventDefault();
      return false;
    }
  },

  _checkIsAbled: function (e) {
    var $elem = $(e.currentTarget),
      onlyNumber = $(e.currentTarget).val();

    $(e.currentTarget).val('');
    $(e.currentTarget).val(onlyNumber);

    if ($elem.hasClass('fe-input-password') && Tw.InputHelper.isEnter(e)) {
      return this.$confirmPassword.focus();
    }

    if ($elem.hasClass('fe-confirm-password') && Tw.InputHelper.isEnter(e)) {
      return this.$btnSetupOk.trigger('click');
    }

    var isPasswordInput = $elem.hasClass('fe-input-password'),
      isPasswordConfirmInput = $elem.hasClass('fe-confirm-password'),
      isPasswordInputError = this._isPasswordInputError(isPasswordInput),
      isPasswordConfirmInputError = this._isPasswordConfirmInputError(isPasswordConfirmInput);

    if (!isPasswordInputError && !isPasswordConfirmInputError) {
      this.$btnSetupOk.removeAttr('disabled');
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled');
    }
  },

  _isPasswordInputError: function(isSetError) {
    var $inputPasswordVal = $.trim(this.$inputPassword.val()),
      isPasswordInputError = false;

    if (!this._validation.checkIsLength($inputPasswordVal, 4)) {
      this._setErrorText(this.$error0, Tw.ALERT_MSG_PASSWORD.A16, isSetError);
      isPasswordInputError = true;
    }

    if (!this._validation.checkIsSameLetters($inputPasswordVal)) {
      this._setErrorText(this.$error0, Tw.ALERT_MSG_PASSWORD.A19, isSetError);
      isPasswordInputError = true;
    }

    if (!this._validation.checkIsStraight($inputPasswordVal, 4)) {
      this._setErrorText(this.$error0, Tw.ALERT_MSG_PASSWORD.A18, isSetError);
      isPasswordInputError = true;
    }

    if (!isPasswordInputError) {
      this._toggleError(this.$error0, false);
    }

    return isPasswordInputError;
  },

  _isPasswordConfirmInputError: function(isSetError) {
    var $inputPasswordVal = $.trim(this.$inputPassword.val()),
      $confirmPasswordVal = $.trim(this.$confirmPassword.val()),
      isPasswordConfirmInputError = false;

    if (!this._validation.checkIsLength($confirmPasswordVal, 4)) {
      this._setErrorText(this.$error1, Tw.ALERT_MSG_PASSWORD.A16, isSetError);
      isPasswordConfirmInputError = true;
    }

    if (!this._validation.checkIsSameLetters($confirmPasswordVal)) {
      this._setErrorText(this.$error1, Tw.ALERT_MSG_PASSWORD.A19, isSetError);
      isPasswordConfirmInputError = true;
    }

    if (!this._validation.checkIsStraight($confirmPasswordVal, 4)) {
      this._setErrorText(this.$error1, Tw.ALERT_MSG_PASSWORD.A18, isSetError);
      isPasswordConfirmInputError = true;
    }

    if (this._validation.checkIsDifferent($inputPasswordVal, $confirmPasswordVal)) {
      this._setErrorText(this.$error1, Tw.ALERT_MSG_PASSWORD.A17, isSetError);
      isPasswordConfirmInputError = true;
    }

    if (!isPasswordConfirmInputError) {
      this._toggleError(this.$error1, false);
    }

    return isPasswordConfirmInputError;
  },

  _toggleError: function($elem, isError) {
    if (isError) {
      $elem.show().attr('aria-hidden', 'false');
    } else {
      $elem.hide().attr('aria-hidden', 'true');
    }
  },

  _setErrorText: function ($elem, text, isSetError) {
    if (!isSetError) {
      return;
    }

    $elem.text(text);
    this._toggleError($elem, true);
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0)
    });
  },

  _procConfirm: function() {
    if (this.$btnSetupOk.attr('disabled') === 'disabled') {
      return;
    }

    new Tw.ProductCommonConfirm(true, null, $.extend(this._confirmOptions, {
      isMobilePlan: false,
      noticeList: this._confirmOptions.preinfo.joinNoticeList,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId]
      }]
    }), $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0018, {
      password: $.trim(this.$inputPassword.siblings('input').val())
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail(Tw.CommonHelper.endLoading('.container'));
  },

  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    setTimeout($.proxy(this._openSuccessPop, this), 100);
  },

  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{ link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
          this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
