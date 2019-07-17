/**
 * @file 상품 > 모바일부가서비스 > 가입 > 리모콘
 * @author Ji Hun Yang
 * @since 2018-11-15
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면ID
 * @param confirmOptions - 정보확인 데이터
 */
Tw.ProductMobileplanAddJoinRemotePwd = function(rootEl, prodId, displayId, confirmOptions) {
  // 컨테이너 레이어 선언
  this.$container = rootEl;

  // 공통 모듈 선언
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._validation = Tw.ValidationHelper;
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-btn_setup_ok'));
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

  // input password 대응
  this._procWebkitCheck();
};

Tw.ProductMobileplanAddJoinRemotePwd.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$inputPassword = this.$container.find('.fe-input-password');
    this.$confirmPassword = this.$container.find('.fe-confirm-password');
    this.$error0 = this.$container.find('.fe-error0');
    this.$error1 = this.$container.find('.fe-error1');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$btnCancel = this.$container.find('.fe-btn_cancel');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$container.on('keyup', 'input', $.proxy(this._checkIsAbled, this));
    this.$container.on('keypress keydown', 'input', $.proxy(this._preventDot, this));

    this.$btnCancel.on('click', $.proxy(this._clear, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));
  },

  /**
   * @function
   * @desc 입력란 내 삭제 버튼 클릭 동작 정의
   * @param e - 삭제 버튼 클릭 이벤트
   */
  _clear: function(e) {
    var $elem = $(e.currentTarget),
      $elemParent = $elem.parents('li');

    this._toggleError($elemParent.find('.error-txt'), false);
    this.$btnSetupOk.attr('disabled', 'disabled');

    if ($elemParent.find('input').hasClass('fe-input-password') && this.$confirmPassword.val().length > 0) {
      setTimeout(function() {
        this._isPasswordConfirmInputError(true);
      }.bind(this), 100);
    }
  },

  /**
   * @function
   * @desc webkit 환경이 아닐때 대응
   */
  _procWebkitCheck: function() {
    if ('webkitLineBreak' in document.documentElement.style) {
      return;
    }

    this.$inputPassword.attr('type', 'password');
    this.$confirmPassword.attr('type', 'password');
  },

  /**
   * @function
   * @desc 점(.) 입력 차단
   * @param e - keyup|input Event
   * @returns {boolean}
   */
  _preventDot: function(e) {
    var key = e.charCode ? e.charCode : e.keyCode;

    if (key === 46) {
      e.preventDefault();
      return false;
    }
  },

  /**
   * @function
   * @desc 설정 완료 버튼 토글
   * @param e - 리모콘 입력 란 keyup|input Event
   */
  _checkIsAbled: function (e) {
    var $elem = $(e.currentTarget),
      onlyNumber = $(e.currentTarget).val();

    $(e.currentTarget).val('');
    $(e.currentTarget).val(onlyNumber);

    var isPasswordInput = $elem.hasClass('fe-input-password'),
      isPasswordConfirmInput = $elem.hasClass('fe-confirm-password'),
      isPasswordInputError = this._isPasswordInputError(isPasswordInput),
      isPasswordConfirmInputError = this._isPasswordConfirmInputError(isPasswordConfirmInput);

    if (!isPasswordInputError && !isPasswordConfirmInputError) {
      this.$btnSetupOk.removeAttr('disabled');
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled');
    }
  },

  /**
   * @function
   * @desc 리모콘 비밀번호 검증
   * @param isSetError - 비밀번호 오류 메세지 처리 여부
   * @returns {boolean}
   */
  _isPasswordInputError: function(isSetError) {
    var $inputPasswordVal = $.trim(this.$inputPassword.val()),
      isPasswordInputError = false;

    if (!isPasswordInputError && !this._validation.checkIsLength($inputPasswordVal, 4)) {
      this._setErrorText(this.$error0, Tw.ALERT_MSG_PASSWORD.A16, isSetError);
      isPasswordInputError = true;
    }

    if (!isPasswordInputError && !this._validation.checkIsSameLetters($inputPasswordVal)) {
      this._setErrorText(this.$error0, Tw.ALERT_MSG_PASSWORD.A19, isSetError);
      isPasswordInputError = true;
    }

    if (!isPasswordInputError && !this._validation.checkIsStraight($inputPasswordVal, 4)) {
      this._setErrorText(this.$error0, Tw.ALERT_MSG_PASSWORD.A18, isSetError);
      isPasswordInputError = true;
    }

    if (!isPasswordInputError || $inputPasswordVal.length < 1) {
      this._toggleError(this.$error0, false);
    }

    return isPasswordInputError;
  },

  /**
   * @function
   * @desc 리모콘 비밀번호 확인 검증
   * @param isSetError - 비밀번호 오류 메세지 처리 여부
   * @returns {boolean}
   */
  _isPasswordConfirmInputError: function(isSetError) {
    var $inputPasswordVal = $.trim(this.$inputPassword.val()),
      $confirmPasswordVal = $.trim(this.$confirmPassword.val()),
      isPasswordConfirmInputError = false;

    if (!isPasswordConfirmInputError && !this._validation.checkIsLength($confirmPasswordVal, 4)) {
      this._setErrorText(this.$error1, Tw.ALERT_MSG_PASSWORD.A16, isSetError);
      isPasswordConfirmInputError = true;
    }

    if (!isPasswordConfirmInputError && !this._validation.checkIsSameLetters($confirmPasswordVal)) {
      this._setErrorText(this.$error1, Tw.ALERT_MSG_PASSWORD.A19, isSetError);
      isPasswordConfirmInputError = true;
    }

    if (!isPasswordConfirmInputError && !this._validation.checkIsStraight($confirmPasswordVal, 4)) {
      this._setErrorText(this.$error1, Tw.ALERT_MSG_PASSWORD.A18, isSetError);
      isPasswordConfirmInputError = true;
    }

    if (!isPasswordConfirmInputError && this._validation.checkIsDifferent($inputPasswordVal, $confirmPasswordVal)) {
      this._setErrorText(this.$error1, Tw.ALERT_MSG_PASSWORD.A17, isSetError);
      isPasswordConfirmInputError = true;
    }

    if (!isPasswordConfirmInputError || $confirmPasswordVal.length < 1) {
      this._toggleError(this.$error1, false);
    }

    return isPasswordConfirmInputError;
  },

  /**
   * @function
   * @desc 메세지 영역 토글
   * @param $elem - 메세지 영역 Element
   * @param isError - 오류 여부
   */
  _toggleError: function($elem, isError) {
    if (isError) {
      $elem.show().attr('aria-hidden', 'false');
    } else {
      $elem.hide().attr('aria-hidden', 'true');
    }
  },

  /**
   * @function
   * @desc 오류 메세지 처리
   * @param $elem - 오류 영역 Element
   * @param text - 오류 메세지
   * @param isSetError - 오류메세지 처리 여부
   */
  _setErrorText: function ($elem, text, isSetError) {
    if (!isSetError) {
      return;
    }

    $elem.text(text);
    this._toggleError($elem, true);
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
    if (this.$btnSetupOk.attr('disabled') === 'disabled') {
      return;
    }

    new Tw.ProductCommonConfirm(true, null, $.extend(this._confirmOptions, {
      isMobilePlan: false,
      noticeList: this._confirmOptions.preinfo.joinNoticeList,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId]
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
      password: $.trim(this.$inputPassword.val())
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 가입 처리 API 응답 처리 & 가입유도팝업 조회 API 요청
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
   * @desc 가입유도팝업 여부 확인
   * @param resp - 가입유도팝업 조회 API 응답 값
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
   * @desc 완료 팝업 실행
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
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindJoinResPopup: function($popupContainer) {
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
   * @desc 가입유도팝업 실행
   * @param respResult - 가입유도팝업 조회 API 응답 값
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
   * @desc 가입유도팝업 내 닫기버튼 클릭 시
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
