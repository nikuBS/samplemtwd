/**
 * FileName: common.search_main.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.18
 */

Tw.CommonSearchMain = function (rootEl,svcInfo) {
    this.$container = rootEl;
    this._svcInfo = svcInfo;
    this._init();
};

Tw.CommonSearchMain.prototype = {
    _init : function () {
        this._historyService = new Tw.HistoryService();
        this._apiService = Tw.Api;
        this.$inputElement = this.$container.find('#search_input');
        this._bindPopupElementEvt();
        this.$autoCompleteList = this.$container.find('#auto_complete_list');
        this.$autoCompletetTemplate = Handlebars.compile(this.$container.find('#auto_complete_template').html());
        this.$recentlyKeywordList = this.$container.find('#recently_keyword_list');
        this.$recentlyKeywordTemplate = Handlebars.compile(this.$container.find('#recently_keyword_template').html());
        this._recentlryKeywordInit();
        this.$container.find('#recently_keyword_layer').hide();
    },
    _keyInputEvt : function (inputEvtObj) {
        if(inputEvtObj.keyCode===13){
            this._addRecentlyKeyword(inputEvtObj.currentTarget.value);
            this._historyService.goLoad('/common/search?keyword='+inputEvtObj.currentTarget.value);
            return;
        }
        this._selectShowLayer();
        if(this.$inputElement.val().trim().length<=0){
            return;
        }
        var requestParam = { query : this.$inputElement.val() };
        this._apiService.requestAjax(Tw.AJAX_CMD.SEARCH_AUTO_COMPLETE,requestParam)
            .done($.proxy(function (res) {
                this.$autoCompleteList.empty();
                if(res.code===0&&res.result.length>0){
                    _.each(res.result[0].items,$.proxy(this._showAutoCompleteKeyword,this));
                }
            },this));
    },
    _showAutoCompleteKeyword : function(data){
        this.$autoCompleteList.append(this.$autoCompletetTemplate({listData : this._convertAutoKeywordData(data.hkeyword)}));
    },
    _bindPopupElementEvt : function () {
        this.$container.find('.close-area').on('click',$.proxy(this._historyService.goBack,this));
        this.$container.find('#clear_recently_list').on('click',$.proxy(this._removeRecentlyKeywrodList,this));
        this.$inputElement.on('keyup',$.proxy(this._keyInputEvt,this));
        this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
        this.$container.on('click','#blind_layer',$.proxy(this._inputBlurEvt,this));

    },
    _convertAutoKeywordData : function (listStr) {
        var returnStr =  listStr.substring(0,listStr.length-7);
        returnStr = returnStr.replace('<font style=\'color:#CC33CC\'>','<span class="highlight-text">');
        returnStr = returnStr.replace('<font style=\'font-size:13px\'>','');
        returnStr = returnStr.replace('</font>','</span>');
        return returnStr;
    },
    _inputFocusEvt : function () {
        this.$container.find('#blind_layer').css('display','block');
        this._selectShowLayer();
    },
    _inputBlurEvt : function () {
        this.$container.find('#blind_layer').css('display','none');
        this.$container.find('#recently_keyword_layer').hide();
    },
    _selectShowLayer : function () {
        if(this.$inputElement.val().trim().length<=0){
            this.$container.find('#recently_keyword_layer').show();
            this.$container.find('#auto_complete_layer').hide();
        }else{
            this.$container.find('#recently_keyword_layer').hide();
            this.$container.find('#auto_complete_layer').show();
        }
    },
    _removeRecentlyKeywrodList : function (index) {
        //TODO
    },
    _recentlryKeywordInit : function () {
        var $recentlyKeywordList = this.$recentlyKeywordList;
        var $recentlyKeywordTemplate = this.$recentlyKeywordTemplate;
        var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage('recentlySearchKeyword'));
        var nowUserData;
        if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
            return;
        }
        if(Tw.FormatHelper.isEmpty(this._svcInfo)){
            nowUserData = recentlyKeywordData.logOutUser;
        }else{
            nowUserData = recentlyKeywordData[this._svcInfo.svcMgmtNum];
        }
        _.each(nowUserData,function (data) {
            $recentlyKeywordList.append($recentlyKeywordTemplate({data : data}));
        });
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
