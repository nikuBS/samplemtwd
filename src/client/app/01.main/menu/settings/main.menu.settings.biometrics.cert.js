/**
 * FileName: main.menu.settings.biometrics.cert.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.13
 */

Tw.MainMenuSettingsBiometricsCert = function (rootEl, target) {
  this.$container = rootEl;
  this._target = target;
  this._apiService = Tw.Api;

  this._historyService = new Tw.HistoryService();

  this.$btNext = null;

  this._certSk = new Tw.CertificationSk();
  this._certPublic = new Tw.CertificationPublic();
  this._certNice = new Tw.CertificationNice();

  this._svcInfo = null;

  this._bindEvent();
  this._getSvcInfo();
};

Tw.MainMenuSettingsBiometricsCert.prototype = {
  _bindEvent: function () {
    this.$btNext = this.$container.find('#fe-bt-next');

    this.$container.on('click', '#fe-bt-sk', $.proxy(this._onClickSkSms, this));
    this.$container.on('click', '#fe-bt-kt', $.proxy(this._onClickKtSms, this));
    this.$container.on('click', '#fe-bt-lg', $.proxy(this._onClickLgSms, this));
    this.$container.on('click', '#fe-bt-ipin', $.proxy(this._onClickIpin, this));
    this.$container.on('click', '#fe-bt-public', $.proxy(this._onClickPublic, this));

    this.$btNext.on('click', $.proxy(this._onClickNext, this));
  },
  _getSvcInfo: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successSvcInfo, this))
      .fail($.proxy(this._failSvcInfo, this));
  },
  _successSvcInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = resp.result;
    }
  },
  _failSvcInfo: function () {

  },
  _onClickSkSms: function () {
    this._certSk.open(
      this._svcInfo, this._authUrl, this._authKind, null, Tw.AUTH_CERTIFICATION_METHOD.SK_SMS, $.proxy(this._completeIdentification, this));
  },
  _onClickKtSms: function () {
    this._certNice.open(
      this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.KT, null, $.proxy(this._completeIdentification, this));
  },
  _onClickLgSms: function () {
    this._certNice.open(
      this._authUrl, this._authKind, Tw.NICE_TYPE.NICE, Tw.AUTH_CERTIFICATION_NICE.LG, null, $.proxy(this._completeIdentification, this));
  },
  _onClickIpin: function () {
    this._certNice.open(this._authUrl, this._authKind, Tw.NICE_TYPE.IPIN, this._niceKind, null, $.proxy(this._completeIdentification, this));
  },
  _onClickPublic: function () {
    this._certPublic.open(this._svcInfo, this._authUrl, this._authKind, null, $.proxy(this._completeIdentification, this));
  },
  _completeIdentification: function (result) {
    if ( result.code === Tw.API_CODE.CODE_00 ) {
      this.$btNext.attr('disabled', false);
    }
  },
  _onClickNext: function () {
    this._historyService.goLoad('/main/menu/settings/biometrics/register?target=' + this._target);
  }
};
