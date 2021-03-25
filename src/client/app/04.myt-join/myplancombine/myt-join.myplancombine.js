/**
 * @file 나의 결합상품 < 나의 가입 정보 < MyT
 * @author Kim, Hansoo (keiches@sptek.co.kr)
 * @since 2020.05.12
 */

 /**
  * @class
  * @desc 나의 결합상품
  * @param {Object} params
  * @param {jQuery} params.$element
  */
Tw.MyTJoinMyPlanCombine = function(params) {
  this.$container = params.$element;
  this._init();
};

Tw.MyTJoinMyPlanCombine.prototype = {
  /**
   * @desc 초기화
   * @private
   */
  _init: function() {
    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    // /* this._lineComponent = */ new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  }
};
