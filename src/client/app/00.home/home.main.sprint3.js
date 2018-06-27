// Author Ara Jo (araara.jo@sk.com)

Tw.HomeMainSprint3 = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._bindEvent();
};

Tw.HomeMainSprint3.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.btn-search', $.proxy(this._onClickSearchButton, this));
  },

  _onClickSearchButton: function ($event) {
    Tw.Native.send(Tw.NTV_CMD.GET_CONTACT, {}, this._onContact);
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
