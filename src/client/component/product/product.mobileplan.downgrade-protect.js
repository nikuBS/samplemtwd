/**
 * @file product.mobileplan.downgrade-protect.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-04-18
 */

/**
 * @class
 * @desc 상품 > 요금제 > DG방어
 * @see 1Depth를 List 로, 2Depth 를 Contents 로 칭한다.
 */
Tw.ProductMobilePlanDowngradeProtect = function (rootEl, downGradeInfo, currentProdId, mbrNm, targetProdId, openEvent, confirmCallback) {
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

Tw.ProductMobilePlanDowngradeProtect.prototype = {

  _init: function() {
    this._popupService.open({
      hbs: 'dwg_guide_list',
      type: this._downGradeInfo.type,
      titleNm: this._downGradeInfo.titleNm,
      titleClass: Tw.FormatHelper.isEmpty(this._downGradeInfo.titleNm) ? 'no-header color-type-list' : '',
      dwgHtml: this._replaceData(this._downGradeInfo.guidMsgCtt),
      isBtnWrap: this._downGradeInfo.type === 'D2',
      layer: true
    }, $.proxy(this._bindEventListPopup, this), null, 'dg_1depth_list', this._openEvent);
  },

  _replaceData: function(context) {
    context = context.replace(/{{name}}/gi, this._mbrNm);
    return context;
  },

  _bindEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_change', $.proxy(this._onChange, this));
    $popupContainer.on('click', '.fe-btn_close', $.proxy(this._onClose, this));
  },

  _bindEventListPopup: function($popupContainer) {
    $popupContainer.on('click', '[data-dg_contents]', $.proxy(this._onDgContents, this));

    this.$listPopup = $popupContainer;
    this._bindEvent($popupContainer);
    new Tw.XtractorService($popupContainer);
  },

  _bindEventContentsPopup: function($popupContainer) {
    $popupContainer.on('click', '.popup-closeBtn,.fe-btn_close', $.proxy(this._setAllClose, this));

    this.$contentsPopup = $popupContainer;
    this._bindEvent($popupContainer);
    new Tw.XtractorService($popupContainer);
  },

  _bindEventCustomPopup: function($popupContainer) {
    $popupContainer.on('click', '.popup-closeBtn,.fe-btn_close', $.proxy(this._setAllClose, this));
    $popupContainer.on('keyup input', 'textarea', $.proxy(this._onCustomTextarea, this));
    $popupContainer.on('click', 'textarea', $.proxy(this._onClickCustomTextarea, this));
    $popupContainer.on('click', '.fe-btn_apply', $.proxy(this._onApplyCustom, this));

    this.$customPopup = $popupContainer;
    this._bindEvent($popupContainer);
    new Tw.XtractorService($popupContainer);
  },

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

  _onCustomDgContents: function(e) {
    this._popupService.open({
      hbs: 'dwg_custom',
      layer: true
    }, $.proxy(this._bindEventCustomPopup, this), $.proxy(this._onContentsClose, this), 'dg_2depth_custom', e);
  },

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

  _onClickCustomTextarea: function() {
    this.$customPopup.find('.fe-dwg_apply_button_wrap').show();
    this.$customPopup.find('.fe-dwg_button_wrap').hide();
  },

  _onApplyCustom: function() {
    this.$customPopup.find('.fe-dwg_apply_button_wrap').hide();
    this.$customPopup.find('.fe-dwg_button_wrap').show();
  },

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

  _setAllClose: function() {
    this._isAllClose = true;
  },

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

  _onClose: function() {
    this._popupService.close();
  },

  _onContentsClose: function() {
    if (!this._isAllClose) {
      return;
    }

    this._popupService.close();
  }

};
