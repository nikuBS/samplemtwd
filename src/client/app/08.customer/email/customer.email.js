/**
 * FileName: customer.email.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerEmail = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmail.prototype = {
  serviceType: '',
  serviceCategory: [],
  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0010, {}).done($.proxy(this._setServiceCategory, this));
  },

  _cachedElement: function () {
    this.$select_service = $('.fe-btn-select-service');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-select-service', $.proxy(this._showServicePopup, this));
    this.$container.on('click', '.fe-btn-select-service-category', $.proxy(this._showServiceCategoryPopup, this));
    this.$container.on('click', '[data-service]', $.proxy(this._selectService, this));
    this.$container.on('click', '[data-category-id]', $.proxy(this._selectServiceCategory, this));
  },

  _setServiceCategory: function (res) {
    this.serviceCategory = res.result;
  },

  _selectService: function (e) {
    var elTarget = $(e.currentTarget);
    var serviceTypeName = elTarget.text();
    this.serviceType = elTarget.data('service');

    this.$select_service.text(serviceTypeName);
    this._popupService.close();
  },

  _selectServiceCategory: function () {
  },

  _showServicePopup: function () {
    var list = [
      { attr: 'data-service=PHONE', text: Tw.CUSTOMER_EMAIL.PHONE },
      { attr: 'data-service=INTERNET', text: Tw.CUSTOMER_EMAIL.INTERNET },
      { attr: 'data-service=DIRECT', text: Tw.CUSTOMER_EMAIL.DIRECT },
      { attr: 'data-service=CHOCO', text: Tw.CUSTOMER_EMAIL.CHOCO }
    ];

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE, list, '', null, function () {
        this._popupService.close();
      }.bind(this)
    );
  },

  _showServiceCategoryPopup: function () {

    var list = _.map(this.serviceCategory[this.serviceType], function (item) {
      return { attr: 'data-category-id=' + item.ofrCtgSeq, text: item.ctgNm };
    });

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE, list, '', null, function () {
        this._popupService.close();
      }.bind(this)
    );
  }
};