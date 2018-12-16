/**
 * FileName: t-notify.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.13
 */
Tw.TNotifyComponent = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

};

Tw.TNotifyComponent.prototype = {
  open: function () {
    this._popupService.open({
      hbs: 'HO_04_06_01',
      layer: true
    }, $.proxy(this._onOpenTNotify, this), $.proxy(this._onCloseTNotify, this));

  },
  _onOpenTNotify: function ($popupContainer) {

  },
  _onCloseTNotify: function () {

  },
  _getPushDate: function () {
    this._apiService.request(Tw.API_CMD.BFF_04_0004, {
      tid: ''
    }).done($.proxy(this._successPushData, this));
  },
  _successPushData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {

    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  }
};
