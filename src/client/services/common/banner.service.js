Tw.BannerService = function(rootEl, banners, callback) {
  this.$container = rootEl;
  if (!banners || banners.length <= 0) {
    return;
  }

  // $(window).on(Tw.INIT_COMPLETE, $.proxy(this._init, this, this._getProperBanners(banners)));
  this._cachedElement();
  this._init(banners, callback);
  this._bindEvent();
};

Tw.BannerService.prototype = {
  _init: function(banners, callback) {
    this._banners = this._getProperBanners(banners);
    this._renderBanners(callback);
  },

  _cachedElement: function() {
    this.$banners = this.$container.find('ul.slider');
  },

  _renderBanners: function(callback) {
    var locations = Object.keys(this._banners),
      i = 0,
      CDN = Tw.Environment.cdn;

    this.locations = locations;

    $.get(
      CDN + '/hbs/banner.hbs',
      $.proxy(function(hbs) {
        this._bannerTmpl = Handlebars.compile(hbs);

        for (; i < this.$banners.length; i++) {
          var $item = $(this.$banners[i]),
            location = $item.data('location'),
            list = this._banners[location];

          if (!list || list.length === 0) {
            $item.parents('div.nogaps').addClass('none');
          } else {
            $item.slick('slickAdd', this._bannerTmpl({ banners: list, location: location }));
            if (callback) {
              $item.find('img').on('load', callback);
            }
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

    if (link) {
      switch (banner.imgLinkTrgtClCd) {
        case Tw.BANNER_LINK_TYPE.CHANNEL_APP: {
          window.location.href = link;
          break;
        }
        case Tw.BANNER_LINK_TYPE.OTHER_WEB:
        default: {
          if (Tw.BrowserHelper.isApp() && banner.isBill) {
            Tw.CommonHelper.showDataCharge(function() {
              Tw.CommonHelper.openUrlExternal(link);
            });
          } else {
            Tw.CommonHelper.openUrlExternal(link);
          }
          break;
        }
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
      CDN = Tw.Environment.cdn,
      today = new Date();
    return _.chain(banners)
      .filter(function(banner) {
        return (
          (banner.chnlClCd.indexOf(Tw.REDIS_DEVICE_CODE.MOBILE) >= 0 || banner.chnlClCd.indexOf(browserCode) >= 0) &&
          (!banner.expsStaDtm || Tw.DateHelper.getDiffByUnit(banner.expsStaDtm.substring(0, 8), today, 'days') <= 0) &&
          (!banner.expsEndDtm || Tw.DateHelper.getDiffByUnit(banner.expsEndDtm.substring(0, 8), today, 'days') >= 0)
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

        nBanners[banner.bnnrLocCd].push($.extend(banner, temp));

        return nBanners;
      }, {})
      .value();
  }
};
