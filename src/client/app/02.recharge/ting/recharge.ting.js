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
    // this._apiService.request(Tw.API_CMD.BFF_06_0020, {})
    //   .done($.proxy(this._onSuccessGetProvider, this))
    //   .fail($.proxy(this._sendFail, this));

    // var res = {
    //   "code": "RCG0101",
    //   "msg": "오류 입니다. {0},{1}",
    //   "traceId": "a94a2b91d0094257",
    //   "spanId": "a94a2b91d0094257",
    //   "clientDebugMessage": "a94a2b91d0094257*",
    //   "hostname": "TD3P026952",
    //   "appName": "bff-spring-mobile",
    //   "debugMessage": "200 ",
    //   "orgSpanId": "c17d941695ecfea5",
    //   "orgHostname": "TD3P026952",
    //   "orgAppName": "core-balance",
    //   "orgDebugMessage": "BLN0002"
    // };

    // this._onSuccessGetProvider(res);

    // this._apiService.request(Tw.API_CMD.BFF_03_0005_C, {})
    //   .done($.proxy(this._onSuccessProvider, this))
    //   .fail($.proxy(this._sendFail, this));
    this._onSuccessGetProvider();
  },

  _cachedElement: function () {
    this.$wrap_tpl_block = $('#wrap_tpl_block');
    this.$wrap_tpl_ting_request_info = $('.wrap_tpl_ting_request_info');
    this.tpl_ting_blocked = Handlebars.compile($('#tpl_ting_blocked').text());
    this.tpl_ting_request_info = Handlebars.compile($('#tpl_ting_request_info').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '#btn_go_history', $.proxy(this._goHistory, this));
    this.$container.on('click', '#btn_activate_block', $.proxy(this._activateBlock, this));
    this.$container.on('click', '#btn_process_ting', $.proxy(this._goTingGiftProcess, this));
    this.$container.on('click', '#btn_deactivate_block', $.proxy(this._deactivateBlock, this));
    this.$container.on('click', '#btn_ting_request', $.proxy(this._goTingRequestProcess, this));
  },

  _onSuccessProvider: function (res) {
    var result = res.result;
    this.$wrap_tpl_ting_request_info.html(this.tpl_ting_request_info({ name: result.custNm }));
  },

  _onSuccessGetProvider: function (res) {
    // if ( res.code === 'RCG0101' ) {
    //   this._isBlockedTing = true;
    // }
    // if ( res.code === 'RCG0102' ) {
    //   this._isNotAvailableAmount = true;
    // }
    // if ( res.code === 'RCG0109' ) {
    //   this._isBlockedTing = true;
    // }
    // if ( res.code === 'RCG0110' ) {
    //   this._isNotSkt = true;
    // }
    // if ( res.code === 'RCG0112' ) {
    //   this._isNotAvailableAmount = true;
    // }

    this.$wrap_tpl_block.html(this.tpl_ting_blocked({ isBlocked: true }));
  },

  _activateBlock: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_GIFT.TING_A01, '', null, $.proxy(this._requestActivateBlock, this));
  },

  _requestActivateBlock: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0021, {})
      .done(function () {
        location.reload(true);
      })
      .fail($.proxy(this._sendFail, this));
  },

  _deactivateBlock: function () {
    this._popupService.openAlert(Tw.MSG_GIFT.TING_A02);
  },

  _sendFail: function () {
  },

  _goTingGiftProcess: function () {
    if ( this._isNotAdult ) {
      this._popupService.openAlert(Tw.MSG_GIFT.TING_A03);
      return false;
    }

    if ( this._isBlockedTing ) {
      this._popupService.openAlert(Tw.MSG_GIFT.TING_A04);
      return false;
    }

    if ( this._isNotSkt ) {
      this._popupService.openAlert(Tw.MSG_GIFT.TING_A05);
      return false;
    }

    this._go('step1');
  },

  _goTingRequestProcess: function(){
    this._go('request-step1');
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