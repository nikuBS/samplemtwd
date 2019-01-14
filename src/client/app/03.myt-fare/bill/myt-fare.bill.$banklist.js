/**
 * FileName: myt-fare.bill.$banklist.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.19
 */

Tw.MyTFareBillBankList = function (rootEl, bankList) {
  this.$bankList = [];
  this.$currentTarget = null;
  this.$container = rootEl;

  if (!Tw.FormatHelper.isEmpty(bankList)) {
    this._setBankList(bankList);
  }

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
};

Tw.MyTFareBillBankList.prototype = {
  init: function (event, callback) {
    this.$currentTarget = $(event.currentTarget);
    if (callback !== undefined) {
      this._callbackFunction = callback;
    }

    if (Tw.FormatHelper.isEmpty(this.$bankList)) {
      this._getBankList();
    }
    else {
      this._openBank();
    }
  },
  _onOpenList: function ($layer) {
    var $id = this.$currentTarget.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._getSelectedBank, this));
    $layer.on('click', '.fe-popup-close', $.proxy(this._checkSelected, this));
  },
  _getSelectedBank: function (event) {
    var $selectedBank = this.$currentTarget;
    var $target = $(event.target);
    $selectedBank.attr('id', $target.attr('id'));
    $selectedBank.text($target.parents('label').text());

    this.$currentTarget.parents('.fe-bank-wrap').find('.fe-bank-error-msg').hide();
    this._popupService.close();

    if (this._callbackFunction !== undefined) {
      var callbackFunction = this._callbackFunction;
      callbackFunction();
    }
  },
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$currentTarget.attr('id'))) {
      this.$currentTarget.parents('.fe-bank-wrap').find('.fe-bank-error-msg').show();
      this.$currentTarget.focus();
    }
    this._popupService.close();
  },
  _getBankList: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0022, {})
      .done($.proxy(this._getBankListSuccess, this))
      .fail($.proxy(this._getBankListFail, this));
  },
  _getBankListSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setBankList(res.result.payovrBankList, true);
    } else {
      this._getBankListFail(res);
    }
  },
  _getBankListFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _setBankList: function (bankList, isData) {
    var formatList = [];
    for (var i = 0; i < bankList.length; i++) {
      var bankObj = {
        'label-attr': 'id=' + bankList[i].bankCardCoCd,
        'radio-attr': 'id=' + bankList[i].bankCardCoCd + ' name="r2"',
        'txt': bankList[i].bankCardCoNm
      };
      formatList.push(bankObj);
    }
    this.$bankList.push({
      'list': formatList
    });

    if (isData) {
      this._openBank();
    }
  },
  _openBank: function () {
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this.$bankList,
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._onOpenList, this));
  }
};