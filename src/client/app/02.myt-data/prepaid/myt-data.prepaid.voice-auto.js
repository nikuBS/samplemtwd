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
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onShowAmount, this));
    this.$container.on('click', '.fe-select-date', $.proxy(this._onShowDate, this));
    this.$container.on('click', '.fe-select-remain-amount', $.proxy(this._onShowRemainAmount, this));
    this.$container.on('change input blur click', '.fe-wrap-template [required]', $.proxy(this._validateForm, this));
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

  _onShowDate: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectDate = function (item) {
      return {
        value: item.text,
        option: false,
        attr: 'data-value=' + item.value
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_DATE.list.map($.proxy(fnSelectDate, this)) }]
      },
      $.proxy(this._selectPopupCallback, this, $elButton),
      null
    );
  },

  _onShowRemainAmount: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectDate = function (item) {
      return {
        value: item.text,
        option: false,
        attr: 'data-value=' + item.value
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_RECHARGE_AMOUNT.list.map($.proxy(fnSelectDate, this)) }]
      },
      $.proxy(this._selectPopupCallback, this, $elButton),
      null
    );
  },

  _onShowAmount: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectAmount = function (item) {
      return {
        value: item.text,
        option: false,
        attr: 'data-value=' + item.value
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_AMOUNT.list.map($.proxy(fnSelectAmount, this)) }]
      },
      $.proxy(this._selectPopupCallback, this, $elButton),
      null
    );
  },

  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '[data-value]', $.proxy(this._setSelectedValue, this, $target));
  },

  _setSelectedValue: function ($target, e) {
    this._popupService.close();
    $target.text($(e.currentTarget).text());
    $target.data('amount', $(e.currentTarget).data('value'));
  },

  _validateForm: function (e) {
    // this._checkIsAbled();
  },

  _checkIsAbled: function () {
    if ( this.$cardNumber.val() !== '' && this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPw.val() !== '' ) {
      this.$btnRequestCreditCard.prop('disabled', false);
    } else {
      this.$btnRequestCreditCard.prop('disabled', true);
    }
  }
};