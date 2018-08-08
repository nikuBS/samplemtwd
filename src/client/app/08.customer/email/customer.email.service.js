/**
 * FileName: customer.email.service.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerEmailService = function (rootEl, oEmailTemplate) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._oEmailTemplate = oEmailTemplate;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailService.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$input_sms = $('#tab1-tab .fe-inp-chk-sms');
    this.$input_email = $('#tab1-tab .fe-input-email');
    this.tpl_direct_popup = Handlebars.compile($('#tpl_direct_popup').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-email-register', $.proxy(this._registerEmail, this));
    this.$container.on('click', '.fe-btn-brand', $.proxy(this._showBrandPopup, this));
    this.$container.on('click', '.fe-btn-device', $.proxy(this._showDevicePopup, this));
    this.$container.on('click', '[data-brand]', $.proxy(this._selectBrand, this));
    this.$container.on('click', '[data-device]', $.proxy(this._selectDevice, this));
    this.$container.on('click', '.fe-direct-search', $.proxy(this._showDirectSearchPopup, this));
    this.$container.on('click', '.fe-direct-result .fe-direct-close', $.proxy(this._closeDirectPopup, this));
    this.$container.on('click', '.fe-direct-result .fe-direct-confirm', $.proxy(this._confirmDirectPopup, this));
  },

  _registerEmail: function () {
    var currentState = this._oEmailTemplate.getState();

    if ( currentState.tabIndex === 0 ) {
      switch ( currentState.serviceType ) {
        case 'CELL':
          this._requestEmailCell();
          break;
        case 'INTERNET':
          this._requestEmailInternet();
          break;
        case 'DIRECT':
          this._requestEmailDirect();
          break;
        case 'CHOCO':
          this._requestEmailChoco();
          break;
      }
    }
  },

  _requestEmailCell: function () {
    var params = {
      selSvcMgmtNum: $('.fe-service-line').text(),
      cntcNumClCd: $('[name=radio_service_phone]:checked').val(),
      connSite: Tw.BrowserHelper.isApp() ? 15 : 19,
      ofrCtgSeq: this._oEmailTemplate.getState().serviceCategory,
      cntcNum1: this._getPhoneParams(0),
      cntcNum2: this._getPhoneParams(1),
      cntcNum3: this._getPhoneParams(2),
      email: this.$input_email.val(),
      subject: $('#tab1-tab .fe-inquiry-title').val(),
      content: $('#tab1-tab .fe-inquiry-content').val(),
      smsRcvYn: this.$input_sms.prop('checked') ? 'Y' : 'N'
    };

    this._apiService.request(Tw.API_CMD.BFF_08_0042, params)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _requestEmailInternet: function () {
    var params = {
      selSvcMgmtNum: $('.fe-service-line').text(),
      cntcNumClCd: $('[name=radio_service_phone]:checked').val(),
      connSite: Tw.BrowserHelper.isApp() ? 15 : 19,
      ofrCtgSeq: this._oEmailTemplate.getState().serviceCategory,
      cntcNum1: this._getPhoneParams(0),
      cntcNum2: this._getPhoneParams(1),
      cntcNum3: this._getPhoneParams(2),
      email: this.$input_email.val(),
      subject: $('#tab1-tab .fe-inquiry-title').val(),
      content: $('#tab1-tab .fe-inquiry-content').val(),
      smsRcvYn: this.$input_sms.prop('checked') ? 'Y' : 'N'
    };

    this._apiService.request(Tw.API_CMD.BFF_08_0043, params)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _requestEmailDirect: function () {
    var params = {
      category: this._oEmailTemplate.getState().serviceCategory,
      cntcNum1: this._getPhoneParams(0),
      cntcNum2: this._getPhoneParams(1),
      cntcNum3: this._getPhoneParams(2),
      email: this.$input_email.val(),
      subject: $('#tab1-tab .fe-inquiry-title').val(),
      content: $('#tab1-tab .fe-inquiry-content').val(),
      smsRcvYn: this.$input_sms.prop('checked') ? 'Y' : 'N',
      phoneId: $('.fe-btn-device').data('id')
    };

    this._apiService.request(Tw.API_CMD.BFF_08_0021, params)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _requestEmailChoco: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0021, {
      category: this._oEmailTemplate.getState().serviceCategory,
      cntcNum1: this._getPhoneParams(0),
      cntcNum2: this._getPhoneParams(1),
      cntcNum3: this._getPhoneParams(2),
      email: this.$input_email.val(),
      subject: $('#tab1-tab .fe-inquiry-title').val(),
      content: $('#tab1-tab .fe-inquiry-content').val(),
      smsRcvYn: this.$input_sms.prop('checked') ? 'Y' : 'N'
    }).done($.proxy(this._onSuccessRequest, this));
  },

  _showDirectSearchPopup: function () {
    $(window).scrollTop(0);

    this.$container.append(this.tpl_direct_popup());
    document.body.style.overflow = 'hidden';
    skt_landing.widgets.widget_init('.popup-page'); //selector string
    skt_landing.components.component_init('.popup-page');  //selector string
  },

  _confirmDirectPopup: function () {

  },

  _closeDirectPopup: function () {
    document.body.style.overflow = 'auto';
    $('.fe-direct-result').remove();
  },

  _showBrandPopup: function () {
    var cb_brand = function (response) {
      this.brandlist = _.map(response.result, function (item) {
        return { attr: 'data-brand=' + item.brandCd, text: item.brandNm };
      });

      this._popupService.openChoice(
        Tw.POPUP_TITLE.SELECT_SERVICE, this.brandlist, '', null, this._popupService.close
      );
    };

    this._apiService.request(Tw.API_CMD.BFF_08_0015, {}).done($.proxy(cb_brand, this));
  },

  _selectBrand: function (e) {
    var $target = $(e.currentTarget);
    var cb_setPhoneList = function (response) {
      this.phoneList = response.result;
    };

    this._apiService.request(Tw.API_CMD.BFF_08_0015,
      { brandCd: $target.data('brand') })
      .done($.proxy(cb_setPhoneList, this));

    $('.fe-btn-brand').text($target.text());
    this._popupService.close();
  },

  _showDevicePopup: function () {
    var list = _.map(this.phoneList, function (item) {
      return { attr: 'data-device=' + item.phoneId, text: item.modelNickName };
    });

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE, list, '', null, this._popupService.close
    );
  },

  _selectDevice: function (e) {
    var $target = $(e.currentTarget);

    $('.fe-btn-device').text($target.text());
    $('.fe-btn-device').attr('data-id', $target.data('device'));
    this._popupService.close();
  },

  _getPhoneParams: function (nIndex) {
    var sPhone = $('#tab1-tab .fe-input-phone').val();

    return Tw.FormatHelper.conTelFormatWithDash(sPhone).split('-')[nIndex];
  },

  _onSuccessRequest: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/email/complete?email=' + this.$input_email.val());
    } else {
      this._popupService.openAlert(res.code + ' ' + res.msg);
    }
  }
};

