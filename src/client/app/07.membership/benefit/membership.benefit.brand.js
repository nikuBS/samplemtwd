/**
 * FileName: membership.benefit.brand.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.05
 */

Tw.MembershipBenefitBrand = function (rootEl) {
  this.$container = rootEl;

  this._cacheElements();
  this._bindEvnets();
};

Tw.MembershipBenefitBrand.prototype = {
  _cacheElements: function () {
    this.$allCategory = this.$container.find('#fe-all-category');
  },
  _bindEvnets: function () {
    this.$container.on('click', '#fe-open-category', $.proxy(this._toggleCateogry, this, true));
    this.$container.on('click', '#fe-close-category', $.proxy(this._toggleCateogry, this, false));
  },
  _toggleCateogry: function (open) {
    if (open) {
      this.$allCategory.removeClass('none');
    } else {
      this.$allCategory.addClass('none');
    }
  }
};
