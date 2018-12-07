Tw.ProductMobileplan = function(rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._getBanners(menuId);
};

Tw.ProductMobileplan.prototype = {
  _getBanners: function(menuId) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: menuId }).done($.proxy(this._handleLoadBanners, this));
  },

  _handleLoadBanners: function(resp) {
    new Tw.BannerService(this.$container, resp.result && resp.result.banners);
  }
};
