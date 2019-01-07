/**
 * FileName: myt-fare.bill.small.set.use.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.09
 */

Tw.MyTFareBillSmallSetUse = function (rootEl, $target) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._init($target);
};

Tw.MyTFareBillSmallSetUse.prototype = {
  _init: function ($target) {
    var id = $target.attr('id');
    var tx = $target.siblings('.fe-tx:visible').text();

    this._apiService.request(Tw.API_CMD.BFF_05_0083, { rtnUseYn: id })
      .done($.proxy(this._changeSuccess, this, tx))
      .fail($.proxy(this._changeFail, this));
  },
  _changeSuccess: function (tx, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var message = this._getToastMessage(tx);
      this._commonHelper.toast(message);
    } else {
      this._changeFail(res);
    }
  },
  _changeFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _getToastMessage: function (tx) {
    var message = Tw.ALERT_MSG_MYT_FARE.MICRO_USE;

    if (tx === Tw.ALERT_MSG_MYT_FARE.USABLE) {
      message += Tw.ALERT_MSG_MYT_FARE.ALLOW + Tw.ALERT_MSG_MYT_FARE.MSG_DONE;
    } else {
      message += Tw.ALERT_MSG_MYT_FARE.PROHIBIT + Tw.ALERT_MSG_MYT_FARE.MSG_DONE;
    }

    return message;
  },
};