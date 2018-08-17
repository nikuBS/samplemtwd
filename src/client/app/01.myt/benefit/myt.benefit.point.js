/**
 * FileName: myt.benefit.point.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 14.
 */
Tw.MyTBenefitPoint = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._bindEvent();
};

Tw.MyTBenefitPoint.prototype = {
  _bindEvent: function () {
  }
};
