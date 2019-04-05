/**
 * FileName: membership-clause.layer.component.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.29
 *
 */
Tw.MembershipClauseLayerPopup = function (params) {
  this.$container = params.$element;
  this._callback = params.callback;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
};

Tw.MembershipClauseLayerPopup.prototype = {
  open: function (hbs, e) {
    // BE_04_02_L01 ~ BE_04_02_L07
    this._hbs = hbs;
    this._popupService.open({
        hbs: 'BE_04_02_L01',// hbs의 파일명
        layer: true,
        data: this._getData()
      }, $.proxy(this._openCallback, this), null, this._hbs, $(e.currentTarget));
  },

  _getData: function () {
    switch ( this._hbs ) {
      case 'BE_04_02_L01':
        return Tw.POPUP_TPL.MEMBERSHIP_CLAUSE_ITEM['01'];
      case 'BE_04_02_L02':
        return Tw.POPUP_TPL.MEMBERSHIP_CLAUSE_ITEM['02'];
      case 'BE_04_02_L03':
        return Tw.POPUP_TPL.MEMBERSHIP_CLAUSE_ITEM['03'];
      case 'BE_04_02_L04':
        return Tw.POPUP_TPL.MEMBERSHIP_CLAUSE_ITEM['04'];
      case 'BE_04_02_L05':
        return Tw.POPUP_TPL.MEMBERSHIP_CLAUSE_ITEM['05'];
      case 'BE_04_02_L06':
        return Tw.POPUP_TPL.MEMBERSHIP_CLAUSE_ITEM['06'];
      case 'BE_04_02_L07':
        return Tw.POPUP_TPL.MEMBERSHIP_CLAUSE_ITEM['07'];
      case 'BE_04_02_L09':
        return Tw.POPUP_TPL.MEMBERSHIP_CLAUSE_ITEM['09'];
    }
  },

  _openCallback: function ($layer) {
    $layer.find('.bt-red1 button').on('click', $.proxy(this._onClickBtn, this));
  },

  _onClickBtn: function() {
    this._callback();
    this._popupService.close();
  }
};