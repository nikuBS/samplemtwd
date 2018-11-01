/**
 * FileName: customer.email.service.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerEmailService = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailService.prototype = {
  _init: function () {
    this._validateForm();
  },

  _cachedElement: function () {
    this.$wrap_tpl_service = this.$container.find('.fe-wrap_tpl_service');
    // this.$btn_service_register = this.$container.find('.fe-service_register');
    // this.$input_phone = this.$container.find('.fe-service_phone');
    // this.$input_email = this.$container.find('.fe-service_email');
  },

  _bindEvent: function () {
    this.$container.on('change', '[required]', $.proxy(this._validateForm, this));
    this.$wrap_tpl_service.on('click', '.fe-service_register', $.proxy(this._request, this));
  },

  _request: function () {
    var serviceCategory = $('.fe-service_depth1').data('service-depth1');

    switch ( serviceCategory ) {
      case 'cell':
        this._requestCell();
        break;
      case 'internet':
        this._requestInternet();
        break;
      case 'direct':
        this._requestDirect();
        break;
      case 'chocolate':
        this._requestChocolate();
        break;
      default:
    }
  },

  _requestCell: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0042, this._makeParams()).done($.proxy(this._onSuccessRequest, this));
  },

  _requestInternet: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0043, this._makeParams()).done($.proxy(this._onSuccessRequest, this));
  },

  _requestDirect: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0020, this._makeParams()).done($.proxy(this._onSuccessRequest, this));
  },

  _requestChocolate: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0021, this._makeParams()).done($.proxy(this._onSuccessRequest, this));
  },

  _makeParams: function () {
    var params = {
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15',
      ofrCtgSeq: $('.fe-service_depth2').data('serviceDepth2'),
      cntcNum1: '',
      cntcNum2: '',
      cntcNum3: '',
      email: '',
      subject: 'test',
      content: 'test',
      smsRcvYn: 'Y'
    };

    return params;
  },

  _onSuccessRequest: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // this._history.replaceURL('/customer/email/complete?email=' + this.$input_email.val());
    } else {
      this._popupService.openAlert(res.code + ' ' + res.msg);
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _validateForm: function () {
    // this.$wrap_tpl_service.find('[required]').each(function (nIndex, el) {
    // });
    //TODO: validate form
    if ( true ) {
      $('.fe-service_register').prop('disabled', false);
    }
  }
};