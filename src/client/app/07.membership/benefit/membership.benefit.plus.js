/**
 * FileName: membership.benefit.plus.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.06
 */

Tw.MembershipBenefitPlus = function (rootEl) {
  this.$container = rootEl;

  this._init();
};

Tw.MembershipBenefitPlus.prototype = {
  _init: function () {
    var hash = window.location.hash;
    if (!Tw.FormatHelper.isEmpty(hash) && window.location.hash === '#my') {
      setTimeout($.proxy(function () {
        this.$container.find('a[href="' + window.location.hash + '"]').eq(0).trigger('click');
      }, this), 0);
    }
  }
};