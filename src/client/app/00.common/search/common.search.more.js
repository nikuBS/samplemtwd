/**
 * FileName: common.search.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

Tw.CommonSearchMore = function (rootEl,searchInfo,svcInfo,cdn,accessQuery,step,nowUrl) {
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
  this._accessKeyword = this._searchInfo.query;
  this._category = accessQuery.category;
  this._nowUrl = nowUrl;
  this._init(this._searchInfo,accessQuery.category);
};
Tw.CommonSearchMore.prototype = new Tw.CommonSearch();
Tw.CommonSearchMore.prototype.constructor = Tw.CommonSearchMain;
$.extend(Tw.CommonSearchMore.prototype,
{
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
  _pageChange : function (eventObj) {
    //this._historyService.goLoad(eventObj.currentTarget.value);
    this._moveUrl(eventObj.currentTarget.value);
  },
  _doSearch : function (evt) {
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
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,closeCallback,null,$(evt.currentTarget));
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
  _showSelectFilter : function (evt) {
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
      'select_filter',$(evt.currentTarget));
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
  }

});
