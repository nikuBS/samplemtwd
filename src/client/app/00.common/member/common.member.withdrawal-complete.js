/**
 * FileName: common.member.withdrawal.complete.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.02.14
 */

Tw.CommonMemberWithdrawalComplete = function ($container) {
  this.$container = $container;
  this._apiService = Tw.Api;
  this._init();
  this._bindEvent();
};

Tw.CommonMemberWithdrawalComplete.prototype = {
  _init: function () {
    this._apiService.sendNativeSession('');
  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-withdrawal-tid', $.proxy(this._onClickWithdrawalTid, this));
  },
  _onClickWithdrawalTid: function () {
    Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.SKT_ID);
  }
};