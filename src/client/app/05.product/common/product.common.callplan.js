/**
 * @file 상품 > 공통 > 원장(상세)
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-09-11
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품 코드
 * @param prodTypCd - 상품 유형코드
 * @param settingBtnList - 설정버튼 목록
 * @param lineProcessCase - 회선변경 프로세스 유형값 (ts컨트롤러 참고)
 * @param isPreview - 미리보기 원장 여부
 * @param isAllowJoinCombine - 결합상품 가입 가능 여부
 * @param svcMgmtNum - 서비스관리번호
 * @param bpcpServiceId - BPCP ID
 * @param eParam - BPCP eParam
 */
Tw.ProductCommonCallplan = function(rootEl, prodId, prodTypCd, settingBtnList, lineProcessCase,
  isPreview, isAllowJoinCombine, svcMgmtNum, bpcpServiceId, eParam, loggedYn, svcProdId) {
  // 컨테이너 레이어 선언
  this.$container = rootEl;

  // 공통 모듈 선언
  this._historyService = new Tw.HistoryService();
  this._historyService.init();
  this._popupService = Tw.Popup;
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(this.$container, '/product/callplan?prod_id=' + prodId);
  this._tidLanding = new Tw.TidLandingComponent();
  this._comparePlans = new Tw.ProductMobilePlanComparePlans();
  this._apiService = Tw.Api;

  // 공통 변수 선언
  this._prodId = prodId;
  this._prodTypCd = prodTypCd;
  this._settingBtnList = settingBtnList;
  this._lineProcessCase = lineProcessCase;
  this._isPreview = isPreview === 'Y';
  this._isAllowJoinCombine = isAllowJoinCombine === 'Y';
  this._svcMgmtNum = svcMgmtNum;
  this._bpcpServiceId = bpcpServiceId;
  this._eParam = eParam;
  this._templateBtn = Handlebars.compile($('#fe-templ-btn').html());  // 버튼 영역 Handlebars
  this._templateSetting = Handlebars.compile($('#fe-templ-setting').html()); // 설정 정보 영역 Handlebars
  this._event = null;
  this._loggedYn = loggedYn;
  this._svcProdId = svcProdId;

  this._selectedLine = null; // 현재 선택 되어 있는 회선정보

  // 설정 버튼 목록 컨버팅
  this._convertSettingBtnList();
  // Element 캐싱
  this._cachedElement();
  // 이벤트 바인딩
  this._bindEvent();
  // 최초 동작
  this._init();
  // 웹접근성 보완 처리
  this._coverWebAccessBility();
};

