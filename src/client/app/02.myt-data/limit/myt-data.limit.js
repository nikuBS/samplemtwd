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
    // If there is hash #auto, show second tab(auto gift)
    if ( window.location.hash === '#auto' ) {
      this._goAutoTab();
      $('.fe-immediately_recharge').hide();
      $('.fe-monthly_recharge').show();
      this._fixedBottomAdd('.fe-monthly_recharge');

    }else{
      $('.fe-monthly_recharge').hide();
      $('.fe-immediately_recharge').show();
      this._fixedBottomAdd('.fe-immediately_recharge');
    }

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

  _goAutoTab: function () {
    this.$container.find('#tab1').attr('aria-selected', false).find('a').attr('aria-selected', false);
    this.$container.find('#tab2').attr('aria-selected', true).find('a').attr('aria-selected', true);
  },

  _fixedBottomAdd: function (tap) {
    //하단 버튼 자체가 없을 때는 fixed-bottom 클래스 제거
    if($(tap).length === 0 ){
      $('#fe-limit-wrap').removeClass('fixed-bottom');
    }else{
      $('#fe-limit-wrap').addClass('fixed-bottom');
    }
  }
};