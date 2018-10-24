/**
 * FileName: myt-fare.payment.auto.cancel.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTFarePaymentAutoCancel = function (rootEl, $layer) {
  this.$container = rootEl;
  this.$layer = $layer;
  this.$bankList = [];
  this.$infoBox = this.$container.find('.fe-info');

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._init();
};

Tw.MyTFarePaymentAutoCancel.prototype = {
  _init: function () {
    this._bindEvent();
  },
  _bindEvent: function () {
    this.$layer.on('change', '.fe-send-sms-yn', $.proxy(this._showAndHideAccount, this));
    this.$layer.on('click', '.fe-account-selector', $.proxy(this._getAccountList, this));
    this.$layer.on('click', '.fe-sms-info', $.proxy(this._openSmsInfo, this));
    this.$layer.on('click', '.fe-go-cancel', $.proxy(this._cancel, this));
  },
  _showAndHideAccount: function (event) {
    var $target = $(event.target);
    var $accountBox = this.$layer.find('.fe-account-box');
    if ($target.is(':checked')) {
      $accountBox.show();
    } else {
      $accountBox.hide();
    }
  },
  _getAccountList: function (event) {
    if (Tw.FormatHelper.isEmpty(this.$bankList)) {
      this._apiService.request(Tw.API_CMD.BFF_07_0026, {})
        .done($.proxy(this._getAccountSuccess, this, event))
        .fail($.proxy(this._getAccountFail, this));
    } else {
      this._selectAccountList(event);
    }
  },
  _getAccountSuccess: function (event, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setAccountList(res.result.virtualBankList);
      this._selectAccountList(event);
    } else {
      this._getAccountFail(res);
    }
  },
  _getAccountFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },
  _setAccountList: function (bankList) {
    var accountList = [];
    var listObj = {
      'list': []
    };

    for (var i = 0; i < bankList.length; i++) {
      var obj = {
        'option': 'account',
        'attr': 'id="' + bankList[i].bankCd + '"',
        'value': bankList[i].sVirtualBankNum
      };
      listObj.list.push(obj);
    }
    accountList.push(listObj);
    this.$bankList = accountList;
  },
  _selectAccountList: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_ACCOUNT,
      data: this.$bankList
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.account', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.text($selectedValue.text());

    this._popupService.close();
  },
  _openSmsInfo: function () {
    this._popupService.openAlert(Tw.SMS_INFO.CONTENTS, Tw.SMS_INFO.TITLE, Tw.BUTTON_LABEL.CONFIRM);
  },
  _cancel: function () {
    if (this._isValid()) {
      var reqData = this._makeRequestData();
      this._apiService.request(Tw.API_CMD.BFF_07_0063, reqData)
        .done($.proxy(this._cancelSuccess, this))
        .fail($.proxy(this._cancelFail, this));

      this._popupService.close();
    }
  },
  _isValid: function () {
    if (this.$layer.find('.fe-account-box').is(':visible')) {
      if (this.$layer.find('.fe-account-selector').attr('id') === undefined) {
        this._popupService.openAlert(Tw.MSG_PAYMENT.REALTIME_A02);
        return false;
      }
    }
    return true;
  },
  _makeRequestData: function () {
    var $selectBox = this.$layer.find('.fe-select-payment-option');
    var reqData = {
      acntNum: this.$infoBox.attr('data-acnt-num'),
      payerNumClCd: this.$infoBox.attr('data-payer-num-cl-cd'),
      payMthdCd: this.$infoBox.attr('data-pay-mthd-cd'),
      newPayMthdCd: $selectBox.find('.checked').attr('id'),
      bankCardCoCd: this.$infoBox.attr('data-bank-card-co-cd'),
      bankPrtYn: this.$infoBox.attr('data-bank-prt-yn'),
      serNum: this.$infoBox.attr('data-ser-num'),
      authReqSerNum: this.$infoBox.attr('data-auth-req-ser-num'),
      rltmSerNum: this.$infoBox.attr('data-rltm-ser-num')
    };
    return reqData;
  },
  _cancelSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (this.$layer.find('.fe-account-box').is(':visible')) {
        this._apiService.request(Tw.API_CMD.BFF_07_0064, {
          acntNum: this.$infoBox.attr('data-acnt-num'),
          billSmsYn: 'Y',
          bankCd1: this.$layer.find('.fe-account-selector').attr('id')
        }).done($.proxy(this._smsSuccess, this))
          .fail($.proxy(this._cancelFail, this));
      } else {
        this._popupService.close();
        this._commonHelper.toast(Tw.ALERT_MSG_MYT_FARE.COMPLETE_CANCEL);
      }
    } else {
      this._cancelFail(res);
    }
  },
  _cancelFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },
  _smsSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.close();
      this._commonHelper.toast(Tw.ALERT_MSG_MYT_FARE.COMPLETE_CANCEL);
    } else {
      this._cancelFail(res);
    }
  }
};