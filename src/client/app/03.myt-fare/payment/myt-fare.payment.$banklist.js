/**
 * FileName: myt-fare.payment.$banklist.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.19
 */

Tw.MyTFarePaymentBankList = function (rootEl) {
  this.$bankList = [];
  this.$currentTarget = null;
  this.$container = rootEl;
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
};

Tw.MyTFarePaymentBankList.prototype = {
  init: function (event) {
    this.$currentTarget = $(event.currentTarget);

    if (this._isNotExistBankList()) {
      this._getBankList();
    }
    else {
      this._openBank();
    }
  },
  _onOpenList: function ($layer) {
    $layer.on('click', '.hbs-bank-name', $.proxy(this._getSelectedBank, this));
  },
  _getSelectedBank: function (event) {
    var $selectedBank = this.$currentTarget;
    var $target = $(event.currentTarget);
    $selectedBank.attr('id', $target.attr('id'));
    $selectedBank.text($target.text());
    this._popupService.close();
  },
  _isNotExistBankList: function () {
    return Tw.FormatHelper.isEmpty(this.$bankList);
  },
  _getBankList: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0022, {})
      .done($.proxy(this._getBankListSuccess, this))
      .fail($.proxy(this._getBankListFail, this));
  },
  _getBankListSuccess: function (res) {
    if (res.code === '00') {
      this._setBankList(res);
    }
  },
  _getBankListFail: function () {
    Tw.Logger.info('get bank list fail');
  },
  _setBankList: function (res) {
    var bankList = res.result.payovrBankList;
    var formatList = [];
    for (var i = 0; i < bankList.length; i++) {
      var bankObj = {
        option: 'hbs-bank-name',
        attr: 'id=' + bankList[i].bankCardCoCd,
        value: bankList[i].bankCardCoNm
      };
      formatList.push(bankObj);
    }
    this.$bankList.push({
      'list': formatList
    });
    this._openBank();
  },
  _openBank: function () {
    this._popupService.open({
      hbs:'actionsheet_select_a_type',
      layer:true,
      title:Tw.POPUP_TITLE.SELECT_BANK,
      data:this.$bankList
    }, $.proxy(this._onOpenList, this));
  }
};