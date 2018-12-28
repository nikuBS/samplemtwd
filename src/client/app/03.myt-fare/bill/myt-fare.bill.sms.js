/**
 * FileName: myt-fare.bill.sms.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFareBillSms = function (rootEl) {
  this.$container = rootEl;
  this.$accountSelector = this.$container.find('.fe-account-selector');
  this.$accountList = this.$container.find('.fe-account-list');

  this._paymentCommon = new Tw.MyTFareBillCommon(this.$container);
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillSms.prototype = {
  _init: function () {
    this._bindEvent();
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-account-selector', $.proxy(this._selectAccountList, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._pay, this));
  },
  _selectAccountList: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this._getAccountList(),
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.parents('label').text());

    this._popupService.close();
  },
  _getAccountList: function () {
    var accountList = [];
    var listObj = {
      'list': []
    };
    this.$accountList.find('li').each(function () {
      var $this = $(this);
      var obj = {
        'label-attr': 'id="' + $this.attr('id') + '"',
        'radio-attr': 'id="' + $this.attr('id') + '" name="r2"',
        'txt': $this.text()
      };
      listObj.list.push(obj);
    });
    accountList.push(listObj);

    return accountList;
  },
  _onClose: function () {
    if (this._isChanged()) {
      this._popupService.openConfirmButton(null, Tw.ALERT_MSG_CUSTOMER.ALERT_PRAISE_CANCEL.TITLE,
        $.proxy(this._closePop, this), $.proxy(this._afterClose, this));
    } else {
      this._historyService.goBack();
    }
  },
  _isChanged: function () {
    return this.$accountSelector.attr('id') !== this.$accountSelector.attr('data-origin-id');
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.closeAll();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._popupService.close();
    }
  },
  _pay: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0027, { msg: $.trim(this.$accountSelector.text()) })
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var svcNum = '';
      if (!Tw.FormatHelper.isEmpty(res.result.svcNum)) {
        svcNum = Tw.FormatHelper.conTelFormatWithDash(res.result.svcNum);
      }
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=sms&svcNum=' + svcNum);
    } else {
      this._payFail(res);
    }
  },
  _payFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};