/**
 * FileName: myt-fare.bill.small.set.use.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.09
 * Annotation: 소액결제 사용 및 차단 설정
 */

Tw.MyTFareBillSmallSetUse = function (rootEl, $target) {
  this.$container = rootEl;
  this.$target = $target;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._init();
};

Tw.MyTFareBillSmallSetUse.prototype = {
  _init: function () {
    var id = this.$target.attr('id');
    var tx = this.$target.siblings('.fe-tx:visible').text();

    this._apiService.request(Tw.API_CMD.BFF_05_0083, { rtnUseYn: id })
      .done($.proxy(this._changeSuccess, this, tx))
      .fail($.proxy(this._fail, this));
  },
  _changeSuccess: function (tx, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._getUseStatus(tx);
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop(null, this.$target);
  },
  _getUseStatus: function (tx) {
    this._apiService.request(Tw.API_CMD.BFF_05_0079, {})
      .done($.proxy(this._getSuccess, this, tx))
      .fail($.proxy(this._fail, this));
  },
  _getSuccess: function (tx, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setId(res.result.rtnUseYn);
      this._setToast(tx);
    } else {
      this._fail(res);
    }
  },
  _setId: function (id) {
    this.$target.attr('id', id);
  },
  _setToast: function (tx) {
    var message = this._getToastMessage(tx);
    this._commonHelper.toast(message);
  },
  _getToastMessage: function (tx) {
    var message = Tw.ALERT_MSG_MYT_FARE.MICRO_USE;

    if (tx === Tw.ALERT_MSG_MYT_FARE.USABLE) {
      message += Tw.ALERT_MSG_MYT_FARE.ALLOW + Tw.ALERT_MSG_MYT_FARE.MSG_DONE;
    } else {
      message += Tw.ALERT_MSG_MYT_FARE.PROHIBIT + Tw.ALERT_MSG_MYT_FARE.MSG_DONE;
    }

    return message;
  }
};