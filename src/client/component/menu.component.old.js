/**
 * FileName: menu.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.06.22
 */

Tw.MenuComponentOld = function () {
  this.$container = $('#fe-all-menu');

  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();
  this._apiService = Tw.Api;

  // this._bindEvent();
  this._bindLogin();
  Tw.Logger.info('[MainMenu] init complete');
};
Tw.MenuComponentOld.prototype = {
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
  _onClickLogin: function () {
    this._tidLanding.goLogin();
  },
  _onClickLogout: function () {
    this._tidLanding.goLogout();
  }
};
