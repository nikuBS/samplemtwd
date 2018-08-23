/**
 * FileName: certification.nice.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationNice = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._authUrl = '/myt';
};

Tw.CertificationNice.prototype = {
  NICE_TYPE: 'checkplusSerivce',
  open: function (mobileco) {
    this._apiService.request(Tw.API_CMD.BFF_01_0024, {
      mobileco: mobileco,
      authUrl: this._authUrl,
      resultUrl: 'http://localhost:3000/home'
    }).done($.proxy(this._successRequestNice, this));
  },
  _successRequestNice: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openNiceAuth(resp.result);
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _openNiceAuth: function (encData) {
    this._apiService.requestAjax(Tw.AJAX_CMD.OPEN_NICE_AUTH, {
      m: this.NICE_TYPE,
      EncodeData: encData
    });
  }
};
