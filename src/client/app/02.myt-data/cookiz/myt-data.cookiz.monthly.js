/**
 * @file myt-data.cookiz.monthly.js
 * @desc 팅/쿠키즈/안심음성 요금 > 매월 자동 충전 기능 처리
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.10
 */

Tw.MyTDataCookizMonthly = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataCookizMonthly.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$btn_recharge_monthly = this.$container.find('.fe-recharge_cookiz_monthly');
    this.$btn_cancel_auto_recharge = this.$container.find('.fe-cancel_auto_recharge');
    this.$wrap_monthly_select_list = this.$container.find('.fe-cookiz_monthly_select_list');
  },

  _bindEvent: function () {
    this.$btn_recharge_monthly.on('click', $.proxy(this._rechargeMonthly, this));
    this.$btn_cancel_auto_recharge.on('click', $.proxy(this._cancelMonthlyRecharge, this));
    this.$wrap_monthly_select_list.on('click', $.proxy(this._onSelectMonthlyAmount, this));
  },

  /**
   * @function
   * @desc 매월 자동 충전 금액 선택
   * @private
   */
  _onSelectMonthlyAmount: function () {
    if ( this.$wrap_monthly_select_list.find('input:checked').size() !== 0 ) {
      this.$btn_recharge_monthly.prop('disabled', false);
    }
  },

  /**
   * @function
   * @desc 충전하기 버튼 선택
   * @private
   */
  _rechargeMonthly: function () {
    var htParams = {
      amt: this.$wrap_monthly_select_list.find('li.checked input').val()
    };

    // BFF_06_0030 팅/쿠키즈/안심음성 매월 자동충전 API Request
    this._apiService.request(Tw.API_CMD.BFF_06_0030, htParams)
      .done($.proxy(this._onSuccessRechargeMonthly, this));
  },

  /**
   * @function
   * @desc BFF_06_0030 팅/쿠키즈/안심음성 매월 자동충전 API Response
   * @param res - API response 값
   * @private
   */
  _onSuccessRechargeMonthly: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/cookiz/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  /**
   * @function
   * @desc 매월 자동 충전 이용 취소하기
   * @param e - 이벤트 객체
   * @private
   */
  _cancelMonthlyRecharge: function (e) {
    this._popupService.openModalTypeA(
      Tw.MYT_DATA_CANCEL_MONTHLY.TITLE,
      Tw.MYT_DATA_CANCEL_MONTHLY.CONTENTS,
      Tw.MYT_DATA_CANCEL_MONTHLY.BTN_NAME,
      null,
      $.proxy(this._cancelMonthly, this),
      null,
      null,
      null,
      $(e.currentTarget)
    );
  },

  /**
   * @function
   * @desc BFF_06_0031 팅/쿠키즈/안심음성 매월 자동충전 취소 API Request
   * @private
   */
  _cancelMonthly: function () {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0031, {})
      .done($.proxy(this._onSuccessCancelRechargeMonthly, this));
  },

  /**
   * @function
   * @desc BFF_06_0031 팅/쿠키즈/안심음성 매월 자동충전 취소 API Response
   * @param res API response 값
   * @private
   */
  _onSuccessCancelRechargeMonthly: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};