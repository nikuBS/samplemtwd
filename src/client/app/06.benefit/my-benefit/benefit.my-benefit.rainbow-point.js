/**
 * @file benefit.my-benefit.rainbow-point.js
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018-11-02
 */

/**
 * @class
 * @desc 할인/혜택 > 나의 할인 혜택 > 레인보우 포인트
 * @param {Object} rootEl
 * @param {JSON} options
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
  /**
   * @function
   * @desc 알러트
   * @param {boolean} cond
   * @param {String} alertMsgKey
   */
  _onClickAnchor: function (cond, alertMsgKey) {
    if ( cond ) {
      event.preventDefault();
      this._popupService.openAlert(
        Tw.BENEFIT_MY_BENEFIT_RAINBOW_POINT[alertMsgKey],
        null,
        null,
        null,
        null,
        $(event.target)
      );
    }
  }

};

