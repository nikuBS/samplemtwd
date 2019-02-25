/**
 * FileName: common.search-main.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.18
 */

Tw.CommonSearchMain = function (rootEl,svcInfo,cdn,step) {
  this.$container = rootEl;
  this._svcInfo = svcInfo;
  this._cdn = cdn;
  this._step = parseInt(step,10);
  this._init();
};

Tw.CommonSearchMain.prototype = {
  _init : function () {
    this._historyService = new Tw.HistoryService();
    this._apiService = Tw.Api;
    this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    this._recentlyKeywordListData = this._getRecentlyKeywordList();
    this.$inputElement = this.$container.find('#search_input');
    this.$autoCompleteList = this.$container.find('#auto_complete_list');
    this.$recentlyKeywordList = this.$container.find('#recently_keyword_list');
    this.$autoCompletetTemplate = Handlebars.compile(this.$container.find('#auto_complete_template').html());
    this.$recentlyKeywordTemplate = Handlebars.compile(this.$container.find('#recently_keyword_template').html());
    this.$inputElement.val('');
    window.onhashchange = $.proxy(this._hashChange,this);
    this._onInput = false;
    this._recentlyKeywordInit();
    this._bindPopupElementEvt();
    this._platForm = Tw.BrowserHelper.isApp()?'app':'web';
    new Tw.XtractorService(this.$container);
    //this.$container.find('#recently_keyword_layer').removeClass('none').hide();
  },
  _keyInputEvt : function (inputEvtObj) {
    if(Tw.InputHelper.isEnter(inputEvtObj)){
      this._searchByInputValue();
      return;
    }
    this._selectShowLayer();
    var requestKeyword = this.$inputElement.val();
    if(requestKeyword.trim().length<=0){
      return;
    }
    var requestParam = { query : encodeURI(requestKeyword) };
    var autoCompleteArr = this._getRecentKeywordByInitial(requestKeyword);
    this._apiService.request(Tw.API_CMD.SEARCH_AUTO_COMPLETE,requestParam)
      .done($.proxy(function (res) {
        this.$autoCompleteList.empty();
        if(res.code===0&&res.result.length>0){
          _.each(res.result[0].items,$.proxy(function (data) {
            autoCompleteArr.push(this._convertAutoKeywordData(data.hkeyword));
          },this));
          autoCompleteArr = Tw.FormatHelper.removeDuplicateElement(autoCompleteArr);
          _.each(autoCompleteArr,$.proxy(this._showAutoCompleteKeyword,this));
        }
      },this));
  },
  _showAutoCompleteKeyword : function(data,idx){
    if(idx>=10){
      return;
    }
    //this.$autoCompleteList.append(this.$autoCompletetTemplate({listData : this._convertAutoKeywordData(data.hkeyword),xtractorIndex : idx+1}));
    this.$autoCompleteList.append(this.$autoCompletetTemplate({listData : data ,xtractorIndex : idx+1}));
  },
  _bindPopupElementEvt : function () {
    this.$container.find('.close-area').on('click',$.proxy(this._closeSearch,this));
    this.$inputElement.on('keyup',$.proxy(this._keyInputEvt,this));
    this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
    this.$container.on('click','.close',$.proxy(this._inputBlurEvt,this));
    this.$container.on('click','.icon-gnb-search',$.proxy(this._searchByInputValue,this));
    this.$container.on('click','.search-element',$.proxy(this._searchByElement,this));
    this.$container.on('click','.remove-recently-list',$.proxy(this._removeRecentlyKeywordList,this));
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
  _inputFocusEvt : function () {
    this._onInput = true;
    this._historyService.goHash('on_input');
    this.$container.find('#blind_layer').css('display','block');
    this._selectShowLayer();
  },
  _inputBlurEvt : function () {
    this._onInput = false;
    if(this._historyService.getHash()==='#on_input'){
      this._historyService.goBack();
    }
    this.$container.find('#blind_layer').css('display','none');
    this.$container.find('#auto_complete_layer').addClass('none');
    this.$container.find('#recently_keyword_layer').addClass('none');
    this.$inputElement.blur();
  },
  _selectShowLayer : function () {
    if(this.$inputElement.val().trim().length<=0){
      this.$container.find('#recently_keyword_layer').removeClass('none');
      this.$container.find('#auto_complete_layer').addClass('none');
    }else{
      this.$container.find('#recently_keyword_layer').addClass('none');
      this.$container.find('#auto_complete_layer').removeClass('none');
    }
  },
  _removeRecentlyKeywordList : function (args) {
    var removeIdx = $(args.currentTarget).data('index');
    if(removeIdx==='all'){
      this._recentlyKeywordListData[this._nowUser] = [];
    }else{
      this._recentlyKeywordListData[this._nowUser].splice(removeIdx,1);
    }
    Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(this._recentlyKeywordListData));
    this._recentlyKeywordInit();
  },
  _recentlyKeywordInit : function () {
    var $recentlyKeywordList = this.$recentlyKeywordList;
    var $recentlyKeywordTemplate = this.$recentlyKeywordTemplate;
    var saveBottomLineDate = moment().subtract(10, 'days');
    $recentlyKeywordList.empty();
    _.each(this._recentlyKeywordListData[this._nowUser],function (data, index) {
      //recognize 10 days ago data from now
      if(moment(data.searchTime, 'YY.M.D.') < saveBottomLineDate){
        this._recentlyKeywordListData[this._nowUser].splice(index,1);
      }
      $recentlyKeywordList.append($recentlyKeywordTemplate({data : data, index : index , xtractorIndex: index+1 }));
    });
    Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(this._recentlyKeywordListData));
  },
  _addRecentlyKeywordList : function (keyword) {
    this._recentlyKeywordListData[this._nowUser].push(
      {
        keyword : keyword,
        searchTime : moment().format('YY.M.D.'),
        platForm : this._platForm,
        initial : Tw.StringHelper.getKorInitialChar(keyword)
      });
    while (this._recentlyKeywordListData[this._nowUser].length>10){
      this._recentlyKeywordListData[this._nowUser].shift();
    }
    Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(this._recentlyKeywordListData));
  },
  _getRecentlyKeywordList : function () {
    var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage('recentlySearchKeyword'));
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
      //making recentlySearchKeyword
      Tw.CommonHelper.setLocalStorage('recentlySearchKeyword','{}');
      recentlyKeywordData = {};
    }
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData[this._nowUser])){
      //making now user's recentlySearchKeyword
      recentlyKeywordData[this._nowUser] = [];
    }
    return recentlyKeywordData;
  },
  _searchByInputValue : function () {
    var searchKeyword = this.$inputElement.val();
    if(Tw.FormatHelper.isEmpty(searchKeyword)||searchKeyword.length<=0){
      searchKeyword = this.$container.find('#selected_keyword').val();
    }
    this._doSearch(searchKeyword);
  },
  _searchByElement : function(linkEvt){
    linkEvt.preventDefault();
    var $target = $(linkEvt.currentTarget);
    if($target.hasClass('link')){
      if(this._historyService.getHash()==='#on_input'){
        this._historyService.goBack();
      }
      setTimeout($.proxy(function () {
        this._historyService.goLoad($target.attr('href'));
      },this));

    }else{
      this._doSearch($target.data('param'));
    }
  },
  _doSearch : function (searchKeyword) {
    if(this._historyService.getHash()){
      this._historyService.goBack();
    }
    setTimeout($.proxy(function () {
      this._addRecentlyKeywordList(searchKeyword);
      this._historyService.goLoad('/common/search?keyword='+searchKeyword+'&step='+(this._step+1));
    },this));
  },
  _hashChange : function () {
    if(Tw.FormatHelper.isEmpty(this._historyService.getHash())&&this._onInput){
      this._inputBlurEvt();
    }else if(this._historyService.getHash()==='#on_input'&&!this._onInput){
      this._onInput = true;
      this.$container.find('#blind_layer').css('display','block');
      this._selectShowLayer();
    }
  },
  _closeSearch : function () {
    if(this._historyService.getHash()==='#on_input'){
      ++this._step;
    }
    this._historyService.go(this._step*-1);
  },
  _getRecentKeywordByInitial : function (keyword) {
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
            .replace(new RegExp(keyword,'g'),'<span class="highlight-text">'+keyword+'</span>'),
          linkStr : this._recentlyKeywordListData[this._nowUser][i].keyword
        });
      }
    }
    return returnData;
  }


};
