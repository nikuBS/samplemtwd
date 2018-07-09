/**
 * FileName: auth.withdrawal.complete.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.09
 */

Tw.AuthWithdrawalComplete = function (rootEl) {
  this.$container = rootEl;

  this._bindEvent();
};

Tw.AuthWithdrawalComplete.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#tid-withdrawal', $.proxy(this._withdrawTid, this));
  },
  _withdrawTid: function () {
    var url = this.$container.find('#tid-withdrawal').attr('href');
    // Open external browser
    Tw.Native.send(Tw.NTV_CMD.OPEN_URL, {
      type: 1,  // 0: inApp, 1: external
      href: url
    });
    return false;
  }
};
