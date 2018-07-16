/**
 * FileName: payment.realtime.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.23
 */

Tw.PaymentRealtime = function (rootEl) {
  this.$container = rootEl;
  this.$bankList = [];
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._bankList = new Tw.BankList(this.$container);
  this._getPoint = new Tw.PaymentGetPoint(this.$container);
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._initVariables();
  this._bindEvent();
};

Tw.PaymentRealtime.prototype = {
  _initVariables: function () {
    this.$amount = 0;
    this.$autoPayInfo = this.$container.find('.auto-pay-info');
    this.$isAutoInfo = null;
    this.$autoWrap = this.$container.find('.pay-info.auto');
    this.$refundWrap = this.$container.find('.pay-info.refund');
    this.$cardFirstWrap = this.$container.find('.pay-info.card-first');
    this.$cardNumber = this.$cardFirstWrap.find('.card-number');
    this.$cardY = this.$cardFirstWrap.find('.card-y');
    this.$cardM = this.$cardFirstWrap.find('.card-m');
    this.$cardPw = this.$cardFirstWrap.find('.card-pw');
    this.$cardWrap = this.$container.find('.pay-info.card');
    this.$cardTypeSelector = this.$container.find('.select-card-type');
    this.$pointSelector = this.$container.find('.select-point');
    this.$point = this.$container.find('.point');
    this.$pointPw = this.$container.find('.point-pw');
    this.$pointBox = this.$container.find('.point-box');
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('change', '.checkbox-main', $.proxy(this._sumCheckedAmount, this));
    this.$container.on('click', '.select-payment-option', $.proxy(this._isCheckedAmount, this));
    this.$container.on('click', '.select-payment', $.proxy(this._getAutoInfo, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.pay-check-box', $.proxy(this._setAutoInfo, this));
    this.$container.on('click', '.select-card-type', $.proxy(this._selectCardType, this));
    this.$container.on('click', '.get-point', $.proxy(this._openGetPoint, this));
    this.$container.on('click', '.select-point', $.proxy(this._selectPoint, this));
    this.$container.on('click', '.pay', $.proxy(this._pay, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _sumCheckedAmount: function (event) {
    var $target = $(event.target);
    var $amount = $target.data('value');
    if ($target.is(':checked')) {
      this.$amount += $amount;
    }
    else {
      this.$amount -= $amount;
    }
    this.$container.find('.total-amount').text(Tw.FormatHelper.addComma(this.$amount.toString()));
    this._setCardTypeDisabled(this.$amount);
  },
  _setCardTypeDisabled: function ($amount) {
    if (parseInt($amount, 10) <= 50000) {
      this.$cardTypeSelector.attr('disabled', 'disabled');
    } else {
      this.$cardTypeSelector.removeAttr('disabled');
    }
  },
  _isCheckedAmount: function (event) {
    event.preventDefault();

    var checkedLength = this.$container.find('.checked').length;
    if (checkedLength === 0) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.REALTIME_A01);
    }
    else {
      this._go('#step1');
    }
  },
  _getAutoInfo: function (event) {
    event.preventDefault();
    var $target = $(event.currentTarget);

    if (this.$isAutoInfo === null) {
      this._apiService.request(Tw.API_CMD.BFF_07_0022, {})
        .done($.proxy(this._getAutoSuccess, this, $target))
        .fail($.proxy(this._getAutoFail, this, $target));
    } else {
      this._go($target.data('value'));
    }
  },
  _getAutoSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result.autoPayEnable === 'Y') {
        var $autoPayBank = res.result.autoPayBank;
        this.$autoPayInfo.attr('id', $autoPayBank.bankCardCoCd).attr('num', $autoPayBank.bankCardNum).text($autoPayBank.bankCardCoNm);
        this.$container.find('.auto-info-checkbox').removeClass('none');
        this.$container.find('.card-auto-info-checkbox').removeClass('none');
        this.$isAutoInfo = true;
      } else {
        this.$isAutoInfo = false;
      }
    }
    this._go($target.data('value'));
  },
  _getAutoFail: function ($target) {
    Tw.Logger.info('get auto info fail');
    this._go($target.data('value'));
  },
  _setAutoInfo: function (event) {
    var $target = $(event.currentTarget);
    var bankId, bankName, bankNum, $wrapper, isAuto = null;
    if ($target.hasClass('auto-info') || $target.hasClass('card-auto-info')) {
      bankId = this.$autoPayInfo.attr('id');
      bankName = this.$autoPayInfo.text();
      bankNum = this.$autoPayInfo.attr('num');
      isAuto = true;

      if ($target.hasClass('auto-info')) {
        $wrapper = this.$autoWrap;
      } else {
        $wrapper = this.$cardWrap;
      }
    } else {
      bankId = this.$autoWrap.find('.select-bank').attr('id');
      bankName = this.$autoWrap.find('.select-bank').text();
      bankNum = $.trim(this.$autoWrap.find('.account-number').val());
      $wrapper = this.$refundWrap;
    }

    if ($target.hasClass('checked')) {
      $wrapper.find('.select-bank').attr('id', bankId).text(bankName);
      $wrapper.find('.account-number').val(bankNum);

      if (isAuto) {
        $wrapper.find('.select-bank').attr('disabled', 'disabled');
        $wrapper.find('.account-number').attr('disabled', 'disabled');
      }
    } else {
      $wrapper.find('.select-bank').removeAttr('id').text(Tw.PAYMENT_STRING.BANK_NAME);
      $wrapper.find('.account-number').val('');

      if (isAuto) {
        $wrapper.find('.select-bank').removeAttr('disabled');
        $wrapper.find('.account-number').removeAttr('disabled');
      }
    }
  },
  _selectBank: function (event) {
    this._bankList.init(event);
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_CARD_TYPE, this._getTypeList(), 'type2', $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr('id', $selectedValue.find('button').attr('id'));
    $target.text($selectedValue.text());
    this._popupService.close();
  },
  _openGetPoint: function () {
    this._getPoint.open();
  },
  _selectPoint: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_POINT, this._getPointList(), 'type3', $.proxy(this._selectPopupCallback, this, $target));
  },
  _pay: function (event) {
    event.preventDefault();
    var $target = $(event.currentTarget);
    if ($target.hasClass('pay-account')) {
      this._payAccount();
    } else if ($target.hasClass('pay-card')) {
      this._payCard();
    } else if ($target.hasClass('pay-point')) {
      this._payPoint();
    } else {
      this._paySms();
    }
  },
  _payAccount: function () {
    if (this._isAccountValid()) {
      this._apiService.request(Tw.API_CMD.BFF_07_0023, this._makeRequestDataForAccount())
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _isAccountValid: function () {
    return (this._validation.checkIsSelected(this.$autoWrap.find('.select-bank'), Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$autoWrap.find('.account-number').val(), Tw.MSG_PAYMENT.AUTO_A03) &&
      this._validation.checkIsSelected(this.$refundWrap.find('.select-bank'), Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$refundWrap.find('.account-number').val(), Tw.MSG_PAYMENT.AUTO_A03));
  },
  _makeRequestDataForAccount: function () {
    var reqData = {
      payovrBankCd: this.$refundWrap.find('.select-bank').attr('id'),
      payovrBankNum: $.trim(this.$refundWrap.find('.account-number').val()),
      payovrCustNm: $.trim(this.$refundWrap.find('.name').val()),
      bankOrCardCode: this.$autoWrap.find('.select-bank').attr('id'),
      bankOrCardAccn: $.trim(this.$autoWrap.find('.account-number').val()),
      unpaidBillList: this._getCheckedBillList()
    };
    return reqData;
  },
  _payCard: function () {
    if (this._isCardValid()) {
      this._apiService.request(Tw.API_CMD.BFF_07_0025, this._makeRequestDataForCard())
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _isCardValid: function () {
    return (this._validation.checkEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkEmpty(this.$cardY.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardM.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardPw.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
      this._validation.checkYear(this.$cardY.val(), Tw.MSG_PAYMENT.REALTIME_A05) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A05) &&
      this._validation.checkIsSelected(this.$cardWrap.find('.select-bank'), Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$cardWrap.find('.account-number').val(), Tw.MSG_PAYMENT.AUTO_A03));
  },
  _makeRequestDataForCard: function () {
    var reqData = {
      payovrBankCd: this.$cardWrap.find('.select-bank').attr('id'),
      payovrBankNum: $.trim(this.$cardWrap.find('.account-number').val()),
      payovrCustNm: $.trim(this.$cardWrap.find('.name').val()),
      bankOrCardCode: $.trim(this.$cardNumber.val()).substr(0,6),
      bankOrCardAccn: $.trim(this.$cardNumber.val()),
      cdexpy: this.$cardY.val().substr(2,2),
      cdexpm: this.$cardM.val(),
      ccPwd: this.$cardPw.val(),
      unpaidBillList: this._getCheckedBillList()
    };
    return reqData;
  },
  _payPoint: function () {
    if (this._isPointValid()) {
      this._apiService.request(Tw.API_CMD.BFF_07_0029, this._makeRequestDataForPoint())
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _isPointValid: function () {
    return (this._isGetPoint() &&
      this._validation.checkEmpty(this.$point.val(), Tw.MSG_PAYMENT.POINT_A07) &&
      this._validation.checkIsAvailablePoint(this.$point.val(), this.$pointBox.find('.cashbag-point').text(), Tw.MSG_PAYMENT.REALTIME_A12) &&
      this._validation.checkIsMore(this.$point.val(), 1000, Tw.MSG_PAYMENT.REALTIME_A08) &&
      this._validation.checkIsTenUnit(this.$point.val(), Tw.MSG_PAYMENT.POINT_A06) &&
      this._validation.checkEmpty(this.$pointPw.val(), Tw.MSG_PAYMENT.AUTO_A04));
  },
  _makeRequestDataForPoint: function () {
    var reqData = {
      settleWayCd: this.$pointSelector.attr('id'),
      ocbPrePoint: $.trim(this.$point.val()),
      ocbPwd: this.$pointPw.val(),
      requestMon: this._getCheckedBillList(),
      chkRept: this._getCheckedBillList().length,
      ocbCardNum: $.trim(this.$cardNumber.val())
    };
    return reqData;
  },
  _paySms: function () {
    if (this._isSmsValid()) {
      this._apiService.request(Tw.API_CMD.BFF_07_0027, this._makeRequestDataForSms())
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _isSmsValid: function () {
    return this._validation.checkIsSelected(this.$container.find('.select-bank-sms'), Tw.MSG_PAYMENT.REALTIME_A02);
  },
  _makeRequestDataForSms: function () {
    var reqData = {
      userId: '',
      svcNum: '',
      msg: ''
    };
    return reqData;
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._history.setHistory();
      this._go('#complete');
    }
  },
  _payFail: function () {
    Tw.Logger.info('pay request fail');
  },
  _getCheckedBillList: function () {
    var $listBox = this.$container.find('.payment-select select-list');
    var list = [];
    $listBox.find('li').each(function () {
      var $this = $(this);
      if ($this.hasClass('checked')) {
        var obj = {
          invDt: $this.find('.invDt').data('value'),
          biillSvcMgmtNum: $this.find('.svcMgmtNum').data('value'),
          billAcntNum: $this.find('.billAcntNum').data('value'),
          payAmt: $this.find('.invAmt').data('value')
        };
        list.push(obj);
      }
    });
    return list;
  },
  _isGetPoint: function () {
    if (this.$pointBox.hasClass('none')) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.REALTIME_A11);
      return false;
    }
    return true;
  },
  _go: function (hash) {
    window.location.hash = hash;
  },
  _getTypeList: function () {
    return [
      { 'attr': 'id="000"', text: Tw.PAYMENT_TYPE['000'] },
      { 'attr': 'id="001"', text: Tw.PAYMENT_TYPE['001'] },
      { 'attr': 'id="002"', text: Tw.PAYMENT_TYPE['002'] },
      { 'attr': 'id="003"', text: Tw.PAYMENT_TYPE['003'] },
      { 'attr': 'id="004"', text: Tw.PAYMENT_TYPE['004'] },
      { 'attr': 'id="005"', text: Tw.PAYMENT_TYPE['005'] },
      { 'attr': 'id="006"', text: Tw.PAYMENT_TYPE['006'] },
      { 'attr': 'id="007"', text: Tw.PAYMENT_TYPE['007'] },
      { 'attr': 'id="008"', text: Tw.PAYMENT_TYPE['008'] },
      { 'attr': 'id="009"', text: Tw.PAYMENT_TYPE['009'] },
      { 'attr': 'id="010"', text: Tw.PAYMENT_TYPE['010'] },
      { 'attr': 'id="011"', text: Tw.PAYMENT_TYPE['011'] },
      { 'attr': 'id="012"', text: Tw.PAYMENT_TYPE['012'] },
      { 'attr': 'id="024"', text: Tw.PAYMENT_TYPE['024'] }
    ];
  },
  _getPointList: function () {
    return [
      { 'attr': 'id="10"', text: Tw.PAYMENT_STRING.OK_CASHBAG },
      { 'attr': 'id="11"', text: Tw.PAYMENT_STRING.T_POINT }
    ];
  }
};