/**
 * @file myt-data.ting.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.18
 */

Tw.MyTDataTing = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataTing.prototype = {
  _init: function () {
    this._getRemainDataInfo();
  },

  _cachedElement: function () {
    this.$btn_send_gift = $('.fe-btn_ting_send');
    this.$input_ting_receiver = $('.fe-input_ting_receiver');
    this.$btn_native_contact_list = $('.fe-btn_native_contact');
    this.$wrap_amount_select_list = $('.fe-ting_amount_select_list');
    this.$error_text = $('.fe-error-text');
  },

  _bindEvent: function () {
    this.$btn_send_gift.on('click', $.proxy(this._getReceiveUserInfo, this));
    this.$btn_native_contact_list.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$input_ting_receiver.on('input change', $.proxy(this._onInputChangeTingGiftNumber, this));
    this.$wrap_amount_select_list.on('click', $.proxy(this._checkValidateSendingButton, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkValidateSendingButton, this));
    // this.$container.on('click', '.prev-step', $.proxy(this._stepBack, this));
  },

  _getRemainDataInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0020, {}).done($.proxy(this._onSuccessRemainDataInfo, this));
  },

  _onSuccessRemainDataInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._setAmountUI(Number(res.result.transferableAmt));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _setAmountUI: function (nLimitMount) {
    var fnCheckedUI = function (nIndex, elInput) {
      var $input = $(elInput);

      if ( Number($input.val()) > nLimitMount ) {
        $input.prop('disabled', true);
        $input.parent().addClass('disabled');
      }

      // if ( Number($input.val()) === nLimitMount ) {
      //   $input.click();
      // }
    };

    this.$wrap_amount_select_list.find('input').each(fnCheckedUI);
    // var elAmount = this.$wrap_amount_select_list.find('input').each(fnCheckedUI);
    // elAmount.not(':disabled').get(0).click();
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      this.$input_ting_receiver.val(this._convertDashNumber(params.phoneNumber)).trigger('change');
      this._validatePhoneNumber();
    }
  },

  _convertDashNumber: function (sTelNumber) {
    return Tw.StringHelper.phoneStringToDash(sTelNumber);
  },

  _onInputChangeTingGiftNumber: function () {
    this._checkValidateSendingButton();

    if ( this.$input_ting_receiver.val() ) {
      Tw.InputHelper.inputNumberOnly(this.$input_ting_receiver);
    }

    this.$input_ting_receiver.val(this._convertDashNumber(this.$input_ting_receiver.val()));

    this._validatePhoneNumber();
  },

  _getReceiveUserInfo: function (e) {
    var $target = $(e.currentTarget);
    this.befrSvcNum = this.$input_ting_receiver.val().match(/\d+/g).join('');

    var isValidPhone = this._validatePhoneNumber(this.befrSvcNum);

    if ( isValidPhone ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0022, { chrgSvcNum: this.befrSvcNum })
        .done($.proxy(this._onSuccessReceiveUserInfo, this, $target));
    }
  },

  _onSuccessReceiveUserInfo: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._requestSendingData();
    } else if ( res.code === 'ZPAYE0077' ) {
      this._popupService.openAlert(Tw.MYT_DATA_TING.V31, null, null, null, null, $target);
    } else if ( res.code === 'ZINVE8164' ) {
      this._popupService.openAlert(Tw.MYT_DATA_TING.NOT_TING_SKT, null, null, null, null, $target);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _requestSendingData: function () {
    var htParams = {
      befrSvcNum: this.$input_ting_receiver.val().match(/\d+/g).join(''),
      amt: this.$wrap_amount_select_list.find('li.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0023, htParams)
      .done($.proxy(this._onSuccessSendingData, this));
  },

  _onSuccessSendingData: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/ting/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _checkValidateSendingButton: function () {
    var elAmount = this.$wrap_amount_select_list.find('li input:checked');

    if ( !Tw.FormatHelper.isEmpty(elAmount.val()) && this._validatePhoneNumber() ) {
      this.$btn_send_gift.attr('disabled', false);
    } else {
      this.$btn_send_gift.attr('disabled', true);
    }
  },

  _validatePhoneNumber: function () {
    var sPhone = this.$input_ting_receiver.val().match(/\d+/g) ? this.$input_ting_receiver.val().match(/\d+/g).join('') : '';

    if ( sPhone.length < 10 ) {
      // Tw.Error(null, Tw.VALIDATE_MSG_MYT_DATA.V18).pop();
      this.$error_text.addClass('blind');
      $(this.$error_text.get(0)).removeClass('blind');
      return false;
    } else if ( !Tw.FormatHelper.isCellPhone(sPhone) ) {
      // Tw.Error(null, Tw.VALIDATE_MSG_MYT_DATA.V9).pop();
      this.$error_text.addClass('blind');
      $(this.$error_text.get(1)).removeClass('blind');
      return false;
    } else {
      this.$error_text.addClass('blind');
    }

    return true;
  },

  _stepBack: function (e) {
    var $target = $(e.currentTarget);
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
          this._historyService.goBack();
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES,
      $target
    );
  },

  _goSubmain: function () {
    this._historyService.replaceURL('/myt-data/submain');
  }
};