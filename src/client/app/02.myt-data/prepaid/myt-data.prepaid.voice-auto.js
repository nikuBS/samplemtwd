/**
 * FileName: myt-data.prepaid.voice.auto.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.16
 */

Tw.MyTDataPrepaidVoiceAuto = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidVoiceAuto.prototype = {
  _init: function () {
    this.templateIndex = 0;
  },

  _cachedElement: function () {
    this.wrap_template = $('.fe-wrap-template');
    this.tpl_recharge_once = Handlebars.compile($('#tpl_recharge_once').html());
    this.tpl_recharge_amount = Handlebars.compile($('#tpl_recharge_amount').html());
  },

  _bindEvent: function () {
    this.$container.on('click', 'li.fe-template-type', $.proxy(this._changeRechargeType, this));

  },

  _changeRechargeType: function (e) {
    var $elTarget = $(e.currentTarget);
    var currentTemplateIndex = $elTarget.parent().find('li').index($elTarget);

    if ( this.templateIndex !== currentTemplateIndex ) {
      this.templateIndex = currentTemplateIndex;

      if ( currentTemplateIndex === 0 ) {
        this.wrap_template.html(this.tpl_recharge_once());
      } else {
        this.wrap_template.html(this.tpl_recharge_amount());
      }
    }
  },

  _isValidForm: function (e) {

  }
};