/**
 * FileName: common.member.login.route.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */

Tw.CommonMemberLoginRoute = function (target, state) {
  this._historyService = new Tw.HistoryService();
  this._init(target, state);
};

Tw.CommonMemberLoginRoute.prototype = {
  _init: function (target, state) {
    var token = window.location.hash.replace(/^#/i, '');
    var url = target;
    var hash = '';
    if ( /urlHash/.test(target) ) {
      target = target.replace(/urlHash/gi, '#');
      url = target.split('#')[0];
      hash = '#' + target.split('#')[1];
    }

    if ( /\?/.test(url) ) {
      url = url + '&stateVal=' + state + '&' + token;
    } else {
      url = url + '?stateVal=' + state + '&' + token;
    }

    this._historyService.replaceURL(url + hash);
  }
};
