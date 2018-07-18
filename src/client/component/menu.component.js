Tw.MenuComponent = function () {
  this.$container = $('#all-menu');

  this._nativeService = Tw.Native;
  this._bindEvent();


};

Tw.MenuComponent.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.ico-login', $.proxy(this._onClickLogin, this));
  },
  _onClickLogin: function () {
    if(Tw.BrowserHelper.isApp()) {
      console.log('app');
      this._nativeService.request(Tw.NODE_CMD.LOGIN, {}, $.proxy(this._onNativeLogin, this));
    } else {
      console.log('mo-web');
      location.href = '/auth/tid/login';
    }
  },
  _onNativeLogin: function (resp) {
    console.log(resp);
  }
};
