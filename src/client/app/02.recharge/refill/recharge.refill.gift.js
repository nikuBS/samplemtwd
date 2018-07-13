/**
 * FileName: recharge.refill.gift.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.06.21
 */

Tw.RechargeRefillGift = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._assign();
  this._bindEvent();
  this._init();
};
Tw.RechargeRefillGift.prototype = {
  _assign: function () {
    this._$inputPhone = this.$container.find('.input-phone');
    this._$btnNext = this.$container.find('.btn-next');
    this._$btnAddr = this.$container.find('.btn-addr');
  },

  _bindEvent: function () {
    this._$inputPhone.on('keyup', $.proxy(this._setDisableStatus, this));
    this._$btnNext.on('click', $.proxy(this._onClickBtnNext, this));
    this._$btnAddr.on('click', $.proxy(this._onClickBtnAddr, this));
  },

  _init: function () {
    this._$inputPhone.trigger('focus');
  },

  _onClickBtnNext: function () {
    var befrSvcNum = this._$inputPhone.val();
    var copnNm = this._$btnNext.attr('copn-nm');
    var svcNum = this._$btnNext.attr('svc-num');
    var fomattedBefrSvcNum = this._getFormattedPhoneNumber(befrSvcNum);
    var confirmContents = svcNum + Tw.MSG_RECHARGE.REFILL_GIFT_01 + fomattedBefrSvcNum + Tw.MSG_RECHARGE.REFILL_GIFT_02;
    if ( !Tw.ValidationHelper.isCellPhone(befrSvcNum) ) {
      this._popupService.openAlert(Tw.MSG_RECHARGE.REFILL_GIFT_03);
      return;
    }
    if ( !copnNm ) {
      this._popupService.openAlert(Tw.MSG_RECHARGE.REFILL_GIFT_04);
      return;
    }
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, confirmContents, '', $.proxy(this._submit, this));
  },

  _submit: function() {
    var copnNm = this._$btnNext.attr('copn-nm');
    var befrSvcNum = this._$inputPhone.val();
    var data = JSON.stringify({
      copnIsueNum: copnNm,
      befrSvcNum: befrSvcNum
    });
    this._apiService.request(Tw.API_CMD.BFF_03_0023_C, data)
      .done($.proxy(this._sendSuccess, this))
      .fail($.proxy(this._sendFail, this));
  },

  _onClickBtnAddr: function () {
    Tw.Native.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (resp) {
    var params = resp.params;
    var phoneNumber = params.phoneNumber.replace(/-/gi, '');
    this._$inputPhone.val(phoneNumber);
    this._setDisableStatus();
  },

  _sendSuccess: function (resp) {
    if ( resp.code === '00' ) {
      var befrSvcNum = this._$inputPhone.val();
      var fomattedBefrSvcNum = this._getFormattedPhoneNumber(befrSvcNum);
      window.location.href = '/recharge/refill/gift-complete?befrSvcNum=' + fomattedBefrSvcNum;
    } else {
      this._showFailAlert(resp);
    }
  },

  _sendFail: function (err) {
    this._showFailAlert(err);
  },

  _showFailAlert: function (resp) {
    var RESP_CODE = {
      RCG3003: 'RCG3003',
      RCG3004: 'RCG3004',
      RCG3005: 'RCG3005',
      RCG3006: 'RCG3006',
      ZORDE4011: 'ZORDE4011' //레거시 에러 코드 임시 적용
    };
    switch ( resp.code ) {
      case RESP_CODE.RCG3004:
      case RESP_CODE.ZORDE4011:
        window.location.href = '/recharge/refill/gift-products';
        break;
      case RESP_CODE.RCG3003:
        this._popupService.openAlert(Tw.MSG_RECHARGE.REFILL_GIFT_05);
        break;
      case RESP_CODE.RCG3005:
        this._popupService.openAlert(Tw.MSG_RECHARGE.REFILL_GIFT_06);
        break;
      case RESP_CODE.RCG3006:
        this._popupService.openAlert(Tw.MSG_RECHARGE.REFILL_GIFT_07);
        break;
      default:
        this._popupService.openAlert(resp.data.orgDebugMessage);
        break;
    }
  },

  _setDisableStatus: function () {
    var disabled = (10 <= this._$inputPhone.val().length) ? false : true;
    this._$btnNext.attr('disabled', disabled);
  },

  _getFormattedPhoneNumber: function (phoneNumber) {
    var getDashedNumber = function (phoneNumber) {
      var str = '';
      if ( phoneNumber.length <= 10 ) {
        str += phoneNumber.substr(0, 3);
        str += '-';
        str += phoneNumber.substr(3, 3);
        str += '-';
        str += phoneNumber.substr(6);
      } else {
        str += phoneNumber.substr(0, 3);
        str += '-';
        str += phoneNumber.substr(3, 4);
        str += '-';
        str += phoneNumber.substr(7);
      }
      return str;
    };
    var getMaskingPhoneNumber = function (mpn) {
      var tmpArr = mpn.split('-');
      var MASKING_MARK = '*';
      tmpArr[1] = Tw.StringHelper.masking(tmpArr[1], MASKING_MARK, 2);
      tmpArr[2] = Tw.StringHelper.masking(tmpArr[2], MASKING_MARK, 2);
      return tmpArr.join('-');
    };
    return getMaskingPhoneNumber(getDashedNumber(phoneNumber));
  }
};