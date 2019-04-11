/**
 * @file myt-data.cookiz.immediately.js
 * @desc 팅/쿠키즈/안심음성 요금 > 당월 충전 기능 처리
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.10
 */

Tw.MyTDataCookizImmediately = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataCookizImmediately.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$btn_recharge_immediately = this.$container.find('.fe-recharge_cookiz_immediately');
    this.$wrap_immediately_select_list = this.$container.find('.fe-cookiz_immediately_select_list');
  },

  _bindEvent: function () {
    this.$btn_recharge_immediately.click(_.debounce($.proxy(this._rechargeImmediately, this), 500));
    this.$wrap_immediately_select_list.on('click', $.proxy(this._onSelectImmediatelyAmount, this));
  },

  /**
   * @function
   * @desc 당월 충전 금액 선택
   * @private
   */
  _onSelectImmediatelyAmount: function () {
    if ( this.$wrap_immediately_select_list.find('input:checked').size() !== 0 ) { // 충전 금액이 선택되면 충전하기 버튼 활성화
      this.$btn_recharge_immediately.prop('disabled', false);
    }
  },

  /**
   * @function
   * @desc 충전하기 버튼 선택
   * @private
   */
  _rechargeImmediately: function () {
    var htParams = {
      amt: this.$wrap_immediately_select_list.find('li.checked input').val()
    };

    // BFF_06_0029 팅/쿠키즈/안심음성 당월충전 API Request
    this._apiService.request(Tw.API_CMD.BFF_06_0029, htParams)
      .done($.proxy(this._onSuccessRechargeImmediately, this));
  },

  /**
   * @function
   * @desc BFF_06_0029 팅/쿠키즈/안심음성 당월충전 API Response
   * @param res
   * @private
   */
  _onSuccessRechargeImmediately: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/cookiz/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};