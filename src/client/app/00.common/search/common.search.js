/**
 * @file common.search.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.11
 */

/**
 * @class
 * @desc 검색 결과 화면
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} searchInfo - 검색 결과
 * @param {String} cdn – cdn 서버 주소
 * @param {String} step – 검색 진입점으로부터 페이지 이동 횟수
 * @param {String} from – 결과 요청 위치
 * @param {String} nowUrl – 현재 url
 * @returns {void}
 */
Tw.CommonSearch = function (rootEl, searchInfo, cdn, step, from, sort, nowUrl) {
  this._cdn = cdn;
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._bpcpService = Tw.Bpcp;
  this._svcInfo = null;
  this._searchInfo = searchInfo;
  this._step = Tw.FormatHelper.isEmpty(step) ? 1 : step;
  this._sort = sort;
  this._from = from;
  this._sortCd = null;
  this._nowUrl = nowUrl;
  this._requestRealTimeFeeFlag = false;
  this._selectedCollectionToChangeSort = '';
  this._reqOptions = {
    collectionPriority: 'immediate-01.smart-02.shortcut-03.rate-04.service-05.tv_internet-06.bundle-07.troaming-08' +
      '.tapp-09.direct-10.tmembership-11.event-12.sale-13.as_outlet-14.question-15.notice-16.prevent-17.manner-18' +
      '.serviceInfo-19.siteInfo-20.lastevent-21.banner-22',
    sortCd: 'shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.tapp-D.direct-D.tmembership-R.event-D.sale-C' +
      '.as_outlet-R.question-D.notice-D.prevent-D.manner-D.serviceInfo-D.siteInfo-D.bundle-A'
  };
  this._autoCompleteRegExObj = {
    fontColorOpen: new RegExp('<font style=\'color:#CC6633\'>', 'g'),
    fontSizeOpen: new RegExp('<font style=\'font-size:12px\'>', 'g'),
    fontClose: new RegExp('</font>', 'g')
  };
  this._exceptionDocId = {
    'D00003': {
      link: '/customer/svc-info/site#mobile'
    },
    'D00004': {
      link: '/customer/svc-info/site/mcenter'
    },
    'C00001': {
      link: Tw.OUTLINK.DIRECTSHOP_GUIDE_LINK.common + Tw.OUTLINK.DIRECTSHOP_GUIDE_LINK.discount
    }
  };
  this._tidLanding = new Tw.TidLandingComponent();
  this._commonSearchShop = null;
};

