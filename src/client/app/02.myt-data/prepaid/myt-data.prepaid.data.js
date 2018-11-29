/**
 * FileName: myt-data.prepaid.data.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.28
 */

Tw.MyTDataPrepaidData = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._cachedElement();
  this._bindEvent();
};

Tw.MyTDataPrepaidData.prototype = {
  _cachedElement: function () {
    this.$data = this.$container.find('.fe-data');
    this.$dataSelector = this.$container.find('.fe-select-data');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$rechargeBtn = this.$container.find('.fe-check-recharge');
    this.$emailAddress = this.$container.find('.fe-email-address');
  },
  _bindEvent: function () {
    this.$dataSelector.on('click', $.proxy(this._openSelectPop, this));
    this.$container.on('blur', '.fe-card-number', $.proxy(this._getCardCode, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('keyup', '.fe-card-number', $.proxy(this._resetCardInfo, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$rechargeBtn.on('click', $.proxy(this._checkPay, this));
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
      this.$cardM.val() !== '' && this.$cardPw.val() !== '') {
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
  _checkPay: function () {
    if (this._isValid()) {
      this._popupService.open({
        'hbs': 'DC_09_03_01',
        'title': Tw.MYT_DATA_PREPAID.DATA_TITLE
      },
      $.proxy(this._openCheckPay, this),
      $.proxy(this._afterRechargeSuccess, this),
      'check-pay'
      );
    }
  },
  _isValid: function () {
    var isValid = this._validation.checkIsSelected(this.$dataSelector, Tw.ALERT_MSG_MYT_DATA.V56) &&
      this._validation.checkMoreLength(this.$cardNumber.val(), 15, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4) &&
      this._validation.checkEmpty(this.$cardNumber.attr('data-code'), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4) &&
      this._validation.checkLength(this.$cardY.val(), 4, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkLength(this.$cardM.val(), 2, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5) &&
      this._validation.checkYear(this.$cardY.val(), this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6) &&
      this._validation.checkMonth(this.$cardM.val(), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6) &&
      this._validation.checkLength(this.$cardPw.val(), 2, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V7);

    return isValid;
  },
  _openCheckPay: function ($layer) {
    this._setLayerData($layer);
    this._setEvent($layer);
  },
  _afterRechargeSuccess: function () {
    if (this._isRechargeSuccess) {
      var data = Tw.FormatHelper.customDataFormat(this._afterData.toString().replace(',',''), Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB);
      this._historyService.replaceURL('/myt-data/recharge/prepaid/data/complete?data=' + data.data);
    }
  },
  _setLayerData: function ($layer) {
    var remainData = this.$data.attr('data-value');
    this._afterData = parseInt(remainData, 10) +
      parseInt(this.$dataSelector.attr('data-value'), 10);

    $layer.find('.fe-remain-data').text(Tw.FormatHelper.addComma(remainData.toString()));
    $layer.find('.fe-after-data').text(Tw.FormatHelper.addComma(this._afterData.toString()));
    $layer.find('.fe-layer-card-number').text(Tw.StringHelper.masking($.trim(this.$cardNumber.val()), '*', 8));
    $layer.find('.fe-layer-card-info').attr('data-code', this.$cardNumber.attr('data-code'))
      .text(this.$cardNumber.attr('data-name'));
    $layer.find('.fe-recharge-amount').text($.trim(this.$dataSelector.text()));
    $layer.find('.fe-email-address').text($.trim(this.$emailAddress.text()));
  },
  _setEvent: function ($layer) {
    $layer.on('click', '.fe-recharge', $.proxy(this._recharge, this, $layer));
  },
  _recharge: function ($layer) {
    var reqData = this._makeRequestData();

    if ($layer.find('.fe-sms').is(':checked')) {
      reqData.smsYn = 'Y';
    }

    if ($layer.find('.fe-email').is(':checked')) {
      reqData.emailYn = 'Y';
    }

    this._apiService.request(Tw.API_CMD.BFF_06_0058, reqData)
      .done($.proxy(this._rechargeSuccess, this))
      .fail($.proxy(this._rechargeFail, this));
  },
  _makeRequestData: function () {
    return {
      amtCd: this.$dataSelector.attr('id'),
      amt: this.$dataSelector.attr('data-amount'),
      cardNum: $.trim(this.$cardNumber.val()),
      expireMM: $.trim(this.$cardM.val()),
      expireYY: $.trim(this.$cardY.val()).substr(2,2),
      pwd: $.trim(this.$cardPw.val())
    };
  },
  _rechargeSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._isRechargeSuccess = true;
      this._popupService.close();
    } else {
      this._rechargeFail(res);
    }
  },
  _rechargeFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};