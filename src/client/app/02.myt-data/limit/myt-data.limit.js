/**
 * FileName: myt-data.limit.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataLimit = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataLimit.prototype = {
  _init: function () {
    this._getRemainDataInfo();
  },

  _cachedElement: function () {
    this.$btn_monthly_recharge = $('.fe-monthly_recharge');
    this.$btn_immediately_recharge = $('.fe-immediately_recharge');
    this.$wrap_monthly_select_list = $('.fe-limit_monthly_select_list');
    this.$input_block_monthly = this.$container.find('#input_block_monthly');
    this.$wrap_immediately_select_list = $('.fe-limit_immediately_select_list');
    this.$input_block_immediately = this.$container.find('#input_block_immediately');
    this.$btn_cancel_monthly_recharge = this.$container.find('.fe-cancel_limit_monthly');
  },

  _bindEvent: function () {
    this.$input_block_monthly.on('change', $.proxy(this._onToggleBlockMonthly, this));
    this.$input_block_immediately.on('change', $.proxy(this._onToggleBlockImmediately, this));
    this.$btn_immediately_recharge.on('click', $.proxy(this._requestLimitRechargeImmediately, this));
    this.$btn_monthly_recharge.on('click', $.proxy(this._requestLimitRechargeMonthly, this));
    this.$btn_cancel_monthly_recharge.on('click', $.proxy(this._cancelMonthlyRecharge, this));
  },

  _onToggleBlockImmediately: function (e) {
    var isChecked = $(e.currentTarget).attr('checked');

    if ( isChecked ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0038, {})
        .done($.proxy(this._onSuccessBlockImmediately, this));
      this._popupService.toast(Tw.TOAST_TEXT.MYT_DATA_LIMIT_UNBLOCK);
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0039, {})
        .done($.proxy(this._onSuccessBlockImmediately, this));
      this._popupService.toast(Tw.TOAST_TEXT.MYT_DATA_LIMIT_BLOCK);
    }

    $('#tab1-tab').find('.cont-box').each(this._toggleDisplay);
  },

  _onSuccessBlockImmediately: function (res) {
    if ( res.code !== Tw.API_CODE.CODE_00 ) {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onToggleBlockMonthly: function (e) {
    var isChecked = $(e.currentTarget).attr('checked');

    if ( isChecked ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0040, {})
        .done($.proxy(this._onSuccessBlockMonthly, this));
      this._popupService.toast(Tw.TOAST_TEXT.MYT_DATA_LIMIT_UNBLOCK);
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0041, {})
        .done($.proxy(this._onSuccessBlockMonthly, this));
      this._popupService.toast(Tw.TOAST_TEXT.MYT_DATA_LIMIT_BLOCK);
    }

    $('#tab2-tab').find('.cont-box').each(this._toggleDisplay);
  },

  _onSuccessBlockMonthly: function (res) {
    if ( res.code !== Tw.API_CODE.CODE_00 ) {
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

  _getRemainDataInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0034, {}).done($.proxy(this._onSuccessRemainDataInfo, this));
  },

  _onSuccessRemainDataInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._setAmountUI(Number(res.result.currentTopUpLimit));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _setAmountUI: function (nLimitMount) {
    var fnCheckedUI = function (nIndex, elInput) {
      var $input = $(elInput);

      if ( Number($input.val()) > nLimitMount ) {
        $input.prop('disabled', true);
        $input.parent().addClass('disabled');
      }
    };

    this.$wrap_monthly_select_list.find('input').each(fnCheckedUI)
      .on('click', $.proxy(function () {
        this.$btn_monthly_recharge.removeAttr('disabled');
      }, this));
    this.$wrap_immediately_select_list.find('input').each(fnCheckedUI)
      .on('click', $.proxy(function () {
        this.$btn_immediately_recharge.removeAttr('disabled');
      }, this));
  },

  _requestLimitRechargeImmediately: function () {
    var htParams = {
      amt: this.$wrap_immediately_select_list.find('.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0036, htParams).done($.proxy(this._onSuccessLimitRechargeImmediately, this));
  },

  _requestLimitRechargeMonthly: function () {
    var htParams = {
      amt: this.$wrap_monthly_select_list.find('.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0035, htParams).done($.proxy(this._onSuccessLimitRechargeMonthly, this));
  },

  _onSuccessLimitRechargeImmediately: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt/data/limit/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onSuccessLimitRechargeMonthly: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt/data/limit/complete');
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
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};