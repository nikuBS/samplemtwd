Tw.HomeMain = function (rootEl) {
  Tw.View.apply(this, arguments);
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();

  this._bindEvent();
};

Tw.HomeMain.prototype = Object.create(Tw.View.prototype);
Tw.HomeMain.prototype.constructor = Tw.HomeMain;

Tw.HomeMain.prototype = Object.assign(Tw.HomeMain.prototype, {
  _bindEvent: function () {
  }
});


