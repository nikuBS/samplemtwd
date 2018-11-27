/**
 * FileName: customer.email.template.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerEmailTemplate = function (rootEl, allSvc) {
  this.allSvc = allSvc.allSvc;
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
    // this.service_category = Tw.CUSTOMER_EMAIL_SERVICE_CATEGORY;
    // this.quality_category = Tw.CUSTOMER_EMAIL_QUALITY_CATEGORY;
  },

  _cachedElement: function () {
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');
    this.$wrap_tpl_faq = $('.fe-btn_faq');

    // service, quality template
    this.tpl_service_cell = Handlebars.compile($('#tpl_service_cell').html());
    this.tpl_quality_cell = Handlebars.compile($('#tpl_quality_cell').html());
    this.tpl_service_direct = Handlebars.compile($('#tpl_service_direct').html());
    this.tpl_service_direct_brand = Handlebars.compile($('#tpl_service_direct_brand').html());
    this.tpl_service_internet = Handlebars.compile($('#tpl_service_internet').html());
    this.tpl_service_chocolate = Handlebars.compile($('#tpl_service_chocolate').html());
    this.tpl_quality_internet = Handlebars.compile($('#tpl_quality_internet').html());
  },

  _bindEvent: function () {
    this.$container.on('changeServiceTemplate', $.proxy(this._changeServiceTemplate, this));
    this.$container.on('changeQualityTemplate', $.proxy(this._changeQualityTemplate, this));
  },

  _changeServiceTemplate: function (e, serviceCategory) {
    switch ( serviceCategory.depth1 ) {
      case 'CELL':
        this.$wrap_tpl_service.html(this.tpl_service_cell());
        break;
      case 'INTERNET':
        this.$wrap_tpl_service.html(this.tpl_service_internet());
        break;
      case 'DIRECT':
        if ( serviceCategory.depth2 === '08' || serviceCategory.depth2 === '09' || serviceCategory.depth2 === '12' ) {
          this.$wrap_tpl_service.html(this.tpl_service_direct());
        } else {
          this.$wrap_tpl_service.html(this.tpl_service_direct_brand());
        }
        break;
      case 'CHOCO':
        this.$wrap_tpl_service.html(this.tpl_service_chocolate());
        break;
      default:
        this.$wrap_tpl_service.html(this.tpl_service_cell());
    }

    skt_landing.widgets.widget_init();
  },

  _changeQualityTemplate: function (e, qualityCategory) {
    switch ( qualityCategory.depth1 ) {
      case 'cell':
        this.$wrap_tpl_quality.html(this.tpl_quality_cell());
        break;
      case 'internet':
        this.$wrap_tpl_quality.html(this.tpl_quality_internet());
        break;
      default:
        this.$wrap_tpl_quality.html(this.tpl_quality_cell());
    }

    skt_landing.widgets.widget_init();
  }
};