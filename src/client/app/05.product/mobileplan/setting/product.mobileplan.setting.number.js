/**
 * @file 상품 > 모바일요금제 > 설정 > 지정번호 변경
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-15
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면ID
 */
Tw.ProductMobileplanSettingNumber = function(rootEl, prodId, displayId) {
  // 컨테이너 레이어 선언
  this.$container = rootEl;

  // 공통 모듈 선언
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  // 공통 변수 선언
  this._prodId = prodId;
  this._displayId = displayId;

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();
};

Tw.ProductMobileplanSettingNumber.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineWrap = this.$container.find('.fe-line_wrap');
    this.$inputNumber = this.$container.find('.fe-num_input');

    this.$btnAddNum = this.$container.find('.fe-btn_add_num');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnAddressBook = this.$container.find('.fe-btn_address_book');
    this.$btnMaskingAlert = this.$container.find('.fe-bt-masking-alert');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$btnAddNum.on('click', _.debounce($.proxy(this._addNum, this), 500));
    this.$lineList.on('click', '.fe-btn_del_num', $.proxy(this._delNum, this));
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$btnAddressBook.on('click', $.proxy(this._openAppAddressBook, this));
    this.$btnMaskingAlert.on('click', $.proxy(this._openMaskingAlert, this));
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },

  /**
   * @function
   * @desc 주소록 열기 (Only App)
   */
  _openAppAddressBook: function() {
    this._nativeService.send('getContact', {}, $.proxy(this._setAppAddressBook, this));
  },

  /**
   * @function
   * @desc 주소록 App 열기 후 콜백 처리
   * @param res - App 콜백 응답 값
   */
  _setAppAddressBook: function(res) {
    if (Tw.FormatHelper.isEmpty(res.params.phoneNumber)) {
      return;
    }

    this.$inputNumber.val(res.params.phoneNumber);
    this._toggleClearBtn();
    this._toggleNumAddBtn();
    this._blurInputNumber();
  },

  /**
   * @function
   * @desc 회선 번호 추가
   * @returns {*|void}
   */
  _addNum: function() {
    if (this.$btnAddNum.attr('disabled') === 'disabled') {
      return;
    }

    var number = this.$inputNumber.val().replace(/-/gi, '');

    if (!Tw.ValidationHelper.isCellPhone(number) && !Tw.ValidationHelper.isTelephone(number)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    if (this.$lineList.find('li').length > 5) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A35.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A35.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0074, {
      opClCd: '1',
      asgnNum: number
    }, {}).done($.proxy(this._addDelNumRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 회선 번호 추가/삭제 후 처리 (공통)
   * @param resp - API 응답 값
   * @returns {*}
   */
  _addDelNumRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._historyService.reload();
  },

  /**
   * @function
   * @desc 회선 삭제 클릭 시
   * @param e - 삭제 클릭 이벤트
   * @returns {*|void}
   */
  _delNum: function(e) {
    var $elem = $(e.currentTarget).parents('li');
    if ($elem.parent().find('li').length < 2) {
      return this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_NUMBER_MIN);
    }

    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON, Tw.BUTTON_LABEL.CLOSE, null,
      $.proxy(this._delNumReq, this, $elem.data('number'), $elem.data('audit_dtm')));
  },

  /**
   * @function
   * @desc 삭제 API 요청
   * @param number - 삭제할 회선번호
   * @param auditDtm - 신청일
   */
  _delNumReq: function(number, auditDtm) {
    this._popupService.close();

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0074, {
      opClCd: '2',
      asgnNum: number.replace(/-/gi, ''),
      auditDtm: auditDtm
    }, {}, this._prodId).done($.proxy(this._addDelNumRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 번호 입력칸 keyup|input 시
   * @param e - keyup|input Event
   * @returns {*|void}
   */
  _detectInputNumber: function(e) {
    if (Tw.InputHelper.isEnter(e)) {
      this.$btnAddNum.trigger('click');
      return;
    }

    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9]/g, ''));

    if (this.$inputNumber.val().length > 12) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 12));
    }

    this._toggleClearBtn();
    this._toggleNumAddBtn();
  },

  /**
   * @function
   * @desc 회선 추가 버튼 토글
   */
  _toggleNumAddBtn: function() {
    if (this.$inputNumber.val().length > 8) {
      this.$btnAddNum.removeAttr('disabled').prop('disabled', false);
      this.$btnAddNum.parent().removeClass('bt-gray1').addClass('bt-blue1');
    } else {
      this.$btnAddNum.attr('disabled', 'disabled').prop('disabled', true);
      this.$btnAddNum.parent().removeClass('bt-blue1').addClass('bt-gray1');
    }
  },

  /**
   * @function
   * @desc 회선 입력란 blur 시
   */
  _blurInputNumber: function() {
    this.$inputNumber.val(Tw.FormatHelper.conTelFormatWithDash(this.$inputNumber.val()));
  },

  /**
   * @function
   * @desc 회선 입력란 focus 시
   */
  _focusInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  /**
   * @function
   * @desc 회선 입력란 X 삭제버튼 클릭 시
   */
  _clearNum: function() {
    this.$inputNumber.val('');
    this.$btnClearNum.hide().attr('aria-hidden', 'true');
    this._toggleNumAddBtn();
  },

  /**
   * @function
   * @desc 삭제 버튼 display none|block 토글
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
   * @desc 마스킹 해제 안내 팝업 실행
   */
  _openMaskingAlert: function() {
    this._popupService.openConfirmButton(
      Tw.PRODUCT_AUTH_ALERT_STR.MSG,
      Tw.PRODUCT_AUTH_ALERT_STR.TITLE,
      $.proxy(this._showAuth,this),
      null,
      Tw.BUTTON_LABEL.CANCEL,
      Tw.BUTTON_LABEL.CONFIRM);
  },

  /**
   * @function
   * @desc 마스킹 해제 (자물쇠 버튼) 클릭 트리거 실행
   */
  _showAuth : function () {
    this._popupService.close();
    $('.fe-bt-masking').trigger('click');
  }

};
