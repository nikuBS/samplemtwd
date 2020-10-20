/**
 * @file common.tid.route.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.26
 */

/**
 * @class
 * @desc Common > TID 결과 처리
 * @param target
 * @constructor
 */
Tw.CommonTidRoute = function (target) {
  this._historyService = new Tw.HistoryService();
  target = target || '/main/home';
  this._init(target);
};

Tw.CommonTidRoute.prototype = {
  /**
   * @function
   * @desc 랜딩 처리
   * @param target
   * @private
   */
  _init: function (target) {
    this._historyService.replaceURL(target);
  }
};
