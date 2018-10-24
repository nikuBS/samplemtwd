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
    this.$remainQty = $('.fe-remain_data');
    this.$btnNativeContactList = $('.fe-btn_native_contact');
    this.$btnRequestSendingData = $('.fe-request_sending_data');
    this.$inputImmediatelyGift = $('.fe-input_immediately_gift');
    this.$wrap_data_select_list = $('.fe-immediately_data_select_list');
    this.$wrap_auto_select_list = $('.fe-auto_select_list');
  },

  _bindEvent: function () {
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$btnRequestSendingData.on('click', $.proxy(this._getReceiveUserInfo, this));
    this.$wrap_data_select_list.on('click', 'input', $.proxy(this._onClickDataQty, this));
    this.$inputImmediatelyGift.on('keyup', $.proxy(this._onKeyUpImmediatelyGiftNumber, this));
  },

  _getRemainDataInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0014, {}).done($.proxy(this._onSuccessRemainDataInfo, this));
  },

  _onClickDataQty: function () {
    this._checkValidateSendingButton();
  },

  _onSuccessRemainDataInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._setAmountUI(Number(res.result.dataRemQty));
      var dataQty = Tw.FormatHelper.convDataFormat(res.result.dataRemQty, 'MB');
      this.$remainQty.text(dataQty.data + dataQty.unit);
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
    };

    this.$wrap_data_select_list.find('input').each(fnCheckedUI);
    this.$wrap_auto_select_list.find('input').each(fnCheckedUI);
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
    this.befrSvcNum = this.$inputImmediatelyGift.val().match(/\d+/g).join('');

    this._apiService.request(Tw.API_CMD.BFF_06_0019, { befrSvcNum: this.befrSvcNum }).done($.proxy(this._onSuccessReceiveUserInfo, this));
  },

  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.paramData = $.extend({}, this.paramData, res.result);
      this._requestSendingData();
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

    this.paramData = $.extend({}, this.paramData, htParams);

    this._historyService.replaceURL('/myt/data/gift/complete?' + $.param(this.paramData));

    // TODO: Implemented API TEST
    // this._apiService.request(Tw.API_CMD.BFF_06_0016, htParams)
    //   .done($.proxy(this._onSuccessSendingData, this));
  },

  _onSuccessSendingData: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt/data/gift/complete?' + $.param(this.paramData));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _checkValidateSendingButton: function () {
    var isValidQty = this.$wrap_data_select_list.find('input:checked').length !== 0;
    var isValidPhone = this.$inputImmediatelyGift.val().length !== 0;

    if ( isValidQty && isValidPhone ) {
      this.$btnRequestSendingData.attr('disabled', false);
    } else {
      this.$btnRequestSendingData.attr('disabled', true);
    }
  }
};