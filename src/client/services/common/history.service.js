Tw.HistoryService = function (selector) {
  this.history = history;
  this.$window = $(window);
  this.$container = selector;
  this.pathname = window.location.pathname;
  this.historyName = this.pathname.split('/')[1];
  this.historyObj = {};
};
Tw.HistoryService.prototype = {
  init: function () {
    this.push(this.historyObj, this.historyName);

    // history reset event
    this.$window.on('hashchange', $.proxy(this.hashChangeEvent, this));
  },
  push: function () {
    this.history.pushState(this.historyObj, this.historyName, this.pathname);
  },
  replace: function () {
    this.history.replaceState(this.historyObj, this.historyName, this.pathname);
  },
  go: function (len) {
    this.history.go(len);
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
      this.go([this.getHistoryLength()]);
    }
  },
  getHistoryLength: function () {
    var historyLength = history.length;
    historyLength = historyLength - 3;
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