/**
 * FileName: myt-data.familydata.share.monthly.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTDataFamilyShareMonthly = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyShareMonthly.prototype = {
  _init: function() {
    this.MAIN_URL = '/myt/data/familydata';
    this._shareAmount = this.$amountInput.data('share-amount');
  },

  _cachedElement: function() {
    this.$amountInput = this.$container.find('span.input input');
    this.$submitBtn = this.$container.find('.bt-red1 button');
    this.$error = this.$container.find('#aria-exp-desc3');
  },

  _bindEvent: function() {
    this.$container.on('click', '.bt-bg-blue1', $.proxy(this._addShareData, this));
    this.$container.on('focusout', 'span.input input', $.proxy(this._validateShareAmount, this));
    this.$container.on('click', 'span.btn-switch', $.proxy(this._openDeleteMonthlyDataPopup, this));
    this.$amountInput.on('keyup', $.proxy(this._handleChangeAmount, this));
    this.$submitBtn.on('click', $.proxy(this._confirmSubmit, this));
  },

  _addShareData: function(e) {
    var value = $(e.target).data('value');

    if (value === 'all') {
      this.$amountInput.val(this._shareAmount);
    } else {
      this.$amountInput.val(Number(this.$amountInput.val()) + value);
    }

    if (!this.$error.hasClass('none')) {
      this.$error.addClass('none');
    }

    this.$submitBtn.attr('disabled', false);
  },

  _validateShareAmount: function() {
    if (!this.$amountInput.val()) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.V17);
      this.$error.removeClass('none');
    } else if (Number(this.$amountInput.val()) > this._shareAmount) {
      this.$error.text(Tw.VALIDATE_MSG_MYT_DATA.V16);
      this.$error.removeClass('none');
    } else {
      if (!this.$error.hasClass('none')) {
        this.$error.addClass('none');
      }
    }
  },

  _handleChangeAmount: function(e) {
    var value = e.currentTarget.value;

    if (!value || value == 0) {
      this.$submitBtn.attr('disabled', true);
    } else {
      this.$submitBtn.attr('disabled', false);
    }
  },

  _confirmSubmit: function() {
    var POPUP = Tw.MYT_DATA_FAMILY_CONFIRM_SHARE_MONTHLY;
    this._popupService.openModalTypeA(POPUP.TITLE, POPUP.CONTENTS, POPUP.BTN_NAME, null, $.proxy(this._handleSubmit, this));
  },

  _handleSubmit: function() {
    this._popupService.close();
    var today = new Date();
    var ALERT = Tw.MYT_DATA_FAMILY_SUCCESS_SHARE_MONTHLY;
    this._apiService
      .request(Tw.API_CMD.BFF_06_0048, { dataQty: this.$amountInput.val() })
      .done(
        $.proxy(
          this._handleSuccessSubmit,
          this,
          ALERT.TITLE,
          ALERT.CONTENTS.replace('{year}', today.getFullYear()).replace('{month}', today.getMonth() + 1)
        )
      );
  },

  _handleSuccessSubmit: function(title, contents, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      this._popupService.afterRequestSuccess(this.MAIN_URL, this.MAIN_URL, undefined, title, contents);
    }
  },

  _openDeleteMonthlyDataPopup: function() {
    var POPUP = Tw.MYT_DATA_FAMILY_DELETE_SHARE_MONTHLY;
    this._popupService.openModalTypeA(POPUP.TITLE, POPUP.CONTENTS, POPUP.BTN_NAME, null, $.proxy(this._deleteMonthlyData, this));
  },

  _deleteMonthlyData: function() {
    this._popupService.close();
    this._apiService
      .request(Tw.API_CMD.BFF_06_0049, {})
      .done($.proxy(this._handleSuccessSubmit, this, Tw.MYT_DATA_FAMILY_SUCCESS_DELETE_MONTHLY, undefined));
  }
};
