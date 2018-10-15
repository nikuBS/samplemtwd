/**
 * FileName: myt-data.family.setting-immediately.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTDataFamilySettingImmediately = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilySettingImmediately.prototype = {
  _init: function () {
    this._shareAmount = this.$amountInput.data('share-amount');
  },

  _cachedElement: function () {
    this.$amountInput = this.$container.find('span.input input');
    this.$submitBtn = this.$container.find('.bt-red1 button');
  },

  _bindEvent: function () {
    this.$container.on('click', '.bt-bg-blue1', $.proxy(this._addShareData, this));
    this.$container.on('focusout', 'span.input input', $.proxy(this._validateShareAmount, this))
    this.$amountInput.on('keyup', $.proxy(this._handleChangeAmount, this));
    this.$submitBtn.on('click', $.proxy(this._confirmSubmit, this));
  },

_addShareData: function (e) {
    var value = $(e.target).data('value');

    if (value === 'all') {
      this.$amountInput.val(this._shareAmount);
    } else {
      this.$amountInput.val(Number(this.$amountInput.val()) + value);
    }
    this.$submitBtn.attr('disabled', false);
  }, 

  _validateShareAmount: function () {
    if (!this.$amountInput.val()) {
      // TODO: 알림영역 표시 Tw.VALIDATE_MSG_MYT_DATA.V17
    } else if (Number(this.$amountInput.val()) > this._shareAmount) {
      // TODO: 알림영역 표시 Tw.VALIDATE_MSG_MYT_DATA.V16
    }    
  },

  _handleChangeAmount: function (e) {
    var value = e.currentTarget.value;

    if (!value || value == 0) { 
      this.$submitBtn.attr('disabled', true);
    } else {
      this.$submitBtn.attr('disabled', false);
    }
  },

  _confirmSubmit: function () {
    var POPUP = Tw.MYT_DATA_FAMILY_CONFIRM_SHARE;
    this._popupService.openModalTypeA(POPUP.TITLE, POPUP.CONTENTS, POPUP.BTN_NAME, null, $.proxy(this._handleSubmit, this));
  },

  _handleSubmit: function () {
    var auto = this.$container.find('ul.select-list input').attr('checked') === 'checked', value = this.$amountInput.val();
    if (auto) {
      this._apiService.request(Tw.API_CMD.BFF_06_0048, { dataQty: value }).done($.proxy(this._handleSuccessSubmit, this, '?monthly=true'));
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0046, { dataQty: value }).done($.proxy(this._handleSuccessSubmit, this, ''));
    }
  },

  _handleSuccessSubmit: function (query, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      this._popupService.close();
    } else {
      this._goToComplete(query);
    }
  },

  _goToComplete: function (query) {
    this._historyService.replaceURL('/myt/data/family/complete' + (query || ''));
  }
};
