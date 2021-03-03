/**
 * @file 배너
 * @author Kinam kim
 * @since 2021.01.14
 */

/**
 * @class
 * @param {Object} rootEl the container haven banners
 * @param {string} type Tw.REDIS_BANNER_TYPE.TOS or Tw.REDIS_BANNER_TYPE.ADMIN
 * @param {Array<object>} banners banner list
 * @param {string} target location code
 * @param {string} priority M (admin banner 선노출) or T (tos banner 선노출)
 */

Tw.BannerProductService = function (rootEl, type, banners, target, priority) {
  this.$container = rootEl;
  if ( !banners || banners.length <= 0 ) {
    if ( target ) {
      this.$container.find('#fe-banner-t').parents('div.nogaps').addClass('none');
    }
    return;
  }

  this._cachedElement();
  this._bindEvent();

  if ( !Tw.Environment.init ) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._init, this, type, banners, priority, target));
  } else {
    this._init(type, banners, target, priority);
  }
};

Tw.BannerProductService.prototype = {
  /**
   * @desc initialize
   * @param {string} type Tw.REDIS_BANNER_TYPE.TOS or Tw.REDIS_BANNER_TYPE.ADMIN
   * @param {Array<object>} banners banner list
   * @param {string} target location code
   * @private
   */
  _init: function (type, banners, target, priority) {
    console.log('[banner.product.service.js] [_init] target / priority : ', target + ' / ' + priority);
    this._type = type;
    this._banners = this._getProperBanners(type, banners, priority);
    this._renderBanners(target);
  },

  /**
   * @desc cached jquery object
   */
  _cachedElement: function () {
    this.$banners = this.$container.find('#fe-banner-t');
  },

  /**
   * @desc get banner_product_renewal.hbs
   * @param {string} target Tw.REDIS_BANNER_TYPE.TOS or Tw.REDIS_BANNER_TYPE.ADMIN
   * @private
   */
  _renderBanners: function (target) {
    var CDN = Tw.Environment.cdn;
    CDN = "https://cdnm-dev.tworld.co.kr"

    var hbs = Tw.RENEWAL_PRODUCT_SUBMAIN_TOP_BANNER;
    this._bannerTmpl = Handlebars.compile(hbs);

    this.$banners.on({
      beforeChange: function (e, slick, before, after) { // for accessibiltiy (set selected indicator)
        var dots = slick.$dots.find('li');
        $(dots[before])
          .find('> button')
          .attr({
            text: before + 1,
            'aria-label': before + 1
          });
        $(slick.$slides[before]).find('button').attr('tabindex', -1);
        $(slick.$slides[after]).find('button').attr('tabindex', 0);
        $(dots[after])
          .find('> button')
          .attr({
            text: Tw.BANNER_DOT_TMPL.replace('{{index}}', after + 1),
            'aria-label': Tw.BANNER_DOT_TMPL.replace('{{index}}', after + 1)
          });
      },
      afterChange: function (/* e, slick */) {
        //slick.$slider.find('.slick-current > button').focus();  // 스라이드 될때마다 스크롤이 이동되어 주석처리함
        //$(slick.$slides[index]).find('button').focus();
      }
    });
    
    if ( this.$banners ) {  // if banner exist
      if ( !this._banners || this._banners.length === 0 ) { // if banner list is empty
        this.$banners.parents('div.nogaps').addClass('none');
      } else {
        this.$banners.append(this._bannerTmpl({ banners: this._banners, location: target, CDN: CDN })); // render banners

        var _this = this.$banners;
        _this.slick({
          dots: this._banners.length !== 1,
          infinite: false,
          speed: 300,
          lazyLoad: 'progressive',
          touchMove: false,
          accessibility: false,
          arrows: false,
          customPaging: function (slider, i) {
            if ( i === 0 ) {
              return $('<button />').attr({
                text: Tw.BANNER_DOT_TMPL.replace('{{index}}', i + 1),
                'aria-label': Tw.BANNER_DOT_TMPL.replace('{{index}}', i + 1)
              });
            } else {
              return $('<button />').attr({
                text: i + 1,
                'aria-label': i + 1
              });
            }
          }
        });

        new Tw.XtractorService(this.$banners);
      }
    }
  },

  /**
   * @desc bind event
   * @private
   */
  _bindEvent: function () {
    this.$banners.on('click', '.slick-current', $.proxy(this._openBannerLink, this)); // when click banner
  },

  /**
   * @desc when click the banner
   * @param {Event} e click event object
   */
  _openBannerLink: function (e) {
    var $target = $(e.currentTarget).find('img'),
        idx     = $target.data('idx'),
        banner  = this._banners[idx];

    if ( !banner ) {
      return;
    }

    var link = banner.imgLinkUrl;

    if ( link ) {
      switch ( banner.linkType ) {
        case Tw.TOS_BANNER_LINK_TARGET.NEW_TAB: {
          this._openExternalLink(link, banner.isBill);
          break;
        }
        case Tw.TOS_BANNER_LINK_TARGET.NONE: {
          break;
        }
        case Tw.TOS_BANNER_LINK_TARGET.CURRENT_TAB:
        default: {
          if ( banner.isInternalLink ) {
            window.location.href = link;
          } else {
            this._openExternalLink(link, banner.isBill);
          }
          break;
        }
      }
    }
  },

  _openExternalLink: function (link, isBill) {
    if ( Tw.BrowserHelper.isApp() && isBill ) {
      Tw.CommonHelper.showDataCharge(function () {
        Tw.CommonHelper.openUrlExternal(link);
      });
    } else {
      Tw.CommonHelper.openUrlExternal(link);
    }
  },

  /**
   * @desc return browser code
   * @returns {string} browser code
   * @private
   */
  _getBrowserCode: function () {
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
  _getProperBanners: function (type, banners, priority) {
    var browserCode = this._getBrowserCode(),
        today       = new Date();

    if ( type === Tw.REDIS_BANNER_TYPE.TOS ) {
      return _.chain(banners)
        .sort(function (a, b) {
          return Number(a.bnnrExpsSeq) - Number(b.bnnrExpsSeq);
        })
        .map(function (banner) {
          return $.extend(banner, {
            isHTML: banner.bnnrTypCd === 'H',
            isBill: Tw.TOS_BANNER_LINK_TYPE.INTERNAL.indexOf(banner.tosImgLinkClCd) === -1,
            isInternalLink: Tw.TOS_BANNER_LINK_TYPE.INTERNAL.indexOf(banner.tosImgLinkClCd) > -1,
            linkType: banner.tosImgLinkTrgtClCd,
            bnnrFilePathNm: banner.bnnrFileNm,
            bnnrImgAltCtt: banner.imgAltCtt,
            imgLinkUrl: banner.imgLinkUrl,
            isTos: true
          });
        })
        .value();
    } else if ( type === Tw.REDIS_BANNER_TYPE.ADMIN ) {
      return _.chain(banners)
        .filter(function (banner) {
          return (
            (banner.chnlClCd.indexOf(Tw.REDIS_DEVICE_CODE.MOBILE) >= 0 || banner.chnlClCd.indexOf(browserCode) >= 0) && // only mobile
            // 오늘 날짜가 배너 시작일자와 종료일자에 포함되어야 함
            (!banner.expsStaDtm && !banner.expsEndDtm || (Tw.DateHelper.isBetween(today, banner.expsStaDtm, banner.expsEndDtm)))
          );
        })
        .sort(function (a, b) {
          return Number(a.bnnrExpsSeq) - Number(b.bnnrExpsSeq);
        })
        .reduce(function (nBanners, banner) {
          var temp = {
            isHTML: banner.bnnrTypCd === 'H',
            isBill: banner.billYn === 'Y',
            isInternalLink: banner.imgLinkTrgtClCd === Tw.BANNER_LINK_TYPE.INTERNAL,
            linkType: Tw.TOS_BANNER_LINK_TARGET[_.invert(Tw.BANNER_LINK_TARGET)[banner.linkTypCd]]
          };

          nBanners.push($.extend(banner, temp));

          return nBanners;
        }, [])
        .value();
    } else if ( type === Tw.REDIS_BANNER_TYPE.TOS_ADMIN ) {

      var scrnTypCd = banners.reduce(function (a, b) {
        return b.kind === Tw.REDIS_BANNER_TYPE.ADMIN ? b : a;
      }, {}).scrnTypCd || 'F';

      return _.chain(banners)
        .filter(function (banner) {
          if ( banner.kind === Tw.REDIS_BANNER_TYPE.TOS ) { // 조건 여부 확인 필요
            return true;
          }

          return (
            (banner.chnlClCd.indexOf(Tw.REDIS_DEVICE_CODE.MOBILE) >= 0 || banner.chnlClCd.indexOf(browserCode) >= 0) && // only mobile
            // 오늘 날짜가 배너 시작일자와 종료일자에 포함되어야 함
            (!banner.expsStaDtm && !banner.expsEndDtm || (Tw.DateHelper.isBetween(today, banner.expsStaDtm, banner.expsEndDtm)))
          );
        })
        .sort(function (a, b) {
          var prev = {
            kind: a.kind === Tw.REDIS_BANNER_TYPE.TOS ? 0 : 1,
            bannerType: { 'R': 0, 'C': 1, 'D': 2, 'A': 3 }[(a.tosBatCmpgnSerNum || 'A').substr(0, 1)]
          }, next  = {
            kind: b.kind === Tw.REDIS_BANNER_TYPE.TOS ? 0 : 1,
            bannerType: { 'R': 0, 'C': 1, 'D': 2, 'A': 3 }[(b.tosBatCmpgnSerNum || 'A').substr(0, 1)]
          };

          prev.expSeq = prev.bannerType < 2 ? Number(a.cmpgnStaDt + a.cmpgnStaHm) : Number(a.bnnrExpsSeq);
          next.expSeq = next.bannerType < 2 ? Number(b.cmpgnStaDt + b.cmpgnStaHm) : Number(b.bnnrExpsSeq);

          if ( scrnTypCd === 'R' ) {
            var isTos = prev.kind === Tw.REDIS_BANNER_TYPE.TOS && next.kind === Tw.REDIS_BANNER_TYPE.TOS;
            /**
             * [OP002-8950] 보안 점검에 Math.random 함수 보안이 취약하여 아래와 같이 변경
             * Math.random 만 사용 하는 경우 보완에 취약하여 대체로 window.crypto.getRandomValues 사용
             * 4294967296 : 2**32 (정수로 표현할 수 있는 최대 범위)
             * @see https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Math/random
             * @see https://developer.mozilla.org/ko/docs/Web/API/Crypto/getRandomValues
             */
            var randomNumber = window.crypto.getRandomValues(new Uint32Array(1)) / 4294967296;
            // TOS인경우 랜덤을 적용하지 않음
            return prev.bannerType - next.bannerType || isTos ? prev.expSeq - next.expSeq : Math.floor(randomNumber * 3) - 1;
          } else {
            if ( priority === 'M' ) {
              return prev.expSeq - next.expSeq || prev.bannerType - next.bannerType;
            } else {
              return prev.bannerType - next.bannerType || prev.expSeq - next.expSeq;
            }
          }

        })
        .reduce(function (nBanners, banner) {
          var isTos = banner.kind === Tw.REDIS_BANNER_TYPE.TOS;
          var temp = {
            isHTML: banner.bnnrTypCd === 'H',
            // TOS인경우 기존에 무조건 과금으로 입력된(확인필요함)
            isBill: isTos ? Tw.TOS_BANNER_LINK_TYPE.INTERNAL.indexOf(banner.tosImgLinkClCd) === -1 : banner.billYn === 'Y',
            isInternalLink: isTos ? Tw.TOS_BANNER_LINK_TYPE.INTERNAL.indexOf(banner.tosImgLinkClCd) > -1 :
              banner.imgLinkTrgtClCd === Tw.BANNER_LINK_TYPE.INTERNAL,
            linkType: isTos ? banner.tosImgLinkTrgtClCd : Tw.TOS_BANNER_LINK_TARGET[_.invert(Tw.BANNER_LINK_TARGET)[banner.linkTypCd]]
          };
          if ( isTos ) {
            $.extend(temp, {
              bnnrFilePathNm: banner.bnnrFileNm,
              bnnrImgAltCtt: banner.imgAltCtt,
              imgLinkUrl: banner.imgLinkUrl,
              isTos: true
            });
          }

          nBanners.push($.extend({}, banner, temp));

          return nBanners;
        }, [])
        .value();
    }
  }
};
