/**
 * FileName: product.join.remote-pwd.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.15
 */

Tw.ProductJoinRemotePwd = function(rootEl, prodId, displayId, confirmOptions) {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();

  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(confirmOptions);

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();
};

Tw.ProductJoinRemotePwd.prototype = {

  _data: {
    addList: []
  },

  _cachedElement: function() {
    this.$inputPassword = this.$container.find('.fe-input-password');
    this.$confirmPassword = this.$container.find('.fe-confirm-password');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$container.on('input', 'input', $.proxy(this._checkNumber, this));
    this.$container.on('blur', 'input', $.proxy(this._setMasking, this, 1));
    // this.$btnSetupOk.on('click', $.proxy(this._procConfirm, this));
    this.$btnSetupOk.on('click', $.proxy(this._isValid, this));
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

    var inputData = event.originalEvent.data;

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

  _isValid: function () {
    var inputVal = this.$inputPassword.siblings().val('input');
    var confirmVal = this.$confirmPassword.siblings().val('input');

    return (
      (this._validation.checkLength(inputVal, 4, Tw.ALERT_MSG_PASSWORD.A16)) &&
      (this._validation.checkLength(confirmVal, 4, Tw.ALERT_MSG_PASSWORD.A16)) &&
      (this._validation.checkIsDifferent(inputVal, confirmVal, Tw.ALERT_MSG_PASSWORD.A17)) &&
      (this._validation.checkIsSameLetters(inputVal, Tw.ALERT_MSG_PASSWORD.A19)) &&
      (this._validation.checkIsStraight(inputVal, 4, Tw.ALERT_MSG_PASSWORD.A18))
    );
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      svcNumMask: this._confirmOptions.preinfo.svcNumMask,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      isAutoJoinTermList: (this._confirmOptions.preinfo.autoJoinList.length > 0 || this._confirmOptions.preinfo.autoTermList.length > 0),
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.stipulation.existsCount > 1)
    });
  },

  _procConfirm: function() {
    if (this._isValid()) {
      new Tw.ProductJoinCommonConfirm(true, null, $.extend(this._confirmOptions, {
        isMobilePlan: false,
        joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
        typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
        settingSummaryTexts: [{
          spanClass: 'val',
          text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId] + ' ' + this._data.addList.length + Tw.PRODUCT_JOIN_SETTING_AREA_CASE.LINE
        }]
      }), $.proxy(this._prodConfirmOk, this));
    }
  },

  _prodConfirmOk: function() {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_10_0018, {
      password: $.trim(this.$inputPassword.siblings('input').val())
    }, {}, this._prodId).done($.proxy(this._procJoinRes, this));
  },

  _procJoinRes: function(resp) {
    skt_landing.action.loading.off({ ta: '.container' });

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
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo ?
          this._confirmOptions.preinfo.reqProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
  },

  _closePop: function() {
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
