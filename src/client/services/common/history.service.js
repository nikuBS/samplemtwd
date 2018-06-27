Tw.HistoryService = function (selector) {
  this.history = history;
  this.$window = $(window);
  this.$container = selector;
  this.pathname = window.location.pathname;
  this.historyName = this.pathname.split('/')[1];
  this.historyObj = {};
};
Tw.HistoryService.prototype = {
  init: function (hash) {
    this.push(this.historyObj, this.historyName);

    if (hash === undefined) {
      this.$window.on('pageshow', $.proxy(this.checkIsBack, this));
    } else {
      this.$window.on('hashchange', $.proxy(this.hashChangeEvent, this));
    }
  },
  push: function () {
    this.history.pushState(this.historyObj, this.historyName, this.pathname);
  },
  replace: function () {
    this.history.replaceState(this.historyObj, this.historyName, this.pathname);
  },
  replaceUrl: function (url, targetUrl) {
    this.history.pushState(this.historyObj, url, targetUrl);
  },
  go: function (len) {
    this.history.go([len]);
  },
  checkIsBack: function (event) {
    if (event.originalEvent.persisted || window.performance && window.performance.navigation.type === 2) {
      this.resetBrowserHistory();
    }
  },
  hashChangeEvent: function () {
    this.showAndHide();
    this.resetHistory(); // history reset event
  },
  showAndHide: function () {
    var id = window.location.hash;
    if (Tw.FormatHelper.isEmpty(id)) id = '#main';

    var $selector = this.$container.find(id);
    $selector.siblings().hide();
    $selector.show();
  },
  setHistory: function (event) {
    if ($(event.target).hasClass('complete')) {
      this.$container.addClass('complete');
      this.replace();
    }
  },
  resetHistory: function () {
    if (this.isReturendMain() && this.isCompleted()) {
      this.go(this.getHistoryLength());
    }
  },
  resetBrowserHistory: function () {
    this.go(this.getBrowserHistoryLength());
  },
  getBrowserHistoryLength: function () {
    var historyLength = history.length;
    historyLength = historyLength - 4;
    return -historyLength;
  },
  getHistoryLength: function () {
    var historyLength = history.length;
    historyLength = historyLength - 5;
    return -historyLength;
  },
  isReturendMain: function () {
    return Tw.FormatHelper.isEmpty(window.location.hash);
  },
  isCompleted: function () {
    return this.$container.hasClass('complete');
  }
};

Tw.History = new Tw.HistoryService();