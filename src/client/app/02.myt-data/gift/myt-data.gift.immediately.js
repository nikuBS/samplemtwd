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
    this.$recent_tel = this.$container.find('.recently-tel');
    this.$btnNativeContactList = $('.fe-btn_native_contact');
    this.$btnRequestSendingData = $('.fe-request_sending_data');
    this.$inputImmediatelyGift = $('.fe-input_immediately_gift');
    this.$wrap_data_select_list = $('.fe-immediately_data_select_list');
    this.$wrap_auto_select_list = $('.fe-auto_select_list');
  },

  _bindEvent: function () {
    this.$container.on('click', '.cancel', $.proxy(this._checkValidateSendingButton, this));
    this.$container.on('click', '[data-opdtm]', $.proxy(this._onSelectRecentContact, this));
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
      var mockDataQty = 900;
      // var apiDataQty = res.result.dataRemQty;
      // var dataQty = Tw.FormatHelper.convDataFormat(apiDataQty, 'MB');
      var mockData = Tw.FormatHelper.convDataFormat(mockDataQty, 'MB');
      // this.$remainQty.text(dataQty.data + dataQty.unit);
      // this._setAmountUI(Number(apiDataQty));
      this.beforeDataQty = mockDataQty;
      this.$remainQty.text(mockData.data + mockData.unit);
      this._setAmountUI(Number(mockDataQty));
    } else {
      this._setAmountUI(Number(0));
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _setAmountUI: function (nLimitMount) {
    var fnCheckedUI = function (nIndex, elInput) {
      var $input = $(elInput);
      if ( Number($input.val()) > nLimitMount ) {
        $input.prop('disabled', true);
        $input.parent().parent().addClass('disabled');
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
    this._hideRecentNumberLayer();
    this._checkValidateSendingButton();
    this._validateInputNumber();
    this.$inputImmediatelyGift.val(this._convertDashNumber(this.$inputImmediatelyGift.val()));
  },

  _onSelectRecentContact: function (e) {
    var opdtm = $(e.currentTarget).data('opdtm');
    var sNumber = $(e.currentTarget).find('.tel-select').text();

    this.$inputImmediatelyGift.val(sNumber);
    this.$inputImmediatelyGift.data('opdtm', opdtm);
    this._hideRecentNumberLayer();
  },

  _getReceiveUserInfo: function () {
    this.befrSvcNum = this.$inputImmediatelyGift.val();
    this.opDtm = this.$inputImmediatelyGift.data('opdtm');

    var svcNum = this.$inputImmediatelyGift.val().match(/\d+/g).join('');
    var isCellPhone = Tw.FormatHelper.isCellPhone(svcNum);

    if ( isCellPhone ) {
      if ( this._validatePhoneNumber(svcNum) ) {
        this._apiService.request(Tw.API_CMD.BFF_06_0019, { befrSvcNum: svcNum }).done($.proxy(this._onSuccessReceiveUserInfo, this));
      }
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0019, { opDtm: this.opDtm }).done($.proxy(this._onSuccessReceiveUserInfo, this));
    }
  },

  _onSuccessReceiveUserInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.paramData = $.extend({}, this.paramData, res.result);
      this._requestSendingData();
    } else {
      if ( res.code === 'ZNGME0008' ) {
        this._popupService.openAlert(Tw.MYT_DATA_CANCEL_MONTHLY.ALERT_NOT_SK);
      } else {
        Tw.Error(res.code, res.msg).pop();
      }
    }
  },

  _convertDashNumber: function (sTelNumber) {
    return Tw.StringHelper.phoneStringToDash(sTelNumber);
  },

  _requestSendingData: function () {
    var htParams = {
      befrSvcNum: this.$inputImmediatelyGift.val(),
      dataQty: this.$wrap_data_select_list.find('li.checked input').val(),
      beforeDataQty: this.beforeDataQty
    };

    this.paramData = $.extend({}, this.paramData, htParams);

    this._popupService.openConfirm(
      this.paramData.custNm + ' ( ' + Tw.FormatHelper.conTelFormatWithDash(this.$inputImmediatelyGift.val().replace(/-/g, '')) + ' ) ' +
      Tw.ALERT_MSG_MYT_DATA.GIFT_DATA_TARGET +
      Tw.FormatHelper.convDataFormat(this.paramData.dataQty, 'MB').data +
      Tw.FormatHelper.convDataFormat(this.paramData.dataQty, 'MB').unit +
      Tw.ALERT_MSG_MYT_DATA.GIFT_DATA_QUESTION,
      Tw.REFILL_COUPON_CONFIRM.CONFIRM_GIFT,
      $.proxy(this._onSuccessSendingData, this)
    );
  },

  _onSuccessSendingData: function (res) {
    this._popupService.close();

    // this._historyService.replaceURL('/myt-data/giftdata/complete?' + $.param(this.paramData));
    // TODO: Implemented API TEST
    this._apiService.request(Tw.API_CMD.BFF_06_0016, { befrSvcMgmtNum: this.paramData.befrSvcMgmtNum })
      .done($.proxy(this._onRequestSuccessGiftData, this));
  },

  _onRequestSuccessGiftData: function (res) {
    this._historyService.replaceURL('/myt-data/giftdata/complete?' + $.param(this.paramData));
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      // this._historyService.replaceURL('/myt-data/giftdata/complete?' + $.param(this.paramData));
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
  },

  _validatePhoneNumber: function (sPhone) {
    if ( sPhone.length < 10 ) {
      Tw.Error(null, Tw.VALIDATE_MSG_MYT_DATA.V18).pop();
      return false;
    }

    if ( !Tw.FormatHelper.isCellPhone(sPhone) ) {
      Tw.Error(null, Tw.VALIDATE_MSG_MYT_DATA.V9).pop();
      return false;
    }

    return true;
  },

  _validateInputNumber: function () {
    var sPhoneNumber = this.$inputImmediatelyGift.val() ? this.$inputImmediatelyGift.val().replace(/-/g, '') : '';

    if ( sPhoneNumber.length < 10 ) {
      this.$container.find('.fe-error-phone01').removeClass('blind');
    } else if ( !Tw.FormatHelper.isCellPhone(sPhoneNumber) ) {
      this.$container.find('.fe-error-phone02').removeClass('blind');
    }

    if ( sPhoneNumber.length === 0 || Tw.FormatHelper.isCellPhone(sPhoneNumber) ) {
      this._removeErrorComment();
    }
  },

  _removeErrorComment: function () {
    this.$container.find('[class*="fe-error"]').addClass('blind');
  },

  _hideRecentNumberLayer: function () {
    $('.recently-tel').hide();
  }
};