/**
 * @file product.mobileplan.downgrade-gamepass.js
 * @author
 * @since 2021-04-19
 */

/**
 * @class
 * @desc 상품 > 요금제 > DG방어(게임패스)
 * @see 1Depth를 List 로, 2Depth 를 Contents 로 칭한다.
 */
Tw.ProductMobilePlanDowngradeGamePass = function (rootEl, openEvent, confirmCallback) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._openEvent = openEvent;
  this._confirmCallback = confirmCallback;
  this._isAllClose = false;

  this._init();
};

Tw.ProductMobilePlanDowngradeGamePass.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    this._popupService.open({
      hbs: 'dwg_guide_list_gamePass',
      layer: true
    }, $.proxy(this._bindEventListPopup, this), null, 'dg_1depth_list', this._openEvent);
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @param $popupContainer - 팝업 레이어
   */
  _bindEvent: function($popupContainer) {
    $popupContainer.on('click', '#game-2p-change', $.proxy(this._onChange, this));
    $popupContainer.on('click', '#game-2p-close', $.proxy(this._onClose, this));
  },

  /**
   * @function
   * @desc 이벤트 바인딩 - 1뎁스; 가이드 목록
   * @param $popupContainer - 팝업 레이어
   */
  _bindEventListPopup: function($popupContainer) {
    $popupContainer.on('click', '#game-1p-change', $.proxy(this._onDgContents, this));
    $popupContainer.on('click', '#game-1p-close', $.proxy(this._onClose, this));

    this.$listPopup = $popupContainer;
    this._bindEvent($popupContainer);
    new Tw.XtractorService($popupContainer);
  },

  /**
   * @function
   * @desc 이벤트 바인딩 - 2뎁스; 콘텐츠 페이지
   * @param $popupContainer - 팝업 레이어
   */
  _bindEventContentsPopup: function($popupContainer) {
    $popupContainer.on('click', '.popup-closeBtn', $.proxy(this._setAllClose, this));

    this.$contentsPopup = $popupContainer;
    this._bindEvent($popupContainer);
    new Tw.XtractorService($popupContainer);
  },

  /**
   * @function
   * @desc 이벤트 바인딩 - 2뎁스; 기타 이유
   * @param $popupContainer - 팝업 레이어
   */
  _bindEventCustomPopup: function($popupContainer) {
    $popupContainer.on('click', '.popup-closeBtn', $.proxy(this._setAllClose, this));

    this.$customPopup = $popupContainer;
    this._bindEvent($popupContainer);
    new Tw.XtractorService($popupContainer);
  },

  /**
   * @function
   * @desc 1뎁스 페이지에서 메뉴 선택시
   * @param e - 메뉴 클릭 이벤트
   * @returns {*|void}
   */
  _onDgContents: function(e) {7
    this._popupService.open({
      hbs: 'dwg_contents_gamepass',
      layer: true
    }, $.proxy(this._bindEventContentsPopup, this), $.proxy(this._onContentsClose, this), 'dg_2depth_contents', e);
  },

  /**
   * @function
   * @desc DG방어 프로세스 종료 선택 시
   */
  _setAllClose: function() {
    this._isAllClose = true;
  },

  /**
   * @function
   * @desc 변경 할게요 선택 시
   * @param e - 변경 할게요 버튼 클릭 이벤트
   */
  _onChange: function() {
    if (this._confirmCallback) {
      this._confirmCallback();
    }
  },

  /**
   * @function
   * @desc 다음에 할게요. 클릭 시 요금제 리스트로 이동
   */
  _onClose: function() {
    this._popupService.closeAll();    
  },

  /**
   * @function
   * @desc 2뎁스 팝업에서 종료 시
   */
  _onContentsClose: function() {
    if (!this._isAllClose) {
      return;
    }

    this._popupService.close();
  }

};
