/**
 * FileName: common.search.not-found.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.31
 */

Tw.CommonSearchNotFound = function (rootEl,svcInfo,surveyList,step,from,keywrod) {
  //this._cdn = cdn;
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._svcInfo = svcInfo;
  this._surveyList = surveyList;
  this._popupService = Tw.Popup;
  this._step = step;
  this._init(from,keywrod);
  /*
  HO_05_02_02_01_01.hbs : 검색 의견 신청 텍스트
  HO_05_02_02_01_02.hbs : 검새 의견 신청 선택
  * */
};

Tw.CommonSearchNotFound.prototype = {
  _init : function (from,keywrod) {
    this.$container.find('.request_keyword').on('click',$.proxy(this._showClaimPopup,this));
    this.$container.find('.icon-gnb-search').on('click',$.proxy(this._doSearch,this));
    this.$container.find('#search_keyword').on('keyup',$.proxy(this._inputKeyupEvt,this));
    this.$container.find('.close-area').on('click',$.proxy(this._closeSearch,this));
    this.$container.on('click','.search-element',$.proxy(this._keywordSearch,this));
    this.$popKeywordElement = this.$container.find('.cont-box.nogaps-hoz');
    if(from==='menu'){
      this._addRecentlyKeyword(keywrod);
    }
    new Tw.XtractorService(this.$container);
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
  _openAlert : function (alertObj,doRequest){
    this._popupService.openModalTypeATwoButton(alertObj.TITLE, null, null, alertObj.BUTTON,
      null,
      $.proxy(doRequest,this),
      null);
  },
  _showRequestKeyword : function () {
    this._popupService.open({
      hbs: 'HO_05_02_02_01_01',
      layer: true,
      data: null
    }, $.proxy(this._bindEventForRequestKeyword, this),
      //$.proxy(this._showAndHidePopKeywordList,this), 'requestKeyword');
      null, 'requestKeyword');
  },
  _showSelectClaim : function () {
    this._popupService.open({
      hbs: 'HO_05_02_02_01_02',
      layer: true,
      data: this._surveyList.invstQstnAnswItm
    }, $.proxy(this._bindEventForSelectClaim, this),
      //$.proxy(this._showAndHidePopKeywordList,this), 'selectClaim');
      null, 'selectClaim');
  },
  _bindEventForRequestKeyword : function(popupObj){
    //keyword request
    //this._showAndHidePopKeywordList();
    this.$requestKeywordPopup = $(popupObj);
    this.$requestKeywordPopup.on('click','.request_claim',$.proxy(this._openAlert,this,Tw.ALERT_MSG_SEARCH.ALERT_4_A40,this._requestKeyword));
    this.$requestKeywordPopup.on('keyup','.input-focus',$.proxy(this._activateRequestKeywordBtn,this));
  },
  _bindEventForSelectClaim : function(popupObj){
    //claim select
    //this._showAndHidePopKeywordList();
    this.$selectClaimPopup = $(popupObj);
    this.$selectClaimPopup.on('click','.request_claim',$.proxy(this._openAlert,this,Tw.ALERT_MSG_SEARCH.ALERT_4_A41,this._selectClaim));
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
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_08_0071, { ctt : this.$requestKeywordPopup.find('.input-focus').val() }, {}).
    done($.proxy(function (res) {
      this._claimCallback(res,52);
    }, this))
      .fail($.proxy(function (err) {
        this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.ERROR);
      }, this));
  },
  _selectClaim : function () {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_08_0072, { inqNum : this.$selectClaimPopup.find('input[name=r1]:checked', '#claim_list').val() }, {}).
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
    if(Tw.InputHelper.isEnter(evt)){
      this.$container.find('.icon-gnb-search').trigger('click');
    }
  },
  _doSearch : function () {
    var searchKeyword = this.$container.find('#search_keyword').val();
    if(Tw.FormatHelper.isEmpty(searchKeyword)){
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR);
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
  _closeSearch : function () {
    this._historyService.go(Number(this._step)*-1);
  },
  _showAndHidePopKeywordList : function () {
    if(this.$popKeywordElement.hasClass('none')){
      this.$popKeywordElement.removeClass('none');
    }else{
      this.$popKeywordElement.addClass('none');
    }
  },
  _keywordSearch : function (targetEvt) {
    targetEvt.preventDefault();
    var $currentTarget = $(targetEvt.currentTarget);
    this._addRecentlyKeyword($currentTarget.data('keyword'));
    this._historyService.goLoad($currentTarget.attr('href'));
  },
  _recognizeLastChar : function (keyword){
    if(Tw.FormatHelper.isEmpty(keyword)){
      return;
    }
    var endCharIdx = (keyword.charCodeAt(keyword.length-1) - parseInt('0xac00',16)) % 28;
    if(endCharIdx>0){
      this.$container.find('#suggest_comment').text('으'+this.$container.find('#suggest_comment').text());
    }
  }
};
