Tw.HistoryService = function (historyObj, historyName) {
  this.history = history;
  this.historyObj = historyObj;
  this.historyName = historyName;
  this.pathname = window.location.pathname;
};
Tw.HistoryService.prototype = {
  push: function () {
    this.history.pushState(this.historyObj, this.historyName, this.pathname);
  },
  replace: function () {
    this.history.replaceState(this.historyObj, this.historyName, this.pathname);
  },
  go: function (len) {
    this.history.go(len);
  }
};

Tw.History = new Tw.HistoryService();