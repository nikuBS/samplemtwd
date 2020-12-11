/**
 * @file 전체메뉴 관련 처리
 * @author Hakjoon Sim
 * @since 2018-12-02
 */

/**
 * @constructor
 * @param  {Boolean} notAboutMenu - 전체메뉴가 아닌 다른 목적으로 객체 생성 시
 */
Tw.MenuComponent = function (notAboutMenu) {
  if ( notAboutMenu ) {
    return;
  }

  $(document).ready($.proxy(function () {
    this.$container = $('#common-menu');
    this.$gnbBtn = $('#fe-bt-gnb');
    this.$header = $('#header');

    if ( !this.$container.length || !this.$gnbBtn.length ) {
      return;
    }

    this._historyService = new Tw.HistoryService();
    this._tidLanding = new Tw.TidLandingComponent();
    this._nativeService = Tw.Native;
    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;

    

    this.$closeBtn = undefined;
    this.$menuArea = undefined;
    this.$userName = undefined;
    this.$nickName = undefined;
    this.$svcNumber = undefined;

    this._isLogin = false;
    this._isMultiLine = false;
    this._svcInfo = undefined;
    this._tid = undefined;
    this._memberType = undefined; // 0: normal, 1: number unregistered, 2: no svc
    this._isPPS = false;

    this._isOpened = false;
    this._isMenuSet = false;

    this._menuRedisErrorCount = 0;

    this._menuSearchComponent = null;

    this._init();
    this._bindEvents();

    new Tw.XtractorService(this.$container);
  }, this));
};

