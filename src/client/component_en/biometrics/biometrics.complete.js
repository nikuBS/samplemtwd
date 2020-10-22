/**
 * @file biometrics.complete.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.30
 */

/**
 * @class
 * @desc 설정 > 생체인증 > 등록 완료
 * @constructor
 */
Tw.BiometricsComplete = function () {
  this._callback = null;

  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
};

Tw.BiometricsComplete.prototype = {
  /**
   * @function
   * @desc 생체인증 등록 완료 호출
   * @param callback
   */
  open: function (callback) {
    this._callback = callback;

    this._popupService.open({
      hbs: 'MA_03_01_02_01_04',
      layer: true
    }, $.proxy(this._onOpenBioComplete, this), $.proxy(this._onCloseBioCert, this), 'complete');
  },

  /**
   * @function
   * @desc 등록완료 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _onOpenBioComplete: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-complete', $.proxy(this._onClickComplete, this));
  },

  /**
   * @function
   * @desc 등록완료 팝업 클로즈 콜백
   * @private
   */
  _onCloseBioCert: function () {
    if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback({ code: Tw.API_CODE.CODE_00 });
    }
  },

  /**
   * @function
   * @desc 닫기 버튼 click event 처리
   * @private
   */
  _onClickComplete: function () {
    this._popupService.close();
  }

};
