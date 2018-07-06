/**
 * FileName: recharge.limit.process.js
 * Author: 조지영 (jiyoungjo@sk.com)
 * Date: 2018.07.06
 */

Tw.RechargeLimitProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(rootEl);
};

Tw.RechargeLimitProcess.prototype = {
  _go: function (hash) {
    window.location.hash = hash;
  }
};
