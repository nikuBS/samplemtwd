/**
 * FileName: common.search.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

Tw.CommonSearch = function (rootEl,searchInfo,svcInfo,cdn) {
    this._cdn = cdn;
    this.$container = rootEl;
    this._historyService = new Tw.HistoryService();
    //this._svcInfo = JSON.parse(svcInfo);
    this._svcInfo = svcInfo;
    //this._searchInfo = JSON.parse(this._decodeEscapeChar(searchInfo));
    this._searchInfo = searchInfo;
    this._accessKeyword = this._searchInfo.query;
    this._init(this._searchInfo);
    this.$container.on('keyup','#keyword',$.proxy(this._inputChangeEvent,this));
    this.$container.on('click','.icon-historyback-40',$.proxy(this._historyService.goBack,this));
};

Tw.CommonSearch.prototype = {
    _init : function (searchInfo) {
        var totalContentsCnt = 0;
        for(var i=0;i<searchInfo.search.length;i++){
          var keyName =  Object.keys(searchInfo.search[i])[0];
          var contentsCnt = Number(searchInfo.search[i][keyName].count);
            totalContentsCnt+=contentsCnt;
          if(keyName==='smart'||keyName==='immediate'||keyName==='banner'||contentsCnt<=0){
              if(contentsCnt<=0){
                  this.$container.find('.'+keyName).hide();
              }
              if(keyName==='banner'){
                  this._showBanner(this._arrangeData(searchInfo.search[i][keyName].data));
              }
              continue;
          }
          this._showShortcutList(this._arrangeData(searchInfo.search[i][keyName].data),keyName,this._cdn);
        }
    },

    _arrangeData : function (data) {
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
        //var $template = this.$container.find('#'+dataKey+'_template');
        var $template = $('#'+dataKey+'_template');
        var $list = this.$container.find('#'+dataKey+'_list');
        var shortcutTemplate = $template.html();
        var templateData = Handlebars.compile(shortcutTemplate);
        if(data.length<=0){
            $list.hide();
        }
         _.each(data,function (listData) {
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
        //TODO check banner data.
    },
    _addRecentlyKeyword : function (keyword) {
        var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage('recentlySearchKeyword'));
        if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
            //making recentlySearchKeyword
            Tw.CommonHelper.setLocalStorage('recentlySearchKeyword','{}');
            recentlyKeywordData = {};
        }
        if(Tw.FormatHelper.isEmpty(this._svcInfo)){
            //logout user's recentlySearchKeyword arr
            if(Tw.FormatHelper.isEmpty(recentlyKeywordData.logOutUser)){
                //making logout user's recentlySearchKeyword
                recentlyKeywordData.logOutUser = [];
            }
            recentlyKeywordData.logOutUser.push({ keyword : keyword, searchTime : moment().format('YY.M.D.')});
            while (recentlyKeywordData.logOutUser.length>10){
                recentlyKeywordData.logOutUser = recentlyKeywordData.logOutUser.shift();
            }
        }else{
            //login user
            if(Tw.FormatHelper.isEmpty(recentlyKeywordData[this._svcInfo.svcMgmtNum])){
                //makin loginuser's recentlySearchKeyword based on svcMgmtNum
                recentlyKeywordData[this._svcInfo.svcMgmtNum] = [];
            }
            recentlyKeywordData[this._svcInfo.svcMgmtNum].push({ keyword : keyword, searchTime : moment().format('YY.M.D.')});
            while (recentlyKeywordData[this._svcInfo.svcMgmtNum].length>10){
                recentlyKeywordData[this._svcInfo.svcMgmtNum].shift();
            }
        }
        Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(recentlyKeywordData));
    }

};
