/**
 * FileName: myt-data.gift.immediately.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.09.10
 */

Tw.MyTDataGiftImmediately = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGiftImmediately.prototype = {
  _init: function () {
    this._getRemainDataInfo();
  },

  _cachedElement: function () {
    this.$btnNativeContactList = $('.fe-btn_native_contact');
    this.$btnRequestSendingData = $('.fe-request_sending_data');
    this.$inputImmediatelyGift = $('.fe-input_immediately_gift');
    this.$wrap_data_select_list = $('.fe-immediately_data_select_list');
  },

  _bindEvent: function () {
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$btnRequestSendingData.on('click', $.proxy(this._requestSendingData, this));
    this.$inputImmediatelyGift.on('keyup', $.proxy(this._onKeyUpImmediatelyGiftNumber, this));
  },

  _getRemainDataInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0014, {}).done($.proxy(this._onSuccessRemainDataInfo, this));
  },

  _onSuccessRemainDataInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // res.result.dataRemQty
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      this.$inputImmediatelyGift.val(this._convertDashNumber(params.phoneNumber));
    }
  },

  _onKeyUpImmediatelyGiftNumber: function () {
    this._checkValidateSendingButton();
    this.$inputImmediatelyGift.val(this._convertDashNumber(this.$inputImmediatelyGift.val()));
  },

  _getReceiveUserInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0019, {}).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },

  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {

    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _convertDashNumber: function (sTelNumber) {
    return Tw.StringHelper.phoneStringToDash(sTelNumber);
  },

  _requestSendingData: function () {
    var htParams = {
      befrSvcNum: this.$inputImmediatelyGift.val().match(/\d+/g).join(''),
      dataQty: this.$wrap_data_select_list.find('li.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0016, htParams)
      .done($.proxy(this._onSuccessSendingData, this));
    // this._historyService.replaceURL('/myt/data/gift/complete');
  },

  _onSuccessSendingData: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      debugger;
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _checkValidateSendingButton: function () {
    this.$btnRequestSendingData.attr('disabled', false);
  }
};