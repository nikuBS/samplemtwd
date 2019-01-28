/**
 * FileName: myt-data.limit.monthly.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataLimitMonthly = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataLimitMonthly.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$btn_monthly_recharge = $('.fe-monthly_recharge');
    this.$wrap_monthly_select_list = $('.fe-limit_monthly_select_list');
    this.$input_block_monthly = this.$container.find('#input_block_monthly');
    this.$btn_cancel_monthly_recharge = this.$container.find('.fe-cancel_limit_monthly');
  },

  _bindEvent: function () {
    this.$input_block_monthly.on('change', $.proxy(this._onToggleBlockMonthly, this));
    this.$btn_monthly_recharge.on('click', $.proxy(this._requestLimitRechargeMonthly, this));
    this.$btn_cancel_monthly_recharge.on('click', $.proxy(this._cancelMonthlyRecharge, this));
  },

  _onToggleBlockMonthly: function (e) {
    var isChecked = $(e.currentTarget).attr('checked');

    if ( isChecked ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0040, {})
        .done($.proxy(this._onSuccessBlockMonthly, this, 'unblock'));
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0041, {})
        .done($.proxy(this._onSuccessBlockMonthly, this, 'block'));
    }

    $('#tab2-tab').find('.cont-box').each(this._toggleDisplay);
  },

  _onSuccessBlockMonthly: function (sCheckType, res) {
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

  _requestLimitRechargeMonthly: function () {
    var htParams = {
      amt: this.$wrap_monthly_select_list.find('.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0035, htParams).done($.proxy(this._onSuccessLimitRechargeMonthly, this));
  },

  _onSuccessLimitRechargeMonthly: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/limit/complete');
    } else if ( res.code === 'ZNGME0000' ) {
      this._popupService.openAlert(res.msg, null, null, $.proxy(this._goSubmain, this));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _cancelMonthlyRecharge: function () {
    this._popupService.openModalTypeA(
      Tw.MYT_DATA_CANCEL_MONTHLY.TITLE,
      Tw.MYT_DATA_CANCEL_MONTHLY.CONTENTS,
      Tw.MYT_DATA_CANCEL_MONTHLY.BTN_NAME,
      null,
      $.proxy(this._cancelMonthly, this)
    );
  },

  _cancelMonthly: function () {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0037, {}).done($.proxy(this._onSuccessCancelMonthlyRecharge, this));
  },

  _onSuccessCancelMonthlyRecharge: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
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