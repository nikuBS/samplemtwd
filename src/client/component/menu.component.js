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
    this._componentReady();

    new Tw.XtractorService(this.$container);
  }, this));
};

Tw.MenuComponent.prototype = {
  TOP_PADDING_MENU: {
    M001778: 'M001778',  // 이용안내
    M000537: 'M000537',  // T Apps
    M000812: 'M000812'   // Direct shop
  },

  REAL_TIME_ITEM: {
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

  _init: function () {
    $(window).on('hashchange', $.proxy(this._checkAndClose, this));
    this._nativeService.setGNB(this);
    var template = $('#fe-tpl-menu');
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
  _componentReady: function () {
    /* history back에서 메뉴 삭제
    if ( location.hash === '#menu' ) {
      setTimeout($.proxy(function () {
        this.$gnbBtn.click();
      }, this), 100);
    }
    */

    this._tid = this.$container.find('.fe-t-noti').data('tid').trim();
    if ( !Tw.BrowserHelper.isApp() || Tw.FormatHelper.isEmpty(this._tid) ) {

    }


  },
  _checkNewTNoti: function () {
    var showNotiIfNeeded = function (latestSeq, self) {
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

    this._nativeService.send(Tw.NTV_CMD.LOAD, { key: Tw.NTV_STORAGE.MOST_RECENT_PUSH_SEQ },
      $.proxy(function (res) {
        if ( res.resultCode === Tw.NTV_CODE.CODE_00 ) {
          showNotiIfNeeded(res.params.value, this);
        }
      }, this)
    );
  },

  _onClickLogin: function () {
    this._tidLanding.goLogin(location.pathname + location.search);
  },
  _onClickLogout: function () {
    this._tidLanding.goLogout();
  },
  _onSignUp: function (e) {
    if (Tw.BrowserHelper.isApp()) {
      this._tidLanding.goSignup(location.pathname + location.search);
    } else {
      var url = e.currentTarget.value;
      this._goOrReplace(url);
    }
  },
  _onGnbBtnClicked: function () {
    if (this.$container.find('.fe-menu-section').hasClass('none')) {
      this.$container.find('.fe-menu-section').removeClass('none');
      this.$container.find('.fe-search-section').addClass('none');
    }

    this.$container.attr('aria-hidden', 'false');

    this._isOpened = true;
    if ( !this._isMenuSet ) {
      // retrieve redis
      this._apiService.request(Tw.NODE_CMD.GET_MENU, {})
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
  _onTNoti: function (e) {
    if ( !this._tNotifyComp ) {
      this._tNotifyComp = new Tw.TNotifyComponent();
    }
    this._tNotifyComp.openWithHash(this._tid, e, 'menu');
    this.$container.find('.fe-t-noti').removeClass('on');
    this.$container.find('#fe-empty-t-noti').attr('aria-hidden', 'false');
    this.$container.find('#fe-new-t-noti').attr('aria-hidden', 'true');

    $('.h-menu').removeClass('on');
  },
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
  _onRegisterLine: function () {
    this._historyService.replaceURL('/common/member/line/register?type=02');
    return false;
  },
  _onClose: function () {
    this._isOpened = false;
    this.$container.attr('aria-hidden', 'true');
    if ( window.location.hash.indexOf('menu') !== -1 ) {
      this._historyService.goBack();
    }
    $('.h-menu a').focus();
  },
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
  _onSimpleLogin: function () {
    this._tidLanding.goSLogin();
  },
  _onOutLink: function (e) {
    var url = e.currentTarget.value;
    Tw.CommonHelper.openUrlExternal(url);
  },
  _onMenuLink: function (e) {
    var url = e.currentTarget.value;
    if ( url.indexOf('http') !== -1 ) {
      Tw.CommonHelper.openUrlExternal(url);
    } else {
      this._goOrReplace(url);
    }
  },
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
  _onRefund: function (e) {
    if ( !this._isLogin ) { // If it's not logged in
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
          case 'svcCnt':
            if (Tw.FormatHelper.isEmpty(userInfo.svcMgmtNum) || Tw.FormatHelper.isEmpty(userInfo.prodNm)) {
              $(elem).remove();
            } else {
              $(elem).text(userInfo.prodNm);
              $(elem).closest('.bt-depth1').addClass('txt-long');
            }
            break;
          case 'bill':
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
          case 'data':
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
          case 'membership':
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
  },

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

  tideUpMenuInfo: function (menuInfo, userInfo) {
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

    var category = [];
    category = _.reduce(sorted, function (memo, item) {
      item.children = [];
      memo[item.menuId] = item;
      return memo;
    }, {});

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
      ret += '/';
      if ( Tw.UNLIMIT_CODE.indexOf(info.voice[0].unlimit) !== -1 ) {
        ret += Tw.COMMON_STRING.UNLIMIT;
      } else {
        var voiceObj = Tw.FormatHelper.convVoiceFormat(parseInt(info.voice[0].remained, 10));
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
  _goOrReplace: function (url) {  // History가 1인 경우 replaceURL 하지 말고 goLoad
    if (history && history.length === 1) {
      this._historyService.goLoad(url);
    } else {
      this._historyService.replaceURL(url);
    }
  },

  isOpened: function () {
    return this._isOpened;
  },
  close: function () {
    this.$closeBtn.click();
  },

  // 검색창 포커스 인/아웃 처리
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
  _onDepthOpened: function (e) {  // 웹접근성 aria-pressed 적용
    var $btn = $(e.currentTarget);
    var pressed = $btn.attr('aria-pressed');
    if (pressed === 'true') {
      $btn.attr('aria-pressed', false);
    } else {
      $btn.attr('aria-pressed', true);
    }
  },
  _onClickUrlButton: function(e) {
    location.href = e.currentTarget.dataset.url;
  },
  _onTelClicked: function (e) { // iOS double click 문제 해결하기 위함
    var href = e.currentTarget.href;
    if (href.indexOf('tel:') === 0) {
      window.location = href;
      return false;
    }
    return true;
  }
};
