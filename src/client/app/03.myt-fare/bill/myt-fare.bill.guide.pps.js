/**
 * FileName: myt-fare.bill.guide.pps.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.12
 */
Tw.MyTFareBillGuidePps = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._init();
};

Tw.MyTFareBillGuidePps.prototype = {
  _init: function () {

  },
  _cachedElement: function () {
    // this.$childBillBtn = $('[data-target="childBillBtn"]');

  },
  _bindEvent: function () {
    // this.$container.on('click', '[data-target="detailedChargeBtn"]', $.proxy(this._goDetailSpecification, this));

  },
  //--------------------------------------------------------------------------[API]
  _getReceiveUserInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0019, {}).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },
  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
    }
  }
  //--------------------------------------------------------------------------[SVC]

  //--------------------------------------------------------------------------[COM]


};