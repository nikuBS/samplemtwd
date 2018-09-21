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
    this.$wrap_monthly_select_list = $('.fe-limit_monthly_select_list');
    this.$wrap_immediately_select_list = $('.fe-limit_immediately_select_list');
  },

  _bindEvent: function () {
    this.$input_block_monthly.on('change', $.proxy(this._onToggleBlockMonthly, this));
    this.$input_block_immediately.on('change', $.proxy(this._onToggleBlockImmediately, this));
  },

  _onToggleBlockImmediately: function () {
    $('#tab1-tab').find('.cont-box').each(this._toggleDisplay);
  },

  _onToggleBlockMonthly: function () {
    $('#tab2-tab').find('.cont-box').each(this._toggleDisplay);
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

      if ( Number($input.val()) === nLimitMount ) {
        $input.click();
      }
    };

    this.$wrap_monthly_select_list.find('input').each(fnCheckedUI);
    this.$wrap_immediately_select_list.find('input').each(fnCheckedUI);
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

    }else{

    }
  }
};