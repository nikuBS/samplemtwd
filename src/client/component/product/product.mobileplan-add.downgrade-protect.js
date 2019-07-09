/**
 * @file product.mobileplan-add.downgrade-protect.js
 * @author kwon.junho (jihun202@sk.com)
 * @since 2019-04-18
 */

/**
 * @class
 * @desc 상품 > 요금제 > DG방어
 * @see 1Depth를 List 로, 2Depth 를 Contents 로 칭한다.
 */
Tw.ProductMobilePlanAddDowngradeProtect = function (rootEl, downGradeInfo, currentProdId, mbrNm, targetProdId, openEvent, confirmCallback) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;

  this._downGradeInfo = downGradeInfo;
  this._currentProdId = currentProdId;
  this._mbrNm = mbrNm;
  this._targetProdId = targetProdId;
  this._openEvent = openEvent;
  this._confirmCallback = confirmCallback;
  this._isAllClose = false;

  this._init();
};

Tw.ProductMobilePlanAddDowngradeProtect.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    this._popupService.open({
      hbs: 'dwg_guide_list',
      type: this._downGradeInfo.type,
      titleNm: this._downGradeInfo.titleNm,
      titleClass: Tw.FormatHelper.isEmpty(this._downGradeInfo.titleNm) ? 'no-header color-type-list' : '',
      dwgHtml: this._replaceData(this._downGradeInfo.guidMsgCtt),
      layer: true
    }, $.proxy(this._bindEventListPopup, this), null, 'dg_1depth_list', this._openEvent);
  },

  /**
   * @function
   * @desc 팝업 내 Context 에 데이터 replace
   * @param context - hbs Context
   * @returns {*}
   */
  _replaceData: function(context) {
    context = context.replace(/{{name}}/gi, this._mbrNm);
    return context;
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
    $popupContainer.on('keyup input', 'textarea', $.proxy(this._onCustomTextarea, this));
    $popupContainer.on('click', 'textarea', $.proxy(this._onClickCustomTextarea, this));
    $popupContainer.on('click', '.fe-btn_apply', $.proxy(this._onApplyCustom, this));

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
      contents = $elem.data('dg_contents');

    // 기타 이유
    if (contents === 'CUSTOM') {
      return this._onCustomDgContents(e);
    }

    this._apiService.request(Tw.NODE_CMD.GET_DOWNGRADE, {
      value: this._currentProdId + '/' + this._targetProdId + '/' + contents,
      type_yn: 'Y'
    }, {}).done($.proxy(this._resDgContents, this, contents, e));
  },

  /**
   * @function
   * @desc 기타 이유 팝업 실행
   * @param e - 기타 이유 클릭 이벤트
   */
  _onCustomDgContents: function(e) {
    this._popupService.open({
      hbs: 'dwg_custom',
      layer: true
    }, $.proxy(this._bindEventCustomPopup, this), $.proxy(this._onContentsClose, this), 'dg_2depth_custom', e);
  },

  /**
   * @function
   * @desc 기타 이유 버튼 영역 토글
   * @param e - 기타 이유 입력란 change|input Event
   */
  _onCustomTextarea: function(e) {
    var $elem = $(e.currentTarget);

    this.$customPopup.find('.fe-dwg_apply_button_wrap').show();
    this.$customPopup.find('.fe-dwg_button_wrap').hide();

    if ($elem.val().length > 4) {
      this.$customPopup.find('.fe-btn_apply').removeAttr('disabled').prop('disabled', false);
    } else {
      this.$customPopup.find('.fe-btn_apply').attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 기타 이유 입력란 클릭 시
   */
  _onClickCustomTextarea: function() {
    this.$customPopup.find('.fe-dwg_apply_button_wrap').show();
    this.$customPopup.find('.fe-dwg_button_wrap').hide();
  },

  /**
   * @function
   * @desc 기타 이유 입력 버튼 클릭 시
   */
  _onApplyCustom: function() {
    this.$customPopup.find('.fe-dwg_apply_button_wrap').hide();
    this.$customPopup.find('.fe-dwg_button_wrap').show();
  },

  /**
   * @function
   * @desc DG방어 콘텐츠 조회 응답시 처리
   * @param contents - 콘텐츠 TYPE 값
   * @param e - 콘텐츠 클릭 이벤트
   * @param resp - 콘텐츠 조회 응답 값
   * @returns {*}
   */
  _resDgContents: function(contents, e, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open({
      hbs: 'dwg_contents',
      titleNm: resp.result.titleNm,
      dwgHtml: this._replaceData(resp.result.guidMsgCtt),
      titleClass: Tw.FormatHelper.isEmpty(resp.result.titleNm) ? 'no-header color-type-' + contents.toLowerCase() : '',
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
  _onChange: function(e) {
    var isCustom = $(e.currentTarget).data('is_custom');

    // 기타 이유 서버에 전송!
    if (isCustom === 'Y') {
      // BE API 요청
      // this._apiService.request(Tw.API_CMD.BFF_10_0000, {});
    }

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
