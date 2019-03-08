/**
 * FileName: customer.voice.register.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.25
 */

Tw.CustomerVoiceRegister = function (rootEl, allSvc) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._lineComponent = new Tw.LineComponent();
  this._allSvc = allSvc;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerVoiceRegister.prototype = {
  _init: function () {
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
    this.$container.on('click touchstart touchend', '[data-service-number]', $.proxy(this._onChoiceNumber, this));
    // this.$container.on('click', '.prev-step', $.proxy(this._stepBack, this));
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
        value: Tw.FormatHelper.conTelFormatWithDash(item.svcNum),
        option: this.$btn_select_phone.data('svcmgmtnum').toString() === item.svcMgmtNum ? 'checked' : '',
        attr: 'data-service-number=' + item.svcMgmtNum
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.CUSTOMER_VOICE.LINE_CHOICE,
        data: [{ list: this._allSvc.m.map($.proxy(fnSelectLine, this)) }]
      },
      null,
      $.proxy(function () {
        this._popupService.close();
      }, this)
    );
  },

  _onChoiceNumber: function (e) {
    e.stopPropagation();
    e.preventDefault();

    var svcMgmtNum = $(e.currentTarget).data('service-number').toString(); // 서비스관리번호
    var mdn = $(e.currentTarget).text().trim(); // 전화번호

    this.$btn_select_phone.data('svcmgmtnum', svcMgmtNum);
    this.$btn_select_phone.text(mdn);

    this._popupService.close();

    this._lineComponent.changeLine(svcMgmtNum, mdn, $.proxy(function(){return null;}, this));
  },

  _onClickRegister: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0034, { svcMgmtNum: this.$btn_select_phone.data('svcmgmtnum').toString() })
      .done($.proxy(this._onSuccessRegister, this));
  },

  _onSuccessRegister: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var sPhone = !!this.$btn_select_phone.val() ? this.$btn_select_phone.val() : this.$btn_select_phone.text();
      this._history.replaceURL('/customer/svc-info/voice/complete?targetNum=' + sPhone);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _stepBack: function () {
    var confirmed = false;
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy(function () {
        confirmed = true;
        this._popupService.close();
      }, this),
      $.proxy(function () {
        if ( confirmed ) {
          this._history.goBack();
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES
    );
  },

  _goBack: function () {
    this._history.goBack();
  }
};