/**
 * FileName: customer.email.call.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.08.01
 */

Tw.CustomerEmailCall = function (rootEl, oEmailTemplate) {
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

Tw.CustomerEmailCall.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$input_email = $('#tab2-tab .fe-input-email');
    this.tpl_call_wibro_request = Handlebars.compile($('#tpl_call_wibro_request').text());
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-email-register', $.proxy(this._registerEmail, this));
    this.$container.on('click', '.fe-param03', $.proxy(this._showEnvPopup, this));
    this.$container.on('click', '.fe-param04', $.proxy(this._showEnvDetailPopup, this));
    this.$container.on('click', '.fe-param08', $.proxy(this._showPositionPopup, this));
    this.$container.on('click', '.fe-param09', $.proxy(this._showBuildingPopup, this));
    this.$container.on('click', '.fe-param10', $.proxy(this._showOccurDatePopup, this));
    this.$container.on('click', '[data-id=param03]', $.proxy(this._selectEnvPopup, this));
    this.$container.on('click', '[data-id=param04]', $.proxy(this._selectEnvDetailPopup, this));
    this.$container.on('click', '[data-id=param08]', $.proxy(this._selectPositionPopup, this));
    this.$container.on('click', '[data-id=param09]', $.proxy(this._selectBuildingPopup, this));
    this.$container.on('click', '[data-id=param10]', $.proxy(this._selectOccurDatePopup, this));
    this.$container.on('click', '.fe-btn-postcode', $.proxy(this._selectPost, this));
  },

  _showEnvPopup: function () {
    var list = _.map(Tw.CUSTOMER_EMAIL.Q_TYPE01, function (item) {
      return { attr: 'data-id=param03', text: item.text };
    });

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE, list, '', null, this._popupService.close
    );
  },

  _showEnvDetailPopup: function () {
    var list = _.map(Tw.CUSTOMER_EMAIL.Q_TYPE02, function (item) {
      return { attr: 'data-id=param04', text: item.text };
    });

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE, list, '', null, this._popupService.close
    );
  },

  _showPositionPopup: function () {
    var list = _.map(Tw.CUSTOMER_EMAIL.Q_TYPE03, function (item) {
      return { attr: 'data-id=param08', text: item.text };
    });

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE, list, '', null, this._popupService.close
    );
  },

  _showBuildingPopup: function () {
    var list = _.map(Tw.CUSTOMER_EMAIL.Q_TYPE04, function (item) {
      return { attr: 'data-id=param09', text: item.text };
    });

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE, list, '', null, this._popupService.close
    );
  },

  _showOccurDatePopup: function () {
    var list = _.map(Tw.CUSTOMER_EMAIL.Q_TYPE05, function (item) {
      return { attr: 'data-id=param10', text: item.text };
    });

    this._popupService.openChoice(
      Tw.POPUP_TITLE.SELECT_SERVICE, list, '', null, this._popupService.close
    );
  },

  _selectEnvPopup: function (e) {
    var elTarget = $(e.currentTarget);

    $('.fe-param03').text(elTarget.text());
    this._popupService.close();
  },

  _selectEnvDetailPopup: function (e) {
    var elTarget = $(e.currentTarget);

    $('.fe-param04').text(elTarget.text());
    this._popupService.close();
  },

  _selectPositionPopup: function (e) {
    var elTarget = $(e.currentTarget);

    $('.fe-param08').text(elTarget.text());
    this._popupService.close();
  },

  _selectBuildingPopup: function (e) {
    var elTarget = $(e.currentTarget);

    $('.fe-param09').text(elTarget.text());
    this._popupService.close();
  },

  _selectOccurDatePopup: function (e) {
    var elTarget = $(e.currentTarget);

    $('.fe-param10').text(elTarget.text());
    this._popupService.close();
  },

  _selectPost: function () {
    this._history.replaceURL('/home/postcode');
  },

  _makeWibroRequestParameter: function () {
    var params = {
      param01: $('.fe-param01').val(),
      param02: $('.fe-param02').text(),
      param03: $('.fe-param03').text(),
      param04: $('.fe-param04').text(),
      param05: $('.fe-param05').val(),
      param06: $('.fe-param06').val(),
      param07: $('.fe-param07').val(),
      param08: $('.fe-param08').text(),
      param09: $('.fe-param09').text(),
      param10: $('.fe-param10').text(),
      param11: $('.fe-param11').val()
    };

    return this.tpl_call_wibro_request(params);
  },

  _registerEmail: function () {
    var currentState = this._oEmailTemplate.state;

    if ( currentState.tabIndex === 1 ) {
      switch ( currentState.callCategory ) {
        case 'WIBRO':
          this._requestQualityWibro();
          break;
        case 'INTERNET':
          this._requestQualityInternet();
          break;
      }
    }
  },

  _requestQualityWibro: function () {
    var params = {
      cntcNumClCd: $('[name=radio_call_phone]:checked').val(),
      connSite: Tw.BrowserHelper.isApp() ? 15 : 19,
      inqSvcClCd: $('[name=radio_call_wibro]:checked').val(),
      cntcNum1: this._getPhoneParams(0),
      cntcNum2: this._getPhoneParams(1),
      cntcNum3: this._getPhoneParams(2),
      email: $('#tab2-tab .fe-input-email').val(),
      subject: $('#tab2-tab .fe-inquiry-title').val(),
      content: this._makeWibroRequestParameter(),
      smsRcvYn: $('#tab2-tab .fe-inp-chk-sms').prop('checked') ? 'Y' : 'N',
      inptZip: $('.fe-param05').val(),
      inptBasAddr: $('.fe-param06').val(),
      inptDtlAddr: $('.fe-param07').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_08_0044, params)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _requestQualityInternet: function () {
    var params = {
      cntcNumClCd: $('[name=radio_call_phone]:checked').val(),
      selSvcMgmtNum: $('.fe-wibro-svcmgmt').data('svcmgmtnum'),
      connSite: Tw.BrowserHelper.isApp() ? 15 : 19,
      inqSvcClCd: $('[name=radio_call_internet]:checked').val(),
      ofrCtgSeq: this._oEmailTemplate.getState().callCategory,
      cntcNum1: this._getPhoneParams(0),
      cntcNum2: this._getPhoneParams(1),
      cntcNum3: this._getPhoneParams(2),
      email: $('#tab2-tab .fe-input-email').val(),
      subject: $('#tab2-tab .fe-inquiry-title').val(),
      content: $('#tab2-tab .fe-inquiry-content').val(),
      smsRcvYn: $('#tab2-tab .fe-inp-chk-sms').prop('checked') ? 'Y' : 'N'
    };

    this._apiService.request(Tw.API_CMD.BFF_08_0045, params)
      .done($.proxy(this._onSuccessRequest, this));
  },

  _getPhoneParams: function (nIndex) {
    var sPhone = $('#tab2-tab .fe-input-phone').val();

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

