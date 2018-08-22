/*
 * FileName: myt.product-service.combination.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.08.20
 */


Tw.MyTJoinProductServiceCombination = function (rootEl) {
  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');
};

Tw.MyTJoinProductServiceCombination.prototype = {
};