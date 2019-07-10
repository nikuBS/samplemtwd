/**
 * @file biometrics.terms.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.13
 */

/**
 * @class
 * @desc 설정 > 생체인증 > 약관 동의
 * @param userId
 * @constructor
 */
Tw.BiometricsTerms = function (userId) {
  this._callback = null;
  this._userId = userId;

  this._popupService = Tw.Popup;
};

Tw.BiometricsTerms.prototype = {
  /**
   * @member {object}
   * @desc 결과 코드
   * @readonly
   * @prop {string} COMPLETE 성공
   * @prop {string} CANCEL 사용자 취소
   */
  RESULT: {
    COMPLETE: '00',
    CANCEL: '01'
  },

  /**
   * @function
   * @desc 생체인증 약관동의 호출
   * @param callback
   */
  open: function (callback) {
    this._callback = callback;
    this._popupService.open({
      hbs: 'MA_03_01_02_01_01',
      layer: true
    }, $.proxy(this._onOpenBioTerms, this), $.proxy(this._onCloseBioTerms, this), 'terms');
  },

  /**
   * @function
   * @desc 약관동의 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenBioTerms: function ($popupContainer) {
    this.$allCheck = $popupContainer.find('#fe-check-all');
    this.$childChecks = $popupContainer.find('.fe-check-child');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');

    this.$allCheck.on('change', $.proxy(this._onClickAllCheck, this));
    this.$childChecks.on('change', $.proxy(this._onClickChildCheck, this));
    this.$btConfirm.on('click', $.proxy(this._onClickConfirm, this));

    this._enableBtns();
  },

  /**
   * @function
   * @desc 약관동의 팝업 클로즈 콜백
   * @private
   */
  _onCloseBioTerms: function () {
    if ( this._closeCode === this.RESULT.COMPLETE ) {
      setTimeout($.proxy(function () {
        var biometricsComplete = new Tw.BiometricsComplete();
        biometricsComplete.open(this._callback);
      }, this), 100);
    }
  },

  /**
   * @function
   * @desc 약관 모두 체크박스 click event 처리
   * @param $event
   * @private
   */
  _onClickAllCheck: function ($event) {
    var $currentTarget = $($event.currentTarget);
    if ( $currentTarget.is(':checked') ) {
      this._checkElement(this.$childChecks);
    } else {
      this._uncheckElement(this.$childChecks);
    }
    this._enableBtns();
  },

  /**
   * @function
   * @desc 약관 체크박스 click event 처리
   * @private
   */
  _onClickChildCheck: function () {
    this._checkAll();
    this._enableBtns();
  },

  /**
   * @function
   * @desc 확인 click event 처리
   * @private
   */
  _onClickConfirm: function () {
    var biometiricsCert = new Tw.BiometricsCert(this._userId);
    biometiricsCert.open(this._callback, $.proxy(this._onCloseCallback, this));
  },

  /**
   * @function
   * @desc 체크박스 체크 처리
   * @param $element
   * @private
   */
  _checkElement: function ($element) {
    $element.prop('checked', true);
    $element.parent().addClass('checked');
    $element.parent().attr('aria-checked', true);
  },

  /**
   * @function
   * @desc 체크박스 해제 처리
   * @param $element
   * @private
   */
  _uncheckElement: function ($element) {
    $element.prop('checked', false);
    $element.parent().removeClass('checked');
    $element.parent().attr('aria-checked', false);
  },

  /**
   * @function
   * @desc 체크박스 모두체크 처리
   * @private
   */
  _checkAll: function () {
    var allLength = this.$childChecks.length;
    var selectedLength = this.$childChecks.filter(':checked').length;
    if ( allLength === selectedLength ) {
      this._checkElement(this.$allCheck);
    } else {
      this._uncheckElement(this.$allCheck);
    }
  },

  /**
   * @function
   * @desc 확인버튼 활성/비활성 여부 처리
   * @private
   */
  _enableBtns: function () {
    var selectedLength = this.$childChecks.filter(':checked').length;
    if ( selectedLength === 0 ) {
      this.$btConfirm.attr('disabled', true);
    } else {
      this.$btConfirm.attr('disabled', false);
    }
  },

  /**
   * @function
   * @desc 약관 팝업 완료 콜백
   * @param code
   * @private
   */
  _onCloseCallback: function (code) {
    this._closeCode = code;
    this._popupService.close();
  }
};
