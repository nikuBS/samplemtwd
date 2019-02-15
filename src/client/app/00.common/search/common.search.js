/**
 * FileName: common.search.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

Tw.CommonSearch = function (rootEl,searchInfo,svcInfo,cdn,step,from) {
  this._cdn = cdn;
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._svcInfo = svcInfo;
  this._searchInfo = searchInfo;
  this._step = Tw.FormatHelper.isEmpty(step)?1:step;
  this._accessKeyword = this._searchInfo.query;
  this._init(this._searchInfo,from);
};

Tw.CommonSearch.prototype = {
  _init : function (searchInfo,from) {
    if(from==='menu'&&this._historyService.isReload()===false){
      this._addRecentlyKeyword(this._accessKeyword);
    }
    if(searchInfo.totalcount===0){
      return;
    }
    var keyName,contentsCnt;
    for(var i=0;i<searchInfo.search.length;i++){
      keyName =  Object.keys(searchInfo.search[i])[0];
      contentsCnt = Number(searchInfo.search[i][keyName].count);
      if(keyName==='smart'||keyName==='immediate'||keyName==='banner'||contentsCnt<=0){
        if(contentsCnt<=0){
          this.$container.find('.'+keyName).hide();
        }
        if(keyName==='banner'){
          this._showBanner(this._arrangeData(searchInfo.search[i][keyName].data,keyName));
        }
        if(keyName==='immediate'&&searchInfo.search[i][keyName].data[0]&&searchInfo.search[i][keyName].data[0].DOCID==5){
          this._showBarcode(searchInfo.search[i][keyName].data[0].barcode,this.$container.find('#membership-barcode'));
        }
        continue;
      }
      // if(keyName==='direct'){
      //   this.$container.find('.direct-element.home').data('link',Tw.OUTLINK.DIRECT_HOME);
      // }
      this._showShortcutList(this._arrangeData(searchInfo.search[i][keyName].data,keyName),keyName,this._cdn);
    }
    this.$inputElement =this.$container.find('#keyword');
    this.$container.on('keyup','#keyword',$.proxy(this._inputChangeEvent,this));
    this.$container.on('click','.icon-historyback-40',$.proxy(this._historyService.goBack,this));
    this.$container.on('click','.close-area',$.proxy(this._closeSearch,this));
    this.$container.on('click','.search-element',$.proxy(this._searchRelatedKeyword,this));
    this.$container.on('click','.list-data',$.proxy(this._goLink,this));
    this.$container.on('click','.icon-gnb-search',$.proxy(this._doSearch,this));
    this.$container.find('#contents').removeClass('none');
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
          if(data[i][key].charAt(0)==='|'){
            data[i][key] = data[i][key].replace('|','');
          }
          data[i][key] = data[i][key].replace(/\|/g,' > ').replace(/MyT/g,' my T ');
        }
        if(key==='MENU_URL'){
          data[i][key] = data[i][key].replace('https://app.tworld.co.kr','');
        }
        if(category==='prevent'&&key==='DOCID'){
          data[i][key] = Number(data[i][key].replace(/[A-Za-z]/g,''));
        }
        if(category==='direct'&&key==='ALIAS'){
          if(data[i][key]==='shopacc'){
            data[i].linkUrl = Tw.OUTLINK.DIRECT_ACCESSORY+'?CATEGORY_ID='+data[i].CATEGORY_ID+'&ACCESSORY_ID=';
          }else{
            data[i].linkUrl = Tw.OUTLINK.DIRECT_MOBILE+'?PRODUCT_GRP_ID=';
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
  _showBarcode : function (barcodNum,$barcodElement) {
    $barcodElement.JsBarcode(Tw.FormatHelper.addCardDash(barcodNum),{background : '#edeef0',height : 60});
  },
  _showShortcutList : function (data,dataKey,cdn) {
    var $template = $('#'+dataKey+'_template');
    var $list = this.$container.find('#'+dataKey+'_list');
    var shortcutTemplate = $template.html();
    var templateData = Handlebars.compile(shortcutTemplate);
    if(data.length<=0){
      $list.hide();
    }
    _.each(data,function (listData,index) {
      if(index>=3){
        return;
      }
      $list.append(templateData({listData : listData , CDN : cdn}));
    });
  },
  _decodeEscapeChar : function (targetString) {
    var returnStr = targetString.replace(/\\/gi,'/').replace(/\n/g,'');
    return returnStr;
  },
  _inputChangeEvent : function (args) {
    if(args.keyCode===13){
      this._doSearch();
    }
  },
  _doSearch : function () {
    var keyword = this.$inputElement.val();
    if(Tw.FormatHelper.isEmpty(keyword)){
      this._popupService.openAlert(Tw.ALERT_MSG_SEARCH.KEYWORD_ERR);
      return;
    }
    var inResult = this.$container.find('#resultsearch').is(':checked');
    var requestUrl = inResult?'/common/search/in-result?keyword='+this._accessKeyword+'&in_keyword=':'/common/search?keyword=';
    requestUrl+=keyword;
    requestUrl+='&step='+(Number(this._step)+1);
    this._addRecentlyKeyword(keyword);
    this._historyService.goLoad(requestUrl);
  },
  _showBanner : function (data) {
    var bannerPositionObj = {
      AGN	 : 'as',
      APP	: 'app',
      BENF : 'sale',
      CUG	 : 'manner',
      EVT	 : 'event',
      FAQ	: 'question',
      FEE	: 'rate',
      IUG	: 'siteInfo',
      MBR	: 'membership',
      NOTI : 'notice',
      ROM	: 'raoming',
      SVC	: 'service',
      TWD	: 'direct',
      VUG	: 'serviceInfo',
      WIRE : 'tv'
    };
    var bannerTemplate = Handlebars.compile($('#banner_template').html());
    _.each(data,$.proxy(function (bannerData) {
      this.$container.find('.cont-box.list.'+bannerPositionObj[bannerData.SUBM_MENU_ID1])
        .after(bannerTemplate({listData : bannerData, CDN : this._cdn}));
    },this));

  },
  _addRecentlyKeyword : function (keyword) {
    var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage('recentlySearchKeyword'));
    var userId = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
      //making recentlySearchKeyword
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
    targetEvt.preventDefault();
    var keyword = $(targetEvt.currentTarget).data('param');
    var goUrl = '/common/search?keyword='+keyword+'&step='+(Number(this._step)+1);
    this._addRecentlyKeyword(keyword);
    this._historyService.goLoad(goUrl);
  },
  _goLink : function (linkEvt) {
    linkEvt.preventDefault();
    var $linkData = $(linkEvt.currentTarget);
    var linkUrl = $linkData.attr('href');
    if(Tw.FormatHelper.isEmpty(linkUrl)){
      return;
    }
    if(!$linkData.hasClass('home')){
      this._apiService.request(Tw.API_CMD.STACK_SEARCH_USER_CLICK,
        {
          'docId' : $linkData.data('id'),
          'section' : $linkData.data('category'),
          'title' : encodeURI($linkData.data('tit')),
          'keyword' : encodeURI(this._searchInfo.researchQuery)
        }
      );
    }
    if(linkUrl.indexOf('BPCP')>-1){
      this._getBPCP(linkUrl);
    }else if($linkData.hasClass('direct-element')){
      Tw.CommonHelper.openUrlExternal(linkUrl);
    }else{
      this._historyService.goLoad(linkUrl);
    }

  },
  _closeSearch : function () {
    this._historyService.go(Number(this._step)*-1);
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

    Tw.CommonHelper.openUrlInApp(url);
  }


};
