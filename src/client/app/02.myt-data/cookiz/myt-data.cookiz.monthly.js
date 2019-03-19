/**
 * FileName: myt-data.cookiz.monthly.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataCookizMonthly = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataCookizMonthly.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$btn_recharge_monthly = this.$container.find('.fe-recharge_cookiz_monthly');
    this.$btn_cancel_auto_recharge = this.$container.find('.fe-cancel_auto_recharge');
    this.$wrap_monthly_select_list = this.$container.find('.fe-cookiz_monthly_select_list');
  },

  _bindEvent: function () {
    this.$btn_recharge_monthly.on('click', $.proxy(this._rechargeMonthly, this));
    this.$btn_cancel_auto_recharge.on('click', $.proxy(this._cancelMonthlyRecharge, this));
    this.$wrap_monthly_select_list.on('click', $.proxy(this._onSelectMonthlyAmount, this));
  },

  _onSelectMonthlyAmount: function () {
    if ( this.$wrap_monthly_select_list.find('input:checked').size() !== 0 ) {
      this.$btn_recharge_monthly.prop('disabled', false);
    }
  },

  _rechargeMonthly: function () {
    var htParams = {
      amt: this.$wrap_monthly_select_list.find('li.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0030, htParams)
      .done($.proxy(this._onSuccessRechargeMonthly, this));
  },

  _onSuccessRechargeMonthly: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/cookiz/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _cancelMonthlyRecharge: function (e) {
    this._popupService.openModalTypeA(
      Tw.MYT_DATA_CANCEL_MONTHLY.TITLE,
      Tw.MYT_DATA_CANCEL_MONTHLY.CONTENTS,
      Tw.MYT_DATA_CANCEL_MONTHLY.BTN_NAME,
      null,
      $.proxy(this._cancelMonthly, this),
      null,
      null,
      null,
      $(e.currentTarget)
    );
  },

  _cancelMonthly: function () {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0031, {})
      .done($.proxy(this._onSuccessCancelRechargeMonthly, this));
  },

  _onSuccessCancelRechargeMonthly: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};