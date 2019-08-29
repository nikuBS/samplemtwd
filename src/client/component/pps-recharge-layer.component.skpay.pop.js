/**
 * @file myt-fare.bill.skpay.agree.pop.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.08.20
 *
 */
Tw.PPSRechargeLayerSKpayPop = function (params) {
  this.$container = params.$element;
  this._callback = params.callback;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(this.$container);
};

Tw.PPSRechargeLayerSKpayPop.prototype = {
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
      hbs: 'BE_04_03_L02',// hbs의 파일명
      layer: true,
      data: resp.result
      }, $.proxy(this._openCallback, this), null, this._hbs, $(e.currentTarget));
    }
  },
  _failSvcInfo: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  },
  _openCallback: function ($layer) {
    $layer.find('[data-id=join-btn]').on('click', $.proxy(this._onClickJoinBtn, this));
    $layer.find('[data-id=cancel-btn]').on('click', $.proxy(this._onClickCancelBtn, this));
  },
  _onClickJoinBtn: function() {
    this._callback();
    this._popupService.close();
  },
  _onClickCancelBtn: function() {
    this._popupService.close();
  }
};