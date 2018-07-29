/**
 * FileName: myt.usage.tdatashare-close.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.27
 */

Tw.MytUsageTdatashareClose = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._assign();
  this._bindEvent();
  this._init();
};

Tw.MytUsageTdatashareClose.prototype = {
  _assign: function () {
    this._$main = this.$container.find('#fe-main');
    this._$complete = this.$container.find('#fe-complete');
    this._cSvcMgmtNum = this.$container.data('csvcmgmtnum');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-close-submit', $.proxy(this._closeSubmit, this));
  },

  _init: function () {

  },

  _closeSubmit: function () {
    Tw.API_CMD.BFF_05_0011.path = Tw.API_CMD.BFF_05_0011.path + '/' + this._cSvcMgmtNum;
    this._apiService.request(Tw.API_CMD.BFF_05_0011, {}, {}, 'abc')
      .done($.proxy(this._requestDone, this))
      .fail($.proxy(this._requestFail, this));
  },

  _requestDone: function () {
    this._$complete.show();
    this._$main.hide();
  }

};

