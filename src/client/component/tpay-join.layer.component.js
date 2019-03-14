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
        layer: true,
        cdn: Tw.Environment.cdn
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
    // 팝업 닫힐 때 두번 동작 발생하지 않도록 수정
    // this._popupService.close();
  },

  _onClickSetup: function () {
    // T페이 설치 페이지 이동
    this._historyService.goLoad('/product/apps/app?appId=TW50000015');
  },
  _onCloseBtn: function(event) {
    this._popupService.close();
    event.preventDefault();
    return false;
  }
};