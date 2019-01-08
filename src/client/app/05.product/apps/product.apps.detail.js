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
  _init: function(app) {
    this._app = app;
    this._params = Tw.UrlHelper.getQueryParams();
    this._images = app.images;
    this._appTmpl = Handlebars.compile($('#fe-tmpl-app').html());

    this._handleLoadInfo(app);
  },

  _bindEvent: function() {
    this.$container.on('click', '#fe-images', $.proxy(this._handleOpenImgDetail, this));
    this.$container.on('click', '#fe-exe-btn', $.proxy(this._handleCheckAndOpenApp, this));
    this.$container.on('click', '#fe-open-btn', $.proxy(this._handleOpenApp, this));
    this.$container.on('click', '.bt.apple, .bt.google, .bt.one-store', $.proxy(this._handleOpenMarket, this));
  },

  _cachedElement: function() {
    this.$info = this.$container.find('#fe-app');
  },

  _handleLoadInfo: function(app) {
    this._stores = this._getStoreUrl(app.appStoreLinkBtnList || []);

    if (Tw.BrowserHelper.isApp()) {
      app.stores = this._stores;
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
    } else {
      this._renderAppArea(app);
    }
  },

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
          urls.playStore = button.linkUrl;
        } else if (name.indexOf(STORES.APP_STORE) >= 0) {
          urls.appStore = button.linkUrl;
        } else if (name.indexOf(STORES.ONE_STORE) >= 0) {
          urls.oneStore = button.linkUrl;
        }

        return urls;
      },
      {}
    );
  },

  _handleConfirmAppInstalled: function(app, resp) {
    app.isIos = Tw.BrowserHelper.isIos();
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

  _renderAppArea: function(app) {
    this.$info.html(this._appTmpl(app));
  },

  _handleOpenImgDetail: function(e) {
    this._popupService.open({
      hbs: 'TA_02_01',
      images: this._images
    });
  },

  _handleCheckAndOpenApp: function() {
    var store = '';

    if (this._stores) {
      if (Tw.BrowserHelper.isIos()) {
        store = this._stores['appStore'] || '';
      } else {
        store = this._stores['playStore'] || this._stores['oneStore'] || '';
      }

      setTimeout(function() {
        window.location.replace(store);
      }, 1000);
    }

    if (this._app.lnkgAppScmCtt) {
      window.location.replace(this._app.lnkgAppScmCtt);
    } else if (store.length > 0) {
      window.location.replace(store);
    }
  },

  _handleOpenApp: function() {
    var app = this._app;
    this._nativeService.send(Tw.NTV_CMD.OPEN_APP, { scheme: app.lnkgAppScmCtt, package: app.lnkgAppPkgNm });
  },

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
      this._nativeService.send(Tw.NTV_CMD.OPEN_URL, {
        type: Tw.NTV_BROWSER.EXTERNAL,
        href: url
      });
    }
  }
};
