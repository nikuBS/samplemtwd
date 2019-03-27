/**
 * MenuName: T로밍 > 로밍안내 > SMS, 데이터 로밍 (RM_16_04)
 * FileName: product.roaming.info.data-roaming.js
 * Author: Eunjung Jung
 * Date: 2018.11.12
 */

Tw.ProductRoamingDataRoaming = function (rootEl) {
  this.$container = rootEl;

  this._bindInfoBtnEvents();
};

Tw.ProductRoamingDataRoaming.prototype = {
  _bindInfoBtnEvents : function () {
    // this.$container.on('click', '#fe-rm-onepass', $.proxy(this._goRoamingOnePass, this));
  }
};
