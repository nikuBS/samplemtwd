Tw.MenuComponent = function () {
  this.$container = $('#all-menu');

  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._bindEvent();


};

Tw.MenuComponent.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.ico-login', $.proxy(this._onClickLogin, this));
    this.$container.on('click', '.test-logout', $.proxy(this._onClickLogout, this));
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
    this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp)
      .done($.proxy(this._successLogin, this));
  },
  _successLogin: function (resp) {
    console.log(resp);
    document.location.reload();
  },
  _onClickLogout: function () {
    if(Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.LOGOUT, {}, $.proxy(this._onNativeLogout, this));
    } else {
      location.href='/auth/tid/logout';
    }
  },
  _onNativeLogout: function () {
    console.log('logout');
    this._apiService.requst(Tw.NODE_CMD.LOGOUT_TID, {})
      .done($.proxy(this._successLogout, this));
  },
  _successLogout: function (resp) {
    console.log(resp);
    document.location.reload();
  }
};
