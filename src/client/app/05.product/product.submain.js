/**
 * FileName: product.submain.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.12.07
 */

Tw.ProductSubmain = function(rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._getBanners(menuId);
  this._bindEvent();
};

Tw.ProductSubmain.prototype = {
  _bindEvent: function() {
    this.$container.on('click', '.fe-go-plan', this._goPlan);
  },

  _getBanners: function(menuId) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: menuId }).done($.proxy(this._handleLoadBanners, this));
    // $.ajax('http://localhost:3000/mock/product.banners.json').done($.proxy(this._handleLoadBanners, this));
  },

  _handleLoadBanners: function(resp) {
    if (resp.result && resp.result.banners) {
      new Tw.BannerService(
        this.$container,
        Tw.REDIS_BANNER_TYPE.ADMIN,
        _.filter(resp.result.banners, function(banner) {
          return banner.bnnrLocCd === 'T';
        }),
        'T'
      );
    }
  },

  _goPlan: function(e) {
    var url = e.currentTarget.getAttribute('data-url');
    if (url) {
      window.location.href = url;
    }
  }
};
