/**
 * FileName: common.member.login.route.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */

Tw.CommonMemberLoginRoute = function (target, state) {
  this.target = target;
  this.state = state;
  this._init();
};

Tw.CommonMemberLoginRoute.prototype = {
  _init: function() {
    var hash = window.location.hash.replace(/^#/i, '');
    location.href = this.target + '?stateVal=' + this.state + '&' + hash;
  }
};