Tw.ProductCommonCallplan.prototype = {

  /**
   * 설정 버튼 목록
   */
  _settingBtnList: [],

  /**
   * 상세 콘텐츠 목록
   */
  _contentsDetailList: [],

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    // 상세 콘텐츠 목록 셋팅
    this._setContentsDetailList();
    // 가입, 해지 버튼을 onload 후에 show 하도록 처리
    this._showReadyOn();
    // back 으로 진입시 가입 여부 로직을 한번 태운다
    if (this._historyService.isBack()) {
      this._procJoinedCheck();
    }
    // 로밍 오토 다이얼 가능여부 조회 영역이 존재할 경우 (사용안함으로 처리되었으나 소스에서 제거하지는 않았음. by 기획)
    if (this.$contents.find('.fe-btn_roaming_auto').length > 0) {
      this._bindRoamingAuto();
    }
    // BPCP ID 가 존재할 경우 BPCP 실행
    if (!Tw.FormatHelper.isEmpty(this._bpcpServiceId)) {
      this._initBpcp();
    }
    // 상품 시각화 원장에서 온T 이미지는 모두 제거
    if (this.$contents.find('.idpt-pc').length > 0) {
      this.$contents.find('.idpt-pc').remove();
    }

    // 혹시 모를 새창 값 셋팅 (웹표준)
    Tw.CommonHelper.replaceExternalLinkTarget(this.$contents);
  },

  /**
   * @function
   * @desc BPCP 서비스 실행
   */
  _initBpcp: function() {
    // BPCP ID 를 BPCP 서비스에 전달
    this._bpcpService.open(this._bpcpServiceId);
    // URL 에서 BPCP param 제거
    history.replaceState(null, document.title, location.origin + '/product/callplan?prod_id=' + this._prodId);
  },

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$btnJoin = this.$container.find('.fe-btn_join'); // 가입 버튼
    this.$btnSetting = this.$container.find('.fe-btn_setting'); // 설정 버튼
    this.$btnTerminate = this.$container.find('.fe-btn_terminate'); // 해지 버튼
    this.$btnContentsDetail = this.$container.find('.fe-btn_contents_detail');  // 상세 콘텐츠 영역
    this.$btnWrap = this.$container.find('.fe-btn_wrap'); // 버튼 영역
    this.$settingWrap = this.$container.find('.fe-setting_wrap'); // 설정 버튼 영역
    this.$reservationWrap = this.$container.find('.fe-reservation_wrap'); // 상담 예약 정보 영역
    this.$btnReadyOn = this.$container.find('.fe-btn_ready_on');  // Onload 후 노출할 버튼들
    this.$comparePlans = this.$container.find('.fe-compare_plans'); // 요금제 비교하기 영역
    this.$goProd = this.$container.find('.fe-go_prod'); // 버튼으로 상품원장 이동하는 것들

    this.$contentsDetailItem = this.$container.find('.fe-contents_detail_item');  // 상세 콘텐츠 보기 버튼
    this.$contentsBtnRoamingAuto = this.$container.find('.fe-btn_roaming_auto');  // 로밍 오토 다이얼 조회 버튼
    this.$contents = this.$container.find('.fe-contents');  // 콘텐츠 영역
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    // 상세 콘텐츠 영역 내 버튼 클릭시
    this.$btnContentsDetail.on('click', $.proxy(this._openContentsDetailPop, this, 'contents_idx'));
    // 요금제 비교하기 클릭 시
    this.$comparePlans.on('click', $.proxy(this._openComparePlans, this));
    // 버튼 상품원장 바로가기 클릭 시
    this.$goProd.on('click', $.proxy(this._goProd, this));
    // 가입 버튼 클릭 시
    this.$container.on('click', '.fe-btn_join', $.proxy(this._goJoinTerminate, this, '01'));
    // 해지 버튼 클릭 시
    this.$container.on('click', '.fe-btn_terminate', $.proxy(this._goJoinTerminate, this, '03'));
    // 설정 버튼 클릭 시
    this.$container.on('click', '.fe-btn_setting', $.proxy(this._procSetting, this));
    // BPCP 항목 클릭 시 (시각화 원장, 배너 등에서 호출)
    this.$container.on('click', '.fe-bpcp', $.proxy(this._detectBpcp, this));
    // 배너 링크 인터셉트
    this.$container.on('click', '.fe-banner_link', $.proxy(this._onBannerLink, this));
    // 시각화 내 외부 링크 지원
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));
    // 시각화 내 상세 콘텐츠 팝업 지원
    this.$contents.on('click', '[data-contents]', $.proxy(this._openContentsDetailPop, this, 'contents'));
    // hbs 팝업 직접 호출 (단일 위약금 제도)
    this.$contents.on('click', '.dmg-contract', $.proxy(this._openCustomPopup, this, 'BS_02_01_02_01'));
    // hbs 팝업 직접 호출 (가입 가능한 요금상품)
    this.$contents.on('click', '.possible-product', $.proxy(this._openCustomPopup, this, 'BS_03_01_01_02'));
    // hbs 팝업 직접 호출 (요금절약 예시보기)
    this.$contents.on('click', '.save_pay', $.proxy(this._openCustomPopup, this, 'BS_04_01_01_01'));
    // hbs 팝업 직접 호출 ((구)클럽T 요금제 상품안내)
    this.$contents.on('click', '.fe-clubt', $.proxy(this._openCustomPopup, this, 'MP_02_02_04_01'));
    // hbs 팝업 직접 호출 (캠퍼스 존 제공 대학교 리스트)
    this.$contents.on('click', '.fe-campuszone', $.proxy(this._openCustomPopup, this, 'MP_02_02_04_02'));
    // 원장 콘텐츠 내 하이퍼링크 인터셉트 (클럽 T 링크 하드코딩 처리를 위함)
    this.$contents.on('click', 'a', $.proxy(this._detectClubT, this));
    // 로밍오토다이얼 조회 영역 존재시 이벤트 바인딩
    if (this.$contentsBtnRoamingAuto.length > 0) {
      this.$contentsBtnRoamingAuto.on('click', $.proxy(this._procRoamingAuto, this));
    }
  },

  /**
   * @function
   * @desc 해당 Element Show
   */
  _showReadyOn: function() {
    this.$btnReadyOn.show().attr('aria-hidden', 'false');
  },

  /**
   * @function
   * @desc 버튼으로 상품원장 이동해야 할 때
   * @param e - 클릭 이벤트
   */
  _goProd: function(e) {
    this._historyService.goLoad('/product/callplan?prod_id=' + $(e.currentTarget).data('prod_id'));
  },

  /**
   * @function
   * @desc 설정 버튼 목록 컨버팅
   */
  _convertSettingBtnList: function() {
    if (Tw.FormatHelper.isEmpty(this._settingBtnList)) {
      return;
    }

    this._settingBtnList = JSON.parse(this._settingBtnList).map(function(item) {
      return {
        'url': item.linkUrl,
        'button-attr': 'data-url="' + item.linkUrl + '"',
        'txt': item.linkNm
      };
    });
  },

  /**
   * @function
   * @desc 요금제 비교하기 실행
   * @param e - 요금제 비교하기 클릭 이벤트
   */
  _openComparePlans: function(e) {
    this._comparePlans.openCompare(this._prodId, true, e);
  },

  /**
   * @function
   * @desc 배너 클릭시 인터셉트
   * @param e - 클릭 이벤트
   * @returns {boolean|*|void}
   */
  _onBannerLink: function(e) {
    var href = Tw.FormatHelper.isEmpty($(e.currentTarget).attr('href')) ? '' : $(e.currentTarget).attr('href');
    if (href.indexOf('custom:') !== -1) {
      return this._onBannerCustomPop(e, href);
    }

    if (Tw.FormatHelper.isEmpty(href.match(/http:\/\/|https:\/\//gi))) {
      return true;
    }

    this._confirmExternalUrl(e);
  },

  /**
   * @function
   * @desc 배너 링크에서 hbs 팝업 직접 호출할 경우 (custom:POPUP_HBS)
   * @param e - 클릭 이벤트
   * @param href - 링크 값
   */
  _onBannerCustomPop: function(e, href) {
    e.preventDefault();
    e.stopPropagation();

    this._openCustomPopup(href.replace('custom:', ''));
  },

  /**
   * @function
   * @desc 외부 링크 지원
   * @param e - 클릭 이벤트
   * @returns {*|void}
   */
  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  /**
   * @function
   * @desc 외부 링크 실행
   * @param href - 링크 값
   */
  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  },

  /**
   * @function
   * @desc hbs 팝업 직접 실행
   * @param hbsCode - hbs 파일명
   */
  _openCustomPopup: function(hbsCode) {
    this._popupService.open({
      hbs: hbsCode,
      layer: true
    }, $.proxy(this._bindCustomPop, this, hbsCode));
  },

  /**
   * @function
   * @desc 원장 내 하이퍼링크에 클럽T 링크 있을 경우 인터셉트
   * @param e - 클릭 이벤트
   */
  _detectClubT: function(e) {
    var clubT = 'http://m2.tworld.co.kr/normal.do?serviceId=S_PROD2001&viewId=V_PROD2001&menuId=5,1&prod_id=TW00000103&cate=3',
      clubT2 = 'http://m2.tworld.co.kr/normal.do?serviceId=S_PROD2001&viewId=V_PROD2001&menuId=5,1&prod_id=TW00000104';

    if (['NA00004428', 'NA00004429'].indexOf(this._prodId) === -1 ||
      $(e.currentTarget).attr('href') !== clubT && $(e.currentTarget).attr('href') !== clubT2) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    this._openCustomPopup('MP_02_02_04_01');
  },

  /**
   * @function
   * @desc hbs 팝업 직접 호출시 이벤트 바인딩 해야 할 경우
   * @param hbsCode - hbs 파일명
   * @param $popupContainer - 팝업 컨테이너
   */
  _bindCustomPop: function(hbsCode, $popupContainer) {
    if (hbsCode !== 'MP_02_02_04_02') {
      return;
    }

    this.$campusLists = $popupContainer.find('.data-type01-wrap');
    $popupContainer.on('change', 'input', $.proxy(this._handleSelectList, this));
  },

  /**
   * @function
   * @desc 캠퍼스존 hbs 이벤트
   * @param e - 탭 클릭 이벤트
   */
  _handleSelectList: function(e) {
    var selected = Number(e.currentTarget.getAttribute('data-idx') || 0),
      i = 0,
      list;
    for (; i < this.$campusLists.length; i++) {
      list = this.$campusLists[i];
      if (i === selected) {
        list.className = list.className.replace('none', '');
      } else if (list.className.indexOf('none') < 0) {
        list.className += ' none';
      }
    }
  },

  /**
   * @function
   * @desc 설정 버튼 클릭 시
   * @returns {*|void|void|*}
   */
  _procSetting: function() {
    // 미리보기 상품원장일 경우 차단
    if (this._isPreview) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.PREVIEW);
    }
    // 설정 버튼이 2개 이상일 경우 액션시트 실행
    if (this._settingBtnList.length > 1) {
      this._openSettingPop();
    } else {
      // 설정 버튼 주소값에 BPCP 포함되어 있을 경우
      if (this._bpcpService.isBpcp(this._settingBtnList[0].url)) {
        return this._bpcpService.open(this._settingBtnList[0].url);
      // 설정 버튼 클릭시 아웃링크 일 경우 (과금팝업노출)
      } else if (this._settingBtnList[0].url.indexOf('BEU:') !== -1) {
        return Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, this._settingBtnList[0].url.replace('BEU:', '')));
      // 설정 버튼 클릭시 아웃링크 일 경우 (과금팝업노출없이 실행)
      } else if (this._settingBtnList[0].url.indexOf('NEU:') !== -1) {
        return this._openExternalUrl(this._settingBtnList[0].url.replace('NEU:', ''));
      }
      // 설정 페이지 이동
      this._historyService.goLoad(this._settingBtnList[0].url + '?prod_id=' + this._prodId);
    }
  },

  /**
   * @function
   * @desc 상세 콘텐츠 목록 컨버팅
   */
  _setContentsDetailList: function() {
    _.each(this.$contentsDetailItem, $.proxy(this._pushContentsDetail, this));
  },

  /**
   * @function
   * @desc 상세 콘텐츠 컨버팅
   * @param item - 상세 콘텐츠
   */
  _pushContentsDetail: function(item) {
    var $item = $(item);
    if (Tw.FormatHelper.isEmpty($item.data('title'))) {
      return;
    }

    this._contentsDetailList.push({
      title: $item.data('title'),
      contentsClass: $item.data('class'),
      contents: $item.html()
    });
  },

  /**
   * @function
   * @desc 가입/해지 버튼 클릭시 상품 카테고리 별 사전체크 API
   * @param joinTermCd - 01 가입 03 해지
   * @returns {{PARAMS: {}, API_CMD: *}|null}
   */
  _getPreCheckApiReqInfo: function(joinTermCd) {
    // 모바일 요금제, 모바일 부가서비스, 로밍 요금제, 로밍 부가서비스, 할인프로그램
    if (['AB', 'C', 'H_P', 'H_A', 'G'].indexOf(this._prodTypCd) !== -1) {
      return {
        API_CMD: joinTermCd === '01' ? Tw.API_CMD.BFF_10_0007 : Tw.API_CMD.BFF_10_0151,
        PARAMS: {}
      };
    }

    // 유선 부가서비스
    if (['E_I', 'E_P', 'E_T'].indexOf(this._prodTypCd) !== -1) {
      return {
        API_CMD: joinTermCd === '01' ? Tw.API_CMD.BFF_10_0164 : Tw.API_CMD.BFF_10_0168,
        PARAMS: {}
      };
    }

    // 결합상품
    if (this._prodTypCd === 'F') {
      return {
        API_CMD: joinTermCd === '01' ? Tw.API_CMD.BFF_10_0119 : Tw.API_CMD.BFF_10_0113,
        PARAMS: {}
      };
    }

    return null;
  },

  /**
   * @function
   * @desc 가입/해지 버튼 클릭시
   * @param joinTermCd - 01 가입 03 해지
   * @param e - 클릭 이벤트
   * @returns {void|*|void}
   */
  _goJoinTerminate: function(joinTermCd, e) {
    // 미리보기 상품원장일 경우 차단
    if (this._isPreview) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.PREVIEW);
    }

    var url = $(e.currentTarget).data('url');

    // 링크 값이 아웃링크일 경우 (과금팝업 노출)
    if (url.indexOf('BEU:') !== -1) {
      return Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, url.replace('BEU:', '')));
    // 링크 값이 아웃링크일 경우 (과금팝업 노출안함)
    } else if (url.indexOf('NEU:') !== -1) {
      return this._openExternalUrl(url.replace('NEU:', ''));
    }

    // 사용자 로그인 여부 검사
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._event = e;
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._getSvcInfoRes, this, joinTermCd, url))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc BPCP 체크
   * @param e - 클릭 이벤트
   * @returns {boolean}
   */
  _detectBpcp: function(e) {
    var url = $(e.currentTarget).attr('href');
    // 링크 값이 BPCP 가 아닐경우 차단
    if (!this._bpcpService.isBpcp(url)) {
      return true;
    }
    // BPCP 서비스 실행
    this._bpcpService.open(url, null, null);

    e.preventDefault();
    e.stopPropagation();
  },

  /**
   * @function
   * @desc 사용자 정보 값 확인
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param resp - 사용자 정보 응답 값
   * @returns {*|*|void}
   */
  _getSvcInfoRes: function(joinTermCd, url, resp) {
    Tw.CommonHelper.endLoading('.container');

    // 로그인 세션 없을 경우
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      var targetUrl = '/product/callplan?prod_id=' + this._prodId;

      // BPCP 주소일 경우
      if (this._bpcpService.isBpcp(url)) {
        targetUrl += '&bpcpServiceId=' + url.replace('BPCP:', '');
      }

      return this._tidLanding.goLogin(targetUrl);
    }

    // 미등록 회선일 경우
    if (Tw.FormatHelper.isEmpty(resp.result.svcMgmtNum)) {
      this._isGoMemberLine = false;
      return this._popupService.openConfirm(null, Tw.ALERT_MSG_PRODUCT.NEED_LINE,
        $.proxy(this._setGoMemberLine, this), $.proxy(this._onCloseMemberLine, this));
    }

    // BPCP 주소일 경우
    if (this._bpcpService.isBpcp(url)) {
      return this._bpcpService.open(url, resp.result.svcMgmtNum);
    }

    // 인터넷/집전화/TV 이용고객이 아닌 회선이 결합상품 가입 시도시
    if (joinTermCd === '01' && this._prodTypCd === 'F' && !this._isAllowJoinCombine) {
      return this._openCombineNeedWireError();
    }

    
    if(joinTermCd !== '01' && this._prodTypCd === 'C'){ // 해지방어 팝업
      return new Tw.ProductMobilePlanAddDowngrade(this.$container, {
        svcMgmtNum: this._svcMgmtNum, 
        prodId: this._prodId, 
        svcProdId: this._svcProdId
      }, this._event
        , $.proxy(this._procPreCheck, this, joinTermCd, url)
        , $.proxy(this._reqTerminateDefense, this, joinTermCd, url));
      //this._reqTerminateDefense(joinTermCd, url);
      //this._procPreCheck(joinTermCd, url)
        
    }else if (joinTermCd !== '01') {// 해지에 해당될 경우 즉시 사전체크 호출
      return this._procPreCheck(joinTermCd, url);
    }

    // 상품안내 팝업 프로세스 진입
    // 기존 DG방어 프로세스는 상품안내 팝업 이후 진입
    this._reqChangeGuide(joinTermCd, url, resp.result.prodId, resp.result.mbrNm);
  },

  /**
   * @function
   * @desc 상품안내 팝업 Redis 조회
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param currentProdId - 현재 상품코드
   * @param mbrNm - 고객명
   */
  _reqChangeGuide: function(joinTermCd, url, currentProdId, mbrNm) {
    this._apiService.request(Tw.NODE_CMD.GET_CHANGEGUIDE, {
      value: currentProdId + '/' + this._prodId
    }).done($.proxy(this._resChangeGuide, this, joinTermCd, url, currentProdId, mbrNm));
  },

  /**
   * @function
   * @desc 상품안내 팝업 Redis 조회 응답 처리
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param currentProdId - 현재 상품코드
   * @param resp - 상품안내 팝업 Redis 조회 응답값
   * @param mbrNm - 고객명
   * @returns {*}
   */
  _resChangeGuide: function(joinTermCd, url, currentProdId, mbrNm, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      // DG방어 팝업 호출
      return this._reqDownGrade(joinTermCd, url, currentProdId, mbrNm);
      // return this._onLineProcess(joinTermCd, url);
    }

    this._openChangeGuide(joinTermCd, url, currentProdId, mbrNm, resp.result);
  },

  /**
   * @function
   * @desc 상품안내 팝업 프로세스 실행
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param currentProdId - 현재 상품코드
   * @param mbrNm - 고객명
   * @param changeGuideInfo - 상품안내 팝업 응답 값
   */
  _openChangeGuide: function(joinTermCd, url, currentProdId, mbrNm, changeGuideInfo) {
    this._popupService.openModalTypeA(
      changeGuideInfo.titleNm, // 제목
      changeGuideInfo.guidMsgCtt, // 내용
      '요금제 변경', // 확인버튼 텍스트
      null, // openCallback
      $.proxy(this._confirmChangeGuide, this, joinTermCd, url, currentProdId, mbrNm), // confirmCallback
      null, // closeCallback
      'change_guide', // hashName
      null, // align
      null // event
    );
  },

  /**
   * @function
   * @desc 상품안내 팝업 종료 후 DG방어 진입
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param currentProdId - 현재 상품코드
   * @param mbrNm - 고객명
   */
  _confirmChangeGuide: function(joinTermCd, url, currentProdId, mbrNm) {
    // Close popup and Req DG
    this._popupService.close();
    this._reqDownGrade(joinTermCd, url, currentProdId, mbrNm);
  },

  /**
   * @function
   * @desc 다운그레이드 Redis 조회
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param currentProdId - 현재 상품코드
   * @param mbrNm - 고객명
   */
  _reqTerminateDefense: function(joinTermCd, url) {
    this._apiService.request(Tw.API_CMD.BFF_10_0038, { scrbTermCd: 'V' },{}, [this._prodId] )
      .done($.proxy(this._resTerminateDefense, this, joinTermCd, url));

  },

  /**
   * @function
   * @desc 다운그레이드 Redis 조회 응답 처리
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param currentProdId - 현재 상품코드
   * @param resp - DG방어 1뎁스 Redis 조회 값
   * @param mbrNm - 고객명
   * @returns {*}
   */
  _resTerminateDefense: function(joinTermCd, url, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      return this._procPreCheck(joinTermCd, url);
    }

    resp.result.guidMsgCtt = Tw.CommonHelper.replaceCdnUrl(resp.result.prodTmsgHtmlCtt);
    resp.result.htmlMSgYn = 'Y';

    new Tw.ProductMobilePlanAddDowngradeProtect(this.$container, resp.result, resp.result.prodId, '',
      this._prodId, this._event, $.proxy(this._procPreCheck, this, joinTermCd, url));
  },

  /**
   * @function
   * @desc 다운그레이드 Redis 조회 응답 처리
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param currentProdId - 현재 상품코드
   * @param resp - DG방어 1뎁스 Redis 조회 값
   * @param mbrNm - 고객명
   * @returns {*}
   */
  _resDownGrade: function(joinTermCd, url, currentProdId, mbrNm, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      return this._onLineProcess(joinTermCd, url);
    }

    this._openDownGrade(joinTermCd, url, currentProdId, mbrNm, resp.result);
  },

  /**
   * @function
   * @desc 다운그레이드 Redis 조회
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param currentProdId - 현재 상품코드
   * @param mbrNm - 고객명
   */
  _reqDownGrade: function(joinTermCd, url, currentProdId, mbrNm) {
    this._apiService.request(Tw.NODE_CMD.GET_DOWNGRADE, {
      type_yn: 'N',
      value: currentProdId + '/' + this._prodId
    }).done($.proxy(this._resDownGrade, this, joinTermCd, url, currentProdId, mbrNm));
  },

  /**
   * @function
   * @desc 다운그레이드 Redis 조회 응답 처리
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param currentProdId - 현재 상품코드
   * @param resp - DG방어 1뎁스 Redis 조회 값
   * @param mbrNm - 고객명
   * @returns {*}
   */
  _resDownGrade: function(joinTermCd, url, currentProdId, mbrNm, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      return this._onLineProcess(joinTermCd, url);
    }

    this._openDownGrade(joinTermCd, url, currentProdId, mbrNm, resp.result);
  },

  /**
   * @function
   * @desc 다운그레이드 프로세스 실행
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param currentProdId - 현재 상품코드
   * @param mbrNm - 고객명
   * @param downGradeInfo - DG방어 응답 값
   */
  _openDownGrade: function(joinTermCd, url, currentProdId, mbrNm, downGradeInfo) {
    new Tw.ProductMobilePlanDowngradeProtect(this.$container, downGradeInfo, currentProdId, mbrNm,
      this._prodId, this._event, $.proxy(this._onLineProcess, this, joinTermCd, url));
  },

  /**
   * @function
   * @desc 회선 변경 프로세스 실행
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @returns {*}
   */
  _onLineProcess: function(joinTermCd, url) {
    // 해지 및 회선변경 프로세스 case 2, 4 에 해당되면 즉시 사전체크 호출
    if (joinTermCd === '01' && (this._lineProcessCase === 'B' || this._lineProcessCase === 'D')) {
      return this._procPreCheck(joinTermCd, url);
    }

    // 회선변경 프로세스 진입
    this._historyService.goLoad('/product/line-change?p_mod=' + (this._lineProcessCase === 'A' ? 'select' : 'change') +
      '&t_prod_id=' + this._prodId + '&t_url=' + encodeURIComponent(url + '?prod_id=' + this._prodId));
  },

  /**
   * @function
   * @desc 사전체크 API 요청
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 응답 성공시 이동할 주소
   * @returns {*|undefined}
   */
  _procPreCheck: function(joinTermCd, url) {
    // 사전체크 호출할 API
    var preCheckApi = this._getPreCheckApiReqInfo(joinTermCd);

    this._url = url;
    this._joinTermCd = joinTermCd;

    // 사전체크 API가 없는 경우엔 skip
    if (Tw.FormatHelper.isEmpty(preCheckApi)) {
      this._joinTermCd = null;
      return this._procAdvanceCheck({ code: '00' });
    }

    // 사전체크 API 요청
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(preCheckApi.API_CMD, preCheckApi.PARAMS, null, [this._prodId])
      .done($.proxy(this._procAdvanceCheck, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 회선등록하기 선택시
   */
  _setGoMemberLine: function() {
    this._isGoMemberLine = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 미등록 회선 안내 팝업 닫기시
   */
  _onCloseMemberLine: function() {
    if (this._isGoMemberLine) {
      this._historyService.goLoad('/common/member/line');
    }
  },

  /**
   * @function
   * @desc 상세 콘텐츠 팝업 열기
   * @param key - 상세 콘텐츠 인덱스
   * @param e - 클릭 이벤트
   */
  _openContentsDetailPop: function(key, e) {
    var $item = $(e.currentTarget),
      contentsIndex = $item.data(key);

    // 상세 콘텐츠 목록에 해당 인덱스가 없으면 차단
    if (Tw.FormatHelper.isEmpty(this._contentsDetailList[contentsIndex])) {
      return;
    }

    // 상세 콘텐츠 팝업 실행
    this._popupService.open({
      hbs: 'MP_02_02_06',
      layer: true,
      list: this._contentsDetailList
    }, $.proxy(this._focusContentsDetail, this, contentsIndex), null, 'contents_detail', e);
  },

  /**
   * @function
   * @desc 상세 콘텐츠 팝업 열린 후 앵커 이동
   * @param contentsIndex - 상세 컨텐츠 인덱스
   * @param $popupContainer - 팝업 컨테이너 레이어
   */
  _focusContentsDetail: function(contentsIndex, $popupContainer) {
    var $target = $popupContainer.find('[data-anchor="contents_' + contentsIndex + '"]'),
      $scrollContainer = $popupContainer.find('.container');

    if (contentsIndex === 0) {
      $scrollContainer.scrollTop(0);
    } else {
      $scrollContainer.scrollTop($target.offset().top - $('.page-header').height());
    }

    setTimeout(function() {
      $target.focus();
    }, 500);

    Tw.CommonHelper.replaceExternalLinkTarget($popupContainer);
  },

  /**
   * @function
   * @desc 결합상품 가입 불가 안내 팝업
   */
  _openCombineNeedWireError: function() {
    this._popupService.open({
      url: Tw.Environment.cdn + '/hbs/',
      'title': Tw.BENEFIT_TBCOMBINATION_ERROR.TITLE,
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': Tw.BENEFIT_TBCOMBINATION_ERROR.CONTENT,
      'bt': [{
        style_class: 'fe-btn_go_reservation',
        txt: Tw.BENEFIT_TBCOMBINATION_ERROR.BTN_TEXT
      }],
      'bt_b': [{
        style_class: 'pos-right tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.BACK
      }]
    }, $.proxy(this._bindCombineNeedWireError, this));
  },

  /**
   * @function
   * @desc 결합상품 가입 불가 안내팝업 내 가입상담예약 버튼 링크 이벤트 바인딩
   * @param $popupContainer - 팝업 컨테이너 레이어
   */
  _bindCombineNeedWireError: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_go_reservation', $.proxy(this._goReservation, this));
  },

  /**
   * @function
   * @desc 가입상담에약(결합상품) 이동
   */
  _goReservation: function() {
    this._popupService.closeAll();
    setTimeout(function() {
      this._historyService.goLoad('/product/wireplan/join/reservation?type_cd=combine');
    }.bind(this));
  },

  /**
   * @function
   * @desc 설정버튼이 2개이상일때 설정 액션시트 팝업 실행
   */
  _openSettingPop: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        { 'list': this._settingBtnList }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindSettingBtnListEvent, this), $.proxy(this._goSetting, this), 'setting_pop');
  },

  /**
   * @function
   * @desc 설정 액션시트 이벤트 바인딩
   * @param $layer - 설정 액션시트 레이어
   */
  _bindSettingBtnListEvent: function($layer) {
    $layer.find('[data-url]').on('click', $.proxy(this._setSettingGoUrl, this));

    // 웹접근성 대응
    Tw.CommonHelper.focusOnActionSheet($layer);
  },

  /**
   * @function
   * @desc 설정 액션시트에서 특정 항목 클릭 시
   * @param e - 클릭 이벤트
   */
  _setSettingGoUrl: function(e) {
    this._settingGoUrl = $(e.currentTarget).data('url');
    this._popupService.close();
  },

  /**
   * @function
   * @desc 설정 페이지 이동
   */
  _goSetting: function() {
    if (Tw.FormatHelper.isEmpty(this._settingGoUrl)) {
      return;
    }

    this._historyService.goLoad(this._settingGoUrl + '?prod_id=' + this._prodId);
  },

  /**
   * @function
   * @desc 유선 부가서비스 사전체크
   */
  _getWireAdditionsPreCheck: function() { // @TODO 예약취소 GrandOpen 이후 범위
    // if (['D_I', 'D_P', 'D_T'].indexOf(this._prodTypCd) === -1 || this._joinTermCd !== '03') {
    //   return;
    // }
    //
    // this._apiService.request(Tw.API_CMD.BFF_10_0098, { joinTermCd: '04' }, {}, [this._prodId])
    //   .done($.proxy(this._resWireAdditionsPreCheck, this));
  },

  /**
   * @function
   * @desc 예약취소 사전체크 API 응답값 처리 및 예약 여부 조회 요청
   * @param resp - API 응답 값
   */
  _resWireAdditionsPreCheck: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0166, { joinTermCd: '04' }, {}, [this._prodId])
      .done($.proxy(this._resWireAdditionsPreCheckInfo, this));
  },

  /**
   * @function
   * @desc 예약 여부 값 응답 처리
   * @param resp - API 응답 값
   */
  _resWireAdditionsPreCheckInfo: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return;
    }

    var title = resp.result.scrbTermClCd === '01' ? Tw.ALERT_MSG_PRODUCT.ALERT_3_A68 : Tw.ALERT_MSG_PRODUCT.ALERT_3_A69;
    this._popupService.openConfirmButton(null, title, $.proxy(this._onConfirmWireAdditionsReservationCancel, this),
      $.proxy(this._onCloseWireAdditionsReservationCancel, this));
  },

  /**
   * @function
   * @desc 예약 취소 버튼 클릭 시
   */
  _onConfirmWireAdditionsReservationCancel: function() {
    this._isWireAdditionsReservationCancel = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 예약 취소 팝업 닫기 후 이동 처리
   */
  _onCloseWireAdditionsReservationCancel: function() {
    if (!this._isWireAdditionsReservationCancel) {
      return;
    }

    this._historyService.goLoad('/product/wireplan/reservation-cancel?prod_id=' + this._prodId);
  },

  /**
   * @function
   * @desc 사전체크 API 응답값 처리
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procAdvanceCheck: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop($.proxy(this._getWireAdditionsPreCheck, this));
    }

    if (this._prodTypCd === 'F' && resp.result.combiProdScrbYn !== 'N' && this._joinTermCd === '01') {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.ALERT_ALREADY_PRODUCT).pop();
    }

    if (this._prodTypCd === 'F' && resp.result.termPsblYn !== 'Y' && this._joinTermCd === '03') {
      return Tw.Error(null, Tw.ALERT_MSG_PRODUCT.ALERT_ALREADY_TERM_PRODUCT).pop();
    }

    this._historyService.goLoad(this._url + '?prod_id=' + this._prodId);
  },

  /**
   * @function
   * @desc 로밍 오토 다이얼 영역 이벤트 바인딩
   */
  _bindRoamingAuto: function() {
    var $container = this.$contents.find('.fe-btn_roaming_auto').parents('.idpt-form-wrap');
    $container.on('keyup input', '#phoneNum02', $.proxy(this._detectRoamingAutoInput, this));
  },

  /**
   * @function
   * @desc 로밍 오토 다이얼 input 관리
   * @param e - keyup input 이벤트
   */
  _detectRoamingAutoInput: function(e) {
    var $input = $(e.currentTarget);
    $input.val($input.val().replace(/[^0-9]/g, ''));

    if ($input.val().length > 0 && Tw.ValidationHelper.isCellPhone('010' + $input.val())) {
      this.$contentsBtnRoamingAuto.removeAttr('disabled').prop('disabled', true);
    } else {
      this.$contentsBtnRoamingAuto.attr('disabled', 'disabled').prop('disabled', false);
    }
  },

  /**
   * @function
   * @desc 로밍 오토 다이얼 조회 API 요청
   * @param e - 조회 버튼 클릭 이벤트
   */
  _procRoamingAuto: function(e) {
    var $form = $(e.currentTarget).parents('.idpt-form-wrap'),
      $phoneNum01 = $form.find('#phoneNum01'),
      $phoneNum02 = $form.find('#phoneNum02');

    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(function(resp) {
        if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
          return this._tidLanding.goLogin('/product/callplan?prod_id=' + this._prodId);
        }

        if (Tw.FormatHelper.isEmpty($phoneNum01.val()) || Tw.FormatHelper.isEmpty($phoneNum02.val())) {
          return;
        }

        this._apiService.request(Tw.API_CMD.BFF_10_0174, {
          roamCp1: $phoneNum01.val(),
          roamCp2: $phoneNum02.val()
        }).done($.proxy(this._procRoamingAutoRes, this));
      }, this));
  },

  /**
   * @function
   * @param resp - API 응답 값
   * @returns {*|void|*}
   */
  _procRoamingAutoRes: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    if (resp.result.mySvcNum !== 'Y' || resp.result.sktChk !== 'SKT') {
      return this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A81.TITLE);
    }

    if (resp.result.autoDialPhone === '1' || resp.result.autoDialPhone === '3') {
      return this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A79.TITLE);
    }

    this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A80.TITLE);
  },

  /**
   * @function
   * @desc 페이지 Back 으로 진입시 가입 여부를 체크한다.
   */
  _procJoinedCheck: function() {
    if (this._loggedYn === 'N') {
      return;
    }

    var apiList = [
      {
        command: Tw.NODE_CMD.UPDATE_SVC,  // 세션 리로드
        params: {}
      },
      {
        command: Tw.NODE_CMD.GET_SVC_INFO,  // 리로드된 세션정보 가져오기
        params: {}
      }
    ];

    this._apiService.requestArray(apiList)
      .done($.proxy(function(updateSvcResp, svcInfoResp) {
        if (svcInfoResp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(svcInfoResp.result)) {
          return;
        }

        // 가입여부 체크, 그 여부에 따른 버튼 생성을 위해 10_0001 에서 plmProdList, linkBtnList 값을 사용해야 한다.
        this._apiService.request(Tw.API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [this._prodId])
          .done($.proxy(this._procJoinCheckReq, this, svcInfoResp.result));
      }, this));
  },

  /**
   * @function
   * @desc 그외 케이스 가입여부 체크
   * @param svcInfoResp - 사용자 세션 값
   * @param basicInfoResp - 상품 가본정보 API 응답 값 (10_0001)
   * @returns {*}
   */
  _procJoinCheckReq: function(svcInfoResp, basicInfoResp) {
    if (basicInfoResp.code !== Tw.API_CODE.CODE_00) {
      return;
    }

    if (['AB', 'D_I', 'D_P', 'D_T'].indexOf(this._prodTypCd) !== -1) {
      return this._procJoinCheckRes(svcInfoResp, basicInfoResp.result, { code: '00', result: null });
    }

    var reqParams = Tw.FormatHelper.isEmpty(basicInfoResp.result.plmProdList) ? {} : {
      mappProdIds: (_.map(basicInfoResp.result.plmProdList, function(item) {
        return item.plmProdId;
      })).join(',')
    };

    // 모바일 부가서비스, 로밍 요금제/부가서비스 가입여부 체크
    if (['C', 'H_P', 'H_A'].indexOf(this._prodTypCd) !== -1) {
      return this._apiService.request(Tw.API_CMD.BFF_05_0040, reqParams, {}, [this._prodId])
        .done($.proxy(this._procJoinCheckRes, this, svcInfoResp, basicInfoResp.result));
    }

    // 유선 부가서비스 가입여부 체크
    if (['E_I', 'E_P', 'E_T'].indexOf(this._prodTypCd) !== -1) {
      return this._apiService.request(Tw.API_CMD.BFF_10_0109, reqParams, {}, [this._prodId])
        .done($.proxy(this._procJoinCheckRes, this, svcInfoResp, basicInfoResp.result));
    }

    // 결합상품/할인프로그램 가입여부 체크
    this._apiService.request(Tw.API_CMD.BFF_10_0119, {}, {}, [this._prodId])
      .done($.proxy(this._procJoinCheckRes, this, svcInfoResp, basicInfoResp.result));
  },

  /**
   * @function
   * @desc 가입 여부 체크 API 응답 처리
   * @param svcInfoResp - 사용자 세션 값
   * @param basicInfoResp - API 응답 값 (10_0001)
   * @param resp - 사전체크 API 응답 값
   */
  _procJoinCheckRes: function(svcInfoResp, basicInfoResp, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return;
    }

    var isJoinCheck = this._isJoinCheck(svcInfoResp, basicInfoResp, resp.result),
      linkBtnList = this._convertLinkBtnList(basicInfoResp.linkBtnList, basicInfoResp.prodSetYn),
      isProdScrb = basicInfoResp.prodScrbYn === 'Y',
      isProdTerm = basicInfoResp.prodTermYn === 'Y',
      isProdSet = basicInfoResp.prodSetYn === 'Y';

    this.$btnWrap.empty();
    this.$settingWrap.empty();

    // 가입 되어 있으며, 해지 가능 할 경우
    if (isJoinCheck && isProdTerm && linkBtnList.terminate.length > 0) {
      this._appendButton(linkBtnList.terminate[0], false);
    }

    // 가입 되어 있으며, 설정 버튼 있고, 설정 가능할 경우
    if (isJoinCheck && isProdSet && linkBtnList.setting.length > 0) {
      this._appendSettingWrap(linkBtnList.setting);
    }

    // 가입 되어 있으며, 설정 불가능하거나 설정 버튼이 없을 경우
    if (isJoinCheck && (!isProdSet || linkBtnList.setting.length < 1)) {
      this._appendSettingWrap(null);
    }

    // 가입 되어 있으며, 예약 영역이 노출되어 있을 경우 삭제
    if (isJoinCheck && this.$reservationWrap.length > 0) {
      this.$reservationWrap.remove();
    }

    // 가입 안되어 있으며, 가입 가능 할 경우
    if (!isJoinCheck && isProdScrb && basicInfoResp.prodStCd === 'E1000' && linkBtnList.join.length > 0) {
      this._appendButton(linkBtnList.join[0], true);
    }
  },

  /**
   * @function
   * @desc 버튼 영역 처리
   * @param btnData - 버튼 데이터
   * @param isJoinBtn - 가입 버튼 여부
   */
  _appendButton: function(btnData, isJoinBtn) {
    this.$btnWrap.html(this._templateBtn({
      btClass: isJoinBtn ? 'fe-btn_join' : 'fe-btn_terminate',
      url: btnData.linkUrl,
      btName: btnData.linkNm
    }));
  },

  /**
   * @function
   * @desc 설정 정보 영역 처리
   * @param btnData - 설정 버튼 데이터
   */
  _appendSettingWrap: function(btnData) {
    if (!Tw.FormatHelper.isEmpty(btnData)) {
      this._settingBtnList = btnData.map(function (item) {
        return {
          'url': item.linkUrl,
          'button-attr': 'data-url="' + item.linkUrl + '"',
          'txt': item.linkNm
        };
      });
    }

    this.$settingWrap.html(this._templateSetting({
      settingBtn: Tw.FormatHelper.isEmpty(btnData) ? '' : btnData[0].linkNm,
      isSettingBtnList: btnData && btnData.length > 1
    }));
  },

  /**
   * @function
   * @desc 버튼 데이터 컨버팅
   * @param linkBtnList - 버튼 목록
   * @param prodSetYn - 상품의 설정가능여부
   * @returns {{isJoinReservation: boolean, join: Array, terminate: Array, setting: Array}}
   */
  _convertLinkBtnList: function(linkBtnList, prodSetYn) {
    var joinBtnList = [],
      settingBtnList = [],
      termBtnList = [],
      isJoinReservation = false;

    _.each(linkBtnList, function(item) {
      if (item.linkTypCd === 'SE' && prodSetYn !== 'Y') {
        return true;
      }

      if (item.linkTypCd === 'SC') {
        joinBtnList.push(item);
        return true;
      }

      if (item.linkTypCd === 'SE' && prodSetYn === 'Y') {
        settingBtnList.push(item);
        return true;
      }

      if (item.linkTypCd === 'CT') {
        isJoinReservation = true;
        return true;
      }

      termBtnList.push(item);
    });

    return {
      join: joinBtnList,
      setting: settingBtnList,
      terminate: termBtnList,
      isJoinReservation: isJoinReservation
    };
  },

  /**
   * @function
   * @desc 상품 가입여부 체크
   * @param svcInfoResp - 사용자 세션
   * @param basicInfoResp - 상품 기본정보 API 응답 값 (10_0001)
   * @param joinedInfoResp - 가입여부 조회 값
   * @returns {boolean}
   */
  _isJoinCheck: function(svcInfoResp, basicInfoResp, joinedInfoResp) {
    var plmProdList = $.extend([this._prodId], _.map(basicInfoResp.plmProdList, function(item) {
      return item.plmProdId;
    }));

    if (['AB', 'D_I', 'D_P', 'D_T'].indexOf(this._prodTypCd) !== -1) {
      return plmProdList.indexOf(svcInfoResp.prodId) !== -1;
    }

    if (['C', 'H_P', 'H_A'].indexOf(this._prodTypCd) !== -1) {
      return joinedInfoResp.isAdditionUse === 'Y';
    }

    if (['E_I', 'E_P', 'E_T'].indexOf(this._prodTypCd) !== -1) {
      return joinedInfoResp.wiredSuplSvcScrbYn === 'Y';
    }

    return joinedInfoResp.combiProdScrbYn === 'Y';
  },

  _coverWebAccessBility: function() {
    this.$container.on('click', '.fe-tab > li', function(e) {
      e.preventDefault();
      e.stopPropagation();

      $(this).find('a').trigger('click');
    });

    this.$container.on('click', '.fe-tab > li > a', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });
  }

};
