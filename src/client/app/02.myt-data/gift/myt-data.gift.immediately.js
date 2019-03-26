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
    // this.reqCnt = 0;
    // this._getRemainDataInfo();
    this.runBlur = true;
    this._apiService.request(Tw.API_CMD.BFF_06_0015, {})
      .done($.proxy(this._successGiftData, this));
  },

  _cachedElement: function () {
    // this.$remainQty = $('.fe-remain_data');
    // this.$wrap_auto_select_list = $('.fe-auto_select_list');
    this.$wrap = $('.wrap');
    this.$btnNativeContactList = $('.fe-btn_native_contact');
    this.$btnRequestSendingData = $('.fe-request_sending_data');
    this.$inputImmediatelyGift = $('.fe-input_immediately_gift');
    this.$wrap_data_select_list = $('.fe-immediately_data_select_list');
    this.tpl_immediately_error = Handlebars.compile($('#tpl_immediately_error').html());
  },

  _bindEvent: function () {
    this.$container.on('click', '.cancel', $.proxy(this._checkValidateSendingButton, this));
    this.$container.on('click', '[data-opdtm]', $.proxy(this._onSelectRecentContact, this));
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$btnRequestSendingData.on('click', $.proxy(this._getReceiveUserInfo, this));
    this.$wrap_data_select_list.on('click', 'input', $.proxy(this._onClickDataQty, this));
    this.$inputImmediatelyGift.on('input', $.proxy(this._onInputImmediatelyGiftNumber, this));
    this.$inputImmediatelyGift.on('blur', $.proxy(this._onBlurImmediatelyGiftNumber, this));
    this.$inputImmediatelyGift.on('focus', $.proxy(this._onFocusImmediatelyGiftNumber, this));
    this.$wrap.on('showUnableGift', $.proxy(this._showUnableGift, this));
    this.$container.on('mouseenter', '.fe-opdtm', $.proxy(this._mouseEnter, this));
    this.$container.on('mouseleave', '.fe-opdtm', $.proxy(this._mouseLeave, this));
  },

  _mouseEnter: function() {
    this.runBlur = false;
  },

  _mouseLeave: function() {
    this.runBlur = true;
  },

  _showUnableGift: function (e, errorCode) {
    var $wrapImmediatelyGift = $('.fe-wrap-immediately');
    var code = e;

    if ( !!errorCode ) {
      code = errorCode;
    }

    switch ( code ) {
      case 'GFT0001':
        $wrapImmediatelyGift.html(this.tpl_immediately_error({ content: Tw.MYT_DATA_GIFT.GFT0001 }));
        break;
      case 'GFT0002':
        $wrapImmediatelyGift.html(this.tpl_immediately_error({ content: Tw.MYT_DATA_GIFT.GFT0001 }));
        break;
      case 'GFT0003':
        $wrapImmediatelyGift.html(this.tpl_immediately_error({ content: Tw.MYT_DATA_GIFT.GFT0003 }));
        break;
      case 'GFT0004':
        $wrapImmediatelyGift.html(this.tpl_immediately_error({ content: Tw.MYT_DATA_GIFT.GFT0004 }));
        break;
      case 'GFT0005':
        $wrapImmediatelyGift.html(this.tpl_immediately_error({ content: Tw.MYT_DATA_GIFT.GFT0005 }));
        break;
      case 'GFT00013':
        $wrapImmediatelyGift.html(this.tpl_immediately_error({ content: Tw.MYT_DATA_GIFT.GFT0013 }));
        break;
      case 'ZORDC1020':
        $wrapImmediatelyGift.html(this.tpl_immediately_error({ content: Tw.MYT_DATA_GIFT.GFT0013 }));
        break;
      default:
        $wrapImmediatelyGift.html(this.tpl_immediately_error({ content: Tw.MYT_DATA_GIFT.DEFAULT }));
    }
  },

  _successGiftData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.parsedGiftData = this._parseGiftData(resp.result);
    } else {
      this._showUnableGift(resp.code);
    }
  },

  _parseGiftData: function (sender) {
    return {
      dataGiftCnt: sender.dataGiftCnt,
      familyDataGiftCnt: sender.familyDataGiftCnt,
      familyMemberYn: sender.familyMemberYn === 'Y',
      goodFamilyMemberYn: sender.goodFamilyMemberYn === 'Y'
    };
  },

  _onClickDataQty: function () {
    this._checkValidateSendingButton();
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var phoneNumber = response.params.phoneNumber;
      this.$inputImmediatelyGift.val(Tw.StringHelper.phoneStringToDash(phoneNumber));
      this.$inputImmediatelyGift.trigger('change');
      this._validateInputNumber();
      this._checkValidateSendingButton();
    }
  },

  _onInputImmediatelyGiftNumber: function () {
    this._hideRecentNumberLayer();
    this._checkValidateSendingButton();
    this._validateInputNumber();
    this.$inputImmediatelyGift.val(Tw.FormatHelper.getDashedCellPhoneNumber(this.$inputImmediatelyGift.val()));
  },

  _onBlurImmediatelyGiftNumber: function () {
    if(this.runBlur) {
      this._onInputImmediatelyGiftNumber();
    }
  },

  _onSelectRecentContact: function (e) {
    this.runBlur = false;
    var opdtm = $(e.currentTarget).data('opdtm');
    var sNumber = $(e.currentTarget).find('.tel-select').text();

    this.$inputImmediatelyGift.val(sNumber).trigger('change');
    this.$inputImmediatelyGift.data('opdtm', opdtm);
    this._hideRecentNumberLayer();
    this._checkValidateSendingButton();
    this._removeErrorComment();
  },

  _getReceiveUserInfo: function (e) {
    var $target = $(e.currentTarget);
    this.befrSvcNum = this.$inputImmediatelyGift.val();
    this.opDtm = this.$inputImmediatelyGift.data('opdtm');

    var svcNum = this.$inputImmediatelyGift.val().match(/\d+/g).join('');
    var isCellPhone = Tw.FormatHelper.isCellPhone(svcNum);

    if ( isCellPhone && this._validatePhoneNumber(svcNum) ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0019, { befrSvcNum: svcNum }).done($.proxy(this._onSuccessReceiveUserInfo, this, $target));
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0019, { opDtm: this.opDtm }).done($.proxy(this._onSuccessReceiveUserInfo, this, $target));
    }
  },

  _onSuccessReceiveUserInfo: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.paramData = $.extend({}, this.paramData, res.result);
      this._requestSendingData($target);
    } else if ( res.code === 'ZNGME0008' ) {
      this._popupService.openAlert(Tw.MYT_DATA_CANCEL_MONTHLY.ALERT_NOT_SK, Tw.POPUP_TITLE.NOTIFY, null, null, null, $target);
    } else if ( res.code === 'GFT0008' ) {
      this._popupService.openAlert(Tw.MYT_DATA_GIFT.GFT0008, Tw.POPUP_TITLE.NOTIFY, null, null, null, $target);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _requestSendingData: function ($target) {
    var htParams = {
      befrSvcNum: this.$inputImmediatelyGift.val(),
      dataQty: this.$wrap_data_select_list.find('li.checked input').val(),
      beforeDataQty: this.$wrap.triggerHandler('currentRemainDataInfo')
    };

    this.paramData = $.extend({}, this.paramData, htParams);

    this._popupService.openConfirm(
      this.paramData.custNm + ' ( ' + Tw.FormatHelper.conTelFormatWithDash(this.$inputImmediatelyGift.val().replace(/-/g, '')) + ' ) ' +
      Tw.ALERT_MSG_MYT_DATA.GIFT_DATA_TARGET +
      Tw.FormatHelper.convDataFormat(this.paramData.dataQty, 'MB').data +
      Tw.FormatHelper.convDataFormat(this.paramData.dataQty, 'MB').unit +
      Tw.ALERT_MSG_MYT_DATA.GIFT_DATA_QUESTION,
      Tw.REFILL_COUPON_CONFIRM.CONFIRM_GIFT,
      $.proxy(this._onSuccessSendingData, this, $target),
      null,
      $target
    );
  },

  _onSuccessSendingData: function ($target) {
    this._popupService.close();

    // MOCK DATA
    // this._historyService.replaceURL('/myt-data/giftdata/complete?' + $.param(this.paramData));

    // API DATA
    this._apiService.request(Tw.API_CMD.BFF_06_0016, {
      befrSvcMgmtNum: this.paramData.befrSvcMgmtNum,
      dataQty: this.$wrap_data_select_list.find('li.checked input').val()
    }).done($.proxy(this._onRequestSuccessGiftData, this, $target));
  },

  _onRequestSuccessGiftData: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/giftdata/complete?' + $.param(this.paramData));
    } else if ( res.code === 'GFT0008' ) {
      this._popupService.openAlert(Tw.MYT_DATA_GIFT.GFT0008, Tw.POPUP_TITLE.NOTIFY, null, null, null, $target);
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

    if ( sPhoneNumber.length !== 0 && sPhoneNumber.length < 10 ) {
      this._removeErrorComment();
      this.$container.find('.fe-error-phone01').removeClass('blind');
      this.$container.find('.fe-error-phone01').attr('aria-hidden', false);
    } else if ( sPhoneNumber.length === 0 ) {
      this._removeErrorComment();
      this.$container.find('.fe-error-phone03').removeClass('blind');
      this.$container.find('.fe-error-phone03').attr('aria-hidden', false);
    } else if ( !Tw.FormatHelper.isCellPhone(sPhoneNumber) ) {
      this._removeErrorComment();
      this.$container.find('.fe-error-phone02').removeClass('blind');
      this.$container.find('.fe-error-phone02').attr('aria-hidden', false);
    }

    if ( Tw.FormatHelper.isCellPhone(sPhoneNumber) ) {
      this._removeErrorComment();
    }
  },

  _removeErrorComment: function () {
    this.$container.find('[class*="fe-error"]').addClass('blind');
    this.$container.find('[class*="fe-error"]').attr('aria-hidden', true);
  },

  _hideRecentNumberLayer: function () {
    $('.recently-tel').hide();
  },

  _onFocusImmediatelyGiftNumber: function () {
    //최근 사용한 번호 선택 후 입력 창 포커스시 번호 지움
    var isCellPhone = Tw.FormatHelper.isCellPhone(this.$inputImmediatelyGift.val());
    console.log(isCellPhone, ' isCellphone');
    if( !isCellPhone ){
      this.$inputImmediatelyGift.val('');
    }
  }
};