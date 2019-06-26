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

    this._renderBanners(type, target, callback);
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
  _renderBanners: function(type, target, callback) {  
    var CDN = Tw.Environment.cdn;

    $.ajax(CDN + '/hbs/banner.hbs', {})
      .done($.proxy(this._handleSuccessBanners, this, type, target, callback))
      .fail($.proxy(this._renderBanners, this, type, target, callback));
  },

  /**
   * @desc after get hbs
   * @param {string} target Tw.REDIS_BANNER_TYPE.TOS or Tw.REDIS_BANNER_TYPE.ADMIN
   * @param {function} callback excutable code after load banners
   * @param {string} hbs 
   * @private
   */
  _handleSuccessBanners: function(type, target, callback, hbs) {  
    var CDN = Tw.Environment.cdn;
    this._bannerTmpl = Handlebars.compile(hbs);

    this.$banners.on({
      beforeChange: function(e, slick, before, after) { // for accessibiltiy (set selected indicator)
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
      afterChange: function(e, slick) {
        //slick.$slider.find('.slick-current > button').focus();  // 스라이드 될때마다 스크롤이 이동되어 주석처리함
        //$(slick.$slides[index]).find('button').focus();
      }
    });

    if (this.$banners) {  // if banner exist
      if (!this._banners || this._banners.length === 0) { // if banner list is empty
        this.$banners.parents('div.nogaps').addClass('none');
      } else {
        this.$banners.append(this._bannerTmpl({ banners: this._banners, location: target, CDN: CDN })); // render banners

        if (type === Tw.REDIS_BANNER_TYPE.TOS) {
          new Tw.XtractorService(this.$banners, true);
        }

        var rollYn = this._banners.reduce(function(a,b){
          return b.kind === Tw.REDIS_BANNER_TYPE.ADMIN? b : a;
        }, {}).rollYn||'Y';

        if(rollYn === 'Y' && this._banners.length > 1){
          //this.$banners.addClass('fe-banner-auto');
          this.$banners.closest('.widget-box').addClass('slider1-auto').data("slider-auto", "true"); // 190610_추가
        }
        
        // set slick
        var _this = this.$banners;
        if (_this.closest('.widget-box').data('slider-auto')) { // auto scrolling
          _this.slick({
            autoplay: true,
            autoplaySpeed: 4000,
            dots: true,
            arrows: true,
            infinite: true,
            speed : 300,
            lazyLoad: 'progressive',
            centerMode: false,
            focusOnSelect: false,
            touchMove : true,
            customPaging: function(slider, i) {
              if (i === 0) {
                return $('<button />').attr(
                  { 
                    text: Tw.BANNER_DOT_TMPL.replace('{{index}}', i + 1),
                    'aria-label': Tw.BANNER_DOT_TMPL.replace('{{index}}', i + 1)
                  }
                );
              } else {
                return $('<button />').attr({
                  text: i + 1,
                  'aria-label': i + 1,
                });
              }
            }
          });

          // 190603 - 자동롤링 시 Play/Stop 버튼 기능 제공 START
          _this.after($('<button type="button" class="tod-bann-btn stop"><span class="blind">일시정지</span></button>')); // 190610_추가
          _this.next('button.tod-bann-btn').on('click', function () {
              _this.slick($(this).hasClass('stop') ? 'slickPause' : 'slickPlay');
              $(this).find('.blind').html($(this).hasClass('stop') ? '재생' : '일시정지');
              $(this).toggleClass('stop', !$(this).hasClass('stop'));
          });
          // 190603 - 자동롤링 시 Play/Stop 버튼 기능 제공 END

        } else {
          _this.slick({
            dots: this._banners.length !== 1,
            infinite: false,
            speed: 300,
            lazyLoad: 'progressive',
            touchMove: false,
            accessibility: false,
            arrows: false,
            customPaging: function(slider, i) {
              if (i === 0) {
                return $('<button />').attr(
                  { 
                    text: Tw.BANNER_DOT_TMPL.replace('{{index}}', i + 1),
                    'aria-label': Tw.BANNER_DOT_TMPL.replace('{{index}}', i + 1)
                  }
                );
              } else {
                return $('<button />').attr({
                  text: i + 1,
                  'aria-label': i + 1
                });
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
      switch (banner.linkType) {
        case Tw.TOS_BANNER_LINK_TARGET.NEW_TAB: {
          this._openExternalLink(link, banner.isBill);
          break;
        }
        case Tw.TOS_BANNER_LINK_TARGET.NONE: {
          break;
        }
        case Tw.TOS_BANNER_LINK_TARGET.CURRENT_TAB:
        default: {
          if (banner.isInternalLink) {
            window.location.href = link;
          } else {
            this._openExternalLink(link, banner.isBill);
          }
          break;
        }
      }
    }
  },

  _openExternalLink: function(link, isBill) {
    if (Tw.BrowserHelper.isApp() && isBill) {
      Tw.CommonHelper.showDataCharge(function() {
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
        .map(function(banner) {
          return $.extend(banner, {
            isHTML: banner.bnnrTypCd === 'H',
            isBill: true,
            isInternalLink: banner.tosImgLinkClCd === Tw.TOS_BANNER_LINK_TYPE.INTERNAL,
            linkType: banner.tosImgLinkTrgtClCd,
            bnnrFilePathNm: banner.bnnrFileNm,
            bnnrImgAltCtt: banner.imgAltCtt,
            imgLinkUrl: banner.imgLinkUrl,
            isTos: true
          });
        })
        .value();
    } else if(type === Tw.REDIS_BANNER_TYPE.ADMIN) {
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
            isInternalLink: banner.imgLinkTrgtClCd === Tw.BANNER_LINK_TYPE.INTERNAL,
            linkType: Tw.TOS_BANNER_LINK_TARGET[_.invert(Tw.BANNER_LINK_TARGET)[banner.linkTypCd]]
          };

          nBanners.push($.extend(banner, temp));

          return nBanners;
        }, [])
        .value();
    }else if(type === Tw.REDIS_BANNER_TYPE.TOS_ADMIN){
       
      var scrnTypCd = banners.reduce(function(a,b){
        return b.kind === Tw.REDIS_BANNER_TYPE.ADMIN? b : a;
      }, {}).scrnTypCd||'F';

      return _.chain(banners)
        .filter(function(banner) { 
          if(banner.kind === Tw.REDIS_BANNER_TYPE.TOS){ // 조건 여부 확인 필요
            return true;
          }

          return (
            (banner.chnlClCd.indexOf(Tw.REDIS_DEVICE_CODE.MOBILE) >= 0 || banner.chnlClCd.indexOf(browserCode) >= 0) && // only mobile
            (!banner.expsStaDtm || Tw.DateHelper.getDiffByUnit(banner.expsStaDtm.substring(0, 8), today, 'days') <= 0) && // not yet exposure date
            (!banner.expsEndDtm || Tw.DateHelper.getDiffByUnit(banner.expsEndDtm.substring(0, 8), today, 'days') >= 0)  // end of exposure date
          );
        })
        .sort(function(a, b) {
          var prev = {kind: a.kind === Tw.REDIS_BANNER_TYPE.TOS?0:1, expSeq: Number(a.bnnrExpsSeq)}
            , next = {kind: b.kind === Tw.REDIS_BANNER_TYPE.TOS?0:1, expSeq: Number(b.bnnrExpsSeq)};
          
          if(scrnTypCd === 'R'){
            return prev.kind - next.kind || Math.floor(Math.random() * 3) -1;
          }else{
            return prev.kind - next.kind || prev.expSeq - next.expSeq;
          }          
          
        })
        .reduce(function(nBanners, banner) {
          var isTos = banner.kind === Tw.REDIS_BANNER_TYPE.TOS;
          var temp = {
            isHTML: banner.bnnrTypCd === 'H',
            isBill: !isTos? banner.billYn === 'Y' : true, // TOS인경우 기존에 무조건 과금으로 입력된(확인필요함)
            isInternalLink: isTos? banner.tosImgLinkClCd === Tw.TOS_BANNER_LINK_TYPE.INTERNAL : banner.imgLinkTrgtClCd === Tw.BANNER_LINK_TYPE.INTERNAL,
            linkType: isTos? banner.tosImgLinkTrgtClCd : Tw.TOS_BANNER_LINK_TARGET[_.invert(Tw.BANNER_LINK_TARGET)[banner.linkTypCd]]
          };
          if(isTos){
            $.extend(temp, {
              bnnrFilePathNm: banner.bnnrFileNm,
              bnnrImgAltCtt: banner.imgAltCtt,
              imgLinkUrl: banner.imgLinkUrl,
              isTos: true
            })
          }

          nBanners.push($.extend(banner, temp));

          return nBanners;
        }, [])
        .value();
    }
  }
};
