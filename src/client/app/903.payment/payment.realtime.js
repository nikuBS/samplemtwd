/**
 * FileName: payment.realtime.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.23
 */

Tw.PaymentRealtime = function (rootEl) {
  this.$container = rootEl;
  this.$bankList = [];

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
    this.$autoPayInfo = this.$container.find('.fe-auto-pay-info');
    this.$isAutoInfo = null;
    this.$autoWrap = this.$container.find('.pay-info.fe-auto');
    this.$refundWrap = this.$container.find('.pay-info.fe-refund');
    this.$cardFirstWrap = this.$container.find('.pay-info.fe-card-first');
    this.$cardNumber = this.$cardFirstWrap.find('.fe-card-number');
    this.$cardY = this.$cardFirstWrap.find('.fe-card-y');
    this.$cardM = this.$cardFirstWrap.find('.fe-card-m');
    this.$cardPw = this.$cardFirstWrap.find('.fe-card-pw');
    this.$cardWrap = this.$container.find('.pay-info.fe-card');
    this.$cardTypeSelector = this.$container.find('.fe-select-card-type');
    this.$pointSelector = this.$container.find('.fe-select-point');
    this.$point = this.$container.find('.fe-point');
    this.$pointCardNumber = this.$container.find('.fe-point-card-number');
    this.$pointPw = this.$container.find('.fe-point-pw');
    this.$pointBox = this.$container.find('.point-box');

    // this._test();
    this._init();
  },
  _test: function () {
    var reqData = {
      payovrBankCd: '039',
      payovrBankNum: '536210272863',
      payovrCustNm: 'aaaa',
      bankOrCardCode: '039',
      bankOrCardAccn: '536210272863',
      unpaidBillList: this._getCheckedBillList()
    };
    this._apiService.request(Tw.API_CMD.BFF_07_0023, reqData)
      .done($.proxy(function (resp) {
        console.log(resp);
      }, this));
  },

  _init: function () {
    var $target = this.$container.find('.fe-payment-list > li > input');
    if ( $target.attr('disabled') === 'disabled' ) {
      this.$amount = $target.data('value');
      this.$container.find('.fe-total-amount').text(Tw.FormatHelper.addComma(this.$amount.toString()));
    }
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('change', '.fe-checkbox-main', $.proxy(this._sumCheckedAmount, this));
    this.$container.on('click', '.fe-select-payment-option', $.proxy(this._isCheckedAmount, this));
    this.$container.on('click', '.fe-select-payment', $.proxy(this._getAutoInfo, this));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.pay-check-box', $.proxy(this._setAutoInfo, this));
    this.$container.on('click', '.fe-select-card-type', $.proxy(this._selectCardType, this));
    this.$container.on('click', '.fe-get-point', $.proxy(this._openGetPoint, this));
    this.$container.on('click', '.fe-select-point', $.proxy(this._selectPoint, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._pay, this));
    this.$container.on('click', '.fe-cancel-process', $.proxy(this._openCancel, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _sumCheckedAmount: function (event) {
    var $target = $(event.target);
    var $amount = $target.data('value');
    if ( $target.is(':checked') ) {
      this.$amount += $amount;
    }
    else {
      this.$amount -= $amount;
    }
    this.$container.find('.fe-total-amount').text(Tw.FormatHelper.addComma(this.$amount.toString()));
    this._setCardTypeDisabled(this.$amount);
  },
  _setCardTypeDisabled: function ($amount) {
    if ( parseInt($amount, 10) <= 50000 ) {
      this.$cardTypeSelector.attr('disabled', 'disabled');
    } else {
      this.$cardTypeSelector.removeAttr('disabled');
    }
  },
  _isCheckedAmount: function (event) {
    event.preventDefault();

    var checkedLength = this.$container.find('.checked').length;
    if ( checkedLength === 0 ) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.REALTIME_A01);
    }
    else {
      this._go('#step1');
    }
  },
  _getAutoInfo: function (event) {
    event.preventDefault();
    var $target = $(event.currentTarget);

    if ( this.$isAutoInfo === null ) {
      this._apiService.request(Tw.API_CMD.BFF_07_0022, {})
        .done($.proxy(this._getAutoSuccess, this, $target))
        .fail($.proxy(this._getAutoFail, this, $target));
    } else {
      this._go($target.data('value'));
    }
  },
  _getAutoSuccess: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.$autoPayInfo.attr('acnt-num', res.result.acntNum);

      if ( res.result.autoPayEnable === 'Y' ) {
        var $autoPayBank = res.result.autoPayBank;
        this.$autoPayInfo.attr('id', $autoPayBank.bankCardCoCd).attr('num', $autoPayBank.bankCardNum).text($autoPayBank.bankCardCoNm);
        this.$container.find('.fe-auto-info-checkbox').removeClass('none');
        this.$container.find('.fe-card-auto-info-checkbox').removeClass('none');
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
    if ( $target.hasClass('fe-auto-info') || $target.hasClass('fe-card-auto-info') ) {
      bankId = this.$autoPayInfo.attr('id');
      bankName = this.$autoPayInfo.text();
      bankNum = this.$autoPayInfo.attr('num');
      isAuto = true;

      if ( $target.hasClass('fe-auto-info') ) {
        $wrapper = this.$autoWrap;
      } else {
        $wrapper = this.$cardWrap;
      }
    } else {
      bankId = this.$autoWrap.find('.select-bank').attr('id');
      bankName = this.$autoWrap.find('.select-bank').text();
      bankNum = $.trim(this.$autoWrap.find('.fe-account-number').val());
      $wrapper = this.$refundWrap;
    }

    if ( $target.hasClass('checked') ) {
      $wrapper.find('.select-bank').attr('id', bankId).text(bankName);
      $wrapper.find('.fe-account-number').val(bankNum);

      if ( isAuto ) {
        $wrapper.find('.select-bank').attr('disabled', 'disabled');
        $wrapper.find('.fe-account-number').attr('disabled', 'disabled');
      }
    } else {
      $wrapper.find('.select-bank').removeAttr('id').text(Tw.PAYMENT_STRING.BANK_NAME);
      $wrapper.find('.fe-account-number').val('');

      if ( isAuto ) {
        $wrapper.find('.select-bank').removeAttr('disabled');
        $wrapper.find('.fe-account-number').removeAttr('disabled');
      }
    }
  },
  _selectBank: function (event) {
    this._bankList.init(event);
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_CARD_TYPE, Tw.PAYMENT_CARD_TYPE_LIST, 'type2',
      $.proxy(this._selectPopupCallback, this, $target));
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
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_POINT, this._getPointList(), 'type3',
      $.proxy(this._selectPopupCallback, this, $target));
  },
  _pay: function (event) {
    event.preventDefault();
    var $target = $(event.currentTarget);
    if ( $target.hasClass('fe-pay-account') ) {
      this._payAccount();
    } else if ( $target.hasClass('fe-pay-card') ) {
      this._payCard();
    } else if ( $target.hasClass('fe-pay-point') ) {
      this._payPoint();
    } else {
      this._paySms();
    }
  },
  _payAccount: function () {
    if ( this._isAccountValid() ) {
      var reqData = this._makeRequestDataForAccount();
      this._apiService.request(Tw.API_CMD.BFF_07_0023, reqData)
        .done($.proxy(this._paySuccess, this, reqData, 'account'))
        .fail($.proxy(this._payFail, this));
    }
  },
  _isAccountValid: function () {
    return (this._validation.checkIsSelected(this.$autoWrap.find('.select-bank'), Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$autoWrap.find('.fe-account-number').val(), Tw.MSG_PAYMENT.AUTO_A03) &&
      this._validation.checkIsSelected(this.$refundWrap.find('.select-bank'), Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$refundWrap.find('.fe-account-number').val(), Tw.MSG_PAYMENT.AUTO_A03));
  },
  _makeRequestDataForAccount: function () {
    var reqData = {
      payovrBankCd: this.$refundWrap.find('.select-bank').attr('id'),
      payovrBankNum: $.trim(this.$refundWrap.find('.fe-account-number').val()),
      payovrCustNm: $.trim(this.$refundWrap.find('.fe-name').data('value')),
      bankOrCardCode: this.$autoWrap.find('.select-bank').attr('id'),
      bankOrCardAccn: $.trim(this.$autoWrap.find('.fe-account-number').val()),
      unpaidBillList: this._getCheckedBillList()
    };
    return reqData;
  },
  _payCard: function () {
    if ( this._isCardValid() ) {
      var reqData = this._makeRequestDataForCard();
      this._getCardCode(reqData);
    }
  },
  _isCardValid: function () {
    return (this._validation.checkEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkEmpty(this.$cardY.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardM.val(), Tw.MSG_PAYMENT.AUTO_A01) &&
      this._validation.checkEmpty(this.$cardPw.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.MSG_PAYMENT.REALTIME_A04) &&
      this._validation.checkIsSelected(this.$cardWrap.find('.select-bank'), Tw.MSG_PAYMENT.REALTIME_A02) &&
      this._validation.checkEmpty(this.$cardWrap.find('.fe-account-number').val(), Tw.MSG_PAYMENT.AUTO_A03));
  },
  _makeRequestDataForCard: function () {
    var reqData = {
      payovrBankCd: this.$cardWrap.find('.select-bank').attr('id'),
      payovrBankNum: $.trim(this.$cardWrap.find('.fe-account-number').val()),
      payovrCustNm: $.trim(this.$cardWrap.find('.fe-name').data('value')),
      bankOrCardAccn: $.trim(this.$cardNumber.val()),
      cdexpy: this.$cardY.val(),
      cdexpm: this.$cardM.val(),
      instmm: this.$cardTypeSelector.attr('id').toString(),
      unpaidBillList: this._getCheckedBillList()
    };
    return reqData;
  },
  _payCardRequest: function (reqData) {
    this._apiService.request(Tw.API_CMD.BFF_07_0025, reqData)
      .done($.proxy(this._paySuccess, this, reqData, 'card'))
      .fail($.proxy(this._payFail, this));
  },
  _getCardCode: function (reqData) {
    this._apiService.request(Tw.API_CMD.BFF_07_0068, {}, {}, $.trim(this.$cardNumber.val()).substr(0, 6))
      .done($.proxy(this._getSuccess, this, reqData))
      .fail($.proxy(this._getFail, this));
  },
  _getSuccess: function (reqData, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      reqData.bankOrCardCode = res.result.prchsCardCd;
      this._payCardRequest(reqData);
    } else {
      this._popupService.openAlert(Tw.MSG_COMMON.SERVER_ERROR);
    }
  },
  _getFail: function () {
    Tw.Logger.info('get card fail');
  },
  _payPoint: function () {
    if ( this._isPointValid() ) {
      var reqData = this._makeRequestDataForPoint();
      this._apiService.request(Tw.API_CMD.BFF_07_0029, reqData)
        .done($.proxy(this._paySuccess, this, reqData, 'point'))
        .fail($.proxy(this._payFail, this));
    }
  },
  _isPointValid: function () {
    var $isSelectedPoint = this.$pointSelector.attr('id');
    var className = '.fe-cashbag-point';
    if ( $isSelectedPoint === Tw.PAYMENT_POINT_VALUE.T_POINT ) {
      className = '.fe-t-point';
    }
    return (this._isGetPoint() &&
      this._validation.checkEmpty(this.$point.val(), Tw.MSG_PAYMENT.POINT_A07) &&
      this._validation.checkIsAvailablePoint(this.$point.val(),
        parseInt(this.$pointBox.find(className).attr('id'), 10),
        Tw.MSG_PAYMENT.REALTIME_A12) &&
      this._validation.checkIsMore(this.$point.val(), 1000, Tw.MSG_PAYMENT.REALTIME_A08) &&
      this._validation.checkIsTenUnit(this.$point.val(), Tw.MSG_PAYMENT.POINT_A06) &&
      this._validation.checkEmpty(this.$pointPw.val(), Tw.MSG_PAYMENT.AUTO_A04));
  },
  _makeRequestDataForPoint: function () {
    var reqData = {
      settlWayCd: this.$pointSelector.attr('id'),
      ocbPrePoint: $.trim(this.$point.val()),
      ocbPwd: $.trim(this.$pointPw.val()),
      requestMon: this._getCheckedBillList('point'),
      chkRept: this._getCheckedBillList('point').length.toString(),
      ocbCardNum: this.$pointCardNumber.attr('id').toString()
    };
    return reqData;
  },
  _paySms: function () {
    if ( this._isSmsValid() ) {
      this._apiService.request(Tw.API_CMD.BFF_07_0027, {}, {}, '?msg=******')
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _isSmsValid: function () {
    return this._validation.checkIsSelected(this.$container.find('.fe-select-bank-sms'), Tw.MSG_PAYMENT.REALTIME_A02);
  },
  _paySuccess: function (reqData, type, res) {
    this._history.setHistory();
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._setCompleteData(reqData, type);
      this._go('#complete');
    } else {
      this.$container.find('.fe-payment-err-msg').text(res.error.msg);
      this._go('#error');
    }
  },
  _setCompleteData: function (reqData, type) {
    var $target = this.$container.find('.fe-complete-payment');
    $target.find('.' + type).removeClass('none');
    for ( var key in reqData ) {
      var value = reqData[key];
      if ( key === 'payAmt' ) {
        value = Tw.FormatHelper.addComma(value);
      }
      if ( key === 'bankOrCardAccn' || key === 'payovrBankNum' ) {
        value = Tw.StringHelper.masking(value, '*', value.length - 6);
      }
      $target.find('.' + key).text(value);
    }
    $target.find('.bank-name').text(this.$autoWrap.find('.select-bank').text());
    $target.find('.refund-bank-name').text(this.$refundWrap.find('.select-bank').text());
    $target.find('.date').text(Tw.DateHelper.getCurrentDateTime(new Date()));
    $target.find('.payAmt').text(Tw.FormatHelper.addComma(this.$amount.toString()));

    if ( type === 'point' ) {
      $target.find('.bank-number').text(this.$pointCardNumber.text());
      $target.find('.point-info').text(this.$pointSelector.text() + ' ' + Tw.FormatHelper.addComma($.trim(this.$point.val())) + '점');
    }

    var $detailTarget = this.$container.find('.fe-detail-payment');
    var $checkedBox = this.$container.find('.fe-checkbox-main.checked');
    $checkedBox.each(function () {
      var $this = $(this);
      var $newTarget = $detailTarget.clone().removeClass('none');
      $newTarget.find('.svc-name').text($this.find('.svc-name').text());
      $newTarget.find('.svc-number').text($this.find('.svc-number').text());
      $newTarget.find('.invDt').text($this.find('.invDt').text());
      $newTarget.find('.invAmt').text(Tw.FormatHelper.addComma($this.find('.invAmt strong').text()));
      $('.detail-payment:last').after($newTarget);
    });
  },
  _payFail: function (err) {
    Tw.Logger.info('pay request fail');
    this._history.setHistory();
    this.$container.find('.fe-payment-err-msg').text(err.error.msg);
    this._go('#error');
  },
  _getCheckedBillList: function (type) {
    var $listBox = this.$container.find('.payment-select .select-list');
    var list = '';
    $listBox.find('li').each(function () {
      var $this = $(this);
      var invDt = $this.find('.invDt').data('value').toString();
      var billSvcMgmtNum = $this.find('.svcMgmtNum').data('value').toString();
      var billAcntNum = $this.find('.billAcntNum').data('value').toString();
      var payAmt = $this.find('.invAmt').data('value').toString();

      if ( $this.hasClass('checked') ) {
        if ( type === 'point' ) {
          list += invDt + ':' + billSvcMgmtNum + ':' + billAcntNum + ':' + payAmt + ';';
        } else {
          list = [];
          var obj = {
            invDt: invDt,
            billSvcMgmtNum: billSvcMgmtNum,
            billAcntNum: billAcntNum,
            payAmt: payAmt
          };
          list.push(obj);
        }
      }
    });
    return list;
  },
  _isGetPoint: function () {
    if ( this.$pointBox.hasClass('none') ) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.REALTIME_A11);
      return false;
    }
    return true;
  },
  _openCancel: function () {
    this._popupService.openAlert(Tw.MSG_PAYMENT.REALTIME_A09, null, $.proxy(this._cancelProcess, this));
  },
  _cancelProcess: function () {
    this._history.cancelProcess();
  },
  _go: function (hash) {
    this._history.goHash(hash);
  },
  _getPointList: function () {
    return [
      { 'attr': 'id="10"', text: Tw.PAYMENT_STRING.OK_CASHBAG },
      { 'attr': 'id="11"', text: Tw.PAYMENT_STRING.T_POINT }
    ];
  }
};