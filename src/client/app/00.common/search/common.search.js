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
Tw.CommonSearch = function (rootEl,searchInfo,cdn,step,from,sort,nowUrl) {
  this._cdn = cdn;
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._bpcpService = Tw.Bpcp;
  this._svcInfo = null;
  this._searchInfo = searchInfo;
  this._savedSearchResult = null;
  this._step = Tw.FormatHelper.isEmpty(step)?1:step;
  this._sort = sort;
  this._from = from;
  this._sortCd = null;
  this._nowUrl = nowUrl;
  this._requestRealTimeFeeFlag = false;
  this._selectedCollectionToChangeSort = '';
  this._smartDispYn = 'Y';
  this._reqOptions= {
    pageSize: 20,
    pageNo: 1,
    cateCd: '',
    ordCol: '',
    coPtnrNm: '',
    sortCd: 'shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A.bundle-A'
  };
  this._autoCompleteRegExObj = {
    fontColorOpen : new RegExp('<font style=\'color:#CC6633\'>','g'),
    fontSizeOpen : new RegExp('<font style=\'font-size:12px\'>','g'),
    fontClose : new RegExp('</font>','g')
  };
  this._exceptionDocId = {
    'D00003': {
      link: '/customer/svc-info/site#mobile'
    },
    'D00004': {
      link : '/customer/svc-info/site/mcenter'
    },
    'C00001': {
      link : Tw.OUTLINK.DIRECTSHOP_GUIDE_LINK.common+Tw.OUTLINK.DIRECTSHOP_GUIDE_LINK.discount
    }
  };
  this._tidLanding = new Tw.TidLandingComponent();
};

