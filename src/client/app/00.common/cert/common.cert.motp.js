/**
 * @file common.cert.motp.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.08.28
 */

Tw.CommonCertMotp = function (rootEl) {
  this.$container = rootEl;
  this.$txtCert = null;
  this.$txtMin = null;
  this.$txtSec = null;

  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._timer = null;
  this._remainTime = 0;
  this._bindEvent();
  this._getMdn();
};

Tw.CommonCertMotp.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-exit', $.proxy(this._exitApp, this));

    this.$txtCert = this.$container.find('#txt-cert');
    this.$txtMin = this.$container.find('#txt-min');
    this.$txtSec = this.$container.find('#txt-sec');
  },
  _getMdn: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_MDN, {}, $.proxy(this._requestCert, this));
  },
  _requestCert: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._apiService.request(Tw.API_CMD.BFF_01_0021, { svcNum: resp.params.mdn })
        .done($.proxy(this._successRequestCert, this));
    }
  },
  _successRequestCert: function (resp) {
    this._setTimer();
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.$txtCert.text(resp.result.otpAuthNum);
      this._remainTime = resp.result.secondsToRemain;
    } else {
      this._historyService.replaceURL('/common/cert/motp/fail');
    }
  },
  _setTimer: function() {
    this._timer = setInterval($.proxy(this._updateTime, this), 1000);
  },
  _updateTime: function () {
    this._remainTime = this._remainTime - 1;
    this.$txtMin.text(Math.floor(this._remainTime / 60));
    this.$txtSec.text(this._remainTime % 60);

    if(this._remainTime === 0 || this._remainTime < 0) {
      this._clearTimer();
    }
  },
  _clearTimer:function () {
    clearInterval(this._timer);
  },
  _exitApp: function () {
    this._popupService.openConfirm(Tw.MSG_AUTH.EXIT, null, $.proxy(this._sendExit, this));
  },
  _sendExit: function () {
    this._nativeService.send(Tw.NTV_CMD.EXIT, {});
  }

};
