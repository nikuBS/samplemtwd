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
    this._platForm = Tw.BrowserHelper.isApp()?'app':'web';
    this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    this.$container.find('.request_keyword').on('click',$.proxy(this._showClaimPopup,this));
    this.$container.find('.icon-gnb-search').on('click',$.proxy(this._doSearch,this));
    this.$container.find('#search_keyword').on('keyup',$.proxy(this._inputKeyupEvt,this));
    this.$container.find('#search_keyword').on('focus',$.proxy(this._inputFocusEvt,this));
    this.$container.find('.close-area').on('click',$.proxy(this._closeSearch,this));
    this.$container.on('click','.search-element',$.proxy(this._keywordSearch,this));
    this.$popKeywordElement = this.$container.find('.cont-box.nogaps-hoz');
    this.$inputElement = this.$container.find('#search_keyword');
    this._recentKeywordInit();
    this._recentKeywordTemplate = Handlebars.compile($('#recently_keyword_template').html());
    this._autoCompleteKeywrodTemplate = Handlebars.compile($('#auto_complete_template').html());
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
      $.proxy(this._removeInputDisabled,this), 'requestKeyword');
  },
  _showSelectClaim : function () {
    this._popupService.open({
      hbs: 'HO_05_02_02_01_02',
      layer: true,
      data: this._surveyList.invstQstnAnswItm
    }, $.proxy(this._bindEventForSelectClaim, this),
      //$.proxy(this._showAndHidePopKeywordList,this), 'selectClaim');
      $.proxy(this._removeInputDisabled,this), 'selectClaim');
  },
  _bindEventForRequestKeyword : function(popupObj){
    //keyword request
    //this._showAndHidePopKeywordList();
    this.$inputElement.attr('disabled','disabled');
    this.$requestKeywordPopup = $(popupObj);
    this.$requestKeywordPopup.on('click','.request_claim',$.proxy(this._openAlert,this,Tw.ALERT_MSG_SEARCH.ALERT_4_A40,this._requestKeyword));
    this.$requestKeywordPopup.on('keyup','.input-focus',$.proxy(this._activateRequestKeywordBtn,this));
    this.$requestKeywordPopup.on('click','.cancel',$.proxy(this._activateRequestKeywordBtn,this));
  },
  _bindEventForSelectClaim : function(popupObj){
    //claim select
    //this._showAndHidePopKeywordList();
    this.$inputElement.attr('disabled','disabled');
    this.$selectClaimPopup = $(popupObj);
    this.$selectClaimPopup.on('click','.request_claim',$.proxy(this._openAlert,this,Tw.ALERT_MSG_SEARCH.ALERT_4_A41,this._selectClaim));
    this.$selectClaimPopup.on('click','.custom-form>input',$.proxy(this._activateSelectClaimBtn,this));
  },
  _removeInputDisabled : function(){
    this.$inputElement.removeAttr('disabled');
  },
  _activateRequestKeywordBtn : function(inputEvt){
    var $inputEvt = $(inputEvt.currentTarget);
    var inputLength = $inputEvt.val().length;
    this.$requestKeywordPopup.find('.byte-current').text(inputLength);
    if(inputLength>0){
      this.$requestKeywordPopup.find('.request_claim').removeAttr('disabled');
    }else{
      this.$requestKeywordPopup.find('.request_claim').attr('disabled','disabled');
    }
    this._validateMaxLength($inputEvt);
  },
  _validateMaxLength : function ($inputEvt) {
    var maxLength = $inputEvt.attr('maxlength');
    var nowTargetVal = $inputEvt.val();
    if(nowTargetVal.length>maxLength){
      $inputEvt.val(nowTargetVal.substring(0,maxLength));
      $inputEvt.blur();
      setTimeout(function () {
        $inputEvt.focus();
      });
    }
    this.$requestKeywordPopup.find('.byte-current').text($inputEvt.val().length);
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
          $selectedEl.eq(idx).children('.text').text(Tw.ALERT_MSG_SEARCH.REQUEST_CLAIM);
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
    }else{
      if(this._historyService.getHash()==='#input_P'){
        if(this.$inputElement.val().trim().length>0){
          this._getAutoCompleteKeyword();
        }else{
          this._showRecentKeyworList();
        }
      }
    }
  },
  _doSearch : function () {
    var searchKeyword = this.$container.find('#search_keyword').val();
    if(Tw.FormatHelper.isEmpty(searchKeyword)){
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR);
      return;
    }
    this._addRecentlyKeyword(searchKeyword);
    this._moveUrl('/common/search?keyword='+searchKeyword+'&step='+(Number(this._step)+1));
  },
  _addRecentlyKeyword : function (keyword) {
    this._recentKeyworList[this._nowUser].push({
      keyword : keyword, searchTime : moment().format('YY.M.D.'),
      platForm : this._platForm,
      initial : Tw.StringHelper.getKorInitialChar(keyword)
    });
    while (this._recentKeyworList[this._nowUser].length>10){
      this._recentKeyworList[this._nowUser].shift();
    }
    Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(this._recentKeyworList));
  },
  _closeSearch : function () {
    if(this._historyService.getHash()==='#input_P'){
      this._closeKeywordListBase();
    }
    setTimeout($.proxy(function () {
      this._historyService.go(Number(this._step)*-1);
    },this));
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
    if(!$currentTarget.hasClass('searchword-text')){
      this._addRecentlyKeyword($currentTarget.data('keyword'));
    }
    this._moveUrl($currentTarget.attr('href'));
  },
  _recognizeLastChar : function (keyword){
    if(Tw.FormatHelper.isEmpty(keyword)){
      return;
    }
    var endCharIdx = (keyword.charCodeAt(keyword.length-1) - parseInt('0xac00',16)) % 28;
    if(endCharIdx>0){
      this.$container.find('#suggest_comment').text('으'+this.$container.find('#suggest_comment').text());
    }
  },
  _recentKeywordInit : function () {
    var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage('recentlySearchKeyword'));
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
      //making recentlySearchKeyword
      recentlyKeywordData = {};
    }
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData[this._nowUser])){
      //makin nowUser's recentlySearchKeyword based on svcMgmtNum
      recentlyKeywordData[this._nowUser] = [];
    }
    Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(recentlyKeywordData));
    this._recentKeyworList = recentlyKeywordData;
  },
  _inputFocusEvt : function () {
    this._openKeywordListBase();
  },
  _inputBlurEvt : function () {
    if(this._historyService.getHash()==='#input_P'){
      this._popupService.close();
    }
  },
  _bindKeyworListBaseEvent : function (layer) {
    this.$keywordListBase = $(layer);
    if(this.$inputElement.val().trim().length>0){
      this._getAutoCompleteKeyword();
    }else{
      this._showRecentKeyworList();
    }
    this.$keywordListBase.on('click','.remove-recently-list',$.proxy(this._removeRecentlyKeywordList,this));
    this.$keywordListBase.on('click','.close',$.proxy(this._closeKeywordListBase,this,true));
  },
  _openKeywordListBase : function () {
    if(this._historyService.getHash()==='#input_P'){
      this._closeKeywordListBase();
    }
    setTimeout($.proxy(function () {
      this._popupService.open({
          hbs: 'search_keyword_list_base',
          layer: true,
          data : null
        },
        $.proxy(this._bindKeyworListBaseEvent,this),
        $.proxy(this._keywordListBaseClassCallback,this),
        'input');
    },this));
  },
  _closeKeywordListBase  : function () {
    this._popupService.close();
    this.$container.find('.keyword-list-base').remove();
  },
  _keywordListBaseClassCallback : function () {
    this._closeKeywordListBase();
    this.$inputElement.blur();
  },
  _showRecentKeyworList : function () {
    if(this._historyService.getHash()==='#input_P'){
      this.$keywordListBase.find('#recently_keyword_layer').removeClass('none');
      if(!this.$keywordListBase.find('#auto_complete_layer').hasClass('none')){
        this.$keywordListBase.find('#auto_complete_layer').addClass('none');
      }
      this.$keywordListBase.find('#recently_keyword_list').empty();
      _.each(this._recentKeyworList[this._nowUser],$.proxy(function (data,idx) {
        this.$keywordListBase.find('#recently_keyword_list').append(this._recentKeywordTemplate({listData : data ,
          xtractorIndex : idx+1 , index : idx}));
      },this));
      //this.$keywordListBase.find('#recently_keyword_list') list
    }
  },
  _getAutoCompleteKeyword : function () {
    var keyword = this.$inputElement.val();
    if(this._historyService.getHash()!=='#input_P'||keyword.trim().length<=0){
      return;
    }
    this.$keywordListBase.find('#auto_complete_layer').removeClass('none');
    if(!this.$keywordListBase.find('#recently_keyword_layer').hasClass('none')){
      this.$keywordListBase.find('#recently_keyword_layer').addClass('none');
    }
    var requestParam = { query : encodeURI(keyword) };
    this._apiService.request(Tw.API_CMD.SEARCH_AUTO_COMPLETE,requestParam)
      .done($.proxy(function (res) {
        if(res.code===0){
          var autoCompleteList = this._mergeList(this._getRecentKeywordListBySearch(keyword),res.result.length<=0?[]:res.result[0].items);
          this._showAutoCompleteKeyword(autoCompleteList);
        }
      },this));
  },
  _mergeList : function (recentKeywordList,autoCompleteList) {
    _.each(autoCompleteList,$.proxy(function (data) {
      recentKeywordList.push(this._convertAutoKeywordData(data.hkeyword));
    },this));
    recentKeywordList = Tw.FormatHelper.removeDuplicateElement(recentKeywordList);
    return recentKeywordList;
  },
  _showAutoCompleteKeyword : function (autoCompleteList) {
    this.$keywordListBase.find('#auto_complete_list').empty();
    _.each(autoCompleteList,$.proxy(function (data,idx) {
      if(idx>=10){
        return;
      }
      this.$keywordListBase.find('#auto_complete_list').append(this._autoCompleteKeywrodTemplate({listData : data ,xtractorIndex : idx+1}));
    },this));
  },
  _getRecentKeywordListBySearch : function (keyword) {
    var returnData = [];
    for(var i=0;i<this._recentKeyworList[this._nowUser].length;i++){
      if(this._recentKeyworList[this._nowUser][i].keyword.indexOf(keyword)>-1||
        (!Tw.FormatHelper.isEmpty(this._recentKeyworList[this._nowUser][i].initial)&&
          this._recentKeyworList[this._nowUser][i].initial.indexOf(keyword)>-1)) {
        if(
          this._nowUser==='logOutUser'&&
          !Tw.FormatHelper.isEmpty(this._recentKeyworList[this._nowUser][i].platForm)&&
          this._platForm!==this._recentKeyworList[this._nowUser][i].platForm
        ){
          continue;
        }
        returnData.push({
          showStr : this._recentKeyworList[this._nowUser][i].keyword.replace(new RegExp(keyword,'g'),
            '<span class="highlight-text">'+keyword+'</span>'),
          linkStr : this._recentKeyworList[this._nowUser][i].keyword
        });
      }
    }
    return returnData;
  },
  _convertAutoKeywordData : function (listStr) {
    var returnObj = {};
    returnObj.showStr =  listStr.substring(0,listStr.length-7);
    returnObj.showStr = returnObj.showStr.replace('<font style=\'color:#CC6633\'>','<span class="highlight-text">');
    returnObj.showStr = returnObj.showStr.replace('<font style=\'font-size:12px\'>','');
    returnObj.showStr = returnObj.showStr.replace('</font>','</span>');
    returnObj.linkStr = returnObj.showStr.replace('<span class="highlight-text">','').replace('</span>','');
    return returnObj;
  },
  _removeRecentlyKeywordList : function (args) {
    var removeIdx = $(args.currentTarget).data('index');
    if(removeIdx==='all'){
      this._recentKeyworList[this._nowUser] = [];
    }else{
      this._recentKeyworList[this._nowUser].splice(removeIdx,1);
    }
    Tw.CommonHelper.setLocalStorage('recentlySearchKeyword',JSON.stringify(this._recentKeyworList));
    this._recentKeywordInit();
    setTimeout($.proxy(this._showRecentKeyworList,this));
  },
  _moveUrl : function (linkUrl) {
    if(this._historyService.getHash()==='#input_P'){
      this._closeKeywordListBase();
    }
    setTimeout($.proxy(function () {
      this._historyService.goLoad(linkUrl);
    },this));
  }
};
