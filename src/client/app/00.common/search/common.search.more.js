/**
 * FileName: common.search.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

Tw.CommonSearchMore = function (rootEl,searchInfo,svcInfo,cdn,accessQuery,step) {
  this.$container = rootEl;
  //this._category = category;
  this._historyService = new Tw.HistoryService();
  //this._searchInfo = JSON.parse(this._decodeEscapeChar(searchInfo));
  this._apiService = Tw.Api;
  this._cdn = cdn;
  this._step = step;
  this._accessQuery = accessQuery;
  this._popupService = Tw.Popup;
  this._searchInfo = searchInfo;
  this._svcInfo = svcInfo;
  this._init(this._searchInfo,accessQuery.category);
  this._accessKeyword = this._searchInfo.query;
  this._category = accessQuery.category;
};

Tw.CommonSearchMore.prototype = {
  _init : function (searchInfo,category) {
    if(searchInfo.search.length<=0){
      return;
    }
    this._listData =this._arrangeData(searchInfo.search[0][category].data,category);
    //this._showShortcutList(this._listData,this.$container.find('#'+category+'_template'),this.$container.find('#'+category+'_list'));
    this._showShortcutList(this._listData,$('#'+category+'_template'),this.$container.find('#'+category+'_list'));
    this.$inputElement =this.$container.find('#keyword');
    this.$inputElement.on('keyup',$.proxy(this._inputChangeEvent,this));
    this.$container.on('click','.icon-historyback-40',$.proxy(this._historyService.goBack,this));
    this.$container.on('change','.sispopup',$.proxy(this._pageChange,this));
    this.$container.on('click','.page-change',$.proxy(this._pageChange,this));
    this.$container.on('click','.close-area',$.proxy(this._closeSearch,this));
    this.$container.on('click','.icon-gnb-search',$.proxy(this._doSearch,this));
    this.$container.on('click','.search-element',$.proxy(this._searchRelatedKeyword,this));
    this.$container.on('click','.filterselect-btn',$.proxy(this._showSelectFilter,this));
    this.$container.on('click','.list-data',$.proxy(this._goLink,this));
  },
  _arrangeData : function (data,category) {
    if(!data){

      return [];
    }
    for(var i=0;i<data.length;i++){
      for (var key in data[i]) {
        if(typeof (data[i][key])==='string'){
          data[i][key] = data[i][key].replace(/<!HE>/g, '</span>');
          data[i][key] = data[i][key].replace(/<!HS>/g, '<span class="highlight-text">');
        }
        if(key==='DEPTH_PATH'){
          data[i][key] = data[i][key].replace(/\|/g,'/');
          data[i][key] = data[i][key].replace(/\ /g,' > ');

        }
        if(key==='MENU_URL'){
          data[i][key] = data[i][key].replace('https://app.tworld.co.kr','');
        }
        if(category==='prevent'&&key==='DOCID'){
          data[i][key] = Number(data[i][key].replace(/[A-Za-z]/g,''));
        }
        if(category==='direct'&&key==='ALIAS'){
          data[i][key] = data[i][key].replace('shopacc',Tw.OUTLINK.DIRECT_ACCESSORY);
          data[i][key] = data[i][key].replace('shopmobile',Tw.OUTLINK.DIRECT_PHONE);
        }
        if(key==='METATAG'){
          data[i][key] = data[i][key].split('#');
        }
        if(key==='IMG'){
          var tempArr = data[i][key].split('<IMG_ALT>');
          data[i][key] = tempArr[0];
          if(tempArr[1]){
            data[i].IMG_ALT = tempArr[1];
          }
        }
      }
    }
    return data;
  },
  _showShortcutList : function (data,template,parent) {
    var shortcutTemplate = template.html();
    var templateData = Handlebars.compile(shortcutTemplate);
    if(data.length<=0){
      parent.hide();
    }
    _.each(data,function (listData) {
      parent.append(templateData({listData : listData , CDN : this._cdn}));
    });
  },
  _decodeEscapeChar : function (targetString) {
    var returnStr = targetString.replace(/\\/gi,'/');
    returnStr = returnStr.replace(/\n/g,'');
    return returnStr;
  },
  _inputChangeEvent : function (args) {
    if(args.keyCode===13){
      this._doSearch();
    }
  },
  _pageChange : function (eventObj) {
    this._historyService.goLoad(eventObj.currentTarget.value);
  },
  _addRecentlyKeyword : function (keyword) {
    var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage('recentlySearchKeyword'));
    var userId = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
      //making recentlySearchKeyword
      //Tw.CommonHelper.setLocalStorage('recentlySearchKeyword','{}');
      recentlyKeywordData = {};
    }

    if(Tw.FormatHelper.isEmpty(recentlyKeywordData[userId])){
      //makin nowUser's recentlySearchKeyword based on svcMgmtNum
      recentlyKeywordData[userId] = [];
    }
    recentlyKeywordData[userId].push({ keyword : keyword, searchTime : moment().format('YY.M.D.')});
    while (recentlyKeywordData[userId].length>10){
      recentlyKeywordData[userId].shift();
    }

    Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(recentlyKeywordData));
  },
  _searchRelatedKeyword : function (targetEvt) {
    var keyword = $(targetEvt.currentTarget).data('param');
    var goUrl = '/common/search?keyword='+keyword+'&step='+(Number(this._step)+1);
    this._addRecentlyKeyword(keyword);
    this._historyService.goLoad(goUrl);
  },
  _doSearch : function () {
    var inResult = this.$container.find('#resultsearch').is(':checked');
    var requestUrl = inResult?'/common/search/in_result?category='+this._category+'&keyword='+this._accessKeyword+'&in_keyword=':'/common/search?keyword=';
    requestUrl+=this.$inputElement.val();
    requestUrl+='&step='+(Number(this._step)+1);
    this._addRecentlyKeyword(this.$inputElement.val());
    this._historyService.goLoad(requestUrl);
  },
  _showSelectFilter : function () {
    var listData = [
      {value : '추천순' , option : this._searchInfo.search[0].direct.sort==='R'?'checked':'' , attr : 'data-type="R"'},
      {value : '인기순' , option : this._searchInfo.search[0].direct.sort==='P'?'checked':'' , attr : 'data-type="P"'},
      {value : '최신순' , option : this._searchInfo.search[0].direct.sort==='D'?'checked':'' , attr : 'data-type="D"'},
      {value : '낮은 가격순' , option : this._searchInfo.search[0].direct.sort==='H'?'checked':'' , attr : 'data-type="H"'},
      {value : '높은 가격순' , option : this._searchInfo.search[0].direct.sort==='L'?'checked':'' , attr : 'data-type="L"'}
    ];
    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        data : [{list : listData}]
      },$.proxy(this._bindPopupElementEvt,this),
      null,
      'select_filter');
  },
  _bindPopupElementEvt : function(popupElement){
    $(popupElement).on('click','button',$.proxy(this._filterSelectEvent,this));
  },
  _filterSelectEvent : function (btnEvt) {
    var changeFilterUrl = this._accessQuery.in_keyword?'/common/search/in_result?category='+this._category+'&keyword='+this._accessQuery.keyword:'/common/search/more?category='+this._category+'&keyword='+this._accessQuery.keyword;
    changeFilterUrl+='&arrange='+$(btnEvt.currentTarget).data('type');
    if(this._accessQuery.in_keyword){
      changeFilterUrl+='&in_keyword='+this._accessQuery.in_keyword;
    }
    changeFilterUrl+='&step='+(Number(this._step)+1);
    this._historyService.goLoad(changeFilterUrl);
  },
  _goLink : function (linkEvt) {
    var $linkData = $(linkEvt.currentTarget);
    var linkUrl = $linkData.data('link');
    if(Tw.FormatHelper.isEmpty(linkUrl)){
      return;
    }
    this._apiService.request(Tw.API_CMD.STACK_SEARCH_USER_CLICK,
      {
        'docId' : $linkData.data('id'),
        'section' : $linkData.data('category'),
        'title' : encodeURI($linkData.data('tit')),
        'keyword' : encodeURI(this._searchInfo.researchQuery)
      }
    );

    //Tw.CommonHelper.openUrlExternal(linkUrl);
    this._historyService.goLoad(linkUrl);
  },
  _closeSearch : function () {
    this._historyService.go(Number(this._step)*-1);
  }
};
