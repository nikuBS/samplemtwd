/**
 * @file 상품 상세 < T앱
 * @author Jiyoung Jo
 * @since 2018-12-04
 */

Tw.ProductAppsDetail = function(rootEl, app) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._cachedElement();
  this._bindEvent();
  this._init(app);
};

Tw.ProductAppsDetail.prototype = {
  /**
   * @desc 초기화(핸들바 로딩, 스토어 정보 저장 등)
   * @param {object} app 앱 상세보기 정보
   * @private
   */
  _init: function(app) {
    this._app = app;
    this._stores = this._getStoreUrl(app.appStoreLinkBtnList || []);
    this._app.stores = this._stores;
    this._app.isIos = Tw.BrowserHelper.isIos();

    this._params = Tw.UrlHelper.getQueryParams();
    this._images = app.images;
    this._appTmpl = Handlebars.compile($('#fe-tmpl-app').html());

    this._handleLoadInfo(this._app);
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$container.on('click', '#fe-images', $.proxy(this._handleOpenImgDetail, this));
    // this.$container.on('click', '#fe-exe-btn', $.proxy(this._handleCheckAndOpenApp, this));
    this.$container.on('click', '#fe-open-btn', $.proxy(this._handleOpenApp, this));
    this.$container.on('click', '.bt.apple, .bt.google, .bt.one-store', $.proxy(this._handleOpenMarket, this));
    this.$container.on('click', '.ad-banner', $.proxy(this._handleOpenLink));
  },

  /**
   * @desc jquery 객체 캐싱
   * @private
   */
  _cachedElement: function() {
    this.$info = this.$container.find('#fe-app');
  },

  /**
   * @desc 앱 설치 여부 가지오기 
   * @param {object} app 앱 상세보기 정보
   * @private
   */
  _handleLoadInfo: function(app) {
    if (Tw.BrowserHelper.isApp()) { // 앱일 경우, 설치 여부 확인(native)
      app.isApp = true;

      this._nativeService.send(
        Tw.NTV_CMD.IS_INSTALLED,
        {
          list: [
            {
              appKey: app.prodNm,
              scheme: app.lnkgAppScmCtt,
              package: app.lnkgAppPkgNm
            }
          ]
        },
        $.proxy(this._handleConfirmAppInstalled, this, app)
      );
    } else {  // 아닐 경우 상세보기 페이지 랜더링
      this._renderAppArea(app);
    }
  },

  /**
   * @desc 마켓정보 저장
   * @param {Array<object>} buttons BFF에서 내려오는 버튼 리스트
   * @private
   */
  _getStoreUrl: function(buttons) {
    if (!buttons || buttons.length === 0) {
      return;
    }

    var STORES = {
      PLAY_STORE: 'google',
      APP_STORE: 'app',
      ONE_STORE: 'one'
    };

    return _.reduce(
      buttons,
      function(urls, button) {
        var name = button.linkNm.toLowerCase();

        if (name.indexOf(STORES.PLAY_STORE) >= 0) {
          urls.playStore = encodeURI(button.linkUrl);
        } else if (name.indexOf(STORES.APP_STORE) >= 0) {
          urls.appStore = encodeURI(button.linkUrl);
        } else if (name.indexOf(STORES.ONE_STORE) >= 0) {
          urls.oneStore = encodeURI(button.linkUrl);
        }

        return urls;
      },
      {}
    );
  },

  /**
   * @desc native에서 앱 설치 여부 응답 시
   * @param {object} app 앱 상세보기 정보
   * @param {object} resp 앱 설치 여부 native 응답 값
   * @private
   */
  _handleConfirmAppInstalled: function(app, resp) {
    if (resp.params && resp.params.list) {
      var isInstalled = resp.params.list[0][app.prodNm];
      app.isInstalled = isInstalled || false;
    } else {
      app.isInstalled = false;
    }

    if (app.appIconImgUrl && app.appIconImgUrl.indexOf('http') < 0) {
      app.appIconImgUrl = Tw.Environment.cdn + app.appIconImgUrl;
    }

    this._renderAppArea(app);
  },

  /**
   * @desc 앱 상세보기 페이지 랜더
   * @param {object} app 앱 상세보기 정보
   * @private
   */
  _renderAppArea: function(app) {
    this.$info.html(this._appTmpl(app));
  },

  /**
   * @desc 앱 스크린 샷 상세보기 클릭 시
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _handleOpenImgDetail: function(e) {
    this._popupService.open(
      {
        hbs: 'TA_02_01',
        images: this._images
      },
      undefined,
      undefined,
      undefined,
      $(e.currentTarget)
    );
  },

  // _handleCheckAndOpenApp: function() {
  //   var store = '',
  //     isIos = Tw.BrowserHelper.isIos();

  //   if (this._stores) {
  //     if (isIos) {
  //       store = this._stores.appStore || '';
  //     } else {
  //       store = this._stores.playStore || this._stores.oneStore || '';
  //     }
  //   }

  //   var openMarket = function() {
  //       this._popupService.close();
  //       window.location.replace(store);
  //     },
  //     openConfirm = $.proxy(function() {
  //       if (document.hidden || document.webkitHidden) {
  //         return;
  //       }

  //       if (isIos) {
  //         window.location.replace(store);
  //       } else {
  //         this._popupService.openConfirmButton(
  //           this._app.prodNm + Tw.POPUP_CONTENTS.APP_NOT_INSTALLED,
  //           undefined,
  //           $.proxy(openMarket, this),
  //           undefined,
  //           Tw.BUTTON_LABEL.NO,
  //           Tw.BUTTON_LABEL.YES
  //         );
  //       }
  //     }, this);

  //   if (this._app.lnkgAppScmCtt) {
  //     setTimeout(openConfirm, isIos ? 1000 : 500);
  //     window.location.href = this._app.lnkgAppScmCtt;
  //   } else if (store.length > 0) {
  //     openConfirm();
  //   }
  // },

  /**
   * @desc 앱 실행하기 버튼 클릭 시
   * @private
   */
  _handleOpenApp: function() {
    var app = this._app;
    this._nativeService.send(Tw.NTV_CMD.OPEN_APP, { scheme: app.lnkgAppScmCtt, package: app.lnkgAppPkgNm });
  },

  /**
   * @desc 마켓으로 이동 버튼 클릭 시 
   * @param {Event} e 클릭 이벤트 객체
   * @private
   */
  _handleOpenMarket: function(e) {
    var market = e.currentTarget.getAttribute('data-market'),
      url = this._stores[market];

    if (market === 'oneStore') {
      var pid = Tw.UrlHelper.getQueryParams(url).pid;

      if (pid) {
        url = Tw.OUTLINK.ONE_STORE_PREFIX + pid;
      }
    }

    if (url && url.length > 0) {
      if (Tw.BrowserHelper.isApp()) {
        this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
          type: Tw.NTV_BROWSER.EXTERNAL,
          href: url
        });
      } else {
        window.location = url;
      }
    }
  },

  /**
   * @desc 배너 링크 오픈
   * @param {Event} e 클릭 이벤트 객체
   */
  _handleOpenLink: function(e) {
    var link = e.currentTarget.getAttribute('href');

    if (!link) {
      return;
    } else if (link.indexOf('http') !== -1) {
      if (Tw.BrowserHelper.isApp()) {
        Tw.CommonHelper.showDataCharge(function() {
          Tw.CommonHelper.openUrlExternal(link);
        });
      } else {
        Tw.CommonHelper.openUrlExternal(link);
      }
    } else {
      window.location.href = link;
    }
  }
};
