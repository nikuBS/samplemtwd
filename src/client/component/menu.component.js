Tw.MenuComponent = function () {
  this.$container = $('#all-menu');

  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._bindEvent();


};

Tw.MenuComponent.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.ico-login', $.proxy(this._onClickLogin, this));
  },
  _onClickLogin: function () {
    if(Tw.BrowserHelper.isApp()) {
      console.log('app');
      this._nativeService.send(Tw.NTV_CMD.LOGIN, {}, $.proxy(this._onNativeLogin, this));
    } else {
      console.log('mo-web');
      location.href = '/auth/tid/login';
    }
  },
  _onNativeLogin: function (resp) {
    console.log(resp);
    this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp)
      .done(function(res) {
        console.log(res);
      });
  }
};
