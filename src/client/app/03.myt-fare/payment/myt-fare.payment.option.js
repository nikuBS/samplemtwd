/**
 * FileName: myt-fare.payment.option.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 */

Tw.MyTFarePaymentOption = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._historyService.init('hash');
  this._init();
};

Tw.MyTFarePaymentOption.prototype = {
  _init: function () {
    this._checkIsAfterChange();
    this._bindEvent();
  },
  _checkIsAfterChange: function () {
    var type = Tw.UrlHelper.getQueryParams().type;
    if (type) {
      var message = '';

      if (type === 'new') {
        message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_NEW;
      }
      if (type === 'change') {
        message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE;
      }

      if (!this._isBackOrReload() && message !== '') {
        Tw.CommonHelper.toast(message);
      }
    }
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-auto', $.proxy(this._goAutoPayment, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._openCancelAutoPayment, this));
    this.$container.on('click', '.fe-change-date', $.proxy(this._changePaymentDate, this));
    this.$container.on('click', '.fe-change-address', $.proxy(this._changeAddress, this));
  },
  _goAutoPayment: function () {
    this._historyService.goLoad('/myt/fare/payment/auto');
  },
  _openCancelAutoPayment: function () {
    this._popupService.open({
      'hbs':'MF_05_01_02'
    }, $.proxy(this._cancelAutoPayment, this));
  },
  _cancelAutoPayment: function ($layer) {
    $layer.on('change', '.fe-send-sms-yn', $.proxy(this._showAndHideAccount, this, $layer));
    $layer.on('click', '.fe-account-selector', $.proxy(this._selectAccountList, this));
    $layer.on('click', '.fe-sms-info', $.proxy(this._openSmsInfo, this));
    $layer.on('click', '.fe-go-cancel', $.proxy(this._cancel, this, $layer));
  },
  _showAndHideAccount: function ($layer, event) {
    var $target = $(event.target);
    var $accountBox = $layer.find('.fe-account-box');
    if ($target.is(':checked')) {
      $accountBox.show();
    } else {
      $accountBox.hide();
    }
  },
  _selectAccountList: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs:'actionsheet_select_a_type',
      layer:true,
      title:Tw.POPUP_TITLE.SELECT_ACCOUNT,
      data:this._getAccountList()
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
  _getAccountList: function () {
    /*
    var accountList = [];
    var listObj = {
      'list': []
    };
    this.$accountList.find('li').each(function () {
      var $this = $(this);
      var obj = {
        'option': 'account',
        'attr': 'id="' + $this.attr('id') + '"',
        'value': $this.text()
      };
      listObj.list.push(obj);
    });
    accountList.push(listObj);

    return accountList;
    */
  },
  _openSmsInfo: function () {
    this._popupService.openAlert(Tw.SMS_INFO.CONTENTS, Tw.SMS_INFO.TITLE, Tw.BUTTON_LABEL.CONFIRM);
  },
  _cancel: function ($layer) {
    var $selectBox = $layer.find('.fe-select-payment-option');
    console.log($selectBox.find('.checked').attr('id'));
  },
  _changePaymentDate: function () {
  },
  _changeAddress: function () {
  },
  _isBackOrReload: function () {
    if (window.performance) {
      if (performance.navigation.type === 1 || performance.navigation.type === 2) {
        return true;
      }
    }
  }
};