Tw.HistoryService = function (selector) {
  this.history = history;
  this.$window = $(window);
  this.$container = selector;
  this.pathname = window.location.pathname;
  this.search = window.location.search;
  this.fullPathName = this.pathname + this.search;
  this.historyName = this.pathname.split('/')[1];
  this.storageName = this.pathname.split('/')[2];
  this.historyObj = {};
};
Tw.HistoryService.prototype = {
  init: function (hash) {
    if (hash === undefined) {
      this.$window.on('pageshow', $.proxy(this.checkIsBack, this));
    } else {
      initHashNav($.proxy(this.onHashChange, this));
    }
  },
  push: function () {
    this.history.pushState(this.historyObj, this.historyName, this.pathname);
  },
  replace: function () {
    this.history.replaceState(this.historyObj, this.historyName, this.pathname);
  },
  pushUrl: function (targetUrl) {
    this.history.pushState(this.historyObj, this.fullPathName, targetUrl);
  },
  go: function (len) {
    this.history.go([len]);
  },
  reload: function () {
    window.location.reload();
  },
  checkIsBack: function (event) {
    if (event.originalEvent.persisted || window.performance && window.performance.navigation.type === 2) {
      if (this.isDone()) {
        Tw.UIService.setLocalStorage(this.storageName, '');
        this.resetHistory(-1);
      }
    }
  },
  onHashChange: function () {
    this.showAndHide();
    this.resetHashHistory();
  },
  showAndHide: function () {
    var id = window.location.hash;
    if (Tw.FormatHelper.isEmpty(id)) id = '#main';

    var $selector = this.$container.find(id);
    $selector.siblings().hide();
    $selector.show();
  },
  resetHashHistory: function () {
    if (this.isReturendMain() && this.isCompleted()) {
      this.resetHistory(this.getHistoryLength());
    }
  },
  setHistory: function () {
    this.$container.addClass('process-complete');
    this.replace();
  },
  resetHistory: function (historyLength) {
    this.go(historyLength);
    this.reload();
  },
  getHistoryLength: function () {
    var historyLength = this.getHashElementLength();
    historyLength = -historyLength;
    return historyLength;
  },
  getHashElementLength: function () {
    return this.$container.find('div[id^="step"]').length;
  },
  isReturendMain: function () {
    return Tw.FormatHelper.isEmpty(window.location.hash);
  },
  isCompleted: function () {
    return this.$container.hasClass('process-complete');
  },
  isDone: function () {
    return Tw.UIService.getLocalStorage(this.storageName) === 'done';
  },
  complete: function () {
    Tw.UIService.setLocalStorage(this.storageName, 'done');
  }
};