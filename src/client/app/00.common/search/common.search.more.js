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
  this._step = Tw.FormatHelper.isEmpty(step)?1:step;
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
    this._recentKeywordDateFormat = 'YY.M.D.';
    this._todayStr = Tw.DateHelper.getDateCustomFormat(this._recentKeywordDateFormat);
    this._platForm = Tw.BrowserHelper.isApp()?'app':'web';
    this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    if(searchInfo.search.length<=0){
      return;
    }
    this._listData =this._arrangeData(searchInfo.search[0][category].data,category);
    //this._showShortcutList(this._listData,this.$container.find('#'+category+'_template'),this.$container.find('#'+category+'_list'));
    this._showShortcutList(this._listData,$('#'+category+'_template'),this.$container.find('#'+category+'_list'),this._cdn);
    this.$inputElement =this.$container.find('#keyword');
    this.$inputElement.on('keyup',$.proxy(this._inputChangeEvent,this));
    this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
    this.$container.on('click','.icon-historyback-40',$.proxy(this._historyService.goBack,this));
    this.$container.on('change','.sispopup',$.proxy(this._pageChange,this));
    this.$container.on('click','.page-change',$.proxy(this._pageChange,this));
    this.$container.on('click','.close-area',$.proxy(this._closeSearch,this));
    this.$container.on('click','.icon-gnb-search',$.proxy(this._doSearch,this));
    this.$container.on('click','.search-element',$.proxy(this._searchRelatedKeyword,this));
    this.$container.on('click','.filterselect-btn',$.proxy(this._showSelectFilter,this));
    this.$container.on('click','.list-data',$.proxy(this._goLink,this));
    this.$container.find('#contents').removeClass('none');
    this._removeDuplicatedSpace(this.$container.find('.cont-sp'),'cont-sp');
    this._recentKeywordInit();
    this._recentKeywordTemplate = Handlebars.compile($('#recently_keyword_template').html());
    this._autoCompleteKeywrodTemplate = Handlebars.compile($('#auto_complete_template').html());
    new Tw.XtractorService(this.$container);
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
        if(key==='PR_STA_DT'||key==='PR_END_DT'){
          data[i][key] = Tw.DateHelper.getShortDate(data[i][key]);
        }
        if(key==='DEPTH_PATH'){
          if(data[i][key].charAt(0)==='|'){
            data[i][key] = data[i][key].replace('|','');
          }
          //data[i][key] = data[i][key].replace(/\|/g,' > ').replace(/MyT/g,' my T ');
        }
        // if(key==='MENU_URL'){
        //   data[i][key] = data[i][key].replace('https://app.tworld.co.kr','');
        // }
        // if(category==='prevent'&&key==='DOCID'){
        //   data[i][key] = Number(data[i][key].replace(/[A-Za-z]/g,''));
        // }
        if(category==='direct'&&key==='ALIAS'){
          if(data[i][key]==='shopacc'){
            data[i].linkUrl = Tw.OUTLINK.DIRECT_ACCESSORY+'?categoryId='+data[i].CATEGORY_ID+'&accessoryId='+data[i].ACCESSORY_ID;
          }else{
            data[i].linkUrl = Tw.OUTLINK.DIRECT_MOBILE+'?categoryId='+data[i].CATEGORY_ID+'&productGrpId='+data[i].PRODUCT_GRP_ID;
          }
        }
        if(key==='METATAG'){
          data[i][key] = data[i][key].split('#');
        }
        if(key==='IMG'){
          var tempArr = data[i][key].split('<IMG_ALT>');
          data[i][key] = tempArr[0].replace(/\/n/g,'');
          if(tempArr[1]){
            data[i].IMG_ALT = tempArr[1];
          }
        }
      }
    }
    return data;
  },
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
  _decodeEscapeChar : function (targetString) {
    var returnStr = targetString.replace(/\\/gi,'/');
    returnStr = returnStr.replace(/\n/g,'');
    return returnStr;
  },
  _inputChangeEvent : function (args) {
    if(Tw.InputHelper.isEnter(args)){
      this._doSearch();
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
  _pageChange : function (eventObj) {
    //this._historyService.goLoad(eventObj.currentTarget.value);
    this._moveUrl(eventObj.currentTarget.value);
  },
  _addRecentlyKeyword : function (keyword) {
    this._recentKeyworList[this._nowUser].push({
      keyword : keyword,
      searchTime : this._todayStr,
      platForm : this._platForm,
      initial : Tw.StringHelper.getKorInitialChar(keyword)
    });
    while (this._recentKeyworList[this._nowUser].length>10){
      this._recentKeyworList[this._nowUser].shift();
    }
    Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(this._recentKeyworList));
  },
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
  _doSearch : function () {
    var keyword = this.$inputElement.val();
    if(Tw.FormatHelper.isEmpty(keyword)){
      var closeCallback;
      if(this._historyService.getHash()==='#input_P'){
        closeCallback = $.proxy(function () {
          setTimeout($.proxy(function () {
            this.$inputElement.focus();
          },this),100);
        },this);
      }
      this.$inputElement.blur();
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,closeCallback);
      return;
    }
    var inResult = this.$container.find('#resultsearch').is(':checked');
    var requestUrl = inResult?'/common/search/in-result?category='+this._category+'&keyword='+
      this._accessKeyword+'&in_keyword=':'/common/search?keyword=';
    requestUrl+=keyword;
    requestUrl+='&step='+(Number(this._step)+1);
    this._addRecentlyKeyword(keyword);
    this._moveUrl(requestUrl);
  },
  _showSelectFilter : function () {
    var listData = [
      {value : Tw.SEARCH_FILTER_STR.ACCURACY , option : this._searchInfo.search[0].direct.sort==='R'?'checked':'' , attr : 'data-type="R"'},
      {value : Tw.SEARCH_FILTER_STR.NEW , option : this._searchInfo.search[0].direct.sort==='D'?'checked':'' , attr : 'data-type="D"'},
      {value : Tw.SEARCH_FILTER_STR.LOW , option : this._searchInfo.search[0].direct.sort==='L'?'checked':'' , attr : 'data-type="L"'},
      {value : Tw.SEARCH_FILTER_STR.HIGH , option : this._searchInfo.search[0].direct.sort==='H'?'checked':'' , attr : 'data-type="H"'}
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
    $(popupElement).on('click','.chk-link-list button',$.proxy(this._filterSelectEvent,this));
  },
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
  _goLink : function (linkEvt) {
    linkEvt.preventDefault();
    var $linkData = $(linkEvt.currentTarget);
    var linkUrl = $linkData.attr('href');
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
    if(linkUrl.indexOf('BPCP')>-1){
      this._getBPCP(linkUrl);
    }else if(linkUrl.indexOf('Native:')>-1){
      if(linkUrl.indexOf('freeSMS')>-1){
        this._callFreeSMS();
      }
    }else if($linkData.hasClass('direct-element')){
      Tw.CommonHelper.openUrlExternal(linkUrl);
    }else{
      if(linkUrl.indexOf('http')>-1){
        Tw.CommonHelper.openUrlExternal(linkUrl);
      }else{
        this._moveUrl(linkUrl);
      }
    }
  },
  _closeSearch : function () {
    if(this._historyService.getHash()==='#input_P'){
      this._closeKeywordListBase();
    }
    setTimeout($.proxy(function () {
      this._historyService.go(Number(this._step)*-1);
    },this));
  },
  _getBPCP: function (url) {
    var replaceUrl = url.replace('BPCP:', '');
    this._apiService.request(Tw.API_CMD.BFF_01_0039, { bpcpServiceId: replaceUrl })
      .done($.proxy(this._responseBPCP, this));
  },
  _responseBPCP: function (resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var url = resp.result.svcUrl;
    if ( !Tw.FormatHelper.isEmpty(resp.result.tParam) ) {
      url += (url.indexOf('?') !== -1 ? '&tParam=' : '?tParam=') + resp.result.tParam;
    }
    this._moveUrl(url);
  },
  _removeDuplicatedSpace : function ($selectedArr,className) {
    $selectedArr.each(function(){
      var $target = $(this);
      if($target.next().hasClass(className)){
        $target.addClass('none');
      }
    });
  },
  _recentKeywordInit : function () {
  var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage('recentlySearchKeyword'));
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
  Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(recentlyKeywordData));
  this._recentKeyworList = recentlyKeywordData;
  },
  _inputFocusEvt : function () {
    this._openKeywordListBase();
  },
  _inputBlurEvt : function () {
    if(this._historyService.getHash()==='#input_P'){
      this._popupService.close();
    }
  },
  _bindKeyworListBaseEvent : function (layer) {
    this.$keywordListBase = $(layer);
    if(this.$inputElement.val().trim().length>0){
      this._getAutoCompleteKeyword();
    }else{
      this._showRecentKeyworList();
    }
    this.$keywordListBase.on('click','.remove-recently-list',$.proxy(this._removeRecentlyKeywordList,this));
    this.$keywordListBase.on('click','.close',$.proxy(this._closeKeywordListBase,this,true));
    $('.latelylist-wrap').scroll($.proxy(function () {
      this.$inputElement.blur();
    },this));
  },
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
  _closeKeywordListBase  : function () {
    this._popupService.close();
    this.$container.find('.keyword-list-base').remove();
  },
  _keywordListBaseClassCallback : function () {
    this._closeKeywordListBase();
    this.$inputElement.blur();
  },
  _showRecentKeyworList : function () {
    if(this._historyService.getHash()==='#input_P'){
      this.$keywordListBase.find('#recently_keyword_layer').removeClass('none');
      if(!this.$keywordListBase.find('#auto_complete_layer').hasClass('none')){
        this.$keywordListBase.find('#auto_complete_layer').addClass('none');
      }
      this.$keywordListBase.find('#recently_keyword_list').empty();
      _.each(this._recentKeyworList[this._nowUser],$.proxy(function (data,idx) {
        this.$keywordListBase.find('#recently_keyword_list')
          .append(this._recentKeywordTemplate({listData : data , xtractorIndex : idx+1 , index : idx}));
      },this));
      //this.$keywordListBase.find('#recently_keyword_list') list
    }
  },
  _getAutoCompleteKeyword : function () {
    var keyword = this.$inputElement.val();
    if(this._historyService.getHash()!=='#input_P'||keyword.trim().length<=0){
      return;
    }
    this.$keywordListBase.find('#auto_complete_layer').removeClass('none');
    if(!this.$keywordListBase.find('#recently_keyword_layer').hasClass('none')){
      this.$keywordListBase.find('#recently_keyword_layer').addClass('none');
    }
    var requestParam = { query : encodeURI(keyword) };
    this._apiService.request(Tw.API_CMD.SEARCH_AUTO_COMPLETE,requestParam)
      .done($.proxy(function (res) {
        if(res.code===0){
          var autoCompleteList = this._mergeList(this._getRecentKeywordListBySearch(keyword),res.result.length<=0?[]:res.result[0].items);
          this._showAutoCompleteKeyword(autoCompleteList);
        }
      },this));
  },
  _mergeList : function (recentKeywordList,autoCompleteList) {
    _.each(autoCompleteList,$.proxy(function (data) {
      recentKeywordList.push(this._convertAutoKeywordData(data.hkeyword));
    },this));
    recentKeywordList = Tw.FormatHelper.removeDuplicateElement(recentKeywordList);
    return recentKeywordList;
  },
  _showAutoCompleteKeyword : function (autoCompleteList) {
    this.$keywordListBase.find('#auto_complete_list').empty();
    _.each(autoCompleteList,$.proxy(function (data,idx) {
      if(idx>=10){
        return;
      }
      this.$keywordListBase.find('#auto_complete_list').append(this._autoCompleteKeywrodTemplate({listData : data ,xtractorIndex : idx+1}));
    },this));
  },
  _getRecentKeywordListBySearch : function (keyword) {
    var returnData = [];
    for(var i=0;i<this._recentKeyworList[this._nowUser].length;i++){
      if(this._recentKeyworList[this._nowUser][i].keyword.indexOf(keyword)>-1||
        (!Tw.FormatHelper.isEmpty(this._recentKeyworList[this._nowUser][i].initial)&&
          this._recentKeyworList[this._nowUser][i].initial.indexOf(keyword)>-1)) {
        if(
          this._nowUser==='logOutUser'&&
          !Tw.FormatHelper.isEmpty(this._recentKeyworList[this._nowUser][i].platForm)&&
          this._platForm!==this._recentKeyworList[this._nowUser][i].platForm
        ){
          continue;
        }
        returnData.push({
          showStr : this._recentKeyworList[this._nowUser][i].keyword
            .replace(new RegExp(keyword,'g'),'<span class="highlight-text">'+keyword+'</span>'),
          linkStr : this._recentKeyworList[this._nowUser][i].keyword
        });
      }
    }
    return returnData;
  },
  _convertAutoKeywordData : function (listStr) {
    var returnObj = {};
    returnObj.showStr =  listStr.substring(0,listStr.length-7);
    returnObj.showStr = returnObj.showStr.replace('<font style=\'color:#CC6633\'>','<span class="highlight-text">');
    returnObj.showStr = returnObj.showStr.replace('<font style=\'font-size:12px\'>','');
    returnObj.showStr = returnObj.showStr.replace('</font>','</span>');
    returnObj.linkStr = returnObj.showStr.replace('<span class="highlight-text">','').replace('</span>','');
    return returnObj;
  },
  _removeRecentlyKeywordList : function (args) {
    var removeIdx = $(args.currentTarget).data('index');
    if(removeIdx==='all'){
      this._recentKeyworList[this._nowUser] = [];
    }else{
      this._recentKeyworList[this._nowUser].splice(removeIdx,1);
    }
    Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(this._recentKeyworList));
    this._recentKeywordInit();
    setTimeout($.proxy(this._showRecentKeyworList,this));
  },
  _moveUrl : function (linkUrl) {
    if(this._historyService.getHash()==='#input_P'){
      this._closeKeywordListBase();
    }
    setTimeout($.proxy(function () {
      this._historyService.goLoad(linkUrl);
    },this));
  },
  _callFreeSMS : function () {
    var memberType = this._svcInfo.totalSvcCnt > 0 ? (this._svcInfo.expsSvcCnt > 0 ? 0 : 1) : 2;
    if (memberType === 1) {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms'
      );
      return ;
    }

    if (this._svcInfo.svcAttrCd==='M2') {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS_PPS,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms_pps'
      );
      return;
    }
    Tw.CommonHelper.openFreeSms();
  }

};
