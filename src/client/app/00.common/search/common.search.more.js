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
Tw.CommonSearchMore = function (rootEl,searchInfo,cdn,accessQuery,step,paramObj,pageNum,nowUrl) {
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
  this._bpcpService = Tw.Bpcp;
  this._init();
};
Tw.CommonSearchMore.prototype = new Tw.CommonSearch();
Tw.CommonSearchMore.prototype.constructor = Tw.CommonSearchMain;
$.extend(Tw.CommonSearchMore.prototype,
{
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
    this._listData =this._arrangeData(this._searchInfo.search[0][this._category].data,this._category);
    //this._showShortcutList(this._listData,this.$container.find('#'+category+'_template'),this.$container.find('#'+category+'_list'));
    this._showShortcutList(this._listData,$('#'+this._category+'_template'),this.$container.find('#'+this._category+'_list'),this._cdn);
    this.$inputElement =this.$container.find('#keyword');
    this.$inputElement.on('keyup',$.proxy(this._inputChangeEvent,this));
    this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
    this.$container.on('click','.icon-historyback-40',$.proxy(this._historyService.goBack,this));
    this.$container.on('change','.sispopup',$.proxy(this._pageChange,this));
    this.$container.on('click','.page-change',$.proxy(this._pageChange,this));
    this.$container.on('click','.close-area',$.proxy(this._closeSearch,this));
    this.$container.on('click','.icon-gnb-search',$.proxy(this._doSearch,this));
    this.$container.on('change','.resultsearch-box > .custom-form > input',$.proxy(
      function(e) {this.$container.find('.resultsearch-box > label').toggleClass('on',$(e.currentTarget).prop('checked'));}
    ,this));
    this.$container.on('click','.search-element',$.proxy(this._searchRelatedKeyword,this));
    this.$container.on('click','.filterselect-btn',$.proxy(this._showSelectFilter,this));
    this.$container.on('click','.list-data',$.proxy(this._goLink,this));
    this.$container.find('#contents').removeClass('none');
    this.$container.on('click','#page_selector',$.proxy(this._openPageSelector,this));
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
  },

  /**
   * @function
   * @member
   * @desc 실제 초기화
   * @returns {void}
   */
  _showShortcutList : function (data,template,$parent,cdn) {
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
   * @desc 다이렉트샵 검색 정렬 기준 필터 액션시트 출력
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _showSelectFilter : function (evt) {
    var listData = [
      { 'label-attr': 'for=ra0', 'txt': Tw.SEARCH_FILTER_STR.ACCURACY,
        'radio-attr':'id="ra0" data-type="R" name="selectFilter" value="'+Tw.SEARCH_FILTER_STR.ACCURACY+'" '+(this._searchInfo.search[0].direct.sort==='R'?'checked':'' )},
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
    changeFilterUrl+='&arrange='+$(btnEvt.currentTarget).data('type');
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
