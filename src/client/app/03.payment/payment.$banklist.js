Tw.BankList = function (rootEl) {
  this.$bankList = [];
  this.$currentTarget = null;
  this.$container = rootEl;
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
};

Tw.BankList.prototype = {
  init: function (event) {
    this.$currentTarget = $(event.currentTarget);
    this._bindEvent();

    if (this._isNotExistBankList()) {
      this._getBankList();
    }
    else {
      this._openBank();
    }
  },
  _bindEvent: function () {
    this.$document.on('click', '.hbs-bank-name', $.proxy(this._getSelectedBank, this));
  },
  _getSelectedBank: function (event) {
    var $selectedBank = this.$currentTarget;
    var $target = $(event.currentTarget);
    $selectedBank.attr('id', $target.attr('id'));
    $selectedBank.text($target.text());
    this._popupService._popupClose();
  },
  _isNotExistBankList: function () {
    return Tw.FormatHelper.isEmpty(this.$bankList);
  },
  _getBankList: function () {
    $.ajax('/mock/payment.bank-list.json')
    //    this._apiService.request(Tw.API_CMD.BFF_07_0022, {})
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
    var bankList = res.result.bnkcrdlist2;
    for (var i = 0; i < bankList.length; i++) {
      var bankObj = {
        attr: 'class="hbs-bank-name" id=' + bankList[i].commCdVal,
        text: bankList[i].commCdValNm
      };
      this.$bankList.push(bankObj);
    }
    this._openBank();
  },
  _openBank: function () {
    this._popupService.openList(Tw.POPUP_TITLE.SELECT_BANK, this.$bankList);
  }
};