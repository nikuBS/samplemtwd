/**
 * @file 상품 > 유선 부가서비스 > 가입 > 기본정보 입력 Case
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-02-14
 * @todo 개발은 완료 되었으나 Spec-out 되어 미사용 중
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면ID
 * @param confirmOptions - 정보확인 데이터
 * @param btnData - 버튼 데이터
 */
Tw.ProductWireplanJoinBasicInfo = function(rootEl, prodId, displayId, confirmOptions, btnData) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));
  this._btnData = JSON.parse(window.unescape(btnData));

  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();

  // forward & back 진입 차단
  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductWireplanJoinBasicInfo.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$inputPhone = this.$container.find('.fe-num_phone');
    this.$inputCellPhone = this.$container.find('.fe-num_cellphone');
    this.$inputEmail = this.$container.find('.fe-email');

    this.$btnClear = this.$container.find('.fe-btn_clear');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$inputPhone.on('keyup input', $.proxy(this._detectInputNumber, this, 10));
    this.$inputCellPhone.on('keyup input', $.proxy(this._detectInputNumber, this, 11));
    this.$inputEmail.on('keyup input', $.proxy(this._detectInputEmail, this));

    this.$container.on('blur', 'input[type=tel]', $.proxy(this._blurInputNumber, this));
    this.$container.on('focus', 'input[type=tel]', $.proxy(this._focusInputNumber, this));

    this.$btnClear.on('click', $.proxy(this._clear, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));
  },

  /**
   * @function
   * @desc 번호 입력값 keyup|input 시
   * @param maxLength - 최대 입력 가능 값
   * @param e - keyup|input Event
   */
  _detectInputNumber: function(maxLength, e) {
    var $elem = $(e.currentTarget);
    $elem.val($elem.val().replace(/[^0-9]/g, ''));

    if ($elem.val().length > maxLength) {
      $elem.val($elem.val().substr(0, maxLength));
    }

    this._toggleClearBtn($elem);
    this._checkSetupButton();
  },

  /**
   * @function
   * @desc E-mail 입력란 keyup|input Event 시
   */
  _detectInputEmail: function() {
    this._toggleClearBtn(this.$inputEmail);
    this._checkSetupButton();
  },

  /**
   * @function
   * @desc 설정완료 버튼 토글 여부 산출
   */
  _checkSetupButton: function() {
    var isEnableSetupButton = true;

    if (this.$inputPhone.val().length < 9 && !Tw.ValidationHelper.isTelephone(this.$inputPhone.val())) {
      isEnableSetupButton = false;
    }

    if (this.$inputCellPhone.val().length < 10 && !Tw.ValidationHelper.isCellPhone(this.$inputCellPhone.val())) {
      isEnableSetupButton = false;
    }

    if (!Tw.ValidationHelper.isEmail(this.$inputEmail.val())) {
      isEnableSetupButton = false;
    }

    this._toggleSetupButton(isEnableSetupButton);
  },

  /**
   * @function
   * @desc 설정 완료 버튼 토글 처리
   * @param isEnable - 설정 완료 버튼 토글 여부
   */
  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 회선 번호 입력 란 blur Event 시
   * @param e - blur Event
   */
  _blurInputNumber: function(e) {
    var $elem = $(e.currentTarget);
    $elem.val(Tw.FormatHelper.conTelFormatWithDash($elem.val()));
  },

  /**
   * @function
   * @desc 회선 번호 입력 란 focus Event 시
   * @param e - focus Event
   */
  _focusInputNumber: function(e) {
    var $elem = $(e.currentTarget);
    $elem.val($elem.val().replace(/-/gi, ''));
  },

  /**
   * @function
   * @desc 회선 번호 입력 란 삭제 버튼 클릭 시
   * @param e - 삭제 버튼 클릭 이벤트
   */
  _clear: function(e) {
    var $elem = $(e.currentTarget);

    $elem.parent().find('input').val('');
    $elem.hide().attr('aria-hidden', 'true');

    this._checkSetupButton();
  },

  /**
   * @function
   * @desc 회선 번호 입력 란 삭제 버튼 display none|block 처리
   * @param $elem - 삭제 버튼
   */
  _toggleClearBtn: function($elem) {
    if ($elem.val().length > 0) {
      $elem.parent().find('.fe-btn_clear').show().attr('aria-hidden', 'false');
    } else {
      $elem.parent().find('.fe-btn_clear').hide().attr('aria-hidden', 'true');
    }
  },

  /**
   * @function
   * @desc 정보 확인 데이터 변환
   */
  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      pageId: 'M000433',
      isTerm: false,
      isNoticeList: true,
      isWireplan: true,
      isWidgetInit: true,
      isPcJoin: true,
      title: Tw.PRODUCT_TYPE_NM.JOIN,
      applyBtnText: Tw.BUTTON_LABEL.JOIN,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: this._confirmOptions.preinfo.reqProdInfo.svcCd === 'P' ?
        Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask) : this._confirmOptions.preinfo.svcNumMask,
      svcNickname: Tw.SVC_CD[this._confirmOptions.preinfo.reqProdInfo.svcCd],
      noticeList: this._confirmOptions.noticeList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0),
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE.INFO_SETTING_SUCCESS
      }],
      iconClass: this._getIcon()
    });
  },

  /**
   * @function
   * @desc 정보 확인 팝업 내 아이콘 분기처리
   * @returns {string}
   */
  _getIcon: function() {
    if (this._confirmOptions.preinfo.reqProdInfo.svcCd === 'P') {
      return 'ico-type2';
    }

    return 'ico-type1';
  },

  /**
   * @function
   * @desc 정보 확인 레이어 실행
   */
  _procConfirm: function() {
    this._popupService.open($.extend(this._confirmOptions, {
      hbs: 'product_wireplan_confirm',
      layer: true
    }), $.proxy(this._bindConfirm, this));
  },

  /**
   * @function
   * @desc 공통 정보확인 컴포넌트 실행 (isPopup false)
   * @param $popupContainer - 유선부가서비스용 hbs Context
   */
  _bindConfirm: function($popupContainer) {
    new Tw.ProductCommonConfirm(false, $popupContainer, this._confirmOptions, $.proxy(this._prodConfirmOk, this));
  },

  /**
   * @function
   * @desc 공통 정보확인 콜백 처리 & 가입 요청 API 처리
   */
  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0099, {
      addInfoExistYn: this._btnData.addInfoExistYn,
      addInfoRelScrnId: this._btnData.addInfoRelScrnId,
      addSvcAddYn: this._btnData.addSvcAddYn,
      cntcPlcInfoRgstYn: this._btnData.cntcPlcInfoRgstYn,
      svcProdGrpCd: this._btnData.svcProdGrpCd,
      email: this.$inputEmail.val(),
      mobileNum: this.$inputCellPhone.val(),
      phoneNum: this.$inputPhone.val()
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 유선 부가서비스 가입 처리 API 응답 결과
   * @param resp - API 응답 결과
   * @returns {*}
   */
  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    setTimeout($.proxy(this._openSuccessPop, this), 100);
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   */
  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{ link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo ?
          this._confirmOptions.preinfo.reqProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');
  },

  /**
   * @function
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindJoinResPopup: function($popupContainer) {
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
