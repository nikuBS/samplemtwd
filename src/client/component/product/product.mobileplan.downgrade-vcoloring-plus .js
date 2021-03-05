/**
 * @file product.mobileplan.downgrade-vcoloring-plus.js
 * @author kimkisuk
 * @since 2021-03-05
 */

/**
 * @class
 * @desc 상품 > 요금제 > DG방어(V컬러링플러스)
 * @see 1Depth를 List 로, 2Depth 를 Contents 로 칭한다.
 */
Tw.ProductMobilePlanDowngradeVcoloringPlus = function (rootEl, openEvent, confirmCallback) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._openEvent = openEvent;
  this._confirmCallback = confirmCallback;
  this._isAllClose = false;

  this._init();
};

Tw.ProductMobilePlanDowngradeVcoloringPlus.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    this._popupService.open({
      hbs: 'dwg_guide_list_v_coloring_plus',
      layer: true
    }, $.proxy(this._bindEventListPopup, this), null, 'dg_1depth_list', this._openEvent);
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @param $popupContainer - 팝업 레이어
   */
  _bindEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_change', $.proxy(this._onChange, this));
    $popupContainer.on('click', '.fe-btn_close', $.proxy(this._onClose, this));
  },

  /**
   * @function
   * @desc 이벤트 바인딩 - 1뎁스; 가이드 목록
   * @param $popupContainer - 팝업 레이어
   */
  _bindEventListPopup: function($popupContainer) {
    $popupContainer.on('click', '[data-dg_contents]', $.proxy(this._onDgContents, this));
    this.$listPopup = $popupContainer;
    this._bindEvent($popupContainer);
  },

  /**
   * @function
   * @desc 이벤트 바인딩 - 2뎁스; 콘텐츠 페이지
   * @param $popupContainer - 팝업 레이어
   */
  _bindEventContentsPopup: function($popupContainer) {    
    $popupContainer.on('click', '.popup-closeBtn', $.proxy(this._setAllClose, this));
    $popupContainer.find('.dwg-typeImg-area').removeClass('pb0');
    this.$contentsPopup = $popupContainer;
    this._bindEvent($popupContainer);
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
  },

  /**
   * @function
   * @desc 1뎁스 페이지에서 메뉴 선택시
   * @param e - 메뉴 클릭 이벤트
   * @returns {*|void}
   */
  _onDgContents: function(e) {

    var $elem = $(e.currentTarget),
      contents = $elem.data('dg_contents'),
      img = null,
      imgAlt = null,
      data_xt_eid1 = null,
      data_xt_eid2 = null,
      data_xt_eid3 = null
      ;

    if(contents === 'A') {
      img = 'img_vc_cancel_05.png';
      imgAlt = 'V 컬러링 플러스는 통화할 때 필요한 다양한 서비스를 제공해 드려요. 01.상대방에 맞는 V 컬러링과 컬러링 콘텐츠 설정 가능-상대방별로 V 컬러링과 컬러링 콘텐츠를 설정하고, 반응을 확인해 보세요. 상대방과의 재미난 추억을 만들 수 있어요! 02.편리하고 안전한 통화 경험 제공-콜키퍼, 통화가능통보플러스, 안심문자를 통해  놓치는 연락이 없도록 도와 드려요. 또한,  T안심콜로 휴대폰 번호 유출을 막고, 개별통화수신거부를 통해 필요한 연락만 받을 수 있어요.';
      data_xt_eid1 = 'CMMA_A4_B16_C80_D166-5';
      data_xt_eid2 = 'CMMA_A4_B16_C80_D166-6';
      data_xt_eid3 = 'CMMA_A4_B16_C80_D166-4';
    
    } else if(contents === 'B') {
      img = 'img_vc_cancel_06.png';
      imgAlt = '합리적인 가격에 V 컬러링 플러스를 경험하실 수 있어요. 01.할인 및 프로모션 혜택 제공-패키지 할인(정상 요금 대비 60% 할인)은 물론 100원 프로모션과 월정액 할인 프로모션도 진행 중이니, 혜택을 누려 보세요! 02.일부 V 컬러링 유료 콘텐츠(개당 1,650원) 무료 제공-매달 업데이트되는 다양한 V 컬러링의 유료 콘텐츠 중 일부를 무료로 이용할 수 있어요.';
      data_xt_eid1 = 'CMMA_A4_B16_C80_D166-8';
      data_xt_eid2 = 'CMMA_A4_B16_C80_D166-9';
      data_xt_eid3 = 'CMMA_A4_B16_C80_D166-7';
    } 

    this._popupService.open({
      hbs: 'dwg_contents_vcoloring',
      img: img,
      imgAlt: imgAlt,
      data_xt_eid1: data_xt_eid1,
      data_xt_eid2: data_xt_eid2,
      data_xt_eid3: data_xt_eid3,
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
    this._popupService.closeAll();    
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
    setTimeout($.proxy(function() {
      this._historyService.goLoad('/product/callplan?prod_id=NA00007246');
    }, this));
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
