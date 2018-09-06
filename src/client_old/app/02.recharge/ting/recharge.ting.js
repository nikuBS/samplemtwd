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
  _isNotSkt: false,
  _isNotAdult: false,
  _isBlockedTing: false,
  _isNotAvailableAmount: false,

  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0020, {})
      .done($.proxy(this._onSuccessGetProvider, this));
  },

  _cachedElement: function () {
    this.$wrap_tpl_block = $('#wrap_tpl_block');
    this.tpl_ting_blocked = Handlebars.compile($('#tpl_ting_blocked').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn_go_history', $.proxy(this._goHistory, this));
    this.$container.on('click', '.fe-btn_activate_block', $.proxy(this._activateBlock, this));
    this.$container.on('click', '.fe-btn_process_ting', $.proxy(this._goTingGiftProcess, this));
    this.$container.on('click', '.fe-btn_deactivate_block', $.proxy(this._deactivateBlock, this));
    this.$container.on('click', '.fe-btn_ting_request', $.proxy(this._goTingRequestProcess, this));
  },

  _onSuccessGetProvider: function (res) {
    if ( res.code === 'RCG0101' ) {
      this._isBlockedTing = true;
    }
    if ( res.code === 'RCG0102' ) {
      this._isNotAvailableAmount = true;
    }
    if ( res.data && res.data.code === 'ZPAYE0077' ) {
      this._isNotAdult = true;
    }

    this.$wrap_tpl_block.html(this.tpl_ting_blocked({ isBlocked: this._isBlockedTing }));
  },

  _activateBlock: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A01, null, null, $.proxy(this._requestActivateBlock, this));
  },

  _requestActivateBlock: function () {
    this._popupService.close();

    var onSuccessActivateBlock = function (res) {
      if ( res.code === '00' ) {
        location.reload(true);
      } else {
        this._sendFail(res);
      }
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0021, {})
      .done($.proxy(onSuccessActivateBlock, this));
  },

  _deactivateBlock: function () {
    this._popupService.openAlert(Tw.MSG_GIFT.TING_A02);
  },

  _sendFail: function (res) {
    if ( res.msg ) {
      this._popupService.openAlert(res.msg);
      return false;
    }
  },

  _goTingGiftProcess: function () {
    if ( this._isBlockedTing ) {
      this._popupService.openAlert(Tw.MSG_GIFT.TING_A03);
      return false;
    }

    if ( this._isNotAdult ) {
      this._popupService.openAlert(Tw.MSG_GIFT.TING_A04);
      return false;
    }

    if ( this._isNotSkt ) {
      this._popupService.openAlert(Tw.MSG_GIFT.TING_A05);
      return false;
    }

    this._go('#step1');
  },

  _goTingRequestProcess: function () {
    this._go('#request-step1');
  },

  _goHistory: function () {
    this._goLoad('/recharge/ting/history');
  },

  _goLoad: function (url) {
    location.href = url;
  },

  _go: function (hash) {
    window.location.hash = hash;
  }
};