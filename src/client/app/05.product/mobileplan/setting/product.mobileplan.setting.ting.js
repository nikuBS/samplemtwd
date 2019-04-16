/**
 * @file 상품 > 모바일요금제 > 설정 > 팅
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-14
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면ID
 * @param currentTingSettings - 현재 팅 설정 값
 */
Tw.ProductMobileplanSettingTing = function(rootEl, prodId, displayId, currentTingSettings) {
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
  this._displayId = displayId;
  this._currentTingSettings = JSON.parse(currentTingSettings);

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();

  // 최초 동작
  this._init();
};

Tw.ProductMobileplanSettingTing.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    if (this._historyService.isBack()) {
      this._historyService.goBack();
    }

    this.$container.find('input[value="' + this._currentTingSettings.beforeLmtGrCd + '"]').trigger('click');
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
  },

  /**
   * @function
   * @desc 설정 완료 버튼 활성화
   */
  _enableSetupButton: function() {
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  /**
   * @function
   * @desc 설정 완료 버튼 클릭 시 & 설정 변경 API 요청
   * @returns {*|void}
   */
  _procSetupOk: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    if (this._currentTingSettings.beforeLmtGrCd === $checked.val()) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0041, {
      beforeLmtGrCd: this._currentTingSettings.beforeLmtGrCd,
      afterLmtGrCd: $checked.val()
    }, {}, $checked.val()).done($.proxy(this._procSetupOkRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 설정 변경 API 응답 처리
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
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 팝업 컨테이너 레이어
   */
  _bindSuccessPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 시
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
