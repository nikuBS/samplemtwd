/**
 * FileName: myt-data.ting.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.18
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
  },

  _bindEvent: function () {
    this.$btn_send_gift.on('click', $.proxy(this._getReceiveUserInfo, this));
    this.$btn_native_contact_list.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$input_ting_receiver.on('keyup', $.proxy(this._onKeyUpTingGiftNumber, this));
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

      if ( Number($input.val()) === nLimitMount ) {
        $input.click();
      }
    };

    var elAmount = this.$wrap_amount_select_list.find('input').each(fnCheckedUI);
    elAmount.not(':disabled').get(0).click();
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      this.$input_ting_receiver.val(this._convertDashNumber(params.phoneNumber));
    }
  },

  _convertDashNumber: function (sTelNumber) {
    return Tw.StringHelper.phoneStringToDash(sTelNumber);
  },

  _onKeyUpTingGiftNumber: function () {
    this._checkValidateSendingButton();
    this.$input_ting_receiver.val(this._convertDashNumber(this.$input_ting_receiver.val()));
  },

  _getReceiveUserInfo: function () {
    var befrSvcNum = this.$input_ting_receiver.val().match(/\d+/g).join('');

    this._apiService.request(Tw.API_CMD.BFF_06_0022, { chrgSvcNum: befrSvcNum })
      .done($.proxy(this._onSuccessReceiveUserInfo, this));
  },

  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._requestSendingData();
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
      this._historyService.replaceURL('/myt/data/ting/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _checkValidateSendingButton: function () {
    if ( this.$input_ting_receiver.val().match(/\d+/g) ) {
      this.$btn_send_gift.attr('disabled', false);
    } else {
      this.$btn_send_gift.attr('disabled', true);
    }
  }
};