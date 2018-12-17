/**
 * FileName: common.search.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

Tw.CommonSearchMore = function (rootEl,searchInfo,category) {

    this.$container = rootEl;
    //this._category = category;
    this._historyService = new Tw.HistoryService();
    this._searchInfo = JSON.parse(this._decodeEscapeChar(searchInfo));
    this._init(this._searchInfo,category);
};

Tw.CommonSearchMore.prototype = {
    _init : function (searchInfo,category) {
        if(searchInfo.search.length<=0){

            return;
        }
        this._listData =this._arrangeData(searchInfo.search[0][category].data);
        this._showShortcutList(this._listData,this.$container.find('#'+category+'_template'),this.$container.find('#'+category+'_list'));
        this.$container.on('keyup','#keyword',$.proxy(this._inputChangeEvent,this));
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
    _showShortcutList : function (data,template,parent) {
        var shortcutTemplate = template.html();
        var templateData = Handlebars.compile(shortcutTemplate);
        if(data.length<=0){
            parent.hide();
        }
         _.each(data,function (listData) {
             parent.append(templateData({listData : listData}));
         });
    },
    _decodeEscapeChar : function (targetString) {
        var returnStr = targetString.replace(/\\/gi,'/');
        returnStr = returnStr.replace(/\n/g,'');
        return returnStr;
    },
    _inputChangeEvent : function (args) {
        if(args.keyCode===13){
            var requestUrl = '/common/search?keyword='+args.currentTarget.value;
            this._historyService.goLoad(requestUrl);
        }
    }
};
