/**
 * @file myt-data.gift.monthly.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.10
 */

Tw.MyTDataGiftMonthly = function (rootEl, svcInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  var data = JSON.parse(svcInfo);
  this._tmpSvcMgmtNum = data.svcMgmtNum;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGiftMonthly.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$btn_add_contact = this.$container.find('.fe-btn_add_contact');
    this.$input_auto_gift = this.$container.find('.fe-input_auto_gift');
    this.$btn_auto_contact = this.$container.find('.fe-btn_auto_contact');
    this.$btnRequestSendingAuto = $('.fe-request_sending_auto');
    this.$btn_wrap_add_contact = this.$container.find('.fe-wrap_add_contact');
    this.$wrap_auto_select_list = this.$container.find('.fe-auto_select_list');
    this.$btn_unsubscribe_auto_gift = this.$container.find('.fe-btn_unsubscribe');
  },

  _bindEvent: function () {
    this.$container.on('click', '.cancel', $.proxy(this._checkValidateSendingButton, this));
    this.$btn_add_contact.on('click', $.proxy(this._showAddUI, this));
    this.$btn_auto_contact.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$btnRequestSendingAuto.on('click', $.proxy(this._getReceiveUserInfo, this));
    this.$input_auto_gift.on('input blur', $.proxy(this._onKeyUpAutoGiftNumber, this));
    this.$btn_unsubscribe_auto_gift.on('click', $.proxy(this._unSubscribeAutoGift, this));
    this.$wrap_auto_select_list.on('click', 'input', $.proxy(this._onClickDataQty, this));
  },

  _showAddUI: function () {
    this.$btn_add_contact.hide();
    this.$btn_wrap_add_contact.show();
  },

  _onClickDataQty: function () {
    this._checkValidateSendingButton();
  },

  _onKeyUpAutoGiftNumber: function () {
    this._validateInputNumber();
    this._checkValidateSendingButton();
    this.$input_auto_gift.val(this._convertDashNumber(this.$input_auto_gift.val()));
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;

      this.$input_auto_gift.val(this._convertDashNumber(params.phoneNumber)).trigger('change');
      this._validateInputNumber();
      this._checkValidateSendingButton();
    }
  },

  _unSubscribeAutoGift: function (e) {
    var $target = $(e.currentTarget);
    var serNum = $target.data('sernum');
    var svcNum = $target.closest('li').find('.txt1.fs14').text();

    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_MYT_DATA.UNSUBSCRIBE_MONTHLY_GIFT + svcNum + Tw.ALERT_MSG_MYT_DATA.UNSUBSCRIBE_MONTHLY_GIFT_END,
      Tw.ALERT_MSG_MYT_DATA.UNSUBSCRIBE_MONTHLY_GIFT_TITLE,
      $.proxy(this._requestUnsubscribeAutoGift, this, $target, serNum),
      $.proxy(function () {
        this._popupService.close();
      }, this),
      Tw.BUTTON_LABEL.CANCEL,
      Tw.BUTTON_LABEL.TERMINATE,
      $target
    );
  },

  _requestUnsubscribeAutoGift: function ($target, serNum) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_06_0005, { serNum: serNum })
      .done($.proxy(this._onSuccessUnsubscribeAutoGift, this, $target));
  },

  _getReceiveUserInfo: function (e) {
    this.befrSvcNum = this.$input_auto_gift.val().match(/\d+/g).join('');
    var isValidPhone = this._validatePhoneNumber(this.befrSvcNum);

    if ( isValidPhone ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0019, { befrSvcNum: this.befrSvcNum, tmpSvcMgmtNum: this._tmpSvcMgmtNum }).done($.proxy(this._onSuccessReceiveUserInfo, this, $(e.currentTarget)));
    }
  },

  _onSuccessReceiveUserInfo: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.paramData = $.extend({}, this.paramData, res.result);
      this._subscribeAutoGift($target);
      return false;
    }

    if ( res.code === 'ZNGME0008' ) {
      this._popupService.openAlert(Tw.MYT_DATA_CANCEL_MONTHLY.ALERT_NOT_SK, Tw.POPUP_TITLE.NOTIFY, null, null, null, $target);
      return false;
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _subscribeAutoGift: function ($target) {
    var htParams = {
      befrSvcNum: this.$input_auto_gift.val().match(/\d+/g).join(''),
      dataQty: this.$wrap_auto_select_list.find('li.checked input').val()
    };

    this.paramData = $.extend({}, this.paramData, htParams);

    this._apiService.request(Tw.API_CMD.BFF_06_0004, htParams)
      .done($.proxy(this._onSuccessAutoGift, this, $target));
  },

  _onSuccessAutoGift: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/giftdata/auto-complete?' + $.param(this.paramData));
      return false;
    } else if ( res.code === 'GFT0008' ) {
      this._popupService.openAlert(Tw.MYT_DATA_GIFT.GFT0008, Tw.POPUP_TITLE.NOTIFY, null, null, null, $target);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onSuccessUnsubscribeAutoGift: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      if ( Tw.BrowserHelper.isApp() ) {
        Tw.CommonHelper.toast(Tw.ALERT_MSG_MYT_DATA.UNSUBSCRIBE_MONTHLY_GIFT_COMPLETE);
        this._historyService.reload();
      } else {
        this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.UNSUBSCRIBE_MONTHLY_GIFT_COMPLETE, null, null, $.proxy(function () {
          this._historyService.reload();
        }, this), null, $target);
      }
      return true;
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _convertDashNumber: function (sTelNumber) {
    return Tw.FormatHelper.getDashedCellPhoneNumber(sTelNumber);
  },

  _checkValidateSendingButton: function () {
    var isValidQty = this.$wrap_auto_select_list.find('input:checked').length !== 0;
    var isValidPhone = this.$input_auto_gift.val().length !== 0;

    if ( isValidQty && isValidPhone ) {
      this.$btnRequestSendingAuto.attr('disabled', false);
    } else {
      this.$btnRequestSendingAuto.attr('disabled', true);
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
    var sPhoneNumber = this.$input_auto_gift.val() ? this.$input_auto_gift.val().replace(/-/g, '') : '';

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
  }
};