/**
 * FileName: main.store.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.03.12
 */

Tw.MainStore = function (rootEl, menuId) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._menuId = menuId;

  this._bindEventStore();
  this._setBanner();

  new Tw.XtractorService(this.$container);
};

Tw.MainStore.prototype = {
  _bindEventStore: function () {
    this.$container.on('click', '.fe-home-external', $.proxy(this._onClickExternal, this));
    this.$container.on('click', '.fe-home-internal', $.proxy(this._onClickInternal, this));
  },
  _onClickExternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openUrlExternal(url);
  },
  _onClickInternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    this._historyService.goLoad(url);
    // Tw.CommonHelper.openUrlInApp(url);

    $event.preventDefault();
    $event.stopPropagation();
  },
  _setBanner: function () {
    this._getTosStoreBanner();
  },
  _getTosStoreBanner: function () {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_TOS, { code: '0004' })
      .done($.proxy(this._successTosStoreBanner, this));
  },
  _successTosStoreBanner: function (resp) {
    this._drawBanner([{ target: '4', banner: resp }]);
  },
  _drawBanner: function (banners) {
    var adminList = [];
    _.map(banners, $.proxy(function (bnr) {
      if ( this._checkTosBanner(bnr.banner, bnr.target) ) {
        if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) ) {
          if ( bnr.target === '7' ) {
            this._membershipBanner = {
              kind: Tw.REDIS_BANNER_TYPE.TOS,
              list: bnr.banner.result.imgList
            };
          } else {
            new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS, bnr.banner.result.imgList, bnr.target, $.proxy(this._successDrawBanner, this));
          }
        }
      } else {
        adminList.push(bnr);
      }
    }, this));

    if ( adminList.length > 0 ) {
      this._getAdminBanner(adminList);
    }
  },
  _checkTosBanner: function (tosBanner, target) {
    if ( tosBanner.code === Tw.API_CODE.CODE_00 ) {
      if ( tosBanner.result.bltnYn === 'N' ) {
        this.$container.find('ul.slider[data-location=' + target + ']').parents('div.nogaps').addClass('none');
        return true;
      } else {
        if ( tosBanner.result.tosLnkgYn === 'Y' ) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  },
  _getAdminBanner: function (adminList) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: this._menuId })
      .done($.proxy(this._successBanner, this, adminList));
  },
  _successBanner: function (adminList, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      _.map(adminList, $.proxy(function (target) {
        var banner = _.filter(resp.result.banners, function (banner) {
          return banner.bnnrLocCd === target.target;
        });
        if ( banner.length > 0 ) {
          if ( target.target === '7' ) {
            this._membershipBanner = {
              kind: Tw.REDIS_BANNER_TYPE.ADMIN,
              list: banner
            };
          } else {
            new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, banner, target.target, $.proxy(this._successDrawBanner, this));
          }
        } else {
          this.$container.find('ul.slider[data-location=' + target.target + ']').parents('div.nogaps').addClass('none');
          // this._resetHeight();
        }
      }, this));
    }
  },
  _successDrawBanner: function () {
    // this._resetHeight();
  }
};

