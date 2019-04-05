/**
 * @file common.search-main.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.18
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
  _init : function () {
    this._autoCompleteRegExObj = {
      fontColorOpen : new RegExp('<font style=\'color:#CC6633\'>','g'),
      fontSizeOpen : new RegExp('<font style=\'font-size:12px\'>','g'),
      fontClose : new RegExp('</font>','g')
    };
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
  },
  _keyInputEvt : function (inputEvtObj) {
    if(Tw.InputHelper.isEnter(inputEvtObj)){
      this._searchByInputValue();
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
  _bindEvent : function () {
    this.$container.find('.close-area').on('click',$.proxy(this._closeSearch,this));
    this.$inputElement.on('keyup',$.proxy(this._keyInputEvt,this));
    this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
    this.$container.on('click','.icon-gnb-search',$.proxy(this._searchByInputValue,this));
    this.$container.on('click','.search-element',$.proxy(this._searchByElement,this));
  },
  _convertAutoKeywordData : function (listStr) {
    var returnObj = {};
    returnObj.showStr =  listStr.substring(0,listStr.length-7);
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontColorOpen,'<span class="keyword-text">');
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontSizeOpen,'');
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontClose,'</span>');
    returnObj.linkStr = Tw.FormatHelper.stripTags(returnObj.showStr);
    return returnObj;
  },
  _inputFocusEvt : function () {
    this._openKeywordListBase();
  },
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
      if(Tw.DateHelper.getDiffByUnit(Tw.DateHelper.convDateCustomFormat(this._todayStr,this._recentKeywordDateFormat),Tw.DateHelper.convDateCustomFormat(data.searchTime,this._recentKeywordDateFormat),'day')>=10){
        removeIdx.push(index);
      }
    },this));
    _.each(removeIdx,$.proxy(function (removeIdx) {
      recentlyKeywordData[this._nowUser].splice(removeIdx,1);
    },this));
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,JSON.stringify(recentlyKeywordData));
    return recentlyKeywordData;
  },
  _searchByInputValue : function () {
    var searchKeyword = this.$inputElement.val();
    if(Tw.FormatHelper.isEmpty(searchKeyword)||searchKeyword.trim().length<=0){
      searchKeyword = this.$container.find('#selected_keyword').val();
    }
    this._doSearch(searchKeyword);
  },
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
      this._doSearch($target.data('param'));
    }
  },
  _doSearch : function (searchKeyword) {
    if(Tw.FormatHelper.isEmpty(searchKeyword)||searchKeyword.trim().length<=0){
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,null,'search_keyword_err',$(event.currentTarget));
      return;
    }
    if(this._historyService.getHash()==='#input_P'){
      this._closeKeywordListBase();
    }
    setTimeout($.proxy(function () {
      this._addRecentlyKeywordList(searchKeyword);
      this._historyService.goLoad('/common/search?keyword='+(encodeURIComponent(searchKeyword))+'&step='+(this._step+1));
    },this),100);
  },
  _closeSearch : function () {
    if(this._historyService.getHash()==='#input_P'){
      ++this._step;
    }
    this._historyService.go(this._step*-1);
  },
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
    setTimeout($.proxy(function () {
      this._popupService.close();
      this.$container.find('.keyword-list-base').remove();
      this.$container.find('.search-content').attr('aria-hidden',false);
      this.$inputElement.blur();
      skt_landing.action.checkScroll.unLockScroll();
    },this));
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
      _.each(this._recentlyKeywordListData[this._nowUser],$.proxy(function (data,idx) {
        this.$keywordListBase.find('#recently_keyword_list').append(this._recentKeywordTemplate({listData : data , xtractorIndex : idx+1 , index : idx , encodeParam : encodeURIComponent(data.keyword)}));
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
      this.$keywordListBase.find('#auto_complete_list').append(this._autoCompleteKeywrodTemplate({listData : data ,xtractorIndex : idx+1, encodeParam: encodeURIComponent(data.linkStr)}));
    },this));
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
    this.$container.find('.search-content').attr('aria-hidden',true);
    $('.keyword-list-base').insertAfter('.searchbox-header');
    $(window).scrollTop(0);
    this.$keywordListBase.off('touchstart');
    this.$keywordListBase.on('touchstart',$.proxy(function () {
      this.$inputElement.blur();
    },this));
  },
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
