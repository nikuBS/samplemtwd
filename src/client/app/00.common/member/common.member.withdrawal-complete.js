/**
 * @file common.member.withdrawal.complete.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.02.14
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
   
    // 회원탈퇴 후 로그아웃 시 sessionStorage의 TWM 값을 초기화 한다.
    Tw.CommonHelper.removeSessionStorage(Tw.SSTORE_KEY.PRE_TWM);
  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-withdrawal-tid', $.proxy(this._onClickWithdrawalTid, this));
  },
  _onClickWithdrawalTid: function () {
    Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.SKT_ID);
  }
};