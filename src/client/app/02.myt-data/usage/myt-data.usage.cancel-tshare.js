/**
 * FileName: myt-data.usage.cancel-tshare.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 11. 13.
 */
Tw.MyTDataUsageCancelTshare = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
};

Tw.MyTDataUsageCancelTshare.prototype = {
  _URL: {
    MYT_DATA_USAGE: '/myt-data/hotdata'
  },
  _COMPLETE_POPUP_HBS: 'DC_01_01_end',

  _bindEvent: function () {
    this.$container.on('click', '.btn-cancel-tshare', $.proxy(this._onClickBtnCancelTshare, this));
  },

  _onClickBtnCancelTshare: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0011, {}, {}, [this._options.cSvcMgmtNum])
      .done($.proxy(this._onDoneCancelTshare, this))
      .fail($.proxy(this._onFailCancelTshare, this));
  },

  _onDoneCancelTshare: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.open({
        hbs: this._COMPLETE_POPUP_HBS,
        layer: true,
        data: {
          usimNum: this._options.usimNum,
          date: Tw.DateHelper.getShortDate(new Date())
        }
      }, null, null, this._COMPLETE_POPUP_HBS);
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  _onFailCancelTshare: function (resp) {
    this._popupService.openAlert(resp.msg, resp.code);
  }

};
