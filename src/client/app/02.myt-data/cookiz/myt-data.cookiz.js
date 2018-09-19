/**
 * FileName: myt-data.cookiz.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataCookiz = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

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
    this.$btn_recharge_immediately = this.$container.find('.fe-recharge_cookiz_immediately');
    this.$wrap_immediately_select_list = $('.fe-cookiz_immediately_select_list');
    this.$wrap_monthly_select_list = $('.fe-cookiz_monthly_select_list');

  },

  _bindEvent: function () {
    this.$btn_recharge_monthly.on('click', $.proxy(this._rechargeMonthly, this));
    this.$btn_recharge_immediately.on('click', $.proxy(this._rechargeImmediately, this));
  },

  _getReceiveUserInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0028, {}).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },

  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
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
  }
};