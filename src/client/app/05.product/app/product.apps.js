/**
 * FileName: product.apps.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.14
 */

Tw.ProductApps = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._cachedElement();
  this._init();
};

Tw.ProductApps.prototype = {
  _init: function() {
    this._getApps();
    this._appsTmpl = Handlebars.compile($('#fe-tmpl-apps').html());
  },

  _cachedElement: function() {
    this.$list = this.$container.find('.app-list-bottom');
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

    this._apps = _.map(apps, function(app) {
      app.isNew = Tw.DateHelper.getDifference(app.newIconExpsEndDtm) > 0;
      return app;
    });

    this.$list.html(this._appsTmpl({ apps: apps }));
  }
};
