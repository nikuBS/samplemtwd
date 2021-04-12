/**
 * @file common.search.not-found.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.31
 */

/**
 * @class
 * @desc 검색 결과 없음 페이지
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} surveyList - 검색의견 설문조사를 위한 객체
 * @param {String} step – 최초 검색 진입점으로 부터 페이지 이동 횟수
 * @param {String} from – 검색 접근 위치
 * @param {String} keyword – 검색어
 * @returns {void}
 */
 Tw.CommonSearchNotFound = function (rootEl, surveyList, step, from, keyword, inKeyword, notFoundSearchKategorie) {
  //this._cdn = cdn;
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._svcInfo = null;
  this._surveyList = surveyList;
  this._popupService = Tw.Popup;
  this._step = step;
  this.$ariaHiddenEl = this.$container.find('.fe-aria-hidden-el');
  this._from = from;
  this._keyword = keyword;
  this._inKeyword = inKeyword;
  this._notFoundSearchKategorie = notFoundSearchKategorie;
  this._bpcpService = Tw.Bpcp;
  this._init();
  /*
  HO_05_02_02_01_01.hbs : 검색 의견 신청 텍스트
  HO_05_02_02_01_02.hbs : 검새 의견 신청 선택
  * */
};
Tw.CommonSearchNotFound.prototype = new Tw.CommonSearch();
Tw.CommonSearchNotFound.prototype.constructor = Tw.CommonSearchNotFound;
$.extend(Tw.CommonSearchNotFound.prototype,
{
  /**
   * @function
   * @member
   * @desc 실제 초기화
   * @returns {void}
   */
  _nextInit : function () {
    Tw.Logger.info('[common.search.not-found] [_nextInit]', '');

    // 검색 의견 보내기 버튼 리스너
    this.$container.on('click', '#btn_08_0072', $.proxy(this._openAlert, this, Tw.ALERT_MSG_SEARCH.ALERT_4_A40, this._improveInvest));

    this._recentKeywordDateFormat = 'YY.M.D.';
    this._todayStr = Tw.DateHelper.getDateCustomFormat(this._recentKeywordDateFormat);
    this._platForm = Tw.BrowserHelper.isApp()?'app':'web';
    this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    this.$container.find('.request_keyword').on('click',$.proxy(this._showClaimPopup,this));
    this.$container.find('.icon-gnb-search').on('click',$.proxy(this._doSearch,this));
    // this.$container.find('#search_keyword').on('keyup',$.proxy(this._inputKeyupEvt,this));
    this.$inputElement = this.$container.find('#search_keyword');
    this.$inputElement.on('keydown', $.proxy(this._keyDownInputEvt, this));
    this.$inputElement.on('keyup', _.debounce($.proxy(this._keyUpInputEvt, this), 500));
    this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
    // this.$container.find('.close-area').on('click',$.proxy(this._closeSearch,this));
    this.$container.on('touchstart click', '.close-area', $.proxy(this._closeSearch, this));
    this.$container.on('click','.search-element',$.proxy(this._keywordSearch,this));
    this.$container.on('click', '#fe-btn-feedback', $.proxy(this._showClaimPopup, this));
    this.$popKeywordElement = this.$container.find('.cont-box.nogaps-hoz');
    this.$container.on('scroll',$.proxy(function () {
      this.$inputElement.blur();
    },this));
    this.$container.on('click', '.list-data', $.proxy(this._goLink, this));  // 검색결과로 리스트업된 컨텐츠 클릭시 이벤트 바인딩

    this._recentKeywordInit();
    this._recentKeywordTemplate = Handlebars.compile($('#recently_keyword_template').html());
    this._autoCompleteKeywrodTemplate = Handlebars.compile($('#auto_complete_template').html());
    if(this._from==='menu'&&this._historyService.isReload()===false&&!this._historyService.isBack()){
      this._addRecentlyKeyword(decodeURIComponent(this._keyword));
    }

    new Tw.XtractorService(this.$container);

    var keyword = decodeURIComponent(this._keyword);
    var inKeyword = decodeURIComponent(this._inKeyword);

    if (keyword !== inKeyword) {
      inKeyword = inKeyword.replace(keyword, '');
      inKeyword = inKeyword.trim();
    }

    var encodedKeyword = encodeURIComponent(keyword);
    var encodedInKeyword = encodeURIComponent(inKeyword);

    // Tw.Logger.info('[common.search.not-found] [_nextInit] decoded keyword : ', '[' + keyword + ']');
    // Tw.Logger.info('[common.search.not-found] [_nextInit] decoded inKeyword : ', '[' + inKeyword + ']');
    // Tw.Logger.info('[common.search.not-found] [_nextInit] encoded keyword : ', '[' + encodedKeyword + ']');
    // Tw.Logger.info('[common.search.not-found] [_nextInit] encoded inKeyword : ', '[' + encodedInKeyword + ']');
    Tw.Logger.info('[common.search.not-found] [_nextInit] this._notFoundSearchKategorie : ', this._notFoundSearchKategorie);

    // 스마트배너 검색 결과가 있다면
    if ( this._notFoundSearchKategorie && this._notFoundSearchKategorie.smart && this._notFoundSearchKategorie.smart.data && this._notFoundSearchKategorie.smart.data.length > 0 ) {
      // 스마트검색 출력 (Tw.CommonSearch.prototype._showSmart)
      this._showSmart(this._notFoundSearchKategorie.smart.data[0], this.$container);
    }

    window.XtractorScript.xtrSearchResult(encodedKeyword, encodedInKeyword, '0');
  },
  /**
   * @function
   * @member
   * @desc 검색 개선 의견 보내기 팝업 출력
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _showClaimPopup : function(evt){
    this._popupService.open({
      hbs: 'HO_05_02_02_01_01',
      layer: true,
      data: null
    }, $.proxy(this._bindEventForRequestKeyword, this),
      //$.proxy(this._showAndHidePopKeywordList,this), 'requestKeyword');
      $.proxy(this._removeInputDisabled,this), 'requestKeyword',$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 검색의견 설문조사 팝업 출력
   * @param {Object} btnEvt - 이벤트 객체
   * @returns {void}
   */
  __showClaimPopup : function(btnEvt){
    // 검색풀질개선 요건 이후 미사용 처리 (20191216)
    //var $selectedClaim = $(btnEvt.currentTarget);
    //$selectedClaim.parents('.opinion-selectbox').addClass('selected');
    if($(btnEvt.currentTarget).data('type')===52){
      this._showRequestKeyword(btnEvt);
    }else{
      this._showSelectClaim(btnEvt);
    }
  },
  /**
   * @function
   * @member
   * @desc 얼럿 출력 함수
   * @param {Object} alertObj - 얼럿 메세지 객체
   * @param {function} doRequest - 요청 함수
   * @param {Object} event - 이벤트 객체
   * @returns {void}
   */
  _openAlert : function (alertObj,doRequest,event){
    this._popupService.openModalTypeATwoButton(
      alertObj.TITLE,
      null,
      null,
      alertObj.BUTTON,
      null,
      _.debounce($.proxy(doRequest, this, event), 500),
      null,
      null,
      $(event.currentTarget)
    );
  },
  /**
   * @function
   * @member
   * @desc 검색 설문조사 주관식 팝업 출력 함수
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _showRequestKeyword : function (evt) {
    this._popupService.open({
      hbs: 'HO_05_02_02_01_01',
      layer: true,
      data: null
    }, $.proxy(this._bindEventForRequestKeyword, this),
      //$.proxy(this._showAndHidePopKeywordList,this), 'requestKeyword');
      $.proxy(this._removeInputDisabled,this), 'requestKeyword',$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 검색 설문조사 객관식 팝업 출력 함수
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _showSelectClaim : function (evt) {
    this._popupService.open({
      hbs: 'HO_05_02_02_01_02',
      layer: true,
      data: this._surveyList.result.invstQstnAnswItm
    }, $.proxy(this._bindEventForSelectClaim, this),
      //$.proxy(this._showAndHidePopKeywordList,this), 'selectClaim');
      $.proxy(this._removeInputDisabled,this), 'selectClaim',$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 검색 설문조사 주관식 팝업 이벤트 바인딩
   * @param {Object} popupObj - 팝업 layer 객체
   * @returns {void}
   */
  _bindEventForRequestKeyword : function(popupObj){
    //keyword request
    //this._showAndHidePopKeywordList();
    // this.$inputElement.attr('disabled','disabled');
    this.$requestKeywordPopup = $(popupObj);
    this.$requestKeywordPopup.on('click','.request_claim',$.proxy(this._openAlert,this,Tw.ALERT_MSG_SEARCH.ALERT_4_A40,this._improveInvest));
    this.$requestKeywordPopup.on('keyup','.input-focus',$.proxy(this._activateRequestKeywordBtn,this));
    this.$requestKeywordPopup.on('click','.cancel',$.proxy(this._activateRequestKeywordBtn,this));
    this._changeAriaHidden('open');
  },
  /**
   * @function
   * @member
   * @desc 검색 설문조사 객관식 팝업 이벤트 바인딩
   * @param {Object} popupObj - 팝업 layer 객체
   * @returns {void}
   */
  _bindEventForSelectClaim : function(popupObj){
    //claim select
    //this._showAndHidePopKeywordList();
    this.$inputElement.attr('disabled','disabled');
    this.$selectClaimPopup = $(popupObj);
    this.$selectClaimPopup.on('click','.request_claim',$.proxy(this._openAlert,this,Tw.ALERT_MSG_SEARCH.ALERT_4_A41,this._selectClaim));
    this.$selectClaimPopup.on('click','.custom-form>input',$.proxy(this._activateSelectClaimBtn,this));
    this._changeAriaHidden('open');
  },
  /**
   * @function
   * @member
   * @desc 검색어 입력창 활성화 함수 / 팝업 출력시 입력창 중복으로 인한 웹접근성 이슈
   * @returns {void}
   */
  _removeInputDisabled : function(){
    this.$inputElement.removeAttr('disabled');
    this._changeAriaHidden('close');
  },
  /**
   * @function
   * @member
   * @desc 검색 설문조사 작성 완료 버튼 활성화 함수
   * @param {Object} inputEvt - 이벤트 객체
   * @returns {void}
   */
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
  /**
   * @function
   * @member
   * @desc 검색어 설문조사 주관식 내용 길이 검증 함수
   * @param {Object} $inputEvt - 입력 요소 jquery 객체
   * @returns {void}
   */
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
  /**
   * @function
   * @member
   * @desc 검색어 설문조사 객관식 설문 내용 입력 완료 버튼 활성화 함수
   * @returns {void}
   */
  _activateSelectClaimBtn : function(){
    this.$selectClaimPopup.find('.request_claim').removeAttr('disabled');
  },
  /**
   * @function
   * @member
   * @desc 검색어 설문조사 주관식 설문 내용 입력 완료 함수
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _requestKeyword : function (evt) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_08_0071, {
      ctt : this.$requestKeywordPopup.find('.input-focus').val()
    }, null, null, null, { jsonp : false }).
    done($.proxy(function (res) {
      this._claimCallback(res,52, evt);
    }, this))
      .fail($.proxy(function (err) {
        this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(evt.currentTarget));
      }, this));
  },
  /**
   * @function
   * @member
   * @desc 검색어 설문조사 객관식 설문 내용 입력 완료 함수
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _selectClaim : function (evt) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_08_0072, { inqNum : this.$selectClaimPopup.find('input[name=r1]:checked', '#claim_list').val() }, {}).
    done($.proxy(function (res) {
      this._claimCallback(res,51, evt);
    }, this))
    .fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,null,null,null,$(evt.currentTarget));
    }, this));
  },
  /**
   * @function
   * @member
   * @desc 검색어 설문조사 요청 콜백
   * @param {Object} res - 응답 객체
   * @param {Object} srchId - 설문 타입 code
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _claimCallback : function (res,srchId, evt) {
    Tw.Logger.info('[common.search] [_claimCallBack]', '');
    Tw.CommonHelper.endLoading('body');
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_SEARCH.REQUEST_IMPROVE);

      var $selectedEl = this.$container.find('.opinion-selectbox');

      $selectedEl.each(function (idx) {
        if ( $selectedEl.eq(idx).data('type') === srchId ) {
          $selectedEl.eq(idx).children('.btn').hide();
          $selectedEl.eq(idx).children('.text').text(Tw.ALERT_MSG_SEARCH.REQUEST_CLAIM);
          $selectedEl.eq(idx).removeClass();
        }
      });
    } else {
      this._popupService.openAlert(res.msg, Tw.POPUP_TITLE.NOTIFY, null, null, null, $(evt.currentTarget));
    }
  },
  /**
   * @function
   * @member
   * @desc 검색어 설문조사 요청 콜백
   * @param {Object} res - 응답 객체
   * @param {Object} srchId - 설문 타입 code
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  __claimCallback : function (res,srchId, evt) {
    // 검색품질개선 요건 이후 미사용 (191216)
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
  /**
   * @function
   * @member
   * @desc 검색어 입력창 keyup 이벤트
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
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
  /**
   * @function
   * @member
   * @desc 검색 실행 함수
   * @param {Object} evt - 이벤트 객체
   * @returns {void}
   */
  _doSearch : function (evt) {
    var searchKeyword = this.$container.find('#search_keyword').val();
    if(Tw.FormatHelper.isEmpty(searchKeyword)||searchKeyword.trim().length<=0){
      this.$inputElement.blur();
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,null,'search_keyword_err',$(evt.currentTarget));
      return;
    }
    this._addRecentlyKeyword(searchKeyword);
    this._moveUrl('/common/search?keyword='+(encodeURIComponent(searchKeyword))+'&step='+(Number(this._step)+1));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어,검색어 자동완성 클릭 검색
   * @param {Object} targetEvt - 이벤트 객체
   * @returns {void}
   */
  _keywordSearch : function (targetEvt) {
    targetEvt.preventDefault();
    var $currentTarget = $(targetEvt.currentTarget);
    if(!$currentTarget.hasClass('searchword-text')){
      this._addRecentlyKeyword($currentTarget.data('keyword')||$currentTarget.data('param'));
    }
    this._moveUrl($currentTarget.attr('href'));
  },
  /**
   * @function
   * @member
   * @desc 접근성 관련 요소 숨김,보임 처리
   * @param {String} type - 팝업 열기,닫기 타입
   * @returns {void}
   */
  _changeAriaHidden : function (type) {
    if(type==='open'){
      this.$ariaHiddenEl.attr('aria-hidden',true);
    }else{
      this.$ariaHiddenEl.attr('aria-hidden',false);
    }
  },

  _improveInvest: function (evt) {
    var typeCd = '';
    if ( Tw.BrowserHelper.isApp() ) {
      if ( Tw.BrowserHelper.isAndroid() ) {
        typeCd = 'A';
      } else {
        typeCd = 'I';
      }
    } else {
      typeCd = 'M';
    }
    Tw.CommonHelper.startLoading('body', 'grey', true);
    this._popupService.close();

    this._apiService.request(Tw.API_CMD.BFF_08_0072, {
      inqNum: this.$container.find('input[name=invstQstnAnswItm]:checked').val(),
      typeCd: typeCd,
      searchKeyword: this.$container.find('#search_keyword').val()
    }, {}).done($.proxy(function (res) {
      this._claimCallback(res, 51, evt);
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.msg, Tw.POPUP_TITLE.NOTIFY, null, null, null, $(evt.currentTarget));
      Tw.CommonHelper.endLoading('body');
    }, this));
  },
  /**
   * @function
   * @desc 검색결과 클릭 이벤트
   * @param {Object} linkEvt - 이벤트 객체
   * @returns {void}
   */
   _goLink: function (linkEvt) {
    linkEvt.preventDefault();
    var $linkData = $(linkEvt.currentTarget);
    Tw.Logger.info('[common.search.not-found] [_goLink] 이동할 검색결과 element : ', $linkData);

    var linkUrl = $linkData.attr('href');

    if ( Tw.FormatHelper.isEmpty(linkUrl) ) {
      return;
    }

    if ( this._bpcpService.isBpcp(linkUrl) ) {
      this._bpcpService.open(linkUrl, null, null);
    } else if ( $linkData.hasClass('direct-element') ) {
      this._popupService.openConfirm(null, Tw.MSG_COMMON.DATA_CONFIRM,
        $.proxy(function () {
          this._popupService.close();
          Tw.CommonHelper.openUrlExternal(linkUrl);
        }, this),
        $.proxy(this._popupService.close, this._popupService), $linkData
      );
    } else {
      if ( this._exceptionDocId[$linkData.data('id')] ) {
        linkUrl = this._exceptionDocId[$linkData.data('id')].link;
      }
      if ( linkUrl.indexOf('http') > -1 ) {
        if ( $linkData.data('require-pay') === 'Y' ) {
          this._popupService.openConfirm(null, Tw.POPUP_CONTENTS.NO_WIFI,
            $.proxy(function () {
              this._popupService.close();
              Tw.CommonHelper.openUrlExternal(linkUrl);
            }, this),
            $.proxy(this._popupService.close, this._popupService), $linkData
          );
        } else {
          Tw.CommonHelper.openUrlExternal(linkUrl);
        }
      } else {
        this._moveUrl(linkUrl);
      }
    }
  }
});
