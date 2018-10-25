/**
 * FileName: masking.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.25
 */
Tw.MaskingComponent = function () {
  this._bindEvent();
};
Tw.MaskingComponent.prototype = {
  _bindEvent: function () {
    $('#fe-bt-masking').on('click', $.proxy(this._onClickMasking, this));
  },
  _onClickMasking: function () {
    console.log('masking');
  }

};
