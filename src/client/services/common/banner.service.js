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
            this.$banners.append(this._bannerTmpl({ banners: this._banners, location: target, CDN: CDN }));

            if (this.$banners.hasClass('fe-banner-auto')) {
              this.$banners.slick({
                autoplay: true,
                autoplaySpeed: 4000,
                dots: this._banners.length !== 1,
                infinite: true,
                speed: 500,
                lazyLoad: 'progressive',
                focusOnSelect: true,
                pauseOnFocus: true,
                pauseOnHover: true,
                pauseOnDotsHover: true,
                accessibility: true,
                customPaging: function(slider, i) {
                  return $('<span role="button" />').text(i + 1);
                }
              });
            } else {
              this.$banners.slick({
                dots: this._banners.length !== 1,
                infinite: false,
                speed: 300,
                lazyLoad: 'progressive',
                focusOnSelect: true,
                touchMove: false,
                accessibility: true,
                customPaging: function(slider, i) {
                  return $('<span role="button" />').text(i + 1);
                }
              });
            }

            this.$banners.on({
              afterChange: function(e, slickSlider) {
                if (slickSlider.$slider.find('*:focus').length > 0) {
                  slickSlider.$slider.find('.slick-current').focus();
                }
              }
            });

            var $mainSlider = $('.home-slider .home-slider-belt');
            if ($mainSlider.length > 0) {
              this.$banners.on({
                mousedown: function() {
                  $mainSlider[0].slick.setOption({
                    swipe: false
                  });
                },
                touchstart: function() {
                  $mainSlider[0].slick.setOption({
                    swipe: false
                  });
                },
                beforeChange: function() {
                  $mainSlider[0].slick.setOption({
                    swipe: false
                  });
                },
                afterChange: function() {
                  $mainSlider[0].slick.setOption({
                    swipe: true
                  });
                }
              });
            }

            if (callback) {
              this.$banners.find('img').on('load', callback);
            }
          }
        }
      }, this)
    );
  },

  _bindEvent: function() {
    this.$banners.on('click', '.fe-banner', $.proxy(this._openBannerLink, this));
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
        // case Tw.BANNER_LINK_TYPE.OTHER_WEB:
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
            bnnrFilePathNm: banner.bnnrFileNm,
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

          nBanners.push($.extend(banner, temp));

          return nBanners;
        }, [])
        .value();
    }
  }
};
