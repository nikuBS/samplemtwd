/**
 * @file roaming.myuse.js
 * @desc T로밍 > 나의 T로밍 이용현황
 */

Tw.RoamingMyuse = function (rootEl) {
  this.$container = rootEl;
  this.bindEvents();
  new Tw.RoamingMenu(rootEl).install();
};

Tw.RoamingMyuse.prototype = {
  bindEvents: function () {

  }
};