Tw.CommonSearch.prototype = {
  _ACTION_SHEET_HBS: 'actionsheet01',
  /**
   * @function
   * @desc 실제 초기화
   * @returns {void}
   */
  _nextInit: function () {
    Tw.Logger.info('[common.search] [_nextInit]', '');

    Tw.Logger.info('[common.search] [_nextInit] document.referer : ', document.referrer);

    this._recentKeywordDateFormat = 'YY.M.D.';
    this._todayStr = Tw.DateHelper.getDateCustomFormat(this._recentKeywordDateFormat);

    // 로그인 여부? (로그인 시 서비스관리번호, 비로그인 시 logOutUser)
    this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo) ? 'logOutUser' : this._svcInfo.svcMgmtNum;

    this._platForm = Tw.BrowserHelper.isApp() ? 'app' : 'web';

    // 검색결과 데이터
    Tw.Logger.info('[common.search] [_nextInit] 검색 결과 collection sort 정보 : ', this._searchInfo.collectionSort);
    this._reqOptions.collectionPriority = this._searchInfo.collectionSort;
    this._searchInfo.search = this._setRank(this._searchInfo.search);

    this._bpcpService.setData(this.$container, this._nowUrl);

    this.$ariaHiddenEl = this.$container.find('.fe-aria-hidden-el');

    // 검색결과가 존재하지 않으면 이후 로직을 수행하지 않도록 하기 위한 처리
    if ( this._searchInfo.totalcount === 0 ) {
      return;
    }
    Tw.Logger.info('[common.search] [_nextInit] 검색 결과 정보 : ', this._searchInfo.search);
    if ( !this._commonSearchShop ) {
      this._commonSearchShop = new Tw.CommonSearchShop(this);
    }

    // var keyName,contentsCnt;
    var keyName, contentsCnt; // 이전일
    var totalCnt = 0;
    // var rank;
    // var redirectYn = 'Y';   // 이전일
    // var redirectCollection = '';  // 이전일

    // 상하 스크롤시 카테고리 영역 고정되도록 처리
    this.$categoryArea = this.$container.find('.tod-srhcategory-scrwrap');

    // 카테고리 스와이프 영역 템플릿을 만들어준다. (껍데기만 생성)
    this._categoryInit();

    for ( var i = 0; i < this._searchInfo.search.length; i++ ) {
      keyName = Object.keys(this._searchInfo.search[i])[0];
      contentsCnt = Number(this._searchInfo.search[i][keyName].count);

      if ( keyName === 'smart' || keyName === 'immediate' || keyName === 'banner' || keyName === 'lastevent' ) {
        if ( keyName === 'banner' ) {
          this._showBanner(this._arrangeData(this._searchInfo.search[i][keyName].data, keyName));
        }
        if ( keyName === 'immediate' && this._searchInfo.search[i][keyName].data[0] ) {
          if ( Number(this._searchInfo.search[i][keyName].data[0].DOCID) === 5 ) {  // T멤버십
            this._showBarcode(this._searchInfo.search[i][keyName].data[0].barcode, this.$container.find('#membership-barcode'));
          } else if ( Number(this._searchInfo.search[i][keyName].data[0].DOCID) === 2 ) {  // 데이터 잔여량
            this._calculdateRemainData(this._searchInfo.search[i][keyName].data[0].subData);
          } else if ( Number(this._searchInfo.search[i][keyName].data[0].DOCID) === 3 && this._nowUser !== 'logOutUser' ) {  // 실시간 요금
            this._requestRealTimeFeeFlag = true;
          } else if ( Number(this._searchInfo.search[i][keyName].data[0].DOCID) === 7 ) {  // 부가서비스
            this._calculateAdditionsFee(this._searchInfo.search[i][keyName].data[0].subData);
          } else if ( Number(this._searchInfo.search[i][keyName].data[0].DOCID) === 8 ) {  // 음성 잔여량
            this._calculateRemainVoice(this._searchInfo.search[i][keyName].data[0].subData);
          } else if ( Number(this._searchInfo.search[i][keyName].data[0].DOCID) === 9 ) {  // 요금약정할인
            this._requestFeeAgrmntDiscountInfo(this._searchInfo.search[i][keyName].data[0].subData);
          } else if ( Number(this._searchInfo.search[i][keyName].data[0].DOCID) === 10 ) {  // 단말기 할부금
            this._requestEqpInstallmentInfo(this._searchInfo.search[i][keyName].data[0].subData);
          }
        }
        if ( keyName === 'smart' ) {
          this._showSmart(this._searchInfo.search[i][keyName].data[0]);
        }
        if ( keyName === 'lastevent' ) {
          // 노출요건이 없음
        }
        continue;
      } else {
        var categoryStr = '.fe-' + keyName + '-count';

        if ( contentsCnt < 1 ) {
          // 검색결과가 존재하지 않는 카테고리를 돔에서 삭제한다.
          $(categoryStr).parents('li').remove();
        } else {
          // 이전일 [S]
          // shortcut collection 의 검색결과가 존재하지 않는다면 rank 값이 1인 collection 상세로 리다이렉트 필요 (현업 요구사항 OP002-5939)
          // if (keyName === 'shortcut') {
          //   redirectYn = 'N';
          // } else {
          //   rank = Number(this._searchInfo.search[i][keyName].rank);

          //   if (rank === 1) {
          //     redirectCollection = keyName;
          //   }
          // }
          // 이전일 [E]

          // 검색결과가 존재하는 카테고리에 검색건수를 입력한다.
          $(categoryStr).text(contentsCnt);
        }

        // totalCnt += contentsCnt;
      }

      this._showShortcutList(this._arrangeData(this._searchInfo.search[i][keyName].data, keyName), keyName, this._cdn, 'init');
    } // end for
    Tw.Logger.info('[common.search] [_nextInit]', '검색결과 데이터 및 카테고리 영역 노출/제거 처리 완료');

    // 이전일 [S]
    // if (Tw.CommonHelper.getCookie('doSearch') === 'Y') {
    // 직접 검색을 통해서 진입한 경우
    // Tw.Logger.info('[common.search] [_nextInit]', '"doSearch" Cookie 삭제');
    // Tw.CommonHelper.setCookie('doSearch', '');

    // if (redirectYn === 'Y') {


    //   // 선택한 컬렉션의 정렬기준
    //   var sort = this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(redirectCollection + '-') + redirectCollection.length + 1,
    //                                                this._reqOptions.sortCd.indexOf(redirectCollection + '-') + redirectCollection.length + 2);

    //   // 검색어
    //   var keyword = this._searchInfo.query;
    //   Tw.Logger.info('[common.search] [_nextInit] 입력된 검색어 : ', keyword);

    //   // 결과내 재검색어 (결과내 재검색 아닌 경우 검색어와 동일)
    //   var inKeyword = this._searchInfo.researchQuery;
    //   Tw.Logger.info('[common.search] [_nextInit] 입력된 결과내 재검색 키워드 : ', inKeyword);

    //   // 카테고리 클릭시 이동할 링크 정보
    //   var url = '/common/search/more?keyword=' + keyword + '&step=' + (Number(this._step) + 1) + '&category=' +
    //   redirectCollection + '&sort=' + sort;
    //   // var url = '/common/search/more?keyword=' + keyword + '&step=' + this._step + '&category=' + redirectCollection + '&sort=' + sort;

    //   if (keyword !== inKeyword) {
    //     inKeyword = inKeyword.replace(keyword, '');
    //     url = url + '&in_keyword=' + inKeyword.trim();
    //   }

    //   window.location.href = url;

    //   Tw.Logger.info('[common.search] [_nextInit]', '요기 찍히나?');
    //   return ;
    // }
    // }

    // 이전일 [E]
    Tw.Logger.info('[common.search] [_nextInit]', '요기는?');
    // 카테고리 영역을 모두 그려주고 나서 해당 스와이프 영역의 width 를 동적으로 맞춰주기 위한 처리.
    $('#fe-category-slide').addClass('horizontal');
    $('#fe-category-slide').removeData('event');
    skt_landing.widgets.widget_horizontal($('.widget'));
    Tw.Logger.info('[common.search] [_nextInit]', '카테고리 영역 width 를 가변적으로 조정해주는 처리 완료');

    // 선택된 카테고리를 화면 좌측으로 붙여서 노출해주기 위한 처리
    var categoryTop = $('.tod-srhcategory-scrwrap').offset().top;
    var $categoryOn = $('#fe-category-area').find('li.on');
    var leftPosition = $categoryOn.offset().left - (($('#fe-category-area').width() / 2) - ($categoryOn.width() / 2));

    $(window).on('scroll', function () {
      $('.tod-srhcategory-scrwrap').toggleClass('fixed', ($(window).scrollTop() + $('.searchbox-header').height()) > categoryTop);
    });
    Tw.Logger.info('[common.search] [_nextInit]', '상하 스크롤 시 카테고리 영역을 헤더 (검색창 영역) 에 fix 하여 고정적으로 노출해주기 위한 처리 완료');

    setTimeout(function () {
      $('#fe-category-area').scrollLeft(leftPosition);
    }, 0);
    Tw.Logger.info('[common.search] [_nextInit]', '카테고리 영역 내에서 선택된 카테고리를 가장 좌측으로 붙여서 노출해주기 위한 처리 완료');

    // TEST 
    Tw.Logger.info('[common.search] [_nextInit] searchInfo: ', this._searchInfo);
    totalCnt = this._searchInfo.totalcount;
    this.$container.find('.fe-total-count').each(function (a, b) {
      var $target = $(b);
      $target.text(totalCnt);
    });
    Tw.Logger.info('[common.search] [_nextInit]', '카테고리 영역 내 "전체" 카테고리 및 검색결과 총 건수 영역에 결과건수 노출 처리 완료');

    this.$inputElement = this.$container.find('#keyword');
    this.$inputElement.on('keyup', $.proxy(this._inputChangeEvent, this));
    this.$inputElement.on('focus', $.proxy(this._inputFocusEvt, this));
    this.$container.on('click', '.icon-gnb-search, .fe-search-link', $.proxy(this._doSearch, this));
    this.$container.on('touchstart click', '.close-area', $.proxy(this._closeSearch, this));
    Tw.Logger.info('[common.search] [_nextInit]', '검색창 이벤트 바인딩 완료');

    this.$inputElementResultSearch = this.$container.find('#resultSearchKeyword');
    this.$inputElementResultSearch.on('keyup', $.proxy(this._keyInputEvt, this));
    if ( this._searchInfo.query !== this._searchInfo.researchQuery ) {
      var tempstr = this._searchInfo.researchQuery.replace(this._searchInfo.query, '');
      tempstr = tempstr.trim();
      this.$inputElementResultSearch.attr('value', tempstr);
    }
    this.$container.on('click', '.btn-search', $.proxy(this._doResultSearch, this));
    Tw.Logger.info('[common.search] [_nextInit]', '결과내 재검색 검색창 이벤트 바인딩 완료');


    this.$container.on('click', '.icon-historyback-40', $.proxy(this._historyService.goBack, this));
    this.$container.on('click', '.search-element', $.proxy(this._searchRelatedKeyword, this));   // 연관검색어 이벤트 바인딩
    this.$container.on('click', '.list-data', $.proxy(this._goLink, this));  // 검색결과로 리스트업된 컨텐츠 클릭시 이벤트 바인딩

    this.$container.on('click', '[data-url]', $.proxy(this._goUrl, this));    // 컬렉션별 검색결과 상세로 이동하기 클릭시 이벤트 바인딩
    this.$container.on('click', '#fe-btn-feedback', $.proxy(this._showClaimPopup, this)); // 검색개선의견 보내기 이벤트 바인딩
    this.$container.on('click', '#fe-btn-top', $.proxy(function (e) {   // TOP 버튼 클릭시 이벤트 바인딩
      e.preventDefault();
      $(window).scrollTop(0);
    }, this));
    this.$container.on('click', '.acco-tit', $.proxy(function(e) { // 바로가기 자식 아코디언 열림/닫힘 이벤트 바인딩
        var $target = $(e.currentTarget).parent(); // 바로 상위 
        $target.toggleClass('on');
        if ($target .hasClass('on')) {
          $target.find('button').attr('aria-pressed', true);
        } else {
          $target .find('button').attr('aria-pressed', false);
        }
    }, this))

    this.$container.on('click', '.fe-category', $.proxy(this._selectCategory, this));    // 카테고리 클릭시 이벤트 바인딩
    // this.$container.on('click','#fe-more-rate',function(e){
    //   e.preventDefault();
    // });
    this.$container.on('click', '.fe-sort', $.proxy(this._onClickChangeSort, this));  // 정렬기준 클릭시 이벤트 바인딩
    // this.$container.on('click', '#fe-more-rate', $.proxy(this._sortRate, this));

    // this.$container.on('change','.resultsearch-box > .custom-form > input',$.proxy(
    //   function(e) {this.$container.find('.resultsearch-box > label').toggleClass('on',$(e.currentTarget).prop('checked'));}
    // ,this));

    this._recentKeywordInit();
    this._recentKeywordTemplate = Handlebars.compile($('#recently_keyword_template').html());
    this._autoCompleteKeywrodTemplate = Handlebars.compile($('#auto_complete_template').html());
    this._removeDuplicatedSpace(this.$container.find('.cont-sp'), 'cont-sp');
    if ( this._from === 'menu' && this._historyService.isReload() === false && !this._historyService.isBack() ) {
      this._addRecentlyKeyword(this._searchInfo.query);
    }
    new Tw.XtractorService(this.$container);
    this._closeKeywordListBase();
    if ( this._requestRealTimeFeeFlag ) {
      Tw.CommonHelper.startLoading('.container-wrap', 'white');
      this._requestRealTimeFee(0);
    }
    // this.$container.find('.container').removeClass('none');

    if ( this._platForm !== 'app' ) {
      $('#fe-post-bnnr').show();
    }

    // 레이어팝업 닫기 또는 뒤로 가기 등을 통하여 진입한 경우 scroll_position 쿠키에 저장된 스크롤 위치로 화면을 이동시켜준다.
    var scrollPosition = Tw.CommonHelper.getCookie('scroll_position');
    Tw.Logger.info('[common.search] [_nextInit] scrollPosition Cookie : ', scrollPosition);

    if ( scrollPosition && scrollPosition !== '' && scrollPosition !== 'undefined' ) {
      // 저장된 스크롤 위치로 화면 이동
      $(window).scrollTop(scrollPosition);
      // 쿠키 초기화
      Tw.CommonHelper.setCookie('scroll_position', '');
    }


    // 최근 검색어 클릭시 초기화
    this.$container.on('click', '#auto_complete_list li, #recently_keyword_list li a', function (/* e */) {
      Tw.CommonHelper.setCookie('search_sort::rate', 'A');
      Tw.CommonHelper.setCookie('search_sort::service', 'A');
      Tw.CommonHelper.setCookie('search_sort::tv_internet', 'A');
      Tw.CommonHelper.setCookie('search_sort::troaming', 'A');
      Tw.CommonHelper.setCookie('search_sort::direct', 'D');
    });

    function sortCodeToName(code) {
      if ( code === 'A' ) return '추천순';
      if ( code === 'H' ) return '높은 가격순';
      if ( code === 'L' ) return '낮은 가격순';
      if ( code === 'D' ) return '최신순';
    }

    // 뒤로가기 초기화 정렬 초기화 처리
    $(window).bind('pageshow', function (event) {
      if ( event.originalEvent.persisted ) {
      } else {
        console.log('화면진입 sort 재정렬');
        $('.fe-btn-sort-rate').text(sortCodeToName(Tw.CommonHelper.getCookie('search_sort::rate')));
        $('.fe-btn-sort-service').text(sortCodeToName(Tw.CommonHelper.getCookie('search_sort::service')));
        $('.fe-btn-sort-tv_internet').text(sortCodeToName(Tw.CommonHelper.getCookie('search_sort::tv_internet')));
        $('.fe-btn-sort-troaming').text(sortCodeToName(Tw.CommonHelper.getCookie('search_sort::troaming')));
        $('.fe-btn-sort-direct').text(sortCodeToName(Tw.CommonHelper.getCookie('search_sort::direct')));
      }
    });

  },
  /**
   * @function
   * @desc 카테고리 초기화 (카테고리 템플릿을 그려준다. 데이터 바인딩은 하지 않음)
   * @returns {void}
   */
  _categoryInit: function () {
    Tw.Logger.info('[common.search] [_categoryInit]', '');
    // 카테고리 템플릿 그리기
    var $categoryHtml = $('#common_template').html();
    var $categoryHtmlTemplate = Handlebars.compile($categoryHtml);
    $('.tod-srhcategory-scrwrap').append($categoryHtmlTemplate);
  },
  /**
   * @function
   * @param {Array} 검색 결과
   * @desc 카테고리 정렬
   * @returns {Array}
   */
  _setRank: function (data) {
    var compareKeyName1, compareKeyName2, rank1, rank2;
    Tw.Logger.info('[common.search] [_setRank] 컬렉션 노출순서 조정 전 데이터 : ', data);

    for ( var i = 0; i < data.length; i++ ) {
      for ( var j = 0; j < (data.length - i - 1); j++ ) {
        compareKeyName1 = Object.keys(data[j])[0];
        compareKeyName2 = Object.keys(data[j + 1])[0];

        rank1 = this._reqOptions.collectionPriority.substring(
          this._reqOptions.collectionPriority.indexOf(compareKeyName1 + '-') + compareKeyName1.length + 1,
          this._reqOptions.collectionPriority.indexOf(compareKeyName1 + '-') + compareKeyName1.length + 3);
        rank2 = this._reqOptions.collectionPriority.substring(
          this._reqOptions.collectionPriority.indexOf(compareKeyName2 + '-') + compareKeyName2.length + 1,
          this._reqOptions.collectionPriority.indexOf(compareKeyName2 + '-') + compareKeyName2.length + 3);

        // Tw.Logger.info('[common.search] [_setRank]', compareKeyName1 + '의 노출우선순위 : ' + rank1);
        // Tw.Logger.info('[common.search] [_setRank]', compareKeyName2 + '의 노출우선순위 : ' + rank2);

        if ( Tw.FormatHelper.isEmpty(rank1) ) {
          rank1 = '99';
        }
        if ( Tw.FormatHelper.isEmpty(rank2) ) {
          rank2 = '99';
        }

        if ( parseInt(rank1, 10) > parseInt(rank2, 10) ) {
          var tmp = data[j];
          data[j] = data[j + 1];
          data[j + 1] = tmp;
        }
      }
    }

    Tw.Logger.info('[common.search] [_setRank] 컬렉션 노출순서 조정 후 데이터 : ', data);

    return data;
  },
  /**
   * @function
   * @desc 검색창 input 이벤트
   * @returns {void}
   */
  _keyInputEvt: function (inputEvtObj) {
    inputEvtObj.preventDefault();

    if ( Tw.InputHelper.isEnter(inputEvtObj) ) {
      this._doResultSearch();
    }
  },
  /**
   * @function
   * @desc 실제 초기화
   * @param {Array} data - 카테고리별 검색 데이터
   * @param {String} category - 카테고리명
   * @returns {Array}
   */
  _arrangeData: function (data, category) {
    if ( !data ) {
      return [];
    }
    var resultSearchKeyword = '';
    // 결과내 재검색 인 경우
    if ( this._searchInfo.query !== this._searchInfo.researchQuery ) {
      resultSearchKeyword = this._searchInfo.researchQuery.replace(this._searchInfo.query, '').trim();
    }
    Tw.Logger.info('[common.search] [_arrangeData] 결과내 재검색 키워드 : ', resultSearchKeyword);

    // 5개까지만 노출해달라는 요건으로 인한 처리. (T app 은 8개)
    // 와이즈넛 엔진에서 전달주는 결과값 개수 조정이 가능하다면 아래 로직은 삭제 처리 필요
    if ( category !== 'tapp' ) {
      if ( data.length > 5 ) {
        data.splice(5, data.length);
      }
    } else {
      if ( data.length > 8 ) {
        data.splice(8, data.length);
      }
    }


    for ( var i = 0; i < data.length; i++ ) {
      for ( var key in data[i] ) {
        if ( key === 'PR_STA_DT' || key === 'PR_END_DT' ) {
          data[i][key] = Tw.DateHelper.getShortDate(data[i][key]);
        }
        if ( typeof (data[i][key]) === 'string' ) {
          // 검색어와 매칭되는 곳에 하이라이트 처리

          if ( data[i][key].indexOf('<!HS>') !== -1 || data[i][key].indexOf('<!HE>') !== -1 ) {
            data[i][key] = data[i][key].replace(/<!HS>/g, '<em class="tod-highlight-text">');
            data[i][key] = data[i][key].replace(/<!HE>/g, '</em>');

            Tw.Logger.info('[common.search] [_arrangeData] 하이라이트 처리 : ', data[i][key]);
          }
        }
        if ( key === 'DEPTH_PATH' ) {
          if ( data[i][key].charAt(0) === '|' ) {
            data[i][key] = data[i][key].replace('|', '');
          }
        }
        if ( category === 'direct' && key === 'TYPE' ) {
          if ( data[i][key] === 'shopacc' ) {
            if ( data[i].PRODUCT_TYPE !== '' ) {
              data[i].linkUrl = Tw.OUTLINK.DIRECT_IOT + '?categoryId=' + data[i].CATEGORY_ID + '&productId=' +
                data[i].ACCESSORY_ID + '&productType=' + data[i].PRODUCT_TYPE;
            } else {
              data[i].linkUrl = Tw.OUTLINK.DIRECT_ACCESSORY + '?categoryId=' + data[i].CATEGORY_ID + '&accessoryId=' + data[i].ACCESSORY_ID;
            }
          } else {
            data[i].linkUrl = Tw.OUTLINK.DIRECT_MOBILE + '?categoryId=' + data[i].CATEGORY_ID + '&productGrpId=' + data[i].PRODUCT_GRP_ID;
          }
        }
        if ( key === 'METATAG' ) {
          if ( data[i][key].indexOf('#') !== -1 ) {
            data[i][key] = data[i][key].split('#');

            if ( data[i][key][0] === '' ) {
              data[i][key].splice(0, 1);
            }
          }
        }
        if ( key === 'IMG' ) {
          var tempArr = data[i][key].split('<IMG_ALT>');
          data[i][key] = tempArr[0].replace(/\/n/g, '');
          if ( tempArr[1] ) {
            data[i].IMG_ALT = tempArr[1];
          }
        }
        if ( key === 'MENU_URL' && data[i][key].indexOf('http') !== -1 ) {
          data[i].tagTitle = Tw.COMMON_STRING.OPEN_NEW_TAB;
        }
      }
    }
    return data;
  },
  /**
   * @function
   * @desc 바코드 출력
   * @param {String} barcodeNum - 바코드 번호
   * @param {Object} $barcodeElement - 바코드 jquery 객체
   * @returns {void}
   */
  _showBarcode: function (barcodeNum, $barcodeElement) {
    $barcodeElement.JsBarcode(barcodeNum, { background: '#edeef0', height: 60, displayValue: false });
    this.$container.find('.bar-code-num').text(barcodeNum);
  },
  /**
   * @function
   * @desc 바코드 출력
   * @param {String} barcodNum - 바코드 번호
   * @param {Object} $barcodElement - 바코드 jquery 객체
   * @returns {void}
   */
  _showShortcutList: function (data, dataKey, cdn, gubun) {
    // console.log("data => ", data, dataKey, cdn, gubun);
    // 지난이벤트 컬렉션이 추가되었지만 티월드 노출 요건이 없으므로 예외처리함.
    if ( dataKey !== 'lastevent' ) {

      if ( gubun !== 'sort' ) {
        $('.container').append(Handlebars.compile($('#' + dataKey + '_base').html()));
      }

      var $template = $('#' + dataKey + '_template');
      var shortcutTemplate = $template.html();
      var templateData = Handlebars.compile(shortcutTemplate);

      var $list = $('#' + dataKey + '_list');
      $list.empty();

      if ( data.length <= 0 ) {
        $list.addClass('none');
        this.$container.find('.' + dataKey).addClass('none');
      }
      _.each(data, $.proxy(function (listData, index) {
        // console.log(">>> listData: ", listData);
        // 바로가기는 최대 3건만 노출
        if (dataKey === 'shortcut') {
          if (index > 2) {
            return;
          }
          if ( listData.DOCID === 'M000083' && this._nowUser === 'logOutUser' ) {
            var removeLength = data.length - 1;
            if ( removeLength <= 0 ) {
              $('.' + dataKey).addClass('none');
            } else {
              $('.' + dataKey + ' .num').text(removeLength);
            }
            return;
          }
          if (listData.DEPTH_CHILD !== undefined) {
            console.log(">>>>> data: ", data);
            listData.DEPTH_CHILD.push({
              CLICK_CNT: listData.CLICK_CNT,
              DEPTH_LOC: "2",
              DEPTH_PATH: listData.DEPTH_PATH,
              DOCID: listData.DOCID,
              MENU_NM: listData.MENU_NM,
              MENU_URL: listData.MENU_URL,
              USE_YN: listData.USE_YN       
            })
          }
          // console.log(">>> listData: ", listData);
          $list.append(templateData({ listData: listData, CDN: cdn }));
        } else {
          if ( listData.DOCID === 'M000083' && this._nowUser === 'logOutUser' ) {
            var removeLength = data.length - 1;
            if ( removeLength <= 0 ) {
              $('.' + dataKey).addClass('none');
            } else {
              $('.' + dataKey + ' .num').text(removeLength);
            }
            return;
          }
          $list.append(templateData({ listData: listData, CDN: cdn }));
        }
        
      }, this));
    }
  },
  /**
   * @function
   * @desc 검색결과 특수문자 제거
   * @param {String} targetString - 검색 결과
   * @returns {String}
   */
  _decodeEscapeChar: function (targetString) {
    return targetString.replace(/\\/gi, '/').replace(/\n/g, '');
  },
  /**
   * @function
   * @desc 검색창 keyup 이벤트
   * @param {Object} args - 이벤트 객체
   * @returns {void}
   */
  _inputChangeEvent: function (args) {
    if ( Tw.InputHelper.isEnter(args) ) {
      this.$container.find('.icon-gnb-search').trigger('click');
    } else {
      if ( this._historyService.getHash() === '#input_P' ) {
        if ( this.$inputElement.val().trim().length > 0 ) {
          this._getAutoCompleteKeyword();
        } else {
          this._showRecentKeyworList();
        }
      }
    }
  },
  /**
   * @function
   * @desc 검색 실행
   * @param {Object} event - 이벤트 객체
   * @returns {void}
   */
  _doSearch: function (event) {
    var keyword = this.$inputElement.val();

    if ( Tw.FormatHelper.isEmpty(keyword) || keyword.trim().length <= 0 ) {
      this.$inputElement.blur();
      this._popupService.openAlert(null, Tw.ALERT_MSG_SEARCH.KEYWORD_ERR, null, null, 'search_keyword_err', $(event.currentTarget));
      return;
    }

    var requestUrl = '/common/search?keyword=';
    requestUrl += encodeURIComponent(keyword);
    requestUrl += '&step=' + (Number(this._step) + 1);
    var sort = '&sort=shortcut-C';
    sort += '.rate-C';
    sort += '.service-C';
    sort += '.tv_internet-C';
    sort += '.troaming-C';
    sort += '.direct-D';
    requestUrl += sort;

    Tw.CommonHelper.setCookie('search_sort::rate', 'C');
    Tw.CommonHelper.setCookie('search_sort::service', 'C');
    Tw.CommonHelper.setCookie('search_sort::tv_internet', 'C');
    Tw.CommonHelper.setCookie('search_sort::troaming', 'C');
    Tw.CommonHelper.setCookie('search_sort::direct', 'D');

    // Tw.Logger.info('[common.search] [_doSearch]', '"doSearch" Cookie 셋팅');
    // Tw.CommonHelper.setCookie('doSearch', 'Y');

    this._addRecentlyKeyword(keyword);
    this._moveUrl(requestUrl);
  },
  /**
   * @function
   * @desc 결과내 재검색 실행
   * @param {Object} event - 이벤트 객체
   * @returns {void}
   */
  _doResultSearch: function (event) {
    var keyword = this.$inputElement.val();
    var resultSearchKeyword = this.$inputElementResultSearch.val();

    Tw.Logger.info('[common.search] [_doResultSearch] 결과내 재검색 키워드 : ', resultSearchKeyword);

    if ( Tw.FormatHelper.isEmpty(keyword) || keyword.trim().length <= 0 ) {
      this.$inputElement.blur();
      this._popupService.openAlert(null, Tw.ALERT_MSG_SEARCH.KEYWORD_ERR, null, null, 'search_keyword_err', $(event.currentTarget));
      return;
    }

    if ( Tw.FormatHelper.isEmpty(resultSearchKeyword) || resultSearchKeyword.trim().length <= 0 ) {
      this.$inputElementResultSearch.blur();
      this._popupService.openAlert(null, Tw.ALERT_MSG_SEARCH.KEYWORD_ERR, null, null, 'search_keyword_err', $(event.currentTarget));
      return;
    }

    var requestUrl = '/common/search/in-result?keyword=' + (encodeURIComponent(this._searchInfo.query)) + '&in_keyword=';
    requestUrl += encodeURIComponent(resultSearchKeyword.trim());
    requestUrl += '&step=' + (Number(this._step) + 1);

    var sortsName = ['search_sort::rate', 'search_sort::service', 'search_sort::tv_internet', 'search_sort::troaming', 'search_sort::direct'];
    var sort = 'shortcut-C';
    sort += '.rate-' + (Tw.CommonHelper.getCookie(sortsName[0]) || 'C');
    sort += '.service-' + (Tw.CommonHelper.getCookie(sortsName[1]) || 'C');
    sort += '.tv_internet-' + (Tw.CommonHelper.getCookie(sortsName[2]) || 'C');
    sort += '.troaming-' + (Tw.CommonHelper.getCookie(sortsName[3]) || 'C');
    sort += '.direct-' + (Tw.CommonHelper.getCookie(sortsName[4]) || 'D');
    requestUrl += '&sort=' + sort;

    // Tw.Logger.info('[common.search] [_doResultSearch]', '"doSearch" Cookie 셋팅');
    // Tw.CommonHelper.setCookie('doSearch', 'Y');

    this._addRecentlyKeyword(resultSearchKeyword);
    this._moveUrl(requestUrl);
  },
  /**
   * @function
   * @desc 검색 개선 의견 보내기 팝업 출력
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _showClaimPopup: function (evt) {
    this._popupService.open({
        hbs: 'HO_05_02_02_01_01',
        layer: true,
        data: null
      }, $.proxy(this._bindEventForRequestKeyword, this),
      $.proxy(this._removeInputDisabled, this),
      'requestKeyword',
      $(evt.currentTarget)
    );
  },
  /**
   * @function
   * @desc 검색 개선 의견 보내기 팝업 이벤트 바인딩
   * @param {Object} popupObj - 팝업 layer 객체
   * @returns {void}
   */
  _bindEventForRequestKeyword: function (popupObj) {
    // this.$inputElement.attr('disabled','disabled');
    this.$requestKeywordPopup = $(popupObj);
    this.$requestKeywordPopup.on('click', '.request_claim', $.proxy(this._openAlert, this, Tw.ALERT_MSG_SEARCH.ALERT_4_A40, this._improveInvest));
    this.$requestKeywordPopup.on('keyup', '.input-focus', $.proxy(this._activateRequestKeywordBtn, this));
    this.$requestKeywordPopup.on('click', '.cancel', $.proxy(this._activateRequestKeywordBtn, this));
    this._changeAriaHidden('open');
  },
  /**
   * @function
   * @desc 얼럿 출력 함수
   * @param {Object} alertObj - 얼럿 메세지 객체
   * @param {function} doRequest - 요청 함수
   * @param {Object} event - 이벤트 객체
   * @returns {void}
   */
  _openAlert: function (alertObj, doRequest, event) {
    this._popupService.openModalTypeATwoButton(
      alertObj.TITLE,
      null,
      null,
      alertObj.BUTTON,
      null,
      $.proxy(doRequest, this, event),
      null,
      null,
      $(event.currentTarget)
    );
  },
  /**
   * @function
   * @desc 검색 설문조사 작성 완료 버튼 활성화 함수
   * @param {Object} inputEvt - 이벤트 객체
   * @returns {void}
   */
  _activateRequestKeywordBtn: function (inputEvt) {
    var $inputEvt = $(inputEvt.currentTarget);
    var inputLength = $inputEvt.val().length;
    this.$requestKeywordPopup.find('.byte-current').text(inputLength);

    if ( inputLength > 0 ) {
      this.$requestKeywordPopup.find('.request_claim').removeAttr('disabled');
    } else {
      this.$requestKeywordPopup.find('.request_claim').attr('disabled', 'disabled');
    }

    this._validateMaxLength($inputEvt);
  },
  /**
   * @function
   * @desc 접근성 관련 요소 숨김,보임 처리
   * @param {String} type - 팝업 열기,닫기 타입
   * @returns {void}
   */
  _changeAriaHidden: function (type) {
    if ( type === 'open' ) {
      this.$ariaHiddenEl.attr('aria-hidden', true);
    } else {
      this.$ariaHiddenEl.attr('aria-hidden', false);
    }
  },
  /**
   * @function
   * @desc 검색어 설문조사 주관식 내용 길이 검증 함수
   * @param {Object} $inputEvt - 입력 요소 jquery 객체
   * @returns {void}
   */
  _validateMaxLength: function ($inputEvt) {
    var maxLength = $inputEvt.attr('maxlength');
    var nowTargetVal = $inputEvt.val();

    if ( nowTargetVal.length > maxLength ) {
      $inputEvt.val(nowTargetVal.substring(0, maxLength));
      $inputEvt.blur();
      setTimeout(function () {
        $inputEvt.focus();
      });
    }
    this.$requestKeywordPopup.find('.byte-current').text($inputEvt.val().length);
  },
  /**
   * @function
   * @desc 검색 개선 의견 보내기
   */
  _improveInvest: function (evt) {
    this._popupService.close();

    this._apiService.request(Tw.API_CMD.BFF_08_0084, {
      ctt: this.$requestKeywordPopup.find('.input-focus').val()
    }, null, null, null, { jsonp: false })
      .done($.proxy(function (res) {
        this._claimCallback(res, 52, evt);
      }, this))
      .fail($.proxy(function (err) {
        this._popupService.openAlert(err.msg, Tw.POPUP_TITLE.NOTIFY, null, null, null, $(evt.currentTarget));
      }, this));
  },
  /**
   * @function
   * @desc 검색어 설문조사 요청 콜백
   * @param {Object} res - 응답 객체
   * @param {Object} srchId - 설문 타입 code
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _claimCallback: function (res, srchId, evt) {
    Tw.Logger.info('[common.search] [_claimCallBack]', '');

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_SEARCH.REQUEST_IMPROVE);

      var $selectedEl = this.$container.find('.opinion-selectbox');

      $selectedEl.each(function (idx) {
        if ( $selectedEl.eq(idx).data('type') === srchId ) {
          $selectedEl.eq(idx).children('.btn').hide();
          $selectedEl.eq(idx).children('.text').text(Tw.ALERT_MSG_SEARCH.REQUEST_CLAIM);
          $selectedEl.eq(idx).removeClass();
        }
      });
      this._popupService.close();
    } else {
      this._popupService.openAlert(res.msg, Tw.POPUP_TITLE.NOTIFY, null, null, null, $(evt.currentTarget));
    }
  },
  /**
   * @function
   * @desc 카테고리 선택 시 이동
   */
  _selectCategory: function (elem) {
    var $elem = $(elem.currentTarget);
    var elementAttArray = $elem.attr('class').split(' ');
    var collection;

    for ( var idx in elementAttArray ) {
      if ( elementAttArray[idx] !== 'fe-category' ) {
        if ( elementAttArray[idx] !== 'on' ) {
          collection = elementAttArray[idx];
        }
      }
    }

    Tw.Logger.info('[common.search] [_selectCategory] 이동할 카테고리 코드 : ', collection);

    // 선택한 컬렉션의 정렬기준

    // function replaceQueryParam(param, newval, search) {
    //   var regex = new RegExp('([?;&])' + param + '[^&;]*[;&]?');
    //   var query = search.replace(regex, '$1').replace(/&$/, '');
    //   return (query.length > 2 ? query + '&' : '?') + (newval ? param + '=' + newval : '');
    // }

    var sort;
    if ( collection !== 'all' ) {
      sort = this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(collection + '-') + collection.length + 1,
        this._reqOptions.sortCd.indexOf(collection + '-') + collection.length + 2);
    } else {
      sort = this._reqOptions.sortCd;
    }
    sort = Tw.CommonHelper.getCookie('search_sort::' + collection) || 'A';

    Tw.Logger.info('[common.search] [_selectCategory] 이동할 카테고리의 정렬 기준 : ', sort);

    // 검색어
    var keyword = this._searchInfo.query;
    Tw.Logger.info('[common.search] [_selectCategory] 입력된 검색어 : ', keyword);

    // 결과내 재검색어 (결과내 재검색 아닌 경우 검색어와 동일)
    var inKeyword = this._searchInfo.researchQuery;
    Tw.Logger.info('[common.search] [_selectCategory] 입력된 결과내 재검색 키워드 : ', inKeyword);

    // 카테고리 클릭시 이동할 링크 정보
    var url;

    // 결과 내 재검색
    if ( keyword !== inKeyword ) {
      inKeyword = inKeyword.replace(keyword, '');

      if ( collection !== 'all' ) {
        url = '/common/search/more?keyword=' + keyword + '&in_keyword=' + inKeyword.trim() +
          '&step=' + (Number(this._step) + 1) + '&category=' + collection + '&sort=' + sort;
      } else {
        url = '/common/search?keyword=' + keyword + '&in_keyword=' + inKeyword.trim() + '&step=' + (Number(this._step) + 1);
      }
    } else {
      if ( collection !== 'all' ) {
        url = '/common/search/more?keyword=' + keyword + '&step=' + (Number(this._step) + 1) +
          '&category=' + collection + '&sort=' + sort;
      } else {
        url = '/common/search?keyword=' + keyword + '&step=' + (Number(this._step) + 1);
      }
    }

    Tw.Logger.info('[common.search] [_selectCategory] 이동할 url 링크 : ', url);

    window.location.href = url;
  },
  /**
   * @function
   * @desc 카테고리 정렬기준 변경
   * @param
   */
  _onClickChangeSort: function (e) {
    var _this = this;
    var $target = $(e.currentTarget);
    var selectedCollection = $target.attr('class').replace(/fe-sort| |tod-fright/gi, ''); // rate, service ...
    Tw.Logger.info('[common.search] [_onClickChangeSort] 선택된 영역의 collection : ', selectedCollection);

    this._selectedCollectionToChangeSort = selectedCollection;

    var tempBtnStr = '.fe-btn-sort-' + selectedCollection;

    // sort=shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.direct-D
    // function getParam(sname) {
    //   var linkUrl = location.search;
    //   var params = linkUrl.substr(linkUrl.indexOf('?') + 1);
    //   var sval = '';
    //   params = params.split('&');
    //   for (var i = 0; i < params.length; i++) {
    //       temp = params[i].split('=');
    //       if ([temp[0]] === sname) { sval = temp[1]; }
    //   }
    //   return sval;
    // }

    this._popupService.open({
      hbs: this._ACTION_SHEET_HBS,
      layer: true,
      btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
      data: _this._getSortCd(selectedCollection)
    }, $.proxy(this._onOpenGradeActionSheet, this, selectedCollection), null, 'select-grade', this.$container.find(tempBtnStr));
  },
  /**
   * @function
   * @desc 선택된 카테고리의 정렬기준 정보 가져오기
   * @param
   */
  _getSortCd: function (categoryId) {
    Tw.Logger.info('[common.search] [_getSortCd] 선택된 collection : ', categoryId);

    var sortCdStr = this._reqOptions.sortCd.substring(
      this._reqOptions.sortCd.indexOf(categoryId + '-') + categoryId.length + 1,
      this._reqOptions.sortCd.indexOf(categoryId + '-') + categoryId.length + 2);
    sortCdStr = Tw.CommonHelper.getCookie('search_sort::' + categoryId) || 'A';

    Tw.Logger.info('[common.search] [_getSortCd] 선택된 collection 의 정렬기준 : ', sortCdStr);

    this._sortCd = [
      {
        list: [
          {
            txt: Tw.SEARCH_FILTER_STR.CLICK,  // 클릭순
            'radio-attr': (sortCdStr === 'C') ? 'class="focus-elem" sort="C" checked' : 'class="focus-elem" sort="C"',
            'label-attr': ' ',
            sort: 'C'
          },
          {
            txt: Tw.SEARCH_FILTER_STR.NEW,  // 최신순
            'radio-attr': (sortCdStr === 'D') ? 'class="focus-elem" sort="D" checked' : 'class="focus-elem" sort="D"',
            'label-attr': ' ',
            sort: 'D'
          },
          {
            txt: Tw.SEARCH_FILTER_STR.LOW,  // 낮은 가격순
            'radio-attr': (sortCdStr === 'L') ? 'class="focus-elem" sort="L" checked' : 'class="focus-elem" sort="L"',
            'label-attr': ' ',
            sort: 'L'
          },
          {
            txt: Tw.SEARCH_FILTER_STR.HIGH,  // 높은 가격순
            'radio-attr': (sortCdStr === 'H') ? 'class="focus-elem" sort="H" checked' : 'class="focus-elem" sort="H"',
            'label-attr': ' ',
            sort: 'H'
          }
        ]
      }
    ];

    Tw.Logger.info('[common.search] [_getSortCd] 선택된 collection 의 정렬기준 옵션 : ', this._sortCd);

    return this._sortCd;
  },
  /**
   * @function
   * @desc 등급선택 액션시트 오픈
   * @param {Object} $container
   */
  _onOpenGradeActionSheet: function () {
    var _this = this;
    var selectedCollection = arguments[0];
    var $container = arguments[1];

    Tw.Logger.info('[common.search] [_onOpenGradeActionSheet] 현재 선택된 영역 (' + selectedCollection +
      ') 의 라디오버튼 상자 : ', $container.find('li input').attr('id'));

    $container.find('li input').change($.proxy(function (event) {
      var sort = $(event.currentTarget).attr('sort');
      Tw.Logger.info('[common.search] [_onOpenGradeActionSheet] 현재 선택된 카테고리 : ', selectedCollection);
      Tw.Logger.info('[common.search] [_onOpenGradeActionSheet] 현재 선택된 카테고리의 정렬기준 : ', sort);

      // 컬렉션 별로 소팅 기준을 저장해두기 위한 처리 [S]
      var collectionSortArray = []; // new Array() The array literal notation [] is preferable.
      collectionSortArray.push(this._reqOptions.sortCd.split('.'));
      var collectionSortStr = '';

      Tw.Logger.info('[common.search] [_onOpenGradeActionSheet] 각 카테고리별 정렬기준 : ', collectionSortArray);

      for ( var idx in collectionSortArray[0] ) {
        var collectionSortData = collectionSortArray[0][idx];
        var tmpCollection = collectionSortData.split('-')[0];
        var tmpSort = collectionSortData.split('-')[1];

        if ( selectedCollection === tmpCollection ) {
          // 선택되는 정렬기준으로 변경해준다.
          tmpSort = sort;
        }

        collectionSortStr += tmpCollection + '-' + tmpSort;

        if ( idx < collectionSortArray[0].length - 1 ) {
          collectionSortStr += '.';
        }
      }

      this._reqOptions.sortCd = collectionSortStr;
      Tw.Logger.info('[common.search] [_onOpenGradeActionSheet] 변경 적용된 각 카테고리별 정렬기준 : ', this._reqOptions.sortCd);

      var startIdx = this._reqOptions.sortCd.indexOf(selectedCollection + '-') + selectedCollection.length + 1;
      Tw.Logger.info('[common.search] [_onOpenGradeActionSheet] ' + selectedCollection +
        '  카테고리의 변경된 정렬기준 : ', this._reqOptions.sortCd.substring(startIdx, startIdx + 1));
      // 컬렉션 별로 소팅 기준을 저장해두기 위한 처리 [E]

      var options = {
        collection: selectedCollection,
        pageNum: 1,
        sort: sort
      };

      Tw.Logger.info('[common.search] [_onOpenGradeActionSheet] this._sortRate 호출', '');
      this._sortRate(options);

      _.each(this._sortCd[0].list, function (item) {
        item['radio-attr'] = 'id="' + selectedCollection + '-radio"' + 'class="focus-elem" sort="' + item.sort + '"' +
          (item.sort === _this._reqOptions.sortCd.substring(startIdx, startIdx + 1) ? 'checked' : '');
        // Tw.Logger.info('[common.search] [_onOpenGradeActionSheet] item[radio-attr] : ', item['radio-attr']);
      });

      this._popupService.close();
    }, this));

    // 웹접근성 대응
    Tw.CommonHelper.focusOnActionSheet($container);
  },
  /**
   * @function
   * @param param
   * @param newval
   * @param search
   * @returns {string}
   */
  _replaceQueryParam: function(param, newval, search) {
    var regex = new RegExp('([?;&])' + param + '[^&;]*[;&]?');
    var query = search.replace(regex, '$1').replace(/&$/, '');
    return (query.length > 2 ? query + '&' : '?') + (newval ? param + '=' + newval : '');
  },
  /**
   * @function
   * @desc 카테고리 정렬 기준 변경하여 호출
   * @param {Object} $container
   */
  _sortRate: function (options) {
    Tw.Logger.info('[common.search] [_sortRate] 호출', '');
    Tw.Logger.info('[common.search] [_sortRate] options : ', options);

    var _this = this;
    var searchApi = Tw.BrowserHelper.isApp() ? Tw.API_CMD.SEARCH_APP : Tw.API_CMD.SEARCH_WEB;
    var query = this._searchInfo.query;
    var researchQuery = this._searchInfo.researchQuery;
    var collection = options.collection;
    var pageNum = options.pageNum;
    var sort = options.sort;

    var reqOptions;
    if ( query !== researchQuery ) {
      researchQuery = researchQuery.replace(query, '').trim();
      if ( Tw.BrowserHelper.isApp() ) {
        if ( Tw.BrowserHelper.isAndroid() ) {
          reqOptions = {
            query: encodeURIComponent(query),
            collection: collection,
            pageNum: pageNum,
            sort: sort,
            researchQuery: encodeURIComponent(researchQuery),
            device: 'A'
          };
        } else if ( Tw.BrowserHelper.isIos() ) {
          reqOptions = {
            query: encodeURIComponent(query),
            collection: collection,
            pageNum: pageNum,
            sort: sort,
            researchQuery: encodeURIComponent(researchQuery),
            device: 'I'
          };
        } else {
          reqOptions = {
            query: encodeURIComponent(query),
            collection: collection,
            pageNum: pageNum,
            sort: sort,
            researchQuery: encodeURIComponent(researchQuery)
          };
        }
      } else {
        reqOptions = {
          query: encodeURIComponent(query),
          collection: collection,
          pageNum: pageNum,
          sort: sort,
          researchQuery: encodeURIComponent(researchQuery)
        };
      }
    } else {
      reqOptions = { query: encodeURIComponent(query), collection: collection, pageNum: pageNum, sort: sort };
    }
    Tw.Logger.info('[common.search] [_sortRate] 검색API 호출 옵션 : ', reqOptions);

    var count = $('#searchlist_' + collection + ' .num').text() * 1;
    // 5개 이상일때만 더보기가 생기니 그때만 url을 바꿔 준다.
    if ( count > 5 ) {
      var url = $('a.' + collection).attr('data-url');
      url = this._replaceQueryParam('sort', sort, url);
      $('a.' + collection).attr('data-url', url);
      $('button.' + collection).attr('data-url', url);
    }
    Tw.CommonHelper.setCookie('search_sort::' + collection, sort);

    this._apiService.request(searchApi, reqOptions)
      .done($.proxy(function (res) {
        if ( res.code === 0 ) {
          var sortedRateResultArr = res.result.search[0][collection].data;
          Tw.Logger.info('[common.search] [_sortRate] 검색 결과 : ', sortedRateResultArr);

          _this._showShortcutList(_this._arrangeData(sortedRateResultArr, collection), collection, this._cdn, 'sort');

          this._sort = sort;

          var selectedSort = _.find(this._sortCd[0].list, {
            sort: sort
          });

          var sortValue = selectedSort ? selectedSort.txt : this._sortCd[0].list.txt;
          Tw.Logger.info('[common.search] [_sortRate] 선택된 정렬기준 : ', sortValue);

          var tempBtnStr = '.fe-btn-sort-' + collection;
          // Tw.Logger.info('[common.search] [_sortRate] 선택된 영역 : ', this.$container.find(tempBtnStr).attr('class'));
          // this.$container.find(tempBtnStr).text(subTabValue);
          // this.$container.find(tempBtnStr).text(sortValue);
          $(tempBtnStr).text(sortValue);
        } else {
          Tw.Logger.info('[common.search] [_sortRate] 검색API 리턴 오류!!! : ', res.code);
          return;
        }
      }, this))
      .fail(function (err) {
        Tw.Logger.info('[common.search] [_sortRate] 검색API 연동 오류!!! : ', err);
        // GET_SVC_INFO API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
        // Tw.Error(err.code, err.msg).pop();
        return;
      });
  },
  /**
   * @function
   * @desc 배너 출력
   * @param {Object} data - 배너 검색 결과
   * @returns {void}
   */
  _showBanner: function (data) {
    var bannerPositionObj = {
      AGN: 'as_outlet',
      APP: 'tapp',
      BENF: 'sale',
      CUG: 'manner',
      EVT: 'event',
      FAQ: 'question',
      FEE: 'rate',
      IUG: 'siteInfo',
      MBR: 'tmembership',
      NOTI: 'notice',
      ROM: 'troaming',
      SVC: 'service',
      TWD: 'direct',
      VUG: 'serviceInfo',
      WIRE: 'tv_internet',
      BND: 'bundle'
    };
    var bannerTemplate = Handlebars.compile($('#banner_template').html());
    _.each(data, $.proxy(function (bannerData) {
      this.$container.find('.cont-box.list.' + bannerPositionObj[bannerData.SUBM_MENU_ID1])
        .after(bannerTemplate({ listData: bannerData, CDN: this._cdn }));
    }, this));

  },
  /**
   * @function
   * @desc 최근검색어 추가
   * @param {Object} keyword - 검색어
   * @returns {void}
   */
  _addRecentlyKeyword: function (keyword) {
    for ( var i = 0; i < this._recentKeyworList[this._nowUser].length; i++ ) {
      if ( this._recentKeyworList[this._nowUser][i].keyword === keyword ) {
        this._recentKeyworList[this._nowUser].splice(i, 1);
        break;
      }
    }
    this._recentKeyworList[this._nowUser].unshift({
      keyword: keyword,
      searchTime: this._todayStr,
      platForm: this._platForm,
      initial: Tw.StringHelper.getKorInitialChar(keyword)
    });
    while ( this._recentKeyworList[this._nowUser].length > 10 ) {
      this._recentKeyworList[this._nowUser].pop();
    }
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD, JSON.stringify(this._recentKeyworList));
  },
  /**
   * @function
   * @desc 연관검색어, 검색어 추천 클릭 이벤트
   * @param {Object} targetEvt - 이벤트 객체
   * @returns {void}
   */
  _searchRelatedKeyword: function (targetEvt) {
    targetEvt.preventDefault();
    var $targetElement = $(targetEvt.currentTarget);
    var keyword = $targetElement.data('param');
    //var goUrl = '/common/search?keyword='+keyword+'&step='+(Number(this._step)+1);
    if ( !$targetElement.hasClass('searchword-text') ) {
      this._addRecentlyKeyword(keyword);
    }
    this._moveUrl($targetElement.attr('href'));
  },
  /**
   * @function
   * @desc 검색결과 클릭 이벤트
   * @param {Object} linkEvt - 이벤트 객체
   * @returns {void}
   */
  _goLink: function (linkEvt) {
    linkEvt.preventDefault();
    var $linkData = $(linkEvt.currentTarget);
    Tw.Logger.info('[common.search] [_goLink] 이동할 검색결과 element : ', $linkData);


    // 쿠키에 화면 스크롤 위치 저장
    var scrollHeightPosition = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    Tw.CommonHelper.setCookie('scroll_position', scrollHeightPosition);
    Tw.Logger.info('[common.search] [_goLink] scrollHeightPosition : ', scrollHeightPosition);

    var linkUrl = $linkData.attr('href');

    if ( Tw.FormatHelper.isEmpty(linkUrl) ) {
      return;
    }

    // 검색결과 반응 정보로 XTR 에 송신할 컬렉션 정보
    var $linkDataClass = $linkData.data('category');

    // $linkDataClass = $linkDataClass.trim();
    Tw.Logger.info('[common.search] [_goLink] XTR 에 송신할 컬렉션 정보 : ', $linkDataClass);

    // 검색결과 반응 정보로 XTR 에 송신할 검색어 정보
    var encodedKeyword = encodeURIComponent(this._searchInfo.query);
    Tw.Logger.info('[common.search] [_goLink] XTR 에 송신할 검색어 정보 : ', encodedKeyword);

    // 검색결과 반응 정보로 XTR 에 송신할 결과내재검색 키워드 정보
    var encodedInKeyword = '';
    if ( this._searchInfo.query !== this._searchInfo.researchQuery ) {
      var tempstr = this._searchInfo.researchQuery.replace(this._searchInfo.query, '');
      tempstr = tempstr.trim();

      // Tw.Logger.info('[XTR 에 송신할 결과내재검색 키워드 정보] ', '['+tempstr+']');
      encodedInKeyword = encodeURIComponent(tempstr);
    }
    Tw.Logger.info('[common.search] [_goLink] XTR 에 송신할 결과내재검색 키워드 정보 : ', encodedInKeyword);

    // 검색결과 반응 정보 수집을 위한 XTR API 호출
    window.XtractorScript.xtrSearch(encodedKeyword, encodedInKeyword, $linkDataClass);


    if ( !$linkData.hasClass('home') ) {
      this._apiService.request(Tw.API_CMD.STACK_SEARCH_USER_CLICK,
        {
          'docId': $linkData.data('id'),
          'section': $linkData.data('category'),
          'title': encodeURIComponent($linkData.data('tit')),
          'keyword': encodeURIComponent(this._searchInfo.researchQuery)
        }
      );
    }
    if ( this._bpcpService.isBpcp(linkUrl) ) {
      this._bpcpService.open(linkUrl, null, null);
    } else if ( linkUrl.indexOf('Native:') > -1 ) {
      if ( linkUrl.indexOf('freeSMS') > -1 ) {
        this._callFreeSMS($linkData);
      }
    } else if ( $linkData.hasClass('direct-element') ) {
      this._popupService.openConfirm(null, Tw.MSG_COMMON.DATA_CONFIRM,
        $.proxy(function () {
          this._popupService.close();
          Tw.CommonHelper.openUrlExternal(linkUrl);
        }, this),
        $.proxy(this._popupService.close, this._popupService), $linkData
      );
    } else {
      if ( this._exceptionDocId[$linkData.data('id')] ) {
        linkUrl = this._exceptionDocId[$linkData.data('id')].link;
      }
      if ( linkUrl.indexOf('http') > -1 ) {
        if ( $linkData.data('require-pay') === 'Y' ) {
          this._popupService.openConfirm(null, Tw.POPUP_CONTENTS.NO_WIFI,
            $.proxy(function () {
              this._popupService.close();
              Tw.CommonHelper.openUrlExternal(linkUrl);
            }, this),
            $.proxy(this._popupService.close, this._popupService), $linkData
          );
        } else {
          Tw.CommonHelper.openUrlExternal(linkUrl);
        }
      } else {
        this._moveUrl(linkUrl);
      }
    }
  },
  /**
   * @function
   * @desc 검색 닫기 ( 검색창 진입 이전 페이지로 이동 )
   * @returns {void}
   */
  _closeSearch: function () {
    if ( this._historyService.getHash() === '#input_P' ) {
      ++this._step;
    }
    setTimeout($.proxy(function () {
      this._historyService.go(Number(this._step) * -1);
    }, this));
  },
  /**
   * @function
   * @desc 검색 결과 카테고리사이의 공백 중복 제거
   * @param {Object} $selectedArr - 삭제할 클래스명 jquery 객체
   * @param {String} className - 삭제할 클래스 명
   * @returns {void}
   */
  _removeDuplicatedSpace: function ($selectedArr, className) {
    $selectedArr.each(function () {
      var $target = $(this);
      if ( $target.next().hasClass(className) ) {
        $target.addClass('none');
      }
    });
  },
  /**
   * @function
   * @desc 최근검색어 가져오기, 초기화
   * @returns {void}
   */
  _recentKeywordInit: function () {
    var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD));
    var removeIdx = [];
    if ( Tw.FormatHelper.isEmpty(recentlyKeywordData) ) {
      //making recentlySearchKeyword
      recentlyKeywordData = {};
    }
    if ( Tw.FormatHelper.isEmpty(recentlyKeywordData[this._nowUser]) ) {
      //makin nowUser's recentlySearchKeyword based on svcMgmtNum
      recentlyKeywordData[this._nowUser] = [];
    }
    _.each(recentlyKeywordData[this._nowUser], $.proxy(function (data, index) {
      //recognize 10 days ago data from now
      if ( Tw.DateHelper.getDiffByUnit(Tw.DateHelper.convDateCustomFormat(this._todayStr, this._recentKeywordDateFormat),
        Tw.DateHelper.convDateCustomFormat(data.searchTime, this._recentKeywordDateFormat), 'day') >= 10 ) {
        removeIdx.push(index);
      }
    }, this));
    _.each(removeIdx, $.proxy(function (removeIdx) {
      recentlyKeywordData[this._nowUser].splice(removeIdx, 1);
    }, this));
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD, JSON.stringify(recentlyKeywordData));
    this._recentKeyworList = recentlyKeywordData;
  },
  /**
   * @function
   * @desc 검색창 focus 이벤트
   * @returns {void}
   */
  _inputFocusEvt: function () {
    this._openKeywordListBase();
  },
  /**
   * @function
   * @desc 검색창 blur 이벤트
   * @returns {void}
   */
  _inputBlurEvt: function () {
    if ( this._historyService.getHash() === '#input_P' ) {
      this._popupService.close();
    }
  },
  /**
   * @function
   * @desc 최근검색어, 검색어 자동완성 화면 이벤트 바인딩
   * @param {Object} layer - 최근검색어, 검색어 자동완성 화면 객체
   * @returns {void}
   */
  _bindKeyworListBaseEvent: function (layer) {
    this.$keywordListBase = $(layer);
    if ( this.$inputElement.val().trim().length > 0 ) {
      this._getAutoCompleteKeyword();
    } else {
      this._showRecentKeyworList();
    }
    this.$keywordListBase.on('click', '.remove-recently-list', $.proxy(this._removeRecentlyKeywordList, this));
    this.$keywordListBase.on('click', '.close', $.proxy(this._closeKeywordListBase, this, true));
    $('.keyword-list-base').insertAfter('.fe-header-wrap');
    this.$container.find('.fe-container-wrap').attr('aria-hidden', true);
    this.$container.find('.fe-header-wrap').attr('aria-hidden', false);
    $(window).scrollTop(0);
    this.$keywordListBase.off('touchstart');
    this.$keywordListBase.on('touchstart', $.proxy(function () {
      this.$inputElement.blur();
    }, this));
  },
  /**
   * @function
   * @desc 최근검색어, 검색어 자동완성 화면 출력
   * @returns {void}
   */
  _openKeywordListBase: function () {
    if ( this._historyService.getHash() === '#input_P' ) {
      if ( this.$inputElement.val().trim().length > 0 ) {
        this._getAutoCompleteKeyword();
      } else {
        this._showRecentKeyworList();
      }
      return;
    }
    setTimeout($.proxy(function () {
      this._popupService.open({
          hbs: 'search_keyword_list_base',
          layer: true,
          data: null
        },
        $.proxy(this._bindKeyworListBaseEvent, this),
        $.proxy(this._keywordListBaseClassCallback, this),
        'input');
    }, this));
  },
  /**
   * @function
   * @desc 최근검색어, 검색어 자동완성 화면 닫기 실행
   * @returns {void}
   */
  _closeKeywordListBase: function () {
    setTimeout($.proxy(function () {
      this._popupService.close();
      this.$container.find('.keyword-list-base').remove();
      this.$container.find('.fe-container-wrap').attr('aria-hidden', false);
      skt_landing.action.checkScroll.unLockScroll();
    }, this));
  },
  /**
   * @function
   * @desc 최근검색어, 검색어 자동완성 화면 닫기 콜백
   * @returns {void}
   */
  _keywordListBaseClassCallback: function () {
    this._closeKeywordListBase();
    this.$inputElement.blur();
  },
  /**
   * @function
   * @desc 최근검색어, 검색어 자동완성 화면  최근검색어 화면으로 전환
   * @returns {void}
   */
  _showRecentKeyworList: function () {
    if ( this._historyService.getHash() === '#input_P' ) {
      this.$keywordListBase.find('#recently_keyword_layer').removeClass('none');
      if ( !this.$keywordListBase.find('#auto_complete_layer').hasClass('none') ) {
        this.$keywordListBase.find('#auto_complete_layer').addClass('none');
      }
      this.$keywordListBase.find('#recently_keyword_list').empty();
      _.each(this._recentKeyworList[this._nowUser], $.proxy(function (data, idx) {
        this.$keywordListBase.find('#recently_keyword_list').append(
          this._recentKeywordTemplate({
            listData: data, xtractorIndex: idx + 1, index: idx, encodeParam: encodeURIComponent(data.keyword)
          }));
      }, this));
      //this.$keywordListBase.find('#recently_keyword_list') list
    }
  },
  /**
   * @function
   * @desc 검색어 자동완성 요청
   * @returns {void}
   */
  _getAutoCompleteKeyword: function () {
    var keyword = this.$inputElement.val();
    if ( this._historyService.getHash() !== '#input_P' || keyword.trim().length <= 0 ) {
      return;
    }
    this.$keywordListBase.find('#auto_complete_layer').removeClass('none');
    if ( !this.$keywordListBase.find('#recently_keyword_layer').hasClass('none') ) {
      this.$keywordListBase.find('#recently_keyword_layer').addClass('none');
    }
    var requestParam = { query: encodeURIComponent(keyword) };
    this._apiService.request(Tw.API_CMD.SEARCH_AUTO_COMPLETE, requestParam)
      .done($.proxy(function (res) {
        if ( res.code === 0 ) {
          var autoCompleteList = this._mergeList(this._getRecentKeywordListBySearch(keyword), res.result.length <= 0 ? [] : res.result[0].items);
          this._showAutoCompleteKeyword(autoCompleteList);
        }
      }, this));
  },
  /**
   * @function
   * @desc 최근검색어, 검색어 자동완성 리스트 병합
   * @param {Array} recentKeywordList - 최근검색어 리스트
   * @param {Array} autoCompleteList - 자동완성 검색어 리스트
   * @returns {Array}
   */
  _mergeList: function (recentKeywordList, autoCompleteList) {
    _.each(autoCompleteList, $.proxy(function (data) {
      recentKeywordList.push(this._convertAutoKeywordData(data.hkeyword));
    }, this));
    recentKeywordList = Tw.FormatHelper.removeDuplicateElement(recentKeywordList);
    return recentKeywordList;
  },
  /**
   * @function
   * @desc 최근검색어, 검색어 자동완성 화면 검색어 자동완성 전환
   * @param {Array} autoCompleteList - 자동완성 검색어 리스트
   * @returns {void}
   */
  _showAutoCompleteKeyword: function (autoCompleteList) {
    this.$keywordListBase.find('#auto_complete_list').empty();
    _.each(autoCompleteList, $.proxy(function (data, idx) {
      if ( idx >= 10 ) {
        return;
      }
      this.$keywordListBase.find('#auto_complete_list').append(
        this._autoCompleteKeywrodTemplate(
          { listData: data, xtractorIndex: idx + 1, encodeParam: encodeURIComponent(data.linkStr) }
        ));
    }, this));
  },
  /**
   * @function
   * @desc 최근검색어, 검색어 자동완성 화면 검색어 자동완성 전환
   * @param {Array} keyword - 검색어
   * @returns {Array}
   */
  _getRecentKeywordListBySearch: function (keyword) {
    var returnData = [];
    for ( var i = 0; i < this._recentKeyworList[this._nowUser].length; i++ ) {
      if ( this._recentKeyworList[this._nowUser][i].keyword.indexOf(keyword) > -1 ||
        (!Tw.FormatHelper.isEmpty(this._recentKeyworList[this._nowUser][i].initial) &&
          this._recentKeyworList[this._nowUser][i].initial.indexOf(keyword) > -1) ) {
        if (
          this._nowUser === 'logOutUser' &&
          !Tw.FormatHelper.isEmpty(this._recentKeyworList[this._nowUser][i].platForm) &&
          this._platForm !== this._recentKeyworList[this._nowUser][i].platForm
        ) {
          continue;
        }
        returnData.push({
          showStr: this._recentKeyworList[this._nowUser][i].keyword.replace(
            new RegExp(this._escapeChar(keyword), 'g'), '<span class="keyword-text">' + keyword + '</span>'
          ),
          linkStr: this._recentKeyworList[this._nowUser][i].keyword
        });
      }
    }
    return returnData;
  },
  /**
   * @function
   * @desc 자동완성 하이라이팅 퍼블리싱에 맞춰 변경
   * @param {String} listStr - 자동완성 결과
   * @returns {Object}
   */
  _convertAutoKeywordData: function (listStr) {
    var returnObj = {};
    returnObj.showStr = listStr.substring(0, listStr.length - 7);
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontColorOpen, '<span class="keyword-text">');
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontSizeOpen, '');
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontClose, '</span>');
    returnObj.linkStr = Tw.FormatHelper.stripTags(returnObj.showStr);
    return returnObj;
  },
  /**
   * @function
   * @desc 최근검색어 삭제 함수
   * @param {Object} args - 이벤트 객체
   * @returns {void}
   */
  _removeRecentlyKeywordList: function (args) {
    var removeIdx = $(args.currentTarget).data('index');
    if ( removeIdx === 'all' ) {
      this._recentKeyworList[this._nowUser] = [];
    } else {
      this._recentKeyworList[this._nowUser].splice(removeIdx, 1);
    }
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD, JSON.stringify(this._recentKeyworList));
    this._recentKeywordInit();
    setTimeout($.proxy(this._showRecentKeyworList, this));
  },
  /**
   * @function
   * @desc url 이동
   * @param {String} linkUrl - 이동할 url
   * @returns {void}
   */
  _moveUrl: function (linkUrl) {
    if ( this._historyService.getHash() === '#input_P' ) {
      this._closeKeywordListBase();
    }
    setTimeout($.proxy(function () {
      this._historyService.goLoad(linkUrl);
    }, this), 100);
  },
  /**
   * @function
   * @desc 스마트검색 출력
   * @param {Object} data - 스마트 검색 결과
   * @returns {void}
   */
  _showSmart: function (data) {
    if ( Tw.FormatHelper.isEmpty(data) ) {
      return;
    }
    var returnData = [];
    for ( var i = 1; i <= 3; i++ ) {
      if ( !Tw.FormatHelper.isEmpty(data['BNNR_BOT_BTN_NM' + i]) ) {
        returnData.push({
          title: data['BNNR_BOT_BTN_NM' + i],
          link: data['BNNR_BOT_BTN_URL' + i],
          docId: data.DOCID,
          payInfo: data['BNNR_BOT_BTN_BILL_YN' + i]
        });
      }
    }
    if ( returnData.length <= 0 ) {
      return;
    } else {
      this.$container.find('#smart_btn_base').removeClass('none');
      var smartTemplate = Handlebars.compile(this.$container.find('#smart_template').html());
      var $smartBase = this.$container.find('.btn-link-list');
      _.each(returnData, function (data/*, idx */) {
        $smartBase.append(smartTemplate({ data: data }));
      });
      if ( returnData.length === 3 ) {
        $smartBase.addClass('col3');
      } else if ( returnData.length === 1 ) {
        $smartBase.find('.last-line').addClass('full');
      }
    }
  },
  /**
   * @function
   * @desc 무료문자 호출
   * @param {Object} $linkData - 선택한 요소 jquery 객체
   * @returns {void}
   */
  _callFreeSMS: function ($linkData) {
    var memberType = this._svcInfo.totalSvcCnt > 0 ? (this._svcInfo.expsSvcCnt > 0 ? 0 : 1) : 2;
    if ( memberType === 1 ) {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms', $linkData
      );
      return;
    }

    if ( this._svcInfo.svcAttrCd === 'M2' ) {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS_PPS,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms_pps', $linkData
      );
      return;
    }
    Tw.CommonHelper.openFreeSms();
  },
  /**
   * @function
   * @desc 무료문자 호출
   * @param {String} string - 특수문자와 결합어 정상 출력 안되는 문자열 정상 출력 하도록 수정
   * @returns {String}
   */
  _escapeChar: function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },
  /**
   * @function
   * @desc 유료부가서비스 개수 및 금액 계산, 출력( 즉답검색 case 7 , 부가서비스 관련 검색시)
   * @param {Object} usingAdditions - 이용중인 부가서비스 리스트 객체
   * @returns {void}
   */
  _calculateAdditionsFee: function (usingAdditions) {
    // [OP002-9968] 의 배포 일정 연기 (9/17) 로 연기됨에 따라 기존 로직으로 복구함. 9/17 배포시에 본 로직은 제거 필요 [S]
    // var addProdList = usingAdditions.addProdList || []; // 이용중인 부가서비스 리스트
    // var totalPaidAdditionsCnt = 0;
    // var totalUnpaidAdditionsCnt = 0;
    // var returnStr1 = '';
    // var returnStr2 = '';

    // if( addProdList.length > 0 ) {
    //   addProdList.map(function (_data) {
    //     if( _data.payFreeYn !== 'Y' ) {
    //       totalPaidAdditionsCnt++;
    //     } else {
    //       totalUnpaidAdditionsCnt++;
    //     }
    //   });
    // }

    // returnStr1 = totalUnpaidAdditionsCnt + '건';
    // returnStr2 = totalPaidAdditionsCnt + '건';

    // this.$container.find('.fe-unpaid-additions-cnt').text(returnStr1);
    // this.$container.find('.fe-paid-additions-cnt').text(returnStr2);
    // [OP002-9968] 의 배포 일정 연기 (9/17) 로 연기됨에 따라 기존 로직으로 복구함. 9/17 배포시에 본 로직은 제거 필요 [E]


    // 아래 [OP002-9968] 의 변경사항은 배포 일정 연기 (9/17) 로 연기됨에 따라 원복처리함 [S]
    var returnStr1 = '';
    var returnStr2 = '';
    var returnStr3 = '';
    var keyName = '';

    console.log('[common.search] [_calculateAdditionsFee] usingAdditions : ', usingAdditions);
    console.log('[common.search] [_calculateAdditionsFee] this._svcInfo.svcAttrCd : ', this._svcInfo.svcAttrCd);

    // 선택된 회선이 유선인 경우
    if ( !Tw.FormatHelper.isEmpty(this._svcInfo) && this._svcInfo.svcAttrCd.startsWith('S') ) {
      // console.log('[common.search] [_calculateAdditionsFee] 선택된 회선이 유선인 경우', '');

      var paidProdList = usingAdditions.pays || [];
      var unpaidProdList = usingAdditions.frees || [];

      var paidProdCnt = paidProdList.length;        // 가입한 유료 유선 부가상품 카운트
      var unpaidProdCnt = unpaidProdList.length;  // 가입한 무료 유선 부가상품 카운트

      // console.log('[common.search] [_calculateAdditionsFee] 가입한 유료 유선 부가상품 카운트 : ', paidProdCnt);
      // console.log('[common.search] [_calculateAdditionsFee] 가입한 무료 유선 부가상품 카운트 : ', addProdPayFreeCnt);

      if ( paidProdCnt === 0 && unpaidProdCnt === 0 ) {
        console.log('[common.search] [_calculateAdditionsFee] 가입한 유선 부가서비스 없음');
        $('.tod-search-mytbox').parent().hide();

        // 가입된 부가서비스 개수가 모두 0 이면 smart 배너를 노출
        for ( var i = 0; i < this._searchInfo.search.length; i++ ) {
          keyName = Object.keys(this._searchInfo.search[i])[0];

          if ( keyName === 'smart' ) {
            this._showSmart(this._searchInfo.search[i][keyName].data[0]);
          }
        }
      } else {
        returnStr1 = paidProdCnt + '건';
        returnStr2 = unpaidProdCnt + '건';

        this.$container.find('.fe-wire-paid-additions-cnt').text(returnStr1);
        this.$container.find('.fe-wire-unpaid-additions-cnt').text(returnStr2);

        if ( paidProdCnt === 0 ) {
          console.log('[common.search] [_calculateAdditionsFee] 가입한 유선 유료 부가서비스 없음');
          $('.fe-wire-paid-additions-cnt').removeAttr('href');
        }

        if ( unpaidProdCnt === 0 ) {
          console.log('[common.search] [_calculateAdditionsFee] 가입한 유선 무료 부가서비스 없음');
          $('.fe-wire-unpaid-additions-cnt').removeAttr('href');
        }

        $('.fe-prod-cnt-wireless').hide();
        $('.fe-prod-cnt-wire').show();
      }
    }
    // 선택된 회선이 무선인 경우
    else {
      // console.log('[common.search] [_calculateAdditionsFee] 선택된 회선이 무선인 경우', '');

      var disProdCnt = usingAdditions.disProdCnt;               // 가입한 무선 션/할인 프로그램 카운트
      var addProdPayCnt = usingAdditions.addProdPayCnt;         // 가입한 무선 유료 부가상품 카운트
      var addProdPayFreeCnt = usingAdditions.addProdPayFreeCnt; // 가입한 무선 무료 부가상품 카운트

      // console.log('[common.search] [_calculateAdditionsFee] 가입한 무선 옵션/할인 프로그램 카운트 : ', disProdCnt);
      // console.log('[common.search] [_calculateAdditionsFee] 가입한 무선 유료 부가상품 카운트 : ', addProdPayCnt);
      // console.log('[common.search] [_calculateAdditionsFee] 가입한 무선 무료 부가상품 카운트 : ', addProdPayFreeCnt);

      if ( disProdCnt === 0 && addProdPayCnt === 0 && addProdPayFreeCnt === 0 ) {
        console.log('[common.search] [_calculateAdditionsFee] 가입한 무선 옵션/할인 프로그램 및 부가서비스 없음');
        $('.tod-search-mytbox').parent().hide();

        // 가입된 부가서비스 개수가 모두 0 이면 smart 배너를 노출
        for ( var addIndex = 0; addIndex < this._searchInfo.search.length; addIndex++ ) {
          keyName = Object.keys(this._searchInfo.search[addIndex])[0];

          if ( keyName === 'smart' ) {
            this._showSmart(this._searchInfo.search[addIndex][keyName].data[0]);
          }
        }
      } else {
        returnStr1 = disProdCnt + '건';
        returnStr2 = addProdPayCnt + '건';
        returnStr3 = addProdPayFreeCnt + '건';

        this.$container.find('.fe-wireless-discount-additions-cnt').text(returnStr1);
        this.$container.find('.fe-wireless-paid-additions-cnt').text(returnStr2);
        this.$container.find('.fe-wireless-unpaid-additions-cnt').text(returnStr3);

        if ( disProdCnt === 0 ) {
          console.log('[common.search] [_calculateAdditionsFee] 가입한 무선 옵션/할인 프로그램 없음');
          $('.fe-wireless-discount-additions-cnt').removeAttr('href');
        }

        if ( addProdPayCnt === 0 ) {
          console.log('[common.search] [_calculateAdditionsFee] 가입한 무선 유료 부가서비스 없음');
          $('.fe-wireless-paid-additions-cnt').removeAttr('href');
        }

        if ( addProdPayFreeCnt === 0 ) {
          console.log('[common.search] [_calculateAdditionsFee] 가입한 무선 무료 부가서비스 없음');
          $('.fe-wireless-unpaid-additions-cnt').removeAttr('href');
        }

        $('.fe-prod-cnt-wireless').show();
        $('.fe-prod-cnt-wire').hide();
      }
    }
    // 아래 [OP002-9968] 의 변경사항은 배포 일정 연기 (9/17) 로 연기됨에 따라 원복처리함 [E]
  },
  /**
   * @function
   * @desc 남은데이터 계산, 출력( 즉답검색 case 2 , 데이터 관련 검색시)
   * @param {Object} usageData - 데이터 잔여량 객체
   * @returns {void}
   */
  _calculdateRemainData: function (usageData) {
    var gnrlData = usageData.gnrlData || [];
    var totalRemainUnLimited = false;
    var returnStr = '';
    gnrlData.map(function (_data) {
      if ( Tw.UNLIMIT_CODE.indexOf(_data.unlimit) !== -1 ) {
        totalRemainUnLimited = true;
      }
    });
    if ( totalRemainUnLimited ) {
      returnStr = Tw.COMMON_STRING.UNLIMIT;
    } else {
      var totalRemained = 0;
      for ( var idx in gnrlData ) {
        if ( !Tw.FormatHelper.isEmpty(gnrlData[idx].remained) ) {
          if ( gnrlData[idx].unit !== Tw.UNIT_E.FEE ) {
            totalRemained += parseInt(gnrlData[idx].remained, 10);
          }
        }
      }
      usageData.totalRemained = Tw.FormatHelper.convDataFormat(totalRemained, Tw.UNIT[Tw.UNIT_E.DATA]);
      returnStr = usageData.totalRemained.data + usageData.totalRemained.unit;
    }
    this.$container.find('.fe-data-remaind').text(returnStr);
  },
  /**
   * @function
   * @desc 남은음성잔여량 계산, 출력( 즉답검색 case 8 , 음성잔여량 관련 검색시)
   * @param {Object} usageData - 음성잔여량 객체
   * @returns {void}
   */
  _calculateRemainVoice: function (usageData) {
    var voice = usageData.voice || [];
    var totalRemainUnLimited = false;
    var returnStr = '';
    var whitespace = ' ';
    voice.map(function (_data) {
      if ( Tw.UNLIMIT_CODE.indexOf(_data.unlimit) !== -1 ) {
        totalRemainUnLimited = true;
      }
    });
    if ( totalRemainUnLimited ) {
      returnStr = Tw.COMMON_STRING.UNLIMIT;
    } else {
      var totalRemained = 0;
      for ( var idx in voice ) {
        if ( !Tw.FormatHelper.isEmpty(voice[idx].remained) ) {
          totalRemained += parseInt(voice[idx].remained, 10);
        }
      }
      usageData.totalRemained = Tw.FormatHelper.convVoiceFormat(totalRemained);

      if ( usageData.totalRemained.hours > 0 ) {
        returnStr = usageData.totalRemained.hours + '시간';

        if ( usageData.totalRemained.min > 0 ) {
          returnStr += whitespace + usageData.totalRemained.min + '분';

          if ( usageData.totalRemained.sec > 0 ) {
            returnStr += whitespace + usageData.totalRemained.sec + '초';
          }
        }
      } else {
        if ( usageData.totalRemained.min > 0 ) {
          returnStr = usageData.totalRemained.min + '분';

          if ( usageData.totalRemained.sec > 0 ) {
            returnStr += whitespace + usageData.totalRemained.sec + '초';
          }
        } else {
          if ( usageData.totalRemained.sec > 0 ) {
            returnStr = usageData.totalRemained.sec + '초';
          } else {
            returnStr = '0분';  // 음성잔여량 모두 소진시 0분 노출
          }
        }
      }
    }
    this.$container.find('.fe-voice-remaind').text(returnStr);
  },
  /**
   * @function
   * @desc 요금약정할인 정보 출력( 즉답검색 case 9 , 요금약정할인 관련 검색시)
   * @param {Object} usageData - 요금약정할인 정보 객체
   * @returns {void}
   */
  _requestFeeAgrmntDiscountInfo: function (feeAgrmntDiscountData) {
    var priceList = feeAgrmntDiscountData.priceList || [];
    var feeAgrmntDcCnt = 0;
    var feeAgrmntDcNm = '';
    var feeAgrmntDcEndDt = '';

    if ( priceList.length > 0 ) {
      feeAgrmntDcCnt = priceList.length;

      if ( feeAgrmntDcCnt === 1 ) {
        priceList.map(function (_data) {
          feeAgrmntDcNm = _data.disProdNm;
          feeAgrmntDcEndDt = _data.agrmtDcEndDt;
        });

        this.$container.find('.fe-fee-agrmnt-name').text(feeAgrmntDcNm);
        this.$container.find('.fe-fee-agrmnt-end-dt').text(Tw.DateHelper.getShortDateNoDot(feeAgrmntDcEndDt));

        $('#fe-fee-agrmnt-info-case1').show();
      } else {
        this.$container.find('.fe-fee-agrmnt-cnt').text(feeAgrmntDcCnt + '건');

        $('#fe-fee-agrmnt-info-case2').show();
      }
    }
  },
  /**
   * @function
   * @desc 단말할부정보 출력( 즉답검색 case 10 , 단말기 할부금 관련 검색시)
   * @param {Object} usageData - 단말할부 정보 객체
   * @returns {void}
   */
  _requestEqpInstallmentInfo: function (eqpInstallmentData) {
    var installmentList = eqpInstallmentData.installmentList || [];
    var eqpInstallmentPlanCnt = 0;  // 단말할부 건수
    var eqpInstallmentPlanMonth = '';  // 전체 할부개월수
    var remainEqpInstallmentAmt = '';   // 잔여 단말할부금
    var remainEqpInstallmentMonth = '';    // 잔여 할부개월수

    if ( installmentList.length > 0 ) {
      eqpInstallmentPlanCnt = installmentList.length;

      if ( eqpInstallmentPlanCnt > 1 ) {
        // 할부시작일을 기준으로 내림차순 정렬
        installmentList.sort(function (a, b) {
          return parseFloat(b.allotStaDt) - parseFloat(a.allotStaDt);
          // return parseFloat(a.allotStaDt) - parseFloat(b.allotStaDt);
        });
      }

      eqpInstallmentPlanMonth = installmentList[0].allotMthCnt;
      remainEqpInstallmentAmt = installmentList[0].invBamt;
      remainEqpInstallmentMonth = installmentList[0].invRmn;

      this.$container.find('.fe-remain-eqp-installment-amt').text(
        Tw.FormatHelper.convNumFormat(Number(remainEqpInstallmentAmt)) +
        Tw.CURRENCY_UNIT.WON + '(' + eqpInstallmentPlanMonth + '개월)');
      this.$container.find('.fe-remain-eqp-installment-month').text(remainEqpInstallmentMonth + Tw.DATE_UNIT.MONTH);

      if ( eqpInstallmentPlanCnt === 1 ) {
        $('#fe-eqp-installment-info-case1').show();
      } else {
        this.$container.find('.fe-remain-eqp-installment-cnt').text((eqpInstallmentPlanCnt - 1) + '건');
        $('#fe-eqp-installment-info-case2').show();
      }
    }
  },
  /**
   * @function
   * @desc 실시간 이용요금 요청( 즉답검색 case 3 )
   * @param {Number} count - 요청 count
   * @returns {void}
   */
  _requestRealTimeFee: function (count) {
    this._apiService.request(Tw.API_CMD.BFF_05_0022, { count: count }, {})
      .done($.proxy(function (res) {
        this._requestRealTimeCallback(res, count);
      }, this))
      .fail(function () {
        this._requestRealTimeFeeFail();
      });
  },
  /**
   * @function
   * @desc 실시간 이용요금 요청 콜백
   * @param {Object} res - 실시간 이용요금 리턴
   * @param {Number} cnt - 요청 count
   * @returns {void}
   */
  _requestRealTimeCallback: function (res, cnt) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      if ( res.result.hotBillInfo && res.result.hotBillInfo[0] && res.result.hotBillInfo[0].record1 ) {
        Tw.CommonHelper.endLoading('.container-wrap');
        this.$container.find('.fe-realtime-fee').text(res.result.hotBillInfo[0].totOpenBal2 + Tw.CURRENCY_UNIT.WON);
        this.$container.find('.paymentcharge-box.type03').removeClass('none');
      } else if ( cnt >= 2 ) {
        this._requestRealTimeFeeFail();
      } else {
        setTimeout($.proxy(this._requestRealTimeFee, this, cnt + 1), 2500);
      }
    } else {
      this._requestRealTimeFeeFail();
    }
  },
  /**
   * @function
   * @desc 실시간 이용요금 요청 실패 콜백
   * @returns {void}
   */
  _requestRealTimeFeeFail: function () {
    Tw.CommonHelper.endLoading('.container-wrap');
    if ( this._searchInfo.totalcount <= 1 ) {
      this._historyService.replaceURL(this._nowUrl + '&from=empty');
    }
  },
  /**
   * @function
   * @desc 페이지 이동
   * @param {Object} e
   */
  _goUrl: function (e) {
    var collection = $(e.currentTarget).attr('class');
    var param = '';

    var collectionSortArray = []; // new Array(); The array literal notation [] is preferable.
    collectionSortArray.push(this._reqOptions.sortCd.split('.'));
    Tw.Logger.info('[common.search] [_goUrl] 카테고리별 정렬기준 : ', collectionSortArray[0]);

    for ( var idx in collectionSortArray[0] ) {
      var collectionSortData = collectionSortArray[0][idx]; // ex) rate-H
      var tmpCollection = collectionSortData.split('-')[0]; // 컬렉션ex) rate
      var tmpSort = collectionSortData.split('-')[1]; // ex) H

      if ( collection === tmpCollection ) {
        Tw.Logger.info('[common.search] [_goUrl] 선택된 카테고리 : ', collection + ' (정렬기준 : ' + tmpSort + ')');
        // 선택되는 정렬기준으로 변경해준다.
        param = tmpSort;
        break;
      }
    }

    window.location.href = $(e.currentTarget).data('url') + '&sort=' + param;
  },
  /**
   * @function
   * @desc svcInfo 요청 및 초기화 실행
   * @returns {void}
   */
  _init: function () {
    Tw.Logger.info('[common.search] [_init]', '');
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(function (res) {
        if ( res.code === Tw.API_CODE.CODE_00 ) {
          this._svcInfo = res.result;
        }
        this._nextInit();
      }, this))
      .fail($.proxy(this._nextInit, this));
  }
};
