/**
 * @file 상품 > 모바일요금제 > 설정 > Data 인피니티
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-14
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면ID
 * @param currentBenefitProdId - 현재 사용중인 옵션 상품코드
 * @param watchInfo - 결합된 스마트워치 정보
 */
Tw.ProductMobileplanSettingTplan = function(rootEl, prodId, displayId, currentBenefitProdId, watchInfo) {
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
  this._currentBenefitProdId = currentBenefitProdId;
  this._watchInfo = JSON.parse(watchInfo);
  this._smartWatchLine = null;
  this._smartWatchLineNumber = null;

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();
};

Tw.ProductMobileplanSettingTplan.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    if (this._historyService.isBack()) {
      this._historyService.goBack();
    }

    if (Tw.FormatHelper.isEmpty(this._currentBenefitProdId)) {
      return;
    }

    this.$container.find('input[value="' + this._currentBenefitProdId + '"]').trigger('click');
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

    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._init, this));
  },

  /**
   * @function
   * @desc 설정 완료 버튼 활성화
   * @param e - 옵션 Radio change Event
   * @returns {*|*|boolean}
   */
  _enableSetupButton: function(e) {
    if ($(e.currentTarget).val() === 'NA00006116' && this._currentBenefitProdId !== 'NA00006116') {
      return this._selectSmartWatchItem();
    } else {
      this._smartWatchLine = null;
    }

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  /**
   * @function
   * @desc 스마트워치 옵션 선택 시
   * @returns {boolean|*|void}
   */
  _selectSmartWatchItem: function() {
    this._isDisableSmartWatchLineInfo = false;
    this._smartWatchLine = null;
    this._smartWatchLineNumber = null;

    if (this._watchInfo.watchCase === 'C' || this._watchInfo.watchSvcList.length < 1) {
      return this._popupService.openConfirmButton(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A73.TITLE,
        $.proxy(this._enableSmartWatchLineInfo, this), $.proxy(this._procClearSmartWatchLineInfo, this), Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    }

    if (this._watchInfo.watchCase === 'B' && this._watchInfo.watchSvcList.length > 1) {
      return this._openSmartWatchLineSelectPopup();
    }

    if (this._watchInfo.watchCase === 'A') {
      return true;
    }

    this._smartWatchLine = this._watchInfo.watchSvcList[0].watchSvcMgmtNum;
    this._smartWatchLineNumber = Tw.FormatHelper.conTelFormatWithDash(this._watchInfo.watchSvcList[0].watchSvcNumMask);
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);

    return true;
  },

  /**
   * @function
   * @desc 결합가능한 스마트워치 회선이 없어도 해당 옵션을 선택하고자 할 때
   */
  _enableSmartWatchLineInfo: function() {
    this._isDisableSmartWatchLineInfo = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 옵션 선택 값을 초기화 (결합 가능한 스마트워치 회선이 없어 옵션 선택을 취소 할 떄)
   */
  _procClearSmartWatchLineInfo: function() {
    if (this._isDisableSmartWatchLineInfo) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
      return;
    }

    this._clearSelectItem();
  },

  /**
   * @function
   * @desc 스마트워치 회선 선택 팝업 실행
   */
  _openSmartWatchLineSelectPopup: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'title': Tw.POPUP_TITLE.TPLAN_SMARTWATCH,
          'list': this._watchInfo.watchSvcList.map($.proxy(this._getSmartWatchLineList, this))
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindSmartWatchLineSelectPopup, this), null, 'select_smart_watch_line_pop');
  },

  /**
   * @function
   * @desc 스마트워치 회선 목록 변환
   * @param item - 스마트워치 회선
   * @param idx - 인덱스 키
   * @returns {{txt: string | *, "radio-attr": string, "label-attr": string}}
   */
  _getSmartWatchLineList: function(item, idx) {
    return {
      'label-attr': 'id="ra' + idx + '"',
      'txt': Tw.FormatHelper.conTelFormatWithDash(item.watchSvcNumMask),
      'radio-attr': 'id="ra' + idx + '" data-num="' + item.watchSvcMgmtNum + '"' +
        ' data-svcnum="' + item.watchSvcNumMask + '" ' + (this._smartWatchLine === item.watchSvcMgmtNum ? 'checked' : '')
    };
  },

  /**
   * @function
   * @desc 스마트워치 회선 선택 팝업 이벤트 바인딩
   * @param $popupContainer - 팝업 컨테이너 레이어
   */
  _bindSmartWatchLineSelectPopup: function($popupContainer) {
    $popupContainer.on('click', '[data-num]', $.proxy(this._setSmartWatchLine, this));

    Tw.CommonHelper.focusOnActionSheet($popupContainer);
  },

  /**
   * @function
   * @desc 스마트워치 회선 선택 시
   * @param e - 회선 선택 클릭 이벤트
   */
  _setSmartWatchLine: function(e) {
    this._smartWatchLine = $(e.currentTarget).data('num');
    this._smartWatchLineNumber = $(e.currentTarget).data('svcnum');
    this._popupService.close();
  },

  /**
   * @function
   * @desc 옵션 선택 값 초기화
   */
  _clearSelectItem: function() {
    var $elem = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    $elem.prop('checked', false);
    $elem.parents('.radiobox').removeClass('checked').attr('aria-checked', 'false');

    this.$btnSetupOk.attr('disabled');
    this.$btnSetupOk.prop('disabled', true);
  },

  /**
   * @function
   * @desc 설정 완료 버튼 클릭 시 & 설정 변경 API 요청
   * @returns {*|void}
   */
  _procSetupOk: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    if ($checked.val() === 'NA00006117') {  // 2019.1.18 클럽 옵션 가입 종료
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A82.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A82.TITLE);
    }

    if (this._currentBenefitProdId === $checked.val()) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
    }

    var reqParams = {
      beforeTDiyGrCd: this._currentBenefitProdId,
      afterTDiyGrCd: $checked.val()
    };

    if (!Tw.FormatHelper.isEmpty(this._smartWatchLine) && $checked.val() === 'NA00006116') {
      reqParams = $.extend(reqParams, {
        watchSvcMgmtNum: this._smartWatchLine
      });
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0014, reqParams,
      {}, [$checked.val()]).done($.proxy(this._procSetupOkRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 설정 변경 API 응답 처리
   * @param resp - API 응답 값
   */
  _procSetupOkRes: function(resp) {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var completeData = {
      prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
      typeNm: Tw.PRODUCT_TYPE_NM.CHANGE,
      btList: $checked.val() === 'NA00006116' ? [{ link: '/product/callplan?prod_id=NA00005381', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.SMARTWATCH }] : [],
      btClass: 'item-one'
    };

    if ($checked.val() === 'NA00006116') {
      completeData = $.extend(completeData, {
        basicTxt: Tw.FormatHelper.isEmpty(this._smartWatchLineNumber) ? Tw.POPUP_CONTENTS.TPLAN_WATCH_NON_LINE :
          Tw.POPUP_CONTENTS.TPLAN_WATCH + this._smartWatchLineNumber
      });
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: completeData
    }, $.proxy(this._bindSuccessPopup, this), $.proxy(this._onClosePop, this), 'save_setting_success');
  },

  /**
   * @function
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindSuccessPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 완료 팝업 내 닫기 클릭 시
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
