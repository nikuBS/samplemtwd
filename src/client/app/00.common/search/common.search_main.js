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
        this._bindPopupElementEvt();
        this.$autoCompleteList = this.$container.find('#autocomplete_list');
    },




    _keyInputEvt : function (args) {
        this.$autoCompleteList.empty();
        var requestParam = { query : args.currentTarget.value };
        this._apiService.requestAjax(Tw.AJAX_CMD.TEST_AUTO_COMPLETE,requestParam)
            .done($.proxy(function (res) {
                if(res.responsestatus===0&&res.result.length>0){
                    _.each(res.result[0].items,$.proxy(this._showAutoCompleteKeyword,this));
                }
            },this));
    },
    _showAutoCompleteKeyword : function(data){
        console.log(data);
        this.$autoCompleteList.append('<li>'+data.hkeyword+'</li>');
    },
    _bindPopupElementEvt : function () {
        this.$container.find('.popup-closeBtn').on('click',$.proxy(this._historyService.goBack,this));
        this.$container.find('#search_input').on('keyup',$.proxy(this._keyInputEvt,this));
    }
};
