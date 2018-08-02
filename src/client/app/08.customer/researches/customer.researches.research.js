
/*
 * FileName: customer.researches.research.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerResearch = function (rootEl) {
  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');
};

Tw.CustomerResearch.prototype = {

};