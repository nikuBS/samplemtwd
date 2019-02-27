/**
 * FileName: tpay-join.layer.component.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.29
 *
 */

Tw.TPayJoinLayerPopup = function ($element) {
  this.$container = $element;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
};

Tw.TPayJoinLayerPopup.prototype = {
  open: function () {
    this._popupService.open({
        hbs: 'BE_04_02_L08',// hbs의 파일명
        layer: true
      }, $.proxy(this._openCallback, this),
      $.proxy(this._closeCallback, this), 'BE_04_02_L08');
  },

  _openCallback: function ($element) {
    this.$setupBtn = $element.find('button[data-id=tpay-setup]');
    this.$closeBtn = $element.find('button.popup-closeBtn');
    this.$closeBtn.on('click', $.proxy(this._onCloseBtn,this));
    this.$setupBtn.on('click', $.proxy(this._onClickSetup, this));
  },

  _closeCallback: function () {
    this.$setupBtn.off('click');
    this.$setupBtn = null;
    // this._popupService.close();
  },

  _onClickSetup: function () {
    // T Apps로 이동
    this._historyService.goLoad('/product/apps');
  },
  _onCloseBtn: function(event) {
    this._popupService.close();
    event.preventDefault();
    return false;
  }
};