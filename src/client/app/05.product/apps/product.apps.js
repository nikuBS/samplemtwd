/**
 * FileName: product.apps.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.14
 */

Tw.ProductApps = function(rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._xTractorService = new Tw.XtractorService(rootEl);

  this._getBanners(menuId);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductApps.prototype = {
  _init: function() {
    this._today = new Date();
    this._appsTmpl = Handlebars.compile($('#fe-tmpl-apps').html());
    this._getApps();
  },

  _bindEvent: function() {
    this.$orderBtn.on('click', $.proxy(this._openOrderPopup, this));
    this.$container.on('change', '.btn-switch input', $.proxy(this._handleToggleShowInstalled, this));
  },

  _cachedElement: function() {
    this.$list = this.$container.find('.app-list-bottom');
    this.$orderBtn = this.$container.find('.text-type01');
    this.$switchBtn = this.$container.find('.btn-switch input');
  },

  _getBanners: function(menuId) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: menuId }).done($.proxy(this._handleLoadBanners, this));
  },

  _handleLoadBanners: function(resp) {
    new Tw.BannerService(
      this.$container,
      Tw.REDIS_BANNER_TYPE.ADMIN,
      _.filter(resp.result.banners, function(banner) {
        return banner.bnnrLocCd === 'T';
      }),
      'T'
    );
  },

  _getApps: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0093, {}).done($.proxy(this._handleLoadApps, this));
    // $.ajax('http://localhost:3000/mock/product.apps.json').done($.proxy(this._handleLoadApps, this));
  },

  _handleLoadApps: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var apps = resp.result.prodList || [];

    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(
        Tw.NTV_CMD.IS_INSTALLED,
        {
          list: _.map(apps, function(app) {
            return {
              appKey: app.prodNm,
              scheme: app.lnkgAppScmCtt,
              package: app.lnkgAppPkgNm
            };
          })
        },
        $.proxy(this._handleConfirmAppInstalled, this, apps)
      );
    } else {
      this._apps = _.map(apps, function(app) {
        app.isNew = Tw.DateHelper.getDiffByUnit(app.newIconExpsEndDtm.substring(0, 8), this._today, 'days') >= 0;
        app.idxExpsSeq = Number(app.idxExpsSeq);

        return app;
      });

      this._appendApps();
      this.$container
        .find('.etc-page-list')
        .removeClass('none')
        .attr('aria-hidden', false);
    }
  },

  _handleConfirmAppInstalled: function(apps, resp) {
    var installedList = (resp.params && resp.params.list) || [];
    var list = _.reduce(
      installedList,
      function(apps, app) {
        var key = Object.keys(app)[0];
        if (app[key]) {
          apps[key] = app[key];
        }

        return apps;
      },
      {}
    );

    this._apps = _.map(apps, function(app) {
      app.isNew = Tw.DateHelper.getDiffByUnit(app.newIconExpsEndDtm.substring(0, 8), this._today, 'days') >= 0;
      app.isInstalled = list[app.prodNm] || false;
      app.idxExpsSeq = Number(app.idxExpsSeq);

      return app;
    });

    if (!Tw.FormatHelper.isEmpty(list)) {
      this.$container.find('.app-list-top').removeClass('none').attr('aria-hidden', false);
    }

    this._appendApps();
    this.$container
      .find('.etc-page-list')
      .removeClass('none')
      .attr('aria-hidden', false);
  },

  _appendApps: function() {
    this._sortOrder('storRgstDtm');
    this.$list.html(this._appsTmpl({ apps: this._apps }));
    this.$news = this.$list.find('.i-new.none');
  },

  _openOrderPopup: function() {
    var _order = this._order,
      list = _.map(Tw.PRODUCT_APPS_ORDER, function(order) {
        if (order['radio-attr'].indexOf(_order) > 0) {
          return $.extend({}, order, { 'radio-attr': order['radio-attr'] + ' checked' });
        }
        return order;
      });

    this._popupService.open(
      {
        hbs: 'actionsheet01', // hbs의 파일명
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: list }],
        layer: true
      },
      $.proxy(this._handleOpenOrderPopup, this),
      undefined,
      undefined,
      this.$orderBtn
    );
  },

  _handleOpenOrderPopup: function($layer) {
    $layer.on('click', 'li.type1', $.proxy(this._handleSelectOrder, this));
  },

  _handleSelectOrder: function(e) {
    var nOrder = $(e.currentTarget)
      .find('input')
      .data('prop');

    if (this._order === nOrder) {
      this._popupService.close();
      return;
    }

    this.$orderBtn.text(
      $(e.currentTarget)
        .find('.txt')
        .text()
    );

    this._sortOrder(nOrder);
    this.$list.empty();
    this.$list.html(this._appsTmpl({ apps: this._apps }));
    this.$news = this.$list.find('.i-new.none');
    if (!this.$switchBtn.attr('checked')) {
      this._toggleShowInstalled(false);
    }
    this._popupService.close();
  },

  _sortOrder: function(order) {
    if (this._order === order) {
      return;
    }

    this._order = order;

    if (order === 'prodNm') {
      this._apps.sort($.proxy(this._sort, this));
    } else {
      this._apps.sort($.proxy(this._sortDescending, this));
    }
  },

  _sort: function(a, b) {
    if (a[this._order] < b[this._order]) return -1;
    if (a[this._order] > b[this._order]) return 1;
    return 0;
  },

  _sortDescending: function(a, b) {
    if (a[this._order] > b[this._order]) return -1;
    if (a[this._order] < b[this._order]) return 1;
    return 0;
  },

  _handleToggleShowInstalled: function(e) {
    this._toggleShowInstalled(e.currentTarget.getAttribute('checked'));
  },

  _toggleShowInstalled: function(isOn) {
    if (isOn) {
      this.$list
        .find('.i-atv')
        .removeClass('none')
        .attr('aria-hidden', false);
      this.$news.addClass('none').attr('aria-hidden', true);
    } else {
      this.$list
        .find('.i-atv')
        .addClass('none')
        .attr('aria-hidden', true);
      this.$news.removeClass('none').attr('aria-hidden', false);
    }
  }
};
