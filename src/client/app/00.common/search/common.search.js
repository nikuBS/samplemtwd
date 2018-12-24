/**
 * FileName: common.search.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

Tw.CommonSearch = function (rootEl,searchInfo,svcInfo) {
    console.log('svcInfo test');
    console.log(svcInfo);
    this.$container = rootEl;
    this._historyService = new Tw.HistoryService();
    this._svcInfo = JSON.parse(svcInfo);
    this._searchInfo = JSON.parse(this._decodeEscapeChar(searchInfo));
    this._accessKeyword = this._searchInfo.query;
    this._init(this._searchInfo);
    this.$container.on('keyup','#keyword',$.proxy(this._inputChangeEvent,this));
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
          this._showShortcutList(this._arrangeData(searchInfo.search[i][keyName].data),keyName);
        }

        if(totalContentsCnt<=0){
            //TODO 결과없음 화면 출력
        }else{
            var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage('recentlySearchKeyword'));
            console.log('recentlyKeywordData test');
            console.log(typeof(recentlyKeywordData));
            console.log(JSON.stringify(recentlyKeywordData));

            if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
                Tw.CommonHelper.setLocalStorage('recentlySearchKeyword','{}');
                recentlyKeywordData = {};
            }
            if(Tw.FormatHelper.isEmpty(this._svcInfo)){
                console.log('logOutUser');
                if(Tw.FormatHelper.isEmpty(recentlyKeywordData.logOutUser)){
                    recentlyKeywordData.logOutUser = [];
                }
                console.log(recentlyKeywordData.logOutUser);
                //TODO 시간추가
                recentlyKeywordData.logOutUser.push({ keyword : this._accessKeyword, searchTime : moment().format('YYYYMMDD')});
                console.log(recentlyKeywordData);
            }else{
                console.log('loginUser : '+this._svcInfo.svcMgmtNum);
                if(Tw.FormatHelper.isEmpty(recentlyKeywordData[this._svcInfo.svcMgmtNum])){
                    console.log('make this users data');
                    recentlyKeywordData[this._svcInfo.svcMgmtNum] = [];
                }
                console.log(recentlyKeywordData[this._svcInfo.svcMgmtNum]);
                //TODO 시간추가
                //TODO keyword user encoding
                recentlyKeywordData[this._svcInfo.svcMgmtNum].push({ keyword : this._accessKeyword, searchTime : moment().format('YYYYMMDD')});
                console.log(recentlyKeywordData);
            }
            Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(recentlyKeywordData));
        }
    },

    _arrangeData : function (data) {
        if(!data){
            return [];
        }
        for(var i=0;i<data.length;i++){
            for (var key in data[i]) {
                if(typeof (data[i][key])==='string'){
                    data[i][key] = data[i][key].replace('<!HE>', '</span>');
                    data[i][key] = data[i][key].replace('<!HS>', '<span class="highlight-text">');
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
    _showShortcutList : function (data,dataKey) {
        //var $template = this.$container.find('#'+dataKey+'_template');
        var $template = $('#'+dataKey+'_template');
        var $list = this.$container.find('#'+dataKey+'_list');
        var shortcutTemplate = $template.html();
        var templateData = Handlebars.compile(shortcutTemplate);
        if(data.length<=0){
            $list.hide();
        }
         _.each(data,function (listData) {
             $list.append(templateData({listData : listData}));
         });
    },
    _decodeEscapeChar : function (targetString) {
        var returnStr = targetString.replace(/\\/gi,'/');
        returnStr = returnStr.replace(/\n/g,'');
        return returnStr;
    },
    _inputChangeEvent : function (args) {
        var inResult = this.$container.find('#oka').is(':checked');
        if(args.keyCode===13){
            var requestUrl = inResult?'/common/search/in_result?pkeyword='+this._accessKeyword+'&ckeyword=':'/common/search?keyword=';
            this._historyService.goLoad(requestUrl+args.currentTarget.value);
        }
    },
    _showBanner : function (data) {
        //TODO check banner data.
    }
};
