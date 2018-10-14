/**
 * FileName: common.biometrics.cert.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.13
 */

Tw.CommonBiometricsCert = function (rootEl, target) {
  this.$container = rootEl;
  this._target = target;
  this._apiService = Tw.Api;

  this._historyService = new Tw.HistoryService();

  this.$btNext = null;

  this._certSk = new Tw.CertificationSk();
  this._certPublic = new Tw.CertificationPublic();

  this._svcInfo = null;
  this._authUrl = null;
  this._resultUrl = null;
  this._bindEvent();
  this._getSvcInfo();
};

Tw.CommonBiometricsCert.prototype = {
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
    this._resultUrl = '/auth/cert/complete';

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
      this._svcInfo, this._authUrl, null, null, $.proxy(this._completeIdentification, this), Tw.AUTH_CERTIFICATION_METHOD.SK_SMS);
  },
  _onClickKtSms: function () {
    this._openCertBrowser('/auth/cert/nice?authUrl=' + this._authUrl + '&resultUrl=' + this._resultUrl + '&niceType=' + Tw.AUTH_CERTIFICATION_NICE.KT);
  },
  _onClickLgSms: function () {
    this._openCertBrowser('/auth/cert/nice?authUrl=' + this._authUrl + '&resultUrl=' + this._resultUrl + '&niceType=' + Tw.AUTH_CERTIFICATION_NICE.LG);
  },
  _onClickIpin: function () {
    this._openCertBrowser('/auth/cert/ipin?authUrl=' + this._authUrl + '&resultUrl=' + this._resultUrl);
  },
  _onClickPublic: function () {
    this._certPublic.open(this._svcInfo, this._authUrl, this._command, this._deferred, this._callback);
  },
  _openCertBrowser: function (path) {
    this._apiService.request(Tw.NODE_CMD.GET_DOMAIN, {})
      .done($.proxy(this._successGetDomain, this, path));
  },
  _successGetDomain: function (path, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.openUrlInApp(resp.result.domain + path, 'status=1,toolbar=1');
      // Tw.CommonHelper.openUrlInApp('http://150.28.69.23:3000' + path, 'status=1,toolbar=1');
    }
  },
  _completeIdentification: function (result, deferred, command) {
    if ( result.code === Tw.API_CODE.CODE_00 ) {
      this.$btNext.attr('disabled', false);
    }
  },
  _onClickNext: function () {
    this._historyService.goLoad('/common/biometrics/register?target=' + this._target);
  }
};
