Tw.HomeMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();

  this._bindEvent();
};

Tw.HomeMain.prototype = {

};
