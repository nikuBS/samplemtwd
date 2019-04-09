/**
 * @file product.roaming.info.lte.js
 * @desc T로밍 > 로밍안내 > 자동로밍 (RM_16_02_01)
 * @author Eunjung Jung
 * @since 2018.11.12
 */

Tw.ProductRoamingLteGuide = function (rootEl) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._bindInfoBtnEvents();
};

Tw.ProductRoamingLteGuide.prototype = {
  _bindInfoBtnEvents : function () {
    this.$container.on('click', '#fe-rm-info-btn', $.proxy(this._goInfoPopup, this)); // 이용가능 국가보기
  },
  /**
   * @function
   * @desc LTE 자동로밍 서비스 이용 가능 국가 팝업 열기
   * @private
   */
  _goInfoPopup : function () {
    this._popupService.open({
      hbs: 'RM_16_02_01_01',
      title: Tw.POPUP_TITLE.ROAMING_SERVICE_COUNTRY
    });
  }
};
