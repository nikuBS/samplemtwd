Tw.HomeMainSprint3 = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();

  this._bindEvent();
};

Tw.HomeMainSprint3.prototype = Object.create(Tw.View.prototype);
Tw.HomeMainSprint3.prototype.constructor = Tw.HomeMainSprint3;

Tw.HomeMainSprint3.prototype = Object.assign(Tw.HomeMainSprint3.prototype, {
  _bindEvent: function () {
    this.$container.on('click', '.btn-search', $.proxy(this._onClickSearchButton, this));
  },

  _onClickSearchButton: function ($event) {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, this._onContact);
  },

  _success: function (resp) {
    console.log('api success', resp);
    var $box = this.$container.find('.notice');
    $box.append(JSON.stringify(resp));
  },

  _fail: function (err) {
    console.log('api fail', err);
  },

  _onContact: function (resp) {
    console.log('native callback', resp);
  }
});
