Tw.HomeMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();

  this._bindEvent();
};

Tw.HomeMain.prototype = {
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

};