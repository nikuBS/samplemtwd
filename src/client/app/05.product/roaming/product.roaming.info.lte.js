/**
 * FileName: product.roaming.info.lte.js
 * Author: Eunjung Jung ()
 * Date: 2018.11.12
 */

Tw.ProductRoamingLteGuide = function (rootEl) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._bindInfoBtnEvents();
};

Tw.ProductRoamingLteGuide.prototype = {
  _bindInfoBtnEvents : function () {
    this.$container.on('click', '#fe-rm-info-btn', $.proxy(this._goInfoPopup, this));
  },
  _goInfoPopup : function () {
    this._popupService.open({
      hbs: 'RM_16_02_01_01',
      title: Tw.POPUP_TITLE.ROAMING_SERVICE_COUNTRY
    });
  }
};
