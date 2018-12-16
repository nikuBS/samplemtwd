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
    this.$request_recharge_auto = $('.fe-request-recharge');
    this.tpl_recharge_once = Handlebars.compile($('#tpl_recharge_once').html());
    this.tpl_recharge_amount = Handlebars.compile($('#tpl_recharge_amount').html());
  },

  _bindEvent: function () {
    this.$container.on('click', 'li.fe-template-type', $.proxy(this._changeRechargeType, this));
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onShowAmount, this));
    this.$container.on('click', '.fe-select-date', $.proxy(this._onShowDate, this));
    this.$container.on('click', '.fe-select-remain-amount', $.proxy(this._onShowRemainAmount, this));
    this.$container.on('change input blur click', '.fe-wrap-template [required]', $.proxy(this._validateForm, this));
    this.$container.on('click', '.fe-request-recharge', $.proxy(this._requestRechargeAuto, this));
  },

  _changeRechargeType: function (e) {
    var $elTarget = $(e.currentTarget);
    var currentTemplateIndex = $elTarget.parent().find('li').index($elTarget);

    if ( this.templateIndex !== currentTemplateIndex ) {
      if ( currentTemplateIndex === 0 ) {
        this.wrap_template.html(this.tpl_recharge_once());
      } else {
        this.wrap_template.html(this.tpl_recharge_amount());
      }
    }

    this.templateIndex = currentTemplateIndex;
  },

  _onShowDate: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectDate = function (item) {
      return {
        value: item.text,
        option: false,
        attr: 'data-value=' + item.chargeCd
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_DATE.list.map($.proxy(fnSelectDate, this)) }]
      },
      $.proxy(this._selectPopupCallback, this, [$elButton, true]),
      null
    );
  },

  _onShowRemainAmount: function (e) {
    var $elButton = $(e.currentTarget);
    var fnSelectDate = function (item) {
      return {
        value: item.text,
        option: false,
        attr: 'data-value=' + item.chargeCd
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_RECHARGE_AMOUNT.list.map($.proxy(fnSelectDate, this)) }]
      },
      $.proxy(this._selectPopupCallback, this, [$elButton, true]),
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
      $.proxy(this._selectPopupCallback, this, [$elButton, false]),
      null
    );
  },

  _selectPopupCallback: function (arrParams, $layer) {
    $layer.on('click', '[data-value]', $.proxy(this._setSelectedValue, this, arrParams));
  },

  _setSelectedValue: function (arrParams, e) {
    var $target = arrParams[0];
    var isChargeCd = arrParams[1];
    if ( isChargeCd ) {
      debugger;
      this.chargeCd = $(e.currentTarget).data('value');
    }

    this._popupService.close();
    $target.text($(e.currentTarget).text());
    $target.data('amount', $(e.currentTarget).data('value'));
  },

  _validateForm: function (e) {
    this._checkIsAbled();
  },

  _checkIsAbled: function () {
    if ( $('.fe-card-number').val() !== '' && $('.fe-card-y').val() !== '' && $('.fe-card-m').val() !== '' ) {
      this.$request_recharge_auto.prop('disabled', false);
    } else {
      this.$request_recharge_auto.prop('disabled', true);
    }
  },

  _requestRechargeAuto: function (e) {
    if ( this.chargeCd || this.amt ) {
      var htParams = {
        amt: $('.fe-select-amount').data('amount'),
        chargeCd: this.chargeCd,
        endDt: $('.fe-select-expire').val().replace(/-/g, ''),
        cardNum: $('.fe-card-number').val(),
        expireYY: $('.fe-card-y').val(),
        expireMM: $('.fe-card-m').val()
      };

      this._apiService.request(Tw.API_CMD.BFF_06_0054, htParams)
        .done($.proxy(this._onCompleteRechargeAuto, this));
    }
  },

  _onCompleteRechargeAuto: function (res) {
    var htParams = {
      amt: $('.fe-select-amount').data('amount'),
      chargeCd: this.chargeCd,
      endDt: $('.fe-select-expire').val().replace(/-/g, '')
    }
    this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=auto&' + $.param(htParams));

    // if ( res.code === Tw.API_CODE.CODE_00 ) {
    //   this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=auto&' + $.param(htParams));
    // } else {
    //   Tw.Error(res.code, res.msg).pop();
    // }
  },

  _onCompleteRechargeAutoChange: function (res) {
    this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=auto&' + $.param(this.amountInfo));
    // if ( res.code === Tw.API_CODE.CODE_00 ) {
    //   this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete');
    // } else {
    //   Tw.Error(res.code, res.msg).pop();
    // }
  }
};