/**
 * @file 상품 > 유선 부가서비스 > 설정 > 정보입력 Case
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-02-14
 * @todo 개발은 완료 되었으나 Spec-out 되어 미사용 중
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품 코드
 * @param displayId - 화면ID
 * @param btnData - 버튼 데이터
 */
Tw.ProductWireplanSettingBasicInfo = function(rootEl, prodId, displayId, btnData) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._btnData = JSON.parse(window.unescape(btnData));

  this._cachedElement();
  this._bindEvent();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductWireplanSettingBasicInfo.prototype = {

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
   * @desc 입력란 keyup|input
   * @param maxLength - 최대 입력 가능 길이
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
   * @desc 이메일 입력란 keyup|input Event
   */
  _detectInputEmail: function() {
    this._toggleClearBtn(this.$inputEmail);
    this._checkSetupButton();
  },

  /**
   * @function
   * @desc 설정 완료 버튼 활성화 여부 산출
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
   * @desc 회선 입력란 blur Event
   * @param e - blur Event
   */
  _blurInputNumber: function(e) {
    var $elem = $(e.currentTarget);
    $elem.val(Tw.FormatHelper.conTelFormatWithDash($elem.val()));
  },

  /**
   * @function
   * @desc 회선 입력란 focus Event
   * @param e - focus Event
   */
  _focusInputNumber: function(e) {
    var $elem = $(e.currentTarget);
    $elem.val($elem.val().replace(/-/gi, ''));
  },

  /**
   * @function
   * @desc 회선 입력란 삭제 버튼 클릭 시
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
   * @desc 회선 입력란 삭제 버튼 display none|block
   * @param $elem - button Element
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
   * @desc 설정변경 처리 API 요청
   */
  _procConfirm: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0137, {
      addInfoExistYn: this._btnData.addInfoExistYn,
      addInfoRelScrnId: this._btnData.addInfoRelScrnId,
      addSvcAddYn: this._btnData.addSvcAddYn,
      cntcPlcInfoRgstYn: this._btnData.cntcPlcInfoRgstYn,
      svcProdGrpCd: this._btnData.svcProdGrpCd,
      email: this.$inputEmail.val(),
      mobileNum: this.$inputCellPhone.val(),
      phoneNum: this.$inputPhone.val()
    }, {}, [this._prodId]).done($.proxy(this._procSettingRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 설정변경 API 응답 처리
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procSettingRes: function(resp) {
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
        prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
        typeNm: Tw.PRODUCT_TYPE_NM.CHANGE,
        btList: [],
        btClass: 'item-one'
      }
    }, $.proxy(this._bindSettingResPopup, this), $.proxy(this._onClosePop, this), 'setting_success');
  },

  /**
   * @function
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 팝업 컨테이너
   */
  _bindSettingResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 내 A 하이퍼링크 클릭 시
   * @param e - 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 팝업 내 닫기 버튼 클릭 시
   */
  _closePop: function() {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 팝업 종료 시
   */
  _onClosePop: function() {
    this._historyService.goBack();
  }

};
