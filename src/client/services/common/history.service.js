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
  /**
   * @desc initialize
   * @param  {string} hash
   * @param  {number} length
   * @param  {} type
   * @public
   */
  init: function (hash, length, type) {
    if ( hash === 'hash' ) {
      this._hashService.initHashNav($.proxy(this._onHashChange, this));
      if ( type === undefined ) {
        this._hashService.detectIsReload();
      }
    } else {
      if ( length > 0 ) {
        this._urlHistoryLength = length;
      }
      this.$window.on('pageshow', $.proxy(this._checkIsBack, this));
    }
  },
  /**
   * @desc set history
   * @public
   */
  setHistory: function () {
    this.$container.addClass('process-complete');
    this.replace();
  },
  /**
   * @desc reload
   * @public
   */
  reload: function () {
    window.scrollTo(0, 0);
    window.location.reload();
  },
  /**
   * @desc go to url
   * @param {string} url 
   * @public
   */
  goLoad: function (url) {
    window.location.href = url;
  },
  /**
   * @desc go back
   * @public
   */
  goBack: function () {
    window.history.back();
  },
  /**
   * @desc go to hash
   * @param {string} hash 
   * @public
   */
  goHash: function (hash) {
    window.location.hash = hash;
  },
  /**
   * @desc get current hash
   * @public
   */
  getHash: function () {
    return window.location.hash;
  },
  /**
   * @desc replace
   * @public
   */
  replace: function () {
    this.history.replaceState(this.historyObj, this.historyName, this.pathname);
  },
  /**
   * @desc replace path name
   * @param {string} pathname
   * @public
   */
  replacePathName: function (pathname) {
    this.history.replaceState(this.historyObj, this.historyName, pathname);
  },
  /**
   * @desc replace url 
   * @param {string} sUrl
   * @public
   */
  replaceURL: function (sUrl) {
    window.location.replace(sUrl);
  },
  /**
   * @desc go
   * @param {number} len
   * @public
   */
  go: function (len) {
    this.history.go([len]);
  },
  /**
   * @desc check that current page was accessed by back button.
   * @param {object} event 
   * @private
   */
  _checkIsBack: function (event) {
    if ( event.originalEvent.persisted || window.performance && window.performance.navigation.type === 2 ) {
      if ( this.isDone() ) {
        var historyLength = -(this._urlHistoryLength);
        Tw.CommonHelper.setLocalStorage(this.storageName, '');
        this.resetHistory(historyLength);
      }
    }
  },
  /**
   * @desc handle hash change event
   * @param {string} hash
   * @private
   */
  _onHashChange: function (hash) {
    var isStep = this.isStep(hash);
    if ( isStep ) {
      this._addHashList(hash.base.split('-')[0]);
    }
    if ( isStep || this.isCompleted() ) {
      window.scrollTo(0, 0);
    }
    this._showAndHide();
    this._checkIsCompleted();
  },
  /**
   * @desc push hash to list
   * @param {string} hash 
   * @private
   */
  _addHashList: function (hash) {
    var hashList = this._hashList;
    if ( !hashList.indexOf(hash) !== -1 ) {
      hashList.push(hash);
    }
  },
  /**
   * @private
   */
  _showAndHide: function () {
    var _id = window.location.hash;
    if ( Tw.FormatHelper.isEmpty(_id) ) {
      _id = '#main';
    }

    var $selector = this.$container.find(_id);
    $selector.siblings('div').not($('#header')).hide();
    $selector.show();
  },
  /**
   * @desc clear hash list
   * @private
   */
  _resetHashHistory: function () {
    this.resetHistory(this._getHistoryLength());
    this._hashList = [];
  },
  resetHistory: function (historyLength) {
    history.go(historyLength);
    // this.reload();
  },
  /**
   * @desc get length of hash list
   * @private
   */
  _getHistoryLength: function () {
    var historyLength = this._hashList.length;
    historyLength = -historyLength;
    return historyLength;
  },
  /**
   * @private
   */
  isStep: function (hash) {
    return hash.base.match('step');
  },
  /**
   * @private
   */
  isReturendMain: function () {
    return Tw.FormatHelper.isEmpty(window.location.hash);
  },
  /**
   * @private
   */
  isCompleted: function () {
    return this.$container.hasClass('process-complete');
  },
  isDone: function () {
    return Tw.CommonHelper.getLocalStorage(this.storageName) === 'done';
  },
  /**
   * @desc check that current page was accessed by back button.
   * @private
   */
  isBack: function () {
    if (window.performance) {
      if (performance.navigation.type === 2) {
        return true;
      }
    }
    return false;
  },
  /**
   * @desc check that current page was accessed by reloading.
   * @private
   */
  isReload: function () {
    if (window.performance) {
      if (performance.navigation.type === 1) {
        return true;
      }
    }
    return false;
  },
  _checkIsCompleted: function () {
    if ( this.isReturendMain() && this.isCompleted() ) {
      this._resetHashHistory();
    }
  }
};
