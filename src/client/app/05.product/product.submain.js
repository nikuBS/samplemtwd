/**
 * FileName: product.submain.js
 * @author Jiyoung Jo
 * Date: 2018.12.07
 */

Tw.ProductSubmain = function(rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._xTractorService = new Tw.XtractorService(rootEl);

  this._menuId = menuId;
  this._getTosBanner();
  this._bindEvent();
};

Tw.ProductSubmain.prototype = {
  _bindEvent: function() {
    this.$container.on('click', '.fe-go-plan', this._goPlan);
  },

  _getTosBanner: function() {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_TOS, { code: this._getBannerCode() }).done($.proxy(this._successTosBanner, this));
  },

  _successTosBanner: function(resp) {
    if (this._checkTosBanner(resp)) {
      if (!Tw.FormatHelper.isEmpty(resp.result.summary)) {
        new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS, resp.result.imgList, 'T');
      } else {
        this.$container.find('#fe-header-t').remove();
        this.$container.find('#fe-banner-t').remove();
      }
    } else {
      this._getAdminBanners(this._menuId);
    }
  },

  _checkTosBanner: function(tosBanner) {
    return tosBanner.code === Tw.API_CODE.CODE_00 && (tosBanner.result.bltnYn === 'N' || tosBanner.result.tosLnkgYn === 'Y');
  },

  _getAdminBanners: function(menuId) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: menuId }).done($.proxy(this._handleLoadBanners, this));
    // $.ajax('http://localhost:3000/mock/product.banners.json').done($.proxy(this._handleLoadBanners, this));
  },

  _handleLoadBanners: function(resp) {
    if (resp.result && resp.result.banners) {
      var topBanners = _.filter(resp.result.banners, function(banner) {
        return banner.bnnrLocCd === 'T';
      });

      if (topBanners.length > 0) {
        new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, topBanners, 'T');
      } else {
        this.$container.find('#fe-header-t').remove();
        this.$container.find('#fe-banner-t').remove();
      }

      if (Tw.UrlHelper.getLastPath() !== 'mobileplan') {
        var cBanners = _.filter(resp.result.banners, function(banner) {
          return banner.bnnrLocCd === 'C';
        });

        if (cBanners.length > 0) {
          new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, cBanners, 'C');
        } else {
          this.$container.find('#fe-header-c').remove();
          this.$container.find('#fe-banner-c').remove();
        }
      }
    }
  },

  _goPlan: function(e) {
    var url = e.currentTarget.getAttribute('data-url');
    if (url) {
      window.location.href = url;
    }
  },

  _getBannerCode: function() {
    var uri = Tw.UrlHelper.getLastPath();

    switch (uri) {
      case 'mobileplan-add': {
        return '0012';
      }
      case 'wireplan': {
        return '0013';
      }
      // case 'mobileplan':
      default: {
        return '0011';
      }
    }
  }
};
