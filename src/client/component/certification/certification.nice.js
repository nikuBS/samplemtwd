/**
 * @file certification.nice.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.29
 */

Tw.CertificationNice = function () {
  this._apiService = Tw.Api;

  this._callback = null;
  this._prodAuthKey = null;

  window.onPopupCallback = $.proxy(this._onPopupCallback, this);
  window.onCloseInApp = $.proxy(this._onPopupCallback, this);
};

Tw.CertificationNice.prototype = {
  NICE_URL: {
    nice: '/common/cert/nice',
    ipin: '/common/cert/ipin',
    nice_refund: '/common/cert/nice/refund',
    ipin_refund: '/common/cert/ipin/refund'
  },
  open: function (authUrl, authKind, niceType, niceKind, prodAuthKey, callback) {
    this._callback = callback;
    this._prodAuthKey = prodAuthKey;

    var url = this.NICE_URL[niceType];
    if ( authKind === Tw.AUTH_CERTIFICATION_KIND.F ) {
      url = this.NICE_URL[niceType + '_refund'];
    }
    this._openCertBrowser(url + '?authUrl=' +
      encodeURIComponent(authUrl) + '&authKind=' + encodeURIComponent(authKind) +
      '&niceKind=' + encodeURIComponent(niceKind) + '&prodAuthKey=' + encodeURIComponent(this._prodAuthKey));

  },
  _openCertBrowser: function (path) {
    this._apiService.request(Tw.NODE_CMD.GET_DOMAIN, {})
      .done($.proxy(this._successGetDomain, this, path))
      .fail($.proxy(this._failGetDomain, this));
  },
  _successGetDomain: function (path, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.openUrlInApp(resp.result.domain + path, 'status=1,toolbar=1');
      // Tw.CommonHelper.openUrlInApp('http://150.28.69.23:3000' + path, 'status=1,toolbar=1');
    }
  },
  _failGetDomain: function(error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _onPopupCallback: function () {
    this._callback({ code: Tw.API_CODE.CODE_00 });
  }

};
