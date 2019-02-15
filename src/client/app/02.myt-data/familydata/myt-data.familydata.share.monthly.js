/**
 * FileName: myt-data.familydata.share.monthly.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTDataFamilyShareMonthly = function(rootEl, hasShare) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._hasShare = hasShare;

  new Tw.MyTDataFamilyShare(rootEl);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyShareMonthly.prototype = {
  _init: function() {
    this.MAIN_URL = '/myt-data/familydata';
  },

  _cachedElement: function() {
    this.$amountInput = this.$container.find('.fe-amount');
  },

  _bindEvent: function() {
    this.$container.on('click', 'span.btn-switch', $.proxy(this._openDeleteMonthlyDataPopup, this));
    this.$container.on('click', '.fe-submit', $.proxy(this._confirmSubmit, this));
  },

  _confirmSubmit: function() {
    var POPUP = this._hasShare ? Tw.MYT_DATA_FAMILY_CONFIRM_EDIT_MONTHLY : Tw.MYT_DATA_FAMILY_CONFIRM_SHARE_MONTHLY;
    this._popupService.openModalTypeA(POPUP.TITLE, POPUP.CONTENTS, POPUP.BTN_NAME, null, $.proxy(this._handleSubmit, this));
  },

  _handleSubmit: function() {
    this._popupService.close();
    var today = new Date();
    var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    var ALERT = Tw.MYT_DATA_FAMILY_SUCCESS_SHARE_MONTHLY;
    this._apiService
      .request(Tw.API_CMD.BFF_06_0048, { dataQty: this.$amountInput.val() })
      .done(
        $.proxy(
          this._handleSuccessSubmit,
          this,
          ALERT.TITLE,
          ALERT.CONTENTS.replace('{year}', nextMonth.getFullYear()).replace('{month}', nextMonth.getMonth() + 1)
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
    return false;
  },

  _deleteMonthlyData: function() {
    this._popupService.close();
    this._apiService
      .request(Tw.API_CMD.BFF_06_0049, {})
      .done($.proxy(this._handleSuccessSubmit, this, Tw.MYT_DATA_FAMILY_SUCCESS_DELETE_MONTHLY, undefined));
  }
};
