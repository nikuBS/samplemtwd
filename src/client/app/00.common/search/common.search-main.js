/**
 * @file common.search-main.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.18
 */

/**
 * @class
 * @desc 검색 메인 페이지 (최초 진입)
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {String} cdn - cdn 서버 주소
 * @param {String} step – 검색 진입점 까지의 페이지 이동 횟수
 * @returns {void}
 */
Tw.CommonSearchMain = function (rootEl,cdn,step) {
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this.$container = rootEl;
  this._svcInfo = null;
  this._cdn = cdn;
  this._step = parseInt(step,10);
  this._svcInfoInit();
};

Tw.CommonSearchMain.prototype = {
  /**
   * @function
   * @member
   * @desc 초기화
   * @returns {void}
   */
  _init : function () {
    this._autoCompleteRegExObj = {
      fontColorOpen : new RegExp('<font style=\'color:#CC6633\'>','g'),
      fontSizeOpen : new RegExp('<font style=\'font-size:12px\'>','g'),
      fontClose : new RegExp('</font>','g')
    };
    this._isDoSearch = false; // 검색 중복처리 방지
    this._recentKeywordDateFormat = 'YY.M.D.';
    this._todayStr = Tw.DateHelper.getDateCustomFormat(this._recentKeywordDateFormat);
    this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    this._recentlyKeywordListData = this._getRecentlyKeywordList();
    this.$inputElement = this.$container.find('#search_input');
    this._recentKeywordTemplate = Handlebars.compile($('#recently_keyword_template').html());
    this._autoCompleteKeywrodTemplate = Handlebars.compile($('#auto_complete_template').html());
    this._bindEvent();
    this._platForm = Tw.BrowserHelper.isApp()?'app':'web';
    new Tw.XtractorService(this.$container);
    //this.$container.find('#recently_keyword_layer').removeClass('none').hide();
    this._loadRecommendMenuInfo();
  },
  /**
   * @function
   * @param event keydown
   * @desc 검색창 input 이벤트
   * @returns {void}
   */
  _keyDownInputEvt: function (event) {
    // enter 키는 keydown 에서 처리
    // which:: https://api.jquery.com/event.which/
    if ( event.which === 13 && !this._isDoSearch) {
      this._isDoSearch = true;
      this._searchByInputValue(event);
      event.preventDefault();
    }
  },
  /**
   * @function
   * @param event keyup
   * @desc 검색창 input 이벤트
   * @returns {void}
   */
  _keyUpInputEvt: function (event) {
    // which:: https://api.jquery.com/event.which/
    if ( event.which !== 13) {
      if ( this._historyService.getHash() === '#input_P' ) {
        if ( this.$inputElement.val().trim().length > 0 ) {
          this._getAutoCompleteKeyword();
        } else {
          this._showRecentKeyworList();
        }
      }
    }
    event.stopPropagation();
    event.preventDefault();
  },
  /**
   * @function
   * @member
   * @desc 이벤트 바인딩
   * @returns {void}
   */
  _bindEvent : function () {
    // this.$container.find('.close-area').on('click',$.proxy(this._closeSearch,this));
    this.$container.on('touchstart click', '.close-area', $.proxy(this._closeSearch, this));
    this.$inputElement.on('keydown', $.proxy(this._keyDownInputEvt, this));
    // key 입력 시 서버 요청 및 DOM 변경을 최소화 하기 위해 마지막에 한번만 요청하기 위해 _.debounce 사용
    this.$inputElement.on('keyup',_.debounce($.proxy(this._keyUpInputEvt,this), 500));
    this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
    this.$container.on('click','.icon-gnb-search',$.proxy(this._searchByInputValue,this));
    this.$container.on('click','.search-element',$.proxy(this._searchByElement,this));
    this.$container.on('click','.rec-word',$.proxy(this._searchByRecWord,this));
    this.$container.on('click','#fe-btn-more',$.proxy(this._showMorePopularSearchWord,this));
    this.$container.on('click','#fe-btn-fold',$.proxy(this._hideMorePopularSearchWord,this));
    this.$container.on('click','#fe-btn-rcmnd',$.proxy(this._goRcmndLink,this));
    this.$container.on('click','.fe-btn-doLikeThis',$.proxy(this._goDoLikeThisLink,this));
  },

  /**
   * @function
   * @desc 추천메뉴 정보 로드
   * @param
   */
  _loadRecommendMenuInfo : function () {
    this._apiService.request(Tw.NODE_CMD.GET_MENU_RCMD, {})
      .then($.proxy(this._onMenuRcmd, this));
  },
  /**
   * @function
   * @desc redis에서 조회된 추천업무 리스트를 화면에 update
   * @param  {Object} res - redis조회로 부터 전달받은 추천업무 결과 값
   */
  _onMenuRcmd: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var $area = this.$container.find('.search-task-list');
      var result = res.result.rcmndMenus;

      // 노출순서 기준 오름차순으로 정렬 (1,2,3,4...)
      result.sort(function(a,b) {
        return a.expsSeq - b.expsSeq;
      });

      for (var i = 0; i < result.length; i += 1) {
        $area.append(this._compileTplForRecommendationItem(result[i].menuUrl, result[i].menuNm, result[i].impDispYn, result[i].oferStcCd));
      }
    }
  },
  /**
   * @function
   * @desc 각각의 추천업무를 화면에 보여주기 위해 markup 형태로 조립
   * @param  {String} href - 클릭 시 연결할 url
   * @param  {String} title - 표기할 추천업무 명
   */
  _compileTplForRecommendationItem: function (href, title, impDispYn, oferStcCd) {
    var returnStr = '';

    if (impDispYn === 'Y') {
      returnStr += '<li class="item strong">';
    } else {
      returnStr += '<li class="item">';
    }

    if (oferStcCd === null) {
      oferStcCd = '';
    }

    returnStr += '<button type="button" id="fe-btn-rcmnd" value="' + href + '" data-xt_eid="' +
      oferStcCd + '" data-xt_csid="NO" data-xt_action="BC">' + title + '</button></li>';

    return returnStr;
  },
  /**
   * @function
   * @member
   * @desc 키워드 자동완성 변환
   * @param {String} listStr
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
   * @desc 키워드 입력창 포커스 이벤트
   * @returns {Object}
   */
  _inputFocusEvt : function () {
    this._openKeywordListBase();
  },
  /**
   * @function
   * @member
   * @desc 키워드 입력창 포커스 이벤트
   * @param {Object} args 이벤트 객체
   * @returns {Object}
   */
  _removeRecentlyKeywordList : function (args) {
    var removeIdx = $(args.currentTarget).data('index');
    if(removeIdx==='all'){
      this._recentlyKeywordListData[this._nowUser] = [];
    }else{
      this._recentlyKeywordListData[this._nowUser].splice(removeIdx,1);
    }
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,JSON.stringify(this._recentlyKeywordListData));
    setTimeout($.proxy(this._showRecentKeyworList,this));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어 추가
   * @param {String} keyword  - 검색어
   * @returns {void}
   */
  _addRecentlyKeywordList : function (keyword) {
    for(var i=0;i<this._recentlyKeywordListData[this._nowUser].length;i++){
      if(this._recentlyKeywordListData[this._nowUser][i].keyword === keyword){
        this._recentlyKeywordListData[this._nowUser].splice(i,1);
        break;
      }
    }
    this._recentlyKeywordListData[this._nowUser].unshift(
      {
        keyword : keyword,
        searchTime : this._todayStr,
        platForm : this._platForm,
        initial : Tw.StringHelper.getKorInitialChar(keyword)
      });
    while (this._recentlyKeywordListData[this._nowUser].length>10){
      this._recentlyKeywordListData[this._nowUser].pop();
    }
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,JSON.stringify(this._recentlyKeywordListData));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어 가져오기
   * @returns {Object}
   */
  _getRecentlyKeywordList : function () {
    var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD));
    var removeIdx = [];
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
      //making recentlySearchKeyword
      Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,'{}');
      recentlyKeywordData = {};
    }
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData[this._nowUser])){
      //making now user's recentlySearchKeyword
      recentlyKeywordData[this._nowUser] = [];
    }
    _.each(recentlyKeywordData[this._nowUser],$.proxy(function (data, index) {
      //recognize 10 days ago data from now
      if(Tw.DateHelper.getDiffByUnit(
        Tw.DateHelper.convDateCustomFormat(this._todayStr,this._recentKeywordDateFormat),
        Tw.DateHelper.convDateCustomFormat(data.searchTime,this._recentKeywordDateFormat),'day')>=10) {
        removeIdx.push(index);
      }
    },this));
    _.each(removeIdx,$.proxy(function (removeIdx) {
      recentlyKeywordData[this._nowUser].splice(removeIdx,1);
    },this));
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,JSON.stringify(recentlyKeywordData));

    Tw.CommonHelper.setCookie('search_sort::rate', 'A');
    Tw.CommonHelper.setCookie('search_sort::service', 'A');
    Tw.CommonHelper.setCookie('search_sort::tv_internet', 'A');
    Tw.CommonHelper.setCookie('search_sort::troaming', 'A');
    Tw.CommonHelper.setCookie('search_sort::direct', 'D');

    return recentlyKeywordData;
  },
  /**
   * @function
   * @member
   * @desc 검색창에 입력한 검색어로 검색 실행하기
   * @returns {void}
   */
  _searchByInputValue : function ($event) {
    var $target = $($event.currentTarget);
    var searchKeyword = this.$inputElement.val();
    if ( Tw.FormatHelper.isEmpty(searchKeyword) || searchKeyword.trim().length <= 0 ) {
      searchKeyword = this.$container.find('#selected_keyword').val();
    }
    this._doSearch(searchKeyword, $target);
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 등 키워드 클릭하여 검색 실행
   * @param {Object} linkEvt - 이벤트 객체
   * @returns {Object}
   */
  _searchByElement : function(linkEvt){
    linkEvt.preventDefault();
    var $target = $(linkEvt.currentTarget);
    if($target.hasClass('link')||$target.hasClass('searchword-text')){
      if(this._historyService.getHash()==='#input_P'){
        this._closeKeywordListBase();
      }
      setTimeout($.proxy(function () {
        if($target.data('require-pay')==='Y'){
          this._showRequirePayPopup(linkEvt);
        }else{
          this._historyService.goLoad($target.attr('href'));
        }
      },this),100);

    }else{
      this._doSearch($target.data('param'), $target);
    }
  },
  /**
   * @function
   * @member
   * @desc 추천검색어로 검색 실행
   * @param {Object} linkEvt - 이벤트 객체
   * @returns {Object}
   */
  _searchByRecWord : function($event){
    var $target = $($event.currentTarget);
    var recWord = this.$container.find('#fe-rec-keyword').val();
    if(!Tw.FormatHelper.isEmpty(recWord) && recWord.trim().length>0){
      this._doSearch(recWord, $target);
    }
  },
  /**
   * @function
   * @member
   * @desc 인기 검색어 6위-10위 더 보기
   */
  _showMorePopularSearchWord : function(){
    _.each(this.$container.find('.fe-popularword-list-content'), $.proxy(this._showMoreContent, this));
    $(this.$container.find('.fe-popularword-list-content')[5]).find('a').focus();
    document.querySelector('#fe-btn-more').setAttribute('style', 'display: none');
    document.querySelector('#fe-btn-fold').setAttribute('style', 'display: block');
  },
  /**
   * @function
   * @member
   * @desc 인기 검색어 6위-10위 더 보기
   */
  _showMoreContent : function(elem) {
    var $elem = $(elem);

    if($elem.data('index') > 5) {
      $elem.show();
    }
  },
  /**
   * @function
   * @member
   * @desc 인기 검색어 6위-10위 접기
   */
  _hideMorePopularSearchWord : function () {
    _.each(this.$container.find('.fe-popularword-list-content'), $.proxy(this._hideMoreContent, this));

    document.querySelector('#fe-btn-more').setAttribute('style', 'display: block');
    document.querySelector('#fe-btn-fold').setAttribute('style', 'display: none');

    $('#fe-btn-more').focus();
  },
  /**
   * @function
   * @member
   * @desc 인기 검색어 6위-10위 접기
   */
  _hideMoreContent : function(elem) {
    var $elem = $(elem);

    if($elem.data('index') > 5) {
      $elem.hide();
    }
  },
  /**
   * @function
   * @member
   * @desc 어떤 업무를 찾고 계신가요 메뉴 이동
   */
  _goRcmndLink : function (elem) {
    location.href = elem.currentTarget.value;
  },
  /**
   * @function
   * @member
   * @desc 이럴 땐 이렇게 하세요 링크 이동
   */
  _goDoLikeThisLink : function (elem) {
    location.href = $(elem.currentTarget).data('url');
  },
  /**
   * @function
   * @member
   * @desc 검색 페이지로 이동
   * @param {String} searchKeyword -
   * @param $target6
   * @returns {void}
   */
  _doSearch : function (searchKeyword, $target) {
    Tw.Logger.info('[common.search-main][_doSearch]', $target);
    if ( Tw.FormatHelper.isEmpty(searchKeyword) || searchKeyword.trim().length <= 0 ) {
      // this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,null,'search_keyword_err',$(event.currentTarget));
      this._popupService.openAlert(null, Tw.ALERT_MSG_SEARCH.KEYWORD_ERR, null, null, 'search_keyword_err', $target);
      return;
    }
    if (!this._isDoSearch) {
      return;
    }
    if ( this._historyService.getHash() === '#input_P' ) {
      this._closeKeywordListBase();
    }

    // var sortsName = ['search_sort::rate', 'search_sort::service', 'search_sort::tv_internet', 'search_sort::troaming'];
    //shortcut-C.rate-C.service-C.tv_internet-C.troaming-C
    var sort = 'shortcut-C';
    sort += '.rate-C';
    sort += '.service-C';
    sort += '.tv_internet-C';
    sort += '.troaming-C';
    sort += '.direct-D';

    Tw.CommonHelper.setCookie('search_sort::rate', 'C');
    Tw.CommonHelper.setCookie('search_sort::service', 'C');
    Tw.CommonHelper.setCookie('search_sort::tv_internet', 'C');
    Tw.CommonHelper.setCookie('search_sort::troaming', 'C');
    Tw.CommonHelper.setCookie('search_sort::direct', 'D');

    setTimeout($.proxy(function () {
      // Tw.Logger.info('[common.search-main] [_doSearch]', '"doSearch" Cookie 셋팅');
      // Tw.CommonHelper.setCookie('doSearch', 'Y');
      this._addRecentlyKeywordList(searchKeyword);
      this._isDoSearch = false;
      this._historyService.goLoad('/common/search?keyword='+(encodeURIComponent(searchKeyword))+'&step='+(this._step+1) + '&sort='+sort);
    },this),100);
  },
  /**
   * @function
   * @member
   * @desc 검색 취소 (검색 메인 진입시점 이전 페이지로 이동)
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
   * @desc 검색창의 키워드가 포함되어있는 최근검색어 가져오기
   * @param {String} keyword - 키워드
   * @returns {Array}
   */
  _getRecentKeywordListBySearch : function (keyword) {
    var returnData = [];
    for(var i=0;i<this._recentlyKeywordListData[this._nowUser].length;i++){
      if(this._recentlyKeywordListData[this._nowUser][i].keyword.indexOf(keyword)>-1||
        (!Tw.FormatHelper.isEmpty(this._recentlyKeywordListData[this._nowUser][i].initial)&&
          this._recentlyKeywordListData[this._nowUser][i].initial.indexOf(keyword)>-1)){
        if(
          this._nowUser==='logOutUser'&&
          !Tw.FormatHelper.isEmpty(this._recentlyKeywordListData[this._nowUser][i].platForm)&&
          this._platForm!==this._recentlyKeywordListData[this._nowUser][i].platForm
        ){
          continue;
        }
        returnData.push({
          showStr : this._recentlyKeywordListData[this._nowUser][i].keyword
            .replace(new RegExp(keyword,'g'),'<span class="keyword-text">'+keyword+'</span>'),
          linkStr : this._recentlyKeywordListData[this._nowUser][i].keyword
        });
      }
    }
    return returnData;
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
   * @desc 최근검색어, 검색어 자동완성 화면 비활성화
   * @returns {void}
   */
  _closeKeywordListBase  : function () {
    setTimeout($.proxy(function () {
      this._popupService.close();
      this.$container.find('.keyword-list-base').remove();
      this.$container.find('.search-content').attr('aria-hidden',false);
      this.$inputElement.blur();
      skt_landing.action.checkScroll.unLockScroll();
    },this));
  },
  /**
   * @function
   * @member
   * @desc 검색어 자동완성 , 최근검색어 화면 닫기 콜백
   * @returns {void}
   */
  _keywordListBaseClassCallback : function () {
    this._closeKeywordListBase();
    this.$inputElement.blur();
  },
  /**
   * @function
   * @member
   * @desc 최근검색어 화면으로 전환
   * @returns {void}
   */
  _showRecentKeyworList: function () {
    if ( this._historyService.getHash() === '#input_P' ) {
      this.$keywordListBase.find('#recently_keyword_layer').removeClass('none');
      if ( !this.$keywordListBase.find('#auto_complete_layer').hasClass('none') ) {
        this.$keywordListBase.find('#auto_complete_layer').addClass('none');
      }
      this.$keywordListBase.find('#recently_keyword_list').empty();
      _.each(this._recentlyKeywordListData[this._nowUser], $.proxy(function (data, idx) {
        this.$keywordListBase.find('#recently_keyword_list')
          .append(this._recentKeywordTemplate({
            listData: data, xtractorIndex: idx + 1, index: idx, encodeParam: encodeURIComponent(data.keyword)
          }));
      }, this));
      //this.$keywordListBase.find('#recently_keyword_list') list
    }
  },
  /**
   * @function
   * @member
   * @desc 키워드 자동완성 요청
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
   * @desc 최근검색어와 자동완성 키워드 리스트 병합 , 중복제거
   * @param {Array} recentKeywordList - 키워드
   * @param {Array} autoCompleteList - 키워드
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
   * @desc 키워드 자동완성 화면 출력
   * @param {Array} autoCompleteList - 키워드
   * @returns {Array}
   */
  _showAutoCompleteKeyword : function (autoCompleteList) {
    this.$keywordListBase.find('#auto_complete_list').empty();
    _.each(autoCompleteList,$.proxy(function (data,idx) {
      if(idx>=10){
        return;
      }
      this.$keywordListBase.find('#auto_complete_list')
        .append(this._autoCompleteKeywrodTemplate({
          listData : data ,xtractorIndex : idx+1, encodeParam: encodeURIComponent(data.linkStr)
        }));
    },this));
  },
  /**
   * @function
   * @member
   * @desc 키워드 자동완성 , 최근검색어 화면 이벤트 바인딩
   * @param {Object} layer - 화면 이벤트 객체
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
    this.$container.find('.search-content').attr('aria-hidden',true);
    $('.keyword-list-base').insertAfter('.searchbox-header');
    $(window).scrollTop(0);
    this.$keywordListBase.off('touchstart');
    this.$keywordListBase.on('touchstart',$.proxy(function () {
      this.$inputElement.blur();
    },this));
  },
  /**
   * @function
   * @member
   * @desc 과금팝업 출력
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _showRequirePayPopup : function (evt) {
    var $target = $(evt.currentTarget);
    this._popupService.openConfirm(null,Tw.POPUP_CONTENTS.NO_WIFI,
      $.proxy(function () {
        this._popupService.close();
        Tw.CommonHelper.openUrlExternal($target.attr('href'));
      },this),
      $.proxy(this._popupService.close,this._popupService),$target
    );
  },
  /**
   * @function
   * @member
   * @desc svcInfo 요청
   * @returns {void}
   */
  _svcInfoInit : function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
        .done($.proxy(function(res){
          if(res.code===Tw.API_CODE.CODE_00){
            this._svcInfo = res.result;
          }
          this._init();
        },this))
        .fail($.proxy(this._init,this));
  }
};
