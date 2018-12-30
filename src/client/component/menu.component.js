Tw.MenuComponent = function () {
  $(document).ready($.proxy(function () {
    this.$container = $('#common-menu');
    this.$gnbBtn = $('#fe-bt-gnb');

    if (!this.$container.length || !this.$gnbBtn.length) {
      return;
    }

    this._historyService = new Tw.HistoryService();
    this._tidLanding = new Tw.TidLandingComponent();
    this._nativeService = Tw.Native;
    this._apiService = Tw.Api;

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

    this._isOpened = false;
    this._isMenuSet = false;

    this._init();
    this._bindEvents();

    if (location.hash === '#menu') {
      setTimeout($.proxy(function () {
        this.$gnbBtn.click();
      }, this), 100);
    }
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
    this.$container.on('click', '.userinfo', $.proxy(this._onUserInfo, this));
    this.$container.on('click', '.fe-bt-regi-svc', $.proxy(this._onRegisterLine, this));
    this.$gnbBtn.on('click', $.proxy(this._onGnbBtnClicked, this));
    this.$closeBtn.on('click', $.proxy(this._onClose, this));

    this.$container.on('click', '.fe-bt-login', $.proxy(this._onClickLogin, this));
    this.$container.on('click', '.fe-bt-logout', $.proxy(this._onClickLogout, this));
  },
  _onClickLogin: function () {
    this._tidLanding.goLogin(location.href);
  },
  _onClickLogout: function () {
    this._tidLanding.goLogout();
  },
  _onGnbBtnClicked: function () {
    this._isOpened = true;
    if (!this._isMenuSet) {
      // retrieve redis
      this._apiService.request(Tw.NODE_CMD.GET_MENU, {})
        .then($.proxy(function (res) {
          if (res.code === Tw.API_CODE.CODE_00) {
            this._isLogin = res.result.isLogin;
            if (this._isLogin) {
              this._isMultiLine = res.result.userInfo.totalSvcCnt > 1;
              this._svcMgmtNum = res.result.userInfo.svcMgmtNum;
              this._svcAttr = res.result.userInfo.svcAttr;
              this._isLogin = res.result.isLogin;
              this._tid = res.result.userInfo.tid;
            }
            this._modifyMenu(
              res.result.isLogin,
              res.result.userInfo,
              this._tideUpMenuInfo(res.result.frontMenus, res.result.userInfo)
            );
            this._isMenuSet = true;
          } else {
            Tw.Error(res.code, res.msg).pop();
          }
        }, this))
        .fail(function (err) {
          Tw.Error(err.code, err.msg).pop();
        });
    }
  },
  _onTNoti: function () {
    if (!this._tNotifyComp) {
      this._tNotifyComp = new Tw.TNotifyComponent();
    }
    this._tNotifyComp.open(this._tid);
  },
  _onUserInfo: function () {
    if (this._isMultiLine) {
      if (!this._lineComponent) {
        this._lineComponent = new Tw.LineComponent();
      }
      this._lineComponent.onClickLine(this._svcMgmtNum);
    }
  },
  _onRegisterLine: function () {
    (new Tw.LineRegisterComponent()).openRegisterLinePopup();
    return false;
  },
  _onClose: function () {
    this._isOpened = false;
    if (window.location.hash.indexOf('menu') !== -1) {
      this._historyService.goBack();
    }
  },
  _checkAndClose: function () {
    if (window.location.hash.indexOf('menu') === -1 && this._isOpened) {
      this.$closeBtn.click();
    }
  },
  _onSimpleLogin: function () {
    if (Tw.BrowserHelper.isAndroid) {
      this._historyService.goLoad('/common/member/slogin/aos');
    } else if (Tw.BrowserHelper.isIos) {
      this._historyService.goLoad('/common/member/slogin/ios');
    }
  },
  _onOutLink: function (e) {
    var url = e.currentTarget.value;
    Tw.CommonHelper.openUrlExternal(url);
  },
  _onMenuLink: function (e) {
    var url = e.currentTarget.value;
    if (url.indexOf('http') !== -1) {
      Tw.CommonHelper.openUrlExternal(url);
    } else {
      this._historyService.goLoad(url);
    }
  },
  _onFreeSMS: function () {
    Tw.CommonHelper.openFreeSms();
    return false;
  },
  _onRefund: function (e) {
    if (!this._isLogin) { // If it's not logged in
      (new Tw.CertificationSelect()).open({
        authClCd: Tw.AUTH_CERTIFICATION_KIND.F
      }, '', null, null, $.proxy(function () {
        this._historyService.goLoad(e.currentTarget.value);
      }, this));
    } else {
      this._historyService.goLoad(e.currentTarget.value);
    }
  },

  _modifyMenu: function (isLogin, userInfo, menu) {
    var isApp = Tw.BrowserHelper.isApp();

    // When login or logout
    var isLoginSelector = isLogin ? '.fe-when-login' : '.fe-when-logout';
    this.$container.find(isLoginSelector).removeClass('none');

    if (isLogin) {
      userInfo.totalSvcCnt = parseInt(userInfo.totalSvcCnt, 10);
      userInfo.expsSvcCnt = parseInt(userInfo.expsSvcCnt, 10);

      // 0: normal, 1: number unregistered, 2: no svc
      var memberType = userInfo.totalSvcCnt > 0 ? (userInfo.expsSvcCnt > 0 ? 0 : 1) : 2;
      switch (memberType) {
        case 0:
          this.$container.find('.fe-when-login-type0').removeClass('none');
          var nick = userInfo.nickName;
          if (Tw.FormatHelper.isEmpty(nick)) {
            nick = Tw.SVC_ATTR[userInfo.svcAttr];
          }
          this.$nickName.text(nick);
          this.$svcNumber.text(Tw.FormatHelper.getDashedCellPhoneNumber(userInfo.svcNum));
          break;
        case 1:
          this.$container.find('.fe-when-login-type1').removeClass('none');
          break;
        case 2:
          this.$container.find('.fe-when-login-type2').removeClass('none');
          this.$userName.text(userInfo.name);
          break;
        default:
          break;
      }
    } else {
      this.$container.removeClass('user-type');
    }

    // When web
    if (!Tw.BrowserHelper.isApp()) {
      this.$container.find('.fe-when-web').removeClass('none');
      this.$container.find('.fe-bt-free-sms').addClass('none');
    }

    // When logout and app
    if (isApp && !isLogin) {
      this.$container.find('.fe-when-logout-and-app').removeClass('none');
    }

    // When app or login
    if (isApp || isLogin) {
      this.$container.find('.fe-when-app-or-login').removeClass('none');
    }

    this.$menuArea.prepend(this._menuTpl({ list: menu }));

    if (isLogin) {
      $('.fe-menu-realtime').each($.proxy(function (i, elem) {
        var type = elem.getAttribute('data-value');
        switch (type) {
          case 'svcCnt':
            $(elem).text(Tw.MENU_STRING.SVC_COUNT(userInfo.totalSvcCnt));
            break;
          case 'bill':
            this._apiService.request(Tw.API_CMD.BFF_05_0036, {})
              .then($.proxy(function (res) {
                if (res.code === Tw.API_CODE.CODE_00) {
                  var info = res.result;
                  if (info.coClCd === Tw.MYT_FARE_BILL_CO_TYPE.BROADBAND) {
                    $(elem).remove();
                    return;
                  }
                  var total = info.useAmtTot ? parseInt(info.useAmtTot, 10) : 0;
                  $(elem).text(
                    Tw.FormatHelper.convNumFormat(total) + Tw.CURRENCY_UNIT.WON);
                } else {
                  $(elem).remove();
                }
              }, this))
              .fail(function () {
                $(elem).remove();
              });
            break;
          case 'data':
            this._apiService.request(Tw.API_CMD.BFF_05_0001, {})
              .then($.proxy(function (res) {
                if (res.code === Tw.API_CODE.CODE_00) {
                  var text = this._parseUsage(res.result);
                  if (!text) {
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
              })
            break;
          case 'membership':
            this._apiService.request(Tw.API_CMD.BFF_04_0001, {})
              .then(function (res) {
                if (res.code === Tw.API_CODE.CODE_00) {
                  var group = {
                    V: 'vip',
                    G: 'gold',
                    S: 'silver',
                    O: 'default'
                  };
                  $(elem).text(group[res.result.mbrGrCd]);
                } else {
                  $(elem).remove();
                }
              })
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
  },

  _tideUpMenuInfo: function (menuInfo, userInfo) {
    var sorted = _.chain(menuInfo)
      .filter(function (item) {
        if (item.menuId === 'M000344') {
          item.expsSeq = '100';
        }
        if (item.menuId === 'M000353') {
          item.expsSeq = '101';
        }
        return item.menuId !== 'M000343'; // Remove 인터넷/집전화/IPTV menu by hard coded
      })
      .sortBy(function (item) {
        return parseInt(item.expsSeq, 10);
      }).value();

    var category = _.reduce(sorted, function (memo, item) {
      item.children = [];
      memo[item.menuId] = item;
      return memo;
    }, {});

    var len = sorted.length;
    for (var i = 0; i < len; i += 1) {
      if (sorted[i].frontMenuDpth !== '1') {
        if (!!category[sorted[i].supMenuId]) {
          category[sorted[i].supMenuId].children.push(sorted[i]);
        } else {
          // Modify some menu category by hard coded
          if (sorted[i].menuId === 'M000344' || sorted[i].menuId === 'M000353') {
            category['M000301'].children.push(sorted[i]);
          }
        }
      }
    }

    var loginType = Tw.FormatHelper.isEmpty(userInfo) ? 'N': userInfo.loginType;
    category = _.chain(category)
      .filter($.proxy(function (item) {
        if (item.supMenuNmExpsYn === 'Y') {
          item.showThis = true;
        }

        item.isIcon = item.iconImgUseYn === 'Y' ? true : false;
        item.isBg = item.bgimgUseYn === 'Y' ? true : false;
        item.hasChildren = item.children.length > 0 ? true : false;
        item.isDesc = item.menuDescUseYn === 'Y' ? true : false;
        item.isLink = !!item.menuUrl && item.menuUrl !== '/';

        if (!!item.urlAuthClCd) {
          if (loginType === 'N' && item.urlAuthClCd.indexOf(loginType) === -1) {
            // item.menuUrl = item.isLink ? '/common/member/login' : item.menuUrl;
            item.loginNeed = true;
            // item.children = [];
            // item.hasChildren = false;
          } else if (loginType === 'S' && item.urlAuthClCd.indexOf(loginType) === -1) {
            item.menuUrl = item.isLink ? 'common/member/slogin/fail' : item.menuUrl;
            // item.children = [];
            // item.hasChildren = false;
          }
        }

        if (loginType !== 'N') {
          if (!!this.REAL_TIME_ITEM[item.menuId]) {
            item.isRealtime = true;
            item.realtimeBFF = this.REAL_TIME_ITEM[item.menuId];
          }
        }

        return item.frontMenuDpth === '1';
      }, this))
      .reduce($.proxy(function (memo, item) {
        if (memo.length === 0) {
          memo.push([]);
        }
        if (!!this.TOP_PADDING_MENU[item.menuId]) {
          memo.push([]);
          if (item.menuId === this.TOP_PADDING_MENU.M001778) {
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
    for (var i = 2; i < subCategory.length - 1; i += 1) {
      subCategory[1].children.push(subCategory[i].children[0]);
    }
    subCategory = subCategory.slice(0, 2).concat(subCategory.slice(subCategory.length - 1));
    category[0] = subCategory;

    return category;
  },

  _parseUsage: function (info) {
    if (info.gnrlData.length === 0) {
      return undefined;
    }

    var ret = '';

    var dataRemained = _.reduce(info.gnrlData, function (memo, item) {
      if (memo < 0) { // Unlimit
        return memo;
      }

      if (Tw.UNLIMIT_CODE.indexOf(item.unlimit) !== -1) {
        memo = -1;
        return memo;
      }

      memo += +item.remained;
      return memo;
    }, 0);

    if (dataRemained < 0) {
      ret = Tw.COMMON_STRING.UNLIMIT;
    } else {
      var dataObj = Tw.FormatHelper.convDataFormat(dataRemained, Tw.UNIT[Tw.UNIT_E.DATA]);
      ret = dataObj.data + dataObj.unit;
    }

    return ret;
  },

  isOpened: function () {
    return this._isOpened;
  },
  close: function () {
    this.$closeBtn.click();
    this._historyService.goBack();
  }
};
