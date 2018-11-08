/**
 * FileName: customer.email.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.26
 */

Tw.CustomerEmail = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmail.prototype = {
  _init: function () {
    // this._apiService.request(Tw.API_CMD.BFF_08_0010, {})
    //   .done($.proxy(this._onSuccessQuestionList, this));

    // If there is hash #auto, show second tab(auto gift)
    // if ( window.location.hash === '#quailty' ) {
    //   this._goQualityTab();
    // }
  },

  _cachedElement: function () {
    this.$btn_faq = this.$container.find('.fe-btn_faq');
    this.$wrap_faq = this.$container.find('.fe-wrap_faq');
    this.$close_faq = this.$container.find('.fe-close_faq');
  },

  _bindEvent: function () {
    this.$btn_faq.on('click', $.proxy(this._openFaq, this));
    this.$close_faq.on('click', $.proxy(this._closeFaq, this));
    this.$container.on('click', '.cancel', $.proxy(this._onChangeContent, this));
    this.$container.on('keyup', '.fe-text_title', $.proxy(this._onChangeContent, this));
    this.$container.on('keyup', '.fe-text_content', $.proxy(this._onChangeContent, this));
    this.$container.on('keyup', '.fe-service_phone', $.proxy(this._onKeyUpPhoneNumber, this));
    this.$container.on('keyup', '.fe-quality_phone', $.proxy(this._onKeyUpPhoneNumber, this));
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
  },

  _openFaq: function (){
    $(document.body).css('overflow', 'hidden');
    this.$wrap_faq.show();
  },

  _closeFaq: function (){
    $(document.body).css('overflow', 'auto');
    this.$wrap_faq.hide();
  },

  _goQualityTab: function () {
    var $tab1 = this.$container.find('#tab1');
    var $tab2 = this.$container.find('#tab2');
    $tab1.attr('aria-selected', false);
    $tab2.attr('aria-selected', true);
  }
};

