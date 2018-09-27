/**
 * FileName: myt-data.cookiz.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataCookiz = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataCookiz.prototype = {
  _init: function () {
    this._getReceiveUserInfo();
  },

  _cachedElement: function () {
    this.$btn_recharge_monthly = this.$container.find('.fe-recharge_cookiz_monthly');
    this.$btn_cancel_auto_recharge = this.$container.find('.fe-cancel_auto_recharge');
    this.$wrap_monthly_select_list = this.$container.find('.fe-cookiz_monthly_select_list');
    this.$btn_recharge_immediately = this.$container.find('.fe-recharge_cookiz_immediately');
    this.$wrap_immediately_select_list = this.$container.find('.fe-cookiz_immediately_select_list');
  },

  _bindEvent: function () {
    this.$btn_recharge_monthly.on('click', $.proxy(this._rechargeMonthly, this));
    this.$btn_recharge_immediately.on('click', $.proxy(this._rechargeImmediately, this));
    this.$btn_cancel_auto_recharge.on('click', $.proxy(this._cancelMonthlyRecharge, this));
  },

  _getReceiveUserInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0028, {}).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },

  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var result = res.result;
      this._setAmountUI(Number(result.currentTopUpLimit));
      // res.result.currentTopUpLimit
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _setAmountUI: function (nLimitMount) {
    var fnCheckedUI = function (nIndex, elInput) {
      var $input = $(elInput);

      if ( Number($input.val()) > nLimitMount ) {
        $input.prop('disabled', true);
        $input.parent().addClass('disabled');
      }

      if ( Number($input.val()) === nLimitMount ) {
        $input.click();
      }
    };

    this.$wrap_monthly_select_list.find('input').each(fnCheckedUI);
    this.$wrap_immediately_select_list.find('input').each(fnCheckedUI);
  },

  _onCancelMonthlyRecharge: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0031, {})
      .done($.proxy(this._onSuccessCancelAutoRefill, this));
  },

  _rechargeImmediately: function () {
    var htParams = {
      amt: this.$wrap_immediately_select_list.find('li.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0029, htParams)
      .done($.proxy(this._onSuccessRechargeImmediately, this));
  },

  _onSuccessRechargeImmediately: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt/data/cookiz/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
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
      this._historyService.replaceURL('/myt/data/cookiz/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _cancelMonthlyRecharge: function () {
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