/**
 * FileName: product.wireplan.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.12.07
 */

Tw.ProductWireplan = function(rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._getBanners(menuId);
};

Tw.ProductWireplan.prototype = {
  _getBanners: function(menuId) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: menuId }).done($.proxy(this._handleLoadBanners, this));
  },

  _handleLoadBanners: function(resp) {
    console.log(resp);
    new Tw.BannerService(this.$container, resp.result && resp.result.banners);
  }
};
