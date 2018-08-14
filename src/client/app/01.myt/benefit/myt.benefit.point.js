/**
 * FileName: myt.benefit.point.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 14.
 */
Tw.MytBenefitPoint = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._bindEvent();
};

Tw.MytBenefitPoint.prototype = {
  _bindEvent: function () {
  }
};
