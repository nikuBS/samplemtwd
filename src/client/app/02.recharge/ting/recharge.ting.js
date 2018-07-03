/**
 * FileName: recharge.ting.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeTing = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.RechargeTing.prototype = {
  _isNotAdult: false,
  _isBlockedTing: false,
  _isNotSkt: false,
  _isNotAvailableAmount: false,

  _init: function () {
    // this._apiService.request(Tw.API_CMD.BFF_06_0020, {})
    //   .done($.proxy(this._onSuccessGetProvider, this))
    //   .fail($.proxy(this._sendFail, this));
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '#btn_go_history', $.proxy(this._goHistory, this));
    this.$container.on('click', '#btn_activate_block', $.proxy(this._activateBlock, this));
    this.$container.on('click', '#btn_deactivate_block', $.proxy(this._deactivateBlock, this));
  },

  _onSuccessGetProvider: function (res) {
    if ( res.code == 'RCG0101' ) {
      this._isNotAdult = true;
    }
    if ( res.code == 'RCG0109' ) {
      this._isBlockedTing = true;
    }
    if ( res.code == 'RCG0110' ) {
      this._isNotSkt = true;
    }
    if ( res.code == 'RCG0112' ) {
      this._isNotAvailableAmount = true;
    }
  },

  _activateBlock: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0021, {})
      .done($.proxy(function () {
        location.reload(true);
      }, this))
      .fail($.proxy(this._sendFail, this));
  },

  _deactivateBlock: function () {
    this._popupService.openAlert(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A02);
  },

  _sendFail: function () {
  },

  _goTingGiftProcess: function () {
    if ( this._isNotAdult ) {
      this._popupService.openAlert(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A03);
    }
    if ( this._isBlockedTing ) {
      this._popupService.openAlert(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A04);
    }
    if ( this._isNotSkt ) {
      this._popupService.openAlert(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A05);
    }
  },

  _goTingRequestProcess: function () {

  },

  _goHistory: function () {
    this._goLoad('/recharge/ting/history');
  },

  _goLoad: function (url) {
    location.href = url;
  }
};