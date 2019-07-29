/**
 * @file 상품 > 모바일요금제 > 설정 > 0플랜 라지
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-14
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면 ID
 * @param currentOptionProdId - 현재 옵션 상품코드
 */
Tw.ProductMobileplanSetting0plan = function(rootEl, prodId, displayId, currentOptionProdId, floNDataUseYn, pooqNDataUseYn) {
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
  this._currentOptionProdId = currentOptionProdId;
  this._floNDataUseYn = floNDataUseYn;
  this._pooqNDataUseYn = pooqNDataUseYn;

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();

  // 최초 동작
  this._init();
};

Tw.ProductMobileplanSetting0plan.prototype = {

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
   * @desc 설정완료 버튼 클릭 시, 설정 변경 API 요청
   * @returns {*|void}
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
   * @desc 설정 완료 API 응답 처리 & 인증팝업 노출여부 체크(인증팝업 불필요시 완료팝업 실행)
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procSetupOkRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    if( !(this._floNDataUseYn === 'N' && 'NA00006634' === $checked.val()) && !(this._pooqNDataUseYn === 'N' && 'NA00006622' === $checked.val()) ){
      this._isResultPop = true;
      return this._openSuccessPop();
    }

    this._openAddCertifyPopup();
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   */
  _openSuccessPop: function() {
    if (!this._isResultPop) {
      return;
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
   * @param $popupContainer
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

    if($(e.currentTarget).hasClass('fe-link-external')
      && $(e.currentTarget).attr('href').indexOf('#') !== 0) {
      this._confirmExternalUrl(e);
      this._popupService.close();
    } else {
      this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
    }
  },

  /**
   * @function
   * @desc 인증유도팝업 실행
   */
  _openAddCertifyPopup: function () {
    var popupOptions;
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');
  
    if(this._floNDataUseYn === 'N' && 'NA00006634' === $checked.val()) {
      popupOptions = {
        hbs: 'MV_01_02_02_01_case01',
        editor_html : '<div class="tod-popbenf-inwrap" style="border-bottom:1px solid transparent"><img src="'+Tw.Environment.cdn+'/img/product/img-banner-flo_m.png" alt="간단한 추가 인증을 완료해야 서비스 이용이 가능해요. * SMS로도 링크를 전송해드릴게요. 꼭 인증을 완료해주세요!" class="vt" style="width:100%"><div class="tod-popbenf-absbtn" style="left:14.55%;top:69.4%;width:70.9%;height:11.2%"><a href="http://www.music-flo.com/purchase/skt" target="_blank" title="새창" class="fe-link-external"><span class="blind">인증하기</span></a></div></div>',
        bt: [
          {
            style_class: 'unique fe-btn_back',
            txt: '닫기'
          }
        ]
      };
      this._isResultPop = true;
      this._popupService.open(popupOptions, $.proxy(this._bindAddCertifyPopupEvent, this), $.proxy(this._openSuccessPop, this), 'addcertify_pop');

    }else if(this._pooqNDataUseYn === 'N' && 'NA00006622' === $checked.val()){
      popupOptions = {
        hbs: 'MV_01_02_02_01_case01',
        editor_html : '<div class="tod-popbenf-inwrap" style="border-bottom:1px solid transparent"><img src="'+Tw.Environment.cdn+'/img/product/img-banner-pooq03_m.png" alt="간단한 추가 인증을 완료해야 서비스 이용이 가능해요. * SMS로도 링크를 전송해드릴게요. 꼭 인증을 완료해주세요!" class="vt" style="width:100%"><div class="tod-popbenf-absbtn" style="left:14.55%;top:69.4%;width:70.9%;height:11.2%"><a href="https://member.pooq.co.kr/skt" target="_blank" title="새창" class="fe-link-external"><span class="blind">인증하기</span></a></div></div>',
        bt: [
          {
            style_class: 'unique fe-btn_back',
            txt: '닫기'
          }
        ]
      };
      this._isResultPop = true;
      this._popupService.open(popupOptions, $.proxy(this._bindAddCertifyPopupEvent, this), $.proxy(this._openSuccessPop, this), 'addcertify_pop');
    }
  },

  /**
   * @function
   * @desc 인증유도팝업 이벤트 바인딩
   * @param $popupContainer - 인증유도팝업 컨테이너 레이어
   */
  _bindAddCertifyPopupEvent: function ($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
    new Tw.XtractorService(this.$container);
  },

  /**
   * @function
   * @desc 인증유도팝업 내 닫기 버튼 클릭 시
   */
  _closeAndOpenResultPopup: function () {
    this._isResultPop = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료 팝업내 닫기 버튼 클릭 시
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
  },

  /**
   * @function
   * @desc 외부 링크 지원
   * @param e - 클릭 이벤트
   * @returns {*|void}
   */
  _confirmExternalUrl: function(e) {

    e.preventDefault();
    e.stopPropagation();

    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  /**
   * @function
   * @desc 외부 링크 실행
   * @param href - 링크 값
   */
  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  }

};
