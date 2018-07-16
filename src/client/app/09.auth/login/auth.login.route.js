/**
 * FileName: auth.login.route.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */

Tw.AuthLoginRoute = function (target, state) {
  this.target = target;
  this.state = state;
  this._init();
};

Tw.AuthLoginRoute.prototype = {
  _init: function() {
    var hash = window.location.hash.replace(/^#/i, '');
    location.href = this.target + '?state=' + this.state + '&' + hash;
  }
};
