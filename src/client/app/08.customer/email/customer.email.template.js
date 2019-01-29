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
  },

  _cachedElement: function () {
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');

    // service, quality template
    this.tpl_service_cell = Handlebars.compile($('#tpl_service_cell').html());
    this.tpl_quality_cell = Handlebars.compile($('#tpl_quality_cell').html());
    this.tpl_quality_wibro = Handlebars.compile($('#tpl_quality_wibro').html());
    this.tpl_service_direct = Handlebars.compile($('#tpl_service_direct').html());
    this.tpl_service_direct_brand = Handlebars.compile($('#tpl_service_direct_brand').html());
    this.tpl_service_internet = Handlebars.compile($('#tpl_service_internet').html());
    this.tpl_service_chocolate = Handlebars.compile($('#tpl_service_chocolate').html());
    this.tpl_quality_internet = Handlebars.compile($('#tpl_quality_internet').html());
    this.tpl_quality_phone = Handlebars.compile($('#tpl_quality_phone').html());
  },

  _bindEvent: function () {
    this.$container.on('changeServiceTemplate', $.proxy(this._changeServiceTemplate, this));
    this.$container.on('changeQualityTemplate', $.proxy(this._changeQualityTemplate, this));
    this.$container.on('click', '.fe-quality-inqSvcClCd', $.proxy(this._onChangeQualityLineType, this));
  },

  _changeServiceTemplate: function (e, serviceCategory) {
    e.stopPropagation();
    e.preventDefault();

    switch ( serviceCategory.depth1 ) {
      case 'CELL':
        var templatePlaceholder = this._setTemplatePlaceholder(serviceCategory);
        this.$wrap_tpl_service.html(this.tpl_service_cell({
          placeHolder: templatePlaceholder,
          isDefaultValue: templatePlaceholder === Tw.CUSTOMER_EMAIL.DEFAULT_PLACEHOLDER ? true : false
        }));
        break;
      case 'INTERNET':
        this.$wrap_tpl_service.html(this.tpl_service_internet());
        break;
      case 'DIRECT':
        if ( serviceCategory.depth2 === '07' || serviceCategory.depth2 === '10' ) {
          this.$wrap_tpl_service.html(this.tpl_service_direct_brand());
        } else {
          this.$wrap_tpl_service.html(this.tpl_service_direct());
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

  _changeQualityTemplate: function (e, qualityCategory, qualityType) {
    e.stopPropagation();
    e.preventDefault();

    switch ( qualityCategory.depth1 ) {
      case 'cell':
        if ( qualityType && qualityType.isWibro ) {
          this.$wrap_tpl_quality.html(this.tpl_quality_wibro());
        } else {
          this.$wrap_tpl_quality.html(this.tpl_quality_cell());
        }
        break;
      case 'internet':
        if ( qualityType && qualityType.isPhone ) {
          this.$wrap_tpl_quality.html(this.tpl_quality_phone());
        } else {
          this.$wrap_tpl_quality.html(this.tpl_quality_internet());
        }
        break;
      default:
        this.$wrap_tpl_quality.html(this.tpl_quality_cell());
    }

    skt_landing.widgets.widget_init();
  },

  _setTemplatePlaceholder: function (serviceCategory) {
    if ( serviceCategory.depth2 === '5000275' ) {
      return Tw.CUSTOMER_EMAIL.MEMBERSHIP_PLACEHOLDER;
    } else {
      return Tw.CUSTOMER_EMAIL.DEFAULT_PLACEHOLDER;
    }
  },

  _onChangeQualityLineType: function (e) {
    var nTabIndex = $(e.currentTarget).find('.focus').index();
    var category = this.$container.triggerHandler('getCategory');

    if ( category.quality.depth1 === 'cell' ) {
      if ( nTabIndex === 0 ) {
        this.$container.trigger('changeQualityTemplate', [category.quality, { isWibro: false }]);
      } else {
        this.$container.trigger('changeQualityTemplate', [category.quality, { isWibro: true }]);
      }
    }

    if ( category.quality.depth1 === 'internet' ) {
      if ( nTabIndex === 0 ) {
        this.$container.trigger('changeQualityTemplate', [category.quality, { isPhone: false }]);
      } else {
        this.$container.trigger('changeQualityTemplate', [category.quality, { isPhone: true }]);
      }
    }
  }
};