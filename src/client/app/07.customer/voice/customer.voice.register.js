/**
 * FileName: customer.voice.register.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.25
 */

Tw.CustomerVoiceRegister = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerVoiceRegister.prototype = {
  _init: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0002, {})
      .done($.proxy(this._onSuccessLineInfo, this));
  },

  _cachedElement: function () {
    this.$btn_register = this.$container.find('.fe-btn_register');
    this.$btn_select_phone = this.$container.find('.fe-select_phone');
    this.$check_voice_term = this.$container.find('.fe-check_voice_term');
  },

  _bindEvent: function () {
    this.$btn_register.on('click', $.proxy(this._onClickRegister, this));
    this.$check_voice_term.on('click', $.proxy(this._onClickAgreeTerm, this));
    this.$btn_select_phone.on('click', $.proxy(this._onShowSelectPhoneNumber, this));
    this.$container.on('click', '[data-service-number]', $.proxy(this._onChoiceNumber, this));
  },

  _onSuccessLineInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.userLineList = res.result.M;
    }
  },

  _onClickAgreeTerm: function () {
    if ( this.$check_voice_term.prop('checked') ) {
      this.$btn_register.prop('disabled', false);
    } else {
      this.$btn_register.prop('disabled', true);
    }
  },

  _onShowSelectPhoneNumber: function () {
    var fnSelectLine = function (item) {
      return {
        value: item.svcNum,
        option: this.$btn_select_phone.data('svcmgmtnum').toString() === item.svcMgmtNum ? 'checked' : '',
        attr: 'data-service-number=' + item.svcMgmtNum
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.CUSTOMER_VOICE.LINE_CHOICE,
        data: [{ list: this.userLineList.map($.proxy(fnSelectLine, this)) }]
      },
      null,
      null
    );
  },

  _onChoiceNumber: function (e) {
    this._popupService.close();
    this.$btn_select_phone.data('svcmgmtnum', $(e.currentTarget).data('service-number').toString());
  },

  _onClickRegister: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0034, { svcMgmtNum: this.$btn_select_phone.data('svcmgmtnum').toString() })
      .done($.proxy(this._onSuccessRegister, this));
  },

  _onSuccessRegister: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // this._history.replaceURL('/customer/voice/complete');
    }
  }
};