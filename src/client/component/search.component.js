/**
 * FileName: common.search.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

Tw.SearchComponent = function () {
  this._apiService = Tw.Api;
  this._getKeywordData();
  this._init();
  this._popupService = Tw.Popup;
  this.$popupLayerContainer;
  $('.icon-gnb-search').on('click',$.proxy(this._showSearch,this));
};

Tw.SearchComponent.prototype = {
    _init : function () {
        console.log('SearchComponent init called');
        $(window).on('hashchange', $.proxy(this._checkAndClose, this));
    },
    _showSearch : function () {
        this._popupService.open({
            hbs: 'test_search',
            layer: true,
            data : {
                recommendKeywordData : this._recommendKeywordData,
                famousKeywordData : this._famousKeywordData
    }
        },$.proxy(this._bindInputEvt,this),null, 'search');
    },
    _checkAndClose : function () {
        if (window.location.hash.indexOf('search_P') === -1) {
            this._popupService.close();
        }else{
            this._showSearch();
        }
    },
    _getRecommendKeyword : function (apiService) {
        return new Promise(function (resolve,reject) {

               console.log('_getRecentlyKeyword ');
               //Tw.API_CMD.BFF_08_0066

                var requestParam = { 'mblOsTypCd' : 'A'};
                var testRequestReturn = {
                    'code': '00',
                    'msg': 'success',
                    'result':
                        {
                            'keywordNm': '전국민 무한2',
                            'keywordDs': '전국민 무제한2'
                        }
                };
               console.log(testRequestReturn);
               resolve(testRequestReturn);

        });
    },
    _getFamousKeyword : function (apiService) {
        return new Promise(function (resolve,reject) {
                console.log('_getFamousKeyword ');
                var requestParam = { 'range' : 'D' };
                var testRequestReturn = apiService.requestAjax(Tw.AJAX_CMD.TEST_GET_FAMOUS_KEYWORD, requestParam);
                console.log(testRequestReturn);
                resolve(testRequestReturn);

        });
    },
    _getKeywordData : function () {
        Promise.all([this._getRecommendKeyword(this._apiService), this._getFamousKeyword(this._apiService)])
        .then($.proxy(this._promiseSuccess,this));
    },
    _bindInputEvt : function (args) {
        this.$popupLayerContainer = args;
        args.find('#search_input').on('keyup',$.proxy(this._keyInputEvt,this));
    },
    _promiseSuccess : function (values) {
        this._recommendKeywordData = values[0].result.keywordNm;
        this._famousKeywordData = values[1].Data.Query;
    },
    _keyInputEvt : function (args) {
        this.$popupLayerContainer.find('#autocomplete_list').empty();
        var requestParam = { query : args.currentTarget.value };
        this._apiService.requestAjax(Tw.AJAX_CMD.TEST_AUTO_COMPLETE,requestParam)
            .done($.proxy(function (res) {
                console.log(res);
                console.log(res.result);
                console.log(res.result.length);
                if(res.responsestatus===0&&res.result.length>0){
                    _.each(res.result[0].items,$.proxy(this._showAutoCompleteKeyword,this));
                }
            },this));
    },
    _showAutoCompleteKeyword : function(data){
        console.log(data);
        this.$popupLayerContainer.find('#autocomplete_list').append('<li>'+data.hkeyword+'</li>');
    }

};
