/**
 * @file myt-fare.bill.skpay.agree.layer.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.06.25
 *
 */
Tw.MyTFareBillSkpayAgreeLayer = function (params) {
  this.$container = params.$element;
  this._callback = params.callback;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(this.$container);
};

Tw.MyTFareBillSkpayAgreeLayer.prototype = {
  open: function (hbs, e) {
    this._hbs = hbs;
    this._apiService.request(Tw.API_CMD.BFF_08_0059, {svcType: 'MM', serNum: this._hbs})
    .done($.proxy(this._successSvcInfo, this, e))
    .fail($.proxy(this._failSvcInfo, this));
  },
  _successSvcInfo: function (e, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._svcInfo = resp.result;
      this._popupService.open({
      hbs: 'BE_04_03_L01',// hbs의 파일명
      layer: true,
      data: resp.result
      }, $.proxy(this._openCallback, this), null, this._hbs, $(e.currentTarget));
    }
  },
  _failSvcInfo: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  },

  _openCallback: function ($layer) {
    $layer.find('.bt-red1 button').on('click', $.proxy(this._onClickBtn, this));
  },

  _onClickBtn: function() {
    this._callback();
    this._popupService.close();
  }
};