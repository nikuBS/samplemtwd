/**
 * FileName: common.login.route.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */

Tw.CommonLoginRoute = function (target, state) {
  this.target = target;
  this.state = state;
  this._init();
};

Tw.CommonLoginRoute.prototype = {
  _init: function() {
    var hash = window.location.hash.replace(/^#/i, '');
    location.href = this.target + '?stateVal=' + this.state + '&' + hash;
  }
};
