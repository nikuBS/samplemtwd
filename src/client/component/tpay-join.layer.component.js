/**
 * @file tpay-join.layer.component.js
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018.10.29
 *
 */

Tw.TPayJoinLayerPopup = function ($element) {
  this.$container = $element;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService($element);
  this._bindEvent();
};

Tw.TPayJoinLayerPopup.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#fe-btn-go-tpay', $.proxy(this._onGoSubmain, this));
  },
  /**
   * 멤버십 서브메인으로 이동
   */
  _onGoSubmain: function () {
    this._historyService.goLoad('/membership/submain');
  },
  
  // 아래 Tpay 팝업은 OP002-1800 요건 적용으로 사용되지 않음
  /**
   * Tpay popup open
   */
  open: function () {
    this._popupService.open({
        hbs: 'BE_04_02_L08',// hbs의 파일명
        layer: true,
        cdn: Tw.Environment.cdn
      }, $.proxy(this._openCallback, this),
      $.proxy(this._closeCallback, this), 'tpay');
  },
  /**
   * Tpay popup open callback
   * binds elements event
   * @param $element
   * @private
   */
  _openCallback: function ($element) {
    this.$setupBtn = $element.find('button[data-id=tpay-setup]');
    this.$closeBtn = $element.find('button.popup-closeBtn');
    this.$closeBtn.on('click', $.proxy(this._onCloseBtn, this));
    this.$setupBtn.on('click', $.proxy(this._onClickSetup, this));
  },
  /**
   * Tpay popup close callback
   * @private
   */
  _closeCallback: function () {
    this.$setupBtn.off('click');
    this.$setupBtn = null;
  },
  /**
   * Event listener for the button click on the Tpay install button
   * @private
   */
  _onClickSetup: function () {
    // T페이 설치 페이지 이동
    this._popupService.closeAllAndGo('/product/apps/app?appId=TW50000015');
  },
  /**
   * Event listener for the button click on the Tpay popup close button
   * @private
   */
  _onCloseBtn: function () {
    this._popupService.closeAllAndGo('/membership/submain');
  }
};