/**
 * FileName: product.mobileplan-add.join.t-family.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.02.12
 */

Tw.ProductMobileplanAddJoinTFamily = function(rootEl, prodId, svcMgmtNum, displayId, confirmOptions) {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._svcMgmtNum = svcMgmtNum;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();
};

Tw.ProductMobileplanAddJoinTFamily.prototype = {

  _cachedElement: function() {
    this.$inputNumber = this.$container.find('.fe-num_input');
    this.$inputBirth = this.$container.find('.fe-input_birth');

    this.$layerIsJoinCheck = this.$container.find('.fe-is_join_check');
    this.$joinCheckProdNm = this.$container.find('.fe-join_check_prod_nm');
    this.$joinCheckResult = this.$container.find('.fe-join_check_result');
    this.$error0 = this.$container.find('.fe-error0');
    this.$error1 = this.$container.find('.fe-error1');

    this.$btnAddLine = this.$container.find('.fe-btn_add_line');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnCheckJoin = this.$container.find('.fe-btn_check_join');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$inputNumber.on('keyup input', $.proxy(this._detectInput, this, 11));
    this.$inputBirth.on('keyup input', $.proxy(this._detectInput, this, 8));

    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));

    this.$btnAddLine.on('click', $.proxy(this._addLine, this));
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$btnCheckJoin.on('click', $.proxy(this._procCheckJoinReq, this));
  },

  _convConfirmOptions: function() {},

  _detectInput: function(maxLength, e) {
    var $elem = $(e.currentTarget);
    $elem.val($elem.val().replace(/[^0-9]/g, ''));

    if ($elem.val().length > maxLength) {
      $elem.val($elem.val().substr(0, maxLength));
    }

    this._checkError($elem);
    this._toggleClearBtn($elem);
    this._toggleJoinCheckBtn();
  },

  _checkError: function($elem) {
    this.$error0.hide();
    this.$error1.hide();

    if ($elem.hasClass('fe-num_input') && $elem.val().length < 9) {
      return this._setErrorText(this.$error0, Tw.PRODUCT_TFAMILY_ERROR.LESS_LENGTH);
    }

    if ($elem.hasClass('fe-num_input') && !Tw.ValidationHelper.isCellPhone($elem.val())) {
      return this._setErrorText(this.$error0, Tw.PRODUCT_TFAMILY_ERROR.WRONG_NUM);
    }

    this.$error0.hide();

    if ($elem.hasClass('fe-input_birth') && this.$inputBirth.val().length !== 8) {
      return this._setErrorText(this.$error1, Tw.PRODUCT_TFAMILY_ERROR.WRONG_BIRTH);
    }

    this.$error1.hide();
  },

  _setErrorText: function ($elem, text) {
    $elem.text(text).show();
  },

  _toggleJoinCheckBtn: function() {
    if (this.$inputNumber.val().length > 9 && this.$inputBirth.val().length === 8) {
      this.$btnCheckJoin.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnCheckJoin.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _blurInputNumber: function() {
    if (this.$inputNumber.length > 8) {
      this.$inputNumber.val(Tw.FormatHelper.conTelFormatWithDash(this.$inputNumber.val()));
    } else {
      this.$inputNumber.val(Tw.FormatHelper.getDashedCellPhoneNumber(this.$inputNumber.val()));
    }
  },

  _focusInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  _clearNum: function(e) {
    var $elem = $(e.currentTarget);

    $elem.parent().find('input').val('');
    $elem.hide();

    this._toggleJoinCheckBtn();
  },

  _toggleClearBtn: function($elem) {
    if ($elem.val().length > 0) {
      $elem.parent().find('.fe-btn_clear_num').show();
    } else {
      $elem.parent().find('.fe-btn_clear_num').hide();
    }
  },

  _procCheckJoinReq: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0172, {
      inputSvcNum: this.$inputNumber.val().replace(/-/gi, ''),
      inputBirthdate: this.$inputBirth.val()
    }).done($.proxy(this._procCheckJoinRes, this));
  },

  _procCheckJoinRes: function(resp) {
    if (!Tw.FormatHelper.isEmpty(Tw.PRODUCT_TFAMILY_ERROR[resp.code])) {
      this.$layerIsJoinCheck.show();
      this.$joinCheckProdNm.text(resp.result.prodNm);
      this.$joinCheckResult.text(Tw.PRODUCT_TFAMILY_ERROR[resp.code]);
      return;
    }

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this.$layerIsJoinCheck.show();
    this.$joinCheckProdNm.text(resp.result.prodNm);

    if (this._svcMgmtNum === resp.result.svcMgmtNum) {
      this.$joinCheckResult.text(Tw.PRODUCT_TFAMILY_ERROR.IS_EXISTS);
    }
  },

  _addLine: function() {}

};
