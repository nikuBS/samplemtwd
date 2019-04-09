/**
 * @file myt-data.limit.js
 * @desc 데이터 한도 요금제 > 공통 기능 처리
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.10
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
  /**
   * @function
   * @desc 이번 달 충전 / 매달 자동충전 화면 분기
   * @private
   */
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

  /**
   * 쓰이지 않는 코드로 보임 => 이번달 충전, 매월 자동 충전 파일에 별도 선언
   */
  _toggleDisplay: function (nIndex, elItem) {
    if ( $(elItem).css('display') === 'none' ) {
      $(elItem).show();
    } else {
      $(elItem).hide();
    }
  },

  /**
   * @function
   * @desc BFF_06_0034 데이터한도요금제 가입정보 조회 API Request
   * @private
   */
  _getRemainDataInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0034, {}).done($.proxy(this._onSuccessRemainDataInfo, this));
  },

  /**
   * @function
   * @desc BFF_06_0034 데이터한도요금제 가입정보 조회 API Response
   * @param res
   * @private
   */
  _onSuccessRemainDataInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._setAmountUI(Number(res.result.currentTopUpLimit));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  /**
   * @function
   * @desc 충전 금액 영역 활성화/비활성화 세팅
   * @param nLimitMount
   * @private
   */
  _setAmountUI: function (nLimitMount) {
    var fnCheckedUI = function (nIndex, elInput) {
      var $input = $(elInput);

      if ( Number($input.val()) > nLimitMount ) { // 충전 금액이 충전 가능 금액보다 큰 경우 비활성화
        $input.prop('disabled', true);
        $input.parent().addClass('disabled');
      }
    };

    this.$wrap_monthly_select_list.find('input').each(fnCheckedUI)
      .on('click', $.proxy(function () {
        this.$btn_monthly_recharge.removeAttr('disabled'); // 충전 금액이 선택된 경우 하단 충전하기 버튼 활성화
      }, this));
    this.$wrap_immediately_select_list.find('input').each(fnCheckedUI)
      .on('click', $.proxy(function () {
        this.$btn_immediately_recharge.removeAttr('disabled'); // 충전 금액이 선택된 경우 하단 충전하기 버튼 활성화
      }, this));
  },

  /**
   * @function
   * @desc 매달 자동충전으로 이동시 Tap 웹 접근성 처리
   * @private
   */
  _goAutoTab: function () {
    this.$container.find('#tab1').attr('aria-selected', false).find('a').attr('aria-selected', false);
    this.$container.find('#tab2').attr('aria-selected', true).find('a').attr('aria-selected', true);
  },

  /**
   * @function
   * @desc 하단 버튼에 유무에 따라 fixed-bottom 클래스가 추가/제거
   * @author Seungkyu Kim (ksk4788@pineone.com)
   * @since 2019-03-23
   * @param tap
   * @private
   */
  _fixedBottomAdd: function (tap) {
    //하단 버튼 자체가 없을 때는 fixed-bottom 클래스 제거
    if($(tap).length === 0 ){
      $('#fe-limit-wrap').removeClass('fixed-bottom');
    }else{
      $('#fe-limit-wrap').addClass('fixed-bottom');
    }
  }
};