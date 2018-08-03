/**
 * FileName: customer.email.service.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerEmailService = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailService.prototype = {
  categoryId: '',
  serviceType: '',
  serviceCategory: [],

  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0010, {}).done($.proxy(this._setServiceCategory, this));
  },

  _cachedElement: function () {
    // this.$wrap_tpl_email_agree = Handlebars.compile($('#tpl_email_agree').text());
    this.$wrap_tablist = $('[role=tablist]');
    this.$select_service = $('.fe-btn-select-service');
    this.$select_service_category = $('.fe-btn-select-service-category');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-email-cancel', $.proxy(this._onCancelEmail, this));
    this.$container.on('click', '.fe-btn-select-service', $.proxy(this._showServicePopup, this));
    this.$container.on('click', '.fe-btn-select-service-category', $.proxy(this._showServiceCategoryPopup, this));
    this.$container.on('click', '[data-service]', $.proxy(this._selectService, this));
    this.$container.on('click', '[data-category-id]', $.proxy(this._selectServiceCategory, this));
    this.$container.on('click', '[role=tab]', $.proxy(this._changeTab, this));
  },

  _changeTab: function () {
    // $('.fe-wrap_tpl_email_agree').html(this.$wrap_tpl_email_agree());
  },

  _onCancelEmail: function () {
    this._popupService.openConfirm(
      Tw.BUTTON_LABEL.CONFIRM,
      Tw.MSG_CUSTOMER.EMAIL_A01,
      null,
      null,
      $.proxy(this._goCustomerMain, this),
      this._popupService.close);
  },

  _setServiceCategory: function (res) {
    this.serviceCategory = res.result;
    this.serviceCategory.INTERNET = res.result.INTERNET.concat(res.result.PHONE);
  },

  _selectService: function (e) {
    var elTarget = $(e.currentTarget);
    var serviceTypeName = elTarget.text();
    this.serviceType = elTarget.data('service');

    this.$select_service.text(serviceTypeName);
    this._popupService.close();
  },

  _selectServiceCategory: function (e) {
    var elTarget = $(e.currentTarget);
    var categoryName = elTarget.text();
    this.categoryId = elTarget.data('category-id');

    this.$select_service_category.text(categoryName);
    this._popupService.close();
  },

  _showServicePopup: function () {
    var list = [
      { attr: 'data-service=CELL', text: Tw.CUSTOMER_EMAIL.CELL },
      { attr: 'data-service=INTERNET', text: Tw.CUSTOMER_EMAIL.INTERNET },
      { attr: 'data-service=DIRECT', text: Tw.CUSTOMER_EMAIL.DIRECT },
      { attr: 'data-service=CHOCO', text: Tw.CUSTOMER_EMAIL.CHOCO }
    ];

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE,
      list,
      '',
      null,
      this._popupService.close
    );

    this.$select_service_category.text(Tw.CUSTOMER_EMAIL.SELECT_CATEGORY);
  },

  _showServiceCategoryPopup: function () {
    var list = _.map(this.serviceCategory[this.serviceType], function (item) {
      return { attr: 'data-category-id=' + item.ofrCtgSeq, text: item.ctgNm };
    });

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE,
      list,
      '',
      null,
      this._popupService.close
    );
  },

  _goCustomerMain: function () {
    this._popupService.close();
    this._history.goBack();
  }
};

