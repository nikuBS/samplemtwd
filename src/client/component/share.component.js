/**
 * FileName: share.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.25
 */
Tw.ShareComponent = function () {
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._url = '';
  this._menuId = '';

  this._bindEvent();
};

Tw.ShareComponent.prototype = {
  _bindEvent: function () {
    this.$btShare = $('#fe-bt-share');
    this._url = this.$btShare.data('menuurl');
    this._menuId = this.$btShare.data('menuid');
    this.$btShare.click(_.debounce($.proxy(this._onClickShare, this), 500));
  },
  _onClickShare: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0065, {
      trgtUrl: location.pathname + location.search,
      menuId: this._menuId
    }).done($.proxy(this._successScutUrl, this));

  },
  _successScutUrl: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._nativeService.send(Tw.NTV_CMD.SHARE, {
        content: resp.result.shtnUrl
      });
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  }
};
