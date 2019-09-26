/**
 * @file common.search.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.11
 */

/**
 * @class
 * @desc 검색 결과 화면
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} searchInfo - 검색 결과
 * @param {String} cdn – cdn 서버 주소
 * @param {String} step – 검색 진입점으로부터 페이지 이동 횟수
 * @param {String} from – 결과 요청 위치
 * @param {String} nowUrl – 현재 url
 * @returns {void}
 */
Tw.CommonSearch = function (rootEl,searchInfo,cdn,step,from,nowUrl) {
  this._cdn = cdn;
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._bpcpService = Tw.Bpcp;
  this._svcInfo = null;
  this._searchInfo = searchInfo;
  this._step = Tw.FormatHelper.isEmpty(step)?1:step;
  this._from = from;
  this._nowUrl = nowUrl;
  this._requestRealTimeFeeFlag = false;
  this._autoCompleteRegExObj = {
    fontColorOpen : new RegExp('<font style=\'color:#CC6633\'>','g'),
    fontSizeOpen : new RegExp('<font style=\'font-size:12px\'>','g'),
    fontClose : new RegExp('</font>','g')
  };
  this._exceptionDocId = {
    'D00003': {
      link: '/customer/svc-info/site#mobile'
    },
    'D00004': {
      link : '/customer/svc-info/site/mcenter'
    },
    'C00001': {
      link : Tw.OUTLINK.DIRECTSHOP_GUIDE_LINK.common+Tw.OUTLINK.DIRECTSHOP_GUIDE_LINK.discount
    }
  };
  this._tidLanding = new Tw.TidLandingComponent();
};