Tw.CommonSearch.prototype = {
  _ACTION_SHEET_HBS: 'actionsheet01',
  // _reqOptions: {
  //   pageSize: 20,
  //   pageNo: 1,
  //   cateCd: '',
  //   ordCol: '',
  //   coPtnrNm: '',
  //   sortCd: 'shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.tapp-A.direct-D.tmembership-A.event-A.sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A.bundle-A'
  // },



  // _sortCd: [
  //   {
  //     list: [
  //       {
  //         txt: Tw.SEARCH_FILTER_STR.ADMIN,  // 추천순
  //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="A" checked',
  //         // 'radio-attr': 'class="focus-elem" sort="A" checked',
  //         // 'radio-attr': 'class="focus-elem" sort="A" ' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'A' ? 'checked' : '',
  //         'label-attr': ' ',
  //         // subTabCd: 'A'
  //         sort: 'A'
  //       },
  //       {
  //         txt: Tw.SEARCH_FILTER_STR.NEW,  // 최신순
  //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="D"',
  //         // 'radio-attr': 'class="focus-elem" sort="D"',
  //         // 'radio-attr': 'class="focus-elem" sort="D" ' + this_reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'D' ? 'checked' : '',
  //         'label-attr': ' ',
  //         // subTabCd: 'D'
  //         sort: 'D'
  //       },
  //       {
  //         txt: Tw.SEARCH_FILTER_STR.LOW,  // 낮은 가격순
  //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="L"',
  //         // 'radio-attr': 'class="focus-elem" sort="L"',
  //         // 'radio-attr': 'class="focus-elem" sort="L" ' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'L' ? 'checked' : '',
  //         'label-attr': ' ',
  //         // subTabCd: 'L'
  //         sort: 'L'
  //       },
  //       {
  //         txt: Tw.SEARCH_FILTER_STR.HIGH,  // 높은 가격순
  //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="H"',
  //         // 'radio-attr': 'class="focus-elem" sort="H"',
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
    var _this = this;
    // this._selectedCollectionToChangeSort = 'rate';
    // Tw.Logger.info('[_nextInit] 테스트 : ', this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2));
    
    // this._sortCd = [
    //   {
    //     list: [
    //       {
    //         txt: Tw.SEARCH_FILTER_STR.ADMIN,  // 추천순
    //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="A" checked',
    //         // 'radio-attr': 'class="focus-elem" sort="A" checked',
    //         'radio-attr': 'class="focus-elem" sort="A" ' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'A' ? 'checked' : '',
    //         'label-attr': ' ',
    //         // subTabCd: 'A'
    //         sort: 'A'
    //       },
    //       {
    //         txt: Tw.SEARCH_FILTER_STR.NEW,  // 최신순
    //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="D"',
    //         // 'radio-attr': 'class="focus-elem" sort="D"',
    //         'radio-attr': 'class="focus-elem" sort="D" ' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'D' ? 'checked' : '',
    //         'label-attr': ' ',
    //         // subTabCd: 'D'
    //         sort: 'D'
    //       },
    //       {
    //         txt: Tw.SEARCH_FILTER_STR.LOW,  // 낮은 가격순
    //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="L"',
    //         // 'radio-attr': 'class="focus-elem" sort="L"',
    //         'radio-attr': 'class="focus-elem" sort="L" ' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'L' ? 'checked' : '',
    //         'label-attr': ' ',
    //         // subTabCd: 'L'
    //         sort: 'L'
    //       },
    //       {
    //         txt: Tw.SEARCH_FILTER_STR.HIGH,  // 높은 가격순
    //         // 'radio-attr': 'class="focus-elem" sub-tab-cd="H"',
    //         // 'radio-attr': 'class="focus-elem" sort="H"',
    //         'radio-attr': 'class="focus-elem" sort="H" ' + this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 1, this._reqOptions.sortCd.indexOf(this._selectedCollectionToChangeSort + '-') + this._selectedCollectionToChangeSort.length + 2) === 'H' ? 'checked' : '',
    //         'label-attr': ' ',
    //         // subTabCd: 'H'
    //         sort: 'H'
    //       }
    //     ]
    //   }
    // ];

    this._recentKeywordDateFormat = 'YY.M.D.';
    this._todayStr = Tw.DateHelper.getDateCustomFormat(this._recentKeywordDateFormat);
    this.$contents = this.$container.find('.container');
    this._searchInfo.search = this._setRank(this._searchInfo.search);
    this._platForm = Tw.BrowserHelper.isApp()?'app':'web';
    this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    this._bpcpService.setData(this.$container, this._nowUrl);
    this.$ariaHiddenEl = this.$container.find('.fe-aria-hidden-el');
    this._commonTemplate = Handlebars.compile($('#common_template').html());
    if(this._searchInfo.totalcount===0){
      return;
    }
    var keyName,contentsCnt;
    var totalCnt=0;

    this._savedSearchResult = window['SEARCH_RESULT'] = window['SEARCH_RESULT']? window['SEARCH_RESULT'] : this._searchInfo.search;
    Tw.Logger.info('window["SEARCH_RESULT"] : ', this._savedSearchResult);
    // var $categoryHtml = $('#common_template').html();
    // var $categoryHtmlTemplate = Handlebars.compile($categoryHtml);
    // this.$categoryArea.append($categoryHtmlTemplate);

    // 상하 스크롤시 카테고리 영역 고정되도록 처리
    this.$categoryArea = this.$container.find('.tod-srhcategory-scrwrap');
    this._categoryInit();
    
    Tw.Logger.info('[_nextInit] this._sort : ', this._sort);

    for(var i=0;i<this._searchInfo.search.length;i++){
      keyName =  Object.keys(this._searchInfo.search[i])[0];
      contentsCnt = Number(this._searchInfo.search[i][keyName].count);
      
      if(keyName==='immediate') {
        if (contentsCnt > 0) {
          Tw.Logger.info('[_nextInit] 즉답검색결과 내용 존재', '');
          _this._smartDispYn = 'N';
        }
      }

      if(keyName==='smart'||keyName==='immediate'||keyName==='banner'||keyName==='lastevent'){
        if(keyName==='banner'){
          this._showBanner(this._arrangeData(this._searchInfo.search[i][keyName].data,keyName));
        }
        if(keyName==='immediate'&&this._searchInfo.search[i][keyName].data[0]){
          if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===5){  // T멤버십
            this._showBarcode(this._searchInfo.search[i][keyName].data[0].barcode,this.$container.find('#membership-barcode'));
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===2){  // 데이터 잔여량
            this._calculdateRemainData(this._searchInfo.search[i][keyName].data[0].subData);
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===3&&this._nowUser!=='logOutUser'){  // 실시간 요금
            this._requestRealTimeFeeFlag = true;
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===7){  // 부가서비스
            this._calculateAdditionsFee(this._searchInfo.search[i][keyName].data[0].subData);
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===8){  // 음성 잔여량
            this._calculateRemainVoice(this._searchInfo.search[i][keyName].data[0].subData);
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===9){  // 요금약정할인
            this._requestFeeAgrmntDiscountInfo(this._searchInfo.search[i][keyName].data[0].subData);
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===10){  // 단말기 할부금
            this._requestEqpInstallmentInfo(this._searchInfo.search[i][keyName].data[0].subData);
          }
        }
        if(keyName==='smart'){
          this._showSmart(this._searchInfo.search[i][keyName].data[0]);
        }
        if(keyName==='lastevent'){
          // 노출요건이 없음
        }
        continue;
      } else {
        // Tw.Logger.info('common template : ', $('#common_template').html());
        
        // this.$categoryArea.append($categoryHtmlTemplate({collection : keyName, count : contentsCnt}));
        // $categoryHtmlTemplate({collection : keyName, count : contentsCnt});
        var categoryStr = '.fe-' + keyName + '-count';

        if ( contentsCnt < 1 ) {
          this.$container.find(categoryStr).parents('li').hide();
        } else {
          this.$container.find(categoryStr).text(contentsCnt);
        }

        // // var categoryElem = $categoryHtml.find('.fe-' + keyName + '-count');
        // if( contentsCnt < 1 ) {
        //   // Tw.Logger.info(keyName, categoryElement.parents('li'));
        //   categoryElem.parents('li').hide();
        // } else {
        //   categoryElem.text(contentsCnt);
        // }

        // this.$categoryArea.append(Handlebars.compile($categoryHtml));



        //-------------------

        // var categoryElement = this.$container.find('.fe-' + keyName + '-count');
        
        // if( contentsCnt < 1 ) {
        //   // Tw.Logger.info(keyName, categoryElement.parents('li'));
        //   categoryElement.parents('li').hide();
        // } else {
        //   categoryElement.text(contentsCnt);
        // }
        // 전체 갯수는 스마트검색, 배너, 즉답검색결과는 제외하고 카운트한다.
        totalCnt += contentsCnt;

      }
      // if(keyName==='direct'){
      //   this.$container.find('.direct-element.home').data('link',Tw.OUTLINK.DIRECT_HOME);
      // }
      this._showShortcutList(this._arrangeData(this._searchInfo.search[i][keyName].data,keyName),keyName,this._cdn, 'init');
    } // end for
    this.$categorySlide = this.$container.find('#fe-category-slide');
    this.$categorySlide.addClass('horizontal');
    Tw.Logger.info('[_nextInit] this.$categorySlide.attr("class") : ', this.$categorySlide.attr('class'));
    Tw.Logger.info('[_nextInit] this.$categorySlide.parents("div") : ', this.$categorySlide.parents('div')[0]);
    skt_landing.widgets.widget_horizontal(this.$categorySlide.parents('div')[0]);

    // this.widget_horizontal(this.$categorySlide);
    // this.$categoryArea.append($categoryHtmlTemplate);

    var categoryTop = $('.tod-srhcategory-scrwrap').offset().top;
    $(window).on('scroll', function(){
      $('.tod-srhcategory-scrwrap').toggleClass('fixed', ($(window).scrollTop() + $('.searchbox-header').height()) > categoryTop);
    });
    
    this.$container.find('.fe-total-count').each(function(a,b){
      var $target = $(b);
      $target.text(totalCnt);
    });
    
    this.$inputElement = this.$container.find('#keyword');
    this.$inputElement.on('keyup',$.proxy(this._inputChangeEvent,this));
    this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
    this.$container.on('click','.icon-gnb-search, .fe-search-link',$.proxy(this._doSearch,this));

    this.$inputElementResultSearch = this.$container.find('#resultSearchKeyword');
    this.$inputElementResultSearch.on('keyup',$.proxy(this._keyInputEvt,this));
    if (this._searchInfo.query !== this._searchInfo.researchQuery) {
      var tempstr = this._searchInfo.researchQuery.replace(this._searchInfo.query, '');
      tempstr = tempstr.trim();
      this.$inputElementResultSearch.attr('value', tempstr);
    }
    
    this.$sort = this.$container.find('.fe-sort');
    
    this.$container.on('click','.icon-historyback-40',$.proxy(this._historyService.goBack,this));
    // this.$container.on('click','.close-area',$.proxy(this._closeSearch,this));
    this.$container.on('touchstart', '.close-area', $.proxy(this._closeSearch, this));
    this.$container.on('click','.search-element',$.proxy(this._searchRelatedKeyword,this));
    this.$container.on('click','.list-data',$.proxy(this._goLink,this));
    
    this.$container.on('click','.btn-search',$.proxy(this._doResultSearch,this));
    this.$container.on('click', '[data-url]', $.proxy(this._goUrl, this));
    this.$container.on('click', '#fe-btn-feedback', $.proxy(this._showClaimPopup, this));
    this.$container.on('click', '#fe-btn-top', $.proxy(function (e) {
      e.preventDefault();
      $(window).scrollTop(0);
    }, this));

    this.$container.on('click','.fe-category',$.proxy(this._selectCategory,this));

    this.$container.on('click','.fe-category',$.proxy(this._selectCategory,this));
    // this.$container.on('click','#fe-more-rate',function(e){
    //   e.preventDefault();
    // });
    this.$container.on('click', '.fe-sort', $.proxy(this._onClickChangeSort, this));
    this.$container.on('click', '#fe-more-rate', $.proxy(this._sortRate, this));

    this.$container.on('change','.resultsearch-box > .custom-form > input',$.proxy(
      function(e) {this.$container.find('.resultsearch-box > label').toggleClass('on',$(e.currentTarget).prop('checked'));}
    ,this));
    this._recentKeywordInit();
    this._recentKeywordTemplate = Handlebars.compile($('#recently_keyword_template').html());
    this._autoCompleteKeywrodTemplate = Handlebars.compile($('#auto_complete_template').html());
    this._removeDuplicatedSpace(this.$container.find('.cont-sp'),'cont-sp');
    if(this._from==='menu'&&this._historyService.isReload()===false&&!this._historyService.isBack()){
      this._addRecentlyKeyword(this._searchInfo.query);
    }
    new Tw.XtractorService(this.$container);
    this._closeKeywordListBase();
    if(this._requestRealTimeFeeFlag){
      Tw.CommonHelper.startLoading('.container-wrap', 'white');
      this._requestRealTimeFee(0);
    }
    this.$container.find('.container').removeClass('none');

    if(this._platForm!=='app'){
      $('#fe-post-bnnr').show();
    }

    //TEST code
    // this.$container.find('.horizontal-list').css('width', '2431px');
  },
  _categoryInit : function () {
    // var _this = this;

    // 카테고리 템플릿 그리기
    var $categoryHtml = $('#common_template').html();
    var $categoryHtmlTemplate = Handlebars.compile($categoryHtml);
    this.$categoryArea.append($categoryHtmlTemplate);

    // var categoryTop = this.$container.find('.tod-srhcategory-scrwrap').offset().top;
    // var $horizontalSlide = this.$container.find('.tod-srhcategory-scrwrap').find('.horizontal-slide');
    // var $categoryOn = $horizontalSlide.find('li.on');
    // var leftPosition = $categoryOn.offset().left - (($horizontalSlide.width() / 2) - ($categoryOn.width() / 2));
    
    // $(window).on('scroll', function () {
    //   _this.$container.find('.tod-srhcategory-scrwrap').toggleClass('fixed', ($(window).scrollTop() + $('.searchbox-header').height()) > categoryTop);
    // });

    // setTimeout(function () {
    //     $horizontalSlide.scrollLeft(leftPosition);
    // }, 0);
  },
  /**
   * @function
   * @member
   * @param {Array} 검색 결과
   * @desc 카테고리 정렬
   * @returns {Array}
   */
  _setRank : function (data) {
    var compareKeyName1 , compareKeyName2;
    for (var i=0;i<data.length;i++) {
      for(var j=0;j<(data.length-i-1);j++){
        compareKeyName1 = Object.keys(data[j])[0];
        compareKeyName2 = Object.keys(data[j+1])[0];
        if(Tw.FormatHelper.isEmpty(data[j][compareKeyName1].rank)){
          data[j][compareKeyName1].rank = 0;
          continue;
        }
        if(data[j][compareKeyName1].rank > data[j+1][compareKeyName2].rank) {
          var tmp = data[j];
          data[j] = data[j+1];
          data[j+1] = tmp;
        }
      }
    }
    return data;
  },
  /**
   * @function
   * @member
   * @desc 검색창 input 이벤트
   * @returns {void}
   */
  _keyInputEvt : function (inputEvtObj) {
    inputEvtObj.preventDefault();

    if(Tw.InputHelper.isEnter(inputEvtObj)){
      this._doResultSearch();
    }
  },
  /**
   * @function
   * @member
   * @desc 실제 초기화
   * @param {Array} data - 카테고리별 검색 데이터
   * @param {String} category - 카테고리명
   * @returns {Array}
   */
  _arrangeData : function (data,category) {
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

    // 5개까지만 노출해달라는 요건으로 인한 처리. (T app 은 8개)
    // 와이즈넛 엔진에서 전달주는 결과값 개수 조정이 가능하다면 아래 로직은 삭제 처리 필요
    if (category !== 'tapp') {
      if (data.length > 5) {
        data.splice(5, data.length);
      }
    } else {
      if (data.length > 8) {
        data.splice(8, data.length);
      }
    }
    

    for(var i=0;i<data.length;i++){
      for (var key in data[i]) {
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
          if (data[i][key].indexOf('#') !== -1) {
            data[i][key] = data[i][key].split('#');
            
            if (data[i][key][0] === '') {
              data[i][key].splice(0, 1);
            }
            Tw.Logger.info('ㄴ------------ METATAG : ', data[i][key]);
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
   * @desc 바코드 출력
   * @param {String} barcodeNum - 바코드 번호
   * @param {Object} $barcodeElement - 바코드 jquery 객체
   * @returns {void}
   */
  _showBarcode : function (barcodeNum,$barcodeElement) {
    $barcodeElement.JsBarcode(barcodeNum,{background : '#edeef0',height : 60, displayValue : false});
    this.$container.find('.bar-code-num').text(barcodeNum);
  },
  /**
   * @function
   * @member
   * @desc 바코드 출력
   * @param {String} barcodNum - 바코드 번호
   * @param {Object} $barcodElement - 바코드 jquery 객체
   * @returns {void}
   */
  _showShortcutList : function (data,dataKey,cdn, gubun) {
    // 지난이벤트 컬렉션이 추가되었지만 티월드 노출 요건이 없으므로 예외처리함.
    if (dataKey !== 'lastevent') {
      // Tw.Logger.info ('[_showShortcutList] datakey : ' + dataKey);
      // if (dataKey === 'bundle') {
        // Tw.Logger.info ('[_showShortcutList] html : ' + this.$container.find('#'+dataKey+'_base').html());
      // }

      // Tw.Logger.info ('[_showShortcutList] compile : ' + Handlebars.compile(this.$container.find('#'+dataKey+'_base').html()));
      
      if (gubun !== 'sort') {
        this.$contents.append(Handlebars.compile(this.$container.find('#'+dataKey+'_base').html()));
      }

      var $template = $('#'+dataKey+'_template');
      var $list = this.$container.find('#'+dataKey+'_list');
      $list.empty();
      var shortcutTemplate = $template.html();
      var templateData = Handlebars.compile(shortcutTemplate);

      if(data.length<=0){
        $list.addClass('none');
        this.$container.find('.'+dataKey).addClass('none');
      }
      _.each(data,$.proxy(function (listData,index) {
        if(listData.DOCID==='M000083'&&this._nowUser==='logOutUser'){
          var removeLength = data.length-1;
          if(removeLength<=0){
            $('.'+dataKey).addClass('none');
          }else{
            $('.'+dataKey+' .num').text(removeLength);
          }
          return;
        }
        $list.append(templateData({listData : listData , CDN : cdn}));
      },this));

      Tw.Logger.info('#' + dataKey + '_list', this.$container.find('#'+dataKey+'_list'));
    }
  },
  /**
   * @function
   * @member
   * @desc 검색결과 특수문자 제거
   * @param {String} targetString - 검색 결과
   * @returns {String}
   */
  _decodeEscapeChar : function (targetString) {
    return targetString.replace(/\\/gi, '/').replace(/\n/g, '');
  },
  /**
   * @function
   * @member
   * @desc 검색창 keyup 이벤트
   * @param {Object} args - 이벤트 객체
   * @returns {void}
   */
  _inputChangeEvent : function (args) {
    if(Tw.InputHelper.isEnter(args)){
      this.$container.find('.icon-gnb-search').trigger('click');
    }else{
      if(this._historyService.getHash()==='#input_P'){
        if(this.$inputElement.val().trim().length>0){
          this._getAutoCompleteKeyword();
        }else{
          this._showRecentKeyworList();
        }
      }
    }
  },
  /**
   * @function
   * @member
   * @desc 검색 실행
   * @param {Object} event - 이벤트 객체
   * @returns {void}
   */
  _doSearch : function (event) {
    var keyword = this.$inputElement.val();
    if(Tw.FormatHelper.isEmpty(keyword)||keyword.trim().length<=0){
      this.$inputElement.blur();
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,null,'search_keyword_err',$(event.currentTarget));
      return;
    }
    // var inResult = this.$container.find('#resultsearch').is(':checked');
    // var requestUrl = inResult?'/common/search/in-result?keyword='+(encodeURIComponent(this._searchInfo.query))+'&in_keyword=':'/common/search?keyword=';
    var requestUrl = '/common/search?keyword=';
    requestUrl+=encodeURIComponent(keyword);
    requestUrl+='&step='+(Number(this._step)+1);
    this._addRecentlyKeyword(keyword);
    this._moveUrl(requestUrl);
  },
  /**
   * @function
   * @member
   * @desc 결과내 재검색 실행
   * @param {Object} event - 이벤트 객체
   * @returns {void}
   */
  _doResultSearch : function (event) {
    var keyword = this.$inputElement.val();
    var resultSearchKeyword = this.$inputElementResultSearch.val();

    Tw.Logger.info('[_doResultSearch] resultSearchKeyword : ', '[' + resultSearchKeyword + ']');

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
    var requestUrl = '/common/search/in-result?keyword='+(encodeURIComponent(this._searchInfo.query))+'&in_keyword=';
    requestUrl+=encodeURIComponent(resultSearchKeyword.trim());
    requestUrl+='&step='+(Number(this._step)+1);
    this._addRecentlyKeyword(resultSearchKeyword);
    this._moveUrl(requestUrl);
  },
  /**
   * @function
   * @member
   * @desc 검색 개선 의견 보내기 팝업 출력
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _showClaimPopup : function(evt){
    this._popupService.open({
      hbs: 'HO_05_02_02_01_01', 
      layer: true,
      data: null
    }, $.proxy(this._bindEventForRequestKeyword, this),
      //$.proxy(this._showAndHidePopKeywordList,this), 'requestKeyword');
      $.proxy(this._removeInputDisabled,this), 'requestKeyword',$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 검색 개선 의견 보내기 팝업 이벤트 바인딩
   * @param {Object} popupObj - 팝업 layer 객체
   * @returns {void}
   */
  _bindEventForRequestKeyword : function(popupObj){
    // this.$inputElement.attr('disabled','disabled');
    this.$requestKeywordPopup = $(popupObj);
    this.$requestKeywordPopup.on('click','.request_claim',$.proxy(this._openAlert,this,Tw.ALERT_MSG_SEARCH.ALERT_4_A40,this._improveInvest));
    this.$requestKeywordPopup.on('keyup','.input-focus',$.proxy(this._activateRequestKeywordBtn,this));
    this.$requestKeywordPopup.on('click','.cancel',$.proxy(this._activateRequestKeywordBtn,this));
    this._changeAriaHidden('open');
  },
  /**
   * @function
   * @member
   * @desc 얼럿 출력 함수
   * @param {Object} alertObj - 얼럿 메세지 객체
   * @param {function} doRequest - 요청 함수
   * @param {Object} event - 이벤트 객체
   * @returns {void}
   */
  _openAlert : function (alertObj,doRequest,event){
    this._popupService.openModalTypeATwoButton(alertObj.TITLE, null, null, alertObj.BUTTON,
      null,
      $.proxy(doRequest,this,event),
      null,null,$(event.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 검색 설문조사 작성 완료 버튼 활성화 함수
   * @param {Object} inputEvt - 이벤트 객체
   * @returns {void}
   */
  _activateRequestKeywordBtn : function(inputEvt){
    var $inputEvt = $(inputEvt.currentTarget);
    var inputLength = $inputEvt.val().length;
    this.$requestKeywordPopup.find('.byte-current').text(inputLength);
    if(inputLength>0){
      this.$requestKeywordPopup.find('.request_claim').removeAttr('disabled');
    }else{
      this.$requestKeywordPopup.find('.request_claim').attr('disabled','disabled');
    }
    this._validateMaxLength($inputEvt);
  },
  /**
   * @function
   * @member
   * @desc 접근성 관련 요소 숨김,보임 처리
   * @param {String} type - 팝업 열기,닫기 타입
   * @returns {void}
   */
  _changeAriaHidden : function (type) {
    if(type==='open'){
      this.$ariaHiddenEl.attr('aria-hidden',true);
    }else{
      this.$ariaHiddenEl.attr('aria-hidden',false);
    }
  },
  /**
   * @function
   * @member
   * @desc 검색어 설문조사 주관식 내용 길이 검증 함수
   * @param {Object} $inputEvt - 입력 요소 jquery 객체
   * @returns {void}
   */
  _validateMaxLength : function ($inputEvt) {
    var maxLength = $inputEvt.attr('maxlength');
    var nowTargetVal = $inputEvt.val();
    if(nowTargetVal.length>maxLength){
      $inputEvt.val(nowTargetVal.substring(0,maxLength));
      $inputEvt.blur();
      setTimeout(function () {
        $inputEvt.focus();
      });
    }
    this.$requestKeywordPopup.find('.byte-current').text($inputEvt.val().length);
  },
  /**
   * @function
   * @member
   * @desc 검색 개선 의견 보내기
   */
  _improveInvest : function (evt) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_08_0084, { ctt : this.$requestKeywordPopup.find('.input-focus').val() }, null, null, null, { jsonp : false }).
    done($.proxy(function (res) {
      this._claimCallback(res,52, evt);
    }, this))
      .fail($.proxy(function (err) {
        this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(evt.currentTarget));
      }, this));
  },
  /**
   * @function
   * @member
   * @desc 검색어 설문조사 요청 콜백
   * @param {Object} res - 응답 객체
   * @param {Object} srchId - 설문 타입 code
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _claimCallback : function (res,srchId, evt) {
    Tw.Logger.info('[_claimCallBack]','');
    if(res.code===Tw.API_CODE.CODE_00){

      this._popupService.openAlert(Tw.ALERT_MSG_SEARCH.REQUEST_IMPROVE);
      // this._popupService.openModalTypeAOneButton(Tw.ALERT_MSG_SEARCH.REQUEST_IMPROVE, null, null, null, null, null, null, null, $(evt.currentTarget));


      //openModalTypeATwoButton: function (title, contents, btName, closeBtName, openCallback, confirmCallback, closeCallback, hashName, evt) {
      // this._popupService.openModalTypeATwoButton(alertObj.TITLE, null, null, alertObj.BUTTON,
      //   null,
      //   $.proxy(doRequest,this,event),
      //   null,null,$(event.currentTarget));



      var $selectedEl = this.$container.find('.opinion-selectbox');
      $selectedEl.each(function (idx) {
        if($selectedEl.eq(idx).data('type')===srchId){
          $selectedEl.eq(idx).children('.btn').hide();
          $selectedEl.eq(idx).children('.text').text(Tw.ALERT_MSG_SEARCH.REQUEST_CLAIM);
          $selectedEl.eq(idx).removeClass();
        }
      });
      this._popupService.close();
    }else{
      this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(evt.currentTarget));
    }
  },
  _selectCategory : function (elem) {
    var _this = this;
    var $elem = $(elem.currentTarget);

    // 선택한 컬렉션
    // [AS-IS]
    // var collection = $elem.attr('class').replace(/fe-category| |on/gi, '');

    // [TO-BE]
    var collection;
    var elementAttArray = $elem.attr('class').split(' ');
    for (var idx in elementAttArray) {
      if (elementAttArray[idx] !== 'fe-category') {
        if (elementAttArray[idx] !== 'on') {
          collection = elementAttArray[idx];
        }
      }
    }

    Tw.Logger.info('[특정 카테고리 더보기] 카테고리 코드 : ', collection);

    // 선택한 컬렉션의 정렬기준
    var sort;
    if (collection !== 'all') {
      sort = this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(collection + '-') + collection.length + 1, 
                                               this._reqOptions.sortCd.indexOf(collection + '-') + collection.length + 2);
    } else {
      sort = this._reqOptions.sortCd;
    }

    Tw.Logger.info('[특정 카테고리 더보기] 카테고리 정렬 기준 : ', sort);

    // 검색어
    var keyword = this._searchInfo.query;

    Tw.Logger.info('[특정 카테고리 더보기] 입력된 검색어 : ', keyword);

    // 결과내 재검색어 (결과내 재검색 아닌 경우 검색어와 동일)
    var inKeyword = this._searchInfo.researchQuery;

    Tw.Logger.info('[특정 카테고리 더보기] 결과내 재검색 키워드 : ', inKeyword);

    // 카테고리 클릭시 이동할 링크 정보
    var url;

    // 결과 내 재검색
    if (keyword !== inKeyword) {
      inKeyword = inKeyword.replace(keyword, '');
      
      if (collection !== 'all') {
        url = '/common/search/more?keyword=' + keyword + '&in_keyword=' + inKeyword.trim() + '&step=' + (Number(this._step) + 1) + '&category=' + collection + '&sort=' + sort;
      } else {
        url = '/common/search?keyword=' + keyword + '&in_keyword=' + inKeyword.trim() + '&step=' + (Number(this._step) + 1);
      }
    } else {
      if (collection !== 'all') {
        url = '/common/search/more?keyword=' + keyword + '&step=' + (Number(this._step) + 1) + '&category=' + collection + '&sort=' + sort;
      } else {
        url = '/common/search?keyword=' + keyword + '&step=' + (Number(this._step) + 1);
      }      
    }

    Tw.Logger.info('[특정 카테고리 더보기] 이동할 url 링크 : ', url);

    window.location.href = url;

    // // 수정 시작 [S] - 앵커 이동이 아니라 화면 이동으로
    // _this.$container.find('.fe-category').removeClass('on');
    // $elem.addClass('on');
    
    // var tempStr = '#searchlist_' + $elem.attr('class').replace(/fe-category| |on/gi, '');
    // Tw.Logger.info('[_selectCategory] tempStr : ', tempStr);
    
    // // 검색결과를 해당 컬렉션 영역으로 상하 스크롤
    // var offset = $(tempStr).position();

    // $('html, body').animate({
    //   scrollTop: offset.top - 66    // <div id="header"> 영역의 height가 66 
    // }, 400);

    // // 컬렉션 리스트에서 현재 선택된 컬렉션 위치로 좌우 스크롤
    // this._setScrollLeft($elem);
    // // 수정 시작 [E] - 앵커 이동이 아니라 화면 이동으로
  },
  /**
   * @function
   * @desc 카테고리 아이디에 해당하는 탭 위치로 스크롤
   * @param {String} categoryId
   */
  _setScrollLeft: function (elem) {    
    var $target = $(elem);
    Tw.Logger.info('[_setScrollLeft] $target : ', $target);
    var x = parseInt($target.position().left, 10);
    var parentLeft = parseInt(this.$container.find('#fe-category-area').position().left, 10);
    
    this.$container.find('#fe-category-area').find('ul').scrollLeft(x - parentLeft);
  },
  _onClickChangeSort : function (e) {
    var _this = this;
    var $target = $(e.currentTarget);    
    var selectedCollection = $target.attr('class').replace(/fe-sort| |tod-fright/gi, '');
    Tw.Logger.info('[_onClickChangeSort] 선택된 영역의 collection', selectedCollection);

    this._selectedCollectionToChangeSort = selectedCollection;

    var tempBtnStr = '.fe-btn-sort-' + selectedCollection;
    

    this._popupService.open({
      hbs: this._ACTION_SHEET_HBS,
      layer: true,
      btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
      data: _this._getSortCd(selectedCollection)
    // }, $.proxy(this._onOpenGradeActionSheet, this, selectedCollection), null, 'select-grade', this.$sort.find('button'));
    }, $.proxy(this._onOpenGradeActionSheet, this, selectedCollection), null, 'select-grade', this.$container.find(tempBtnStr));
  },
  _getSortCd: function (categoryId) {
    Tw.Logger.info('[_getSortCd] 선택된 categoryId', categoryId);

    var sortCdStr = this._reqOptions.sortCd.substring(this._reqOptions.sortCd.indexOf(categoryId + '-') + categoryId.length + 1, this._reqOptions.sortCd.indexOf(categoryId + '-') + categoryId.length + 2);

    Tw.Logger.info('[_getSortCd] 선택된 categoryId 의 정렬기준', sortCdStr);

    this._sortCd = [
      {
        list: [
          {
            txt: Tw.SEARCH_FILTER_STR.ADMIN,  // 추천순
            // 'radio-attr': 'class="focus-elem" sub-tab-cd="A" checked',
            // 'radio-attr': 'class="focus-elem" sort="A" checked',
            'radio-attr': (sortCdStr === 'A') ? 'class="focus-elem" sort="A" checked' : 'class="focus-elem" sort="A"',
            'label-attr': ' ',
            // subTabCd: 'A'
            sort: 'A'
          },
          {
            txt: Tw.SEARCH_FILTER_STR.NEW,  // 최신순
            // 'radio-attr': 'class="focus-elem" sub-tab-cd="D"',
            // 'radio-attr': 'class="focus-elem" sort="D"',
            'radio-attr': (sortCdStr === 'D') ? 'class="focus-elem" sort="D" checked' : 'class="focus-elem" sort="D"',
            'label-attr': ' ',
            // subTabCd: 'D'
            sort: 'D'
          },
          {
            txt: Tw.SEARCH_FILTER_STR.LOW,  // 낮은 가격순
            // 'radio-attr': 'class="focus-elem" sub-tab-cd="L"',
            // 'radio-attr': 'class="focus-elem" sort="L"',
            'radio-attr': (sortCdStr === 'L') ? 'class="focus-elem" sort="L" checked' : 'class="focus-elem" sort="L"',
            'label-attr': ' ',
            // subTabCd: 'L'
            sort: 'L'
          },
          {
            txt: Tw.SEARCH_FILTER_STR.HIGH,  // 높은 가격순
            // 'radio-attr': 'class="focus-elem" sub-tab-cd="H"',
            // 'radio-attr': 'class="focus-elem" sort="H"',
            'radio-attr': (sortCdStr === 'H') ? 'class="focus-elem" sort="H" checked' : 'class="focus-elem" sort="H"',
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

    Tw.Logger.info('현재 선택된 영역 (' + selectedCollection + ') 의 라디오버튼 상자 : ', $container.find('li input').attr('id'));

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
        item['radio-attr'] = 'id="' + selectedCollection + '-radio"' + 'class="focus-elem" sort="'+item.sort+'"' + (item.sort === _this._reqOptions.sortCd.substring(startIdx, startIdx+1) ? 'checked' : '');
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
      reqOptions = {query: encodeURIComponent(query), collection: collection, pageNum: pageNum, sort: sort, researchQuery: encodeURIComponent(researchQuery)};
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
        
        var sortedRateResultArr = res.result.search[0][collection].data;
        // var sortedRateResultArr = (res.result.search[0])[0].data;
        // var sortedRateResultArr = res.result.search[0].rate.data;
        Tw.Logger.info('[_sortRate] sortedRateResultArr.length', sortedRateResultArr.length);
        
        // sortedRateResultArr.sort(function(a, b) {
        //   return parseFloat(b.BAS_FEE_INFO) - parseFloat(a.BAS_FEE_INFO); // 내림차순
        //   // return parseFloat(a.BAS_FEE_INFO) - parseFloat(b.BAS_FEE_INFO);  // 오름차순
        // });
        
        Tw.Logger.info('[_sortRate] sorted rate result array', sortedRateResultArr);

        // var $list = this.$container.find('#' + collection + '_list');
        // $list.empty();


        // this._showShortcutList(this._arrangeData(this._searchInfo.search[i][keyName].data,keyName),keyName,this._cdn);
        _this._showShortcutList(_this._arrangeData(sortedRateResultArr, collection), collection, this._cdn, 'sort');

        this._sort = sort;
        Tw.Logger.info('this._sort : ', this._sort);
        
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
  /**
   * @function
   * @member
   * @desc 배너 출력
   * @param {Object} data - 배너 검색 결과
   * @returns {void}
   */
  _showBanner : function (data) {
    var bannerPositionObj = {
      AGN	 : 'as_outlet',
      APP	: 'tapp',
      BENF : 'sale',
      CUG	 : 'manner',
      EVT	 : 'event',
      FAQ	: 'question',
      FEE	: 'rate',
      IUG	: 'siteInfo',
      MBR	: 'tmembership',
      NOTI : 'notice',
      ROM	: 'troaming',
      SVC	: 'service',
      TWD	: 'direct',
      VUG	: 'serviceInfo',
      WIRE : 'tv_internet',
      BND : 'bundle'
    };
    var bannerTemplate = Handlebars.compile($('#banner_template').html());
    _.each(data,$.proxy(function (bannerData) {
      this.$container.find('.cont-box.list.'+bannerPositionObj[bannerData.SUBM_MENU_ID1])
        .after(bannerTemplate({listData : bannerData, CDN : this._cdn}));
    },this));

  },
  /**
   * @function
   * @member
   * @desc 최근검색어 추가
   * @param {Object} keyword - 검색어
   * @returns {void}
   */
  _addRecentlyKeyword : function (keyword) {
    for(var i=0;i<this._recentKeyworList[this._nowUser].length;i++){
      if(this._recentKeyworList[this._nowUser][i].keyword === keyword){
        this._recentKeyworList[this._nowUser].splice(i,1);
        break;
      }
    }
    this._recentKeyworList[this._nowUser].unshift({
      keyword : keyword,
      searchTime : this._todayStr,
      platForm : this._platForm,
      initial : Tw.StringHelper.getKorInitialChar(keyword)
    });
    while (this._recentKeyworList[this._nowUser].length>10){
      this._recentKeyworList[this._nowUser].pop();
    }
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,JSON.stringify(this._recentKeyworList));
  },
  /**
   * @function
   * @member
   * @desc 연관검색어, 검색어 추천 클릭 이벤트
   * @param {Object} targetEvt - 이벤트 객체
   * @returns {void}
   */
  _searchRelatedKeyword : function (targetEvt) {
    targetEvt.preventDefault();
    var $targetElement = $(targetEvt.currentTarget);
    var keyword = $targetElement.data('param');
    //var goUrl = '/common/search?keyword='+keyword+'&step='+(Number(this._step)+1);
    if(!$targetElement.hasClass('searchword-text')){
      this._addRecentlyKeyword(keyword);
    }
    this._moveUrl($targetElement.attr('href'));
  },
  /**
   * @function
   * @member
   * @desc 검색결과 클릭 이벤트
   * @param {Object} linkEvt - 이벤트 객체
   * @returns {void}
   */
  _goLink : function (linkEvt) {
    linkEvt.preventDefault();
    var $linkData = $(linkEvt.currentTarget);
    var linkUrl = $linkData.attr('href');
    if(Tw.FormatHelper.isEmpty(linkUrl)){
      return;
    }

    // 검색결과 반응 정보로 XTR 에 송신할 컬렉션 정보
    var $linkDataClass = $linkData.attr('class');
    var filterStr = ['link', 'list', 'in-img', '-data', 'b-cont', 'bt-t', 'event-datail', '-element'];

    for (var j in filterStr) {
      if ($linkDataClass.indexOf(filterStr[j]) !== -1) {
        $linkDataClass = $linkDataClass.replace(filterStr[j], '');
      }
    }

    $linkDataClass = $linkDataClass.trim();
    Tw.Logger.info('[XTR 에 송신할 컬렉션 정보] ', '['+$linkDataClass+']');

    // 검색결과 반응 정보로 XTR 에 송신할 검색어 정보
    var encodedKeyword = encodeURIComponent(this._searchInfo.query);
    Tw.Logger.info('[XTR 에 송신할 검색어 정보] ', '['+encodedKeyword+']');

    // 검색결과 반응 정보로 XTR 에 송신할 결과내재검색 키워드 정보
    var encodedInKeyword = '';
    if (this._searchInfo.query !== this._searchInfo.researchQuery) {
      var tempstr = this._searchInfo.researchQuery.replace(this._searchInfo.query, '');
      tempstr = tempstr.trim();
     
      // Tw.Logger.info('[XTR 에 송신할 결과내재검색 키워드 정보] ', '['+tempstr+']');
      encodedInKeyword = encodeURIComponent(tempstr);
    }
    Tw.Logger.info('[XTR 에 송신할 결과내재검색 키워드 정보] ', '['+encodedInKeyword+']');

    // 검색결과 반응 정보 수집을 위한 XTR API 호출
    window.XtractorScript.xtrSearch(encodedKeyword, encodedInKeyword, $linkDataClass);
    // window.XtractorScript.xtrCSDummy(encodedKeyword, encodedInKeyword, $linkDataClass);


    if(!$linkData.hasClass('home')){
      this._apiService.request(Tw.API_CMD.STACK_SEARCH_USER_CLICK,
        {
          'docId' : $linkData.data('id'),
          'section' : $linkData.data('category'),
          'title' : encodeURIComponent($linkData.data('tit')),
          'keyword' : encodeURIComponent(this._searchInfo.researchQuery)
        }
      );
    }
    if(this._bpcpService.isBpcp(linkUrl)){
      this._bpcpService.open(linkUrl, null, null);
    }else if(linkUrl.indexOf('Native:')>-1){
      if(linkUrl.indexOf('freeSMS')>-1){
        this._callFreeSMS($linkData);
      }
    }else if($linkData.hasClass('direct-element')){
      this._popupService.openConfirm(null,Tw.MSG_COMMON.DATA_CONFIRM,
          $.proxy(function () {
            this._popupService.close();
            Tw.CommonHelper.openUrlExternal(linkUrl);
          },this),
          $.proxy(this._popupService.close,this._popupService),$linkData
      );

    }else{
      if(this._exceptionDocId[$linkData.data('id')]){
        linkUrl = this._exceptionDocId[$linkData.data('id')].link;
      }
      if(linkUrl.indexOf('http')>-1){
        if($linkData.data('require-pay')==='Y'){
          this._popupService.openConfirm(null,Tw.POPUP_CONTENTS.NO_WIFI,
              $.proxy(function () {
                this._popupService.close();
                Tw.CommonHelper.openUrlExternal(linkUrl);
              },this),
              $.proxy(this._popupService.close,this._popupService),$linkData
          );
        }else{
          Tw.CommonHelper.openUrlExternal(linkUrl);
        }
      }else{
        this._moveUrl(linkUrl);
      }
    }

  },
  /**
   * @function
   * @member
   * @desc 검색 닫기 ( 검색창 진입 이전 페이지로 이동 )
   * @returns {void}
   */
  _closeSearch : function () {
    if(this._historyService.getHash()==='#input_P'){
      ++this._step;
    }
    setTimeout($.proxy(function () {
      this._historyService.go(Number(this._step)*-1);
    },this));
  },
  /**
   * @function
   * @member
   * @desc 검색 결과 카테고리사이의 공백 중복 제거
   * @param {Object} $selectedArr - 삭제할 클래스명 jquery 객체
   * @param {String} className - 삭제할 클래스 명
   * @returns {void}
   */
  _removeDuplicatedSpace : function ($selectedArr,className) {
    $selectedArr.each(function(){
      var $target = $(this);
      if($target.next().hasClass(className)){
        $target.addClass('none');
      }
    });
  },
  /**
   * @function
   * @member
   * @desc 최근검색어 가져오기, 초기화
   * @returns {void}
   */
  _recentKeywordInit : function () {
    var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD));
    var removeIdx = [];
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
      //making recentlySearchKeyword
      recentlyKeywordData = {};
    }
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData[this._nowUser])){
      //makin nowUser's recentlySearchKeyword based on svcMgmtNum
      recentlyKeywordData[this._nowUser] = [];
    }
    _.each(recentlyKeywordData[this._nowUser],$.proxy(function (data, index) {
      //recognize 10 days ago data from now
      if(Tw.DateHelper.getDiffByUnit(Tw.DateHelper.convDateCustomFormat(this._todayStr,this._recentKeywordDateFormat),Tw.DateHelper.convDateCustomFormat(data.searchTime,this._recentKeywordDateFormat),'day')>=10){
        removeIdx.push(index);
      }
    },this));
    _.each(removeIdx,$.proxy(function (removeIdx) {
      recentlyKeywordData[this._nowUser].splice(removeIdx,1);
    },this));
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,JSON.stringify(recentlyKeywordData));
    this._recentKeyworList = recentlyKeywordData;
  },
  /**
   * @function
   * @member
   * @desc 검색창 focus 이벤트
   * @returns {void}
   */
  _inputFocusEvt : function () {
      this._openKeywordListBase();
  },
  /**
   * @function
   * @member
   * @desc 검색창 blur 이벤트
   * @returns {void}
   */
  _inputBlurEvt : function () {
    if(this._historyService.getHash()==='#input_P'){
      this._popupService.close();
    }
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 이벤트 바인딩
   * @param {Object} layer - 최근검색어, 검색어 자동완성 화면 객체
   * @returns {void}
   */
  _bindKeyworListBaseEvent : function (layer) {
    this.$keywordListBase = $(layer);
    if(this.$inputElement.val().trim().length>0){
      this._getAutoCompleteKeyword();
    }else{
      this._showRecentKeyworList();
    }
    this.$keywordListBase.on('click','.remove-recently-list',$.proxy(this._removeRecentlyKeywordList,this));
    this.$keywordListBase.on('click','.close',$.proxy(this._closeKeywordListBase,this,true));
    $('.keyword-list-base').insertAfter('.fe-header-wrap');
    this.$container.find('.fe-container-wrap').attr('aria-hidden',true);
    this.$container.find('.fe-header-wrap').attr('aria-hidden',false);
    $(window).scrollTop(0);
    this.$keywordListBase.off('touchstart');
    this.$keywordListBase.on('touchstart',$.proxy(function () {
      this.$inputElement.blur();
    },this));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 출력
   * @returns {void}
   */
  _openKeywordListBase : function () {
    if(this._historyService.getHash()==='#input_P'){
      if(this.$inputElement.val().trim().length>0){
        this._getAutoCompleteKeyword();
      }else{
        this._showRecentKeyworList();
      }
      return;
    }
    setTimeout($.proxy(function () {
      this._popupService.open({
          hbs: 'search_keyword_list_base',
          layer: true,
          data : null
        },
        $.proxy(this._bindKeyworListBaseEvent,this),
        $.proxy(this._keywordListBaseClassCallback,this),
        'input');
    },this));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 닫기 실행
   * @returns {void}
   */
  _closeKeywordListBase  : function () {
    setTimeout($.proxy(function () {
      this._popupService.close();
      this.$container.find('.keyword-list-base').remove();
      this.$container.find('.fe-container-wrap').attr('aria-hidden',false);
      skt_landing.action.checkScroll.unLockScroll();
    },this));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 닫기 콜백
   * @returns {void}
   */
  _keywordListBaseClassCallback : function () {
    this._closeKeywordListBase();
    this.$inputElement.blur();
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면  최근검색어 화면으로 전환
   * @returns {void}
   */
  _showRecentKeyworList : function () {
    if(this._historyService.getHash()==='#input_P'){
      this.$keywordListBase.find('#recently_keyword_layer').removeClass('none');
      if(!this.$keywordListBase.find('#auto_complete_layer').hasClass('none')){
        this.$keywordListBase.find('#auto_complete_layer').addClass('none');
      }
      this.$keywordListBase.find('#recently_keyword_list').empty();
      _.each(this._recentKeyworList[this._nowUser],$.proxy(function (data,idx) {
        this.$keywordListBase.find('#recently_keyword_list').append(this._recentKeywordTemplate({listData : data , xtractorIndex : idx+1 , index : idx , encodeParam : encodeURIComponent(data.keyword)}));
      },this));
      //this.$keywordListBase.find('#recently_keyword_list') list
    }
  },
  /**
   * @function
   * @member
   * @desc 검색어 자동완성 요청
   * @returns {void}
   */
  _getAutoCompleteKeyword : function () {
    var keyword = this.$inputElement.val();
    if(this._historyService.getHash()!=='#input_P'||keyword.trim().length<=0){
      return;
    }
    this.$keywordListBase.find('#auto_complete_layer').removeClass('none');
    if(!this.$keywordListBase.find('#recently_keyword_layer').hasClass('none')){
      this.$keywordListBase.find('#recently_keyword_layer').addClass('none');
    }
    var requestParam = { query : encodeURIComponent(keyword) };
    this._apiService.request(Tw.API_CMD.SEARCH_AUTO_COMPLETE,requestParam)
      .done($.proxy(function (res) {
        if(res.code===0){
          var autoCompleteList = this._mergeList(this._getRecentKeywordListBySearch(keyword),res.result.length<=0?[]:res.result[0].items);
          this._showAutoCompleteKeyword(autoCompleteList);
        }
      },this));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 리스트 병합
   * @param {Array} recentKeywordList - 최근검색어 리스트
   * @param {Array} autoCompleteList - 자동완성 검색어 리스트
   * @returns {Array}
   */
  _mergeList : function (recentKeywordList,autoCompleteList) {
    _.each(autoCompleteList,$.proxy(function (data) {
      recentKeywordList.push(this._convertAutoKeywordData(data.hkeyword));
    },this));
    recentKeywordList = Tw.FormatHelper.removeDuplicateElement(recentKeywordList);
    return recentKeywordList;
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 검색어 자동완성 전환
   * @param {Array} autoCompleteList - 자동완성 검색어 리스트
   * @returns {void}
   */
  _showAutoCompleteKeyword : function (autoCompleteList) {
    this.$keywordListBase.find('#auto_complete_list').empty();
    _.each(autoCompleteList,$.proxy(function (data,idx) {
      if(idx>=10){
        return;
      }
      this.$keywordListBase.find('#auto_complete_list').append(this._autoCompleteKeywrodTemplate({listData : data ,xtractorIndex : idx+1, encodeParam: encodeURIComponent(data.linkStr)}));
    },this));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 검색어 자동완성 전환
   * @param {Array} keyword - 검색어
   * @returns {Array}
   */
  _getRecentKeywordListBySearch : function (keyword) {
    var returnData = [];
    for(var i=0;i<this._recentKeyworList[this._nowUser].length;i++){
      if(this._recentKeyworList[this._nowUser][i].keyword.indexOf(keyword)>-1||
        (!Tw.FormatHelper.isEmpty(this._recentKeyworList[this._nowUser][i].initial)&&this._recentKeyworList[this._nowUser][i].initial.indexOf(keyword)>-1)){
        if(
          this._nowUser==='logOutUser'&&
          !Tw.FormatHelper.isEmpty(this._recentKeyworList[this._nowUser][i].platForm)&&
          this._platForm!==this._recentKeyworList[this._nowUser][i].platForm
        ){
          continue;
        }
        returnData.push({
          showStr : this._recentKeyworList[this._nowUser][i].keyword.replace(new RegExp(this._escapeChar(keyword),'g'),'<span class="keyword-text">'+keyword+'</span>'),
          linkStr : this._recentKeyworList[this._nowUser][i].keyword
        });
      }
    }
    return returnData;
  },
  /**
   * @function
   * @member
   * @desc 자동완성 하이라이팅 퍼블리싱에 맞춰 변경
   * @param {String} listStr - 자동완성 결과
   * @returns {Object}
   */
  _convertAutoKeywordData : function (listStr) {
    var returnObj = {};
    returnObj.showStr =  listStr.substring(0,listStr.length-7);
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontColorOpen,'<span class="keyword-text">');
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontSizeOpen,'');
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontClose,'</span>');
    returnObj.linkStr = Tw.FormatHelper.stripTags(returnObj.showStr);
    return returnObj;
  },
  /**
   * @function
   * @member
   * @desc 최근검색어 삭제 함수
   * @param {Object} args - 이벤트 객체
   * @returns {void}
   */
  _removeRecentlyKeywordList : function (args) {
    var removeIdx = $(args.currentTarget).data('index');
    if(removeIdx==='all'){
      this._recentKeyworList[this._nowUser] = [];
    }else{
      this._recentKeyworList[this._nowUser].splice(removeIdx,1);
    }
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,JSON.stringify(this._recentKeyworList));
    this._recentKeywordInit();
    setTimeout($.proxy(this._showRecentKeyworList,this));
  },
  /**
   * @function
   * @member
   * @desc url 이동
   * @param {String} linkUrl - 이동할 url
   * @returns {void}
   */
  _moveUrl : function (linkUrl) {
    if(this._historyService.getHash()==='#input_P'){
      this._closeKeywordListBase();
    }
    setTimeout($.proxy(function () {
      this._historyService.goLoad(linkUrl);
    },this),100);
  },
  /**
   * @function
   * @member
   * @desc 스마트검색 출력
   * @param {Object} data - 스마트 검색 결과
   * @returns {void}
   */
  _showSmart : function (data) {
    if(Tw.FormatHelper.isEmpty(data)){
      return;
    }
    var returnData = [];
    for(var i=1;i<=3;i++){
      if(!Tw.FormatHelper.isEmpty(data['BNNR_BOT_BTN_NM'+i])){
        returnData.push({
          title : data['BNNR_BOT_BTN_NM'+i],
          link : data['BNNR_BOT_BTN_URL'+i],
          docId : data['DOCID'],
          payInfo : data['BNNR_BOT_BTN_BILL_YN'+i]
        });
      }
    }
    if(returnData.length<=0){
      return;
    }else{
      this.$container.find('#smart_btn_base').removeClass('none');
      var smartTemplate = Handlebars.compile(this.$container.find('#smart_template').html());
      var $smartBase = this.$container.find('.btn-link-list');
      _.each(returnData,function (data,idx) {
        $smartBase.append(smartTemplate({data : data }));
      });
      if(returnData.length===3){
        $smartBase.addClass('col3');
      }else if(returnData.length===1){
        $smartBase.find('.last-line').addClass('full');
      }
    }
  },
  /**
   * @function
   * @member
   * @desc 무료문자 호출
   * @param {Object} $linkData - 선택한 요소 jquery 객체
   * @returns {void}
   */
  _callFreeSMS : function ($linkData) {
    var memberType = this._svcInfo.totalSvcCnt > 0 ? (this._svcInfo.expsSvcCnt > 0 ? 0 : 1) : 2;
    if (memberType === 1) {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms',$linkData
      );
      return ;
    }

    if (this._svcInfo.svcAttrCd==='M2') {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS_PPS,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms_pps',$linkData
      );
      return;
    }
    Tw.CommonHelper.openFreeSms();
  },
  /**
   * @function
   * @member
   * @desc 무료문자 호출
   * @param {String} string - 특수문자와 결합어 정상 출력 안되는 문자열 정상 출력 하도록 수정
   * @returns {String}
   */
  _escapeChar : function (string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },
  /**
   * @function
   * @member
   * @desc 유료부가서비스 개수 및 금액 계산, 출력( 즉답검색 case 7 , 부가서비스 관련 검색시)
   * @param {Object} usingAdditions - 이용중인 부가서비스 리스트 객체
   * @returns {void}
   */
  _calculateAdditionsFee : function (usingAdditions) {
    var addProdList = usingAdditions.addProdList || []; // 이용중인 부가서비스 리스트
    var totalPaidAdditionsCnt = 0;
    var totalUnpaidAdditionsCnt = 0;
    var returnStr1 = '';
    var returnStr2 = '';

    if(addProdList.length > 0) {
      addProdList.map(function(_data){
        if(_data.payFreeYn !== 'Y'){
          totalPaidAdditionsCnt++;
        } else {
          totalUnpaidAdditionsCnt++;
        }
      });
    }

    returnStr1 = totalUnpaidAdditionsCnt + '건';
    returnStr2 = totalPaidAdditionsCnt + '건';

    this.$container.find('.fe-unpaid-additions-cnt').text(returnStr1);
    this.$container.find('.fe-paid-additions-cnt').text(returnStr2);
  },
  /**
   * @function
   * @member
   * @desc 남은데이터 계산, 출력( 즉답검색 case 2 , 데이터 관련 검색시)
   * @param {Object} usageData - 데이터 잔여량 객체
   * @returns {void}
   */
  _calculdateRemainData : function (usageData) {
    var gnrlData = usageData.gnrlData || [];
    var totalRemainUnLimited = false;
    var returnStr = '';
    gnrlData.map(function(_data){
      if ( Tw.UNLIMIT_CODE.indexOf(_data.unlimit) !== -1 ) {
        totalRemainUnLimited = true;
      }
    });
    if ( totalRemainUnLimited ) {
      returnStr = Tw.COMMON_STRING.UNLIMIT;
    } else {
      var totalRemained = 0;
      for(var idx in gnrlData){
        if(!Tw.FormatHelper.isEmpty(gnrlData[idx].remained)){
          if(gnrlData[idx].unit !== Tw.UNIT_E.FEE) {
            totalRemained+= parseInt(gnrlData[idx].remained);
          }
        }
      }
      usageData.totalRemained = Tw.FormatHelper.convDataFormat(totalRemained, Tw.UNIT[Tw.UNIT_E.DATA]);
      returnStr = usageData.totalRemained.data+usageData.totalRemained.unit;
    }
    this.$container.find('.fe-data-remaind').text(returnStr);
  },
  /**
   * @function
   * @member
   * @desc 남은음성잔여량 계산, 출력( 즉답검색 case 8 , 음성잔여량 관련 검색시)
   * @param {Object} usageData - 음성잔여량 객체
   * @returns {void}
   */
  _calculateRemainVoice : function (usageData) {
    var voice = usageData.voice || [];
    var totalRemainUnLimited = false;
    var returnStr = '';
    var whitespace = ' ';
    voice.map(function(_data){
      if ( Tw.UNLIMIT_CODE.indexOf(_data.unlimit) !== -1 ) {
        totalRemainUnLimited = true;
      }
    });
    if ( totalRemainUnLimited ) {
      returnStr = Tw.COMMON_STRING.UNLIMIT;
    } else {
      var totalRemained = 0;
      for(var idx in voice){
        if(!Tw.FormatHelper.isEmpty(voice[idx].remained)){
          totalRemained+= parseInt(voice[idx].remained);
        }
      }
      usageData.totalRemained = Tw.FormatHelper.convVoiceFormat(totalRemained);

      if (usageData.totalRemained.hours > 0) {
        returnStr = usageData.totalRemained.hours + '시간';

        if (usageData.totalRemained.min > 0) {
          returnStr += whitespace + usageData.totalRemained.min + '분';

          if (usageData.totalRemained.sec > 0) {
            returnStr += whitespace + usageData.totalRemained.sec + '초';
          }
        } 
      } else {
        if (usageData.totalRemained.min > 0) {
          returnStr = usageData.totalRemained.min + '분';

          if (usageData.totalRemained.sec > 0) {
            returnStr += whitespace + usageData.totalRemained.sec + '초';
          }
        } else {
          if (usageData.totalRemained.sec > 0) {
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
   * @member
   * @desc 요금약정할인 정보 출력( 즉답검색 case 9 , 요금약정할인 관련 검색시)
   * @param {Object} usageData - 요금약정할인 정보 객체
   * @returns {void}
   */
  _requestFeeAgrmntDiscountInfo : function (feeAgrmntDiscountData) {
    var priceList = feeAgrmntDiscountData.priceList || [];
    var feeAgrmntDcCnt = 0;
    var feeAgrmntDcNm = '';
    var feeAgrmntDcEndDt = '';

    if (priceList.length > 0) {
      feeAgrmntDcCnt = priceList.length;

      if (feeAgrmntDcCnt === 1){
        priceList.map(function(_data){
          feeAgrmntDcNm = _data.disProdNm;
          feeAgrmntDcEndDt = _data.agrmtDcEndDt
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
   * @member
   * @desc 단말할부정보 출력( 즉답검색 case 10 , 단말기 할부금 관련 검색시)
   * @param {Object} usageData - 단말할부 정보 객체
   * @returns {void}
   */
  _requestEqpInstallmentInfo : function (eqpInstallmentData) {
    var installmentList = eqpInstallmentData.installmentList || [];
    var eqpInstallmentPlanCnt = 0;  // 단말할부 건수
    var eqpInstallmentPlanMonth = '';  // 전체 할부개월수
    var remainEqpInstallmentAmt = '';   // 잔여 단말할부금
    var remainEqpInstallmentMonth = '';    // 잔여 할부개월수

    if (installmentList.length > 0) {
      eqpInstallmentPlanCnt = installmentList.length;

      if (eqpInstallmentPlanCnt > 1) {
        // 할부시작일을 기준으로 내림차순 정렬
        installmentList.sort(function(a, b) {
          return parseFloat(b.allotStaDt) - parseFloat(a.allotStaDt);
          // return parseFloat(a.allotStaDt) - parseFloat(b.allotStaDt);
        });
      }

      eqpInstallmentPlanMonth = installmentList[0].allotMthCnt;
      remainEqpInstallmentAmt = installmentList[0].invBamt;
      remainEqpInstallmentMonth = installmentList[0].invRmn;

      this.$container.find('.fe-remain-eqp-installment-amt').text(Tw.FormatHelper.convNumFormat(Number(remainEqpInstallmentAmt)) + Tw.CURRENCY_UNIT.WON + '(' + eqpInstallmentPlanMonth + '개월)');
      this.$container.find('.fe-remain-eqp-installment-month').text(remainEqpInstallmentMonth + Tw.DATE_UNIT.MONTH);

      if (eqpInstallmentPlanCnt === 1) {
        $('#fe-eqp-installment-info-case1').show();
      } else {
        this.$container.find('.fe-remain-eqp-installment-cnt').text((eqpInstallmentPlanCnt-1) + '건');
        $('#fe-eqp-installment-info-case2').show();
      }
    }
  },
  /**
   * @function
   * @member
   * @desc 실시간 이용요금 요청( 즉답검색 case 3 )
   * @param {Number} count - 요청 count
   * @returns {void}
   */
  _requestRealTimeFee : function (count) {
    this._apiService.request(Tw.API_CMD.BFF_05_0022, { count: count }, {})
        .done($.proxy(function(res){
          this._requestRealTimeCallback(res,count);
        },this))
        .fail(function () {
          this._requestRealTimeFeeFail();
        });
  },
  /**
   * @function
   * @member
   * @desc 실시간 이용요금 요청 콜백
   * @param {Object} res - 실시간 이용요금 리턴
   * @param {Number} cnt - 요청 count
   * @returns {void}
   */
  _requestRealTimeCallback : function (res,cnt) {
    if(res.code===Tw.API_CODE.CODE_00){
      if( res.result.hotBillInfo && res.result.hotBillInfo[0] && res.result.hotBillInfo[0].record1 ){
        Tw.CommonHelper.endLoading('.container-wrap');
        this.$container.find('.fe-realtime-fee').text(res.result.hotBillInfo[0].totOpenBal2+Tw.CURRENCY_UNIT.WON);
        this.$container.find('.paymentcharge-box.type03').removeClass('none');
      }else if(cnt>=2){
        this._requestRealTimeFeeFail();
      }else{
        setTimeout($.proxy(this._requestRealTimeFee,this,cnt+1),2500);
      }
    }else{
      this._requestRealTimeFeeFail();
    }
  },
  /**
   * @function
   * @member
   * @desc 실시간 이용요금 요청 실패 콜백
   * @returns {void}
   */
  _requestRealTimeFeeFail : function () {
    Tw.CommonHelper.endLoading('.container-wrap');
    if(this._searchInfo.totalcount<=1){
      this._historyService.replaceURL(this._nowUrl+'&from=empty');
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

    var collectionSortArray = new Array();
    collectionSortArray.push(this._reqOptions.sortCd.split('.'));
    var collectionSortStr = '';

    Tw.Logger.info('컬렉션별 정렬기준 : ', collectionSortArray);

    for (var idx in collectionSortArray[0]) {
      var collectionSortData = collectionSortArray[0][idx]; // ex) rate-H
      Tw.Logger.info('[' + idx + '] : ', collectionSortData);

      var tmpCollection = collectionSortData.split('-')[0]; // ex) rate
      var tmpSort = collectionSortData.split('-')[1]; // ex) H

      Tw.Logger.info('컬렉션명 : ', tmpCollection);
      Tw.Logger.info('정렬기준 : ', tmpSort);
      
      if (collection === tmpCollection) {
        // 선택되는 정렬기준으로 변경해준다.
        param = tmpSort;

        break;
      }
    }

    window.location.href = $(e.currentTarget).data('url') + '&sort=' + param;
  },
  widget_horizontal: function (ta) {
    // var widget = $(ta).find('.horizontal');
    var widget = $(ta);
    $(widget).each(function () {
        if ($(this).data('event') == undefined) {
            $(this).data('event', 'bind')
        } else {
            return;
        }
        var belt = $(this).find('.horizontal-list'),
            slide = $(this).find('.horizontal-slide'),
            items = belt.find('> li'),
            itemsW = 0;
        for (var i = 0; items.length > i; ++i) {
            itemsW += Math.ceil(items.eq(i).outerWidth(true));
        }
        belt.css('width', itemsW + 3);
        /*
        if(itemsW <= slide.width()){
          belt.css('width','100%');
        }else if(itemsW > slide.width()){
          belt.css('width', itemsW + 1);
        }
        */
    });
},
  /**
   * @function
   * @member
   * @desc svcInfo 요청 및 초기화 실행
   * @returns {void}
   */
  _init : function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
        .done($.proxy(function(res){
          if(res.code===Tw.API_CODE.CODE_00){
            this._svcInfo = res.result;
          }
          this._nextInit();
        },this))
        .fail($.proxy(this._nextInit,this));
  }
};
