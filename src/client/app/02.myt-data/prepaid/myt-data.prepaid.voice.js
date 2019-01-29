/**
 * FileName: myt-data.prepaid.voice.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.14
 */

Tw.MyTDataPrepaidVoice = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidVoice.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$wrapExampleCard = this.$container.find('.fe-wrap-example-card');
    this.$btnRequestCreditCard = this.$container.find('.fe-request-credit-card');
    this.$btnRequestPrepaidCard = this.$container.find('.fe-request-prepaid-card');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPwd = this.$container.find('.fe-card-pw');
    this.$prepaid_card = this.$container.find('.fe-prepaid-card');
    this.$prepaid_serial = this.$container.find('.fe-prepaid-serial');
    this.$creditAmount = this.$container.find('.fe-select-amount');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-popup-close', $.proxy(this._stepBack, this));
    this.$container.on('click', '.fe-close-example-card', $.proxy(this._onCloseExampleCard, this));
    this.$container.on('click', '.fe-btn-show-example', $.proxy(this._onShowExampleCard, this));
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onShowSelectAmount, this));
    this.$container.on('click', '.fe-request-prepaid-card', $.proxy(this._requestPrepaidCard, this));
    this.$container.on('click', '.fe-request-credit-card', $.proxy(this._validateCreditCard, this));
    this.$container.on('click', '.fe-prepaid-voice-cancel', $.proxy(this._closePrepaidPopup, this));
    this.$container.on('click', '.fe-prepaid-complete', $.proxy(this._requestCreditCard, this));
    this.$container.on('change input blur click', '#tab1-tab [required]', $.proxy(this._validatePrepaidCard, this));
    this.$container.on('change input blur click', '#tab2-tab [required]', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', 'input[type=tel]', $.proxy(this._checkMaxLength, this));
    this.$cardNumber.on('keyup', $.proxy(this._validateCard, this));
    this.$cardY.on('keyup', $.proxy(this._validateExpired, this));
    this.$cardM.on('keyup', $.proxy(this._validateExpired, this));
    this.$cardPwd.on('keyup', $.proxy(this._validatePwd, this));
    this.$prepaid_card.on('keyup', $.proxy(this._validatePrepaidNumber, this));
    this.$prepaid_serial.on('keyup', $.proxy(this._validatePrepaidSerial, this));

  },

  _validatePrepaidNumber: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind');

    if ( !this._validation.checkMoreLength(this.$prepaid_card, 10) ) {
      $error.removeClass('blind');
    }
  },

  _validatePrepaidSerial: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind');

    if ( !this._validation.checkMoreLength(this.$prepaid_serial, 10) ) {
      $error.removeClass('blind');
    }
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

  _validatePwd: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind');

    if ( this.$cardPwd.val() === '' ) {
      $error.removeClass('blind');
    }
  },

  _checkMaxLength: function (e) {
    Tw.InputHelper.inputNumberMaxLength(e.currentTarget);
  },

  _checkIsAbled: function () {
    if ( this.$creditAmount.data('amount') && this.$cardNumber.val() !== '' && this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPwd.val() !== '' ) {
      this.$btnRequestCreditCard.prop('disabled', false);
    } else {
      this.$btnRequestCreditCard.prop('disabled', true);
    }
  },

  _validateCreditCard: function () {
    var isValid = this._validation.checkMoreLength(this.$cardNumber, 15) &&
      this._validation.checkLength(this.$cardY.val(), 4) &&
      this._validation.checkLength(this.$cardM.val(), 2) &&
      this._validation.checkYear(this.$cardY) &&
      this._validation.checkMonth(this.$cardM, this.$cardY)

    if ( isValid ) {
      var htParams = {
        cardNum: $.trim(this.$cardNumber.val()).substr(0, 6)
      };

      this._apiService.request(Tw.API_CMD.BFF_06_0065, htParams)
        .done($.proxy(this._getCreditCardInfo, this));
    }
  },

  _validatePrepaidCard: function () {
    var arrValid = $.map($('#tab1-tab [required]'), function (elInput) {
      if ( $(elInput).val().length !== 0 ) {
        return true;
      }
      return false;
    });

    var isValid = !_.contains(arrValid, false);

    if ( isValid ) {
      this.$btnRequestPrepaidCard.prop('disabled', false);
    } else {
      this.$btnRequestPrepaidCard.prop('disabled', true);
    }

    return isValid;
  },

  _requestPrepaidCard: function () {
    var htParams = {
      cardNum: $('.fe-prepaid-card').val(),
      serialNum: $('.fe-prepaid-serial').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0067, htParams)
      .done($.proxy(this._getPrepaidCardInfo, this));
  },

  _getCreditCardInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var result = res.result;
      var previousAmount = Number($('.fe-remain-amount').data('remainAmount'));
      var rechargeAmount = Number($('.fe-select-amount').data('amount'));
      var afterAmount = previousAmount + rechargeAmount;
      this.amountInfo = {
        previousAmount: previousAmount,
        afterAmount: afterAmount,
        rechargeAmount: rechargeAmount
      };

      this._popupService.open({
        hbs: 'DC_09_01_01',
        layer: true,
        data: {
          cardNumber: this.$cardNumber.val(),
          cardCompany: result.prchsCardName,
          previousAmount: Tw.FormatHelper.addComma(previousAmount.toString()),
          afterAmount: Tw.FormatHelper.addComma(afterAmount.toString()),
          rechargeAmount: Tw.FormatHelper.addComma(rechargeAmount.toString())
        }
      });
    } else if ( res.code === 'BIL0080' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.INVALID_CARD);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _getPrepaidCardInfo: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var previousAmount = Number(resp.result.curAmt);
      var rechargeAmount = Number(resp.result.cardAmt);
      var afterAmount = previousAmount + rechargeAmount;
      this.amountInfo = {
        previousAmount: previousAmount,
        afterAmount: afterAmount,
        rechargeAmount: rechargeAmount
      };

      this._popupService.open({
        hbs: 'DC_09_01_01',
        layer: true,
        data: {
          cardNumber: $('.fe-prepaid-card').val(),
          cardCompany: Tw.PREPAID_VOICE.PREPAID_CARD,
          previousAmount: Tw.FormatHelper.addComma(previousAmount.toString()),
          afterAmount: Tw.FormatHelper.addComma(afterAmount.toString()),
          rechargeAmount: Tw.FormatHelper.addComma(rechargeAmount.toString())
        }
      });
    } else if ( resp.code === 'BIL0102' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.INVALID_CARD);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _onShowSelectAmount: function (e) {
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
      $.proxy(this._selectPopupCallback, this, $elButton),
      $.proxy(this._validSelectedValue, this, $elButton)
    );
  },

  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '[data-value]', $.proxy(this._setSelectedValue, this, $target));
    // $layer.on('click', '.tw-popup-closeBtn', $.proxy(this._validSelectedValue, this, $target));
  },

  _validSelectedValue: function ($elButton) {
    var $error = $($elButton).closest('li').find('.error-txt');
    $error.addClass('blind');

    if ( !!$($elButton).data('amount') === false ) {
      $($error.get(0)).removeClass('blind');
    }
  },

  _setSelectedValue: function ($target, e) {
    this._popupService.close();
    $target.text($(e.currentTarget).text());
    $target.data('amount', $(e.currentTarget).data('value'));
  },

  _onShowExampleCard: function () {
    this.$wrapExampleCard.show();
  },

  _onCloseExampleCard: function () {
    this.$wrapExampleCard.hide();
  },

  _closePrepaidPopup: function () {
    this._popupService.close();
  },

  _requestCreditCard: function () {
    var htParams = {
      amt: Number($('.fe-select-amount').data('amount')).toString(),
      cardNum: this.$cardNumber.val(),
      expireYY: this.$cardY.val(),
      expireMM: this.$cardM.val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0053, htParams)
      .done($.proxy(this._onCompleteRechargeByCreditCard, this));
  },

  _onCompleteRechargeByCreditCard: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // Tw.CommonHelper.toast(Tw.ALERT_MSG_MYT_DATA.COMPLETE_RECHARGE);
      this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=voice&' + $.param(this.amountInfo));
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
          this._historyService.replaceURL('/myt-data/submain');
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES
    );
  }
};