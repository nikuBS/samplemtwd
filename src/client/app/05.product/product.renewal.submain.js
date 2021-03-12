/**
 * @file 요금제, 부가서비스, 인터넷/전화/IPTV 서브메인 < 상품
 * @author Kinam Kim
 * @since 2020. 12. 18
 */
Tw.ProductRenewalSubmain = function(rootEl, sectionSort, line, myAge, cdn, menuId) {
  // 전체 레이어 선택 및 생성자 파라미터값 세팅
  this.$container = rootEl;
  this._sectionSort = sectionSort;
  this._menuId = menuId;
  this._line = JSON.parse(line) || {'deviceCode': 'F', 'quickFilterCode': 'F01713'}; // 기본값 세팅
  this._myAge = myAge;
  this._cdn = cdn;

  console.log('-------------------');
  console.log('소팅방법: ', sectionSort);
  console.log('회선라인: ', line);
  console.log('W: 3G, L: LTE, F: 5G, E: 2nd device, P: PPS');
  console.log('cdn:: ', this._cdn);
  console.log('env cdn:: ', Tw.Environment.cdn);
  console.log('-------------------');
  
  // 공통 모듈 선언
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._tidLanding = new Tw.TidLandingComponent();
  this._dateHelper = Tw.DateHelper;
  this._xTractorService = new Tw.XtractorService(rootEl);

  // 부가서비스 (손실보전)에서 사용하는 객체
  this._additionId = '';
  this._additionType = '';
  this._additionAction = '';

  this._getTopBanner(); // 최 상단 배너
  this._getRedisBanner(); // 퀵 필터, 테마 배너, 프로모션 배너 조회
  this._sortingSection(); // 섹션 데이터를 재 배치
  
  this._bindEvent(); // 이벤트 핸들링 바인딩
};

