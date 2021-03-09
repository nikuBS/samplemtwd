/**
 * @file product.mobileplan.downgrade-vcoloring.js
 * @author
 * @since 2020-12-16
 */

/**
 * @class
 * @desc 상품 > 요금제 > DG방어(V컬러링)
 * @see 1Depth를 List 로, 2Depth 를 Contents 로 칭한다.
 */
Tw.ProductMobilePlanDowngradeVcoloring = function (rootEl, openEvent, confirmCallback) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._openEvent = openEvent;
  this._confirmCallback = confirmCallback;
  this._isAllClose = false;

  this._init();
};

Tw.ProductMobilePlanDowngradeVcoloring.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    this._popupService.open({
      hbs: 'dwg_guide_list_v_coloring',
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
  _onDgContents: function(e) {

    var $elem = $(e.currentTarget),
      contents = $elem.data('dg_contents'),
      img = null,
      imgAlt = null,
      data_xt_eid1 = null,
      data_xt_eid2 = null
      ;

    if(contents === 'A') {
      img = 'img_vc_cancel_01.png';
      imgAlt = 'V 컬러링을 계속 이용하면 다양한 혜택을 받으실 수 있어요. 01.음성 컬러링(월 990원) 무료 제공 - 컬러링을 더욱 풍성하게 이용할수 있어요. 02.일부 유료컨텐츠(개당1,650원) 무료제공 - 매달 업데이트되는 다양한 유료 컨텐츠중 일부를 무료로 이용할 수 있어요.';
      data_xt_eid1 = 'CMMA_A4_B16_C79-43';
      data_xt_eid2 = 'CMMA_A4_B16_C79-44';
    
    } else if(contents === 'B') {
      img = 'img_vc_cancel_02.png';
      imgAlt = '더욱 다양해진 V 컬러링 콘텐츠를 경험하실 수 있어요. 01.신규 카테고리 확대 예정 - 셀럽,  캐릭터,  웹툰, 영화 등 다양한 인기 콘텐츠가 계속 추가될 예정이에요. 02-무료 이용 기회 - 매달 업데이트되는 다양한 유료 컨텐츠중 일부를 무료로 이용할 수 있어요. 03.원하는 콘텐츠 제작 및 설정 가능 - 직접 제작한 나만의 영상을 설정할 수 있어요.';
      data_xt_eid1 = 'CMMA_A4_B16_C79-45';
      data_xt_eid2 = 'CMMA_A4_B16_C79-46';
    } else {
      img = 'img_vc_cancel_03.png';
      imgAlt = 'V 컬러링 이용에 제약이 없도록 준비하고 있어요. 01.T전화가 아니어도 V 컬러링 확인 가능 - 곧 기본 전화 앱에서도 V 컬러링을 즐길 수 있어요. (2021년 상반기 적용 예정) 02.모든 통신사 고객님께 제공 예정 - 다른 통신사 고객님도 V 컬러링을 이용할 수 있도록 준비하고 있어요.';
      data_xt_eid1 = 'CMMA_A4_B16_C79-47';
      data_xt_eid2 = 'CMMA_A4_B16_C79-48';
    }

    this._popupService.open({
      hbs: 'dwg_contents_vcoloring',
      img: img,
      imgAlt: imgAlt,
      data_xt_eid1: data_xt_eid1,
      data_xt_eid2: data_xt_eid2,
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
