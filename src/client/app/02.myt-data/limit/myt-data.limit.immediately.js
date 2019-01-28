/**
 * FileName: myt-data.limit.immediately.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataLimitImmediately = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataLimitImmediately.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$btn_immediately_recharge = $('.fe-immediately_recharge');
    this.$wrap_immediately_select_list = $('.fe-limit_immediately_select_list');
    this.$input_block_immediately = this.$container.find('#input_block_immediately');
  },

  _bindEvent: function () {
    this.$input_block_immediately.on('change', $.proxy(this._onToggleBlockImmediately, this));
    this.$btn_immediately_recharge.on('click', $.proxy(this._requestLimitRechargeImmediately, this));
  },

  _onToggleBlockImmediately: function (e) {
    var isChecked = $(e.currentTarget).attr('checked');

    if ( isChecked ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0038, {})
        .done($.proxy(this._onSuccessBlockImmediately, this, 'unblock'));
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0039, {})
        .done($.proxy(this._onSuccessBlockImmediately, this, 'block'));
    }

    $('#tab1-tab').find('.cont-box').each(this._toggleDisplay);
  },

  _onSuccessBlockImmediately: function (sCheckType, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      if ( sCheckType === 'block' ) {
        Tw.CommonHelper.toast(Tw.TOAST_TEXT.MYT_DATA_LIMIT_BLOCK);
      } else {
        Tw.CommonHelper.toast(Tw.TOAST_TEXT.MYT_DATA_LIMIT_UNBLOCK);
      }
    } else if ( res.code === 'ZNGME0000' ) {
      this._popupService.openAlert(res.msg, null, null, $.proxy(this._goSubmain, this));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _toggleDisplay: function (nIndex, elItem) {
    if ( $(elItem).css('display') === 'none' ) {
      $(elItem).show();
    } else {
      $(elItem).hide();
    }
  },

  _requestLimitRechargeImmediately: function () {
    var htParams = {
      amt: this.$wrap_immediately_select_list.find('.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0036, htParams).done($.proxy(this._onSuccessLimitRechargeImmediately, this));
  },

  _onSuccessLimitRechargeImmediately: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/limit/complete');
    } else if ( res.code === 'ZNGME0000' ) {
      this._popupService.openAlert(res.msg, null, null, $.proxy(this._goSubmain, this));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _goSubmain: function () {
    this._historyService.replaceURL('/myt-data/submain');
  }
};