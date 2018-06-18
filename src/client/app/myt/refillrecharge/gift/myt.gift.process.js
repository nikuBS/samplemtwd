Tw.MytGiftProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  // this._cachedElement();
  // this._bindEvent();
  this.$init();
}

Tw.MytGiftProcess.prototype = {
  $init: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_03_0003, { svcCtg: 'M' })
      .done($.proxy(this._setLineList, this));
  },

  _setLineList: function (e) {

  }
}