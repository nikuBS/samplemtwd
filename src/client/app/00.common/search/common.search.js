/**
 * FileName: common.search.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

Tw.CommonSearch = function (rootEl,searchInfo,svcInfo,cdn) {
    this._cdn = cdn;
    this.$container = rootEl;
    this._historyService = new Tw.HistoryService();
    this._svcInfo = svcInfo;
    this._searchInfo = searchInfo;
    this._accessKeyword = this._searchInfo.query;
    this._init(this._searchInfo);
};

Tw.CommonSearch.prototype = {
    _init : function (searchInfo) {
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
              continue;
          }
          if(keyName==='direct'){
              this.$container.find('.direct-element.home').data('link',Tw.OUTLINK.DIRECT_HOME);
          }
          this._showShortcutList(this._arrangeData(searchInfo.search[i][keyName].data,keyName),keyName,this._cdn);
        }
        this.$container.on('keyup','#keyword',$.proxy(this._inputChangeEvent,this));
        this.$container.on('click','.icon-historyback-40',$.proxy(this._historyService.goBack,this));
        this.$container.on('click','.close-area',$.proxy(this._historyService.goBack,this));
        this.$container.on('click','.search-element',$.proxy(this._searchRelatedKeyword,this));
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
        var inResult = this.$container.find('#resultsearch').is(':checked');
        if(args.keyCode===13){
            var requestUrl = inResult?'/common/search?keyword='+this._accessKeyword+'&in_keyword=':'/common/search?keyword=';
            this._addRecentlyKeyword(args.currentTarget.value);
            this._historyService.goLoad(requestUrl+args.currentTarget.value);
        }
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
        var keyword = $(targetEvt.currentTarget).data('param');
        var goUrl = '/common/search?keyword='+keyword;
        this._addRecentlyKeyword(keyword);
        this._historyService.goLoad(goUrl);
    },
    _goLink : function (linkEvt) {
        var $linkData = $(linkEvt.currentTarget);
        var linkUrl = $linkData.data('link');
        if(Tw.FormatHelper.isEmpty(linkUrl)){
            return;
        }
        //TODO User Click Ajax event call
        if($linkData.hasClass('direct-element')){
            Tw.CommonHelper.openUrlExternal(linkUrl);
        }else{
            this._historyService.goLoad(linkUrl);
        }
    }


};
