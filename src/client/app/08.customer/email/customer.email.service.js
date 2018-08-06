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
    this.$input_sms = $('#fe-check-sms');
    this.$input_phone_number = $('#fe-input-phone');
    this.$input_email = $('#fe-input-email');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-email-register', $.proxy(this._registerEmail, this));
    this.$container.on('click', '.fe-btn-brand', $.proxy(this._showBrandPopup, this));
    this.$container.on('click', '.fe-btn-device', $.proxy(this._showDevicePopup, this));
    this.$container.on('click', '[data-brand]', $.proxy(this._selectBrand, this));
    this.$container.on('click', '[data-device]', $.proxy(this._selectDevice, this));
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
        default:
          console.log('default');
      }

    }
  },

  _requestEmailCell: function () {

  },

  _requestEmailInternet: function () {

  },

  _requestEmailDirect: function () {
    var params = {
      category: this._oEmailTemplate.getState().serviceCategory,
      cntcNum1: '010',
      cntcNum2: '0000',
      cntcNum3: '0000',
      email: this.$input_email.val(),
      subject: $('.fe-inquiry-title').val(),
      content: $('.fe-inquiry-content').val(),
      smsRcvYn: this.$input_sms.prop('checked') ? 'Y' : 'N',
      phoneId: $('.fe-btn-device').data('id')
      // orderNo: '12323'
    };

    this._apiService.request(Tw.API_CMD.BFF_08_0021, params)
      .done(function (res) {
        if ( res.code === '00' ) {
          this._history.replaceURL('/customer/email/complete?email=' + this.$input_email.val());
        }
      }.bind(this));
  },

  _requestEmailChoco: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0021, {
      category: '010700',
      cntcNum1: '010',
      cntcNum2: '0000',
      cntcNum3: '0000',
      email: 'test@naver.com',
      subject: 'test',
      content: 'test',
      smsRcvYn: this.$input_sms.prop('checked') ? 'Y' : 'N'
    }).done(function () {
      this._history.replaceURL('/customer/email/complete?email=test@naver.com');
    }.bind(this));
  },

  _showBrandPopup: function () {
    var cb_brand = function (response) {
      this.brandlist = _.map(response.result, function (item) {
        return { attr: 'data-brand=' + item.brandCd, text: item.brandNm };
      });

      this._popupService.openChoice(
        Tw.POPUP_TITLE.SELECT_SERVICE,
        this.brandlist,
        '',
        null,
        this._popupService.close
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
      Tw.POPUP_TITLE.SELECT_SERVICE,
      list,
      '',
      null,
      this._popupService.close
    );
  },

  _selectDevice: function (e) {
    var $target = $(e.currentTarget);

    $('.fe-btn-device').text($target.text());
    $('.fe-btn-device').attr('data-id', $target.data('device'));
    this._popupService.close();
  }
};

