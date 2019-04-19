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

    this._menuTpl = undefined;

    this.$closeBtn = undefined;
    this.$menuArea = undefined;
    this.$userName = undefined;
    this.$nickName = undefined;
    this.$svcNumber = undefined;

    this._isLogin = false;
    this._svcMgmtNum = undefined;
    this._isMultiLine = false;
    this._svcAttr = undefined;
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
    M001778: 'M001778',  // 이용안내
    M000537: 'M000537',  // T Apps
    M000812: 'M000812'   // Direct shop
  },

  REAL_TIME_ITEM: { // 실시간 정보가 필요한 메뉴들 정의 (요금, 실시간 데애터 잔여량, 멤버쉽 정보 등)
    M000194: 'data',
    M000233: 'bill',
    M000301: 'svcCnt',
    M000570: 'membership'
  },

  XTRACTOR_CODE: { // 유동적 메뉴에 대한 통계코드 matching
    M000194: 'CMMA_A11_B3-8',
    M000197: 'CMMA_A11_B3-9',
    M000203: 'CMMA_A11_B3-10',
    M000216: 'CMMA_A11_B3-11',
    M000220: 'CMMA_A11_B3-12',
    M000233: 'CMMA_A11_B3-13',
    M000245: 'CMMA_A11_B3-14',
    M000254: 'CMMA_A11_B3-15',
    M000257: 'CMMA_A11_B3-16',
    M000261: 'CMMA_A11_B3-17',
    M000268: 'CMMA_A11_B3-18',
    M000280: 'CMMA_A11_B3-19',
    M000290: 'CMMA_A11_B3-20',
    M000301: 'CMMA_A11_B3-21',
    M000316: 'CMMA_A11_B3-22',
    M000319: 'CMMA_A11_B3-23',
    M000320: 'CMMA_A11_B3-24',
    M000341: 'CMMA_A11_B3-25',
    M000308: 'CMMA_A11_B3-26',
    M000344: 'CMMA_A11_B3-27',
    M000353: 'CMMA_A11_B3-28',
    M000570: 'CMMA_A11_B3-29',
    M000571: 'CMMA_A11_B3-30',
    M001772: 'CMMA_A11_B3-31',
    M001773: 'CMMA_A11_B3-32',
    M000542: 'CMMA_A11_B3-33',
    M000563: 'CMMA_A11_B3-34',
    M000543: 'CMMA_A11_B3-35',
    M000544: 'CMMA_A11_B3-36',
    M000545: 'CMMA_A11_B3-37',
    M000546: 'CMMA_A11_B3-38',
    M000764: 'CMMA_A11_B3-39',
    M000367: 'CMMA_A11_B3-40',
    M000399: 'CMMA_A11_B3-41',
    M000422: 'CMMA_A11_B3-42',
    M000439: 'CMMA_A11_B3-43',
    M000447: 'CMMA_A11_B3-44',
    M000455: 'CMMA_A11_B3-45',
    M000473: 'CMMA_A11_B3-46',
    M000491: 'CMMA_A11_B3-47',
    M000498: 'CMMA_A11_B3-48',
    M000510: 'CMMA_A11_B3-49',
    M000529: 'CMMA_A11_B3-50',
    M000494: 'CMMA_A11_B3-51',
    M001778: 'CMMA_A11_B3-52',
    M000605: 'CMMA_A11_B3-53',
    M000610: 'CMMA_A11_B3-54',
    M001763: 'CMMA_A11_B3-55',
    M000615: 'CMMA_A11_B3-56',
    M000624: 'CMMA_A11_B3-57',
    M000629: 'CMMA_A11_B3-58',
    M000673: 'CMMA_A11_B3-59',
    M000663: 'CMMA_A11_B3-60',
    M000724: 'CMMA_A11_B3-61',
    M000727: 'CMMA_A11_B3-62',
    M000729: 'CMMA_A11_B3-63',
    M000731: 'CMMA_A11_B3-64',
    M000735: 'CMMA_A11_B3-65',
    M000762: 'CMMA_A11_B3-66',
    M000812: 'CMMA_A11_B3-67',
    M000813: 'CMMA_A11_B3-68',
    M000814: 'CMMA_A11_B3-69',
    M000815: 'CMMA_A11_B3-70',
    M000816: 'CMMA_A11_B3-71',
    M000817: 'CMMA_A11_B3-72',
    M000818: 'CMMA_A11_B3-73',
    M000819: 'CMMA_A11_B3-74',
    M000820: 'CMMA_A11_B3-75',
    M000821: 'CMMA_A11_B3-76',
    M000537: 'CMMA_A11_B3-77',
    M000118: 'CMMA_A11_B3-78',
    M000119: 'CMMA_A11_B3-79'
  },

  /**
   * @function
   * @desc back 버튼 등으로 인한 hash값 변경시 메뉴 닫도록...
   */
  _init: function () {
    $(window).on('hashchange', $.proxy(this._checkAndClose, this));
    this._nativeService.setGNB(this);
    var template = $('#fe-tpl-menu'); // 각각의 메뉴 추가를 위한 handlebar template
    this._menuTpl = Handlebars.compile(template.html());

    // Cache elements
    this.$closeBtn = this.$container.find('#fe-close');
    this.$menuArea = this.$container.find('#fe-menu-area');
    this.$userName = this.$container.find('#fe-user-name');
    this.$nickName = this.$container.find('#fe-nick-name');
    this.$svcNumber = this.$container.find('#fe-svc-number');
  },
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onOutLink, this));
    this.$container.on('click', '#fe-refund', $.proxy(this._onRefund, this));
    this.$container.on('click', '#fe-btn-simple-login', $.proxy(this._onSimpleLogin, this));
    this.$container.on('click', '.fe-menu-link', $.proxy(this._onMenuLink, this));
    this.$container.on('click', '.fe-bt-free-sms', $.proxy(this._onFreeSMS, this));
    this.$container.on('click', '.fe-t-noti', $.proxy(this._onTNoti, this));
    this.$container.on('click', '.fe-userinfo', $.proxy(this._onUserInfo, this));
    this.$container.on('click', '.fe-bt-regi-svc', $.proxy(this._onRegisterLine, this));
    this.$gnbBtn.on('click', $.proxy(this._onGnbBtnClicked, this));
    this.$closeBtn.on('click', $.proxy(this._onClose, this));

    this.$container.on('click', '.fe-bt-login', $.proxy(this._onClickLogin, this));
    this.$container.on('click', '.fe-bt-logout', $.proxy(this._onClickLogout, this));
    this.$container.on('click', '#fe-signup', $.proxy(this._onSignUp, this));

    this.$container.on('click', '#fe-search-input', $.proxy(this._searchFocus, this));
    this.$container.on('click', 'button.more', $.proxy(this._onDepthOpened, this));
    this.$header.on('click', '[data-url]', this._onClickUrlButton);

    this.$container.on('click touchend', 'a', $.proxy(this._onTelClicked, this));
  },

  /**
   * @function
   * @desc 읽지 않은 t알림 있을 경우 아이콘에 빨간 점 추가
   */
  _checkNewTNoti: function () { // 읽지 않은 신규 noti 있는지 확인하고 있을 경우 아이콘에 빨간 점 추가
    var showNotiIfNeeded = function (latestSeq, self) {
      // native에 가장 최근 읽은 t알림의 seq넘버를 조회하여 가장 최근 받은 t알림 seq넘버와 비교하여 빨간점 추가 여부 결정
      self._nativeService.send(Tw.NTV_CMD.LOAD, { key: Tw.NTV_STORAGE.LAST_READ_PUSH_SEQ },
        $.proxy(function (res) {
          if ( res.resultCode === Tw.NTV_CODE.CODE_00 ) {
            if ( res.params.value !== latestSeq ) {
              // Show red dot!
              self.$container.find('.fe-t-noti').addClass('on');
              self.$container.find('#fe-empty-t-noti').attr('aria-hidden', 'true');
              self.$container.find('#fe-new-t-noti').attr('aria-hidden', 'false');
            }
          } else if ( res.resultCode === Tw.NTV_CODE.CODE_ERROR ) {
            self.$container.find('.fe-t-noti').addClass('on');
            self.$container.find('#fe-empty-t-noti').attr('aria-hidden', 'true');
            self.$container.find('#fe-new-t-noti').attr('aria-hidden', 'false');
          }
        }, self)
      );
    };

    // native에 가장 최근 받은 t알림의 seq 넘버를 조회
    this._nativeService.send(Tw.NTV_CMD.LOAD, { key: Tw.NTV_STORAGE.MOST_RECENT_PUSH_SEQ },
      $.proxy(function (res) {
        if ( res.resultCode === Tw.NTV_CODE.CODE_00 ) {
          showNotiIfNeeded(res.params.value, this);
        }
      }, this)
    );
  },

  /**
   * @function
   * @desc login 클릭 시 처리
   */
  _onClickLogin: function () {
    this._tidLanding.goLogin(location.pathname + location.search);
  },

  /**
   * @function
   * @desc logout 클릭 시 처리
   */
  _onClickLogout: function () {
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
      this.$container.find('.fe-search-section').addClass('none');
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
              this._svcMgmtNum = res.result.userInfo.svcMgmtNum;
              this._svcAttr = res.result.userInfo.svcAttrCd;
              this._tid = res.result.userInfo.userId;
            }
            this._modifyMenu(
              res.result.isLogin,
              res.result.userInfo,
              this.tideUpMenuInfo(res.result.frontMenus, res.result.userInfo)
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
   * @param  {} e
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
    if ( this._isMultiLine ) {
      if ( !this._lineComponent ) {
        this._lineComponent = new Tw.LineComponent();
      }
      this._historyService.goBack();  // #menu hash 제거하기 위해
      this._lineComponent.onClickLine(this._svcMgmtNum, $target);
    }
  },

  /**
   * @function
   * @desc 등록된 회선이 없는 경우 회선등록 화면으로 이동
   */
  _onRegisterLine: function () {
    this._historyService.replaceURL('/common/member/line/register?type=02');
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
    $('.h-menu a').focus();
  },

  /**
   * @function
   * @desc hash값 변경이 감지될 경우 menu close
   */
  _checkAndClose: function () {
    if ( window.location.hash.indexOf('menu') === -1 && this._isOpened ) {
      if (this.$container.find('.fe-menu-section').hasClass('none') && this._menuSearchComponent) {
        this._menuSearchComponent.cancelSearch();
      }
      this.$closeBtn.click();
    } else if (this._tid && !this.$container.hasClass('user-type') &&
               this.$container.find('.fe-search-section').hasClass('none')) {
      this.$container.addClass('user-type');
    }
  },

  /**
   * @function
   * @desc 간편 로그인 처리
   */
  _onSimpleLogin: function () {
    this._tidLanding.goSLogin();
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

  /**
   * @function
   * @desc 각가의 메뉴 클릭시 해당 화면으로 이동
   * @param  {Object} e - click event
   */
  _onMenuLink: function (e) {
    var url = e.currentTarget.value;
    if ( url.indexOf('http') !== -1 ) {
      Tw.CommonHelper.openUrlExternal(url);
    } else {
      this._goOrReplace(url);
    }
  },

  /**
   * @function
   * @desc 무료문자 클릭시 native 로 무료문자 호출, 회원정보, 선불폰 사용여부에 따른 alert 처리
   */
  _onFreeSMS: function () {
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
    Tw.CommonHelper.openFreeSms();
    return false;
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
   * @param  {Boolean} userInfo - 현재 사용자 정보
   * @param  {Object} menu - 계층으로 표현된 메뉴트리 정보
   */
  _modifyMenu: function (isLogin, userInfo, menu) {
    var isApp = Tw.BrowserHelper.isApp();

    // When login or logout
    var isLoginSelector = isLogin ? '.fe-when-login' : '.fe-when-logout';
    this.$container.find(isLoginSelector).removeClass('none');

    if ( isLogin ) {
      userInfo.totalSvcCnt = parseInt(userInfo.totalSvcCnt, 10);
      userInfo.expsSvcCnt = parseInt(userInfo.expsSvcCnt, 10);

      this._isPPS = userInfo.pps;
      // 0: normal, 1: number unregistered, 2: no svc
      this._memberType = userInfo.totalSvcCnt > 0 ? (userInfo.expsSvcCnt > 0 ? 0 : 1) : 2;
      switch ( this._memberType ) {
        case 0:
          this.$container.find('.fe-when-login-type0').removeClass('none');
          var nick = userInfo.nickNm;
          if ( Tw.FormatHelper.isEmpty(nick) ) {
            nick = Tw.SVC_ATTR[userInfo.svcAttrCd];
          }
          this.$nickName.text(nick);
          if (userInfo.svcAttrCd.indexOf('S3') !== -1) {
            this.$svcNumber.text(Tw.FormatHelper.conTelFormatWithDash(userInfo.svcNum));
          } else if ( userInfo.svcAttrCd.indexOf('M') === -1 ) {
            this.$svcNumber.text(userInfo.addr);
          } else {
            this.$svcNumber.text(Tw.FormatHelper.getDashedCellPhoneNumber(userInfo.svcNum));
          }
          break;
        case 1:
          this.$container.find('.fe-when-login-type1').removeClass('none');
          break;
        case 2:
          this.$container.find('.fe-when-login-type2').removeClass('none');
          this.$userName.text(userInfo.mbrNm);
          break;
        default:
          break;
      }

      // If a user does not have mobile line, do not show free sms button
      if (!userInfo.canSendFreeSMS) {
        this.$container.find('.fe-bt-free-sms').addClass('none');
      }
    } else {
      this.$container.removeClass('user-type');
    }

    // When web
    if ( !Tw.BrowserHelper.isApp() ) {
      this.$container.find('.fe-when-web').removeClass('none');
      this.$container.find('.fe-bt-free-sms').addClass('none');
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

    this.$menuArea.find('.section-search').after(this._menuTpl({ list: menu }));

    if ( isLogin ) {
      $('.fe-menu-realtime').each($.proxy(function (i, elem) {
        var type = elem.getAttribute('data-value');
        switch ( type ) {
          case 'svcCnt':  // 현재 회선의 요금제 정보 출력
            if (Tw.FormatHelper.isEmpty(userInfo.svcMgmtNum) || Tw.FormatHelper.isEmpty(userInfo.prodNm)) {
              $(elem).remove();
            } else {
              $(elem).text(userInfo.prodNm);
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
                  $(elem).text(text);
                } else {
                  $(elem).remove();
                }
              }, this))
              .fail(function () {
                $(elem).remove();
              });
            break;
          case 'membership': // 멤버쉽 정보 출력
            if (Tw.FormatHelper.isEmpty(userInfo.svcMgmtNum)) {
              $(elem).remove();
              break;
            }
            this._apiService.request(Tw.SESSION_CMD.BFF_04_0001, {})
              .then(function (res) {
                if ( res.code === Tw.API_CODE.CODE_00 ) {
                  var group = {
                    V: 'vip',
                    G: 'gold',
                    S: 'silver',
                    O: 'default'
                  };
                  $(elem).text(group[res.result.mbrGrCd].toUpperCase());
                } else {
                  $(elem).remove();
                }
              })
              .fail(function (err) {
                $(elem).remove();
              });
            break;
          default:
            break;
        }
      }, this));
    }

    skt_landing.action.gnb();

    // Check if there is unread T-Notifications
    this._nativeService.send(Tw.NTV_CMD.IS_APP_CREATED, { key: Tw.NTV_PAGE_KEY.T_NOTI }, $.proxy(function (res) {
      // Only if an App is fresh executed
      if ( res.resultCode === Tw.NTV_CODE.CODE_00 && res.params.value === 'Y' ) {
        this._apiService.request(Tw.API_CMD.BFF_04_0004, { tid: this._tid })
          .then($.proxy(function (res) {
            if ( res.code === Tw.API_CODE.CODE_00 && res.result.length ) {
              this._nativeService.send(Tw.NTV_CMD.SAVE, {
                key: Tw.NTV_STORAGE.MOST_RECENT_PUSH_SEQ,
                value: res.result[0].seq
              }, $.proxy(function (res) {
                if ( res.resultCode === Tw.NTV_CODE.CODE_00 ) {
                  this._checkNewTNoti();
                }
              }, this));
            }
          }, this));
      } else {
        this._checkNewTNoti();
      }
    }, this));

    // 웹접근성 (단독 라인일 경우 userinfo 영역에 안내 메세지 추가)
    if (this._isLogin && !this._isMultiLine) {
      this.$container.find('.fe-userinfo').attr('title', '다회선일 경우에만 사용 가능합니다.');
    }
  },

  /**
   * @function
   * @desc 이용요금 표시
   * @param  {Obejct} elem - 이용요금 표기할 elem
   * @param  {Object} resp - BFF 조회 후 받은 response
   * @param  {Boolean} needToStore - true일 경우 해당 정보 local storage 에 cache
   */
  _showBillInfo: function(elem, resp, needToStore) {
    var info = resp.result;
    var total = info.amt;
    var month = info.invDt.match(/\d\d\d\d(\d\d)\d\d/);
    if (month) {
      month = parseInt(month[1], 10) + 1 + Tw.DATE_UNIT.MONTH_S;
      $(elem).text(
        month + ' ' + total + Tw.CURRENCY_UNIT.WON);
    } else {
      $(elem).remove();
    }

    if (needToStore) {
      var storeData = {
        data: resp,
        expired: Tw.DateHelper.add5min(new Date()),
        svcMgmtNum: this._svcMgmtNum
      };
      Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_BILL, JSON.stringify(storeData));
    }
  },

  /**
   * @function
   * @desc 메뉴는 계층적으로 표현되어야 하나 redis에서 들어오는 정보가 flat한 array로 들어와 이를 계층정보로 변환하기 위한 함수
   * @param  {Array} menuInfo - redis에서 조회된 표기할 메뉴 정보
   * @param  {Object} userInfo - 현재 사용자의 정보
   */
  tideUpMenuInfo: function (menuInfo, userInfo) {
    // expsSeq에 따라 한번 정렬해줌
    var sorted = [];
    sorted = _.chain(menuInfo)
      .filter(function (item) {
        if ( item.menuId === 'M000344' ) {
          item.expsSeq = '100';
        }
        if ( item.menuId === 'M000353' ) {
          item.expsSeq = '101';
        }
        return item.menuId !== 'M000343'; // Remove 인터넷/집전화/IPTV menu by hard coded
      })
      .sortBy(function (item) {
        return parseInt(item.expsSeq, 10);
      }).value();

    // array 형태를 json 객체 형태로 변환
    var category = [];
    category = _.reduce(sorted, function (memo, item) {
      item.children = [];
      memo[item.menuId] = item;
      return memo;
    }, {});

    // depth가 최상위인 항목만 남기고 그 아래에 각각의 children들을 push
    var len = sorted.length;
    for ( var i = 0; i < len; i += 1 ) {
      if ( sorted[i].frontMenuDpth !== '1' ) {
        if ( !!category[sorted[i].supMenuId] ) {
          category[sorted[i].supMenuId].children.push(sorted[i]);
        } else {
          // Modify some menu category by hard coded
          if ( sorted[i].menuId === 'M000344' || sorted[i].menuId === 'M000353' ) {
            category.M000301.children.push(sorted[i]);
          }
        }
      }
    }

    // handle bar 에서 control이 용이하도록 각종 정보들 추가
    var loginType = Tw.FormatHelper.isEmpty(userInfo) ? 'N' : userInfo.loginType;
    category = _.chain(category)
      .filter($.proxy(function (item) {
        if ( item.supMenuNmExpsYn === 'Y' ) {
          item.showThis = true;
        }

        item.isIcon = item.iconImgUseYn === 'Y' ? true : false;
        item.isBg = item.bgimgUseYn === 'Y' ? true : false;
        item.hasChildren = item.children.length > 0 ? true : false;
        item.isDesc = item.menuDescUseYn === 'Y' ? true : false;
        item.isLink = !!item.menuUrl && item.menuUrl !== '/';
        item.isExternalLink = !!item.menuUrl && item.menuUrl.indexOf('http') !== -1;
        if (item.isLink || !!this.XTRACTOR_CODE[item.menuId]) { // 통계코드 추가
          item.xtrCode = this.XTRACTOR_CODE[item.menuId];
        }
        // if ( !!item.urlAuthClCd ) {
        //   if ( loginType === 'N' && item.urlAuthClCd.indexOf(loginType) === -1 ) {
        //     // item.menuUrl = item.isLink ? '/common/member/login' : item.menuUrl;
        //     item.loginNeed = true;
        //     // item.children = [];
        //     // item.hasChildren = false;
        //   } else if ( loginType === 'S' && item.urlAuthClCd.indexOf(loginType) === -1 ) {
        //     item.menuUrl = item.isLink ? 'common/member/slogin/fail' : item.menuUrl;
        //     // item.children = [];
        //     // item.hasChildren = false;
        //   }
        // }

        if ( loginType !== 'N' ) {
          if ( !!this.REAL_TIME_ITEM[item.menuId] ) {
            item.isRealtime = true;
            item.realtimeBFF = this.REAL_TIME_ITEM[item.menuId];
          }
        }

        return item.frontMenuDpth === '1';
      }, this))
      .reduce($.proxy(function (memo, item) {
        if ( memo.length === 0 ) {
          memo.push([]);
        }
        if ( !!this.TOP_PADDING_MENU[item.menuId] ) {
          memo.push([]);
          if ( item.menuId === this.TOP_PADDING_MENU.M001778 ) {
            item.isLine = true;
          }
        }
        memo[memo.length - 1].push(item);

        return memo;
      }, this), [])
      .value();

    // This is totally shit! Unbelievable!
    var subCategory = category[0];
    // subCategory[1].children.push(subCategory[2].children[0]);
    // subCategory[1].children.push(subCategory[3].children[0]);
    for ( var j = 2; j < subCategory.length - 1; j += 1 ) {
      subCategory[1].children.push(subCategory[j].children[0]);
    }
    subCategory = subCategory.slice(0, 2).concat(subCategory.slice(subCategory.length - 1));
    category[0] = subCategory;

    return category;
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

    var dataRemained = _.reduce(info.gnrlData, function (memo, item) {
      if ( memo < 0 ) { // Unlimit
        return memo;
      }

      if ( Tw.UNLIMIT_CODE.indexOf(item.unlimit) !== -1 ) {
        memo = -1;
        return memo;
      }

      memo += +item.remained;
      return memo;
    }, 0);

    if ( dataRemained < 0 ) {
      ret = Tw.COMMON_STRING.UNLIMIT;
    } else {
      var dataObj = Tw.FormatHelper.convDataFormat(dataRemained, Tw.UNIT[Tw.UNIT_E.DATA]);
      ret = dataObj.data + dataObj.unit;
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
   * @desc 검색창 영역 포커스 관련 처리
   */
  _searchFocus: function () {
    this.$container.find(':focus').blur();
    this.$container.find('.fe-menu-section').addClass('none');
    this.$container.find('.fe-search-section').removeClass('none');
    var $menu = $('#common-menu');
    if ($menu.hasClass('user-type')) {
      $menu.removeClass('user-type');
    } else {
      $menu = null;
    }

    if (!this._menuSearchComponent) {
      this._menuSearchComponent = new Tw.MenuSearchComponent(this.$container, $menu);
    }

    // this._menuSearchComponent.focus();
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
  }
};
