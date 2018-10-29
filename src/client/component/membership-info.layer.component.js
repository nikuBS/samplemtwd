/**
 * FileName: membership-info.layer.component.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.29
 *
 */

Tw.MembershipInfoLayerPopup = function ($element) {
  this.$container = $element;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
};

Tw.MembershipInfoLayerPopup.prototype = {
  open: function (hbs) {
    // BE_04_01_L01, BE_04_01_L02, BE_04_01_L03
    this._hbs = hbs;
    this._popupService.open({
        hbs: this._hbs,// hbs의 파일명
        layer: true
      }, $.proxy(this._openCallback, this),
      $.proxy(this._closeCallback, this), this._hbs);
  },

  _openCallback: function($element) {
    if (this._hbs === 'BE_04_01_L02') {
      this.$membershipJoinBtn = $element.find('button[data-id=join]');
      this.$membershipJoinBtn.on('click', $.proxy(this._onClickJoinBtn, this));
    }
  },
  _closeCallback: function() {
    if (this._hbs === 'BE_04_01_L02') {
      this.$membershipJoinBtn.off('click');
      this.$membershipJoinBtn = null;
    }
    this._popupService.close();
  },

  _onClickJoinBtn: function() {
    this._historyService.goLoad('/benefit/membership/join');
  }
};