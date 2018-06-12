Tw.MytRefill = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._bindEvent();
};

Tw.MytRefill.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.refill-history', $.proxy(this._goHistoryPage, this));
  },
  _goHistoryPage: function () {
    window.location.href = '/myt/refill/history';
  }
};