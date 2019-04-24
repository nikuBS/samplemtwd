/**
 * @file 상품 > 유선 부가서비스 > 가입 > 발신번호표시
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
Tw.ProductWireplanJoinShowSender = function(rootEl, prodId, displayId, confirmOptions, btnData) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));
  this._btnData = JSON.parse(window.unescape(btnData));

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductWireplanJoinShowSender.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$inputRadio = this.$container.find('.fe-radio');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$inputRadio.on('change', $.proxy(this._checkSetupButton, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));
  },

  /**
   * @function
   * @desc 설정 완료 버튼 활성화 여부 산출
   */
  _checkSetupButton: function() {
    this._toggleSetupButton(this.$container.find('input[type=radio]:checked').length > 0);
  },

  /**
   * @function
   * @desc 설정 완료 버튼 토글
   * @param isEnable - 활성화 여부
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
   * @desc 정보확인 데이터 변환
   */
  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      pageId: 'M000433',
      isTerm: false,
      isNoticeList: true,
      isWireplan: true,
      isWidgetInit: true,
      isPcJoin: false,
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
   * @desc 정보확인 팝업 아이콘 분기 처리
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
   * @desc 정보확인 hbs
   */
  _procConfirm: function() {
    this._popupService.open($.extend(this._confirmOptions, {
      hbs: 'product_wireplan_confirm',
      layer: true
    }), $.proxy(this._bindConfirm, this));
  },

  /**
   * @function
   * @desc 정보확인 공통 컴포넌트 실행
   * @param $popupContainer - 정보확인 hbs Context
   */
  _bindConfirm: function($popupContainer) {
    new Tw.ProductCommonConfirm(false, $popupContainer, this._confirmOptions, $.proxy(this._prodConfirmOk, this));
  },

  /**
   * @function
   * @desc 정보확인 공통 콜백 & 가입 처리 API 요청
   */
  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0099, {
      addInfoExistYn: this._btnData.addInfoExistYn,
      addInfoRelScrnId: this._btnData.addInfoRelScrnId,
      addSvcAddYn: this._btnData.addSvcAddYn,
      cntcPlcInfoRgstYn: this._btnData.cntcPlcInfoRgstYn,
      svcProdGrpCd: this._btnData.svcProdGrpCd,
      opCtt1: this.$container.find('input[type=radio]:checked').val()
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 가입 처리 API 응답
   * @param resp - API 응답 값
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

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
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
