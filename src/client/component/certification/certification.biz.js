/**
 * @file certification.biz.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.02.25
 */

/**
 * @class
 * @desc 공통 > 인증 > 법인폰 비밀번호 인증
 * @constructor
 */
Tw.CertificationBiz = function () {
  this._popupService = Tw.Popup;
};
Tw.CertificationBiz.prototype = {
  /**
   * @function
   * @desc 법인폰 비밀번호 인증 팝업 요청
   */
  open: function () {
    this._popupService.open({
      hbs: 'CO_CE_02_03_01_01',
      layer: true
    }, $.proxy(this._onOpenBizCert, this));
  },

  /**
   * @function
   * @desc 법인폰 비밀번호 인증 팝업 오픈 콜백
   * @param $popupContainer
   * @private
   */
  _onOpenBizCert: function ($popupContainer) {
    $popupContainer.on('click', '#fe-biz-cert-complete', $.proxy(this._onClickBizCertComplete, this));
  },

  /**
   * @function
   * @desc 법인폰 비밀번호 인증 팝업 완료 버튼 이벤트 처리
   * @private
   */
  _onClickBizCertComplete: function () {
    this._popupService.close();
  }
};

