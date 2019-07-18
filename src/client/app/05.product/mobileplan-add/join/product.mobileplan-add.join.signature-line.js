/**
 * @file 상품 > 모바일부가서비스 > 가입 > 시그니처 워치
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-09
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면ID
 * @param confirmOptions - 정보확인 데이터
 */
Tw.ProductMobileplanAddJoinSignatureLine = function(rootEl, prodId, displayId, confirmOptions) {
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
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));

  // back & forward 진입 차단
  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();

  // 정보확인 데이터 변환
  this._convConfirmOptions();
};

Tw.ProductMobileplanAddJoinSignatureLine.prototype = {

  /* 회선 목록 */
  _data: {
    addList: []
  },

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$inputNumber = this.$container.find('.fe-num_input');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },

  /**
   * @function
   * @desc 회선 번호 입력란 keyup|input Event
   * @param e - keyup|input Event
   * @returns {*|void}
   */
  _detectInputNumber: function(e) {
    if (Tw.InputHelper.isEnter(e)) {
      this.$btnAddNum.trigger('click');
      return;
    }

    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9]/g, ''));

    if (this.$inputNumber.val().length > 11) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 11));
    }

    this._toggleClearBtn();
    this._toggleSetupButton(Tw.ValidationHelper.isCellPhone(this.$inputNumber.val()));
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
   * @desc 회선 번호 입력 란 blur Event
   */
  _blurInputNumber: function() {
    this.$inputNumber.val(Tw.FormatHelper.conTelFormatWithDash(this.$inputNumber.val()));
  },

  /**
   * @function
   * @desc 회선 번호 입력 란 focus Event
   */
  _focusInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  /**
   * @function
   * @desc 회선 번호 입력 란 삭제 버튼 클릭 시
   */
  _clearNum: function() {
    this.$inputNumber.val('');
    this.$btnClearNum.hide().attr('aria-hidden', 'true');
    this._toggleSetupButton(false);
  },

  /**
   * @function
   * @desc 회선 번호 입력 란 삭제 버튼 display none|block
   */
  _toggleClearBtn: function() {
    if (this.$inputNumber.val().length > 0) {
      this.$btnClearNum.show().attr('aria-hidden', 'false');
    } else {
      this.$btnClearNum.hide().attr('aria-hidden', 'true');
    }
  },

  /**
   * @function
   * @desc 가입 요청 처리시에 필요한 회선 번호 포맷 산출
   * @param number - 회선 번호
   * @returns {{serviceNumber1: string, serviceNumber3: string, serviceNumber2: string}}
   */
  _getServiceNumberFormat: function(number) {
    if (number.length === 10) {
      return {
        serviceNumber1: number.substr(0, 3),
        serviceNumber2: number.substr(3, 3),
        serviceNumber3: number.substr(6, 4)
      };
    }

    return {
      serviceNumber1: number.substr(0, 3),
      serviceNumber2: number.substr(3, 4),
      serviceNumber3: number.substr(7, 4)
    };
  },

  /**
   * @function
   * @desc 가입 요청 처리시에 필요한 회선 번호 포맷 산출
   * @returns {Array}
   */
  _getSvcNumList: function() {
    return [
      this._getServiceNumberFormat(this.$inputNumber.val().replace(/-/gi, ''))
    ];
  },

  /**
   * @function
   * @desc 정보확인 데이터 변환
   */
  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0)
    });
  },

  /**
   * @function
   * @desc 정보확인 공통 컴포넌트 실행
   */
  _procConfirm: function() {
    new Tw.ProductCommonConfirm(true, null, $.extend(this._confirmOptions, {
      isMobilePlan: false,
      noticeList: this._confirmOptions.preinfo.joinNoticeList,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId] + ' 1' + Tw.PRODUCT_JOIN_SETTING_AREA_CASE.LINE
      }]
    }), $.proxy(this._prodConfirmOk, this));
  },

  /**
   * @function
   * @desc 정보확인 공통 컴포넌트 콜백 & 가입 처리 API 요청
   */
  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0018, {
      svcNumList: this._getSvcNumList()
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 가입처리 API 응답 처리 & 가입유도팝업 조회 API 요청
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procJoinRes: function(resp) {
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
   * @desc 가입유도팝업 조회 API 응답 처리
   * @param resp - API 응답 값
   * @returns {*}
   */
  _isVasTerm: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      this._isResultPop = true;
      return this._openSuccessPop();
    }

    this._openVasTermPopup(resp.result);
  },

  /**
   * @function
   * @desc 완료팝업 실행
   */
  _openSuccessPop: function() {
    if (!this._isResultPop) {
      return;
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{ link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
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
   * @param $popupContainer - 완료팝업 컨테이너 레이어
   */
  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료팝업 내 A 하이퍼링크 클릭 시
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 가입유도팝업 실행
   * @param respResult - 가입유도팝업 API 응답 값
   */
  _openVasTermPopup: function(respResult) {
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
  _bindVasTermPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
    new Tw.XtractorService(this.$container);
  },

  /**
   * @function
   * @desc 가입유도팝업 내 닫기 버튼 클릭 시
   */
  _closeAndOpenResultPopup: function() {
    this._isResultPop = true;
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
