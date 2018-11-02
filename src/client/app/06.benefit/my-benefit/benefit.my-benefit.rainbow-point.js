/**
 * FileName: benefit.my-benefit.rainbow-point.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 11. 02.
 */

Tw.BenefitMyBenefitRainbowPoint = function (rootEl, options) {
  this.$container = rootEl;
  this._options = options;
  this._popupService = Tw.Popup;
  this._bindEvent();
};
Tw.BenefitMyBenefitRainbowPoint.prototype = {

  _bindEvent: function () {
    this.$container.on('click', '.fe-anchor-go-adjustment', $.proxy(this._onClickAnchor, this, !this._options.isMultiLineToAdjustment, '2_A15'));
    this.$container.on('click', '.fe-anchor-go-transfer', $.proxy(this._onClickAnchor, this, !this._options.isMultiLineToTransfer, '2_A16'));
  },

  _onClickAnchor: function (cond, alertMsgKey) {
    if ( cond ) {
      event.preventDefault();
      this._popupService.openAlert(Tw.BENEFIT_MY_BENEFIT_RAINBOW_POINT[alertMsgKey]);
    }
  }

};

