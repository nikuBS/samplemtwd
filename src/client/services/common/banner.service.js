Tw.BannerService = function(rootEl, type, banners, target, callback) {
  this.$container = rootEl;
  if (!banners || banners.length <= 0) {
    return;
  }

  this._init(type, banners, target, callback);
  this._bindEvent();
};

Tw.BannerService.prototype = {
  _init: function(type, banners, target, callback) {
    this._type = type;
    this._banners = this._getProperBanners(type, banners);
    this.$banners = this.$container.find('ul.slider[data-location=' + target + ']');

    this._renderBanners(target, callback);
  },

  _renderBanners: function(target, callback) {
    var CDN = Tw.Environment.cdn;

    $.get(
      CDN + '/hbs/banner.hbs',
      $.proxy(function(hbs) {
        this._bannerTmpl = Handlebars.compile(hbs);

        if (this.$banners) {
          if (!this._banners || this._banners.length === 0) {
            this.$banners.parents('div.nogaps').addClass('none');
          } else {
            this.$banners.slick('slickAdd', this._bannerTmpl({ banners: this._banners, location: target }));
            if (callback) {
              this.$banners.find('img').on('load', callback);
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
      idx = target.getAttribute('data-idx'),
      banner = this._banners[idx];

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

  _getProperBanners: function(type, banners) {
    var browserCode = this._getBrowserCode(),
      CDN = Tw.Environment.cdn,
      today = new Date();

    if (type === Tw.REDIS_BANNER_TYPE.TOS) {
      return _.chain(banners)
        .sort(function(a, b) {
          return Number(a.bnnrExpsSeq) - Number(b.bnnrExpsSeq);
        })
        .map(function(banner, idx) {
          return {
            isHTML: banner.bnnrTypCd === 'H',
            isBill: banner.billYn === 'Y',
            bnnrFilePathNm: banner.bnnrFileNm && CDN + banner.bnnrFileNm,
            idx: idx,
            imgLinkTrgtClCd: banner.tosImgLinkTrgtClCd,
            bnnrImgAltCtt: banner.imgAltCtt,
            imgLinkUrl: banner.imgLinkUrl
          };
        })
        .value();
    } else {
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
          var temp = {
            isHTML: banner.bnnrTypCd === 'H',
            isBill: banner.billYn === 'Y',
            idx: nBanners.length
          };

          if (banner.bnnrFilePathNm) {
            temp.bnnrFilePathNm = CDN + banner.bnnrFilePathNm;
          }

          nBanners.push($.extend(banner, temp));

          return nBanners;
        }, [])
        .value();
    }
  }
};
