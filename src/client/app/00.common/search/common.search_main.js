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
        this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
        this._recentlyKeywordListData = this._getRecentlyKeywordList();
        this._apiService = Tw.Api;
        this.$inputElement = this.$container.find('#search_input');
        this.$autoCompleteList = this.$container.find('#auto_complete_list');
        this.$autoCompletetTemplate = Handlebars.compile(this.$container.find('#auto_complete_template').html());
        this.$recentlyKeywordList = this.$container.find('#recently_keyword_list');
        this.$recentlyKeywordTemplate = Handlebars.compile(this.$container.find('#recently_keyword_template').html());
        this.$container.find('#recently_keyword_layer').hide();
        this.$container.find('.icon-gnb-search').on('click',$.proxy(this._searchByInputValue,this));
        this.$container.find('.search-element').on('click',$.proxy(this._searchByElement,this));
        this._recentlyKeywordInit();
        this._bindPopupElementEvt();
    },
    _keyInputEvt : function (inputEvtObj) {
        if(inputEvtObj.keyCode===13){
            this._searchByInputValue();
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
                this.$container.find('.search-element').on('click',$.proxy(this._searchByElement,this));
            },this));
    },
    _showAutoCompleteKeyword : function(data){
        this.$autoCompleteList.append(this.$autoCompletetTemplate({listData : this._convertAutoKeywordData(data.hkeyword)}));
    },
    _bindPopupElementEvt : function () {
        this.$container.find('.close-area').on('click',$.proxy(this._historyService.goBack,this));
        this.$inputElement.on('keyup',$.proxy(this._keyInputEvt,this));
        this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
        this.$container.on('click','.close',$.proxy(this._inputBlurEvt,this));

    },
    _convertAutoKeywordData : function (listStr) {
        var returnObj = {};
        returnObj.showStr =  listStr.substring(0,listStr.length-7);
        //var linkStr;
        returnObj.showStr = returnObj.showStr.replace('<font style=\'color:#CC33CC\'>','<span class="highlight-text">');
        returnObj.showStr = returnObj.showStr.replace('<font style=\'font-size:13px\'>','');
        returnObj.showStr = returnObj.showStr.replace('</font>','</span>');
        returnObj.linkStr = returnObj.showStr.replace('<span class="highlight-text">','').replace('</span>','');
        return returnObj;
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
    _removeRecentlyKeywordList : function (args) {
        var removeIdx = $(args.currentTarget).data('index');
        if(removeIdx==='all'){
            this._recentlyKeywordListData[this._nowUser] = [];
        }else{
            this._recentlyKeywordListData[this._nowUser].splice(removeIdx,1);
        }
        console.log(this._recentlyKeywordListData[this._nowUser]);
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
            $recentlyKeywordList.append($recentlyKeywordTemplate({data : data, index : index}));
        });
        Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(this._recentlyKeywordListData));
        this.$container.find('.remove-recently-list').on('click',$.proxy(this._removeRecentlyKeywordList,this));
    },
    _addRecentlyKeywordList : function (keyword) {
        console.log('_addRecentlyKeywordList called keyword : '+keyword);
        this._recentlyKeywordListData[this._nowUser].push({ keyword : keyword, searchTime : moment().format('YY.M.D.')});
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
        var searchKeyword = this.$container.find('#search_keyword').val();
        if(Tw.FormatHelper.isEmpty(searchKeyword)||searchKeyword.length<=0){
            searchKeyword = this.$container.find('#selected_keyword').val();
        }
        this._doSearch(searchKeyword);
    },
    _searchByElement : function(linkEvt){
        var param = $(linkEvt.currentTarget).data('param');
        this._doSearch(param);
    },
    _doSearch : function (searchKeyword) {
        this._addRecentlyKeywordList(searchKeyword);
        this._historyService.goLoad('/common/search?keyword='+searchKeyword);
    }


};