Tw.MenuComponent.prototype = { // 각 menu 사이에 padding이 필요한 항목들 hard coding
  TOP_PADDING_MENU: {
  },

  REAL_TIME_ITEM: { // 실시간 정보가 필요한 메뉴들 정의 (요금, 실시간 데애터 잔여량, 멤버쉽 정보 등)
    M000194: 'data',
    M000233: 'bill',
    M000301: 'svcCnt'
  },

  XTRACTOR_CODE: { 
  },

  TRACKER_CODES: [
   
  ],

  /**
   * @function
   * @desc back 버튼 등으로 인한 hash값 변경시 메뉴 닫도록...
   */
  _init: function () {
    $(window).on('hashchange', $.proxy(this._checkAndClose, this));
    this._nativeService.setGNB(this);


    // Cache elements
    this.$closeBtn = this.$container.find('#fe-close');
    this.$menuArea = this.$container.find('#fe-menu-area');
    this.$svcNumber = this.$container.find('#fe-svc-number');
  },
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onOutLink, this));
    this.$container.on('click', '#fe-refund', $.proxy(this._onRefund, this));
    this.$container.on('click', '.fe-menu-link', $.proxy(this._onMenuLink, this));
    this.$container.on('click', '.fe-t-noti', $.proxy(this._onTNoti, this));
    this.$container.on('click', '.fe-userinfo', $.proxy(this._onUserInfo, this));
    this.$container.on('click', '.fe-bt-regi-svc', $.proxy(this._onRegisterLine, this));
    this.$gnbBtn.on('click', $.proxy(this._onGnbBtnClicked, this));
    this.$closeBtn.on('click', $.proxy(this._onClose, this));

    this.$container.on('click', '.fe-bt-login', $.proxy(this._onClickLogin, this));
    this.$container.on('click', '.fe-bt-logout', $.proxy(this._onClickLogout, this));
    this.$container.on('click', '#fe-signup', $.proxy(this._onSignUp, this));
    this.$container.on('click', 'button.more', $.proxy(this._onDepthOpened, this));
    this.$header.on('click', '[data-url]', this._onClickUrlButton);

    this.$container.on('click touchend', 'a', $.proxy(this._onTelClicked, this));

    this.$container.on('click', '[data-target="familyActionBtn"]', $.proxy(this._familyActionSheet, this));
    // this.$container.on('click','.btn-floating',$.proxy(this._familyActionSheetClose, this));
  },
 
  /**
   * @function
   * @desc login 클릭 시 처리
   */
  _onClickLogin: function () {
    this._tidLanding.goLogin(location.pathname + location.search);
  },

  _familyActionSheet: function(event) {
    var $target = $(event.currentTarget);
    var hbsName = 'actionsheet_family';
    var listData = [
      {'txt' : 'T-world Biz', 'url' : 'http://b2b.tworld.co.kr/cs/main.bc', 'eid':'MWMA_A10_B80_C1199-19', 'title': 'Open new window'},
      {'txt' : 'Korean', 'url' : 'https://m.tworld.co.kr/', 'eid':'MWMA_A10_B80_C1199-20', 'title': 'Open new window'},
      {'txt' : 'NUGU', 'url' : 'https://www.nugu.co.kr/', 'eid':'MWMA_A10_B80_C1199-21', 'title': 'Open new window'},
      {'txt' : 'You can be anything you want when you are 0', 'url' : 'https://www.younghandong.com/', 'eid':'MWMA_A10_B80_C1199-22', 'title': 'Open new window'},
      {'txt' : 'Creating the Age of Hyper-Innovation for YOU', 'url' : 'https://www.sktinsight.com/121472', 'eid':'MWMA_A10_B80_C1199-23', 'title': 'Open new window'},
      {'txt' : 'ADT Caps', 'url' : 'https://m.adtcaps.co.kr/', 'eid':'MWMA_A10_B80_C1199-28', 'title': 'Open new window'}
    ];

    this._popupService.open({
      hbs: hbsName,
      layer: true,
      data: [{ list: listData }],
      btnfloating : { attr: 'type="button"', 'class': 'tw-popup-closeBtn', 'id': 'familysite-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE }
    },
    $.proxy(this._conditionChangeEvtInit, this, $target),
    $.proxy(this._conditionChangeEvtClose, this, $target),
    'family', $target);
  },

  _conditionChangeEvtInit: function ($target, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer);
    $layer.on('click', '.fe-outlink', $.proxy(this._onOutLinkWithATag, this));
    //$layer.on('click', '#familysite-closeBtn', function() { $target.focus(); } );
    $layer.on('click', '.tw-popup-closeBtn', function() { $target.focus(); } );
  },

  // 안씀. 조건변경 팝업 닫히면..
  _conditionChangeEvtClose: function () {
    
  },

  /**
   * @function
   * @desc logout 클릭 시 처리
   */
  _onClickLogout: function () {
    if (this._isSimpleLogin) {
      this._tidLanding.goSLogout();
      return;
    }
    this._tidLanding.goLogout();
  },

  /**
   * @function
   * @desc 회원가입 관련 처리
   * @param  {Object} e - click event
   */
  _onSignUp: function (e) {
    if (Tw.BrowserHelper.isApp()) {
      this._tidLanding.goSignup(location.pathname + location.search);
    } else {
      var url = e.currentTarget.value;
      this._goOrReplace(url);
    }
  },

  /**
   * @function
   * @desc 헤더영역에 햄버거 메뉴 클릭시 동작 정의
   */
  _onGnbBtnClicked: function () {
    if (this.$container.find('.fe-menu-section').hasClass('none')) {
      this.$container.find('.fe-menu-section').removeClass('none');
    }

    this.$container.attr('aria-hidden', 'false');

    this._isOpened = true;
    if ( !this._isMenuSet ) { // redis에서 메뉴구성정보 조회는 해당 url에서 최초 한번만 조회함
      // retrieve redis
      this._apiService.request(Tw.NODE_CMD.GET_MENU, {}) // redis에서 메뉴트리 구성 조회
        .then($.proxy(function (res) {
          this._menuRedisErrorCount = 0;
          if ( res.code === Tw.API_CODE.CODE_00 ) {
            this._isLogin = res.result.isLogin;
            if ( this._isLogin ) {
              this._isMultiLine = parseInt(res.result.userInfo.expsSvcCnt, 10)  > 1;
              this._svcInfo = res.result.userInfo;
              this._tid = res.result.userInfo.userId;
              this._isSimpleLogin = res.result.userInfo.loginType !== 'T';
            }
            this._modifyMenu(
              res.result.isLogin,
              res.result.userInfo 
            );
            this._isMenuSet = true;
            Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.CHANGE_LOGIN_STATUS, 'N');
          }
        }, this));
        /*
        .fail($.proxy(function (err) {
          if (this._menuRedisErrorCount === 0) {  // Try one time more
            this._menuRedisErrorCount += 1;
            this._onGnbBtnClicked();
            return;
          } else {
            this._menuRedisErrorCount = 0;
          }
        }, this));
        */
    }

    this.$container.find('#fe-close').focus();  // 웹 접근성, 포커스 메뉴 div로 이동
  },

  /**
   * @function
   * @desc t알림 클릭시 알림 리스트 화면 노출, 클릭한 경우 t알림 모두 확인한 것으로 간주하고 빨간점 제거
   * @param  {Object} e
   */
  _onTNoti: function (e) { // T-noti 클릭하여 진입 시 아이콘에 빨간 점 제거
    if ( !this._tNotifyComp ) {
      this._tNotifyComp = new Tw.TNotifyComponent();
    }
    this._tNotifyComp.openWithHash(this._tid, e, 'menu');
    this.$container.find('.fe-t-noti').removeClass('on');
    this.$container.find('#fe-empty-t-noti').attr('aria-hidden', 'false');
    this.$container.find('#fe-new-t-noti').attr('aria-hidden', 'true');

    this.$container.attr('aria-hidden', 'true');
  },

  /**
   * @function
   * @desc 사용자 정보 영역 클릭 시 동작 정의, 등록된 회선이 2개 이상인 경우에만 회선관리 actionsheet 노출
   * @param  {} $event
   */
  _onUserInfo: function ($event) {
    var $target = $($event.currentTarget);
    // if ( this._isMultiLine ) {
      if ( !this._lineComponent ) {
        // OP002-5925 : [FE] (W-1911-065-02) 2019 App./모바일웹접근성 샘플링 결과 반영(수정)
        this._lineComponent = new Tw.LineComponent(null, null, false, this.$gnbBtn);
      }
      this._historyService.goBack();  // #menu hash 제거하기 위해      
      // this._lineComponent.onClickLine(this._svcInfo.svcMgmtNum, $target);
      this._lineComponent.onClickGlobalLineView(this._svcInfo.svcMgmtNum, this._svcInfo.svcAttrCd, $target);

    // }
  },

  /**
   * @function
   * @desc 등록된 회선이 없는 경우 회선등록 화면으로 이동
   */
  _onRegisterLine: function () {
    this._historyService.replaceURL('/en/common/member/line/register?type=02');
    return false;
  },

  /**
   * @function
   * @desc 메뉴를 닫을 경우 url 에 남아 있는 hash 처리
   */
  _onClose: function () {
    this._isOpened = false;
    this.$container.attr('aria-hidden', 'true');
    if ( window.location.hash.indexOf('menu') !== -1 ) {
      this._historyService.goBack();
    }
    $('.h-menu button').focus();
  },

  /**
   * @function
   * @desc hash값 변경이 감지될 경우 menu close
   */
  _checkAndClose: function () {
    if ( window.location.hash.indexOf('menu') === -1 && this._isOpened ) {
      this.$closeBtn.click();
    } else if (this._tid && !this.$container.hasClass('user-type')  ) {
      this.$container.addClass('user-type');
    }
  },

  /**
   * @function
   * @desc 외부링크 클릭시 외브 브라우저로 이동
   * @param  {Object} e - click event
   */
  _onOutLink: function (e) {
    var url = e.currentTarget.value;
    Tw.CommonHelper.openUrlExternal(url);
  },

  _onOutLinkWithATag: function (e) {
    e.preventDefault();
    e.stopPropagation();

    var url = e.currentTarget.getAttribute('value');
    Tw.CommonHelper.openUrlExternal(url);
  }, 

  /**
   * @function
   * @desc 각각의 메뉴 클릭시 해당 화면으로 이동
   * @param  {Object} e - click event
   */
  _onMenuLink: function (e) {
    var $target = $(e.currentTarget);
    var url = $target.val();

    if(Tw.BrowserHelper.isApp() && $target.hasClass('fe-show-data-charge')) {
      Tw.CommonHelper.showDataCharge($.proxy(this._customizeExternal, this, url));
    } else {
      if ( url.indexOf('http') !== -1 ) {
        this._customizeExternal(url);
      } else {
        this._goOrReplace(url);
      }
    }
  },

  /**
   * @function
   * @desc 외부 URL 랜딩처리. (※ 티# 나의 방문예약 페이지인 경우만 인앱이동)
   * @param url
   */
  _customizeExternal: function (url) {
    var _url = Tw.Environment.environment === 'prd' ? Tw.OUTLINK.T_SHOP.PRD : Tw.OUTLINK.T_SHOP.DEV;
    _url += '/my/booking/list';
    if (url.indexOf(_url) > -1) {
      url += '?sso_login_id='+this._svcInfo.userId+'&svc_num=' + this._svcInfo.svcMgmtNum;
      Tw.CommonHelper.openUrlInApp(url);
      return;
    }
    Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @function
   * @desc 무료문자 클릭시 native 로 무료문자 호출, 회원정보, 선불폰 사용여부에 따른 alert 처리
   */
  _onFreeSMS: function () {

    // OP002-5783 : [VOC]문자보내기 AOS10 대응
    /*if(Tw.BrowserHelper.isAndroid()) {
      var osVersion = Tw.BrowserHelper.getAndroidVersion();
      var majorVersion = 0;

      if ( !Tw.FormatHelper.isEmpty(osVersion) ) {
        majorVersion = osVersion.split('.')[0];
        if(Tw.FormatHelper.isNumber(majorVersion)) {
          majorVersion = Number(majorVersion);
        }
      }

      if(Tw.BrowserHelper.isAndroid() && (majorVersion > 9 || Number(Tw.BrowserHelper.getOsVersion()) > 28 )) {
        this._popupService.openAlert(
          Tw.MENU_STRING.OPTIMIZING_AOS10,
          '',
          Tw.BUTTON_LABEL.CONFIRM,
          null,
          'menu_optimizing_aos10'
        );
        return;
      }
    }*/

    /*
    OP002-8494 : [FE] 무료문자 Android 10 지원을 위한 수정 배포
    노출 조건 : 안드로이드 OS 버전 10 이상 / App 버전 T world 5.0.14(대문자 패키지) 미만, T world 5.0.15(소문자 패키지) 미만
    안내문구 : 안드로이드 10 최적화되었습니다. 최신 버전으로 업데이트 후 이용해 주세요.
    */
    if(Tw.BrowserHelper.isAndroid()) {
      var osVersion = Tw.BrowserHelper.getAndroidVersion();
      var majorVersion = 0;

      if ( !Tw.FormatHelper.isEmpty(osVersion) ) {
        majorVersion = osVersion.split('.')[0];
        if(Tw.FormatHelper.isNumber(majorVersion)) {
          majorVersion = Number(majorVersion);
        }
      }

      var userAgentString = Tw.BrowserHelper.getUserAgent();
      var currentVersion = userAgentString.match(/\|appVersion:([\.0-9]*)\|/)[1];

      if(currentVersion === null || currentVersion === '') {
         return;
      }

      this._currentVersion = currentVersion;
      var versionArr = currentVersion.split('.');
      var appPackageValue = 0;
      var appPackageType = '';

      if(versionArr.length === 4) {
        appPackageValue = versionArr[versionArr.length-2];
      } else if(versionArr.length === 3){
        appPackageValue = versionArr[versionArr.length-1];
      }

      appPackageType = (appPackageValue % 2) ? 'lower' : 'upper';  // 대/소문자(대문자 짝수, 소문자 홀수) 패키지 구분

      if(Tw.BrowserHelper.isAndroid() && (majorVersion > 9 || Number(Tw.BrowserHelper.getOsVersion()) > 28 ) &&
        (this._isAosPackageType(appPackageType))) {
        this._popupService.openAlert(
          Tw.MENU_STRING.OPTIMIZING_AOS10,
          '',
          Tw.BUTTON_LABEL.CONFIRM,
          null,
          'menu_optimizing_aos10'
        );
        return;
      }
    }

    if (this._memberType === 1) {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms'
      );
      return ;
    }

    if (this._isPPS) {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS_PPS,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms_pps'
      );
      return;
    }

    // 무료 문자 점검 Alert
    var nowDate = Tw.DateHelper.getDateCustomFormat('YYYYMMDDHHmmss');
    if (nowDate >= Tw.MENU_STRING.FREE_SMS_OVERHAUL.start && nowDate <= Tw.MENU_STRING.FREE_SMS_OVERHAUL.end) {
      this._popupService.openAlert(
        Tw.MENU_STRING.FREE_SMS_OVERHAUL.msg,
        '',
        Tw.BUTTON_LABEL.CONFIRM,
        null,
        'menu_free_sms_overhaul'
      );
      return;
    }
    Tw.CommonHelper.openFreeSms();
    return false;
  },

  /**
   * @function
   * @desc 현재 사용중인 단말기의 버전을 대상으로 대/소문자 패키지 유효성 체크
   * @param
   */
  _isAosPackageType: function (currentAppType) {
    switch (currentAppType) {
      case 'upper': // 대문자 패키지(이번 비교 대상 5.0.14)
        return Tw.ValidationHelper.checkVersionValidation(Tw.COMPARE_TARGET_VERSION.UPPPER_PACKAGE, this._currentVersion, 3);

      case 'lower': // 소문자 패키지(이번 비교 대상 5.0.15)
        return Tw.ValidationHelper.checkVersionValidation(Tw.COMPARE_TARGET_VERSION.LOWER_PACKAGE, this._currentVersion, 3);

      default:
        return true;
    }
  },

  /**
   * @function
   * @desc 미환급급 조회 선택시 해당 화면으로 이동
   * @param  {Object} e - click event
   */
  _onRefund: function (e) {
    if ( !this._isLogin ) { // 비로그인 상태일 경우 인증 먼저 필요함
      (new Tw.CertificationSelect()).open({
        authClCd: Tw.AUTH_CERTIFICATION_KIND.F
      }, '', null, null, $.proxy(function (res) {
        if (res.code !== Tw.API_CODE.CERT_CANCEL) {
          this._goOrReplace(e.currentTarget.value);
        }
      }, this));
    } else {
      this._goOrReplace(e.currentTarget.value);
    }
  },

  /**
   * @function
   * @desc 가공된 정보를 바탕으로 실제 메뉴를 그려 주는 부분, 로그인/회원정보 등을 바탕으로 보여줄 부분과 숨길 부분들을 처리
   * @param  {Boolean} isLogin - 현재 로그인 여부
   * @param  {Object} userInfo - 현재 사용자 정보
   * @param  {Object} menu - 계층으로 표현된 메뉴트리 정보
   */
  _modifyMenu: function (isLogin, userInfo) {
    var isApp = Tw.BrowserHelper.isApp();

    // When login or logout
    var isLoginSelector = isLogin ? '.fe-when-login' : '.fe-when-logout';
    this.$container.find(isLoginSelector).removeClass('none');

    if ( isLogin ) {
      userInfo.expsSvcCnt = parseInt(userInfo.expsSvcCnt, 10);
      userInfo.nonSvcCnt = parseInt(userInfo.nonSvcCnt, 10);

      this._isPPS = userInfo.pps;
      // 0: normal, 1: number unregistered, 2: no svc
      this._memberType = userInfo.expsSvcCnt > 0 ? 0 : (userInfo.nonSvcCnt > 0 ? 1 : 2);
      if(this._isPPS)
        this._memberType = 3;

      switch ( this._memberType ) {
        case 0:
          //M1, M3, M4인경우만 처리해야함
          if (userInfo.svcAttrCd.indexOf('M1') !== -1 || userInfo.svcAttrCd.indexOf('M3') !== -1 || userInfo.svcAttrCd.indexOf('M4') !== -1 ) {
            var nonSvcCnt = Number(userInfo.nonSvcCnt);
            var expsSvcCnt = Number(userInfo.expsSvcCnt);
            var total = expsSvcCnt + nonSvcCnt;

            if( nonSvcCnt > 0 || total > 1 ) { // 회선이 없는(단일회선) 경우 언더라인과 링크를 제거.
              this.$container.find('.fe-when-login-type0 button').removeClass('none');
            } else {
              this.$container.find('.fe-when-login-type0 span').removeClass('none');
              this.$container.find('.fe-when-login-type0 span').text(Tw.FormatHelper.getDashedCellPhoneNumber(userInfo.svcNum));
            }
            this.$svcNumber.text(Tw.FormatHelper.getDashedCellPhoneNumber(userInfo.svcNum));
            this.$container.find('.fe-when-login-type0').removeClass('none');
          }
          else//무선회선 외 설정상태
          {
            this.$container.find('.fe-when-login-type3').removeClass('none');
          }
          break;
        case 1:
          this.$container.find('.fe-when-login-type1').removeClass('none');
          break;
        case 2:
          this.$container.find('.fe-when-login-type2').removeClass('none');
          break;
        case 3:
          this.$container.find('.fe-when-login-type3').removeClass('none');
          break;          
        default:
          break;
      }

    } else {
      this.$container.removeClass('user-type');
    }

    // When web
    if ( !Tw.BrowserHelper.isApp() ) {
      this.$container.find('.fe-when-web').removeClass('none');
    }

    // When logout and app
    if ( isApp && !isLogin ) {
      this.$container.find('.fe-when-logout-and-app').removeClass('none');
    }

    // When app or login
    if ( isApp || isLogin ) {
      this.$container.find('.fe-when-app-or-login').removeClass('none');
    }

    if (isApp) {
      this.$container.find('.fe-remove-when-app').remove();
    }

    // when app and login(Tlogin, not simple login)
    if (isApp && isLogin && userInfo.loginType === 'T') {
      this.$container.find('.fe-when-app-and-login').removeClass('none');
    }

    // when app and login(Tlogin, not simple login)
    if (!isApp && !isLogin) {
      this.$container.find('.fe-when-web-and-logout').removeClass('none');
    }



    if ( isLogin && (userInfo.svcAttrCd.indexOf('M1') !== -1 || userInfo.svcAttrCd.indexOf('M3') !== -1 || userInfo.svcAttrCd.indexOf('M4') !== -1 ) && !this._isPPS) {
      $('.fe-menu-realtime').each($.proxy(function (i, elem) {
        var type = elem.getAttribute('data-value');
        switch ( type ) {
          case 'svcCnt':  // 현재 회선의 요금제 정보 출력
          
            if (Tw.FormatHelper.isEmpty(userInfo.svcMgmtNum) || Tw.FormatHelper.isEmpty(userInfo.prodNmEn)) {
              $(elem).remove();
            } else {
              $(elem).text(userInfo.prodNmEn);
              $(elem).closest('.bt-depth1').addClass('txt-long');
            }
            break;
          case 'bill': // 이용요금 출력
          
            if (Tw.FormatHelper.isEmpty(userInfo.svcMgmtNum)) {
              $(elem).remove();
              break;
            }

            var cmd = Tw.API_CMD.BFF_04_0008;
            if (userInfo.actRepYn === 'Y') {
              cmd = Tw.API_CMD.BFF_04_0009;
            }
            var storeBill = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.HOME_BILL));
            if (Tw.FormatHelper.isEmpty(storeBill) ||
                Tw.DateHelper.convDateFormat(storeBill.expired).getTime() < new Date().getTime() ||
                userInfo.svcMgmtNum !== storeBill.svcMgmtNum) {

              this._apiService.request(cmd, {})
                .then($.proxy(function (res) {
                  if ( res.code === Tw.API_CODE.CODE_00 ) {
                    this._showBillInfo(elem, res, true);
                  } else {
                    $(elem).remove();
                  }
                }, this))
                .fail(function () {
                  $(elem).remove();
                });
            } else {
              this._showBillInfo(elem, storeBill.data, false);
            }
            break;
          case 'data': // 데이터/음성 잔여량 표시
          
            if (Tw.FormatHelper.isEmpty(userInfo.svcMgmtNum)) {
              $(elem).remove();
              break;
            }
               
            this._apiService.request(Tw.SESSION_CMD.BFF_05_0001, {})
              .then($.proxy(function (res) {
                if ( res.code === Tw.API_CODE.CODE_00 ) {
                  var text = this._parseUsage(res.result);
                  if ( !text ) {
                    $(elem).remove();
                    return;
                  }
                  $(elem).html(text);
                } else {
                  $(elem).remove();
                }
              }, this))
              .fail(function () {
                $(elem).remove();
              });
            break;
 
          default:
            break;
        }
      }, this));
    }

    skt_landing.action.gnb();

 

    // 웹접근성 (단독 라인일 경우 userinfo 영역에 안내 메세지 추가)
    // if (this._isLogin && !this._isMultiLine) {
    //   this.$container.find('.fe-userinfo').attr('title', '다회선일 경우에만 사용 가능합니다.');
    // }
  },

  /**
   * @function
   * @desc 이용요금 표시
   * @param  {Element} elem - 이용요금 표기할 elem
   * @param  {Object} resp - BFF 조회 후 받은 response
   * @param  {Boolean} needToStore - true일 경우 해당 정보 local storage 에 cache
   */
  _showBillInfo: function(elem, resp, needToStore) {
    var info = resp.result;
    var total = info.amt;
    var month = info.invDt.match(/\d\d\d\d(\d\d)\d\d/);

    if (month) {
      // month = parseInt(month[1], 10) + 1 + Tw.DATE_UNIT.MONTH_S;
      month = parseInt(month[1], 10);

      if(month === 12) {
        month = 0;
      }
 
      $(elem).html('<span>'+Tw.MONTHS[month]+'</span>. ₩<span>'+total+'</span>');
    } else {
      $(elem).remove();
    }

    if (needToStore) {
      var storeData = {
        data: resp,
        expired: Tw.DateHelper.add5min(new Date()),
        svcMgmtNum: this._svcInfo.svcMgmtNum
      };
      Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_BILL, JSON.stringify(storeData));
    }
  },


  /**
   * @function
   * @desc 데이터/음성 잔여량을 format대로 가공하여 return ex) 33GB/130분
   * @param  {Object} info - BFF로 부터 받은 response
   */
  _parseUsage: function (info) {
    if ( info.gnrlData.length === 0 ) {
      return undefined;
    }

    var ret = '';
    var includeFee = false;
    var includeFeeCnt = 0;
    var isAllFee = false;

    var dataRemained = _.reduce(info.gnrlData, function (memo, item) {
      if ( memo < 0 ) { // Unlimit
        return memo;
      }

      if ( Tw.UNLIMIT_CODE.indexOf(item.unlimit) !== -1 ) {
        memo = -1;
        return memo;
      }

      memo += +item.remained;

      if(item.unit === Tw.UNIT_E.FEE) {
        includeFee = true;
        includeFeeCnt++;
      }
      return memo;
    }, 0);

    // gnrlData에 원단위만 존재하는 경우, 실시간 데이터 잔여량을 보여주지 않는다.
    if ( includeFeeCnt === info.gnrlData.length && includeFee) {
      isAllFee = true;
    }

    if ( dataRemained < 0 ) {
      ret = Tw.COMMON_STRING.UNLIMIT;
    } else if(!isAllFee) {
      var dataObj = Tw.FormatHelper.convDataFormat(dataRemained, Tw.UNIT[Tw.UNIT_E.DATA]);
      ret = '<span>'+dataObj.data+'</span>' + dataObj.unit;
    }

    if ( !Tw.FormatHelper.isEmpty(info.voice[0]) ) {
      var voiceRemained = info.voice[0];
      if (info.voice.length > 1) {
        voiceRemained = _.find(info.voice, function (item) {
          return +item.remained > 0 || (Tw.UNLIMIT_CODE.indexOf(item.unlimit) !== -1);
        });

        if (!voiceRemained) {
          voiceRemained = info.voice[0];
        }
      }

      ret += '/';
      if ( Tw.UNLIMIT_CODE.indexOf(voiceRemained.unlimit) !== -1 ) {
        ret += Tw.COMMON_STRING.UNLIMIT;
      } else {
        var voiceObj = Tw.FormatHelper.convVoiceFormat(parseInt(voiceRemained.remained, 10));
        var min = voiceObj.hours * 60 + voiceObj.min;
        if ( min === 0 && voiceObj.sec !== 0 ) {
          ret += voiceObj.sec + Tw.VOICE_UNIT.SEC;
        } else {
          ret += voiceObj.hours * 60 + voiceObj.min + Tw.VOICE_UNIT.MIN;
        }
      }
    }

    return ret;
  },

  /**
   * @function
   * @desc menu에서 다른 화면으로 이동시 replace url이 기본
   * @param  {String} url - 이동할 url
   */
  _goOrReplace: function (url) {  // History가 1인 경우 replaceURL 하지 말고 goLoad
    if (history && history.length === 1) {
      this._historyService.goLoad(url);
    } else {
      this._historyService.replaceURL(url);
    }
  },


  /**
   * @function
   * @desc 현재 메뉴 open 여부를 return
   */
  isOpened: function () {
    return this._isOpened;
  },

  /**
   * @function
   * @desc close menu
   */
  close: function () {
    this.$closeBtn.click();
  },


  /**
   * @function
   * @desc 웹 접근성 관련 처리로 하위메뉴가 열린 경우 관련된 aria-* 속성들 처리
   * @param  {Object} e - click event
   */
  _onDepthOpened: function (e) {  // 웹접근성 aria-pressed 적용
    var $btn = $(e.currentTarget);
    var pressed = $btn.attr('aria-pressed');
    if (pressed === 'true') {
      $btn.attr('aria-pressed', false);
    } else {
      $btn.attr('aria-pressed', true);
    }

  },

  /**
   * @function
   * @desc url 이동 처리
   * @param  {Object} e - click event
   */
  _onClickUrlButton: function(e) {
    location.href = e.currentTarget.dataset.url;
  },

  /**
   * @function
   * @desc iOS 에서 전화번호 더블클릭시 문제 완화시키기 위한 처리
   * @param  {Object} e - click event
   */
  _onTelClicked: function (e) { // iOS double click 문제 해결하기 위함
    var href = e.currentTarget.href;
    if (href.indexOf('tel:') === 0) {
      window.location = href;
      return false;
    }
    return true;
  },

  /**
   * @function
   * @desc 나의 혜택/할인 정보 값 설정
   * @param elem
   * @param bill
   * @param combination
   * @param loyalty
   */
  _showBenefitDiscountInfo: function (elem, bill, combination, loyalty) {
    var benefitDiscount = 0;
    if (bill.code === Tw.API_CODE.CODE_00) {
      // 요금할인
      benefitDiscount += bill.result.priceAgrmtList.length;
      // 클럽
      benefitDiscount += bill.result.clubYN ? 1 : 0;
      // 척척
      benefitDiscount += bill.result.chucchuc ? 1 : 0;
      // T끼리플러스
      benefitDiscount += bill.result.tplus ? 1 : 0;
      // 요금할인- 복지고객
      benefitDiscount += (bill.result.wlfCustDcList && bill.result.wlfCustDcList.length > 0) ?
        bill.result.wlfCustDcList.length : 0;
      // 특화 혜택
      benefitDiscount += bill.result.thigh5 ? 1 : 0;
      benefitDiscount += bill.result.kdbthigh5 ? 1 : 0;
      // 데이터 선물
      benefitDiscount += (bill.result.dataGiftYN)? 1 : 0;
    }
    // 장기가입
    if (loyalty.code === Tw.API_CODE.CODE_00) {
      // 장기가입 요금
      benefitDiscount += (loyalty.result.dcList && loyalty.result.dcList.length > 0) ?
        loyalty.result.dcList.length : 0;
      // 쿠폰
      benefitDiscount += (loyalty.result.benfList && loyalty.result.benfList.length > 0)? 1 : 0;
    }
    // 결합할인
    if (combination.code === Tw.API_CODE.CODE_00) {
      if (combination.result.prodNm.trim().length > 0) {
        benefitDiscount += Number(combination.result.etcCnt) + 1;
      }
    }
    if(benefitDiscount > 0) {
      $(elem).text(benefitDiscount + Tw.BENEFIT.INDEX.COUNT_SUFFIX);
    } else {
      $(elem).remove();
    }
  },


  /**
   * @function
   * @desc T 로밍 정보 값 설정
   */
  _showUsingRoamingInfo: function (elem, result) {
    $(elem).text(result.prodInfoTxt);
  }
};
