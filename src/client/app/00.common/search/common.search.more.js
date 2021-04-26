/**
 * @file common.search.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.11
 */

/**
 * @class
 * @desc 검색 결과 카테고리별 더보기
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} searchInfo - 검색 결과
 * @param {String} cdn – cdn 서버 주소
 * @param {String} accessQuery – 검색어
 * @param {String} step – 검색 진입으로 부터의 페이지 이동 횟수
 * @param {Object} paramObj – 파라미터 객체
 * @param {Number} pageNum – 더보기 결과 페이지
 * @param {String} nowUrl – 현재 url
 * @returns {void}
 */
Tw.CommonSearchMore = function (rootEl, searchInfo, cdn, accessQuery, step, paramObj, sort, pageNum, nowUrl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._cdn = cdn;
  this._step = Tw.FormatHelper.isEmpty(step) ? 1 : parseInt(step, 10);
  this._accessQuery = accessQuery;
  this._popupService = Tw.Popup;
  this._searchInfo = searchInfo;
  this._svcInfo = null;
  this._accessKeyword = this._searchInfo.query;
  this._category = accessQuery.category;
  this._paramObj = paramObj;
  this._sort = this._accessQuery.sort;
  this._pageNum = parseInt(pageNum, 10);
  this._nowUrl = nowUrl;

  this._bpcpService = Tw.Bpcp;
  this._showMoreCnt = 0;
  this._hasMoreContents = true;
  this._storedResult = null;
  this._init();
};
Tw.CommonSearchMore.prototype = new Tw.CommonSearch();
Tw.CommonSearchMore.prototype.constructor = Tw.CommonSearchMain;
$.extend(Tw.CommonSearchMore.prototype,
  {
    _reqOptions: {
      pageSize: 20,
      pageNo: 1,
      cateCd: '',
      ordCol: '',
      coPtnrNm: '',
      sortCd: 'shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.tapp-D.phone-D.tablet-D.accessory-D.tmembership-R.event-D.sale-C' +
        '.as_outlet-R.question-D.notice-D.prevent-D.manner-D.serviceInfo-D.siteInfo-D.bundle-A'
    },
    /**
     * @function
     * @desc 실제 초기화
     * @returns {void}
     */
    _nextInit: function () {
      // {keyword: "요금제", step: "3", category: "rate", sort: "A"}
      Tw.Logger.info('[common.search.more] [_nextInit]', 'this._paramObj : ' + this._paramObj);
      Tw.Logger.info('[common.search.more] [_nextInit]', 'this._sort : ' + this._sort);
      Tw.Logger.info('[common.search.more] [_nextInit]', 'this._cdn : ' + this._cdn);
      Tw.Logger.info('[common.search.more] [_nextInit]', 'this._pageNum : ' + this._pageNum);
      Tw.Logger.info('[common.search.more] [_nextInit]', 'this._category : ' + this._category);

      this._bpcpService.setData(this.$container, this._nowUrl);
      this._recentKeywordDateFormat = 'YY.M.D.';
      this._todayStr = Tw.DateHelper.getDateCustomFormat(this._recentKeywordDateFormat);
      this._platForm = Tw.BrowserHelper.isApp() ? 'app' : 'web';
      this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo) ? 'logOutUser' : this._svcInfo.svcMgmtNum;
      if ( this._searchInfo.search.length <= 0 ) {
        return;
      }

      Tw.Logger.info('[common.search.more] [_nextInit]', 'this._searchInfo.search[0][this._category] : ' +
        this._searchInfo.search[0][this._category]);

      this._storedResult = this._searchInfo.search[0][this._category].data;

      this.$categoryArea = this.$container.find('.tod-srhcategory-scrwrap');
      this._categoryInit();
      this._listData = this._arrangeData(this._searchInfo.search[0][this._category].data, this._category, null);
      //this._showShortcutList(this._listData,this.$container.find('#'+category+'_template'),this.$container.find('#'+category+'_list'));

      // this._showShortcutList(this._listData,$('#'+this._category+'_template'),this.$container.find('#'+this._category+'_list'),this._cdn);
      this._showShortcutList(this._listData, this._category, this._cdn);

      this.$inputElement = this.$container.find('#keyword');
      this.$inputElement.on('keydown', $.proxy(this._keyDownInputEvt, this));
      this.$inputElement.on('keyup', _.debounce($.proxy(this._keyUpInputEvt, this), 500));
      this.$inputElement.on('focus', $.proxy(this._inputFocusEvt, this));
      this.$container.on('click', '.icon-gnb-search', $.proxy(this._doSearch, this));

      this.$inputElementResultSearch = this.$container.find('#resultSearchKeyword');
      this.$inputElementResultSearch.on('keyup', _.debounce($.proxy(this._keyInputEvt, this), 500));
      if ( this._searchInfo.query !== this._searchInfo.researchQuery ) {
        var tempstr = this._searchInfo.researchQuery.replace(this._searchInfo.query, '').trim();
        this.$inputElementResultSearch.attr('value', tempstr);
      }
      this.$container.on('click', '.btn-search', $.proxy(this._doResultSearch, this));
      this.$container.on('click', '.fe-sort', $.proxy(this._onClickChangeSort, this));

      if ( this._accessQuery.sort === 'A' ) {
        this.$container.find('.fe-btn-sort-' + this._category).text('추천순');
      }
      else if ( this._accessQuery.sort === 'D' ) {
        this.$container.find('.fe-btn-sort-' + this._category).text('최신순');
      }
      else if ( this._accessQuery.sort === 'L' ) {
        this.$container.find('.fe-btn-sort-' + this._category).text('낮은 가격순');
      }
      else if ( this._accessQuery.sort === 'H' ) {
        this.$container.find('.fe-btn-sort-' + this._category).text('높은 가격순');
      }

      this.$container.on('click', '.icon-historyback-40', $.proxy(this._historyService.goBack, this));
      this.$container.on('change', '.sispopup', $.proxy(this._pageChange, this));
      this.$container.on('click', '.page-change', $.proxy(this._pageChange, this));
      this.$container.on('click', '.fe-category', $.proxy(this._changeCategory, this));
      // this.$container.on('click','.close-area',$.proxy(this._closeSearch,this));
      this.$container.on('touchstart click', '.close-area', $.proxy(this._closeSearch, this));

      this.$container.on('click', '.fe-btn-more', $.proxy(this._showMore, this));
      this.$container.on('change', '.resultsearch-box > .custom-form > input',
        $.proxy(function (e) {
          this.$container.find('.resultsearch-box > label').toggleClass('on', $(e.currentTarget).prop('checked'));
        }, this)
      );
      this.$container.on('click', '.search-element', $.proxy(this._searchRelatedKeyword, this));
      this.$container.on('click', '.filterselect-btn', $.proxy(this._showSelectFilter, this));
      this.$container.on('click', '.list-data', $.proxy(this._goLink, this));
      this.$container.find('#contents').removeClass('none');
      this.$container.on('click', '#page_selector', $.proxy(this._openPageSelector, this));

      this.$categorySlide = $('#fe-category-slide');
      this.$categorySlide.addClass('horizontal');
      $('#fe-category-slide').removeData('event');
      skt_landing.widgets.widget_horizontal($('.widget'));
      this.$container.on('click', '.acco-tit', $.proxy(function (e) { // 바로가기 자식 아코디언 열림/닫힘 이벤트 바인딩
        var $target = $(e.currentTarget).parent(); // 바로 상위
        $target.toggleClass('on');
        if ( $target.hasClass('on') ) {
          $target.find('button').attr('aria-pressed', true);
        }
        else {
          $target.find('button').attr('aria-pressed', false);
        }
      }, this));


      this.$container.on('scroll', $.proxy(function () {
        this.$inputElement.blur();
      }, this));

      this._removeDuplicatedSpace(this.$container.find('.cont-sp'), 'cont-sp');
      this._recentKeywordInit();
      this._recentKeywordTemplate = Handlebars.compile($('#recently_keyword_template').html());
      this._autoCompleteKeywrodTemplate = Handlebars.compile($('#auto_complete_template').html());
      new Tw.XtractorService(this.$container);

      if ( this._platForm !== 'app' ) {
        $('#fe-post-bnnr').show();
      }

      // 레이어팝업 닫기 또는 뒤로 가기 등을 통하여 진입한 경우 scroll_position 쿠키에 저장된 스크롤 위치로 화면을 이동시켜준다.
      var scrollPosition = Tw.CommonHelper.getCookie('scroll_position');
      Tw.Logger.info('[common.search.more] [_nextInit] scrollPosition Cookie : ', scrollPosition);

      if ( scrollPosition && scrollPosition !== '' && scrollPosition !== 'undefined' ) {
        // 저장된 스크롤 위치로 화면 이동
        $(window).scrollTop(scrollPosition);
        // 쿠키 초기화
        Tw.CommonHelper.setCookie('scroll_position', '');
      }

      //TEST code
      // this.$container.find('.horizontal-list').css('width', '2431px');

      // 최근 검색어 클릭시 초기화
      this.$container.on('click', '#auto_complete_list li, #recently_keyword_list li a', $.proxy(function () {
        Tw.Logger.info('[common.search] [최근 검색어 클릭]', '');
        // 정렬조건 쿠키 초기화
        this._initSearchSortCookie(this._svcInfo);
      }, this));

      function sortCodeToName(code) {
        if ( code === 'A' ) return '추천순';
        if ( code === 'H' ) return '높은 가격순';
        if ( code === 'L' ) return '낮은 가격순';
        if ( code === 'D' ) return '최신순';
        if ( code === 'C' ) return '클릭순';
        if ( code === 'R' ) return '정확도순';
      }

      // 뒤로가기 초기화 정렬 초기화 처리
      $(window).bind('pageshow', function (event) {
        if ( event.originalEvent.persisted ) {
        }
        else {
          $('.fe-btn-sort-rate').text(sortCodeToName(Tw.CommonHelper.getCookie('search_sort::rate')));
          $('.fe-btn-sort-service').text(sortCodeToName(Tw.CommonHelper.getCookie('search_sort::service')));
          $('.fe-btn-sort-tv_internet').text(sortCodeToName(Tw.CommonHelper.getCookie('search_sort::tv_internet')));
          $('.fe-btn-sort-troaming').text(sortCodeToName(Tw.CommonHelper.getCookie('search_sort::troaming')));
        }
      });

    },
    /**
     * @function
     * @desc 실제 초기화
     * @param {Array} data - 카테고리별 검색 데이터
     * @param {String} category - 카테고리명
     * @returns {Array}
     */
    _arrangeData: function (data, category, resultLimitCount) {

      if ( !data ) {
        return [];
      }

      // 15개까지만 노출해달라는 요건으로 인한 처리. (T app 은 16개)
      // 와이즈넛 엔진에서 전달주는 결과값 개수 조정이 가능하다면 아래 로직은 삭제 처리 필요
      // 더 보기 시에는 resultLimitCount값을 인자로 받아 노출할 개수를 처리한다.
      if ( resultLimitCount !== null ) {
        var limitCount = parseInt(resultLimitCount, 10);

        if ( data.length >= limitCount ) {
          data.splice(limitCount, data.length);
        }
        else {
          // 더보기 버튼 비노출 처리
          this._hasMoreContents = false;
        }

      }
      else {
        if ( data.length >= 20 ) {
          data.splice(20, data.length);
        }
        else {
          // 더보기 버튼 비노출 처리
          this._hasMoreContents = false;
          $('.btn-more').hide();
        }
      }

      Tw.Logger.info('--------------------------------------------------------------------------------', '');
      Tw.Logger.info('[common.search.more] [_arrangeData]', 'data : ' + data);
      Tw.Logger.info('--------------------------------------------------------------------------------', '');

      for ( var i = 0; i < data.length; i++ ) {
        Tw.Logger.info('[common.search.more] [_arrangeData]', 'data[' + i + '] : ', data[i]);

        for ( var key in data[i] ) {
          // Tw.Logger.info('key (' + key + ') : ', data[i][key]);

          if ( key === 'PR_STA_DT' || key === 'PR_END_DT' ) {
            data[i][key] = Tw.DateHelper.getShortDate(data[i][key]);
          }
          if ( typeof (data[i][key]) === 'string' ) {
            // 검색어와 매칭되는 곳에 하이라이트 처리
            if ( data[i][key].indexOf('<!HS>') !== -1 || data[i][key].indexOf('<!HE>') !== -1 ) {
              Tw.Logger.info('[common.search.more] [_arrangeData]', 'data[i][key] (전) : ' + data[i][key]);
              data[i][key] = data[i][key].replace(/<!HS>/g, '<em class="tod-highlight-text">');
              data[i][key] = data[i][key].replace(/<!HE>/g, '</em>');
              Tw.Logger.info('[common.search.more] [_arrangeData]', 'data[i][key] (후) : ' + data[i][key]);
            }
          }
          if ( key === 'DEPTH_PATH' ) {
            if ( data[i][key].charAt(0) === '|' ) {
              data[i][key] = data[i][key].replace('|', '');
            }
          }
          if ( ( /*category === 'direct' ||*/ category === 'phone' || category === 'tablet' || category === 'accessory') && key === 'TYPE' ) {
            if ( data[i][key] === 'shopacc' ) {
              if ( data[i].PRODUCT_TYPE !== '' ) {
                data[i].linkUrl = Tw.OUTLINK.DIRECT_IOT + '?categoryId=' + data[i].CATEGORY_ID +
                  '&productId=' + data[i].ACCESSORY_ID + '&productType=' + data[i].PRODUCT_TYPE;
              }
              else {
                data[i].linkUrl = Tw.OUTLINK.DIRECT_ACCESSORY + '?categoryId=' + data[i].CATEGORY_ID + '&accessoryId=' + data[i].ACCESSORY_ID;
              }
            }
            else {
              data[i].linkUrl = Tw.OUTLINK.DIRECT_MOBILE + '?categoryId=' + data[i].CATEGORY_ID + '&productGrpId=' + data[i].PRODUCT_GRP_ID;
            }
          }
          if ( key === 'METATAG' ) {
            Tw.Logger.info('[common.search.more] [_arrangeData]', 'METATAG : ' + data[i][key]);
            if ( typeof (data[i][key]) === 'string' ) {
              if ( data[i][key].indexOf('#') !== -1 ) {
                data[i][key] = data[i][key].split('#');

                if ( data[i][key][0] === '' ) {
                  data[i][key].splice(0, 1);
                }
                Tw.Logger.info('[common.search.more] [_arrangeData]', 'ㄴ------------ METATAG : ' + data[i][key]);
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
     * @desc 실제 초기화
     * @returns {void}
     */
    _showShortcutList: function (data, dataKey, cdn) {
      var template = $('#' + dataKey + '_template');
      var $parent = this.$container.find('#' + dataKey + '_list');
      $parent.empty();
      var shortcutTemplate = template.html();
      var templateData = Handlebars.compile(shortcutTemplate);

      if ( data.length <= 0 ) {
        $parent.addClass('none');
      }
      _.each(data, $.proxy(function (listData) {
        if ( this._nowUser === 'logOutUser' && listData.DOCID === 'M000083' ) {
          if ( this._searchInfo.totalcount <= 20 ) {
            $('.num').text(this._searchInfo.totalcount - 1);
          }
          return;
        }
        listData.MENU_GROUP = listData.MENU_GROUP || '';
        // if (listData.PROD_FLT_ID) {
        //   listData.PROD_FILTER_CODE = this._filterServiceCode(listData.PROD_FLT_ID);
        // }
        listData.PROD_SMRY_EXPS_FILTER_CODE = this._filterSummaryCode(listData.PROD_SMRY_EXPS_TYP_CD);
        $parent.append(templateData({ listData: listData, CDN: cdn }));
      }, this));

      if ( this._searchInfo.totalcount <= 20 ) {
        this.$container.find('#fe-btn-more').hide();
      }
    },
    /**
     * @function
     * @desc 검색창 input 이벤트
     * @returns {void}
     */
    _keyInputEvt: function (event) {
      // which:: https://api.jquery.com/event.which/
      if ( event.which === 13 ) {
        this._doResultSearch(event);
        event.preventDefault();
        event.stopPropagation();
      }
    },
    /**
     * @function
     * @desc 결과내 재검색 실행
     * @param {Object} event - 이벤트 객체
     * @returns {void}
     */
    _doResultSearch: function (event) {
      Tw.Logger.info('[common.search.more] [_doResultSearch]', 'this._sort : ' + this._sort);
      var keyword = this.$inputElement.val();
      var resultSearchKeyword = this.$inputElementResultSearch.val();

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
      var sort = Tw.CommonHelper.getCookie('search_sort::' + this._category) || 'A';
      this._accessQuery.sort = sort;

      var requestUrl = '/common/search/more?category=' + this._category + '&sort=' + this._accessQuery.sort +
        '&keyword=' + (encodeURIComponent(this._searchInfo.query)) + '&in_keyword=';
      requestUrl += encodeURIComponent(resultSearchKeyword.trim());
      requestUrl += '&step=' + (Number(this._step) + 1);
      this._addRecentlyKeyword(resultSearchKeyword);
      this._moveUrl(requestUrl);
    },
    /**
     * @function
     * @desc 정렬기준 변경
     * @returns {void}
     */
    _onClickChangeSort: function (e) {

      var $target = $(e.currentTarget);
      var selectedCollection = $target.attr('class').replace(/fe-sort| |tod-fright/gi, '');
      Tw.Logger.info('[common.search.more] [_onClickChangeSort]', '선택된 영역의 collection : ' + selectedCollection);

      var tempBtnStr = '.fe-btn-sort-' + selectedCollection;

      this._popupService.open({
        hbs: this._ACTION_SHEET_HBS,
        layer: true,
        btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: this._getSortCd(selectedCollection)
      }, $.proxy(this._onOpenGradeActionSheet, this, selectedCollection), null, 'select-grade', this.$container.find(tempBtnStr));
    },
    /**
     * @function
     * @desc 선택된 카테고리의 정렬기준 조회
     * @returns {String}
     */
    _getSortCd: function (categoryId) {
      Tw.Logger.info('[common.search.more] [_getSortCd]', '선택된 categoryId : ', categoryId);
      // Tw.Logger.info('[common.search.more] [_getSortCd]', 'this.accessQuery : ', this._accessQuery);
      // Tw.Logger.info('[common.search.more] [_getSortCd]', 'this._reqOptions.sortCd (AS-IS) : ', this._reqOptions.sortCd);

      this._reqOptions.sortCd.replace(
        categoryId + '-' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(categoryId + '-') +
        categoryId.length + 1, this._reqOptions.sortCd.indexOf(categoryId + '-') + categoryId.length + 2),
        categoryId + '-' + this._accessQuery.sort
      );

      Tw.Logger.info('[common.search.more] [_getSortCd]', 'this._reqOptions.sortCd (TO-BE) : ' + this._reqOptions.sortCd);
      this._paramObj.sort = Tw.CommonHelper.getCookie('search_sort::' + categoryId) || 'A';

      // 정렬조건 배열
      var sortOptions = [];

      // 로그인시 && (요금제 || 부가서비스)
      if ( this._svcInfo && this._svcInfo.svcMgmtNum && (categoryId === 'rate' || categoryId === 'service') ) {
        sortOptions.push({
          txt: Tw.SEARCH_FILTER_STR.ADMIN,  // 추천순
          'radio-attr': (this._paramObj.sort === 'A') ? 'class="focus-elem" sort="A" checked' : 'class="focus-elem" sort="A"',
          'label-attr': ' ',
          sort: 'A'
        });
      }
      
      sortOptions.push({
        txt: Tw.SEARCH_FILTER_STR.CLICK,  // 클릭순
        'radio-attr': (this._paramObj.sort === 'C') ? 'class="focus-elem" sort="C" checked' : 'class="focus-elem" sort="C"',
        'label-attr': ' ',
        sort: 'C'
      });

      sortOptions.push({
        txt: Tw.SEARCH_FILTER_STR.NEW,  // 최신순
        'radio-attr': (this._paramObj.sort === 'D') ? 'class="focus-elem" sort="D" checked' : 'class="focus-elem" sort="D"',
        'label-attr': ' ',
        sort: 'D'
      });

      sortOptions.push({
        txt: Tw.SEARCH_FILTER_STR.LOW,  // 낮은 가격순
        'radio-attr': (this._paramObj.sort === 'L') ? 'class="focus-elem" sort="L" checked' : 'class="focus-elem" sort="L"',
        'label-attr': ' ',
        sort: 'L'
      });

      sortOptions.push({
        txt: Tw.SEARCH_FILTER_STR.HIGH,  // 높은 가격순
        'radio-attr': (this._paramObj.sort === 'H') ? 'class="focus-elem" sort="H" checked' : 'class="focus-elem" sort="H"',
        'label-attr': ' ',
        sort: 'H'
      });

      this._sortCd = [{
        list: sortOptions
      }];

      Tw.Logger.info('[common.search.more] [_getSortCd]', categoryId + ' 카테고리의 정렬기준 : ' + this._paramObj.sort);

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

      $container.find('li input').change($.proxy(function (event) {
        var sort = $(event.currentTarget).attr('sort');

        Tw.Logger.info('[common.search.more] [_onOpenGradeActionSheet]', '현재 선택된 컬렉션 : ' + selectedCollection);
        Tw.Logger.info('[common.search.more] [_onOpenGradeActionSheet]', '현재 선택된 정렬기준 : ' + sort);

        // 컬렉션 별로 소팅 기준을 저장해두기 위한 처리 [S]
        var collectionSortArray = []; // new Array(); The array literal notation [] is preferable.
        collectionSortArray.push(this._reqOptions.sortCd.split('.'));
        var collectionSortStr = '';

        Tw.Logger.info('[common.search.more] [_onOpenGradeActionSheet]', '컬렉션별 정렬기준 : ' + collectionSortArray);

        for ( var idx in collectionSortArray[0] ) {
          var collectionSortData = collectionSortArray[0][idx];
          // Tw.Logger.info('[common.search.more] [_onOpenGradeActionSheet]', '[' + idx + '] : ' + collectionSortData);

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
        Tw.Logger.info('[common.search.more] [_onOpenGradeActionSheet]', '변경 적용된 컬렉션별 정렬기준 : ' + this._reqOptions.sortCd);
        Tw.Logger.info('[common.search.more] [_onOpenGradeActionSheet]', 'substring start index : ' +
          this._reqOptions.sortCd.indexOf(selectedCollection + '-'));

        var startIdx = this._reqOptions.sortCd.indexOf(selectedCollection + '-') + selectedCollection.length + 1;
        Tw.Logger.info('[common.search.more] [_onOpenGradeActionSheet]', selectedCollection + ' 컬렉션의 변경된 정렬기준 : ' +
          this._reqOptions.sortCd.substring(startIdx, startIdx + 1));
        // 컬렉션 별로 소팅 기준을 저장해두기 위한 처리 [E]

        var options = {
          collection: selectedCollection,
          pageNum: 1,
          sort: sort
        };

        this._sortRate(options);

        _.each(this._sortCd[0].list, function (item) {
          item['radio-attr'] = 'class="focus-elem" sort="' + item.sort + '"' +
            (item.sort === _this._reqOptions.sortCd.substring(startIdx, startIdx + 1) ? 'checked' : '');
          Tw.Logger.info('[common.search.more] [_onOpenGradeActionSheet]', 'item[radio-attr] : ' + item['radio-attr']);
        });

        this._popupService.close();
      }, this));

      // 웹접근성 대응
      Tw.CommonHelper.focusOnActionSheet($container);
    },
    /**
     * @function
     * @desc 변경된 정렬기준으로 데이터 재조회
     */
    _sortRate: function (options) {
      var _this = this;
      Tw.Logger.info('[common.search.more] [_sortRate]', '호출');
      Tw.Logger.info('[common.search.more] [_sortRate]', 'options : ', options);
      // e.preventDefault();   // a tag 의 # 링크가 동작하지 않도록 하기 위해 처리

      var searchApi = Tw.BrowserHelper.isApp() ? Tw.API_CMD.SEARCH_APP : Tw.API_CMD.SEARCH_WEB;

      // var searchApi;
      // if(Tw.BrowserHelper.isApp()) {
      //   searchApi = Tw.API_CMD.SEARCH_APP;
      // } else {
      //   searchApi = Tw.API_CMD.SEARCH_WEB;
      // }

      var query = this._searchInfo.query;
      var researchQuery = this._searchInfo.researchQuery;
      var reqOptions;

      // var collection = 'rate';
      // var pageNum = 1;
      // var sort = 'H';

      var collection = options.collection;
      var pageNum = options.pageNum;
      // var sort = options.subTabCd;
      var sort = options.sort;
      // cookie 저장
      Tw.CommonHelper.setCookie('search_sort::' + collection, sort);

      if ( query !== researchQuery ) {
        researchQuery = researchQuery.replace(query, '').trim();
        reqOptions = {
          query: encodeURIComponent(query),
          collection: collection,
          pageNum: pageNum,
          researchCd: 1,
          sort: sort,
          researchQuery: encodeURIComponent(researchQuery)
        };
      }
      else {
        reqOptions = { query: encodeURIComponent(query), collection: collection, pageNum: pageNum, sort: sort };
      }

      if ( Tw.BrowserHelper.isApp() ) {
        if ( Tw.BrowserHelper.isAndroid() ) {
          reqOptions.device = 'A';
        }
        else if ( Tw.BrowserHelper.isIos() ) {
          reqOptions.device = 'I';
        }
      }

      Tw.Logger.info('[common.search.more] [_sortRate]', 'query : ' + query);
      Tw.Logger.info('[common.search.more] [_sortRate]', 'encoded query : ' + encodeURIComponent(query));

      // this._apiService.requestAjax(searchApi, {
      this._apiService.request(searchApi, reqOptions)
        .done($.proxy(function (res) {
          if ( res.code === 0 ) {
            Tw.Logger.info('[common.search.more] [_sortRate] search result', res.result);
            // var sortedRateResultArr = res.result.search[0];
            // Tw.Logger.info('[common.search.more] [_sortRate]', '(res.result.search[0])[0] : ' + res.result.search[0][collection]);

            _this._storedResult = res.result.search[0][collection].data;
            _this._hasMoreContents = true;
            $('.btn-more').show();

            var sortedRateResultArr = res.result.search[0][collection].data;
            // var sortedRateResultArr = (res.result.search[0])[0].data;
            // var sortedRateResultArr = res.result.search[0].rate.data;
            Tw.Logger.info('[common.search.more] [_sortRate]', 'sortedRateResultArr.length : ' + sortedRateResultArr.length);

            // sortedRateResultArr.sort(function(a, b) {
            //   return parseFloat(b.BAS_FEE_INFO) - parseFloat(a.BAS_FEE_INFO); // 내림차순
            //   // return parseFloat(a.BAS_FEE_INFO) - parseFloat(b.BAS_FEE_INFO);  // 오름차순
            // });

            Tw.Logger.info('[common.search.more] [_sortRate]', 'sorted rate result array : ' + sortedRateResultArr);

            var $list = this.$container.find('#' + collection + '_list');
            $list.empty();


            // this._showShortcutList(this._arrangeData(this._searchInfo.search[i][keyName].data,keyName),keyName,this._cdn);
            _this._showShortcutList(_this._arrangeData(sortedRateResultArr, collection), collection, this._cdn, 'sort');

            this._sort = sort;
            Tw.Logger.info('[common.search.more] [_sortRate]', 'this._sort : ' + this._sort);

            // 더보기 횟수 초기화
            this._showMoreCnt = 0;

            // // reqOptions.sortCd 에 변경사항 적용
            // this._reqOptions.sortCd = this._reqOptions.sortCd.replace(
            //   collection + '-' + this._reqOptions.sortCd.substring(
            //   this._reqOptions.sortCd.indexOf(collection + '-') + collection.length + 1,
            //   this._reqOptions.sortCd.indexOf(collection + '-') + collection.length + 2 ),
            //   collection + '-' + sort
            // );


            // var selectedSubTab = _.find(this._sortCd[0].list, {
            //   subTabCd: sort
            // });
            var selectedSort = _.find(this._sortCd[0].list, {
              sort: sort
            });

            // var subTabValue = selectedSubTab ? selectedSubTab.txt : this._sortCd[0].list.txt;
            // Tw.Logger.info('[_sortRate] 선택된 정렬기준', subTabValue);
            var sortValue = selectedSort ? selectedSort.txt : this._sortCd[0].list.txt;
            Tw.Logger.info('[common.search.more] [_sortRate]', '선택된 정렬기준 : ' + sortValue);

            // _sortCd: [
            //   {
            //     list: [
            //       {
            //         txt: Tw.SEARCH_FILTER_STR.ADMIN,  // 추천순
            //     var collection = options.collection;
            // var pageNum = options.pageNum;
            // var sort = options.subTabCd;

            var tempBtnStr = '.fe-btn-sort-' + collection;
            // var tmpClassNm = '.fe-sort ' + collection;

            // Tw.Logger.info('[_sortRate] 선택된 영역', this.$container.find(tmpClassNm));
            // Tw.Logger.info('[_sortRate] 선택된 영역', this.$container.find(tmpClassNm).find('button'));
            Tw.Logger.info('[common.search.more] [_sortRate]', '선택된 영역 : ' + this.$container.find(tempBtnStr).attr('class'));
            // this.$container.find(tempBtnStr).text(subTabValue);
            this.$container.find(tempBtnStr).text(sortValue);

            if ( query !== researchQuery ) {
              this.$container.find('.fe-category.' + collection).attr('href', '/common/search/more?category=' +
                collection + '&keyword=' + query + '&step=' + (this._step + 1) + '&sort=' + sort + '&in_keyword=' + researchQuery);
            }
            else {
              this.$container.find('.fe-category.' + collection).attr('href', '/common/search/more?category=' +
                collection + '&keyword=' + query + '&step=' + (this._step + 1) + '&sort=' + sort);
            }

            try {
              if ( location && location.search ) {
                // 뒤로가기 시 정렬규칙을 유지할 수 있도록 수정
                history.replaceState({}, '', location.pathname + location.search.replace(/\&sort=[A-Z]/, '&sort=' + sort));
              }
            } catch ( e ) {
              Tw.Logger.info('[common.search.more] [_sortRate] ', e);
            }

          }
          else {
            Tw.Logger.info('[common.search.more] [_sortRate] search api 리턴 오류!!!', res.code);
            return;
          }
        }, this))
        .fail(function (err) {
          Tw.Logger.info('[common.search.more] [_sortRate] search api 연동 오류!!!', err);
          // GET_SVC_INFO API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
          // Tw.Error(err.code, err.msg).pop();
          return;
        });
    },
    /**
     * @function
     * @desc 카테고리 템플릿 그리기
     */
    _categoryInit: function () {
      // 카테고리 템플릿 그리기
      var $categoryHtml = $('#common_template').html();
      var $categoryHtmlTemplate = Handlebars.compile($categoryHtml);
      this.$categoryArea.append($categoryHtmlTemplate);

      // url=http://211.188.181.123:8080/search/tworld/mobile-web?
      // query=%EC%9A%94%EA%B8%88&
      // collection=all&
      // researchQuery=pps&
      // researchCd=1&
      // sort=shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A&userId=junhd0,

      // 현재 url 에 포함된 정렬기준을 reqOption.sortCd 에 적용해준다.
      Tw.Logger.info('[common.search.more] [_categoryInit] url 에 포함되어 있는 카테고리 : ', this._category);
      Tw.Logger.info('[common.search.more] [_categoryInit] url 에 포함되어 있는 정렬기준 : ', this._sort);
      Tw.Logger.info('[common.search.more] [_categoryInit] 현재 페이지 내 reqOption.sortCd 의 초기값 : ', this._reqOptions.sortCd);
      this._reqOptions.sortCd = this._reqOptions.sortCd.replace(this._category + '-' +
        this._reqOptions.sortCd.substring(
          this._reqOptions.sortCd.indexOf(this._category + '-') + this._category.length + 1,
          this._reqOptions.sortCd.indexOf(this._category + '-') + this._category.length + 2
        ), this._category + '-' + this._sort);
      Tw.Logger.info('[common.search.more] [_categoryInit] url 에 포함된 정렬기준으로 치환한 후 reqOption.sortCd 의 값 : ', this._reqOptions.sortCd);

      // 카테고리 영역에 건수를 노출해주기 위한 처리
      var searchApi = Tw.BrowserHelper.isApp() ? Tw.API_CMD.SEARCH_APP : Tw.API_CMD.SEARCH_WEB;
      var query = this._searchInfo.query;
      var researchQuery = this._searchInfo.researchQuery;
      var reqOptions;

      if ( query !== researchQuery ) {
        researchQuery = researchQuery.replace(query, '').trim();

        if ( Tw.BrowserHelper.isApp() ) {
          if ( Tw.BrowserHelper.isAndroid() ) {
            reqOptions = {
              query: encodeURIComponent(query),
              collection: 'all',
              researchCd: 1,
              sort: 'shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.tapp-D.phone-D.tablet-D.accessory-D.tmembership-R.event-D.sale-C' +
                '.as_outlet-R.question-D.notice-D.prevent-D.manner-D.serviceInfo-D.siteInfo-D.bundle-A',
              researchQuery: encodeURIComponent(researchQuery),
              device: 'A'
            };
          }
          else {
            reqOptions = {
              query: encodeURIComponent(query),
              collection: 'all',
              researchCd: 1,
              sort: 'shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.tapp-D.phone-D.tablet-D.accessory-D.tmembership-R.event-D.sale-C' +
                '.as_outlet-R.question-D.notice-D.prevent-D.manner-D.serviceInfo-D.siteInfo-D.bundle-A',
              researchQuery: encodeURIComponent(researchQuery),
              device: 'I'
            };
          }
        }
        else {
          reqOptions = {
            query: encodeURIComponent(query),
            collection: 'all',
            researchCd: 1,
            sort: 'shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.tapp-D.phone-D.tablet-D.accessory-D.tmembership-R.event-D.sale-C' +
              '.as_outlet-R.question-D.notice-D.prevent-D.manner-D.serviceInfo-D.siteInfo-D.bundle-A',
            researchQuery: encodeURIComponent(researchQuery)
          };
        }
      }
      else {
        if ( Tw.BrowserHelper.isApp() ) {
          if ( Tw.BrowserHelper.isAndroid() ) {
            reqOptions = {
              query: encodeURIComponent(query),
              collection: 'all',
              sort: 'shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.tapp-D.phone-D.tablet-D.accessory-D.tmembership-R.event-D.sale-C' +
                '.as_outlet-R.question-D.notice-D.prevent-D.manner-D.serviceInfo-D.siteInfo-D.bundle-A',
              device: 'A'
            };
          }
          else {
            reqOptions = {
              query: encodeURIComponent(query),
              collection: 'all',
              sort: 'shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.tapp-D.phone-D.tablet-D.accessory-D.tmembership-R.event-D.sale-C' +
                '.as_outlet-R.question-D.notice-D.prevent-D.manner-D.serviceInfo-D.siteInfo-D.bundle-A',
              device: 'I'
            };
          }
        }
        else {
          reqOptions = {
            query: encodeURIComponent(query),
            collection: 'all',
            sort: 'shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.tapp-D.phone-D.tablet-D.accessory-D.tmembership-R.event-D.sale-C' +
              '.as_outlet-R.question-D.notice-D.prevent-D.manner-D.serviceInfo-D.siteInfo-D.bundle-A'
          };
        }
      }

      this._apiService.request(searchApi, reqOptions)
        .done($.proxy(function (res) {
          if ( res.code === 0 ) {
            // Tw.Logger.info('[_categoryInit] res result', res.result);
            // Tw.Logger.info('[_categoryInit] res result search', res.result.search);

            var keyName, contentsCnt;
            var totalCnt = 0;

            for ( var i = 0; i < res.result.search.length; i++ ) {
              keyName = Object.keys(res.result.search[i])[0];
              contentsCnt = Number(res.result.search[i][keyName].count);

              if ( keyName === 'smart' || keyName === 'immediate' || keyName === 'banner' || keyName === 'lastevent' || keyName === 'direct' ) {
                continue;
              } else {
                var categoryStr = '.fe-' + keyName + '-count';
                // Tw.Logger.info('[' + keyName + ']', contentsCnt + '건');
                // Tw.Logger.info('[' + keyName + ']', this.$container.find(categoryStr));

                if ( contentsCnt < 1 ) {
                  // this.$container.find(categoryStr).parents('li').hide();
                  this.$container.find(categoryStr).parents('li').remove();
                }
                else {
                  this.$container.find(categoryStr).text(contentsCnt);

                  categoryStr = '.fe-category.' + keyName;

                  var sort = this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(keyName + '-') +
                    keyName.length + 1, this._reqOptions.sortCd.indexOf(keyName + '-') + keyName.length + 2);
                  // Tw.Logger.info('[common.search.more] [_categoryInit]', keyName + '의 정렬기준 : ' + sort);

                  if ( query !== researchQuery ) {
                    // this.$container.find('.fe-category.all').attr('href', '/common/search?category=all&keyword=' +
                    // query + '&step=' + (this._step + 1)  + '&in_keyword=' + researchQuery  + '&sort=' + this._sort);
                    // this.$container.find(categoryStr).attr('href', '/common/search/more?category=' + keyName +
                    // '&keyword=' + query + '&step=' + (this._step + 1)  + '&in_keyword=' + researchQuery  + '&sort=' + this._sort);
                    this.$container.find('.fe-category.all').attr('href', '/common/search?category=all&keyword=' +
                      query + '&step=' + (this._step + 1) + '&in_keyword=' + researchQuery + '&sort=' + sort + '&redirect=N');
                    this.$container.find(categoryStr).attr('href', '/common/search/more?category=' + keyName +
                      '&keyword=' + query + '&step=' + (this._step + 1) + '&in_keyword=' + researchQuery + '&sort=' + sort);
                  }
                  else {
                    // this.$container.find('.fe-category.all').attr('href', '/common/search?category=all&keyword=' +
                    // query + '&step=' + (this._step + 1) + '&sort=' + this._sort);
                    // this.$container.find(categoryStr).attr('href', '/common/search/more?category=' + keyName +
                    // '&keyword=' + query + '&step=' + (this._step + 1) + '&sort=' + this._sort);
                    this.$container.find('.fe-category.all').attr('href', '/common/search?category=all&keyword=' +
                      query + '&step=' + (this._step + 1) + '&sort=' + sort + '&redirect=N');
                    this.$container.find(categoryStr).attr('href', '/common/search/more?category=' + keyName +
                      '&keyword=' + query + '&step=' + (this._step + 1) + '&sort=' + sort);
                  }
                }

                // 전체 갯수는 스마트검색, 배너, 즉답검색결과는 제외하고 카운트한다.
                totalCnt += contentsCnt;
              }

              // Tw.Logger.info('[common.search.more] [_categoryInit]', '전체 의 정렬기준 : ' + this.$container.find('.fe-category.all').attr('href'));
              // this._showShortcutList(this._arrangeData(res.result.search[i][keyName].data,keyName),keyName,this._cdn);
            } // end for

            // 카테고리 영역을 모두 그려주고 나서 해당 스와이프 영역의 width 를 동적으로 맞춰주기 위한 처리[S]
            $('#fe-category-slide').addClass('horizontal');
            $('#fe-category-slide').removeData('event');
            skt_landing.widgets.widget_horizontal($('.widget'));
            // Tw.Logger.info('[common.search.more] [_categoryInit]', '카테고리 영역 width 를 가변적으로 조정해주는 처리 완료');
            // 카테고리 영역을 모두 그려주고 나서 해당 스와이프 영역의 width 를 동적으로 맞춰주기 위한 처리[E]


            this.$container.find('.fe-total-count').each(function (a, b) {
              var $target = $(b);
              $target.text(totalCnt);
            });

            var tempStr = '.fe-category.' + this._category;
            this.$container.find('.fe-category').removeClass('on');

            this.$container.find(tempStr).addClass('on');


            // 선택된 카테고리를 화면 좌측으로 붙여서 노출해주기 위한 처리[S]
            var categoryTop = $('.tod-srhcategory-scrwrap').offset().top;
            var $categoryOn = $('#fe-category-area').find('li.on');

            var leftPosition = $categoryOn.offset().left - 16;

            $(window).on('scroll', function () {
              $('.tod-srhcategory-scrwrap').toggleClass('fixed', ($(window).scrollTop() + $('.searchbox-header').height()) > categoryTop);
            });
            Tw.Logger.info('[common.search.more] [_categoryInit]', '상하 스크롤 시 카테고리 영역을 헤더 (검색창 영역) 에 fix 하여 고정적으로 노출해주기 위한 처리 완료');

            setTimeout(function () {
              $('#fe-category-area').scrollLeft(leftPosition);
            }, 0);
            Tw.Logger.info('[common.search.more] [_categoryInit]', '카테고리 영역 내에서 선택된 카테고리를 가장 좌측으로 붙여서 노출해주기 위한 처리 완료');
            // 선택된 카테고리를 화면 좌측으로 붙여서 노출해주기 위한 처리[E]


          }
          else {
            Tw.Logger.info('[common.search.more] [_categoryInit] search api 리턴 오류!!!', res.code);
            return;
          }
        }, this))
        .fail(function (err) {
          Tw.Logger.info('[common.search.more] [_categoryInit] search api 연동 오류!!!', err);
          return;
        });

    },
    /**
     * @function
     * @desc 검색 결과 페이지 변경
     * @param {Object} eventObj - 이벤트 객체
     * @returns {void}
     */
    _pageChange: function (eventObj) {
      //this._historyService.goLoad(eventObj.currentTarget.value);
      this._moveUrl(eventObj.currentTarget.value);
    },
    /**
     * @function
     * @desc 검색 실행
     * @param {Object} evt - 이벤트 객체
     * @returns {void}
     */
    _doSearch: function (evt) {
      Tw.Logger.info('[common.search.more] [_doSearch]', '');

      var keyword = this.$inputElement.val();
      if ( Tw.FormatHelper.isEmpty(keyword) || keyword.trim().length <= 0 ) {
        this.$inputElement.blur();
        this._popupService.openAlert(null, Tw.ALERT_MSG_SEARCH.KEYWORD_ERR, null, null, 'search_keyword_err', $(evt.currentTarget));
        return;
      }
      var inResult = this.$container.find('#resultsearch').is(':checked');
      var requestUrl = inResult ? '/common/search/in-result?category=' + (encodeURIComponent(this._category)) + '&keyword=' +
        (encodeURIComponent(this._accessKeyword)) + '&in_keyword=' : '/common/search?keyword=';
      requestUrl += encodeURIComponent(keyword);
      requestUrl += '&step=' + (Number(this._step) + 1);
      var sort = '&sort=shortcut-C';

      // 로그인시
      if ( this._svcInfo && this._svcInfo.svcMgmtNum ) {
        sort += '.rate-A';
        sort += '.service-A';
      } else {
        sort += '.rate-C';
        sort += '.service-C';
      }
      sort += '.tv_internet-C';
      sort += '.troaming-C';
      // sort += '.direct-D';
      sort += '.phone-D';
      sort += '.tablet-D';
      sort += '.accessory-D';
      requestUrl += sort;
      this._addRecentlyKeyword(keyword);
      this._moveUrl(requestUrl);

      // 정렬조건 쿠키 초기화
      this._initSearchSortCookie(this._svcInfo);
    },
    /**
     * @function
     * @desc 더 보기
     */
    _showMore: function (/* targetEvt */) {
      var _this = this;
      // var $targetElement = $(targetEvt.currentTarget);

      // 컬렉션 정보 가져오기
      // var selectedCollection = $targetElement.attr('class').replace(/fe-btn-more| /gi, '');
      // Tw.Logger.info('더보기 할 컬렉션 : ', '[' + selectedCollection + ']');

      Tw.Logger.info('[common.search.more] [_showMore]', '더보기 할 컬렉션 : [' + this._category + ']');


      var searchApi = Tw.BrowserHelper.isApp() ? Tw.API_CMD.SEARCH_APP : Tw.API_CMD.SEARCH_WEB;
      // var searchApi;
      // if(Tw.BrowserHelper.isApp()) {
      //   searchApi = Tw.API_CMD.SEARCH_APP;
      // } else {
      //   searchApi = Tw.API_CMD.SEARCH_WEB;
      // }

      this._showMoreCnt += 1;
      this._pageNum = this._showMoreCnt + 1;
      Tw.Logger.info('[common.search.more] [_showMore]', 'this._showMoreCnt : [' + this._showMoreCnt + ']');
      Tw.Logger.info('[common.search.more] [_showMore]', 'this._pageNum : [' + this._pageNum + ']');
      Tw.Logger.info('[common.search.more] [_showMore] this._reqOptions.sortCd : ', this._reqOptions.sortCd);

      var sort = this._category + '-' +
        this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._category + '-') + this._category.length +
          1, this._reqOptions.sortCd.indexOf(this._category + '-') + this._category.length + 2);

      var reqOptions;
      if ( Tw.BrowserHelper.isApp() ) {
        if ( Tw.BrowserHelper.isAndroid() ) {
          reqOptions = {
            query: encodeURIComponent(this._searchInfo.query),
            collection: this._category,
            pageNum: this._pageNum,
            sort: sort,
            device: 'A'
          };
        }
        else if ( Tw.BrowserHelper.isIos() ) {
          reqOptions = {
            query: encodeURIComponent(this._searchInfo.query),
            collection: this._category,
            pageNum: this._pageNum,
            sort: sort,
            device: 'I'
          };
        }
        else {
          reqOptions = {
            query: encodeURIComponent(this._searchInfo.query),
            collection: this._category,
            pageNum: this._pageNum,
            sort: sort
          };
        }
      }
      else {
        reqOptions = {
          query: encodeURIComponent(this._searchInfo.query),
          collection: this._category,
          pageNum: this._pageNum,
          sort: sort
        };
      }

      this._apiService.request(searchApi, reqOptions)
        .done($.proxy(function (res) {
          if ( res.code === 0 ) {
            var searchResultData = res.result.search[0][this._category].data;
            Tw.Logger.info('[common.search.more] [_showMore]', 'searchResultData : ' + searchResultData);

            var totalCount = res.result.search[0][this._category].count;

            // 결과 합치기
            for ( var idx in searchResultData ) {
              this._storedResult.push(searchResultData[idx]);
            }
            Tw.Logger.info('[common.search.more] [_showMore]', 'merged result : ' + this._storedResult);

            // 노출할 컨텐츠 개수 제한
            // var resultLimitCount = this._category !== 'tapp' ? 15 + (this._showMoreCnt * 10) : 16 + (this._showMoreCnt * 16);
            var resultLimitCount = 20 + (this._showMoreCnt * 20);
            Tw.Logger.info('[common.search.more] [_showMore]', '검색결과 전체 건수 : ' + totalCount);
            Tw.Logger.info('[common.search.more] [_showMore]', '노출할 컨텐츠 제한 개수 : ' + resultLimitCount);

            // 전체 검색결과 건수가 노출건수보다 많으면
            if ( Number(totalCount) > Number(resultLimitCount) ) {
              this._hasMoreContents = true;
            }

            var $list = this.$container.find('#' + this._category + '_list');
            $list.empty();


            // this._showShortcutList(this._arrangeData(this._searchInfo.search[i][keyName].data,keyName),keyName,this._cdn);
            // _this._showShortcutList(_this._arrangeData(searchResultData, this._category, resultLimitCount),
            // $('#'+this._category+'_template'), $list, this._cdn);
            // _this._showShortcutList(_this._arrangeData(this._storedResult, this._category, resultLimitCount),
            // $('#'+this._category+'_template'), $list, this._cdn);

            _this._showShortcutList(_this._arrangeData(this._storedResult, this._category, resultLimitCount), this._category, this._cdn);

            if ( !this._hasMoreContents ) {
              // 더보기할 컨텐츠가 없으면 (모두 노출된 상태)
              $('.btn-more').hide();
            }

          }
          else {
            Tw.Logger.info('[common.search.more] [_showMore] search api 리턴 오류!!!', res.code);
            return;
          }
        }, this))
        .fail(function (err) {
          Tw.Logger.info('[common.search.more] [_showMore] search api 연동 오류!!!', err);
          // GET_SVC_INFO API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
          // Tw.Error(err.code, err.msg).pop();
          return;
        });

    },
    /**
     * @function
     * @desc 다른 카테고리 검색결과 조회 (카테고리 변경)
     * @param {Object} evt - 이벤트 객체
     * @returns {void}
     */
    _changeCategory: function (e) {
      var $elem = $(e.currentTarget);
      var linkUrl = $elem.attr('href');

      if ( Tw.FormatHelper.isEmpty(linkUrl) ) {
        return;
      }

      function getParam(sname) {
        var params = linkUrl.substr(linkUrl.indexOf('?') + 1);
        var sval = '';

        if ( params ) {
          params = params.split('&');
          for ( var i = 0; i < params.length; i++ ) {
            var temp = params[i].split('=');
            if ( temp && temp.length > 1 && temp[0] === sname ) {
              sval = temp[1];
            }
          }
        }
        return sval;
      }

      var category = getParam('category');

      function replaceQueryParam(param, newval, search) {
        var regex = new RegExp('([?;&])' + param + '[^&;]*[;&]?');
        var query = search.replace(regex, '$1').replace(/&$/, '');
        return (query.length > 2 ? query + '&' : '?') + (newval ? param + '=' + newval : '');
      }

      var sort = '';
      if ( category === 'all' ) {
        var sortsName = ['search_sort::rate', 'search_sort::service', 'search_sort::tv_internet', 'search_sort::troaming', 
                          'search_sort::phone', 'search_sort::tablet', 'search_sort::accessory'];
        
        sort = 'shortcut-C';
        sort += '.rate-' + (Tw.CommonHelper.getCookie(sortsName[0]) || 'C');
        sort += '.service-' + (Tw.CommonHelper.getCookie(sortsName[1]) || 'C');
        sort += '.tv_internet-' + (Tw.CommonHelper.getCookie(sortsName[2]) || 'C');
        sort += '.troaming-' + (Tw.CommonHelper.getCookie(sortsName[3]) || 'C');
        sort += '.phone-' + (Tw.CommonHelper.getCookie(sortsName[4]) || 'D');
        sort += '.tablet-' + (Tw.CommonHelper.getCookie(sortsName[5]) || 'D');
        sort += '.accessory-' + (Tw.CommonHelper.getCookie(sortsName[6]) || 'D');
        linkUrl = replaceQueryParam('sort', sort, linkUrl);
      } else {
        sort = Tw.CommonHelper.getCookie('search_sort::' + category);
        linkUrl = replaceQueryParam('sort', sort, linkUrl);
      }
      this._moveUrl(linkUrl);
    },
    /**
     * @function
     * @desc 다이렉트샵 검색 정렬 기준 필터 액션시트 출력
     * @param {Object} evt - 이벤트 객체
     * @returns {void}
     */
    _showSelectFilter: function (evt) {
      var sort = 'D';

      if ( this._searchInfo.search[0] ) {
        if ( this._searchInfo.search[0].direct && this._searchInfo.search[0].direct.sort ) {
          sort = this._searchInfo.search[0].direct.sort;
        }
        else if ( this._searchInfo.search[0].phone && this._searchInfo.search[0].phone.sort ) {
          sort = this._searchInfo.search[0].phone.sort;
        }
        else if ( this._searchInfo.search[0].tablet && this._searchInfo.search[0].tablet.sort ) {
          sort = this._searchInfo.search[0].tablet.sort;
        }
        else if ( this._searchInfo.search[0].accessory && this._searchInfo.search[0].accessory.sort ) {
          sort = this._searchInfo.search[0].accessory.sort;
        }
      }

      if ( sort && sort.indexOf('-') !== -1 ) {
        sort = sort.substr(sort.indexOf('-') + 1);
      }

      var listData = [
        // { 'label-attr': 'for=ra0', 'txt': Tw.SEARCH_FILTER_STR.ACCURACY,
        //   'radio-attr':'id="ra0" data-type="R" name="selectFilter" value="'+Tw.SEARCH_FILTER_STR.ACCURACY+'" '+
        //   (this._searchInfo.search[0].direct.sort==='R'?'checked':'' )},
        {
          'label-attr': 'for=ra4', 'txt': Tw.SEARCH_FILTER_STR.CLICK,
          'radio-attr': 'id="ra4" data-type="C" name="selectFilter" value="' + Tw.SEARCH_FILTER_STR.CLICK + '" ' +
            (sort === 'C' ? 'checked' : '')
        },
        {
          'label-attr': 'for=ra1', 'txt': Tw.SEARCH_FILTER_STR.NEW,
          'radio-attr': 'id="ra1" data-type="D" name="selectFilter" value="' + Tw.SEARCH_FILTER_STR.NEW + '" ' +
            (sort === 'D' ? 'checked' : '')
        },
        {
          'label-attr': 'for=ra2', 'txt': Tw.SEARCH_FILTER_STR.LOW,
          'radio-attr': 'id="ra2" data-type="L" name="selectFilter" value="' + Tw.SEARCH_FILTER_STR.LOW + '" ' +
            (sort === 'L' ? 'checked' : '')
        },
        {
          'label-attr': 'for=ra3', 'txt': Tw.SEARCH_FILTER_STR.HIGH,
          'radio-attr': 'id="ra3" data-type="H" name="selectFilter" value="' + Tw.SEARCH_FILTER_STR.HIGH + '" ' +
            (sort === 'H' ? 'checked' : '')
        }
      ];
      this._popupService.open({
          hbs: 'actionsheet01',
          layer: true,
          data: [{ list: listData }],
          btnfloating: { 'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
        }, $.proxy(this._bindPopupElementEvt, this),
        null,
        'select_filter', $(evt.currentTarget));
    },
    /**
     * @function
     * @desc 다이렉트샵 검색 정렬 기준 필터 액션시트 이벤트 바인딩
     * @param {Object} popupElement - 팝업 레이어 객체
     * @returns {void}
     */
    _bindPopupElementEvt: function ($popupElement) {
      Tw.CommonHelper.focusOnActionSheet($popupElement);
      $popupElement.on('click', '.cont-actionsheet input', $.proxy(this._filterSelectEvent, this));
    },
    /**
     * @function
     * @desc 다이렉트샵 검색 정렬 기준 필터 액션시트 옵션 선택 이벤트
     * @param {Object} btnEvt - 이벤트 객체
     * @returns {void}
     */
    _filterSelectEvent: function (btnEvt) {
      var changeFilterUrl = this._accessQuery.in_keyword ? '/common/search/in-result?category=' + this._category +
        '&keyword=' + this._accessQuery.keyword : '/common/search/more?category=' + this._category + '&keyword=' + this._accessQuery.keyword;
      // changeFilterUrl+='&arrange='+$(btnEvt.currentTarget).data('type');
      changeFilterUrl += '&sort=' + $(btnEvt.currentTarget).data('type');

      // cookie 저장
      Tw.CommonHelper.setCookie('search_sort::' + this._category, $(btnEvt.currentTarget).data('type'));

      if ( this._accessQuery.in_keyword ) {
        changeFilterUrl += '&in_keyword=' + this._accessQuery.in_keyword;
      }
      changeFilterUrl += '&step=' + (Number(this._step) + 1);
      this._popupService.close();
      this._moveUrl(changeFilterUrl);
    },
    /**
     * @function
     * @desc 페이지 이동을 위한 액션시트 출력
     * @param {Object} targetEvt - 이벤트 객체
     * @returns {void}
     */
    _openPageSelector: function (targetEvt) {
      var totalPageNum = parseInt(((this._searchInfo.totalcount / 20) + (this._searchInfo.totalcount % 20 > 0 ? 1 : 0)), 10);
      var data = this._makePageSelectorData(totalPageNum, this._pageNum);

      this._popupService.open({
          hbs: 'actionsheet01',// hbs의 파일명
          layer: true,
          data: [{ list: data }],
          btnfloating: { 'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
        },
        $.proxy(this._bindPageSelectorEvt, this),
        null,
        null, $(targetEvt.currentTarget));
    },
    /**
     * @function
     * @desc 페이지 이동을 위한 액션시트 데이터 생성
     * @param {Number} pageLimit - 마지막 페이지 번호
     * @param {Number} nowPage - 현재 페이지 번호
     * @returns {Array}
     */
    _makePageSelectorData: function (pageLimit, nowPage) {
      var _returnData = [];
      for ( var i = 1; i <= pageLimit; i++ ) {
        if ( nowPage === i ) {
          //_returnData.push({option : 'checked' , value : i , attr : 'data-idx='+i});
          _returnData.push({
            'label-attr': 'for=ra' + i, 'txt': i,
            'radio-attr': 'id="ra' + i + '" data-idx="' + i + '" name="selectPage" value="' + i + '" checked'
          });
        }
        else {
          //_returnData.push({option : '' , value : i , attr : 'data-idx='+i});
          _returnData.push({
            'label-attr': 'for=ra' + i, 'txt': i,
            'radio-attr': 'id="ra' + i + '" data-idx="' + i + '" name="selectPage" value="' + i + '" '
          });
        }
      }
      return _returnData;
    },
    /**
     * @function
     * @desc 페이지 이동을 위한 액션시트 이벤트 바인딩
     * @param {Object} evt - 이벤트 객체
     * @returns {void}
     */
    _bindPageSelectorEvt: function ($layer) {
      Tw.CommonHelper.focusOnActionSheet($layer);
      $layer.on('click', '.cont-actionsheet input', $.proxy(this._changePageNum, this));
    },
    /**
     * @function
     * @desc 페이지 이동을 위한 액션시트 페이지 선택 이벤트
     * @param {Object} evt - 이벤트 객체
     * @returns {void}
     */
    _changePageNum: function (evt) {
      var selectedPageNum = $(evt.currentTarget).data('idx');
      this._popupService.close();
      if ( selectedPageNum !== this._pageNum ) {
        this._paramObj.page = selectedPageNum;
        this._paramObj.step = this._step + 1;
        this._paramObj.keyword = encodeURIComponent(this._paramObj.keyword);
        this._moveUrl(this._makeUrl(this._paramObj));
      }
    },
    /**
     * @function
     * @desc 페이지 이동을 위한 url 생성 함수
     * @param {Object} paramObj - 현재 페이지 파라미터 객체
     * @returns {String}
     */
    _makeUrl: function (paramObj) {
      var targetUrl = this._nowUrl.split('?')[0] + '?';
      for ( var key in paramObj ) {
        targetUrl += key + '=' + paramObj[key] + '&';
      }
      return targetUrl.substring(0, targetUrl.length - 1);
    }
  });