Tw.CommonSearch.prototype = {
  /**
   * @function
   * @member
   * @desc 실제 초기화
   * @returns {void}
   */
  _nextInit : function () {
    this._recentKeywordDateFormat = 'YY.M.D.';
    this._todayStr = Tw.DateHelper.getDateCustomFormat(this._recentKeywordDateFormat);
    this.$contents = this.$container.find('.container');
    this._searchInfo.search = this._setRank(this._searchInfo.search);
    this._platForm = Tw.BrowserHelper.isApp()?'app':'web';
    this._nowUser = Tw.FormatHelper.isEmpty(this._svcInfo)?'logOutUser':this._svcInfo.svcMgmtNum;
    this._bpcpService.setData(this.$container, this._nowUrl);
    if(this._searchInfo.totalcount===0){
      return;
    }    
    var keyName,contentsCnt;
    for(var i=0;i<this._searchInfo.search.length;i++){
      keyName =  Object.keys(this._searchInfo.search[i])[0];
      contentsCnt = Number(this._searchInfo.search[i][keyName].count);
      if(keyName==='smart'||keyName==='immediate'||keyName==='banner'){
        if(keyName==='banner'){
          this._showBanner(this._arrangeData(this._searchInfo.search[i][keyName].data,keyName));
        }
        if(keyName==='immediate'&&this._searchInfo.search[i][keyName].data[0]){
          if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===5){  // T멤버십
            this._showBarcode(this._searchInfo.search[i][keyName].data[0].barcode,this.$container.find('#membership-barcode'));
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===2){  // 데이터 잔여량
            this._calculdateRemainData(this._searchInfo.search[i][keyName].data[0].subData);
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===3&&this._nowUser!=='logOutUser'){  // 실시간 요금
            this._requestRealTimeFeeFlag = true;
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===7){  // 부가서비스
            this._calculateAdditionsFee(this._searchInfo.search[i][keyName].data[0].subData);
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===8){  // 음성 잔여량
            this._calculateRemainVoice(this._searchInfo.search[i][keyName].data[0].subData);
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===9){  // 요금약정할인
            this._requestFeeAgrmntDiscountInfo(this._searchInfo.search[i][keyName].data[0].subData);
          }else if(Number(this._searchInfo.search[i][keyName].data[0].DOCID)===10){  // 단말기 할부금
            this._requestEqpInstallmentInfo(this._searchInfo.search[i][keyName].data[0].subData);
          }
        }
        if(keyName==='smart'){
          this._showSmart(this._searchInfo.search[i][keyName].data[0]);
        }
        continue;
      }
      // if(keyName==='direct'){
      //   this.$container.find('.direct-element.home').data('link',Tw.OUTLINK.DIRECT_HOME);
      // }
      this._showShortcutList(this._arrangeData(this._searchInfo.search[i][keyName].data,keyName),keyName,this._cdn);
    }
    this.$inputElement =this.$container.find('#keyword');
    this.$inputElement.on('keyup',$.proxy(this._inputChangeEvent,this));
    this.$inputElement.on('focus',$.proxy(this._inputFocusEvt,this));
    this.$container.on('click','.icon-historyback-40',$.proxy(this._historyService.goBack,this));
    this.$container.on('click','.close-area',$.proxy(this._closeSearch,this));
    this.$container.on('click','.search-element',$.proxy(this._searchRelatedKeyword,this));
    this.$container.on('click','.list-data',$.proxy(this._goLink,this));
    this.$container.on('click','.icon-gnb-search',$.proxy(this._doSearch,this));
    this.$container.on('change','.resultsearch-box > .custom-form > input',$.proxy(
      function(e) {this.$container.find('.resultsearch-box > label').toggleClass('on',$(e.currentTarget).prop('checked'));}
    ,this));
    this._recentKeywordInit();
    this._recentKeywordTemplate = Handlebars.compile($('#recently_keyword_template').html());
    this._autoCompleteKeywrodTemplate = Handlebars.compile($('#auto_complete_template').html());
    this._removeDuplicatedSpace(this.$container.find('.cont-sp'),'cont-sp');
    if(this._from==='menu'&&this._historyService.isReload()===false&&!this._historyService.isBack()){
      this._addRecentlyKeyword(this._searchInfo.query);
    }
    new Tw.XtractorService(this.$container);
    this._closeKeywordListBase();
    if(this._requestRealTimeFeeFlag){
      Tw.CommonHelper.startLoading('.container-wrap', 'white');
      this._requestRealTimeFee(0);
    }
    this.$container.find('.container').removeClass('none');

    if(this._platForm!=='app'){
      $('#fe-post-bnnr').show();
    }
  },
  /**
   * @function
   * @member
   * @param {Array} 검색 결과
   * @desc 카테고리 정렬
   * @returns {Array}
   */
  _setRank : function (data) {
    var compareKeyName1 , compareKeyName2;
    for (var i=0;i<data.length;i++) {
      for(var j=0;j<(data.length-i-1);j++){
        compareKeyName1 = Object.keys(data[j])[0];
        compareKeyName2 = Object.keys(data[j+1])[0];
        if(Tw.FormatHelper.isEmpty(data[j][compareKeyName1].rank)){
          data[j][compareKeyName1].rank = 0;
          continue;
        }
        if(data[j][compareKeyName1].rank > data[j+1][compareKeyName2].rank) {
          var tmp = data[j];
          data[j] = data[j+1];
          data[j+1] = tmp;
        }
      }
    }
    return data;
  },
  /**
   * @function
   * @member
   * @desc 실제 초기화
   * @param {Array} data - 카테고리별 검색 데이터
   * @param {String} category - 카테고리명
   * @returns {Array}
   */
  _arrangeData : function (data,category) {
    if(!data){
      return [];
    }
    for(var i=0;i<data.length;i++){
      for (var key in data[i]) {
        if(key==='PR_STA_DT'||key==='PR_END_DT'){
          data[i][key] = Tw.DateHelper.getShortDate(data[i][key]);
        }
        if(typeof (data[i][key])==='string'){
          data[i][key] = data[i][key].replace(/<!HE>/g, '</span>');
          data[i][key] = data[i][key].replace(/<!HS>/g, '<span class="highlight-text">');
        }
        if(key==='DEPTH_PATH'){
          if(data[i][key].charAt(0)==='|'){
            data[i][key] = data[i][key].replace('|','');
          }
        }
        if(category==='direct'&&key==='TYPE'){
          if(data[i][key]==='shopacc'){
            if(data[i].PRODUCT_TYPE!==''){
              data[i].linkUrl = Tw.OUTLINK.DIRECT_IOT+'?categoryId='+data[i].CATEGORY_ID+'&productId='+data[i].ACCESSORY_ID+'&productType='+data[i].PRODUCT_TYPE;
            }else{
              data[i].linkUrl = Tw.OUTLINK.DIRECT_ACCESSORY+'?categoryId='+data[i].CATEGORY_ID+'&accessoryId='+data[i].ACCESSORY_ID;
            }
          }else{
            data[i].linkUrl = Tw.OUTLINK.DIRECT_MOBILE+'?categoryId='+data[i].CATEGORY_ID+'&productGrpId='+data[i].PRODUCT_GRP_ID;
          }
        }
        if(key==='METATAG'){
          data[i][key] = data[i][key].split('#');
        }
        if(key==='IMG'){
          var tempArr = data[i][key].split('<IMG_ALT>');
          data[i][key] = tempArr[0].replace(/\/n/g,'');
          if(tempArr[1]){
            data[i].IMG_ALT = tempArr[1];
          }
        }
        if(key==='MENU_URL'&&data[i][key].indexOf('http') !== -1){
          data[i].tagTitle = Tw.COMMON_STRING.OPEN_NEW_TAB;
        }
      }
    }
    return data;
  },
  /**
   * @function
   * @member
   * @desc 바코드 출력
   * @param {String} barcodeNum - 바코드 번호
   * @param {Object} $barcodeElement - 바코드 jquery 객체
   * @returns {void}
   */
  _showBarcode : function (barcodeNum,$barcodeElement) {
    $barcodeElement.JsBarcode(barcodeNum,{background : '#edeef0',height : 60, displayValue : false});
    this.$container.find('.bar-code-num').text(barcodeNum);
  },
  /**
   * @function
   * @member
   * @desc 바코드 출력
   * @param {String} barcodNum - 바코드 번호
   * @param {Object} $barcodElement - 바코드 jquery 객체
   * @returns {void}
   */
  _showShortcutList : function (data,dataKey,cdn) {
    this.$contents.append(Handlebars.compile(this.$container.find('#'+dataKey+'_base').html()));
    var $template = $('#'+dataKey+'_template');
    var $list = this.$container.find('#'+dataKey+'_list');
    var shortcutTemplate = $template.html();
    var templateData = Handlebars.compile(shortcutTemplate);
    if(data.length<=0){
      $list.addClass('none');
      this.$container.find('.'+dataKey).addClass('none');
    }
    _.each(data,$.proxy(function (listData,index) {
      if(listData.DOCID==='M000083'&&this._nowUser==='logOutUser'){
        var removeLength = data.length-1;
        if(removeLength<=0){
          $('.'+dataKey).addClass('none');
        }else{
          $('.'+dataKey+' .num').text(removeLength);
        }
        return;
      }
      $list.append(templateData({listData : listData , CDN : cdn}));
    },this));
  },
  /**
   * @function
   * @member
   * @desc 검색결과 특수문자 제거
   * @param {String} targetString - 검색 결과
   * @returns {String}
   */
  _decodeEscapeChar : function (targetString) {
    return targetString.replace(/\\/gi, '/').replace(/\n/g, '');
  },
  /**
   * @function
   * @member
   * @desc 검색창 keyup 이벤트
   * @param {Object} args - 이벤트 객체
   * @returns {void}
   */
  _inputChangeEvent : function (args) {
    if(Tw.InputHelper.isEnter(args)){
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
   * @desc 검색 실행
   * @param {Object} event - 이벤트 객체
   * @returns {void}
   */
  _doSearch : function (event) {
    var keyword = this.$inputElement.val();
    if(Tw.FormatHelper.isEmpty(keyword)||keyword.trim().length<=0){
      this.$inputElement.blur();
      this._popupService.openAlert(null,Tw.ALERT_MSG_SEARCH.KEYWORD_ERR,null,null,'search_keyword_err',$(event.currentTarget));
      return;
    }
    var inResult = this.$container.find('#resultsearch').is(':checked');
    var requestUrl = inResult?'/common/search/in-result?keyword='+(encodeURIComponent(this._searchInfo.query))+'&in_keyword=':'/common/search?keyword=';
    requestUrl+=encodeURIComponent(keyword);
    requestUrl+='&step='+(Number(this._step)+1);
    this._addRecentlyKeyword(keyword);
    this._moveUrl(requestUrl);
  },
  /**
   * @function
   * @member
   * @desc 배너 출력
   * @param {Object} data - 배너 검색 결과
   * @returns {void}
   */
  _showBanner : function (data) {
    var bannerPositionObj = {
      AGN	 : 'as_outlet',
      APP	: 'tapp',
      BENF : 'sale',
      CUG	 : 'manner',
      EVT	 : 'event',
      FAQ	: 'question',
      FEE	: 'rate',
      IUG	: 'siteInfo',
      MBR	: 'tmembership',
      NOTI : 'notice',
      ROM	: 'troaming',
      SVC	: 'service',
      TWD	: 'direct',
      VUG	: 'serviceInfo',
      WIRE : 'tv_internet'
    };
    var bannerTemplate = Handlebars.compile($('#banner_template').html());
    _.each(data,$.proxy(function (bannerData) {
      this.$container.find('.cont-box.list.'+bannerPositionObj[bannerData.SUBM_MENU_ID1])
        .after(bannerTemplate({listData : bannerData, CDN : this._cdn}));
    },this));

  },
  /**
   * @function
   * @member
   * @desc 최근검색어 추가
   * @param {Object} keyword - 검색어
   * @returns {void}
   */
  _addRecentlyKeyword : function (keyword) {
    for(var i=0;i<this._recentKeyworList[this._nowUser].length;i++){
      if(this._recentKeyworList[this._nowUser][i].keyword === keyword){
        this._recentKeyworList[this._nowUser].splice(i,1);
        break;
      }
    }
    this._recentKeyworList[this._nowUser].unshift({
      keyword : keyword,
      searchTime : this._todayStr,
      platForm : this._platForm,
      initial : Tw.StringHelper.getKorInitialChar(keyword)
    });
    while (this._recentKeyworList[this._nowUser].length>10){
      this._recentKeyworList[this._nowUser].pop();
    }
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,JSON.stringify(this._recentKeyworList));
  },
  /**
   * @function
   * @member
   * @desc 연관검색어, 검색어 추천 클릭 이벤트
   * @param {Object} targetEvt - 이벤트 객체
   * @returns {void}
   */
  _searchRelatedKeyword : function (targetEvt) {
    targetEvt.preventDefault();
    var $targetElement = $(targetEvt.currentTarget);
    var keyword = $targetElement.data('param');
    //var goUrl = '/common/search?keyword='+keyword+'&step='+(Number(this._step)+1);
    if(!$targetElement.hasClass('searchword-text')){
      this._addRecentlyKeyword(keyword);
    }
    this._moveUrl($targetElement.attr('href'));
  },
  /**
   * @function
   * @member
   * @desc 검색결과 클릭 이벤트
   * @param {Object} linkEvt - 이벤트 객체
   * @returns {void}
   */
  _goLink : function (linkEvt) {
    linkEvt.preventDefault();
    var $linkData = $(linkEvt.currentTarget);
    var linkUrl = $linkData.attr('href');
    if(Tw.FormatHelper.isEmpty(linkUrl)){
      return;
    }
    if(!$linkData.hasClass('home')){
      this._apiService.request(Tw.API_CMD.STACK_SEARCH_USER_CLICK,
        {
          'docId' : $linkData.data('id'),
          'section' : $linkData.data('category'),
          'title' : encodeURIComponent($linkData.data('tit')),
          'keyword' : encodeURIComponent(this._searchInfo.researchQuery)
        }
      );
    }
    if(this._bpcpService.isBpcp(linkUrl)){
      this._bpcpService.open(linkUrl, null, null);
    }else if(linkUrl.indexOf('Native:')>-1){
      if(linkUrl.indexOf('freeSMS')>-1){
        this._callFreeSMS($linkData);
      }
    }else if($linkData.hasClass('direct-element')){
      Tw.CommonHelper.openUrlExternal(linkUrl);
    }else{
      if(this._exceptionDocId[$linkData.data('id')]){
        linkUrl = this._exceptionDocId[$linkData.data('id')].link;
      }
      if(linkUrl.indexOf('http')>-1){
        if($linkData.data('require-pay')==='Y'){
          this._popupService.openConfirm(null,Tw.POPUP_CONTENTS.NO_WIFI,
              $.proxy(function () {
                this._popupService.close();
                Tw.CommonHelper.openUrlExternal(linkUrl);
              },this),
              $.proxy(this._popupService.close,this._popupService),$linkData
          );
        }else{
          Tw.CommonHelper.openUrlExternal(linkUrl);
        }
      }else{
        this._moveUrl(linkUrl);
      }
    }

  },
  /**
   * @function
   * @member
   * @desc 검색 닫기 ( 검색창 진입 이전 페이지로 이동 )
   * @returns {void}
   */
  _closeSearch : function () {
    if(this._historyService.getHash()==='#input_P'){
      ++this._step;
    }
    setTimeout($.proxy(function () {
      this._historyService.go(Number(this._step)*-1);
    },this));
  },
  /**
   * @function
   * @member
   * @desc 검색 결과 카테고리사이의 공백 중복 제거
   * @param {Object} $selectedArr - 삭제할 클래스명 jquery 객체
   * @param {String} className - 삭제할 클래스 명
   * @returns {void}
   */
  _removeDuplicatedSpace : function ($selectedArr,className) {
    $selectedArr.each(function(){
      var $target = $(this);
      if($target.next().hasClass(className)){
        $target.addClass('none');
      }
    });
  },
  /**
   * @function
   * @member
   * @desc 최근검색어 가져오기, 초기화
   * @returns {void}
   */
  _recentKeywordInit : function () {
    var recentlyKeywordData = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD));
    var removeIdx = [];
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData)){
      //making recentlySearchKeyword
      recentlyKeywordData = {};
    }
    if(Tw.FormatHelper.isEmpty(recentlyKeywordData[this._nowUser])){
      //makin nowUser's recentlySearchKeyword based on svcMgmtNum
      recentlyKeywordData[this._nowUser] = [];
    }
    _.each(recentlyKeywordData[this._nowUser],$.proxy(function (data, index) {
      //recognize 10 days ago data from now
      if(Tw.DateHelper.getDiffByUnit(Tw.DateHelper.convDateCustomFormat(this._todayStr,this._recentKeywordDateFormat),Tw.DateHelper.convDateCustomFormat(data.searchTime,this._recentKeywordDateFormat),'day')>=10){
        removeIdx.push(index);
      }
    },this));
    _.each(removeIdx,$.proxy(function (removeIdx) {
      recentlyKeywordData[this._nowUser].splice(removeIdx,1);
    },this));
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,JSON.stringify(recentlyKeywordData));
    this._recentKeyworList = recentlyKeywordData;
  },
  /**
   * @function
   * @member
   * @desc 검색창 focus 이벤트
   * @returns {void}
   */
  _inputFocusEvt : function () {
      this._openKeywordListBase();
  },
  /**
   * @function
   * @member
   * @desc 검색창 blur 이벤트
   * @returns {void}
   */
  _inputBlurEvt : function () {
    if(this._historyService.getHash()==='#input_P'){
      this._popupService.close();
    }
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 이벤트 바인딩
   * @param {Object} layer - 최근검색어, 검색어 자동완성 화면 객체
   * @returns {void}
   */
  _bindKeyworListBaseEvent : function (layer) {
    this.$keywordListBase = $(layer);
    if(this.$inputElement.val().trim().length>0){
      this._getAutoCompleteKeyword();
    }else{
      this._showRecentKeyworList();
    }
    this.$keywordListBase.on('click','.remove-recently-list',$.proxy(this._removeRecentlyKeywordList,this));
    this.$keywordListBase.on('click','.close',$.proxy(this._closeKeywordListBase,this,true));
    $('.keyword-list-base').insertAfter('.fe-header-wrap');
    this.$container.find('.fe-container-wrap').attr('aria-hidden',true);
    this.$container.find('.fe-header-wrap').attr('aria-hidden',false);
    $(window).scrollTop(0);
    this.$keywordListBase.off('touchstart');
    this.$keywordListBase.on('touchstart',$.proxy(function () {
      this.$inputElement.blur();
    },this));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 출력
   * @returns {void}
   */
  _openKeywordListBase : function () {
    if(this._historyService.getHash()==='#input_P'){
      if(this.$inputElement.val().trim().length>0){
        this._getAutoCompleteKeyword();
      }else{
        this._showRecentKeyworList();
      }
      return;
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
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 닫기 실행
   * @returns {void}
   */
  _closeKeywordListBase  : function () {
    setTimeout($.proxy(function () {
      this._popupService.close();
      this.$container.find('.keyword-list-base').remove();
      this.$container.find('.fe-container-wrap').attr('aria-hidden',false);
      skt_landing.action.checkScroll.unLockScroll();
    },this));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 닫기 콜백
   * @returns {void}
   */
  _keywordListBaseClassCallback : function () {
    this._closeKeywordListBase();
    this.$inputElement.blur();
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면  최근검색어 화면으로 전환
   * @returns {void}
   */
  _showRecentKeyworList : function () {
    if(this._historyService.getHash()==='#input_P'){
      this.$keywordListBase.find('#recently_keyword_layer').removeClass('none');
      if(!this.$keywordListBase.find('#auto_complete_layer').hasClass('none')){
        this.$keywordListBase.find('#auto_complete_layer').addClass('none');
      }
      this.$keywordListBase.find('#recently_keyword_list').empty();
      _.each(this._recentKeyworList[this._nowUser],$.proxy(function (data,idx) {
        this.$keywordListBase.find('#recently_keyword_list').append(this._recentKeywordTemplate({listData : data , xtractorIndex : idx+1 , index : idx , encodeParam : encodeURIComponent(data.keyword)}));
      },this));
      //this.$keywordListBase.find('#recently_keyword_list') list
    }
  },
  /**
   * @function
   * @member
   * @desc 검색어 자동완성 요청
   * @returns {void}
   */
  _getAutoCompleteKeyword : function () {
    var keyword = this.$inputElement.val();
    if(this._historyService.getHash()!=='#input_P'||keyword.trim().length<=0){
      return;
    }
    this.$keywordListBase.find('#auto_complete_layer').removeClass('none');
    if(!this.$keywordListBase.find('#recently_keyword_layer').hasClass('none')){
      this.$keywordListBase.find('#recently_keyword_layer').addClass('none');
    }
    var requestParam = { query : encodeURIComponent(keyword) };
    this._apiService.request(Tw.API_CMD.SEARCH_AUTO_COMPLETE,requestParam)
      .done($.proxy(function (res) {
        if(res.code===0){
          var autoCompleteList = this._mergeList(this._getRecentKeywordListBySearch(keyword),res.result.length<=0?[]:res.result[0].items);
          this._showAutoCompleteKeyword(autoCompleteList);
        }
      },this));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 리스트 병합
   * @param {Array} recentKeywordList - 최근검색어 리스트
   * @param {Array} autoCompleteList - 자동완성 검색어 리스트
   * @returns {Array}
   */
  _mergeList : function (recentKeywordList,autoCompleteList) {
    _.each(autoCompleteList,$.proxy(function (data) {
      recentKeywordList.push(this._convertAutoKeywordData(data.hkeyword));
    },this));
    recentKeywordList = Tw.FormatHelper.removeDuplicateElement(recentKeywordList);
    return recentKeywordList;
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 검색어 자동완성 전환
   * @param {Array} autoCompleteList - 자동완성 검색어 리스트
   * @returns {void}
   */
  _showAutoCompleteKeyword : function (autoCompleteList) {
    this.$keywordListBase.find('#auto_complete_list').empty();
    _.each(autoCompleteList,$.proxy(function (data,idx) {
      if(idx>=10){
        return;
      }
      this.$keywordListBase.find('#auto_complete_list').append(this._autoCompleteKeywrodTemplate({listData : data ,xtractorIndex : idx+1, encodeParam: encodeURIComponent(data.linkStr)}));
    },this));
  },
  /**
   * @function
   * @member
   * @desc 최근검색어, 검색어 자동완성 화면 검색어 자동완성 전환
   * @param {Array} keyword - 검색어
   * @returns {Array}
   */
  _getRecentKeywordListBySearch : function (keyword) {
    var returnData = [];
    for(var i=0;i<this._recentKeyworList[this._nowUser].length;i++){
      if(this._recentKeyworList[this._nowUser][i].keyword.indexOf(keyword)>-1||
        (!Tw.FormatHelper.isEmpty(this._recentKeyworList[this._nowUser][i].initial)&&this._recentKeyworList[this._nowUser][i].initial.indexOf(keyword)>-1)){
        if(
          this._nowUser==='logOutUser'&&
          !Tw.FormatHelper.isEmpty(this._recentKeyworList[this._nowUser][i].platForm)&&
          this._platForm!==this._recentKeyworList[this._nowUser][i].platForm
        ){
          continue;
        }
        returnData.push({
          showStr : this._recentKeyworList[this._nowUser][i].keyword.replace(new RegExp(this._escapeChar(keyword),'g'),'<span class="keyword-text">'+keyword+'</span>'),
          linkStr : this._recentKeyworList[this._nowUser][i].keyword
        });
      }
    }
    return returnData;
  },
  /**
   * @function
   * @member
   * @desc 자동완성 하이라이팅 퍼블리싱에 맞춰 변경
   * @param {String} listStr - 자동완성 결과
   * @returns {Object}
   */
  _convertAutoKeywordData : function (listStr) {
    var returnObj = {};
    returnObj.showStr =  listStr.substring(0,listStr.length-7);
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontColorOpen,'<span class="keyword-text">');
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontSizeOpen,'');
    returnObj.showStr = returnObj.showStr.replace(this._autoCompleteRegExObj.fontClose,'</span>');
    returnObj.linkStr = Tw.FormatHelper.stripTags(returnObj.showStr);
    return returnObj;
  },
  /**
   * @function
   * @member
   * @desc 최근검색어 삭제 함수
   * @param {Object} args - 이벤트 객체
   * @returns {void}
   */
  _removeRecentlyKeywordList : function (args) {
    var removeIdx = $(args.currentTarget).data('index');
    if(removeIdx==='all'){
      this._recentKeyworList[this._nowUser] = [];
    }else{
      this._recentKeyworList[this._nowUser].splice(removeIdx,1);
    }
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.RECENT_SEARCH_KEYWORD,JSON.stringify(this._recentKeyworList));
    this._recentKeywordInit();
    setTimeout($.proxy(this._showRecentKeyworList,this));
  },
  /**
   * @function
   * @member
   * @desc url 이동
   * @param {String} linkUrl - 이동할 url
   * @returns {void}
   */
  _moveUrl : function (linkUrl) {
    if(this._historyService.getHash()==='#input_P'){
      this._closeKeywordListBase();
    }
    setTimeout($.proxy(function () {
      this._historyService.goLoad(linkUrl);
    },this),100);
  },
  /**
   * @function
   * @member
   * @desc 스마트검색 출력
   * @param {Object} data - 스마트 검색 결과
   * @returns {void}
   */
  _showSmart : function (data) {
    if(Tw.FormatHelper.isEmpty(data)){
      return;
    }
    var returnData = [];
    for(var i=1;i<=3;i++){
      if(!Tw.FormatHelper.isEmpty(data['BNNR_BOT_BTN_NM'+i])){
        returnData.push({
          title : data['BNNR_BOT_BTN_NM'+i],
          link : data['BNNR_BOT_BTN_URL'+i],
          docId : data['DOCID'],
          payInfo : data['BNNR_BOT_BTN_BILL_YN'+i]
        });
      }
    }
    if(returnData.length<=0){
      return;
    }else{
      this.$container.find('#smart_btn_base').removeClass('none');
      var smartTemplate = Handlebars.compile(this.$container.find('#smart_template').html());
      var $smartBase = this.$container.find('.btn-link-list');
      _.each(returnData,function (data,idx) {
        $smartBase.append(smartTemplate({data : data }));
      });
      if(returnData.length===3){
        $smartBase.addClass('col3');
      }else if(returnData.length===1){
        $smartBase.find('.last-line').addClass('full');
      }
    }
  },
  /**
   * @function
   * @member
   * @desc 무료문자 호출
   * @param {Object} $linkData - 선택한 요소 jquery 객체
   * @returns {void}
   */
  _callFreeSMS : function ($linkData) {
    var memberType = this._svcInfo.totalSvcCnt > 0 ? (this._svcInfo.expsSvcCnt > 0 ? 0 : 1) : 2;
    if (memberType === 1) {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms',$linkData
      );
      return ;
    }

    if (this._svcInfo.svcAttrCd==='M2') {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS_PPS,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms_pps',$linkData
      );
      return;
    }
    Tw.CommonHelper.openFreeSms();
  },
  /**
   * @function
   * @member
   * @desc 무료문자 호출
   * @param {String} string - 특수문자와 결합어 정상 출력 안되는 문자열 정상 출력 하도록 수정
   * @returns {String}
   */
  _escapeChar : function (string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },
  /**
   * @function
   * @member
   * @desc 유료부가서비스 개수 및 금액 계산, 출력( 즉답검색 case 7 , 부가서비스 관련 검색시)
   * @param {Object} usingAdditions - 이용중인 부가서비스 리스트 객체
   * @returns {void}
   */
  _calculateAdditionsFee : function (usingAdditions) {
    var addProdList = usingAdditions.addProdList || []; // 이용중인 부가서비스 리스트
    var totalPaidAdditionsCnt = 0;
    var totalUnpaidAdditionsCnt = 0;
    var returnStr1 = '';
    var returnStr2 = '';

    if(addProdList.length > 0) {
      addProdList.map(function(_data){
        if(_data.payFreeYn !== 'Y'){
          totalPaidAdditionsCnt++;
        } else {
          totalUnpaidAdditionsCnt++;
        }
      });
    }

    returnStr1 = totalUnpaidAdditionsCnt + '건';
    returnStr2 = totalPaidAdditionsCnt + '건';

    this.$container.find('.fe-unpaid-additions-cnt').text(returnStr1);
    this.$container.find('.fe-paid-additions-cnt').text(returnStr2);
  },
  /**
   * @function
   * @member
   * @desc 남은데이터 계산, 출력( 즉답검색 case 2 , 데이터 관련 검색시)
   * @param {Object} usageData - 데이터 잔여량 객체
   * @returns {void}
   */
  _calculdateRemainData : function (usageData) {
    var gnrlData = usageData.gnrlData || [];
    var totalRemainUnLimited = false;
    var returnStr = '';
    gnrlData.map(function(_data){
      if ( Tw.UNLIMIT_CODE.indexOf(_data.unlimit) !== -1 ) {
        totalRemainUnLimited = true;
      }
    });
    if ( totalRemainUnLimited ) {
      returnStr = Tw.COMMON_STRING.UNLIMIT;
    } else {
      var totalRemained = 0;
      for(var idx in gnrlData){
        if(!Tw.FormatHelper.isEmpty(gnrlData[idx].remained)){
          totalRemained+= parseInt(gnrlData[idx].remained);
        }
      }
      usageData.totalRemained = Tw.FormatHelper.convDataFormat(totalRemained, Tw.UNIT[Tw.UNIT_E.DATA]);
      returnStr = usageData.totalRemained.data+usageData.totalRemained.unit;
    }
    this.$container.find('.fe-data-remaind').text(returnStr);
  },
  /**
   * @function
   * @member
   * @desc 남은음성잔여량 계산, 출력( 즉답검색 case 8 , 음성잔여량 관련 검색시)
   * @param {Object} usageData - 음성잔여량 객체
   * @returns {void}
   */
  _calculateRemainVoice : function (usageData) {
    var voice = usageData.voice || [];
    var totalRemainUnLimited = false;
    var returnStr = '';
    var whitespace = ' ';
    voice.map(function(_data){
      if ( Tw.UNLIMIT_CODE.indexOf(_data.unlimit) !== -1 ) {
        totalRemainUnLimited = true;
      }
    });
    if ( totalRemainUnLimited ) {
      returnStr = Tw.COMMON_STRING.UNLIMIT;
    } else {
      var totalRemained = 0;
      for(var idx in voice){
        if(!Tw.FormatHelper.isEmpty(voice[idx].remained)){
          totalRemained+= parseInt(voice[idx].remained);
        }
      }
      usageData.totalRemained = Tw.FormatHelper.convVoiceFormat(totalRemained);

      if (usageData.totalRemained.hours > 0) {
        returnStr = usageData.totalRemained.hours + '시간';

        if (usageData.totalRemained.min > 0) {
          returnStr += whitespace + usageData.totalRemained.min + '분';

          if (usageData.totalRemained.sec > 0) {
            returnStr += whitespace + usageData.totalRemained.sec + '초';
          }
        } 
      } else {
        if (usageData.totalRemained.min > 0) {
          returnStr = usageData.totalRemained.min + '분';

          if (usageData.totalRemained.sec > 0) {
            returnStr += whitespace + usageData.totalRemained.sec + '초';
          }
        } else {
          if (usageData.totalRemained.sec > 0) {
            returnStr = usageData.totalRemained.sec + '초';
          } else {
            returnStr = '0분';  // 음성잔여량 모두 소진시 0분 노출
          }
        }
      }
    }
    this.$container.find('.fe-voice-remaind').text(returnStr);
  },
  /**
   * @function
   * @member
   * @desc 요금약정할인 정보 출력( 즉답검색 case 9 , 요금약정할인 관련 검색시)
   * @param {Object} usageData - 요금약정할인 정보 객체
   * @returns {void}
   */
  _requestFeeAgrmntDiscountInfo : function (feeAgrmntDiscountData) {
    var priceList = feeAgrmntDiscountData.priceList || [];
    var feeAgrmntDcCnt = 0;
    var feeAgrmntDcNm = '';
    var feeAgrmntDcEndDt = '';

    if (priceList.length > 0) {
      feeAgrmntDcCnt = priceList.length;

      if (feeAgrmntDcCnt === 1){
        priceList.map(function(_data){
          feeAgrmntDcNm = _data.disProdNm;
          feeAgrmntDcEndDt = _data.agrmtDcEndDt
        });

        this.$container.find('.fe-fee-agrmnt-name').text(feeAgrmntDcNm);
        this.$container.find('.fe-fee-agrmnt-end-dt').text(Tw.DateHelper.getShortDateNoDot(feeAgrmntDcEndDt));

        $('#fe-fee-agrmnt-info-case1').show();
      } else {
        this.$container.find('.fe-fee-agrmnt-cnt').text(feeAgrmntDcCnt + '건');

        $('#fe-fee-agrmnt-info-case2').show();
      }
    }
  },
/**
   * @function
   * @member
   * @desc 단말할부정보 출력( 즉답검색 case 10 , 단말기 할부금 관련 검색시)
   * @param {Object} usageData - 단말할부 정보 객체
   * @returns {void}
   */
  _requestEqpInstallmentInfo : function (eqpInstallmentData) {
    var installmentList = eqpInstallmentData.installmentList || [];
    var eqpInstallmentPlanCnt = 0;  // 단말할부 건수
    var remainEqpInstallmentAmt = '';   // 잔여 단말할부금
    var remainEqpInstallmentMonth = '';    // 잔여 할부개월수

    if (installmentList.length > 0) {
      eqpInstallmentPlanCnt = installmentList.length;

      if (eqpInstallmentPlanCnt > 1) {
        // 할부시작일을 기준으로 내림차순 정렬
        installmentList.sort(function(a, b) {
          return parseFloat(b.allotStaDt) - parseFloat(a.allotStaDt);
          // return parseFloat(a.allotStaDt) - parseFloat(b.allotStaDt);
        });
      }

      remainEqpInstallmentAmt = installmentList[0].invBamt;
      remainEqpInstallmentMonth = installmentList[0].invRmn;

      this.$container.find('.fe-remain-eqp-installment-amt').text(Tw.FormatHelper.convNumFormat(Number(remainEqpInstallmentAmt)) + Tw.CURRENCY_UNIT.WON);
      this.$container.find('.fe-remain-eqp-installment-month').text(remainEqpInstallmentMonth + Tw.DATE_UNIT.MONTH);

      if (eqpInstallmentPlanCnt === 1) {
        $('#fe-eqp-installment-info-case1').show();
      } else {
        this.$container.find('.fe-remain-eqp-installment-cnt').text((eqpInstallmentPlanCnt-1) + '건');
        $('#fe-eqp-installment-info-case2').show();
      }
    }
  },
  /**
   * @function
   * @member
   * @desc 실시간 이용요금 요청( 즉답검색 case 3 )
   * @param {Number} count - 요청 count
   * @returns {void}
   */
  _requestRealTimeFee : function (count) {
    this._apiService.request(Tw.API_CMD.BFF_05_0022, { count: count }, {})
        .done($.proxy(function(res){
          this._requestRealTimeCallback(res,count);
        },this))
        .fail(function () {
          this._requestRealTimeFeeFail();
        });
  },
  /**
   * @function
   * @member
   * @desc 실시간 이용요금 요청 콜백
   * @param {Object} res - 실시간 이용요금 리턴
   * @param {Number} cnt - 요청 count
   * @returns {void}
   */
  _requestRealTimeCallback : function (res,cnt) {
    if(res.code===Tw.API_CODE.CODE_00){
      if( res.result.hotBillInfo && res.result.hotBillInfo[0] && res.result.hotBillInfo[0].record1 ){
        Tw.CommonHelper.endLoading('.container-wrap');
        this.$container.find('.fe-realtime-fee').text(res.result.hotBillInfo[0].totOpenBal2+Tw.CURRENCY_UNIT.WON);
        this.$container.find('.paymentcharge-box.type03').removeClass('none');
      }else if(cnt>=2){
        this._requestRealTimeFeeFail();
      }else{
        setTimeout($.proxy(this._requestRealTimeFee,this,cnt+1),2500);
      }
    }else{
      this._requestRealTimeFeeFail();
    }
  },
  /**
   * @function
   * @member
   * @desc 실시간 이용요금 요청 실패 콜백
   * @returns {void}
   */
  _requestRealTimeFeeFail : function () {
    Tw.CommonHelper.endLoading('.container-wrap');
    if(this._searchInfo.totalcount<=1){
      this._historyService.replaceURL(this._nowUrl+'&from=empty');
    }
  },
  /**
   * @function
   * @member
   * @desc svcInfo 요청 및 초기화 실행
   * @returns {void}
   */
  _init : function () {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
        .done($.proxy(function(res){
          if(res.code===Tw.API_CODE.CODE_00){
            this._svcInfo = res.result;
          }
          this._nextInit();
        },this))
        .fail($.proxy(this._nextInit,this));
  }
};
