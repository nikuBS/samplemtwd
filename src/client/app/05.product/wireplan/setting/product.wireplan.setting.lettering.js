/**
 * @file 상품 > 유선 부가서비스 > 설정 > 레터링
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-02-14
 * @todo 개발은 완료 되었으나 Spec-out 되어 미사용 중
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면 아이디
 * @param btnData - 버튼 데이터
 */
Tw.ProductWireplanSettingLettering = function(rootEl, prodId, displayId, btnData) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._btnData = JSON.parse(window.unescape(btnData));

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductWireplanSettingLettering.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$inputText = this.$container.find('.fe-input_text');

    this.$btnClear = this.$container.find('.fe-btn_clear');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$inputText.on('keyup input', $.proxy(this._detectInputText, this));

    this.$btnClear.on('click', $.proxy(this._clear, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));
  },

  /**
   * @function
   * @desc 입력란 keyup|input Event 발생 시
   */
  _detectInputText: function() {
    if (this.$inputText.val().length > 16) {
      this.$inputText.val(this.$inputText.val().substr(0, 16));
    }

    this._toggleSetupButton(this.$inputText.val().length > 0);
    this._toggleClearBtn();
  },

  /**
   * @function
   * @desc 설정 버튼 토글
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
   * @desc 입력란 삭제 버튼 클릭 시
   */
  _clear: function() {
    this.$inputText.val('');
    this.$btnClear.hide().attr('aria-hidden', 'true');
    this._toggleSetupButton(false);
  },

  /**
   * @function
   * @desc 입력란 삭제 버튼 display none|block 토글
   */
  _toggleClearBtn: function() {
    if (this.$inputText.val().length > 0) {
      this.$btnClear.show().attr('aria-hidden', 'false');
    } else {
      this.$btnClear.hide().attr('aria-hidden', 'true');
    }
  },

  /**
   * @function
   * @desc 설정 변경 API 요청
   */
  _procConfirm: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0137, {
      addInfoExistYn: this._btnData.addInfoExistYn,
      addInfoRelScrnId: this._btnData.addInfoRelScrnId,
      addSvcAddYn: this._btnData.addSvcAddYn,
      cntcPlcInfoRgstYn: this._btnData.cntcPlcInfoRgstYn,
      svcProdGrpCd: this._btnData.svcProdGrpCd,
      opCtt1: this.$inputText.val()
    }, {}, [this._prodId]).done($.proxy(this._procSettingRes, this))
      .fail(Tw.CommonHelper.endLoading('.container'));
  },

  /**
   * @function
   * @desc 설정 변경 API 응답 처리
   * @param resp - 설정 변경 API 응답 값
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
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindSettingResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 시
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
