/**
 * MenuName: T로밍 > 로밍안내 > 자동로밍 (RM_16_02_01)
 * FileName: product.roaming.info.lte.js
 * Author: Eunjung Jung
 * Date: 2018.11.12
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
  _goInfoPopup : function () {
    this._popupService.open({
      hbs: 'RM_16_02_01_01',
      title: Tw.POPUP_TITLE.ROAMING_SERVICE_COUNTRY
    });
  }
};
