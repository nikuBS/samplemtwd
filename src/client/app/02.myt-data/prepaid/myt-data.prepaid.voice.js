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
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-popup-close', $.proxy(this._stepBack, this));
    this.$container.on('click', '.fe-close-example-card', $.proxy(this._onCloseExampleCard, this));
    this.$container.on('click', '.fe-btn-show-example', $.proxy(this._onShowExampleCard, this));
    this.$container.on('click', '.fe-select-amount', $.proxy(this._onShowSelectAmount, this));
    this.$container.on('click', '.fe-request-prepaid-card', $.proxy(this._onRequestPrepaidCard, this));
    this.$container.on('click', '.fe-request-credit-card', $.proxy(this._validateCreditCard, this));
    this.$container.on('click', '.fe-prepaid-voice-cancel', $.proxy(this._closePrepaidPopup, this));
    this.$container.on('click', '.fe-prepaid-complete', $.proxy(this._requestCompleteCreditCard, this));
    this.$container.on('change input blur click', '#tab1-tab [required]', $.proxy(this._validatePrepaidCard, this));
    this.$container.on('change input blur click', '#tab2-tab [required]', $.proxy(this._checkIsAbled, this));
  },

  _checkIsAbled: function () {
    if ( this.$cardNumber.val() !== '' && this.$cardY.val() !== '' && this.$cardM.val() !== '' ) {
      this.$btnRequestCreditCard.prop('disabled', false);
    } else {
      this.$btnRequestCreditCard.prop('disabled', true);
    }
  },

  _validateCreditCard: function () {
    var isValid = this._validation.checkMoreLength(this.$cardNumber.val(), 15, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4) &&
      this._validation.checkLength(this.$cardY.val(), 4, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkLength(this.$cardM.val(), 2, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6)

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

  _onRequestPrepaidCard: function () {
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
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _onShowSelectAmount: function (e) {
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

  _onShowExampleCard: function () {
    this.$wrapExampleCard.show();
  },

  _onCloseExampleCard: function () {
    this.$wrapExampleCard.hide();
  },

  _closePrepaidPopup: function () {
    this._popupService.close();
  },

  _requestCompleteCreditCard: function () {
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
    this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete?type=voice&' + $.param(this.amountInfo));
    // if ( res.code === Tw.API_CODE.CODE_00 ) {
    //   this._historyService.replaceURL('/myt-data/recharge/prepaid/voice-complete');
    // } else {
    //   Tw.Error(res.code, res.msg).pop();
    // }
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
          this._historyService.replaceURL('/myt-data');
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES
    );
  }
};