Tw.ProductRenewalSubmain.prototype = { 
  
  /**
   * @desc TOS 배너 코드 리턴
   * @returns {string} TOS 배너 코드
   * @private
   */
  TOS_BANNER_CODES: {
    'mobileplan': '0011',
    'mobileplan-add': '0012',
    'wireplan': '0013'
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$container.on('click', '.login-btn', $.proxy(this._onClickLogin, this)); // 로그인 하기 버튼 이벤트
    
    this.$container.on('click', '.bt-switch', $.proxy(this._onClickPiAgree, this)); // 개인정보 수집이용 동의 시 클릭 이벤트
    this.$container.on('click', '.bt-detail', $.proxy(this._onClickPiDetail, this)); // 개인정보 수집이용 동의 상세보기 (원문) 클릭 이벤트

    this.$container.on('click', '.btn-benefit', $.proxy(this._onClickMore, this)); // 손실보전 혜택 더보기 이벤트
    this.$container.on('click', '.join-additions', $.proxy(this._onClickJoinAdditions, this)) // 부가서비스 가입하기
  },

  /**
   * @desc 상단 배너 로딩 (REDIS)
   */
  _getTopBanner: function() {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: this._getBannerCode(Tw.UrlHelper.getLastPath()) } },
      { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: this._menuId } }
    ]).done($.proxy(this._successTosAdminProductBanner, this))
      .fail($.proxy(this._errorRequest, this));
  }, 

  /**
   * @desc 토스 배너 처리
   * @param resp
   * @private
   */
  _successTosAdminProductBanner: function (banner, admBanner) {
    var result = [
      { target: 'T', banner: banner },
      { target: 'N' } // 2021.03.02 BE 내용 추가
    ];

    result.forEach(function(row) {
      if( row.banner && row.banner.code === Tw.API_CODE.CODE_00 ) {
        if( !row.banner.result.summary ) {
          row.banner.result.summary = { target: row.target };
        }
        row.banner.result.summary.kind = Tw.REDIS_BANNER_TYPE.TOS;
        row.banner.result.imgList = Tw.CommonHelper.setBannerForStatistics(row.banner.result.imgList, row.banner.result.summary);
      } else {
        row.banner = { 
          result: {
            summary : { 
              target: row.target 
            }, 
            imgList : [] 
          } 
        };
      }

      if( admBanner.code === Tw.API_CODE.CODE_00 ) {
        row.banner.result.imgList = row.banner.result.imgList.concat( 
          admBanner.result.banners.filter(function(admbnr) {
            return admbnr.bnnrLocCd === row.target && admbnr.bnnrLocCd !== 'T';
          }).map( function(admbnr) {
            admbnr.kind = Tw.REDIS_BANNER_TYPE.ADMIN;
            if ( admbnr.bnnrImgAltCtt ) {
              admbnr.bnnrImgAltCtt = admbnr.bnnrImgAltCtt.replace(/<br>/gi, ' ');
            }
            return admbnr;
          })
        );
      }
    });

    this._drawTosAdminProductBanner(result);
  },

  /**
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminProductBanner: function (banners) {
    banners.forEach($.proxy(function (bnr) {
      if (bnr.banner.result.bltnYn === 'N') {
        this.$container.find('#fe-banner-t').parents('div.nogaps').addClass('none');
      }

      if (!Tw.FormatHelper.isEmpty(bnr.banner.result.summary) && bnr.banner.result.imgList.length > 0) {
        new Tw.BannerProductService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList, bnr.target, bnr.banner.result.prtyTp, this._cdn);
      } 
    }, this));
    
    new Tw.XtractorService(this.$container);

  },

  /**
   * @desc TOS 배너 노출 여부 확인
   * @param {object} tosBanner 서버 응답
   * @private
   */
  _checkTosBanner: function(tosBanner) {
    return tosBanner.code === Tw.API_CODE.CODE_00 && (tosBanner.result.bltnYn === 'N' || tosBanner.result.tosLnkgYn === 'Y');
  },



 















  /**
   * @desc Redis Banner 데이터 조회
   */
  _getRedisBanner: function() {    
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: this._menuId } },
    ]).done($.proxy(this._successRedis, this))
      .fail($.proxy(this._errorRedis, this));
  }, 

  /**
   * redis에서 값을 가지고 왔을 때
   * @param {*} redisData 
   */
  _successRedis: function(redisData) {
    if( redisData.code === Tw.API_CODE.CODE_00 ) { 
      this._parseQuickFilterRedisData(redisData.result);
      this._parseBannerThemeRedisData(redisData.result);
      this._parsePromotionRedisData(redisData.result);
      
    } else { // redis 결과 값 코드가 '00'(정상 처리)가 아니라면 모든 filter의 html 객체를 삭제.
      this._clearAllFilters();
    }

    
  },


  

  




  /**
   * 퀵 필터 Redis 값을 parsing
   * @param {*} redisData 
   */
  _parseQuickFilterRedisData: function(redisData) {
    var NETWORK_TAG_TYPES = {
      'W' : 'TAG0000202', // 3G
      'L' : 'TAG0000201', // LTE
      'F' : 'TAG0000200', // 5G
      'E' : 'TAG0000203', // 2nd Device
      'P' : 'TAG0000204', // PPS
    }
    
    var networkTagType = NETWORK_TAG_TYPES[this._line.deviceCode];
    var quickFilterParseList = _.reduce(redisData.banners, function(arr, item) {
      if ( item.bnnrLocCd === 'Q' ) { // 퀵 필터 (Q)
        var filter = _.filter(item.tagMappInfo, function(mapping) {
          if ( mapping.tagId === networkTagType ) {
            return item;
          }
        }) || [];
        
        if ( filter.length > 0) {
          arr.push(item);
        }
      }
      return arr;
    }, []);
    
    if ( quickFilterParseList.length > 0 ) { // bnnrExpsSeq 기준으로 정렬
      quickFilterParseList = _.sortBy(quickFilterParseList, 'bnnrExpsSeq');
    }
    
    console.log("=====");
    console.log('퀵 필터에 보여지는 항목은 이거입니다. ', quickFilterParseList);
    console.log("=====");


    this._drawQuickFilterBanner(quickFilterParseList, this); // 퀵 필터 데이터를 draw
  },

  /**
   * 퀵 필터 배너를 랜딩하기 위한 함수
   * @param {*} quickFilterParseList parsing 된 퀵 필터 데이터
   * @param {*} _this this 객체
   */
  _drawQuickFilterBanner: function(quickFilterParseList, _this) {
    if ( quickFilterParseList.length === 0 ) {
      this.$container.find('section[data-sort="QUICK_FILTER"]').addClass('none'); // quick filter 결과값이 없으면 quick filter section을 none한다.
      return;
    } 

    var $quickFilter = this.$container.find('section[data-sort="QUICK_FILTER"]');
    var $sliderList = $quickFilter.find('.slider-list');
    var _super = this;

    var quickFilterHandle = Handlebars.compile(Tw.RENEWAL_PRODUCT_SUBMAIN_QUICKFILTER);
    var html = quickFilterHandle({
      cdn_url: _this._cdn,
      banners: quickFilterParseList
    });

    $sliderList.append(html);

    // 등록된 quick-item에 대한 이벤트 바인딩을 한다.
    $(document).on('click', '.quick-item', function(event) {
      var dataOption = $(this).data('option');
      var dataLink = $(this).data('link');

      if ( dataOption || dataLink ) {
        switch ( dataOption ) {
          case 'B': // 외부링크 이동 시 
            Tw.CommonHelper.openUrlExternal(dataLink);
            break;
          case 'S': // 앱 내 이동 시
            window.location.href = dataLink;
            break;
          case 'N': // 테마 리스트로 이동 시
            var themeTabCode = _super._line.quickFilterCode; // 테마 리스트 탭에 대한 ID
            var themeFilterCode = dataLink; // 테마 리스트에서 출력되어야할 필터 코드 값

            var url = '/product/renewal/mobileplan/list?filters=' + themeTabCode + ',' + themeFilterCode;
            window.location.href = url;
            break;
        }
      }
    });
    
  }, 





  /**
   * 테마 배너 Redis 값을 parsing
   * @param {*} redisData 
   */
  _parseBannerThemeRedisData: function(redisData) {
    var age = this._myAge;

    // 코드값에 유연하게 대응하기 위해 from~to를 지정하여 관리한다.
    // 12세 이하, 24세 이하로 설정되있고 회선을 보유한 사용자의 만 나이가 54세라면 리턴되는 항목은 없고
    // 회선을 보유한 사용자의 만 나이가 22세라면 리턴되는 항목이 존재하게 됨
    var AGE_SCOPE = {
      'TAG0000205' : {'from' : 0, 'to': 999}, // 연령 디폴트 (모든 사용자에게 출력됨) 
      'TAG0000206' : {'from' : 1, 'to': 12}, // 12세 이하 (1~12)
      'TAG0000207' : {'from' : 13, 'to': 18}, // 18세 이하 (13~18)
      'TAG0000208' : {'from' : 18, 'to': 24}, // 24세 이하 (19~24)
      'TAG0000209' : {'from' : 25, 'to': 39}, // 25세 이상 39세 이하 (25~39)
      'TAG0000210' : {'from' : 40, 'to': 64}, // 40세 이상 64세 이하 (40~64)
      'TAG0000211' : {'from' : 65, 'to': 999}, // 65세 이상 (65~999)
    }

    var themeMainTitle = '다양한 요금제를 확인해 보세요';
    var removeIndex = _.map(redisData.banners, function(item) {
      if ( item.bnnrLocCd === 'H' && item.bnnrExpsSeq === '999' ) { 
        // 테마형 배너(H) 이면서 순번이 999번인 경우 해당 item의 title은 테마형 배너의 메인 제목인된다.
        themeMainTitle = item.titleNm;
        return item.bnnrExpsSeq;
      }
    }).indexOf('999');
    if ( removeIndex !== -1 ) { // 999번 인덱스에 해당되는 객체는 삭제한다. (999번 item은 출력되면 안되므로...)
      redisData.banners.splice(removeIndex, 1);
    }

    var themeBannerParseList = _.reduce(redisData.banners, function(arr, item) {
      if ( item.bnnrLocCd === 'H' ) { // 테마형 배너 (H)
        var list = _.reduce(item.tagMappInfo, function(scopeArr, tagItem) {
          if ( Object.keys(AGE_SCOPE).indexOf(tagItem.tagId) > -1 ) { // AGE_SCOPE의 KEY에 해당되는 tagId가 존재하면?
            scopeArr.push(AGE_SCOPE[tagItem.tagId]);
          }

          return scopeArr;
        }, []);

        if ( list.length !== 0 ) {
          var compare = _.filter(list, function(scope) {
            if ( age >= scope.from && age <= scope.to ) { // scope의 범위에 속하는지 체크 
              return true;
            }
          })

          if ( compare.length !== 0 ) {
            arr.push(Object.assign(item, { // 추가적인 정보를 assign 함.
              scopeTarget: Number(age),
              scope: list
            }));
          }              
          return arr;
        }
      }
      return arr;
    }, []);

    console.log("=====");
    console.log('저의 만 나이는 ' + age + '세 입니다..');
    console.log('배너형 테마에 보여지는 항목은 이거입니다. ', themeBannerParseList);
    console.log("=====");

    this._drawThemeBanner(themeMainTitle, themeBannerParseList, this); // 배너형 테마를 draw
  },

  /**
   * 테마형 배너를 랜딩하기 위한 함수
   * @param {*} themeMainTitle 
   * @param {*} bannerThemeParseList 
   * @param {*} _this 
   */
  _drawThemeBanner: function(themeMainTitle, themeBannerParseList, _this) {
    if ( themeBannerParseList.length === 0 ) {
      this.$container.find('section[data-sort="THEME_BANNER"]').addClass('none'); // 테마형 배너가 없으면 결과값이 없으면 테마형 배너의 section을 none한다.
      return;
    } 

    var $themeBanner = this.$container.find('section[data-sort="THEME_BANNER"]');
    var $themeBannerTitle = $themeBanner.find('.article-tit');
    var $sliderList = $themeBanner.find('.slider-list');

    var themeBannerHandle = Handlebars.compile(Tw.RENEWAL_PRODUCT_SUBMAIN_THEME_BANNER);
    var html = themeBannerHandle({
      cdn_url: _this._cdn,
      banners: themeBannerParseList
    });

    $themeBannerTitle.text(themeMainTitle);
    $sliderList.append(html);

    $(document).on('click', '.theme-item', function(event) {
      var dataOption = $(this).data('option');
      var dataLink = $(this).data('link');

      if ( dataOption || dataLink ) {
        switch ( dataOption ) {
          case 'B': // 외부링크 이동 시 
            Tw.CommonHelper.openUrlExternal(dataLink);
            break;
          case 'S': // 앱 내 이동 시
            window.location.href = dataLink;
            break;
        }
      }
    });
  },





  /**
   * 프로모션 Redis 값을 parsing
   * @param {*} redisData 
   */
  _parsePromotionRedisData: function(redisData) {
    var promotionParseList = _.reduce(redisData.banners, function(arr, item) {
      if ( item.bnnrLocCd === 'B' ) { // 프로모션 (B)
        arr.push(item);
      }
      return arr;
    }, []);

    // MASS배너 중 프로모션이 등록된 항목이 1개 이상이라면 그 중 우선순위(bnnrExpsSeq)가 낮은순에 대한 데이터 1개를 가지고 온다.
    // *대전제* 프로모션은 1개의 항목만 출력한다.
    if ( promotionParseList.length > 1 ) {
      promotionParseList = _.sortBy(promotionParseList, 'bnnrExpsSeq').slice(0, 1); // 역순이 필요하면 reverse() function을 사용한다.
    }

    var promotionParseItem = promotionParseList[0] || null;
    this._drawPromotionBanner(promotionParseItem, this); // 프로모션 배너를 draw
  },

  /**
   * 프로모션 배너를 랜딩하기 위한 함수 (프로모션 항목은 최대 1개만 출력됨)
   * @param {*} promotionParseItem 
   * @param {*} _this 
   */
  _drawPromotionBanner: function(promotionParseItem, _this) {
    if ( !promotionParseItem ) {
      this.$container.find('section[data-sort="PROMOTION_THEME"]').addClass('none'); // 테마형 배너가 없으면 결과값이 없으면 테마형 배너의 section을 none한다.
      return;
    } 

    console.log("=====");
    console.log('프로모션에 보여지는 항목은 이거입니다. ', promotionParseItem);
    console.log("=====");

    var $promotion = this.$container.find('section[data-sort="PROMOTION_THEME"]');
    var promotionHandle = Handlebars.compile(Tw.RENEWAL_PRODUCT_SUBMAIN_PROMOTION_BANNER);
    var html = promotionHandle({
      cdn_url: _this._cdn,
      promotion: promotionParseItem
    });

    $promotion.append(html);

    $(document).on('click', '.promotions-item', function(event) {
      var dataOption = $(this).data('option');
      var dataLink = $(this).data('link');

      if ( dataOption || dataLink ) {
        switch ( dataOption ) {
          case 'B': // 외부링크 이동 시 
            Tw.CommonHelper.openUrlExternal(dataLink);
            break;
          case 'S': // 앱 내 이동 시
            window.location.href = dataLink;
            break;
        }
      }
    });

  },








  /**
   * 퀵 필터 데이터 조회 실패 시
   * @param {*} error 
   */
  _errorRedis: function(error) {
    this._clearAllFilters();
  },

  /**
   * 모든 배너 (퀵필터, 테마형 배너, 프로모션) 데이터 html 객체를 삭제
   */
  _clearAllFilters: function() {
    this.$container.find('section[data-sort="QUICK_FILTER"]').addClass('none');
    this.$container.find('section[data-sort="THEME_BANNER"]').addClass('none');
    this.$container.find('section[data-sort="PROMOTION_THEME"]').addClass('none');
  }, 



  















  /**
   * @desc 섹션 데이터(퀵필터, 테마 리스트, 테마 배너)데이터를 정렬 
   */
  _sortingSection: function() {
    var $sections = this.$container.find('section[data-sort]');
    var $sectionTarget = this.$container.find('div[id="section-target"]');

    if ( !$sections || $sections.length == 0 ) { // 섹션 정보가 없으면 그냥 종료
      $sections.removeClass('none');
      return;
    }

    if ( !this._sectionSort ) { // 정렬되어야할 섹션 데이터가 없으면 기본값으로 출력 (퀵필터, 테마리스트, 테마 배너) 순
      $sections.removeClass('none');
      return;
    }

    var sectionList = this._sectionSort.split(',').reverse();
    var isQuickFilter = _.find(sectionList, function(item) {
      return item === 'QUICK_FILTER' ? true : false; // sectionList에 퀵 필터가 있는지 체크
    });
    if ( !isQuickFilter && sectionList.length > 0 ) { // 퀵필터가 없으면 sectionList의 멘 앞에 배치 시킨다.
      sectionList.push('QUICK_FILTER');
    }
    
    for ( var i=0, len=sectionList.length; i < len; i++ ) {
      var sectionName = sectionList[i];
      var $section = $sections.parent().find('section[data-sort="' + sectionName + '"]');

      if ( sectionName && $section ) {
        $section.insertAfter($sectionTarget); // insertAfter로 sectionList의 순차적으로 insert 한다.
      }
    }

    // data-sort를 가진 section 객체의 none을 삭제.
    $sections.removeClass('none');
  },

  /**
   * @desc 로그인 하기 클릭 이벤트
   * @return {void} 
   */
  _onClickLogin: function() {
    var targetUrl = '/product/renewal/mobileplan';
    this._tidLanding.goLogin(targetUrl);
  }, 

  /**
   * @desc 개인정보 수집이용 동의 시 클릭 이벤트
   * @return {void} 
   */
  _onClickPiAgree: function(element) {
    this._onPiAgree();  
  },

  /**
   * @desc 개인정보 수집이용 동의 원문 클릭 이벤트 (액션시트 출력)
   * @return {void} 
   */
  _onClickPiDetail: function(element) {
    var $target = $(element.currentTarget);
    this._apiService.request(Tw.API_CMD.BFF_08_0059, { svcType: 'MM', serNum: '55' })
      .done($.proxy(function(res) {
        if ( res.code === Tw.API_CODE.CODE_00 ) {
          var content = res.result.content;

          this._popupService.open({
            hbs: 'actionsheet_product_pi',
            layer: true,
          }
          , $.proxy(this._onOpenPiPopup, this, $target, content)
          , $.proxy(this._onClosePiPopup, this)
          , 'pi-layer', $target);
        } else {
          Tw.Error(res.code, res.msg).pop();
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },

  /**
   * @desc AD 광고 open callback
   * @private
   */
  _onOpenPiPopup: function(target, content, layer) {
    Tw.CommonHelper.focusOnActionSheet(layer);
    this._slidePopupClose(); // 슬라이딩 팝업 닫을 때

    layer.find('.inner-html').html(content);
    layer.on('click', '#btn-pi-agree', $.proxy(this._onPiAgree, this)); // 동의 버튼 클릭 시 
    layer.on('click', '#btn-pi-close', $.proxy(this._onPiDisagree, this)); // 동의 안함 버튼 클릭 시 
  },

  /**
   * @desc AD 광고 close callback
   */
  _onClosePiPopup: function() {
    // nothing.. 
  },

  /**
   * @desc AD 광고 중 동의 버튼 이벤트
   * @private
   */
  _onPiAgree: function(target) {
    this._apiService.request(Tw.API_CMD.BFF_03_0022, { 'twdInfoRcvAgreeYn': 'Y' })
      .done($.proxy(function(resp) {
        if ( resp.code === Tw.API_CODE.CODE_00 ) {
          $('.pro-recmd-article').addClass('none');

          var today = this._dateHelper.getFullKoreanDate(new Date())
          var toastMsg = today + '\n개인정보 수집·이용에 동의하셨습니다.';
          this._toast(toastMsg);

          this._popupService.close();
        } else {
          return Tw.Error(resp.code, resp.msg).pop();
        }
      }, this))
      .fail($.proxy(function (err) {
        Tw.Error(err.code, err.msg).pop();
      }, this));
  },

  /**
   * @desc AD 광고 중 동의안함 버튼 이벤트
   * @private
   */
  _onPiDisagree: function() {
    this._toast(Tw.TOAST_TEXT.PI_CANCEL);
  },

  /**
   * @desc 손실보전 버튼 혜택 더 보기 클릭 이벤트
   * @return {void} 
   */
  _onClickMore: function() {
    $('.add-service-list li').css('display', 'block');
    $('.btn-benefit').css('display', 'none');
  },

  /**
   * @desc 부가서비스 가입하기 클릭 이벤트
   * @return {void}
   */
  _onClickJoinAdditions: function(element) {
    var $target = $(element.currentTarget);

    this._additionId = $target.data('addition-id');
    this._additionType = $target.data('addition-type');
    this._additionAction = $target.data('addition-action');

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {}) // 로그인 세션 정보를 얻어온다.
      .done($.proxy(this._getSvcInfoRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));

  },   

  /**
   * @desc 사용자 정보 값 확인
   * @param resp - 사용자 정보 응답 값
   * @returns {*|*|void}
   */
  _getSvcInfoRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    switch( this._additionType ) {
      case 'DEFAULT_LINK':
        return this._goDefaultLink(resp);

      case 'CUSTOM_LINK': 
        return this._goCustomLink();

      case 'ACTION_SHEET':
        return this._goActionSheet();
      default: 
        return Tw.Error('', '관리자에게 문의바랍니다.').pop();
    }

  }, 

  /**
   * @desc 가입 화면으로 이동
   * @returns {*}
   */
  _goDefaultLink: function(resp) {
    
    // ID값 없거나, action값이 없으면 에러 출력
    if ( (!this._additionId || Tw.FormatHelper.isEmpty(this._additionId)) || (!this._additionAction || Tw.FormatHelper.isEmpty(this._additionAction) ) ) {
      return Tw.Error('', '이동해야 할 URL이 없습니다.').pop();
    }

    // 로그인한 세션이 없다면 원장으로 이동한다.
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      var targetUrl = '/product/callplan?prod_id=' + this._additionId;
      this._historyService.goLoad(targetUrl);
      return;
    }

    // 사전체크 API 요청
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0007, {}, null, [this._additionId])
      .done($.proxy(this._procAdvanceCheck, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @desc 사전체크 API 응답값 처리
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procAdvanceCheck: function(resp) {
    Tw.CommonHelper.endLoading('.container');
    
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._historyService.goLoad(this._additionAction + '?prod_id=' + this._additionId);
  }, 

  /**
   * @desc 가입 화면이 아닌, custom한 URL로 이동한다.
   * @returns {*}
   */
  _goCustomLink: function() {

    // 액션값이 없으면 에러 페이지를 출력
    if ( !this._additionAction || Tw.FormatHelper.isEmpty(this._additionAction)) {
      return Tw.Error('', '이동해야 할 URL이 없습니다.').pop();
    }

    this._historyService.goLoad(this._additionAction);
  },

  /**
   * @desc 액션시트를 출력
   * @returns {*}
   */
  _goActionSheet: function() {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(function (resp) {
        if (resp.code === Tw.API_CODE.CODE_00) {
          var name = resp.result.mbrNm;
          var phone = Tw.FormatHelper.getDashedCellPhoneNumber(resp.result.svcNum);

          this._popupService.open({
            hbs: 'actionsheet_product_exemption',
            layer: true,
            name: name,
            phone: phone
          }
          , $.proxy(this._onOpenExemptionPopup, this)
          , null
          , 'exemption-layer');

        } else {
          Tw.Error(resp.code, resp.msg).pop();
        }
      }, this));
  },

  /**
   * 단말기 할부금 정보 초기화
   * @param {*} target 
   * @param {*} layer 
   */
  _onOpenExemptionPopup: function(layer) {
    Tw.CommonHelper.focusOnActionSheet(layer);
    this._slidePopupClose(); // 슬라이딩 팝업 닫을 때

    layer.on('click', '.pro-a-btn', $.proxy(this._onFindNewPhone, this)); // 신규 휴대폰 보러가기 버튼 클릭 시 
  },

  /**
   * @desc 신규 휴대폰 보러가기 버튼 클릭 시 
   * @returns {*} 
   */
  _onFindNewPhone: function(element) {
    var target = $(element.currentTarget);

    var url = target.data('url');
    Tw.CommonHelper.openUrlExternal(url);
  },
  
  /**
   * 코드 배너 리턴
   * @param {} uri 
   */
  _getBannerCode: function(uri) {
    return this.TOS_BANNER_CODES[uri];
  },








  /**
   * 팝업 중 slide 로 팝업창을 닫을 때
   */
  _slidePopupClose: function() {
    var page = document.querySelector('.popup-page');
    var button = document.querySelector('.rn-prev-step');

    var startP = 0;
    var moveD = 0;
    var goalY = 0;

    button.addEventListener('touchstart', $.proxy(function(e) {
      startP = e.touches[0].clientY;
    }, this));

    button.addEventListener('touchmove', $.proxy(function(e) {
      moveD = startP - e.touches[0].clientY;
      if (moveD < 0) {
        page.style.transform = 'translateY(' + -1 * moveD + 'px)';
        page.style.transition = 'unset';
      }
    }, this));

    button.addEventListener('touchend', $.proxy(function() {
      goalY = (Math.abs(moveD) > page.clientHeight/5 && moveD < 0) ? page.clientHeight : 0; // 조건 추가

      page.style.transform = 'translateY(' + goalY +'px)';
      page.style.boxShadow = 'none';
      page.style.transition = 'transform 0.2s';
      startP = 0;
      moveD = 0;
    }, this));

    button.addEventListener('click', $.proxy(function() {
      goalY = page.clientHeight;

      page.style.transform = 'translateY(' + goalY + 'px)';
      page.style.boxShadow = 'none';
      page.style.transition = 'transform 0.2s';
      startP = 0;
      moveD = 0;
    }, this));

    page.addEventListener('transitionend', $.proxy(function() {
      if (goalY > 0) {
        this._popupService.close();
      }
    }, this));
  },

  /**
   * Toast 메시지 출력
   * @param {d} message 
   */
  _toast: function (message) {
    setTimeout(function() {
      skt_landing.action.popup.toast({
        url: Tw.Environment.cdn + '/hbs/',
        hbs: 'toast.hbs',
        text: message,
        second: 2
      });
    }, 500)
  },
};
