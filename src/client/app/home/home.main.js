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
    this.$container.on('click', '#refill-product', $.proxy(this._openRefillProduct, this));
    this.$container.on('click', '#gift-product', $.proxy(this._openRefillProduct, this));
  },

  _openRefillProduct: function ($event) {
    $event.preventDefault();
    skt_landing.action.popup.open({
      hbs:'DA_01_01_01_L01'// hbs의 파일명
    });
  },

  _openGiftProduct: function ($event) {
    $event.preventDefault();
    skt_landing.action.popup.open({
      hbs:'DA_02_01_L01'// hbs의 파일명
    });
  }
});


