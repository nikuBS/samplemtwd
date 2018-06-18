Tw.MytRefill = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._init();
  this._bindEvent();
};

Tw.MytRefill.prototype = Object.create(Tw.View.prototype);
Tw.MytRefill.prototype.constructor = Tw.MytRefill;

Tw.MytRefill.prototype = Object.assign(Tw.MytRefill.prototype, {
  _init: function () {
    this.$container.find('.bg-color1:first').removeClass('bg-color1');
  },
  _bindEvent: function () {
    this.$container.on('click', '.refill-history', $.proxy(this._goHistoryPage, this));
  },
  _goHistoryPage: function () {
    window.location.href = '/myt/refill/history';
  }
});
