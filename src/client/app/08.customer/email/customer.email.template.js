/**
 * FileName: customer.email.template.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerEmailTemplate = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailTemplate.prototype = {
  _init: function () {
    this.$wrap_tpl_service.html(this.tpl_service_cell());
    this.$wrap_tpl_quality.html(this.tpl_quality_cell());
    // debugger;
    skt_landing.widgets.widget_init();
  },

  _cachedElement: function () {
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');
    this.tpl_service_cell = Handlebars.compile($('#tpl_service_cell').html());
    this.tpl_quality_cell = Handlebars.compile($('#tpl_quality_cell').html());
  },

  _bindEvent: function () {
    this.$container.on('changeServiceTemplate', $.proxy(this._changeServiceTemplate, this));
    this.$container.on('changeQualityTemplate', $.proxy(this._changeQualityTemplate, this));
  },

  _changeServiceTemplate: function (e) {
    this.$wrap_tpl_service.html(this.tpl_service_cell());
    skt_landing.widgets.widget_init();
  },

  _changeQualityTemplate: function (e) {
    this.$wrap_tpl_quality.html(this.tpl_quality_cell());
    skt_landing.widgets.widget_init();
  }
};