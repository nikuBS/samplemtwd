/**
 * FileName: myt.fare.payment.micro.set.use.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.09
 */

Tw.MyTFarePaymentMicroSetUse = function (rootEl, $target) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._init($target);
};

Tw.MyTFarePaymentMicroSetUse.prototype = {
  _init: function ($target) {
    var id = $target.attr('id');
    var tx = $target.find('.fe-tx:visible').text();

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
    this._popupService.openAlert(err.msg, err.code);
  },
  _getToastMessage: function (tx) {
    var message = Tw.ALERT_MSG_MYT_FARE.MICRO;

    if (tx === Tw.ALERT_MSG_MYT_FARE.USABLE) {
      message += ' ' + Tw.ALERT_MSG_MYT_FARE.MSG_ALLOWED;
    } else {
      message += ' ' + Tw.ALERT_MSG_MYT_FARE.MSG_PROHIBITED;
    }

    return message;
  },
};