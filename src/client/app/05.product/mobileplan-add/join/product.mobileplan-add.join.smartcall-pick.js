/**
 * @file 모바일 부가서비스 > 스마트콜Pick 가입
 * @author
 * @since 2019-09-30
 */

/**
 * @class
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 * @oaram {String} prodId 상품ID
 * @param {String} displayId 화면ID
 */
Tw.ProductMobileplanAddJoinSmartCallPick = function (rootEl, prodId, displayId) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this.$container = rootEl;
  this._prodId = prodId;
  this._displayId = displayId;
  this._checkedSvnNum = null;
  this._confirmOptions = {};

  this._cachedElement();
  this._bindEvent();
  // 최초 동작
  this._init();
};

Tw.ProductMobileplanAddJoinSmartCallPick.prototype = {

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$selectGroup1 = this.$container.find('.select_group1');
    this.$selectGroup2 = this.$container.find('.select_group2');
    this.$clickCheckBox = this.$container.find('input[name=subprod]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$selectedCnt = this.$container.find('#selectedCnt');

  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$selectGroup1.on('click', $.proxy(this._selectRecommendProd, this));
    this.$clickCheckBox.on('click', $.proxy(this._clickCheckBox, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function () {
    this.$selectGroup1.addClass('checked').prop('aria-checked', true).children().prop('checked', true);
    this._selectRecommendProd();
  },

  /**
   * @function
   * @desc 스마트콜Pick 추천팩 상품 체크
   */
  _selectRecommendProd: function () {
    this._selectedProdCancel();
    this.$container.find('.sub_prod01').prop('checked', true).parent().addClass('checked').prop('aria-checked', true);
    this.$container.find('.sub_prod02').prop('checked', true).parent().addClass('checked').prop('aria-checked', true);
    this.$container.find('.sub_prod03').prop('checked', true).parent().addClass('checked').prop('aria-checked', true);
    this.$container.find('.sub_prod06').prop('checked', true).parent().addClass('checked').prop('aria-checked', true);
    this.$container.find('.sub_prod10').prop('checked', true).parent().addClass('checked').prop('aria-checked', true);
    this._checkBoxCnt();
  },

  /**
   * @function
   * @desc 체크박스 해제
   */
  _selectedProdCancel: function () {
    this.$container.find('input[name=subprod]:checked').prop('checked', false).parent().removeClass('checked').prop('aria-checked', false);
    this._checkBoxCnt();
  },

  /**
   * @function
   * @desc 스마트콜Pick 개별상품 체크박스 클릭 시 추천팩 해제/내맘대로 상품 선택
   */
  _clickCheckBox: function () {
    if(this.$selectGroup1.find('.checked')){
      this.$selectGroup1.removeClass('checked').prop('aria-checked', false).children().prop('checked', false);
      this.$selectGroup2.addClass('checked').prop('aria-checked', true).children().prop('checked', true);
    }
    this._checkBoxCnt();
  },

  /**
   * @function
   * @desc 스마트콜Pick 개별상품 체크박스 선택 값 카운팅
   */
  _checkBoxCnt: function () {
    var checkBoxCnt = $('input[name=subprod]:checked').length;
    this.$selectedCnt.text(checkBoxCnt);
  },

  /**
   * @function
   * @desc 정보확인 데이터 변환
   * @param result - 정보확인 데이터
   * @returns {any | this | {isOverpayResult}}
   */
  _convConfirmOptions: function (result) {
    this._confirmOptions = Tw.ProductHelper.convAdditionsJoinTermInfo(result);

    $.extend(this._confirmOptions, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0),
      isMobilePlan: false,
      noticeList: this._confirmOptions.preinfo.joinNoticeList,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId]
      }]
    });

    return this._confirmOptions;
  },

  /**
   * @function
   * @desc 설정완료 API 요청
   */
  _procConfirm: function () {
    this.$btnSetupOk.prop('disabled', true);
    var checkBoxCnt = $('input[name=subprod]:checked').length;
    
    if(checkBoxCnt !== 5){
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A102.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A102.TITLE);
      return this.$btnSetupOk.prop('disabled', false);
    }
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this.$btnSetupOk.prop('disabled', false);

    this._apiService.request(Tw.API_CMD.BFF_10_0017, {
      joinTermCd: '01'
    }, {}, [this._prodId])
    .done($.proxy(this._procConfirmRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 설정완료 API 응답 값 처리, 공통 정보확인 팝업 호출
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procConfirmRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }
    new Tw.ProductCommonConfirm(true, null, this._convConfirmOptions(resp.result), $.proxy(this._prodConfirmOk, this));
  },

  /**
   * @function
   * @desc 정보확인 공통 컴포넌트 콜백 & 가입 처리 API 요청
   */
  _prodConfirmOk: function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    var checkProd = [];
    $('input[name=subprod]:checked').each(function(){
      checkProd.push($(this).val());
    });
    var smartKitProdList = checkProd.map(function(e){
      return {
        prodAddOpCtt1: e
      };
    });

    this._apiService.request(Tw.API_CMD.BFF_10_0018, {
      smartKitProdList: smartKitProdList
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 가입 처리 API 응답
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procJoinRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_10_0038, {
      scrbTermCd: 'S'
    }, {}, [this._prodId]).done($.proxy(this._isVasTerm, this));
  },

  /**
   * @function
   * @desc 가입유도팝업 조회 API 응답 값
   * @param resp - API 응답 값
   * @returns {*}
   */
  _isVasTerm: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      this._isResultPop = true;
      return this._openSuccessPop();
    }

    this._openVasTermPopup(resp.result);
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   */
  _openSuccessPop: function () {
    if (!this._isResultPop) {
      return;
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN}],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
          this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  /**
   * @function
   * @desc 완료팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindJoinResPopup: function ($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료팝업내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 가입유도팝업 실행
   * @param respResult - 가입유도팝업 API 응답 값
   */
  _openVasTermPopup: function (respResult) {
    var popupOptions = {
      hbs: 'MV_01_02_02_01',
      bt: [
        {
          style_class: 'unique fe-btn_back',
          txt: Tw.BUTTON_LABEL.CLOSE
        }
      ]
    };

    if (respResult.prodTmsgTypCd === 'H') {
      popupOptions = $.extend(popupOptions, {
        editor_html: Tw.CommonHelper.replaceCdnUrl(respResult.prodTmsgHtmlCtt)
      });
    }

    if (respResult.prodTmsgTypCd === 'I') {
      popupOptions = $.extend(popupOptions, {
        img_url: respResult.rgstImgUrl,
        img_src: Tw.Environment.cdn + respResult.imgFilePathNm
      });
    }

    this._isResultPop = true;
    this._popupService.open(popupOptions, $.proxy(this._bindVasTermPopupEvent, this), $.proxy(this._openSuccessPop, this), 'vasterm_pop');
  },

  /**
   * @function
   * @desc 가입유도팝업 이벤트 바인딩
   * @param $popupContainer - 가입유도팝업 컨테이너 레이어
   */
  _bindVasTermPopupEvent: function ($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
    new Tw.XtractorService(this.$container);
  },

  /**
   * @function
   * @desc 가입유도팝업 내 닫기 버튼 클릭 시
   */
  _closeAndOpenResultPopup: function () {
    this._isResultPop = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 가입유도팝업 내 닫기 버튼 클릭 시
   */
  _onClosePop: function () {
    this._historyService.goBack();
  }

};
