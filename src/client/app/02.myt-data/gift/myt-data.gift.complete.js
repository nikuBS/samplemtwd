/**
 * FileName: myt-data.gift.complete.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTDataGiftComplete = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGiftComplete.prototype = {
  _init: function () {
    this.paramData = Tw.UrlHelper.getQueryParams();
    this._setReceiverInfo();
  },

  _cachedElement: function () {
    this.$name = this.$container.find('.name');
    this.$phone = this.$container.find('.phone');
    this.$data_qty = this.$container.find('.data_qty');
    this.$btn_go_sms = this.$container.find('.fe-btn_go_sms');
    this.$btn_gift_history = this.$container.find('.fe-btn_gift_history');
  },

  _bindEvent: function () {
    this.$btn_go_sms.on('click', $.proxy(this._goToSms, this));
    this.$btn_gift_history.on('click', $.proxy(this._goToHistory, this));
  },

  _setReceiverInfo: function () {
    if ( this.paramData.custNm ) {
      this.$name.text(this.paramData.custNm);
    }

    if ( this.paramData.befrSvcNum ) {
      this.paramData.befrSvcNum = this.paramData.befrSvcNum.replace(/-/g, '');
      this.$phone.text(Tw.FormatHelper.conTelFormatWithDash(this.paramData.befrSvcNum));
    }

    if ( this.paramData.dataQty ) {
      this.$data_qty.text(this.paramData.dataQty + 'MB');
    }
  },

  _goToSms: function () {
    this._historyService.replaceURL('/myt-data/giftdata/sms?' + $.param(this.paramData));
  },

  _goToHistory: function () {
    this._historyService.replaceURL('/myt-data/history');
  }
};
