/**
 * FileName: common.tid.route.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.26
 */

Tw.CommonTidRoute = function (target) {
  this._historyService = new Tw.HistoryService();
  target = target || '/main/home';
  this._init(target);
};

Tw.CommonTidRoute.prototype = {
  _init: function (target) {
    this._historyService.replaceURL(target);
  }
};
