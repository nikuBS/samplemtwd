Tw.MenuComponent = function () {
  $(document).ready($.proxy(function () {
    this.$container = $('#common-menu');
    this.$gnbBtn = $('#fe-bt-gnb');

    if (Tw.FormatHelper.isEmpty(this.$container) || Tw.FormatHelper.isEmpty(this.$gnbBtn)) {
      return;
    }

    this._historyService = new Tw.HistoryService();
    this._nativeService = Tw.Native;
    this._apiService = Tw.Api;

    this._menuTpl = undefined;

    this.$closeBtn = undefined;
    this.$menuArea = undefined;
    this.$userName = undefined;
    this.$deviceName = undefined;
    this.$svcNumber = undefined;

    this._isLogin = false;

    this._isOpened = false;
    this._isMenuSet = false;

    this._init();
    this._bindEvents();
  }, this));
};

Tw.MenuComponent.prototype = {
  TOP_PADDING_MENU: {
    M000603: 'M000603',  // 이용안내
    M000537: 'M000537'  // T Apps
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
    this.$deviceName = this.$container.find('#fe-device-name');
    this.$svcNumber = this.$container.find('#fe-svc-number');
  },
  _bindEvents: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onOutLink, this));
    this.$container.on('click', '#fe-refund', $.proxy(this._onRefund, this));
    this.$container.on('click', '#fe-btn-simple-login', $.proxy(this._onSimpleLogin, this));
    this.$container.on('click', '.fe-menu-link', $.proxy(this._onMenuLink, this));
    this.$gnbBtn.on('click', $.proxy(this._onGnbBtnClicked, this));
    this.$closeBtn.on('click', $.proxy(this._onClose, this));

    $('.fe-bt-login').on('click', $.proxy(this._onLoginRequested, this));
  },
  _onGnbBtnClicked: function () {
    this._isOpened = true;
    if (!this._isMenuSet) {
      // retrieve redis
      this._apiService.request(Tw.NODE_CMD.GET_MENU, {})
        .then($.proxy(function (res) {
          if (res.code === Tw.API_CODE.CODE_00) {
            this._isLogin = res.result.isLogin;
            this._modifyMenu(
              res.result.isLogin,
              res.result.userInfo,
              this._tideUpMenuInfo(res.result.frontMenus, this._isLogin ? res.result.userInfo.loginType : 'N')
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

  _onLoginRequested: function () {
    this._historyService.goLoad('/common/member/login');
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
    this._historyService.goLoad(url);
  },
  _onRefund: function (e) {
    if (this._isLogin) { // If it's not logged in
      (new Tw.CertificationSelect()).open({
        authClCd: Tw.AUTH_CERTIFICATION_KIND.F
      }, null, null, $.proxy(function () {
        this._historyService.goLoad(e.currentTarget.value);
      }, this));
    } else {
      this._historyService.goLoad(e.currentTarget.value);
    }
  },

  _modifyMenu: function (isLogin, userInfo, menu) {
    console.log(menu);
    var isApp = Tw.BrowserHelper.isApp();

    // When login or logout
    var isLoginSelector = isLogin ? '.fe-when-login' : '.fe-when-logout';
    this.$container.find(isLoginSelector).removeClass('none');

    if (isLogin) {
      userInfo.totalSvcCnt = parseInt(userInfo.totalSvcCnt, 10);
      userInfo.expsSvcCnt = parseInt(userInfo.totalSvcCnt, 10);

      // 0: normal, 1: number unregistered, 2: no svc
      var memberType = userInfo.totalSvcCnt > 0 ? (userInfo.expsSvcCnt > 0 ? 0 : 1) : 2;
      switch (memberType) {
        case 0:
          this.$container.find('.fe-when-login-type0').removeClass('none');
          this.$deviceName.text(userInfo.deviceName);
          this.$svcNumber.text(Tw.FormatHelper.getDashedCellPhoneNumber(userInfo.svcNum));
          break;
        case 1:
          this.$container.find('.fe-when-login-type1').removeClass('none');
          break;
        case 2:
          this.$container.find('.fe-when-login-type2').removeClass('none');
          this.$userName.text(name);
          break;
        default:
          break;
      }
    }

    // When web
    if (!Tw.BrowserHelper.isApp()) {
      this.$container.find('.fe-when-web').removeClass('none');
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

    skt_landing.action.gnb();
  },

  _tideUpMenuInfo: function (menuInfo, loginType) {
    var sorted = _.sortBy(menuInfo, function (item) {
      return parseInt(item.expsSeq, 10);
    });

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
        }
      }
    }

    category = _.chain(category)
      .filter(function (item) {
        if (item.supMenuNmExpsYn === 'Y') {
          item.showThis = true;
        }
        item.isIcon = item.iconImgUseYn === 'Y' ? true : false;
        item.isBg = item.bgimgUseYn === 'Y' ? true : false;
        item.hasChildren = item.children.length > 0 ? true : false;
        item.isDesc = item.menuDescUseYn === 'Y' ? true : false;
        item.isLink = !!item.menuUrl;
        if (!!item.urlAuthClCd) {
          if (loginType === 'N' && item.urlAuthClCd.indexOf(loginType) === -1) {
            item.menuUrl = '/common/member/login';
            item.children = [];
            item.hasChildren = false;
          } else if (loginType === 'S' && item.urlAuthClCd.indexOf(loginType) === -1) {
            item.menuUrl = 'common/member/slogin/fail';
            item.children = [];
            item.hasChildren = false;
          }
        }

        return item.frontMenuDpth === '1';

      })
      .reduce($.proxy(function (memo, item) {
        if (memo.length === 0) {
          memo.push([]);
        }
        if (!!this.TOP_PADDING_MENU[item.menuId]) {
          memo.push([]);
        }
        memo[memo.length - 1].push(item);

        return memo;
      }, this), [])
      .value();

    return category;
  },

  isOpened: function () {
    return this._isOpened;
  },
  close: function () {
    this.$closeBtn.click();
    this._historyService.goBack();
  }
};
