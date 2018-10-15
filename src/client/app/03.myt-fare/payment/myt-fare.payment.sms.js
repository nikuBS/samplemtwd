/**
 * FileName: myt-fare.payment.sms.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.17
 */

Tw.MyTFarePaymentSms = function (rootEl) {
  this.$container = rootEl;
  this.$accountSelector = this.$container.find('.fe-account-selector');
  this.$accountList = this.$container.find('.fe-account-list');

  this._paymentCommon = new Tw.MyTFarePaymentCommon(this.$container);
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentSms.prototype = {
  _init: function () {
    this._bindEvent();
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-account-selector', $.proxy(this._selectAccountList, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._pay, this));
  },
  _selectAccountList: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_ACCOUNT,
      data: this._getAccountList()
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
  },
  _pay: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0027, { msg: $.trim(this.$accountSelector.text()) })
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.open({
          'hbs': 'complete-sms',
          'svcNum': res.result.svcNum
        },
        $.proxy(this._onComplete, this),
        $.proxy(this._goSubmain, this),
        'complete-sms');
    } else {
      this._payFail(res);
    }
  },
  _payFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _onComplete: function ($layer) {
    $layer.on('click', '.fe-submain', $.proxy(this._setIsLink, this));
  },
  _setIsLink: function () {
    this._isSubmain = true;
  },
  _goSubmain: function () {
    if (this._isSubmain) {
      this._historyService.goLoad('/myt/fare');
    }
  }
};