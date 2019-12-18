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
Tw.CommonSearchMore = function (rootEl,searchInfo,cdn,accessQuery,step,paramObj,sort,pageNum,nowUrl) {
  this.$container = rootEl;
  //this._category = category;
  this._historyService = new Tw.HistoryService();
  //this._searchInfo = JSON.parse(this._decodeEscapeChar(searchInfo));
  this._apiService = Tw.Api;
  this._cdn = cdn;
  this._step = Tw.FormatHelper.isEmpty(step)?1:parseInt(step,10);
  this._accessQuery = accessQuery;
  this._popupService = Tw.Popup;
  this._searchInfo = searchInfo;
  this._svcInfo = null;
  this._accessKeyword = this._searchInfo.query;
  this._category = accessQuery.category;
  this._paramObj = paramObj;
  this._pageNum = parseInt(pageNum,10);
  this._nowUrl = nowUrl;
  this._sort = this._accessQuery.sort;
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
    sortCd: 'shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A.bundle-A'
  },
  // _sortCd: [
  //   {
  //     list: [
  //       {
  //         txt: Tw.SEARCH_FILTER_STR.ADMIN,  // 추천순
  //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="A" checked',
  //         'radio-attr': 'class="focus-elem" sort="A" checked',
  //         // 'radio-attr': 'class="focus-elem" sort="A" ' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'A' ? 'checked' : '',
  //         'label-attr': ' ',
  //         // subTabCd: 'A'
  //         sort: 'A'
  //       },
  //       {
  //         txt: Tw.SEARCH_FILTER_STR.NEW,  // 최신순
  //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="D"',
  //         'radio-attr': 'class="focus-elem" sort="D"',
  //         // 'radio-attr': 'class="focus-elem" sort="D" ' + this_reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'D' ? 'checked' : '',
  //         'label-attr': ' ',
  //         // subTabCd: 'D'
  //         sort: 'D'
  //       },
  //       {
  //         txt: Tw.SEARCH_FILTER_STR.LOW,  // 낮은 가격순
  //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="L"',
  //         'radio-attr': 'class="focus-elem" sort="L"',
  //         // 'radio-attr': 'class="focus-elem" sort="L" ' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'L' ? 'checked' : '',
  //         'label-attr': ' ',
  //         // subTabCd: 'L'
  //         sort: 'L'
  //       },
  //       {
  //         txt: Tw.SEARCH_FILTER_STR.HIGH,  // 높은 가격순
  //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="H"',
  //         'radio-attr': 'class="focus-elem" sort="H"',
  //         // 'radio-attr': 'class="focus-elem" sort="H" ' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'H' ? 'checked' : '',
  //         'label-attr': ' ',
  //         // subTabCd: 'H'
  //         sort: 'H'
  //       }
  //     ]
  //   }
  // ],
  /**
   * @function
   * @member
   * @desc 실제 초기화
   * @returns {void}
   */
  _nextInit : function () {
    this._bpcpService.setData(this.$container, this._nowUrl);
    this._recentKeywordDateFormat = 'YY.M.D.';
    this._todayStr = Tw.DateHelper.getDateCustomFormat(this._recentKeywordDateFormat);
    this._platForm = Tw.BrowserHelper.isApp()?'app':'web';
    this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    if(this._searchInfo.search.length<=0){
      return;
    }

    this._storedResult = this._searchInfo.search[0][this._category].data;

    

    this.$categoryArea = this.$container.find('.tod-srhcategory-scrwrap');
    this._categoryInit();
    this._listData =this._arrangeData(this._searchInfo.search[0][this._category].data,this._category,null);
    //this._showShortcutList(this._listData,this.$container.find('#'+category+'_template'),this.$container.find('#'+category+'_list'));
    
    // this._showShortcutList(this._listData,$('#'+this._category+'_template'),this.$container.find('#'+this._category+'_list'),this._cdn);
    this._showShortcutList(this._listData,this._category,this._cdn);

    this.$inputElement =this.$container.find('#keyword');
    this.$inputElement.on('keyup',$.proxy(this._inputChangeEvent,this));
    this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
    this.$container.on('click','.icon-gnb-search',$.proxy(this._doSearch,this));

    this.$inputElementResultSearch = this.$container.find('#resultSearchKeyword');
    this.$inputElementResultSearch.on('keyup',$.proxy(this._keyInputEvt,this));
    if (this._searchInfo.query !== this._searchInfo.researchQuery) {
      var tempstr = this._searchInfo.researchQuery.replace(this._searchInfo.query, '').trim();
      this.$inputElementResultSearch.attr('value', tempstr);
    }
    this.$container.on('click','.btn-search',$.proxy(this._doResultSearch,this));

    var categoryTop = $('.tod-srhcategory-scrwrap').offset().top;
    
    $(window).on('scroll', function(){
      $('.tod-srhcategory-scrwrap').toggleClass('fixed', ($(window).scrollTop() + $('.searchbox-header').height()) > categoryTop);
    });

    

    this.$container.on('click', '.fe-sort', $.proxy(this._onClickChangeSort, this));
    
    if(this._accessQuery.sort === 'A') {
      this.$container.find('.fe-btn-sort-'+this._category).text('추천순');
    } else if(this._accessQuery.sort === 'D') {
      this.$container.find('.fe-btn-sort-'+this._category).text('최신순');
    } else if(this._accessQuery.sort === 'L') {
      this.$container.find('.fe-btn-sort-'+this._category).text('낮은 가격순');
    } else if(this._accessQuery.sort === 'H') {
      this.$container.find('.fe-btn-sort-'+this._category).text('높은 가격순');
    }
    
    this.$container.on('click','.icon-historyback-40',$.proxy(this._historyService.goBack,this));
    this.$container.on('change','.sispopup',$.proxy(this._pageChange,this));
    this.$container.on('click','.page-change',$.proxy(this._pageChange,this));
    this.$container.on('click','.fe-category',$.proxy(this._changeCategory,this));
    // this.$container.on('click','.close-area',$.proxy(this._closeSearch,this));
    this.$container.on('touchstart', '.close-area', $.proxy(this._closeSearch, this));
    
    this.$container.on('click','.fe-btn-more',$.proxy(this._showMore,this));
    this.$container.on('change','.resultsearch-box > .custom-form > input',$.proxy(
      function(e) {this.$container.find('.resultsearch-box > label').toggleClass('on',$(e.currentTarget).prop('checked'));}
    ,this));
    this.$container.on('click','.search-element',$.proxy(this._searchRelatedKeyword,this));
    this.$container.on('click','.filterselect-btn',$.proxy(this._showSelectFilter,this));
    this.$container.on('click','.list-data',$.proxy(this._goLink,this));
    this.$container.find('#contents').removeClass('none');
    this.$container.on('click','#page_selector',$.proxy(this._openPageSelector,this));
    

    this.$categorySlide = this.$container.find('#fe-category-slide');
    this.$categorySlide.addClass('horizontal');
    Tw.Logger.info('[_nextInit] this.$categorySlide.attr("class") : ', this.$categorySlide.attr('class'));
    Tw.Logger.info('[_nextInit] this.$categorySlide.parents("div") : ', this.$categorySlide.parents('div')[0]);
    skt_landing.widgets.widget_horizontal(this.$categorySlide.parents('div')[0]);


    this.$container.on('scroll',$.proxy(function () {
      this.$inputElement.blur();
    },this));

    this._removeDuplicatedSpace(this.$container.find('.cont-sp'),'cont-sp');
    this._recentKeywordInit();
    this._recentKeywordTemplate = Handlebars.compile($('#recently_keyword_template').html());
    this._autoCompleteKeywrodTemplate = Handlebars.compile($('#auto_complete_template').html());
    new Tw.XtractorService(this.$container);

    if(this._platForm!=='app'){
      $('#fe-post-bnnr').show();
    }

    //TEST code
    // this.$container.find('.horizontal-list').css('width', '2431px');
  },
  /**
   * @function
   * @member
   * @desc 실제 초기화
   * @param {Array} data - 카테고리별 검색 데이터
   * @param {String} category - 카테고리명
   * @returns {Array}
   */
  _arrangeData : function (data,category,resultLimitCount) {
    var _this = this;
    // Tw.Logger.info('[_arrangeData] 진입', '');

    // Tw.Logger.info('[_arrangeData] this._searchInfo.query : ', this._searchInfo.query);
    // Tw.Logger.info('[_arrangeData] this._searchInfo.researchQuery : ', this._searchInfo.researchQuery);

    // 결과내 재검색 인 경우
    var resultSearchKeyword = '';
    if (this._searchInfo.query !== this._searchInfo.researchQuery) {
      resultSearchKeyword = this._searchInfo.researchQuery.replace(this._searchInfo.query, '').trim();
    }

    if(!data){
      return [];
    }

    // 15개까지만 노출해달라는 요건으로 인한 처리. (T app 은 16개)
    // 와이즈넛 엔진에서 전달주는 결과값 개수 조정이 가능하다면 아래 로직은 삭제 처리 필요
    // 더 보기 시에는 resultLimitCount값을 인자로 받아 노출할 개수를 처리한다.
    if (resultLimitCount !== null) {
      var limitCount = parseInt(resultLimitCount, 10);

      if (data.length >= limitCount) {
        data.splice(limitCount, data.length);
      } else {
        // 더보기 버튼 비노출 처리
        this._hasMoreContents = false;
      }

    } else {
      if (data.length >= 20) {
        data.splice(20, data.length);
      } else {
        // 더보기 버튼 비노출 처리
        this._hasMoreContents = false;
        $('.btn-more').hide();
      }

      // if (category !== 'tapp') {
      //   if (data.length > 15) {
      //     data.splice(15, data.length);
      //   } else {
      //     // 더보기 버튼 비노출 처리
      //     this._hasMoreContents = false;
      //   }
      // } else {
      //   if (data.length > 16) {
      //     data.splice(16, data.length);
      //   } else {
      //     // 더보기 버튼 비노출 처리
      //     this._hasMoreContents = false;
      //   }
      // }
    }    
    
    Tw.Logger.info('--------------------', '');
    Tw.Logger.info('data : ', data);
    Tw.Logger.info('--------------------', '');

    for(var i=0;i<data.length;i++){
      Tw.Logger.info('data[' + i + '] : ', data[i]);

      for (var key in data[i]) {
        // Tw.Logger.info('key (' + key + ') : ', data[i][key]);

        if(key==='PR_STA_DT'||key==='PR_END_DT'){
          data[i][key] = Tw.DateHelper.getShortDate(data[i][key]);
        }
        if(typeof (data[i][key])==='string'){
          // 검색어와 매칭되는 곳에 하이라이트 처리

          if (data[i][key].indexOf('<!HS>') !== -1 || data[i][key].indexOf('<!HE>') !== -1) {
            Tw.Logger.info('[_arrangeData] data[i][key] (전) ', data[i][key]);
            data[i][key] = data[i][key].replace('<!HS>', '<em class="tod-highlight-text">');
            data[i][key] = data[i][key].replace('<!HE>', '</em>');
            Tw.Logger.info('[_arrangeData] data[i][key] (후) ', data[i][key]);
          }

          // if(data[i][key].indexOf(this._searchInfo.query)) {
          //   // Tw.Logger.info('[_arrangeData] 하이라이트 처리 필요', '');

          //   var tmpStr = '<em class="tod-highlight-text">' + this._searchInfo.query + '</em>';
          //   data[i][key] = data[i][key].replace(this._searchInfo.query, tmpStr);

          //   if (resultSearchKeyword !== '') {
          //     tmpStr = '<em class="tod-highlight-text">' + resultSearchKeyword + '</em>';
          //     data[i][key] = data[i][key].replace(resultSearchKeyword, tmpStr);
          //   }
          //   // Tw.Logger.info('[_arrangeData] data[i][key]', data[i][key]);


          // }

          // data[i][key] = data[i][key].replace(/<!HE>/g, '</span>');
          // data[i][key] = data[i][key].replace(/<!HS>/g, '<span class="highlight-text">');
        }
        if(key==='DEPTH_PATH'){
          if(data[i][key].charAt(0)==='|'){
            data[i][key] = data[i][key].replace('|','');
          }

          // Tw.Logger.info('[_arrangeData] this._searchInfo.query', this._searchInfo.query);

          // // 검색어와 매칭되는 곳에 하이라이트 처리
          // if(data[i][key].indexOf(this._searchInfo.query)) {
          //   // Tw.Logger.info('[_arrangeData] 하이라이트 처리 필요', '');

          //   var tmpStr = '<em class="tod-highlight-text">' + this._searchInfo.query + '</em>';
          //   data[i][key] = data[i][key].replace(this._searchInfo.query, tmpStr);

          //   // Tw.Logger.info('[_arrangeData] data[i][key]', data[i][key]);
          // }
          
        }
        if(category==='direct'&&key==='TYPE'){
          if(data[i][key]==='shopacc'){
            if(data[i].PRODUCT_TYPE!==''){
              data[i].linkUrl = Tw.OUTLINK.DIRECT_IOT+'?categoryId='+data[i].CATEGORY_ID+'&productId='+data[i].ACCESSORY_ID+'&productType='+data[i].PRODUCT_TYPE;
            }else{
              data[i].linkUrl = Tw.OUTLINK.DIRECT_ACCESSORY+'?categoryId='+data[i].CATEGORY_ID+'&accessoryId='+data[i].ACCESSORY_ID;
            }
          }else{
            data[i].linkUrl = Tw.OUTLINK.DIRECT_MOBILE+'?categoryId='+data[i].CATEGORY_ID+'&productGrpId='+data[i].PRODUCT_GRP_ID;
          }
        }
        if(key==='METATAG'){
          Tw.Logger.info('METATAG : ', data[i][key]);
          // Tw.Logger.info(i + '번째 데이터의 METATAG 의 데이터타입 : ', typeof (data[i][key]));
          if (typeof (data[i][key])==='string') {
            if (data[i][key].indexOf('#') !== -1) {
              data[i][key] = data[i][key].split('#');

              if (data[i][key][0] === '') {
                data[i][key].splice(0, 1);
              }
              Tw.Logger.info('ㄴ------------ METATAG : ', data[i][key]);
            }
          }
        }
        if(key==='IMG'){
          var tempArr = data[i][key].split('<IMG_ALT>');
          data[i][key] = tempArr[0].replace(/\/n/g,'');
          if(tempArr[1]){
            data[i].IMG_ALT = tempArr[1];
          }
        }
        if(key==='MENU_URL'&&data[i][key].indexOf('http') !== -1){
          data[i].tagTitle = Tw.COMMON_STRING.OPEN_NEW_TAB;
        }
      }
    }
    return data;
  },
  /**
   * @function
   * @member
   * @desc 실제 초기화
   * @returns {void}
   */
  // _showShortcutList : function (data,template,$parent,cdn) {
  _showShortcutList : function (data,dataKey,cdn) {
    var template = $('#'+dataKey+'_template');
    var $parent = this.$container.find('#'+dataKey+'_list');
    $parent.empty();
    var shortcutTemplate = template.html();
    var templateData = Handlebars.compile(shortcutTemplate);
    
    if(data.length<=0){
      $parent.addClass('none');
    }
    _.each(data,$.proxy(function (listData) {
      if(this._nowUser==='logOutUser'&&listData.DOCID==='M000083'){
        if(this._searchInfo.totalcount<=20){
          $('.num').text(this._searchInfo.totalcount-1);
        }
        return;
      }
      $parent.append(templateData({listData : listData , CDN : cdn}));
    },this));

    if(this._searchInfo.totalcount<=20){
      this.$container.find('#fe-btn-more').hide();
    }
  },
  /**
   * @function
   * @member
   * @desc 검색창 input 이벤트
   * @returns {void}
   */
  _keyInputEvt : function (inputEvtObj) {
    var _this = this;
    inputEvtObj.preventDefault();
    if(Tw.InputHelper.isEnter(inputEvtObj)){
      // _this._searchByInputValue();

      this._doResultSearch();
    }
  },
  /**
   * @function
   * @member
   * @desc 결과내 재검색 실행
   * @param {Object} event - 이벤트 객체
   * @returns {void}
   */
  _doResultSearch : function (event) {
    Tw.Logger.info('_doResultSearch] this._sort : ', this._sort);
    var keyword = this.$inputElement.val();
    var resultSearchKeyword = this.$inputElementResultSearch.val();

    if(Tw.FormatHelper.isEmpty(keyword)||keyword.trim().length<=0){
      this.$inputElement.blur();
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,null,'search_keyword_err',$(event.currentTarget));
      return;
    }
    if(Tw.FormatHelper.isEmpty(resultSearchKeyword)||resultSearchKeyword.trim().length<=0){
      this.$inputElementResultSearch.blur();
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,null,'search_keyword_err',$(event.currentTarget));
      return;
    }
    var requestUrl = '/common/search/more?category=' + this._category + '&sort=' + this._accessQuery.sort + '&keyword='+(encodeURIComponent(this._searchInfo.query))+'&in_keyword=';
    requestUrl+=encodeURIComponent(resultSearchKeyword.trim());
    requestUrl+='&step='+(Number(this._step)+1);
    this._addRecentlyKeyword(resultSearchKeyword);
    this._moveUrl(requestUrl);
  },
  _onClickChangeSort : function (e) {
    var $target = $(e.currentTarget);    
    var selectedCollection = $target.attr('class').replace(/fe-sort| |tod-fright/gi, '');
    Tw.Logger.info('[_onClickChangeSort] 선택된 영역의 collection', selectedCollection);

    var tempBtnStr = '.fe-btn-sort-' + selectedCollection;
    
    this._popupService.open({
      hbs: this._ACTION_SHEET_HBS,
      layer: true,
      btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
      // data: this._sortCd
      data: this._getSortCd(selectedCollection)
    // }, $.proxy(this._onOpenGradeActionSheet, this, selectedCollection), null, 'select-grade', this.$sort.find('button'));
    }, $.proxy(this._onOpenGradeActionSheet, this, selectedCollection), null, 'select-grade', this.$container.find(tempBtnStr));
  },
  _getSortCd: function (categoryId) {
    var _this = this;
    Tw.Logger.info('[_getSortCd] 선택된 categoryId', categoryId);
    Tw.Logger.info('[_getSortCd] this.accessQuery', this._accessQuery);
    // Tw.Logger.info('[_getSortCd] 선택된 categoryId 의 정렬기준', this._sort);

    Tw.Logger.info('[_getSortCd] this._reqOptions.sortCd (AS-IS)', this._reqOptions.sortCd);

    this._reqOptions.sortCd.replace(
      categoryId + '-' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(categoryId + '-') + categoryId.length + 1, this._reqOptions.sortCd.indexOf(categoryId + '-') + categoryId.length + 2),
      categoryId + '-' + this._accessQuery.sort
    );

    Tw.Logger.info('[_getSortCd] this._reqOptions.sortCd (TO-BE)', this._reqOptions.sortCd);
    
    this._sortCd = [
      {
        list: [
          {
            txt: Tw.SEARCH_FILTER_STR.ADMIN,  // 추천순
            // 'radio-attr': 'class="focus-elem" sub-tab-cd="A" checked',
            // 'radio-attr': 'class="focus-elem" sort="A" checked',
            'radio-attr': (this._sort === 'A') ? 'class="focus-elem" sort="A" checked' : 'class="focus-elem" sort="A"',
            'label-attr': ' ',
            // subTabCd: 'A'
            sort: 'A'
          },
          {
            txt: Tw.SEARCH_FILTER_STR.NEW,  // 최신순
            // 'radio-attr': 'class="focus-elem" sub-tab-cd="D"',
            // 'radio-attr': 'class="focus-elem" sort="D"',
            'radio-attr': (this._sort === 'D') ? 'class="focus-elem" sort="D" checked' : 'class="focus-elem" sort="D"',
            'label-attr': ' ',
            // subTabCd: 'D'
            sort: 'D'
          },
          {
            txt: Tw.SEARCH_FILTER_STR.LOW,  // 낮은 가격순
            // 'radio-attr': 'class="focus-elem" sub-tab-cd="L"',
            // 'radio-attr': 'class="focus-elem" sort="L"',
            'radio-attr': (this._sort === 'L') ? 'class="focus-elem" sort="L" checked' : 'class="focus-elem" sort="L"',
            'label-attr': ' ',
            // subTabCd: 'L'
            sort: 'L'
          },
          {
            txt: Tw.SEARCH_FILTER_STR.HIGH,  // 높은 가격순
            // 'radio-attr': 'class="focus-elem" sub-tab-cd="H"',
            // 'radio-attr': 'class="focus-elem" sort="H"',
            'radio-attr': (this._sort === 'H') ? 'class="focus-elem" sort="H" checked' : 'class="focus-elem" sort="H"',
            'label-attr': ' ',
            // subTabCd: 'H'
            sort: 'H'
          }
        ]
      }
    ];

    Tw.Logger.info('[_getSortCd] this._sortCd', this._sortCd);

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
      // var subTabCd = $(event.currentTarget).attr('sub-tab-cd');
      var sort = $(event.currentTarget).attr('sort');

      Tw.Logger.info('현재 선택된 컬렉션 : ', selectedCollection);
      Tw.Logger.info('현재 선택된 정렬기준 : ', sort);

      // 컬렉션 별로 소팅 기준을 저장해두기 위한 처리 [S]
      var collectionSortArray = new Array();
      collectionSortArray.push(this._reqOptions.sortCd.split('.'));
      var collectionSortStr = '';

      Tw.Logger.info('컬렉션별 정렬기준 : ', collectionSortArray);

      for (var idx in collectionSortArray[0]) {
        var collectionSortData = collectionSortArray[0][idx];
        Tw.Logger.info('[' + idx + '] : ', collectionSortData);
        var tmpCollection = collectionSortData.split('-')[0];
        var tmpSort = collectionSortData.split('-')[1];
        
        if (selectedCollection === tmpCollection) {
          // 선택되는 정렬기준으로 변경해준다.
          tmpSort = sort;
        }

        collectionSortStr += tmpCollection + '-' + tmpSort;

        if (idx < collectionSortArray[0].length-1) {
          collectionSortStr += '.';
        }
      }

      this._reqOptions.sortCd = collectionSortStr;

      Tw.Logger.info('변경 적용된 컬렉션별 정렬기준 : ', this._reqOptions.sortCd);

      Tw.Logger.info('substring start index : ', this._reqOptions.sortCd.indexOf(selectedCollection + '-'));

      var startIdx = this._reqOptions.sortCd.indexOf(selectedCollection + '-') + selectedCollection.length + 1;
      
      Tw.Logger.info(selectedCollection + ' 컬렉션의 변경된 정렬기준 : ', this._reqOptions.sortCd.substring(startIdx, startIdx+1));
      // 컬렉션 별로 소팅 기준을 저장해두기 위한 처리 [E]

      var options = {
        collection: selectedCollection,
        pageNum: 1,
        // subTabCd: subTabCd
        sort: sort
      };
      
      this._sortRate(options);

      _.each(this._sortCd[0].list, function (item) {
        // item['radio-attr'] = 'class="focus-elem" sort="'+item.sort+'"' + (item.sort === sort ? 'checked' : '');
        item['radio-attr'] = 'class="focus-elem" sort="'+item.sort+'"' + (item.sort === _this._reqOptions.sortCd.substring(startIdx, startIdx+1) ? 'checked' : '');
        Tw.Logger.info('item[radio-attr] : ', item['radio-attr']);
      });

      this._popupService.close();
    }, this));

    // 웹접근성 대응
    Tw.CommonHelper.focusOnActionSheet($container);
  },
  _sortRate : function (options) {
    var _this = this;
    Tw.Logger.info('[_sortRate] 호출', '');
    // e.preventDefault();   // a tag 의 # 링크가 동작하지 않도록 하기 위해 처리

    Tw.Logger.info('[_sortRate] options', options);

    Tw.Logger.info('[_sortRate] Tw.BrowserHelper.isApp()', Tw.BrowserHelper.isApp());

    var searchApi = Tw.BrowserHelper.isApp() ? Tw.API_CMD.SEARCH_APP : Tw.API_CMD.SEARCH_WEB;

    // var searchApi;
    if(Tw.BrowserHelper.isApp()) {
      searchApi = Tw.API_CMD.SEARCH_APP;
    } else {
      searchApi = Tw.API_CMD.SEARCH_WEB;
    }

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

    if (query !== researchQuery) {
      researchQuery = researchQuery.replace(query, '').trim();
      reqOptions = {query: encodeURIComponent(query), collection: collection, pageNum: pageNum, researchCd: 1, sort: sort, researchQuery: encodeURIComponent(researchQuery)};
    } else {
      reqOptions = {query: encodeURIComponent(query), collection: collection, pageNum: pageNum, sort: sort};
    }

    
    Tw.Logger.info('[_sortRate] query', query);
    Tw.Logger.info('[_sortRate] encoded query', encodeURIComponent(query));
    
    // this._apiService.requestAjax(searchApi, {
    this._apiService.request(searchApi, reqOptions)
    .done($.proxy(function (res) {
      if (res.code === 0) {
        Tw.Logger.info('[_sortRate] search result', res.result);

        Tw.Logger.info('[_sortRate] res.result.search[0]', res.result.search[0]);

        // var sortedRateResultArr = res.result.search[0];
        
        Tw.Logger.info('[_sortRate] (res.result.search[0])[0]', res.result.search[0][collection]);
        
        _this._storedResult = res.result.search[0][collection].data;
        _this._hasMoreContents = true;
        $('.btn-more').show();

        var sortedRateResultArr = res.result.search[0][collection].data;
        // var sortedRateResultArr = (res.result.search[0])[0].data;
        // var sortedRateResultArr = res.result.search[0].rate.data;
        Tw.Logger.info('[_sortRate] sortedRateResultArr.length', sortedRateResultArr.length);
        
        // sortedRateResultArr.sort(function(a, b) {
        //   return parseFloat(b.BAS_FEE_INFO) - parseFloat(a.BAS_FEE_INFO); // 내림차순
        //   // return parseFloat(a.BAS_FEE_INFO) - parseFloat(b.BAS_FEE_INFO);  // 오름차순
        // });
        
        Tw.Logger.info('[_sortRate] sorted rate result array', sortedRateResultArr);

        var $list = this.$container.find('#' + collection + '_list');
        $list.empty();


        // this._showShortcutList(this._arrangeData(this._searchInfo.search[i][keyName].data,keyName),keyName,this._cdn);
        _this._showShortcutList(_this._arrangeData(sortedRateResultArr, collection), collection, this._cdn, 'sort');

        this._sort = sort;
        Tw.Logger.info('this._sort : ', this._sort);

        // 더보기 횟수 초기화
        this._showMoreCnt = 0;

        // // reqOptions.sortCd 에 변경사항 적용
        // this._reqOptions.sortCd = this._reqOptions.sortCd.replace(
        //   collection + '-' + this._reqOptions.sortCd.substring( this._reqOptions.sortCd.indexOf(collection + '-') + collection.length + 1, this._reqOptions.sortCd.indexOf(collection + '-') + collection.length + 2 ), 
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
        Tw.Logger.info('[_sortRate] 선택된 정렬기준', sortValue);

        // _sortCd: [
        //   {
        //     list: [
        //       {
        //         txt: Tw.SEARCH_FILTER_STR.ADMIN,  // 추천순
    //     var collection = options.collection;
    // var pageNum = options.pageNum;
    // var sort = options.subTabCd;

        var tempBtnStr = '.fe-btn-sort-' + collection;
        var tmpClassNm = '.fe-sort ' + collection;

        // Tw.Logger.info('[_sortRate] 선택된 영역', this.$container.find(tmpClassNm));
        // Tw.Logger.info('[_sortRate] 선택된 영역', this.$container.find(tmpClassNm).find('button'));
        Tw.Logger.info('[_sortRate] 선택된 영역', this.$container.find(tempBtnStr).attr('class'));
        // this.$container.find(tempBtnStr).text(subTabValue);
        this.$container.find(tempBtnStr).text(sortValue);

        if (query !== researchQuery) {
          this.$container.find('.fe-category.'+collection).attr('href','/common/search/more?category=' + collection + '&keyword='+query+'&step='+(this._step + 1)+'&sort='+sort + '&in_keyword='+researchQuery);
        } else {
          this.$container.find('.fe-category.'+collection).attr('href','/common/search/more?category=' + collection + '&keyword='+query+'&step='+(this._step + 1)+'&sort='+sort);
        }
        

        // var $template = $('#'+ collection +'_template');        
        // var rateTemplate = $template.html();
        // var templateData = Handlebars.compile(rateTemplate);
        
        // _.each(sortedRateResultArr,$.proxy(function (listData,index) {
        //   $list.append(templateData({listData : listData}));
        // },this));

      } else {
        Tw.Logger.info('[_sortRate] search api 리턴 오류!!!', res.code);
        return;
      }
    }, this))
    .fail(function (err) {
      Tw.Logger.info('[_sortRate] search api 연동 오류!!!', err);
      // GET_SVC_INFO API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
      // Tw.Error(err.code, err.msg).pop();
      return;
    });
  },
  _categoryInit : function () {
    // 카테고리 템플릿 그리기
    var $categoryHtml = $('#common_template').html();
    var $categoryHtmlTemplate = Handlebars.compile($categoryHtml);
    this.$categoryArea.append($categoryHtmlTemplate);

// url=http://211.188.181.123:8080/search/tworld/mobile-web?
// query=%EC%9A%94%EA%B8%88&
// collection=all&
// researchQuery=pps&
// researchCd=1&
// sort=shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A&userId=junhd0,

    // 현재 url 에 포함된 정렬기준을 reqOption.sortCd 에 적용해준다.
    Tw.Logger.info('[_categoryInit] url 에 포함되어 있는 카테고리 : ', this._category);
    Tw.Logger.info('[_categoryInit] url 에 포함되어 있는 정렬기준 : ', this._sort);
    Tw.Logger.info('[_categoryInit] 현재 페이지 내 reqOption.sortCd 의 초기값 : ', this._reqOptions.sortCd);
    this._reqOptions.sortCd = this._reqOptions.sortCd.replace(this._category + '-' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._category + '-') + this._category.length + 1, this._reqOptions.sortCd.indexOf(this._category + '-') + this._category.length + 2), this._category + '-' + this._sort);
    Tw.Logger.info('[_categoryInit] url 에 포함된 정렬기준으로 치환한 후 reqOption.sortCd 의 값 : ', this._reqOptions.sortCd);

    // 카테고리 영역에 건수를 노출해주기 위한 처리
    var searchApi = Tw.BrowserHelper.isApp() ? Tw.API_CMD.SEARCH_APP : Tw.API_CMD.SEARCH_WEB;
    var query = this._searchInfo.query;
    var researchQuery = this._searchInfo.researchQuery;
    var reqOptions;

    if (query !== researchQuery) {
      researchQuery = researchQuery.replace(query, '').trim();
      
      if(Tw.BrowserHelper.isApp()) {
        if(Tw.BrowserHelper.isAndroid()) {
          reqOptions = {query: encodeURIComponent(query), collection: 'all', researchCd: 1, sort: 'shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A.bundle-A', researchQuery: encodeURIComponent(researchQuery), device: 'A'};
        } else {
          reqOptions = {query: encodeURIComponent(query), collection: 'all', researchCd: 1, sort: 'shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A.bundle-A', researchQuery: encodeURIComponent(researchQuery), device: 'I'};
        }
      } else {
        reqOptions = {query: encodeURIComponent(query), collection: 'all', researchCd: 1, sort: 'shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A.bundle-A', researchQuery: encodeURIComponent(researchQuery)};
      }
    } else {
      if(Tw.BrowserHelper.isApp()) {
        if(Tw.BrowserHelper.isAndroid()) {
          reqOptions = {query: encodeURIComponent(query), collection: 'all', sort: 'shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A.bundle-A', device: 'A'};
        } else {
          reqOptions = {query: encodeURIComponent(query), collection: 'all', sort: 'shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A.bundle-A', device: 'I'};
        }
      } else {
        reqOptions = {query: encodeURIComponent(query), collection: 'all', sort: 'shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A.bundle-A'};
      }
    }

    this._apiService.request(searchApi, reqOptions)
    .done($.proxy(function (res) {
      if (res.code === 0) {
        // Tw.Logger.info('[_categoryInit] res result', res.result);
        // Tw.Logger.info('[_categoryInit] res result search', res.result.search);

        var keyName, contentsCnt;
        var totalCnt=0;

        for(var i=0;i<res.result.search.length;i++){
          keyName =  Object.keys(res.result.search[i])[0];
          contentsCnt = Number(res.result.search[i][keyName].count);


          if(keyName==='smart'||keyName==='immediate'||keyName==='banner'||keyName==='lastevent'){
            continue;
          } else {
            var categoryStr = '.fe-' + keyName + '-count';
            // Tw.Logger.info('[' + keyName + ']', contentsCnt + '건');
            // Tw.Logger.info('[' + keyName + ']', this.$container.find(categoryStr));

            if ( contentsCnt < 1 ) {
              this.$container.find(categoryStr).parents('li').hide();
            } else {
              this.$container.find(categoryStr).text(contentsCnt);

              categoryStr = '.fe-category.' + keyName;

              if (query !== researchQuery) {
                this.$container.find('.fe-category.all').attr('href', '/common/search?category=all&keyword=' + query + '&step=' + (this._step + 1)  + '&in_keyword=' + researchQuery  + '&sort=' + this._sort);
                this.$container.find(categoryStr).attr('href', '/common/search/more?category=' + keyName + '&keyword=' + query + '&step=' + (this._step + 1)  + '&in_keyword=' + researchQuery  + '&sort=' + this._sort);
              } else {
                this.$container.find('.fe-category.all').attr('href', '/common/search?category=all&keyword=' + query + '&step=' + (this._step + 1) + '&sort=' + this._sort);
                this.$container.find(categoryStr).attr('href', '/common/search/more?category=' + keyName + '&keyword=' + query + '&step=' + (this._step + 1) + '&sort=' + this._sort);
              }
            }

            // 전체 갯수는 스마트검색, 배너, 즉답검색결과는 제외하고 카운트한다.
            totalCnt += contentsCnt;
          }
          
          // this._showShortcutList(this._arrangeData(res.result.search[i][keyName].data,keyName),keyName,this._cdn);
        } // end for

        this.$container.find('.fe-total-count').each(function(a,b){
          var $target = $(b);
          $target.text(totalCnt);
        });

        var tempStr = '.fe-category.' + this._category;
        this.$container.find('.fe-category').removeClass('on');

        this.$container.find(tempStr).addClass('on');

        var $horizontalSlide = $('.horizontal-slide');
        var $categoryOn = $horizontalSlide.find('li.on');
        var leftPosition = $categoryOn.offset().left - (($horizontalSlide.width() / 2) - ($categoryOn.width() / 2));
        
        setTimeout(function () {
          $horizontalSlide.scrollLeft(leftPosition);
        }, 0);
        

      } else {
        Tw.Logger.info('[_categoryInit] search api 리턴 오류!!!', res.code);
        return;
      }
    }, this))
    .fail(function (err) {
      Tw.Logger.info('[_categoryInit] search api 연동 오류!!!', err);
      return;
    });

  },
  /**
   * @function
   * @desc 카테고리 아이디에 해당하는 탭 위치로 스크롤
   * @param {String} target
   */
  _setScrollLeft: function (target) {
    

    var $category = $('.tod-srhcategory-scrwrap'),    
    $horizontalSlide = $category.find('#fe-category-area'),
    $categoryOn = $horizontalSlide.find('li.on'),
    leftPosition = $categoryOn.offset().left - (($horizontalSlide.width() / 2) - ($categoryOn.width() / 2));

    setTimeout(function () {
        $horizontalSlide.scrollLeft(leftPosition);
    }, 0);

    // var $target = $(target);
    // Tw.Logger.info('[_setScrollLeft] $target : ', $target);

    // var categoryArea = this.$container.find('#fe-category-area');
    // Tw.Logger.info('[_setScrollLeft] categoryArea : ', categoryArea);

    // var x = parseInt($target.position().left, 10);
    // Tw.Logger.info('[_setScrollLeft] $target.position().left : ', x);

    // var parentLeft = parseInt(categoryArea.position().left, 10);
    // Tw.Logger.info('[_setScrollLeft] categoryArea.position().left : ', parentLeft);
    
    // // var parentLeft = parseInt(this.$container.find('#fe-category-area').position().left, 10);    
    // // this.$container.find('#fe-category-area').find('ul').scrollLeft(x - parentLeft);

    // var categoryAreaUl = categoryArea.find('ul');
    // Tw.Logger.info('[_setScrollLeft] categoryAreaUl : ', categoryAreaUl);
    
    // categoryAreaUl.scrollLeft(x - parentLeft);

    // // 카테고리 스와이프 영역 width 를 잡아주도록 처리한다.
    // this.$categorySlide = this.$container.find('#fe-category-slide');
    // this.$categorySlide.addClass('horizontal');
    // skt_landing.widgets.widget_horizontal(this.$categorySlide.parents('div')[0]);
  },
  /**
   * @function
   * @member
   * @desc 검색 결과 페이지 변경
   * @param {Object} eventObj - 이벤트 객체
   * @returns {void}
   */
  _pageChange : function (eventObj) {
    //this._historyService.goLoad(eventObj.currentTarget.value);
    this._moveUrl(eventObj.currentTarget.value);
  },
  /**
   * @function
   * @member
   * @desc 검색 실행
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _doSearch : function (evt) {
    var keyword = this.$inputElement.val();
    if(Tw.FormatHelper.isEmpty(keyword)||keyword.trim().length<=0){
      this.$inputElement.blur();
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,null,'search_keyword_err',$(evt.currentTarget));
      return;
    }
    var inResult = this.$container.find('#resultsearch').is(':checked');
    var requestUrl = inResult?'/common/search/in-result?category='+(encodeURIComponent(this._category))+'&keyword='+
        (encodeURIComponent(this._accessKeyword))+'&in_keyword=':'/common/search?keyword=';
    requestUrl+=encodeURIComponent(keyword);
    requestUrl+='&step='+(Number(this._step)+1);
    this._addRecentlyKeyword(keyword);
    this._moveUrl(requestUrl);
  },
  /**
   * @function
   * @member
   * @desc 더 보기
   */
  _showMore : function (targetEvt) {
    var _this = this;
    var $targetElement = $(targetEvt.currentTarget);

    // 컬렉션 정보 가져오기
    // var selectedCollection = $targetElement.attr('class').replace(/fe-btn-more| /gi, '');
    // Tw.Logger.info('더보기 할 컬렉션 : ', '[' + selectedCollection + ']');

    Tw.Logger.info('더보기 할 컬렉션 : ', '[' + this._category + ']');
    

    // var searchApi = Tw.BrowserHelper.isApp() ? Tw.API_CMD.SEARCH_APP : Tw.API_CMD.SEARCH_WEB;
    var searchApi;
    if(Tw.BrowserHelper.isApp()) {
      searchApi = Tw.API_CMD.SEARCH_APP;
    } else {
      searchApi = Tw.API_CMD.SEARCH_WEB;
    }
    
    this._showMoreCnt += 1;
    this._pageNum = this._showMoreCnt + 1;
    Tw.Logger.info('this._showMoreCnt : ', '[' + this._showMoreCnt + ']');
    Tw.Logger.info('this._pageNum : ', '[' + this._pageNum + ']');

    var sort = this._category + '-' + 
               this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._category + '-') + this._category.length + 1, this._reqOptions.sortCd.indexOf(this._category + '-') + this._category.length + 2)

    this._apiService.request(searchApi, {
      query: encodeURIComponent(this._searchInfo.query),
      collection: this._category,
      pageNum: this._pageNum,
      // pageNum: 1,
      sort: sort
    })
    .done($.proxy(function (res) {
      if (res.code === 0) {
        var searchResultData = res.result.search[0][this._category].data;
        Tw.Logger.info('[_showMore] searchResultData', searchResultData);

        var totalCount = res.result.search[0][this._category].count;

        // 결과 합치기
        for (var idx in searchResultData) {
          this._storedResult.push(searchResultData[idx]);
        }
        Tw.Logger.info('[_showMore] merged result', this._storedResult);

        // 노출할 컨텐츠 개수 제한 
        // var resultLimitCount = this._category !== 'tapp' ? 15 + (this._showMoreCnt * 10) : 16 + (this._showMoreCnt * 16);
        var resultLimitCount = 20 + (this._showMoreCnt * 20);
        Tw.Logger.info('[_showMore] 검색결과 전체 건수 : ', totalCount);
        Tw.Logger.info('[_showMore] 노출할 컨텐츠 제한 개수 : ', resultLimitCount);

        // 전체 검색결과 건수가 노출건수보다 많으면
        if (Number(totalCount) > Number(resultLimitCount)) {
          this._hasMoreContents = true;
        }

        var $list = this.$container.find('#' + this._category + '_list');
        $list.empty();


        // this._showShortcutList(this._arrangeData(this._searchInfo.search[i][keyName].data,keyName),keyName,this._cdn);
        // _this._showShortcutList(_this._arrangeData(searchResultData, this._category, resultLimitCount), $('#'+this._category+'_template'), $list, this._cdn);
        // _this._showShortcutList(_this._arrangeData(this._storedResult, this._category, resultLimitCount), $('#'+this._category+'_template'), $list, this._cdn);

        _this._showShortcutList(_this._arrangeData(this._storedResult, this._category, resultLimitCount), this._category, this._cdn);

        if(!this._hasMoreContents) {
          // 더보기할 컨텐츠가 없으면 (모두 노출된 상태)
          $('.btn-more').hide();
        }

        // 카테고리 스와이프 영역 width 를 잡아주도록 처리한다.
        this.$categorySlide = this.$container.find('#fe-category-slide');
        Tw.Logger.info('[_nextInit] this.$categorySlide.attr("class") : ', this.$categorySlide.attr('class'));
        this.$categorySlide.removeClass('horizontal');
        this.$categorySlide.addClass('horizontal');
        Tw.Logger.info('[_nextInit] this.$categorySlide.attr("class") : ', this.$categorySlide.attr('class'));
        Tw.Logger.info('[_nextInit] this.$categorySlide.parents("div") : ', this.$categorySlide.parents('div'));
        this.$categorySlide.removeData('event');
        skt_landing.widgets.widget_horizontal(this.$categorySlide.parents('div')[0]);

      } else {
        Tw.Logger.info('[_sortRate] search api 리턴 오류!!!', res.code);
        return;
      }
    }, this))
    .fail(function (err) {
      Tw.Logger.info('[_sortRate] search api 연동 오류!!!', err);
      // GET_SVC_INFO API 호출 오류가 발생했을 시 뒷단 로직에 영향을 주지 않도록 별도 에러처리 없이 return.
      // Tw.Error(err.code, err.msg).pop();
      return;
    });

  },
  /**
   * @function
   * @member
   * @desc 다른 카테고리 검색결과 조회 (카테고리 변경)
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _changeCategory : function (e) {
    var $elem = $(e.currentTarget);
    var linkUrl = $elem.attr('href');

    if(Tw.FormatHelper.isEmpty(linkUrl)){
      return;
    }

    this._moveUrl(linkUrl);
  },
  /**
   * @function
   * @member
   * @desc 다이렉트샵 검색 정렬 기준 필터 액션시트 출력
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _showSelectFilter : function (evt) {
    var listData = [
      // { 'label-attr': 'for=ra0', 'txt': Tw.SEARCH_FILTER_STR.ACCURACY,
      //   'radio-attr':'id="ra0" data-type="R" name="selectFilter" value="'+Tw.SEARCH_FILTER_STR.ACCURACY+'" '+(this._searchInfo.search[0].direct.sort==='R'?'checked':'' )},
      { 'label-attr': 'for=ra1', 'txt': Tw.SEARCH_FILTER_STR.NEW,
        'radio-attr':'id="ra1" data-type="D" name="selectFilter" value="'+Tw.SEARCH_FILTER_STR.NEW+'" '+(this._searchInfo.search[0].direct.sort==='D'?'checked':'' )},
      { 'label-attr': 'for=ra2', 'txt': Tw.SEARCH_FILTER_STR.LOW,
        'radio-attr':'id="ra2" data-type="L" name="selectFilter" value="'+Tw.SEARCH_FILTER_STR.LOW+'" '+(this._searchInfo.search[0].direct.sort==='L'?'checked':'' )},
      { 'label-attr': 'for=ra3', 'txt': Tw.SEARCH_FILTER_STR.HIGH,
        'radio-attr':'id="ra3" data-type="H" name="selectFilter" value="'+Tw.SEARCH_FILTER_STR.HIGH+'" '+(this._searchInfo.search[0].direct.sort==='H'?'checked':'' )}
    ];
    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data : [{list : listData}],
        btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
      },$.proxy(this._bindPopupElementEvt,this),
      null,
      'select_filter',$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 다이렉트샵 검색 정렬 기준 필터 액션시트 이벤트 바인딩
   * @param {Object} popupElement - 팝업 레이어 객체
   * @returns {void}
   */
  _bindPopupElementEvt : function($popupElement){
    Tw.CommonHelper.focusOnActionSheet($popupElement);
    $popupElement.on('click','.cont-actionsheet input',$.proxy(this._filterSelectEvent,this));
  },
  /**
   * @function
   * @member
   * @desc 다이렉트샵 검색 정렬 기준 필터 액션시트 옵션 선택 이벤트
   * @param {Object} btnEvt - 이벤트 객체
   * @returns {void}
   */
  _filterSelectEvent : function (btnEvt) {
    var changeFilterUrl = this._accessQuery.in_keyword?'/common/search/in-result?category='+this._category+
      '&keyword='+this._accessQuery.keyword:'/common/search/more?category='+this._category+'&keyword='+this._accessQuery.keyword;
    // changeFilterUrl+='&arrange='+$(btnEvt.currentTarget).data('type');
    changeFilterUrl+='&sort='+$(btnEvt.currentTarget).data('type');
    if(this._accessQuery.in_keyword){
      changeFilterUrl+='&in_keyword='+this._accessQuery.in_keyword;
    }
    changeFilterUrl+='&step='+(Number(this._step)+1);
    this._popupService.close();
    this._moveUrl(changeFilterUrl);
  },
  /**
   * @function
   * @member
   * @desc 페이지 이동을 위한 액션시트 출력
   * @param {Object} targetEvt - 이벤트 객체
   * @returns {void}
   */
  _openPageSelector : function (targetEvt) {
    var totalPageNum = parseInt(((this._searchInfo.totalcount/20)+(this._searchInfo.totalcount%20>0?1:0)),10);
    var data = this._makePageSelectorData(totalPageNum , this._pageNum);

    this._popupService.open({
          hbs: 'actionsheet01',// hbs의 파일명
          layer: true,
          data: [{list : data}],
          btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
        },
        $.proxy(this._bindPageSelectorEvt,this),
        null,
        null,$(targetEvt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 페이지 이동을 위한 액션시트 데이터 생성
   * @param {Number} pageLimit - 마지막 페이지 번호
   * @param {Number} nowPage - 현재 페이지 번호
   * @returns {Array}
   */
  _makePageSelectorData : function (pageLimit , nowPage) {
    var _returnData = [];
    for(var i=1;i<=pageLimit;i++){
      if(nowPage===i){
        //_returnData.push({option : 'checked' , value : i , attr : 'data-idx='+i});
        _returnData.push({ 'label-attr': 'for=ra'+i, 'txt': i,
          'radio-attr':'id="ra'+i+'" data-idx="'+i+'" name="selectPage" value="'+i+'" checked'});
      }else{
        //_returnData.push({option : '' , value : i , attr : 'data-idx='+i});
        _returnData.push({ 'label-attr': 'for=ra'+i, 'txt': i,
          'radio-attr':'id="ra'+i+'" data-idx="'+i+'" name="selectPage" value="'+i+'" '});
      }
    }
    return _returnData;
  },
  /**
   * @function
   * @member
   * @desc 페이지 이동을 위한 액션시트 이벤트 바인딩
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _bindPageSelectorEvt : function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer);
    $layer.on('click', '.cont-actionsheet input', $.proxy(this._changePageNum, this));
  },
  /**
   * @function
   * @member
   * @desc 페이지 이동을 위한 액션시트 페이지 선택 이벤트
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _changePageNum : function (evt) {
    var selectedPageNum = $(evt.currentTarget).data('idx');
    this._popupService.close();
    if(selectedPageNum!==this._pageNum){
      this._paramObj.page = selectedPageNum;
      this._paramObj.step = this._step+1;
      this._paramObj.keyword = encodeURIComponent(this._paramObj.keyword);
      this._moveUrl(this._makeUrl(this._paramObj));
    }
  },
  /**
   * @function
   * @member
   * @desc 페이지 이동을 위한 url 생성 함수
   * @param {Object} paramObj - 현재 페이지 파라미터 객체
   * @returns {String}
   */
  _makeUrl : function (paramObj) {
    var targetUrl = this._nowUrl.split('?')[0]+'?';
    for( var key in paramObj ){
      targetUrl+=key+'='+paramObj[key]+'&';
    }
    return targetUrl.substring(0,targetUrl.length-1);
  }
});
