/**
 * @file myt-data.limit.immediately.js
 * @desc 데이터 한도 요금제 > 이번 달 충전 기능 처리
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.10
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
    this.$btn_immediately_recharge.click(_.debounce($.proxy(this._requestLimitRechargeImmediately, this), 500));
  },

  /**
   * @function
   * @desc 이번 달 충전 > 이번 달 차단 토글 버튼 선택
   * @param e
   * @private
   */
  _onToggleBlockImmediately: function (e) {
    var $target = $(e.currentTarget);
    var isChecked = $target.attr('checked');

    if ( !this._isToggle ) {
      if ( isChecked ) {  // 차단 꺼짐
        this._apiService.request(Tw.API_CMD.BFF_06_0038, {})
          .done($.proxy(this._onSuccessBlockImmediately, this, $target, 'unblock'));
      } else {  // 차단 켜짐
        this._apiService.request(Tw.API_CMD.BFF_06_0039, {})
          .done($.proxy(this._onSuccessBlockImmediately, this, $target, 'block'));
      }
    }

    $('#tab1-tab').find('.cont-box').each(this._toggleDisplay);
  },

  /**
   * @function
   * @desc 데이터 한도 요금제 당월 한도차단(BFF_06_0039) / 차단해제(BFF_06_0038) API Response
   * @param $target
   * @param sCheckType - 꺼짐/켜짐 Flag
   * @param res
   * @private
   */
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

  /**
   * 데이터 차단 토글 버튼에 따라 화면 Show/Hide 처리
   * @param nIndex - each 함수 index
   * @param elItem - index 번째 .cont-box Element
   * @private
   */
  _toggleDisplay: function (nIndex, elItem) {
    if ( $(elItem).css('display') === 'none' ) {
      $(elItem).show();
    } else {
      $(elItem).hide();
    }
  },

  /**
   * @desc 이번 달 충전 > 충전하기 버튼 선택
   * @param e
   * @private
   */
  _requestLimitRechargeImmediately: function (e) {
    var $target = $(e.currentTarget);
    var htParams = {
      amt: this.$wrap_immediately_select_list.find('.checked input').val()
    };

    // BFF_06_0036 데이터한도요금제 당월충전 API Request
    this._apiService.request(Tw.API_CMD.BFF_06_0036, htParams).done($.proxy(this._onSuccessLimitRechargeImmediately, this, $target));
  },

  /**
   * @function
   * @desc BFF_06_0036 데이터한도요금제 당월충전 API Response
   * @param $target
   * @param res
   * @private
   */
  _onSuccessLimitRechargeImmediately: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/limit/complete');
    } else {
      this._popupService.openAlert(res.msg + Tw.MYT_DATA_TING.ERROR_LIMIT.CONTENT, Tw.MYT_DATA_TING.ERROR_LIMIT.TITLE,
        null, $.proxy(this._goSubmain, this), null, $target);
    }
  },

  /**
   * @function
   * @desc 나의 데이터 통화 서브메인으로 이동
   * @private
   */
  _goSubmain: function () {
    this._historyService.replaceURL('/myt-data/submain');
  }
};