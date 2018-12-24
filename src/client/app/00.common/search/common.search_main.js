/**
 * FileName: common.search_main.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.18
 */

Tw.CommonSearchMain = function (rootEl) {
    this.$container = rootEl;
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
        this.$container.find('#recently_keyword_layer').hide();
    },
    _keyInputEvt : function (args) {
        this._selectShowLayer();
        if(this.$inputElement.val().trim().length<=0){
            return;
        }
        var requestParam = { query : this.$inputElement.val() };
        this._apiService.requestAjax(Tw.AJAX_CMD.TEST_AUTO_COMPLETE,requestParam)
            .done($.proxy(function (res) {
                this.$autoCompleteList.empty();
                if(res.responsestatus===0&&res.result.length>0){
                    _.each(res.result[0].items,$.proxy(this._showAutoCompleteKeyword,this));
                }
            },this));
    },
    _showAutoCompleteKeyword : function(data){
        this.$autoCompleteList.append(this.$autoCompletetTemplate({listData : this._convertAutoKeywordData(data.hkeyword)}));
    },
    _bindPopupElementEvt : function () {
        this.$container.find('.close-area').on('click',$.proxy(this._historyService.goBack,this));
        this.$container.find('#clear_recently_list').on('click',$.proxy(this._clearRecentlyKeywrodList,this));
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
    _clearRecentlyKeywrodList : function () {
        console.log('_clearRecentlyKeywrodList ');
    }
};
