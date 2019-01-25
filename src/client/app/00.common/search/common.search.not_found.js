/**
 * FileName: common.search.not_found.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.31
 */

Tw.CommonSearchNotFound = function (rootEl,svcInfo,surveyList,step) {
  //this._cdn = cdn;
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._svcInfo = svcInfo;
  this._surveyList = surveyList;
  this._popupService = Tw.Popup;
  this._step = step;
  this._init();
  /*
  HO_05_02_02_01_01.hbs : 검색 의견 신청 텍스트
  HO_05_02_02_01_02.hbs : 검새 의견 신청 선택
  * */
};

Tw.CommonSearchNotFound.prototype = {
  _init : function () {
    this.$container.find('.request_keyword').on('click',$.proxy(this._showClaimPopup,this));
    this.$container.find('.icon-gnb-search').on('click',$.proxy(this._doSearch,this));
    this.$container.find('#search_keyword').on('keyup',$.proxy(this._inputKeyupEvt,this));
    this.$container.find('.close-area').on('click',$.proxy(this._closeSearch,this));
    this.$container.on('click','.search-element',$.proxy(this._searchRelatedKeyword,this));
    this.$popKeywordElement = this.$container.find('.cont-box.nogaps-hoz');
  },
  _showClaimPopup : function(btnEvt){
    //var $selectedClaim = $(btnEvt.currentTarget);
    //$selectedClaim.parents('.opinion-selectbox').addClass('selected');
    if($(btnEvt.currentTarget).data('type')===52){
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
    }, $.proxy(this._bindEventForRequestKeyword, this),
      $.proxy(this._showAndHidePopKeywordList,this), 'requestKeyword');
  },
  _showSelectClaim : function () {
    this._popupService.open({
      hbs: 'HO_05_02_02_01_02',
      layer: true,
      data: this._surveyList.invstQstnAnswItm
    }, $.proxy(this._bindEventForSelectClaim, this),
      $.proxy(this._showAndHidePopKeywordList,this), 'selectClaim');
  },
  _bindEventForRequestKeyword : function(popupObj){
    //keyword request
    this._showAndHidePopKeywordList();
    this.$requestKeywordPopup = $(popupObj);
    this.$requestKeywordPopup.on('click','.request_claim',$.proxy(this._requestKeyword,this));
    this.$requestKeywordPopup.on('keyup','.input-focus',$.proxy(this._activateRequestKeywordBtn,this));
  },
  _bindEventForSelectClaim : function(popupObj){
    //claim select
    this._showAndHidePopKeywordList();
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
  _requestKeyword : function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0070, { ctt : this.$requestKeywordPopup.find('.input-focus').val() }, {}).
    done($.proxy(function (res) {
      this._claimCallback(res,52);
    }, this))
      .fail($.proxy(function (err) {
        this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.ERROR);
      }, this));
  },
  _selectClaim : function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0071, { inqNum : this.$selectClaimPopup.find('input[name=r1]:checked', '#claim_list').val() }, {}).
    done($.proxy(function (res) {
      this._claimCallback(res,51);
    }, this))
    .fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.ERROR);
    }, this));
  },
  _claimCallback : function (res,srchId) {
    if(res.code===Tw.API_CODE.CODE_00){
      var $selectedEl = this.$container.find('.opinion-selectbox');
      $selectedEl.each(function (idx) {
        if($selectedEl.eq(idx).data('type')===srchId){
          $selectedEl.eq(idx).children('.btn').hide();
          $selectedEl.eq(idx).removeClass();
        }
      });
      this._popupService.close();
    }else{
      this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.ERROR);
    }
  },
  _inputKeyupEvt : function (evt) {
    if(evt.keyCode===13){
      this.$container.find('.icon-gnb-search').trigger('click');
    }
  },
  _doSearch : function () {
    var searchKeyword = this.$container.find('#search_keyword').val();
    if(searchKeyword.length<=0){
      return;
    }
    this._addRecentlyKeyword(searchKeyword);
    this._historyService.goLoad('/common/search?keyword='+searchKeyword+'&step='+(Number(this._step)+1));
  },
  _addRecentlyKeyword : function (keyword) {
    var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage('recentlySearchKeyword'));
    var userId = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
      //making recentlySearchKeyword
      //Tw.CommonHelper.setLocalStorage('recentlySearchKeyword','{}');
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
  _closeSearch : function () {
    this._historyService.go(Number(this._step)*-1);
  },
  _showAndHidePopKeywordList : function () {
    if(this.$popKeywordElement.hasClass('none')){
      this.$popKeywordElement.removeClass('none');
    }else{
      this.$popKeywordElement.addClass('none');
    }
  }


};
