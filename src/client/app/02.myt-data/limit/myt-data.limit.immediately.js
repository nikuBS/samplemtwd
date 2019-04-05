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
    this._isToggle = false;
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
    var $target = $(e.currentTarget);
    var isChecked = $target.attr('checked');

    if ( !this._isToggle ) {
      if ( isChecked ) {
        this._apiService.request(Tw.API_CMD.BFF_06_0038, {})
          .done($.proxy(this._onSuccessBlockImmediately, this, $target, 'unblock'));
      } else {
        this._apiService.request(Tw.API_CMD.BFF_06_0039, {})
          .done($.proxy(this._onSuccessBlockImmediately, this, $target, 'block'));
      }
    }

    $('#tab1-tab').find('.cont-box').each(this._toggleDisplay);
  },

  _onSuccessBlockImmediately: function ($target, sCheckType, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      if ( sCheckType === 'block' ) {
        Tw.CommonHelper.toast(Tw.TOAST_TEXT.MYT_DATA_LIMIT_UNBLOCK);
      } else {
        Tw.CommonHelper.toast(Tw.TOAST_TEXT.MYT_DATA_LIMIT_BLOCK);
      }
    } else {
      this._isToggle = true;
      this.$input_block_immediately.click();

      this._popupService.openAlert(
        res.msg + Tw.MYT_DATA_TING.ERROR_LIMIT.CONTENT,
        Tw.MYT_DATA_TING.ERROR_LIMIT.TITLE,
        null,
        $.proxy(function () {
          this._isToggle = false;
        }, this),
        null,
        $target);
    }
  },

  _toggleDisplay: function (nIndex, elItem) {
    if ( $(elItem).css('display') === 'none' ) {
      $(elItem).show();
    } else {
      $(elItem).hide();
    }
  },

  _requestLimitRechargeImmediately: function (e) {
    var $target = $(e.currentTarget);
    var htParams = {
      amt: this.$wrap_immediately_select_list.find('.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0036, htParams).done($.proxy(this._onSuccessLimitRechargeImmediately, this, $target));
  },

  _onSuccessLimitRechargeImmediately: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/limit/complete');
    } else {
      this._popupService.openAlert(res.msg + Tw.MYT_DATA_TING.ERROR_LIMIT.CONTENT, Tw.MYT_DATA_TING.ERROR_LIMIT.TITLE,
        null, $.proxy(this._goSubmain, this), null, $target);
    }
  },

  _goSubmain: function () {
    this._historyService.replaceURL('/myt-data/submain');
  }
};