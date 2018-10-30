/**
 * FileName: membership-clause.layer.component.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.29
 *
 */

Tw.MembershipClauseLayerPopup = function ($element) {
  this.$container = $element;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
};

Tw.MembershipClauseLayerPopup.prototype = {
  open: function (hbs) {
    // BE_04_02_L01 ~ BE_04_02_L07
    this._hbs = hbs;
    this._popupService.open({
        hbs: this._hbs,// hbs의 파일명
        layer: true
      }, $.proxy(this._openCallback, this),
      $.proxy(this._closeCallback, this), this._hbs);
  },

  _openCallback: function() {
  },
  _closeCallback: function() {
    this._popupService.close();
  }
};