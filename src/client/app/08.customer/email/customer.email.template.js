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
};

Tw.CustomerEmailTemplate.prototype = {
  state: {
    tabIndex: 0,
    serviceType: 'CELL',
    serviceCategory: 0,
    callCategory: 0
  },

  _cachedElement: function () {
    this.$wrap_service = $('.fe-wrap-service');
    this.$wrap_call = $('.fe-wrap-call');
    this.tpl_service_chocolate = Handlebars.compile($('#tpl_service_chocolate').text());
    this.tpl_service_direct_type1 = Handlebars.compile($('#tpl_service_direct_type1').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '[role=tab]', $.proxy(this._changeTab, this));
    this.$container.on('click', '[data-service]', $.proxy(this._selectService, this));
    this.$container.on('click', '[data-call]', $.proxy(this._selectCall, this));
    this.$container.on('click', '.fe-btn-select-service', $.proxy(this._showServicePopup, this));
    this.$container.on('click', '.fe-btn-select-call', $.proxy(this._showCallPopup, this));
  },

  _changeTab: function () {
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
    // $('.fe-btn-select-service').text(Tw.CUSTOMER_EMAIL.SELECT_CATEGORY);
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
    this._setState({ serviceType: elTarget.data('service') });

    $('.fe-btn-select-service').text(serviceTypeName);
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

  _setTemplate: function () {
    if ( this.state.serviceType === 'DIRECT' ) {
      this._apiService.request(Tw.API_CMD.BFF_08_0015, {}).done(function(){
      });
      this.$wrap_service.html(this.tpl_service_direct_type1());
    }

    if ( this.state.serviceType === 'CHOCO' ) {
      this.$wrap_service.html(this.tpl_service_chocolate());
    }
  }
};

