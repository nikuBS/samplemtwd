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
  this._hashService = Tw.Hash;
  this._hashList = [];
  this._urlHistoryLength = 1;
};
Tw.HistoryService.prototype = {
  // public
  init: function (hash, length) {
    if ( hash !== 'hash' ) {
      if (length > 0) {
        this._urlHistoryLength = length;
      }
      this.$window.on('pageshow', $.proxy(this.checkIsBack, this));
    } else {
      this._hashService.initHashNav($.proxy(this.onHashChange, this));
      this._hashService.detectIsReload();
    }
  },
  cancelProcess: function () {
    this.setHistory();
    this.complete();
    this.resetHistory(this.getHistoryLength());
  },
  setHistory: function () {
    this.$container.addClass('process-complete');
    this.replace();
  },
  pushUrl: function (targetUrl) {
    this.history.pushState(this.historyObj, this.fullPathName, targetUrl);
  },
  complete: function () {
    Tw.UIService.setLocalStorage(this.storageName, 'done');
  },
  reload: function () {
    window.location.reload();
  },
  goLoad: function (url) {
    window.location.href = url;
  },
  goBack: function () {
    window.history.back();
  },
  goHash: function (hash) {
    window.location.hash = hash;
  },
  // private
  push: function () {
    this.history.pushState(this.historyObj, this.historyName, this.pathname);
  },
  replace: function () {
    this.history.replaceState(this.historyObj, this.historyName, this.pathname);
  },
  replaceURL: function (sUrl) {
    window.location.replace(sUrl);
  },
  go: function (len) {
    this.history.go([len]);
  },
  checkIsBack: function (event) {
    if ( event.originalEvent.persisted || window.performance && window.performance.navigation.type === 2 ) {
      if ( this.isDone() ) {
        var historyLength = -(this._urlHistoryLength);
        Tw.UIService.setLocalStorage(this.storageName, '');
        this.resetHistory(historyLength);
      }
    }
  },
  onHashChange: function (hash) {
    var isStep = this.isStep(hash);
    if ( isStep ) {
      this.addHashList(hash.base.split('-')[0]);
    }
    if ( isStep || this.isCompleted() ) {
      this.scrollInit();
    }
    this.showAndHide();
    this.checkIsCompleted();
  },
  addHashList: function (hash) {
    var hashList = this._hashList;
    if ( !hashList.includes(hash) ) {
      hashList.push(hash);
    }
  },
  scrollInit: function () {
    window.scrollTo(0, 0);
  },
  showAndHide: function () {
    var _id = window.location.hash;
    if ( Tw.FormatHelper.isEmpty(_id) ) {
      _id = '#main';
    }

    var $selector = this.$container.find(_id);
    $selector.siblings('div').not($('#header')).hide();
    $selector.show();
  },
  resetHashHistory: function () {
    this.resetHistory(this.getHistoryLength());
    this._hashList = [];
  },
  resetHistory: function (historyLength) {
    this.go(historyLength);
    this.reload();
  },
  getHistoryLength: function () {
    var historyLength = this._hashList.length;
    historyLength = -historyLength;
    return historyLength;
  },
  isStep: function (hash) {
    return hash.base.match('step');
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
  checkIsCompleted: function () {
    if ( this.isReturendMain() && this.isCompleted() ) {
      this.resetHashHistory();
    }
  }
};