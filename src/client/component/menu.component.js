/**
 * FileName: menu.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.06.22
 */

Tw.MenuComponent = function () {
  this.$container = $('#fe-all-menu');

  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
  this._bindLogin();
  Tw.Logger.info('[Menu] init complete');
};
Tw.MenuComponent.prototype = {
  _bindEvent: function () {
    // TODO
    $('.all-menu-bt').off('click').on('click', function () {
      //skt_landing.action.gnb_menu.open(callback);
      skt_landing.action.gnb_menu.open(function () {
        console.log('gnb_menu open');
      });
    });
    $('.all-menu-close').off('click').on('click', function () {
      //skt_landing.action.gnb_menu.close(callback);
      skt_landing.action.gnb_menu.close(function () {
        console.log('gnb_menu close');
      });
    });
    $('.user-menu li .sub-menu').off('click').on('click', function () {
      //skt_landing.action.gnb_menu.depth_open(callback);
      skt_landing.action.gnb_menu.depth_open($(this), function () {
        console.log('gnb_menu_depth open');
      });
    });
    $('.all-menu-prev').off('click').on('click', function () {
      //skt_landing.action.gnb_menu.depth_close(callback);
      skt_landing.action.gnb_menu.depth_close(function () {
        console.log('gnb_menu_depth close');
      });
    });
  },
  _bindLogin: function () {
    $('.fe-bt-login').on('click', $.proxy(this._onClickLogin, this));
    $('.fe-bt-logout').on('click', $.proxy(this._onClickLogout, this));
  },
  _goLoad: function (nativeCommand, url, callback) {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(nativeCommand, {}, callback);
    } else {
      this._historyService.goLoad(url);
    }
  },
  _onClickLogin: function () {
    this._goLoad(Tw.NTV_CMD.LOGIN, '/auth/tid/login', $.proxy(this._onNativeLogin, this));
  },
  _onClickLogout: function () {
    this._goLoad(Tw.NTV_CMD.LOGOUT, '/auth/tid/logout', $.proxy(this._onNativeLogout, this));
  },
  _onNativeLogin: function (resp) {
    this._apiService.request(Tw.NODE_CMD.LOGIN_TID, resp)
      .done($.proxy(this._successLogin, this));
  },
  _successLogin: function (resp) {
    Tw.Logger.info('[Login Resp]', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3228 ) {
      // 고객보호비밀번호
      this._historyService.goLoad('/auth/login/service-pwd');
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ICAS3235 ) {
      // 휴면계정
      this._historyService.goLoad('/auth/login/dormancy');
    } else if ( resp.code === Tw.API_LOGIN_ERROR.ATH1003 ) {
      this._historyService.goLoad('/auth/login/exceed-fail');
    } else {
      this._historyService.goLoad('/auth/login/fail?errorCode=' + resp.code);
    }
  },
  _onNativeLogout: function () {
    this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
      .done($.proxy(this._successLogout, this));
  },
  _successLogout: function (resp) {
    Tw.Logger.info('[Logout Resp]', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.goLoad('/auth/logout/complete');
    }
  }
};
