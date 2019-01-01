/**
 * FileName: common.search.not_found.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.31
 */

Tw.CommonSearchNotFound = function (rootEl,svcInfo,surveyList) {
    //this._cdn = cdn;
    this.$container = rootEl;
    this._historyService = new Tw.HistoryService();
    this._svcInfo = svcInfo;
    this._surveyList = surveyList;
    this._popupService = Tw.Popup;
    this._init();
    /*
    HO_05_02_02_01_01.hbs : 검색 의견 신청 텍스트
    HO_05_02_02_01_02.hbs : 검새 의견 신청 선택
    * */
};

Tw.CommonSearchNotFound.prototype = {
    _init : function () {
        this.$container.find('.request_keyword').on('click',$.proxy(this._showClaimPopup,this));
    },
    _showClaimPopup : function(btnEvt){
        if($(btnEvt.currentTarget).attr('data-type')==='B'){
            this._showRequestKeyword();
        }else{
            this._showSelectClaim();
        }
    },
    _showRequestKeyword : function () {
        this._popupService.open({
            hbs: 'HO_05_02_02_01_01',
            layer: true,
            data: null
        }, $.proxy(this._bindEventForRequestKeyword, this), null, 'requestKeyword');
    },
    _showSelectClaim : function () {
        this._popupService.open({
            hbs: 'HO_05_02_02_01_02',
            layer: true,
            data: this._surveyList.invstQstnAnswItm
        }, $.proxy(this._bindEventForSelectClaim, this), null, 'selectClaim');
    },
    _bindEventForRequestKeyword : function(popupObj){
        //keyword request
        console.log(popupObj);
        this.$requestKeywordPopup = $(popupObj);
        this.$requestKeywordPopup.on('click','.request_claim',$.proxy(this._requestKeyword,this));
        this.$requestKeywordPopup.on('keyup','.input-focus',$.proxy(this._activateRequestKeywordBtn,this));
    },
    _bindEventForSelectClaim : function(popupObj){
        //claim select
        this.$selectClaimPopup = $(popupObj);
        this.$selectClaimPopup.on('click','.request_claim',$.proxy(this._selectClaim,this));
        this.$selectClaimPopup.on('click','.custom-form>input',$.proxy(this._activateSelectClaimBtn,this));
    },
    _activateRequestKeywordBtn : function(inputEvt){
        if($(inputEvt.currentTarget).val().length>0){
            this.$requestKeywordPopup.find('.request_claim').removeAttr('disabled');
        }else{
            this.$requestKeywordPopup.find('.request_claim').attr('disabled','disabled');
        }
    },
    _activateSelectClaimBtn : function(){
        this.$selectClaimPopup.find('.request_claim').removeAttr('disabled');
    },
    _requestKeyword : function (args) {
        console.log(args);
    },
    _selectClaim : function (args) {
        console.log(args);
    }


};
