/**
 * FileName: auth.cert.finance-identification.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.11
 */

Tw.AuthCertFinanceIdentification = function (rootEl, authUrl, resultUrl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._init();
};

Tw.AuthCertFinanceIdentification.prototype = {
  _init: function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done(function (resp) {
        console.log(resp);
      });
  }
};
