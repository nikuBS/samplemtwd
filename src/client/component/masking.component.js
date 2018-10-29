/**
 * FileName: masking.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.25
 */
Tw.MaskingComponent = function () {
  this._apiService = Tw.Api;

  this.$btMasking = null;
  this._url = '';
  this._cert = null;

  this._bindEvent();
};
Tw.MaskingComponent.prototype = {
  _bindEvent: function () {
    this.$btMasking = $('#fe-bt-masking');
    this._url = this.$btMasking.data('url');
    this.$btMasking.on('click', $.proxy(this._onClickMasking, this));
  },
  _onClickMasking: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_URL_META, params: { url: this._url } },
      { command: Tw.NODE_CMD.GET_SVC_INFO, params: {} }
    ]).done($.proxy(this._successGetData, this));
  },
  _successGetData: function (urlMeta, svcInfo) {
    if ( urlMeta.code === Tw.API_CODE.CODE_00 && svcInfo.code === Tw.API_CODE.CODE_00 ) {
      this._cert = new Tw.CertificationSelect();
      var params = {
        url: this._url,
        svcInfo: svcInfo.result,
        urlMeta: urlMeta.result
      };
      this._cert.open(params, null, null, $.proxy(this._completeCert, this));
    }
  },
  _completeCert: function () {

  }

};
