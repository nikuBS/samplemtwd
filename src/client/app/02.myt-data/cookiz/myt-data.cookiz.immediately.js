/**
 * FileName: myt-data.cookiz.immediately.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataCookizImmediately = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataCookizImmediately.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$btn_recharge_immediately = this.$container.find('.fe-recharge_cookiz_immediately');
    this.$wrap_immediately_select_list = this.$container.find('.fe-cookiz_immediately_select_list');
  },

  _bindEvent: function () {
    this.$btn_recharge_immediately.on('click', $.proxy(this._rechargeImmediately, this));
    this.$wrap_immediately_select_list.on('click', $.proxy(this._onSelectImmediatelyAmount, this));
  },

  _onSelectImmediatelyAmount: function () {
    if ( this.$wrap_immediately_select_list.find('input:checked').size() !== 0 ) {
      this.$btn_recharge_immediately.prop('disabled', false);
    }
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
      this._historyService.replaceURL('/myt-data/recharge/cookiz/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};