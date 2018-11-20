/**
 * FileName: product.apps.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.14
 */

Tw.ProductApps = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductApps.prototype = {
  _init: function() {
    this._appsTmpl = Handlebars.compile($('#fe-tmpl-apps').html());
    this._getApps();
  },

  _bindEvent: function() {
    this.$orderBtn.on('click', $.proxy(this._openOrderPopup, this));
    this.$container.on('change', '.btn-switch input', $.proxy(this._toggleShowInstalled, this));
  },

  _cachedElement: function() {
    this.$list = this.$container.find('.app-list-bottom');
    this.$orderBtn = this.$container.find('.text-type01');
  },

  _getApps: function() {
    // this._apiService.request(Tw.API_CMD.BFF_10_0093, {})
    $.ajax('http://localhost:3000/mock/product.apps.json').done($.proxy(this._handleGetApps, this));
  },

  _handleGetApps: function(resp) {
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
        app.isNew = Tw.DateHelper.getDifference(app.newIconExpsEndDtm) > 0;
        return app;
      });

      this._appendApps(false);
    }
  },

  _handleConfirmAppInstalled: function(apps, resp) {
    var list = (resp.params && resp.params.list) || [];

    this._apps = _.map(apps, function(app) {
      app.isNew = Tw.DateHelper.getDifference(app.newIconExpsEndDtm) > 0;
      app.isInstalled = list[app.prodNm] || false;

      return app;
    });

    this._appendApps(true);
  },

  _appendApps: function(isApp) {
    this._sort('storRgstDtm');
    this.$list.html(this._appsTmpl({ apps: this._apps, isApp: isApp }));
  },

  _openOrderPopup: function() {
    var _order = this._order,
      list = _.map(Tw.PRODUCT_APPS_ORDER, function(order) {
        if (order.attr.indexOf(_order) > 0) {
          return Object.assign({ option: 'checked' }, order);
        }
        return order;
      });

    this._popupService.open(
      {
        hbs: 'actionsheet_select_a_type', // hbs의 파일명
        data: [{ list: list }],
        layer: true,
        title: Tw.POPUP_TITLE.SELECT_ORDER
      },
      $.proxy(this._handleOpenOrderPopup, this)
    );
  },

  _handleOpenOrderPopup: function($layer) {
    $layer.on('click', 'li > button', $.proxy(this._handleSelectOrder, this));
  },

  _handleSelectOrder: function(e) {
    var nOrder = e.currentTarget.getAttribute('data-prop');

    if (this._order === nOrder) {
      this._popupService.close();
      return;
    }

    this.$orderBtn.text(
      $(e.currentTarget)
        .find('.info-value')
        .text()
    );

    this._sort(nOrder);
    this.$list.empty();
    this.$list.html(this._appsTmpl({ apps: this._apps }));
    this._popupService.close();
  },

  _sort: function(order) {
    if (this._order === order) {
      return;
    }

    this._order = order;
    this._apps.sort($.proxy(this._compare, this));
  },

  _compare: function(a, b) {
    if (a[this._order] < b[this._order]) return -1;
    if (a[this._order] > b[this._order]) return 1;
    return 0;
  },

  _toggleShowInstalled: function(e) {
    var isOn = e.currentTarget.getAttribute('checked');

    if (isOn) {
      this.$list.find('.i-atv').removeClass('none');
    } else {
      this.$list.find('.i-atv').addClass('none');
    }
  }
};
