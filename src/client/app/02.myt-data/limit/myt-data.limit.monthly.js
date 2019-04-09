/**
 * @file myt-data.limit.monthly.js
 * @desc 데이터 한도 요금제 > 매달 자동충전 기능 처리
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.10
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
    this._isToggle = false;
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

  /**
   * @function
   * @desc 매월 자동 충전 > 데이터 차단 토글 버튼 선택
   * @param e
   * @private
   */
  _onToggleBlockMonthly: function (e) {
    var $target = $(e.currentTarget);
    var isChecked = $target.attr('checked');

    if ( !this._isToggle ) {
      if ( isChecked ) { // 차단 꺼짐
        this._apiService.request(Tw.API_CMD.BFF_06_0040, {})
          .done($.proxy(this._onSuccessBlockMonthly, this, $target, 'unblock'));
      } else { // 차단 켜짐
        this._apiService.request(Tw.API_CMD.BFF_06_0041, {})
          .done($.proxy(this._onSuccessBlockMonthly, this, $target, 'block'));
      }
    }

    $('#tab2-tab').find('.cont-box').each(this._toggleDisplay);
  },

  /**
   * @function
   * @desc 데이터 한도 요금제 매월 자동 한도 차단(BFF_06_0041) / 차단해제(BFF_06_0040) API Response
   * @param $target
   * @param sCheckType - 꺼짐/켜짐 Flag
   * @param res
   * @private
   */
  _onSuccessBlockMonthly: function ($target, sCheckType, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      if ( sCheckType === 'block' ) {
        Tw.CommonHelper.toast(Tw.TOAST_TEXT.MYT_DATA_LIMIT_MONTHLY_UNBLOCK);
      } else {
        Tw.CommonHelper.toast(Tw.TOAST_TEXT.MYT_DATA_LIMIT_MONTHLY_BLOCK);
      }
    } else {
      this._isToggle = true;
      this.$input_block_monthly.click();

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

  _requestLimitRechargeMonthly: function (e) {
    var $target = $(e.currentTarget);
    var htParams = {
      amt: this.$wrap_monthly_select_list.find('.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0035, htParams).done($.proxy(this._onSuccessLimitRechargeMonthly, this, $target));
  },

  _onSuccessLimitRechargeMonthly: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/limit/complete');
    } else {
      this._popupService.openAlert(res.msg + Tw.MYT_DATA_TING.ERROR_LIMIT.CONTENT,
        Tw.MYT_DATA_TING.ERROR_LIMIT.TITLE, null, $.proxy(this._goSubmain, this), null, $target);
    }
  },

  _cancelMonthlyRecharge: function (e) {
    var $target = $(e.currentTarget);
    this._popupService.openModalTypeA(
      Tw.MYT_DATA_CANCEL_MONTHLY.TITLE,
      Tw.MYT_DATA_CANCEL_MONTHLY.CONTENTS,
      Tw.MYT_DATA_CANCEL_MONTHLY.BTN_NAME,
      null,
      $.proxy(this._cancelMonthly, this, $target),
      null,
      null,
      null,
      $target
    );
  },

  _cancelMonthly: function ($target) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0037, {}).done($.proxy(this._onSuccessCancelMonthlyRecharge, this, $target));
  },

  _onSuccessCancelMonthlyRecharge: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    } else {
      this._popupService.openAlert(res.msg + Tw.MYT_DATA_TING.ERROR_LIMIT.CONTENT, Tw.MYT_DATA_TING.ERROR_LIMIT.TITLE,
        null, $.proxy(this._goSubmain, this), null, $target);
    }
  },

  _goSubmain: function () {
    this._historyService.replaceURL('/myt-data/submain');
  }
};