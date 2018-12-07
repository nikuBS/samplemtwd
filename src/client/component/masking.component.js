/**
 * FileName: masking.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.25
 */
Tw.MaskingComponent = function () {
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this.$btMasking = null;
  this._url = '';
  this._cert = new Tw.CertificationSelect();

  this._bindEvent();
};
Tw.MaskingComponent.prototype = {
  _bindEvent: function () {
    this.$btMasking = $('#fe-bt-masking');
    this._url = this.$btMasking.data('menuurl');
    this.$btMasking.on('click', $.proxy(this._onClickMasking, this));
  },
  _onClickMasking: function () {
    this._apiService.request(Tw.NODE_CMD.GET_MASKING_METHOD, {})
      .done($.proxy(this._successGetData, this));
  },
  _successGetData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var params = $.extend(resp.result, {
        authClCd: Tw.AUTH_CERTIFICATION_KIND.A,
        prodProcType: ''
      });

      this._cert.open(params, this._url, null, null, $.proxy(this._completeCert, this));
    }
  },
  _completeCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.SET_MASKING_COMPLETE, {
        svcMgmtNum: resp.svcMgmtNum
      }).done($.proxy(this._successMaskingComplete, this));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _successMaskingComplete: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  }

};
