/**
 * FileName: customer.email.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.26
 */

Tw.CustomerEmail = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmail.prototype = {
  _init: function () {
    // If there is hash #auto, show second tab(auto gift)
    if ( window.location.hash === '#quality' ) {
      this._goQualityTab();
    }
  },

  _cachedElement: function () {
    this.$btn_faq = this.$container.find('.fe-btn_faq');
    this.$wrap_faq = this.$container.find('.fe-wrap_faq');
    this.$close_faq = this.$container.find('.fe-close_faq');
    this.tpl_email_faq = Handlebars.compile($('#tpl_email_faq').html());
  },

  _bindEvent: function () {
    this.$btn_faq.on('click', $.proxy(this._openFaq, this));
    this.$close_faq.on('click', $.proxy(this._closeFaq, this));
    this.$container.on('click', '.cancel', $.proxy(this._onChangeContent, this));
    this.$container.on('keyup', '.fe-text_title', $.proxy(this._onChangeContent, this));
    this.$container.on('keyup', '.fe-text_content', $.proxy(this._onChangeContent, this));
    this.$container.on('keyup', '.fe-service_phone', $.proxy(this._onKeyUpPhoneNumber, this));
    this.$container.on('keyup', '.fe-quality_phone', $.proxy(this._onKeyUpPhoneNumber, this));
    this.$container.on('click', '.fe-btn_addr', $.proxy(this._onClickBtnAddr, this));
    this.$container.on('click', '.prev-step', $.proxy(this._stepBack, this));
    this.$container.on('click', '.fe-service_sms', $.proxy(this._openSMSAlert, this));
    this.$container.on('click', '.fe-quality_sms', $.proxy(this._openSMSAlert, this));
    this.$container.on('click', '.fe-term-private-collect', $.proxy(this._openTermLayer, this, '55'));
    this.$container.on('click', '.fe-term-private-agree', $.proxy(this._openTermLayer, this, '37'));
  },

  _onClickBtnAddr: function (e) {
    var $elInput = $(e.currentTarget).closest('.inputbox').find('input');
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this, $elInput));
  },

  _onContact: function ($elInput, response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      $elInput.val(params.phoneNumber);
    }
  },

  _onKeyUpPhoneNumber: function (e) {
    var $elPhone = $(e.currentTarget);
    $elPhone.val(Tw.StringHelper.phoneStringToDash($elPhone.val()));
  },

  _onChangeContent: function (e) {
    var $elTarget = $(e.currentTarget);
    var len = $elTarget.val().length;
    var $elLength = $elTarget
      .closest('.inputbox')
      .find('.byte-current');

    $elLength.text(len);

    this.$container.trigger('validateForm');
  },

  _goQualityTab: function () {
    var $tab1 = this.$container.find('#tab1');
    var $tab2 = this.$container.find('#tab2');
    $tab1.attr('aria-selected', false);
    $tab2.attr('aria-selected', true);
  },

  _openFaq: function () {
    $(document.body).css('overflow', 'hidden');

    if ( $('.fe-service_depth1').data('serviceDepth1') === 'CELL' ) {
      this.$wrap_faq.find('.container-wrap').html(this.tpl_email_faq({ isCell: true }));
    } else {
      this.$wrap_faq.find('.container-wrap').html(this.tpl_email_faq({ isCell: false }));
    }

    this.$wrap_faq.show();
  },

  _closeFaq: function () {
    $(document.body).css('overflow', 'auto');
    this.$wrap_faq.hide();
  },

  _openSMSAlert: function (e) {
    if ( $(e.currentTarget).prop('checked') ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.SMS_ALARM,
        Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM
      );
    }
  },

  _stepBack: function () {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG, Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy($.proxy(function () {
        this._popupService.close();
        this._history.goBack();
      }, this), this), null, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  },

  _openTermLayer: function (sCode) {
    // this._popupService.close();
    Tw.CommonHelper.openTermLayer(sCode);
  }
};

