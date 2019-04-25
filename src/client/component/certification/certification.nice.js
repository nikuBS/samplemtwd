/**
 * @file certification.nice.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.29
 */

/**
 * @class
 * @desc 공통 > 인증 > NICE/IPIN 인증
 * @constructor
 */
Tw.CertificationNice = function () {
  this._apiService = Tw.Api;

  this._callback = null;
  this._prodAuthKey = null;

  window.onPopupCallback = $.proxy(this._onPopupCallback, this);
  window.onCloseInApp = $.proxy(this._onPopupCallback, this);
};

Tw.CertificationNice.prototype = {
  /**
   * @member {object}
   * @desc 인증 요청 URL
   * @readonly
   * @prop {string} nice NICE 인증
   * @prop {string} ipin IPIN 인증
   * @prop {string} nice_refund 미환급금 NICE 인증
   * @prop {string} ipin_refund 미환급근 IPIN 인증
   */
  NICE_URL: {
    nice: '/common/cert/nice',
    ipin: '/common/cert/ipin',
    nice_refund: '/common/cert/nice/refund',
    ipin_refund: '/common/cert/ipin/refund'
  },

  /**
   * @function
   * @desc NICE / IPIN 인증 요청
   * @param authUrl
   * @param authKind
   * @param niceType
   * @param niceKind
   * @param prodAuthKey
   * @param callback
   */
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

  /**
   * @function
   * @desc 도메인 요청
   * @param path
   * @private
   */
  _openCertBrowser: function (path) {
    this._apiService.request(Tw.NODE_CMD.GET_DOMAIN, {})
      .done($.proxy(this._successGetDomain, this, path))
      .fail($.proxy(this._failGetDomain, this));
  },

  /**
   * @function
   * @desc 도메인 응답 처리 및 인증 URL 요청
   * @param path
   * @param resp
   * @private
   */
  _successGetDomain: function (path, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.openUrlInApp(resp.result.domain + path, 'status=1,toolbar=1');
    }
  },

  /**
   * @function
   * @desc 도메인 요청 실패 처리
   * @param error
   * @private
   */
  _failGetDomain: function(error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc NICE / IPIN 인증 완료 처리
   * @private
   */
  _onPopupCallback: function () {
    this._callback({ code: Tw.API_CODE.CODE_00 });
  }

};
