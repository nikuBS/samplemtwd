Tw.BannerService = function(rootEl, banners, callback) {
  this.$container = rootEl;
  if (!banners || banners.length <= 0) {
    return;
  }

  // $(window).on('env', $.proxy(this._init, this, this._getProperBanners(banners)));
  this._init(banners, callback);
  this._bindEvent();
};

Tw.BannerService.prototype = {
  _init: function(banners, callback) {
    this._banners = this._getProperBanners(banners);
    this._renderBanners(this._banners, callback);
  },

  _renderBanners: function(banners, callback) {
    var locations = Object.keys(this._banners),
      i = 0,
      CDN = Tw.Environment.cdn;

    this.locations = locations;
    this.$banners = {};

    $.get(
      CDN + '/hbs/banner.hbs',
      $.proxy(function(hbs) {
        this._bannerTmpl = Handlebars.compile(hbs);

        for (; i < locations.length; i++) {
          var location = locations[i],
            $banners = this.$container.find('ul.slider[data-location="' + location + '"]');

          $banners.slick('slickAdd', this._bannerTmpl({ banners: banners[location], location: location }));
          if (callback) {
            $banners.find('img').on('load', callback);
          }
        }
      }, this)
    );
  },

  _bindEvent: function() {
    this.$container.on('click', '.fe-banner', $.proxy(this._openBannerLink, this));
  },

  _openBannerLink: function(e) {
    var target = e.currentTarget,
      location = target.getAttribute('data-location'),
      idx = target.getAttribute('data-idx'),
      banner = this._banners[location][idx];

    if (!banner) {
      return;
    }

    var link = banner.imgLinkUrl;

    switch (banner.imgLinkTrgtClCd) {
      case Tw.BANNER_LINK_TYPE.CHANNEL_APP:
      case Tw.BANNER_LINK_TYPE.CHANNEL_WEB: {
        window.location.href = link;
        break;
      }
      case Tw.BANNER_LINK_TYPE.OTHER_APP:
      case Tw.BANNER_LINK_TYPE.OTHER_WEB: {
        if (banner.isBill) {
          Tw.CommonHelper.showDataCharge(function() {
            Tw.CommonHelper.openUrlExternal(link);
          });
        } else {
          Tw.CommonHelper.openUrlExternal(link);
        }
        break;
      }
    }
  },

  _getBrowserCode: function() {
    return Tw.BrowserHelper.isApp() ?
      Tw.BrowserHelper.isAndroid() ?
        Tw.REDIS_DEVICE_CODE.ANDROID :
        Tw.REDIS_DEVICE_CODE.IOS :
      Tw.REDIS_DEVICE_CODE.MWEB;
  },

  _getProperBanners: function(banners) {
    var browserCode = this._getBrowserCode(),
      CDN = Tw.Environment.cdn;
    return _.chain(banners)
      .filter(function(banner) {
        return (
          (banner.chnlClCd.includes(Tw.REDIS_DEVICE_CODE.MOBILE) || banner.chnlClCd.includes(browserCode)) &&
          Tw.DateHelper.getDifference(banner.expsStaDtm.substring(0, 8)) <= 0 &&
          Tw.DateHelper.getDifference(banner.expsEndDtm.substring(0, 8)) >= 0
        );
      })
      .sort(function(a, b) {
        return Number(a.bnnrExpsSeq) - Number(b.bnnrExpsSeq);
      })
      .reduce(function(nBanners, banner) {
        if (!nBanners[banner.bnnrLocCd || '0']) {
          nBanners[banner.bnnrLocCd] = [];
        }

        var temp = {
          isHTML: banner.bnnrTypCd === 'H',
          isBill: banner.billYn === 'Y',
          idx: nBanners[banner.bnnrLocCd].length
        };

        if (banner.bnnrFilePathNm) {
          temp.bnnrFilePathNm = CDN + banner.bnnrFilePathNm;
        }

        nBanners[banner.bnnrLocCd].push(Object.assign(banner, temp));

        return nBanners;
      }, {})
      .value();
  }
};
