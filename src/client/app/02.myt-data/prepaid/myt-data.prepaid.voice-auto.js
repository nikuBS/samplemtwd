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
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-popup-close', $.proxy(this._stepBack, this));
    this.$container.on('click', 'li.fe-template-type', $.proxy(this._changeRechargeType, this));
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onShowAmount, this));
    this.$container.on('click', '.fe-select-date', $.proxy(this._onShowDate, this));
    this.$container.on('click', '.fe-select-remain-amount', $.proxy(this._onShowRemainAmount, this));
    this.$container.on('change', '.fe-select-expire', $.proxy(this._validateExpireDate, this));
    this.$container.on('blur', '.fe-select-expire', $.proxy(this._validateExpireDate, this));
    this.$container.on('change input blur click', '.fe-wrap-template [required]', $.proxy(this._validateForm, this));
    this.$container.on('click', '.fe-request-recharge', $.proxy(this._requestRechargeAuto, this));
    this.$container.on('keyup', 'input[type=tel]', $.proxy(this._checkMaxLength, this));
    this.$container.on('keyup', '.fe-card-number', $.proxy(this._validateCard, this));
    this.$container.on('keyup', '.fe-card-y', $.proxy(this._validateExpired, this));
    this.$container.on('keyup', '.fe-card-m', $.proxy(this._validateExpired, this));
  },

  _validateCard: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind');

    if ( !this._validation.checkMoreLength(this.$cardNumber, 15) ) {
      $($error.get(0)).removeClass('blind');
      $($error.get(1)).addClass('blind');
    }

    if ( this.$cardNumber.val() === '' ) {
      $($error.get(0)).addClass('blind');
      $($error.get(1)).removeClass('blind');
    }
  },

  _validateExpired: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind');

    if ( this.$cardY.val() === '' || this.$cardM.val() === '' ) {
      $($error.get(0)).addClass('blind');
      $($error.get(1)).removeClass('blind');
    }

    if ( !(this._validation.checkMoreLength(this.$cardY, 4) && this._validation.checkMoreLength(this.$cardM, 2) && this._validation.checkYear(this.$cardY) && this._validation.checkMonth(this.$cardM, this.$cardY)) ) {
      $($error.get(0)).removeClass('blind');
      $($error.get(1)).addClass('blind');
    }
  },

  _validateExpireDate: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    var $target = $(e.currentTarget);

    if ( Tw.DateHelper.isBefore($target.val()) ) {
      this._popupService.openAlert(Tw.MYT_DATA_PREPAID.INVALID_DATE);
      $target.val(Tw.DateHelper.getTomorrowDate());
    }

    if ( !$target.val() ) {
      $($error.get(0)).removeClass('blind');
    } else {
      $($error.get(0)).addClass('blind');
    }
  },

  _checkMaxLength: function (e) {
    Tw.InputHelper.inputNumberMaxLength(e.currentTarget);
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
    var fnSelectDate = function ($elButton, item) {
      return {
        value: item.text,
        option: $elButton.text().trim() === item.text ? 'checked' : '',
        attr: 'data-value=' + item.chargeCd
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_DATE.list.map($.proxy(fnSelectDate, this, $elButton)) }]
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
    var fnSelectAmount = function ($elButton, item) {
      return {
        value: item.text,
        option: $elButton.text().trim() === item.text ? 'checked' : '',
        attr: 'data-value=' + item.value
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_AMOUNT.list.map($.proxy(fnSelectAmount, this, $elButton)) }]
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
    // this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=auto&' + $.param(htParams));

    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.toast(Tw.ALERT_MSG_MYT_DATA.COMPLETE_RECHARGE);
      this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=auto&' + $.param(htParams));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  // _onCompleteRechargeAutoChange: function (res) {
  //   this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=auto&' + $.param(this.amountInfo));
  //   // if ( res.code === Tw.API_CODE.CODE_00 ) {
  //   //   this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete');
  //   // } else {
  //   //   Tw.Error(res.code, res.msg).pop();
  //   // }
  // },

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
          this._historyService.replaceURL('/myt-data/submain');
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES
    );
  }
};