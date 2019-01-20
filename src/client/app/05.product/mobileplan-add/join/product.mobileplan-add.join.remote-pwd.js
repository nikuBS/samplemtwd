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

  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();
};

Tw.ProductMobileplanAddJoinRemotePwd.prototype = {

  _data: {
    addList: []
  },

  _cachedElement: function() {
    this.$inputPassword = this.$container.find('.fe-input-password');
    this.$confirmPassword = this.$container.find('.fe-confirm-password');
    this.$inputRealPassword = this.$container.find('.fe-input-real-password');
    this.$realConfirmPassword = this.$container.find('.fe-real-confirm-password');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$container.on('input', 'input', $.proxy(this._checkNumber, this));
    this.$container.on('blur', 'input', $.proxy(this._setMasking, this, 1));
    this.$btnSetupOk.on('click', $.proxy(this._procConfirm, this));
  },

  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberAndAsteriskOnly(target);

    this._checkIsAbled();
    this._setMasking(2, event);
  },

  _checkIsAbled: function () {
    if ($.trim(this.$inputPassword.val()) !== '' && $.trim(this.$confirmPassword.val()) !== '') {
      this.$btnSetupOk.removeAttr('disabled');
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled');
    }
  },

  _setMasking: function (standardLength, event) {
    var $target = $(event.currentTarget);
    var $hiddenTarget = $target.siblings('input');
    var $value = $target.val();
    var length = $value.length;

    var inputData = null;

    if ($target.val().length > $hiddenTarget.val().length) {
      inputData = $target.val()[$target.val().length - 1];
    }

    if ($target.val().length < $hiddenTarget.val().length) {
      inputData = null;
    }

    if (inputData !== undefined && !isNaN(inputData)) {
      if (inputData === null) {
        $hiddenTarget.val($hiddenTarget.val().substring(length, 0));
      } else {
        $hiddenTarget.val($hiddenTarget.val() + inputData);
      }
    }

    if (length > 1) {
      $target.val($value.replace($value[length - standardLength], '*'));
    }
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
    var inputVal = this.$inputRealPassword.val();
    var confirmVal = this.$realConfirmPassword.val();

    if (!this._validation.checkIsLength(inputVal, 4) || !this._validation.checkIsLength(confirmVal, 4)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PASSWORD.A16);
    }

    if (this._validation.checkIsDifferent(inputVal, confirmVal)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PASSWORD.A17);
    }

    if (!this._validation.checkIsSameLetters(inputVal)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PASSWORD.A19);
    }

    if (!this._validation.checkIsStraight(inputVal, 4)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PASSWORD.A18);
    }

    this._procConfirmOk();
  },

  _procConfirmOk: function() {
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
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this));
  },

  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    $.when(this._popupService.close())
      .then($.proxy(this._openSuccessPop, this));
  },

  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        mytPage: 'additions',
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
          this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, null, $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
