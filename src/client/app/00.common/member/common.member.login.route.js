/**
 * FileName: common.member.login.route.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.12
 */

Tw.CommonMemberLoginRoute = function (target) {
  this._historyService = new Tw.HistoryService();
  this._init(target);
};

Tw.CommonMemberLoginRoute.prototype = {
  _init: function (target) {
    var token = window.location.hash.replace(/^#/i, '');
    var url = target;
    var hash = '';
    if ( /urlHash/.test(target) ) {
      target = target.replace(/urlHash/gi, '#');
      url = target.split('#')[0];
      hash = '#' + target.split('#')[1];
    }

    if ( /\?/.test(url) ) {
      url = url + '&' + token;
    } else {
      url = url + '?' + token;
    }

    this._historyService.replaceURL(url + hash);
  }
};
