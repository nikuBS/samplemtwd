/**
 * @file 상품 > 모바일요금제 > 설정 > 5Gx YT 요금제
 * @author Dong HA Shin
 * @since 2019-09-19
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param settingInfo - 설정 정보조회 데이터
 */
Tw.ProductMobileplanSetting5gxYt = function(rootEl, prodId, settingInfo) {
  // 컨테이너 레이어 선언
  this.$container = rootEl;

  // 공통 모듈 선언
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  // 공통 변수 선언
  this._prodId = prodId;
  this._settingInfo = JSON.parse(settingInfo);
  this._currentOptionProdId = this._settingInfo.useOptionProdId;

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();

  // 최초 동작
  this._init();
};

Tw.ProductMobileplanSetting5gxYt.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    if (this._historyService.isBack()) {
      this._historyService.goBack();
    }

    if (Tw.FormatHelper.isEmpty(this._currentOptionProdId)) {
      return;
    }

    this.$container.find('input[value="' + this._currentOptionProdId + '"]').trigger('click');
  },

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procSetupOk, this), 500));
    this.$container.on('click', '.fe-home-external', $.proxy(this._onClickExternal, this));
  },

  /**
   * @function
   * @desc 설정 완료 버튼 활성화
   * @returns {*}
   */
  _enableSetupButton: function() {
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  /**
   * @function
   * @desc 외부 브라우저 랜딩 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickExternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @function
   * @desc 설정 완료 버튼 클릭 시 & 설정 변경 API 요청
   */
  _procSetupOk: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    if (this._currentOptionProdId === $checked.val()) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0035, { addCd: '2' }, {}, [$checked.val()]).done($.proxy(this._procSetupOkRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 설정 변경 API 응답 시
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procSetupOkRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
        typeNm: Tw.PRODUCT_TYPE_NM.CHANGE
      }
    }, $.proxy(this._bindSuccessPopup, this), $.proxy(this._onClosePop, this), 'save_setting_success');
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindSuccessPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 완료 팝업 내 닫기 버튼 클릭 시
   */
  _closePop: function() {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료 팝업 종료 시
   */
  _onClosePop: function() {
    this._historyService.goBack();
  }

};
