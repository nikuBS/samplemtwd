/**
 * FileName: myt-data.prepaid.data-auto.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.29
 */

Tw.MyTDataPrepaidDataAuto = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
};

Tw.MyTDataPrepaidDataAuto.prototype = {
  _cachedElement: function () {
    this.$data = this.$container.find('.fe-data');
    this.$dataSelector = this.$container.find('.fe-select-data');
    this.$cancelBtn = this.$container.find('.fe-cancel');
    this.$isAuto = this.$cancelBtn.is(':visible');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$hiddenNumber = this.$container.find('.fe-hidden');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$rechargeBtn = this.$container.find('.fe-recharge');
  },
  _bindEvent: function () {
    this.$dataSelector.on('click', $.proxy(this._openSelectPop, this));
    this.$cancelBtn.on('click', $.proxy(this._cancel, this));
    this.$container.on('blur', '.fe-card-number', $.proxy(this._getCardCode, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('keyup', '.fe-card-number', $.proxy(this._resetCardInfo, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$rechargeBtn.on('click', $.proxy(this._recharge, this));
  },
  _cancel: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0061, {})
      .done($.proxy(this._cancelSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _cancelSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-data/recharge/prepaid/data-complete?type=cancel');
    } else {
      this._fail(res);
    }
  },
  _openSelectPop: function (event) {
    var $target = $(event.currentTarget);
    var popupName = Tw.MYT_PREPAID_RECHARGE_DATA;

    if ($target.attr('data-code') === 'Y') {
      popupName = Tw.MYT_PREPAID_RECHARGE_DATA_ADD;
    }

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        data: popupName
      },
      $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.data-type', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr({
      'id': $selectedValue.attr('id'),
      'data-value': $selectedValue.attr('data-value'),
      'data-amount': $selectedValue.attr('data-amount')
    });
    $target.text($selectedValue.text());

    this._popupService.close();
  },
  _checkIsAbled: function () {
    if (this.$cardNumber.val() !== '' && this.$cardY.val() !== '' &&
      this.$cardM.val() !== '') {
      this.$rechargeBtn.removeAttr('disabled');
    } else {
      this.$rechargeBtn.attr('disabled', 'disabled');
    }
  },
  _resetCardInfo: function () {
    this.$cardNumber.removeAttr('data-code');
    this.$cardNumber.removeAttr('data-name');
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  _getCardCode: function () {
    if (this.$cardNumber.val() !== '') {
      this._apiService.request(Tw.API_CMD.BFF_07_0024, { cardNum: $.trim(this.$cardNumber.val()).substr(0, 6) })
        .done($.proxy(this._getSuccess, this))
        .fail($.proxy(this._getFail, this));
    }
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var cardCode = res.result.prchsCardCd;
      var cardName = res.result.prchsCardName;

      this.$cardNumber.attr({ 'data-code': cardCode, 'data-name': cardName });

      if (Tw.FormatHelper.isEmpty(cardCode)) {
        this._getFail();
      }
    } else {
      this._getFail();
    }
  },
  _getFail: function () {
    this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4);
  },
  _isValid: function () {
    var isValid = this._validation.checkIsSelected(this.$dataSelector, Tw.ALERT_MSG_MYT_DATA.V56) &&
      this._validation.checkMoreLength(this.$cardNumber.val(), 15, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4) &&
      this._validation.checkEmpty(this.$cardNumber.attr('data-code'), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4) &&
      this._validation.checkLength(this.$cardY.val(), 4, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkLength(this.$cardM.val(), 2, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6);

    return isValid;
  },
  _recharge: function () {
    var reqData = this._makeRequestData();
    if (this.$isAuto) {
      if ($.trim(this.$cardNumber.val()) === this.$hiddenNumber.val()) {
        reqData.maskedYn = 'Y';
      }
    }
    this._apiService.request(Tw.API_CMD.BFF_06_0059, reqData)
      .done($.proxy(this._rechargeSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _makeRequestData: function () {
    return {
      amtCd: this.$dataSelector.attr('id'),
      amt: this.$dataSelector.attr('data-amount'),
      cardNum: $.trim(this.$cardNumber.val()),
      expireMM: $.trim(this.$cardM.val()),
      expireYY: $.trim(this.$cardY.val()).substr(2,2)
    };
  },
  _rechargeSuccess: function (res) {
    var type = 'auto';
    if (this.$isAuto) type = 'change';

    if (res.code === Tw.API_CODE.CODE_00) {
      var code = this.$dataSelector.attr('id');
      this._historyService.replaceURL('/myt-data/recharge/prepaid/data-complete?data=' + code + '&type=' + type);
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _getAfterData: function () {
    var remainData = parseInt(this.$data.attr('data-value'), 10);
    var rechargeData = parseInt(this.$dataSelector.attr('data-value'), 10);
    var sum = remainData + rechargeData;

    return sum.toString().replace(',', '');
  }
};