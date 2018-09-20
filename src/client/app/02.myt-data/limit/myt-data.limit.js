/**
 * FileName: myt-data.limit.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataLimit = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataLimit.prototype = {
  _init: function () {
    this._getRemainDataInfo();
  },

  _cachedElement: function () {
    this.$input_block_monthly = this.$container.find('#input_block_monthly');
    this.$input_block_immediately = this.$container.find('#input_block_immediately');
  },

  _bindEvent: function () {
    this.$input_block_monthly.on('change', $.proxy(this._onToggleBlockMonthly, this));
    this.$input_block_immediately.on('change', $.proxy(this._onToggleBlockImmediately, this));
  },

  _onToggleBlockImmediately: function () {
    $('#tab1-tab').find('.cont-box').each(function (nIndex, elItem) {
      if ( $(elItem).is(':visible') ) {
        $(elItem).hide();
      } else {
        $(elItem).show();
      }
    });
  },

  _onToggleBlockMonthly: function () {
    $('#tab2-tab').find('.cont-box').each(function (nIndex, elItem) {
      if ( $(elItem).is(':visible') ) {
        $(elItem).hide();
      } else {
        $(elItem).show();
      }
    });
  },

  _getRemainDataInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0034, {}).done($.proxy(this._onSuccessRemainDataInfo, this));
  },

  _onSuccessRemainDataInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      console.log(res);
    }
  },

  _requestSendingData: function () {
    var htParams = {
      befrSvcNum: '',
      dataQty: ''
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0016, htParams).done($.proxy(this._onSuccessSendingData, this));
  },

  _onSuccessSendingData: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {

    }
  }
};