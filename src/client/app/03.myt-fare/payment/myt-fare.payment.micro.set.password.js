/**
 * FileName: myt.fare.payment.micro.set.password.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.09
 */

Tw.MyTFarePaymentMicroSetPassword = function (rootEl, $target) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._validation = Tw.ValidationHelper;

  this._init($target);
};

Tw.MyTFarePaymentMicroSetPassword.prototype = {
  _init: function ($target) {
    var code = $target.attr('data-code');
    var msg = $target.attr('data-msg');

    if (code === Tw.API_CODE.CODE_00) {
      var cpinCode = $target.attr('data-cpin');

      switch (cpinCode) {
        case 'NC': {
          this.$type = 'new';
          this._popupService.open({
            'hbs': 'MF_06_06'
          }, $.proxy(this._openPassword, this));
          break;
        }
        case 'AC': {
          this.$type = 'change';
          this._popupService.open({
            'hbs': 'MF_06_06'
          }, $.proxy(this._openPassword, this));
          break;
        }
        case 'LC': {
          this._popupService.openConfirm(msg, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._goAdditionalService, this));
          break;
        }
        case 'IC': {
          this._popupService.openAlert(msg, code);
          break;
        }
        default:
          this._popupService.openAlert(msg, code);
          break;
      }
    } else {
      this._popupService.openAlert(msg, code);
    }
  },
  _openPassword: function ($layer) {
    this._initVariables($layer);
    this._setData();
    this._bindEvent();
  },
  _initVariables: function ($layer) {
    this.$layer = $layer;
    this.$currentPassword = $layer.find('.fe-current-password');
    this.$newPassword = $layer.find('.fe-new-password');
    this.$changePassword = $layer.find('.fe-change-password');
    this.$setBtn = $layer.find('.fe-set');
  },
  _setData: function () {
    var newPasswordTitle = '';
    var confirmPasswordTitle = '';
    var btnName = '';

    if (this.$type === 'new') {
      this.$layer.find('.fe-current-password-wrap').hide();

      newPasswordTitle = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.PASSWORD;
      confirmPasswordTitle = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.CONFIRM_PASSWORD;
      btnName = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.BTN_NEW;
    } else {
      this.$layer.find('.fe-current-password-wrap').show();

      newPasswordTitle = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.CHANGE_PASSWORD;
      confirmPasswordTitle = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.CONFIRM_CHANGE_PASSWORD;
      btnName = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.BTN_CHANGE;
    }

    this.$layer.find('.fe-new-password-title').text(newPasswordTitle);
    this.$layer.find('.fe-confirm-password-title').text(confirmPasswordTitle);

    this.$setBtn.text(btnName);
  },
  _bindEvent: function () {
    this.$layer.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$layer.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$layer.on('click', '.fe-set', $.proxy(this._setPassword, this));
  },
  _checkIsAbled: function () {
    var isValid = false;
    if (this.$type === 'new') {
      isValid = this.$newPassword.val() !== '' && this.$changePassword.val() !== '';
    } else {
      isValid = this.$currentPassword.val() !== '' && this.$newPassword.val() !== '' && this.$changePassword.val() !== '';
    }

    if (isValid) {
      this.$setBtn.removeAttr('disabled');
    } else {
      this.$setBtn.attr('disabled', 'disabled');
    }
  },
  _setPassword: function () {
    if (this._isValid()) {
      var apiName = this._getApiName();
      var reqData = this._makeRequestData();

      this._apiService.request(apiName, reqData)
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));

      this._popupService.close();
    }
  },
  _getApiName: function () {
    var apiName = '';
    if (this.$type === 'new') {
      apiName = Tw.API_CMD.BFF_05_0086;
    } else {
      apiName = Tw.API_CMD.BFF_05_0087;
    }
    return apiName;
  },
  _isValid: function () {
    if (this.$type === 'new') {
      return (
        this._validation.checkEmpty(this.$newPassword.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
        this._validation.checkEmpty(this.$changePassword.val(), Tw.MSG_PAYMENT.AUTO_A04)
      );
    } else {
      return (
        this._validation.checkEmpty(this.$currentPassword.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
        this._validation.checkEmpty(this.$newPassword.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
        this._validation.checkEmpty(this.$changePassword.val(), Tw.MSG_PAYMENT.AUTO_A04)
      );
    }
  },
  _makeRequestData: function () {
    var reqData = {};

    reqData.modifyPassword1 = $.trim(this.$layer.find('.fe-new-password').val());
    reqData.modifyPassword2 = $.trim(this.$layer.find('.fe-confirm-password').val());

    if (this.$title === 'change') {
      reqData.oldPassword = $.trim(this.$layer.find('.fe-current-password').val());
    }
    
    return reqData;
  },
  _success: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._commonHelper.toast(Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE_PASSWORD);
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },
  _goAdditionalService: function () {
    this._commonHelper.openUrlExternal(Tw.URL_PATH.SET_PASSWORD);
  }
};