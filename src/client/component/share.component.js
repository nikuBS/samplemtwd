/**
 * FileName: share.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.25
 */
Tw.ShareComponent = function () {
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._domain = '';
  this._url = '';
  this._menuId = '';

  this._bindEvent();
  this._getDomain();
};

Tw.ShareComponent.prototype = {
  _bindEvent: function () {
    this.$btShare = $('#fe-bt-share');
    this._url = this.$btShare.data('menuurl');
    this._menuId = this.$btShare.data('menuid');
    this.$btShare.on('click', $.proxy(this._onClickShare, this));
  },
  _getDomain: function () {
    this._apiService.request(Tw.NODE_CMD.GET_DOMAIN, {})
      .done($.proxy(this._successGetDomain, this));
  },
  _successGetDomain: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._domain = resp.result.domain;
    } else {
      //
    }
  },
  _onClickShare: function () {
    this._nativeService.send(Tw.NTV_CMD.SHARE, {
      // content: 'http://' + this._domain + '/common/share/bridge?target=' + encodeURIComponent(this._url) + '&loginType=T'
      content: 'http://skt.sh/' + this._menuId
    });
  }
};
