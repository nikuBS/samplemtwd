/**
 * FileName: customer.email.template.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.08.02
 */

Tw.CustomerEmailTemplate = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailTemplate.prototype = {
  state: {
    tabIndex: 0,
    serviceType: 'CELL',
    serviceCategory: 0,
    callCategory: 0
  },

  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0010, {}).done($.proxy(this._setServiceCategory, this));
    this.state.tabIndex = $('[role=tablist]').find('[aria-selected=true]').index();
    // this.$wrap_service.html(this.tpl_service_cell());
  },

  _cachedElement: function () {
    this.$wrap_call = $('.fe-wrap-call');
    this.$wrap_service = $('.fe-wrap-service');
    this.tpl_service_cell = Handlebars.compile($('#tpl_service_cell').text());
    this.tpl_service_chocolate = Handlebars.compile($('#tpl_service_chocolate').text());
    this.tpl_service_direct_type1 = Handlebars.compile($('#tpl_service_direct_type1').text());
    this.tpl_call_wibro = Handlebars.compile($('#tpl_call_wibro').text());
    this.tpl_call_internet = Handlebars.compile($('#tpl_call_internet').text());

  },

  _bindEvent: function () {
    this.$container.on('click', '[role=tab]', $.proxy(this._changeTab, this));
    this.$container.on('click', '[data-service]', $.proxy(this._selectService, this));
    this.$container.on('click', '[data-call]', $.proxy(this._selectCall, this));
    this.$container.on('click', '[data-category-id]', $.proxy(this._selectServiceCategory, this));
    this.$container.on('click', '.fe-btn-select-service-category', $.proxy(this._showServiceCategoryPopup, this));
    this.$container.on('click', '.fe-btn-select-service', $.proxy(this._showServicePopup, this));
    this.$container.on('click', '.fe-btn-select-call', $.proxy(this._showCallPopup, this));
    this.$container.on('click', '.fe-email-cancel', $.proxy(this._onCancelEmail, this));
  },

  _changeTab: function () {
    this.state.tabIndex = $('[role=tablist]').find('[aria-selected=true]').index();
  },

  _setServiceCategory: function (res) {
    this.serviceCategoryList = res.result;
    this.serviceCategoryList.INTERNET = res.result.INTERNET.concat(res.result.PHONE);
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
  },

  _showServiceCategoryPopup: function () {
    var list = _.map(this.serviceCategoryList[this.state.serviceType], function (item) {
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

  _showCallPopup: function () {
    var list = [
      { attr: 'data-call=WIBRO', text: Tw.CUSTOMER_EMAIL.WIBRO },
      { attr: 'data-call=INTERNET', text: Tw.CUSTOMER_EMAIL.INTERNET }
    ];

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE,
      list,
      '',
      null,
      this._popupService.close
    );
  },

  _selectService: function (e) {
    var elTarget = $(e.currentTarget);
    var serviceTypeName = elTarget.text();
    this._setState({ serviceType: elTarget.data('service').toString() });

    $('.fe-btn-select-service').text(serviceTypeName);
    this._popupService.close();
  },

  _selectServiceCategory: function (e) {
    var elTarget = $(e.currentTarget);
    var categoryName = elTarget.text();
    this._setState({ serviceCategory: elTarget.data('category-id') });

    $('.fe-btn-select-service-category').text(categoryName);
    this._popupService.close();
  },

  _selectCall: function (e) {
    var elTarget = $(e.currentTarget);
    var callTypeName = elTarget.text();
    this._setState({ callCategory: elTarget.data('call') });

    $('.fe-btn-select-call').text(callTypeName);
    this._popupService.close();
  },

  _setState: function (state) {
    this.state = $.extend(this.state, state);

    $(this).trigger('onChangeState', this.state);
    this._setTemplate();
  },

  getState: function () {
    return $.extend({}, this.state);
  },

  _setTemplate: function () {
    if ( this.state.tabIndex === 0 ) {
      if ( this.state.serviceType === 'CELL' ) {
        this.$wrap_service.html(this.tpl_service_cell());
      }

      if ( this.state.serviceType === 'DIRECT' ) {
        this.$wrap_service.html(this.tpl_service_direct_type1());
      }

      if ( this.state.serviceType === 'CHOCO' ) {
        this.$wrap_service.html(this.tpl_service_chocolate());
      }

      skt_landing.widgets.widget_init('.fe-wrap-service'); //selector string
      skt_landing.components.component_init('.fe-wrap-service');  //selector string

    } else {
      if ( this.state.callCategory === 'WIBRO' ) {
        this.$wrap_call.html(this.tpl_call_wibro());
      }

      if ( this.state.callCategory === 'INTERNET' ) {
        this.$wrap_call.html(this.tpl_call_internet());
      }

      skt_landing.widgets.widget_init('.fe-wrap-call'); //selector string
      skt_landing.components.component_init('.fe-wrap-call');  //selector string
    }
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

  _goCustomerMain: function () {
    this._popupService.close();
    this._history.goBack();
  }
};

