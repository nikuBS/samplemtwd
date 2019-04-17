/**
 * @file 배너
 * @author Jiyoung Jo
 * @since 2019.04.10
 */

  /**
   * @class
   * @param {jquery element} rootEl the container haven banners
   * @param {string} type Tw.REDIS_BANNER_TYPE.TOS or Tw.REDIS_BANNER_TYPE.ADMIN
   * @param {Array<object>} banners banner list
   * @param {string} target location code
   * @param {function} callback excutable code after load banners
   */

Tw.BannerService = function(rootEl, type, banners, target, callback) {
  this.$container = rootEl;
  if (!banners || banners.length <= 0) {
    return;
  }

  if( !Tw.Environment.init ) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._init, this, type, banners, target, callback));
  } else {
    this._init(type, banners, target, callback);
  }
  
  this._cachedElement(target);
  this._bindEvent();
};

Tw.BannerService.prototype = {
  /**
   * @desc initialize
   * @param {string} type Tw.REDIS_BANNER_TYPE.TOS or Tw.REDIS_BANNER_TYPE.ADMIN
   * @param {Array<object>} banners banner list
   * @param {string} target location code
   * @param {function} callback excutable code after load banners
   * @private
   */
  _init: function(type, banners, target, callback) {
    this._type = type;
    this._banners = this._getProperBanners(type, banners);

    this._renderBanners(target, callback);
  },

  /**
   * @desc cached jquery object
   * @param {string} target Tw.REDIS_BANNER_TYPE.TOS or Tw.REDIS_BANNER_TYPE.ADMIN
   */
  _cachedElement: function(target) {
    this.$banners = this.$container.find('ul.slider[data-location=' + target + ']');
  },

  /**
   * @desc get banner.hbs
   * @param {string} target Tw.REDIS_BANNER_TYPE.TOS or Tw.REDIS_BANNER_TYPE.ADMIN
   * @param {function} callback excutable code after load banners
   * @private
   */
  _renderBanners: function(target, callback) {  
    var CDN = Tw.Environment.cdn;

    $.ajax(CDN + '/hbs/banner.hbs', {})
      .done($.proxy(this._handleSuccessBanners, this, target, callback))
      .fail($.proxy(this._renderBanners, this));
  },

  /**
   * @desc after get hbs
   * @param {string} target Tw.REDIS_BANNER_TYPE.TOS or Tw.REDIS_BANNER_TYPE.ADMIN
   * @param {function} callback excutable code after load banners
   * @param {string} hbs 
   * @private
   */
  _handleSuccessBanners: function(target, callback, hbs) {  
    var CDN = Tw.Environment.cdn;
    this._bannerTmpl = Handlebars.compile(hbs);

    this.$banners.on({
      beforeChange: function(e, slick, before, after) { // for accessibiltiy (set selected indicator)
        var dots = slick.$dots.find('li');
        $(dots[before])
          .find('> span')
          .text(before + 1);
        slick.$slides[before].setAttribute('tabindex', -1);
        $(dots[after])
          .find('> span')
          .text(Tw.BANNER_DOT_TMPL.replace('{{index}}', after + 1));
        slick.$slides[after].setAttribute('tabindex', 0);
      },
      afterChange: function(e, slick, index) {
        slick.$slides[index].focus();
      }
    });

    if (this.$banners) {  // if banner exist
      if (!this._banners || this._banners.length === 0) { // if banner list is empty
        this.$banners.parents('div.nogaps').addClass('none');
      } else {
        this.$banners.append(this._bannerTmpl({ banners: this._banners, location: target, CDN: CDN })); // render banners

        // set slick
        if (this.$banners.hasClass('fe-banner-auto')) { // auto scrolling
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
            accessibility: false,
            customPaging: function(slider, i) {
              if (i === 0) {
                return $('<span role="button" />').text(Tw.BANNER_DOT_TMPL.replace('{{index}}', i + 1));
              } else {
                return $('<span role="button" />').text(i + 1);
              }
            }
          });
        } else {
          this.$banners.slick({
            dots: this._banners.length !== 1,
            infinite: false,
            speed: 300,
            lazyLoad: 'progressive',
            touchMove: false,
            accessibility: false,
            customPaging: function(slider, i) {
              if (i === 0) {
                return $('<span role="button" />').text(Tw.BANNER_DOT_TMPL.replace('{{index}}', i + 1));
              } else {
                return $('<span role="button" />').text(i + 1);
              }
            }
          });
        }

        // var $mainSlider = $('.home-slider .home-slider-belt');
        // if ($mainSlider.length > 0) {
        //   this.$banners.on({
        //     mousedown: function() {
        //       $mainSlider[0].slick.setOption({
        //         swipe: false
        //       });
        //     },
        //     touchstart: function() {
        //       $mainSlider[0].slick.setOption({
        //         swipe: false
        //       });
        //     },
        //     beforeChange: function() {
        //       $mainSlider[0].slick.setOption({
        //         swipe: false
        //       });
        //     },
        //     afterChange: function() {
        //       $mainSlider[0].slick.setOption({
        //         swipe: true
        //       });
        //     }
        //   });
        // }

        if (callback) { // set callback
          this.$banners.find('img').on('load', callback);
        }
      }
    }
  },

  /**
   * @desc bind event
   * @private
   */
  _bindEvent: function() {
    this.$banners.on('click', '.slick-current', $.proxy(this._openBannerLink, this)); // when click banner
  },

  /**
   * @desc when click the banner
   * @param {Event} e click event object
   */
  _openBannerLink: function(e) {
    var $target = $(e.currentTarget).find('img'),
      idx = $target.data('idx'),
      banner = this._banners[idx];

    if (!banner) {
      return;
    }

    var link = banner.imgLinkUrl;

    if (link) {
      switch (banner.imgLinkTrgtClCd) { 
        case Tw.BANNER_LINK_TYPE.CHANNEL_APP: { // internal link
          window.location.href = link;
          break;
        }
        // case Tw.BANNER_LINK_TYPE.OTHER_WEB:
        default: {  // external link
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

  /**
   * @desc return browser code
   * @returns {string} browser code
   * @private
   */
  _getBrowserCode: function() {
    return Tw.BrowserHelper.isApp() ? 
      Tw.BrowserHelper.isAndroid() ? 
        Tw.REDIS_DEVICE_CODE.ANDROID : 
        Tw.REDIS_DEVICE_CODE.IOS : 
      Tw.REDIS_DEVICE_CODE.MWEB;
  },

  /**
   * @desc set data for presentation
   * @param {string} type Tw.REDIS_BANNER_TYPE.TOS or Tw.REDIS_BANNER_TYPE.ADMIN
   * @param {Array<object>} banners banner list
   * @private
   */
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
            (banner.chnlClCd.indexOf(Tw.REDIS_DEVICE_CODE.MOBILE) >= 0 || banner.chnlClCd.indexOf(browserCode) >= 0) && // only mobile
            (!banner.expsStaDtm || Tw.DateHelper.getDiffByUnit(banner.expsStaDtm.substring(0, 8), today, 'days') <= 0) && // not yet exposure date
            (!banner.expsEndDtm || Tw.DateHelper.getDiffByUnit(banner.expsEndDtm.substring(0, 8), today, 'days') >= 0)  // end of exposure date
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
