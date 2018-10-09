/**
 * FileName: myt-fare.payment.history.js
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFarePaymentHistory = function (rootEl, data) {
  this.$container = rootEl;
  this.data = JSON.parse(data);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTFarePaymentHistory.prototype = {
  _init: function () {
    console.log(this.data.current);
    this._getAllData();
  },
  _cachedElement: function () {
    this.$actionSheetTrigger = this.$container.find('#fe-type-trigger');

    this.$openAutoPaymentLayerTrigger = this.$container.find('#fe-go-refund-quit');
    this.$moveRefundListTrigger = this.$container.find('#fe-go-refund-list');
  },
  _bindEvent: function () {
    this.$actionSheetTrigger.on('click', $.proxy(this._typeActionSheetOpen, this));

    this.$openAutoPaymentLayerTrigger.on('click', $.proxy(this._openAutoPaymentLayer, this));
    this.$moveRefundListTrigger.on('click', $.proxy(this._moveRefundList, this));
  },

  _openAutoPaymentLayer: function() {
    this._popupService.open(
        {
          hbs: 'MF_08_03'
        },
        $.proxy(function() { console.log(1918181191919); }, this)
    );
    console.log(198181818181818);
  },

  _moveRefundList: function() {
    console.log(181818181818181818);
  },

  _getAllData: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0030, {}).done($.proxy(this._setData, this)).fail($.proxy(this._apiError, this));
  },

  _setData: function (data) {
    console.log(data);
  },

  _typeActionSheetOpen: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',// hbs의 파일명
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_PAYMENT_TYPE,
      data: Tw.POPUP_TPL.PAYMENT_HISTORY_TYPE
    }, $.proxy(function () {
      console.log(1111);
    }, this), $.proxy(function () {
      console.log(2222);
    }, this));
  },

  _apiError: function (err) {
    Tw.Logger.error(err.code, err.msg);
    this._popupService.openAlert(Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg);
    return false;
  }

};