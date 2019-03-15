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
  this._backAlert = new Tw.BackAlert(rootEl, true);

  this._cachedElement();
  this._init();
};

Tw.MyTDataPrepaidVoice.prototype = {
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

  _init: function () {
    this._getPpsInfo();
    this._getEmailAddress();
  },

  _getPpsInfo: function () {
    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_05_0013, {})
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._getFail, this));
  },

  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._bindEvent();
      this._setData(res.result);
    } else {
      this._getFail(res);
    }
  },

  _getFail: function (err) {
    Tw.CommonHelper.endLoading('.popup-page');
    Tw.Error(err.code, err.msg).replacePage();
  },

  _getEmailAddress: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0061, {})
      .done($.proxy(this._emailSuccess, this))
      .fail($.proxy(this._emailFail, this));
  },

  _emailSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$emailAddress = res.result.email;
    } else {
      this._emailFail();
    }
  },

  _emailFail: function () {
    this.$emailAddress = '';
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-tab-wrap > li', $.proxy(this._changeTab, this));
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
    this.$cardNumber.on('keyup blur', $.proxy(this._validateCard, this));
    this.$cardY.on('keyup blur', $.proxy(this._validateExpired, this));
    this.$cardM.on('keyup blur', $.proxy(this._validateExpired, this));
    this.$cardPwd.on('keyup blur', $.proxy(this._validatePwd, this));
    this.$prepaid_card.on('keyup blur', $.proxy(this._validatePrepaidNumber, this));
    this.$prepaid_serial.on('keyup blur', $.proxy(this._validatePrepaidSerial, this));
  },

  _changeTab: function (event) {
    var $target = $(event.currentTarget);
    $target.find('a').attr('title', Tw.BUTTON_LABEL.SELECTED);
    $target.siblings().find('a').removeAttr('title');
  },

  _setData: function (result) {
    var data = 0, dataText = 0;
    if (!Tw.FormatHelper.isEmpty(result.prodAmt) && result.prodAmt !== '0') {
      data = result.prodAmt;
      dataText = Tw.FormatHelper.addComma(result.prodAmt);
    }
    this.$container.find('.fe-remain-amount').attr('data-remain-amount', data).text(dataText);

    this.$container.find('.fe-from-date').text(Tw.DateHelper.getShortDate(result.obEndDt));
    this.$container.find('.fe-to-date').text(Tw.DateHelper.getShortDate(result.inbEndDt));
    this.$container.find('.fe-remain-date').text(Tw.DateHelper.getShortDate(result.numEndDt));
  },

  _validatePrepaidNumber: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( Tw.FormatHelper.isEmpty(this.$prepaid_card.val()) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
    } else if ( !this._validation.checkMoreLength(this.$prepaid_card, 10) ) {
      $($error.get(1)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  _validatePrepaidSerial: function (e) {
    Tw.InputHelper.inputNumberAndAlphabet(e.target);

    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( Tw.FormatHelper.isEmpty(this.$prepaid_serial.val()) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
    } else if ( !this._validation.checkMoreLength(this.$prepaid_serial, 10) ) {
      $($error.get(1)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  _validateCard: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( !this._validation.checkMoreLength(this.$cardNumber, 15) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
      $($error.get(1)).addClass('blind').attr('aria-hidden', 'true');
    } else {
      this._getCardInfo();
    }

    if ( this.$cardNumber.val() === '' ) {
      $($error.get(0)).addClass('blind').attr('aria-hidden', 'true');
      $($error.get(1)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  _getCardInfo: function () {
    var isValid = this._validation.checkMoreLength(this.$cardNumber, 15);

    if ( isValid ) {
      var htParams = {
        cardNum: $.trim(this.$cardNumber.val()).substr(0, 6)
      };

      this._apiService.request(Tw.API_CMD.BFF_06_0065, htParams)
        .done($.proxy(this._getCardCode, this));
    }
  },

  _getCardCode: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
    } else {
      var $credit_error = this.$cardNumber.closest('li').find('.error-txt').get(2);
      $($credit_error).removeClass('blind').attr('aria-hidden', 'false');
      this.$btnRequestCreditCard.prop('disabled', true);
    }
  },

  _validateExpired: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( this.$cardY.val() === '' || this.$cardM.val() === '' ) {
      $($error.get(1)).removeClass('blind').attr('aria-hidden', 'false');
    } else if ( !(this._validation.checkMoreLength(this.$cardY, 4) && this._validation.checkMoreLength(this.$cardM, 2) &&
      this._validation.checkYear(this.$cardY) && this._validation.checkMonth(this.$cardM, this.$cardY)) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  _validatePwd: function (e) {
    var $error = $(e.currentTarget).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( this.$cardPwd.val() === '' ) {
      $error.removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  _checkMaxLength: function (e) {
    Tw.InputHelper.inputNumberMaxLength(e.currentTarget);
  },

  _checkIsAbled: function () {
    if ( this.$creditAmount.data('amount') && this.$cardNumber.val() !== '' &&
      this.$cardY.val() !== '' && this.$cardM.val() !== '' && this.$cardPwd.val() !== '' ) {
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
      this._validation.checkMonth(this.$cardM, this.$cardY);

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
          rechargeAmount: Tw.FormatHelper.addComma(rechargeAmount.toString()),
          emailAddress: this.$emailAddress
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
    $layer.on('click', 'li', $.proxy(this._setSelectedValue, this, $target));
    // $layer.on('click', '.tw-popup-closeBtn', $.proxy(this._validSelectedValue, this, $target));
  },

  _validSelectedValue: function ($elButton) {
    var $error = $($elButton).closest('li').find('.error-txt');
    $error.addClass('blind').attr('aria-hidden', 'true');

    if ( Tw.FormatHelper.isEmpty($($elButton).attr('data-amount')) ) {
      $($error.get(0)).removeClass('blind').attr('aria-hidden', 'false');
    }
  },

  _setSelectedValue: function ($target, e) {
    this._popupService.close();
    $target.text($(e.currentTarget).text());
    $target.attr('data-amount', $(e.currentTarget).find('button').attr('data-value'));

    this._validSelectedValue($target);
    this._checkIsAbled();
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
      expireYY: this.$cardY.val().substr(2,2),
      expireMM: this.$cardM.val(),
      pwd: this.$cardPwd.val()
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
    this._backAlert.onClose();
    // var confirmed = false;
    // this._popupService.openConfirmButton(
    //   Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
    //   Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
    //   $.proxy(function () {
    //     confirmed = true;
    //     this._popupService.close();
    //   }, this),
    //   $.proxy(function () {
    //     if ( confirmed ) {
    //       this._historyService.replaceURL('/myt-data/submain');
    //     }
    //   }, this),
    //   Tw.BUTTON_LABEL.NO,
    //   Tw.BUTTON_LABEL.YES
    // );
  }
};