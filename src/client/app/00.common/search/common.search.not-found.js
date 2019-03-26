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
  this.$ariaHiddenEl = this.$container.find('.fe-aria-hidden-el');
  this._init(from,keywrod);
  /*
  HO_05_02_02_01_01.hbs : 검색 의견 신청 텍스트
  HO_05_02_02_01_02.hbs : 검새 의견 신청 선택
  * */
};
Tw.CommonSearchNotFound.prototype = new Tw.CommonSearch();
Tw.CommonSearchNotFound.prototype.constructor = Tw.CommonSearchNotFound;
$.extend(Tw.CommonSearchNotFound.prototype,
{
  _init : function (from,keywrod) {
    this._recentKeywordDateFormat = 'YY.M.D.';
    this._todayStr = Tw.DateHelper.getDateCustomFormat(this._recentKeywordDateFormat);
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
    this.$container.on('scroll',$.proxy(function () {
      this.$inputElement.blur();
    },this));
    this._recentKeywordInit();
    this._recentKeywordTemplate = Handlebars.compile($('#recently_keyword_template').html());
    this._autoCompleteKeywrodTemplate = Handlebars.compile($('#auto_complete_template').html());
    if(from==='menu'&&this._historyService.isReload()===false&&!this._historyService.isBack()){
      this._addRecentlyKeyword(decodeURIComponent(keywrod));
    }
    new Tw.XtractorService(this.$container);
  },
  _showClaimPopup : function(btnEvt){
    //var $selectedClaim = $(btnEvt.currentTarget);
    //$selectedClaim.parents('.opinion-selectbox').addClass('selected');
    if($(btnEvt.currentTarget).data('type')===52){
      this._showRequestKeyword(btnEvt);
    }else{
      this._showSelectClaim(btnEvt);
    }
  },
  _openAlert : function (alertObj,doRequest,event){
    this._popupService.openModalTypeATwoButton(alertObj.TITLE, null, null, alertObj.BUTTON,
      null,
      $.proxy(doRequest,this,event),
      null,null,$(event.currentTarget));
  },
  _showRequestKeyword : function (evt) {
    this._popupService.open({
      hbs: 'HO_05_02_02_01_01',
      layer: true,
      data: null
    }, $.proxy(this._bindEventForRequestKeyword, this),
      //$.proxy(this._showAndHidePopKeywordList,this), 'requestKeyword');
      $.proxy(this._removeInputDisabled,this), 'requestKeyword',$(evt.currentTarget));
  },
  _showSelectClaim : function (evt) {
    this._popupService.open({
      hbs: 'HO_05_02_02_01_02',
      layer: true,
      data: this._surveyList.result.invstQstnAnswItm
    }, $.proxy(this._bindEventForSelectClaim, this),
      //$.proxy(this._showAndHidePopKeywordList,this), 'selectClaim');
      $.proxy(this._removeInputDisabled,this), 'selectClaim',$(evt.currentTarget));
  },
  _bindEventForRequestKeyword : function(popupObj){
    //keyword request
    //this._showAndHidePopKeywordList();
    this.$inputElement.attr('disabled','disabled');
    this.$requestKeywordPopup = $(popupObj);
    this.$requestKeywordPopup.on('click','.request_claim',$.proxy(this._openAlert,this,Tw.ALERT_MSG_SEARCH.ALERT_4_A40,this._requestKeyword));
    this.$requestKeywordPopup.on('keyup','.input-focus',$.proxy(this._activateRequestKeywordBtn,this));
    this.$requestKeywordPopup.on('click','.cancel',$.proxy(this._activateRequestKeywordBtn,this));
    this._changeAriaHidden('open');
  },
  _bindEventForSelectClaim : function(popupObj){
    //claim select
    //this._showAndHidePopKeywordList();
    this.$inputElement.attr('disabled','disabled');
    this.$selectClaimPopup = $(popupObj);
    this.$selectClaimPopup.on('click','.request_claim',$.proxy(this._openAlert,this,Tw.ALERT_MSG_SEARCH.ALERT_4_A41,this._selectClaim));
    this.$selectClaimPopup.on('click','.custom-form>input',$.proxy(this._activateSelectClaimBtn,this));
    this._changeAriaHidden('open');
  },
  _removeInputDisabled : function(){
    this.$inputElement.removeAttr('disabled');
    this._changeAriaHidden('close');
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
  _requestKeyword : function (evt) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_08_0071, { ctt : this.$requestKeywordPopup.find('.input-focus').val() }, {}).
    done($.proxy(function (res) {
      this._claimCallback(res,52);
    }, this))
      .fail($.proxy(function (err) {
        this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(evt.currentTarget));
      }, this));
  },
  _selectClaim : function (evt) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_08_0072, { inqNum : this.$selectClaimPopup.find('input[name=r1]:checked', '#claim_list').val() }, {}).
    done($.proxy(function (res) {
      this._claimCallback(res,51, evt);
    }, this))
    .fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,null,nul,$(evt.currentTarget));
    }, this));
  },
  _claimCallback : function (res,srchId, evt) {
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
      this._popupService.openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(evt.currentTarget));
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
  _doSearch : function (evt) {
    var searchKeyword = this.$container.find('#search_keyword').val();
    if(Tw.FormatHelper.isEmpty(searchKeyword)||searchKeyword.trim().length<=0){
      var closeCallback;
      if(this._historyService.getHash()==='#input_P'){
        closeCallback = $.proxy(function () {
          setTimeout($.proxy(function () {
            this.$inputElement.focus();
          },this),100);
        },this);
      }
      this.$inputElement.blur();
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,closeCallback,null,$(evt.currentTarget));
      return;
    }
    this._addRecentlyKeyword(searchKeyword);
    this._moveUrl('/common/search?keyword='+(encodeURIComponent(searchKeyword))+'&step='+(Number(this._step)+1));
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
      this._addRecentlyKeyword($currentTarget.data('keyword')||$currentTarget.data('param'));
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
  _changeAriaHidden : function (type) {
    if(type==='open'){
      this.$ariaHiddenEl.attr('aria-hidden',true);
    }else{
      this.$ariaHiddenEl.attr('aria-hidden',false);
    }
  }
});
