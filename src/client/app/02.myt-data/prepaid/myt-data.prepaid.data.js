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
    this.$isValid = false;
    this.$isCardValid = true;
    this.$isSelectValid = true;
  },
  _bindEvent: function () {
    this.$dataSelector.on('click', $.proxy(this._openSelectPop, this));
    this.$container.on('blur', '.fe-card-number', $.proxy(this._checkCardNumber, this));
    this.$container.on('blur', '.fe-card-y', $.proxy(this._checkCardExpiration, this));
    this.$container.on('blur', '.fe-card-m', $.proxy(this._checkCardExpiration, this));
    this.$container.on('blur', '.fe-card-pw', $.proxy(this._checkPassword, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('keyup', '.fe-card-number', $.proxy(this._resetCardInfo, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
    this.$rechargeBtn.on('click', $.proxy(this._checkPay, this));
  },
  _openSelectPop: function (event) {
    var $target = $(event.currentTarget);
    var popupName = Tw.MYT_PREPAID_RECHARGE_DATA;

    if ($target.attr('data-code') === 'Y') {
      popupName = Tw.MYT_PREPAID_RECHARGE_DATA_ADD;
    }

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: popupName,
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    },
      $.proxy(this._selectPopupCallback, this, $target),
      $.proxy(this._checkIsAbled, this));
  },
  _selectPopupCallback: function ($target, $layer) {
    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
    $layer.on('click', '.fe-popup-close', $.proxy(this._checkSelected, this));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr({
      'id': $selectedValue.attr('id'), 
      'data-value': $selectedValue.attr('data-value'),
      'data-amount': $selectedValue.attr('data-amount')
    });
    $target.text($selectedValue.parents('label').text());

    this.$dataSelector.siblings('.fe-error-msg').hide();
    this.$isSelectValid = true;

    this._popupService.close();
  },
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$dataSelector.attr('id'))) {
      this.$dataSelector.siblings('.fe-error-msg').show();
      this.$dataSelector.focus();
      this.$isSelectValid = false;
    }
    this._popupService.close();
  },
  _checkIsAbled: function () {
    if (!Tw.FormatHelper.isEmpty(this.$dataSelector.attr('id')) &&
      this.$cardNumber.val() !== '' && this.$cardY.val() !== '' &&
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
  _checkCardNumber: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._isEmpty($target, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V60) &&
      this._validation.showAndHideErrorMsg(this.$cardNumber,
        this._validation.checkMoreLength(this.$cardNumber, 15),
        Tw.ALERT_MSG_MYT_FARE.ALERT_2_V4);

    if (this.$isValid) {
      this._getCardCode();
    }
  },
  _isEmpty: function ($target, message) {
    return this._validation.showAndHideErrorMsg($target, this._validation.checkEmpty($target.val()), message);
  },
  _getCardCode: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0024, {cardNum: $.trim(this.$cardNumber.val()).substr(0, 6)})
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._getFail, this));
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var cardCode = res.result.prchsCardCd;
      var cardName = res.result.prchsCardName;

      this.$cardNumber.attr({ 'data-code': cardCode, 'data-name': cardName });
      this.$cardNumber.parent().siblings('.fe-error-msg').hide();
      this.$isCardValid = true;

      if (Tw.FormatHelper.isEmpty(cardCode)) {
        this._getFail();
      }
    } else {
      this._getFail();
    }
  },
  _getFail: function () {
    this.$cardNumber.parent().siblings('.fe-error-msg').empty().text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V28).show();
    this.$cardNumber.focus();
    this.$isCardValid = false;
  },
  _checkCardExpiration: function (event) {
    var $target = $(event.currentTarget);
    var message = Tw.ALERT_MSG_MYT_FARE.ALERT_2_V5;

    this.$isValid = this._validation.checkEmpty($target.val());

    if (this.$isValid) {
      if ($target.hasClass('fe-card-y')) {
        this.$isValid = this._validation.checkYear(this.$cardY);
      } else {
        this.$isValid = this._validation.checkMonth(this.$cardM, this.$cardY);
      }
      message = Tw.ALERT_MSG_MYT_FARE.ALERT_2_V6;
    }

    if (this.$isValid) {
      $target.parents('.fe-exp-wrap').siblings('.fe-error-msg').hide();
    } else {
      $target.parents('.fe-exp-wrap').siblings('.fe-error-msg').text(message).show();
      $target.focus();
    }
  },
  _checkPassword: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._isEmpty($target, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V58) &&
      this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 2), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V7);
  },
  _onClose: function () {
    var isChanged = !(Tw.FormatHelper.isEmpty(this.$dataSelector.attr('id'))) || !Tw.FormatHelper.isEmpty(this.$cardNumber.val()) ||
      !Tw.FormatHelper.isEmpty(this.$cardY.val()) || !Tw.FormatHelper.isEmpty(this.$cardM.val()) || !Tw.FormatHelper.isEmpty(this.$cardPw.val());

    if (isChanged) {
      this._popupService.openConfirmButton(Tw.ALERT_CANCEL, null,
        $.proxy(this._closePop, this), $.proxy(this._afterClose, this),
        Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    } else {
      this._historyService.goBack();
    }
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
    if (this.$isValid && this.$isCardValid && this.$isSelectValid) {
      return this._validation.showAndHideErrorMsg(this.$dataSelector, this._validation.checkIsSelected(this.$dataSelector));
    }
    return false;
  },
  _openCheckPay: function ($layer) {
    this._setLayerData($layer);
    this._setEvent($layer);
  },
  _afterRechargeSuccess: function () {
    if (this._isRechargeSuccess) {
      var data = Tw.FormatHelper.customDataFormat(this._afterData.toString().replace(',',''), Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB);
      this._historyService.replaceURL('/myt-data/recharge/prepaid/data-complete?data=' + data.data);
    }
  },
  _setLayerData: function ($layer) {
    var remainData = this.$data.attr('data-value');
    this._afterData = parseInt(remainData, 10) +
      parseInt(this.$dataSelector.attr('data-value'), 10);

    $layer.find('.fe-remain-data').text(Tw.FormatHelper.addComma(remainData.toString()));
    $layer.find('.fe-after-data').text(Tw.FormatHelper.addComma(this._afterData.toString()));
    $layer.find('.fe-layer-card-number').text($.trim(this.$cardNumber.val()));
    $layer.find('.fe-layer-card-info').attr('data-code', this.$cardNumber.attr('data-code'))
      .text(this.$cardNumber.attr('data-name'));
    $layer.find('.fe-recharge-amount').text($.trim(this.$dataSelector.text()));
    $layer.find('.fe-email-address').text($.trim(this.$emailAddress.text()));
  },
  _setEvent: function ($layer) {
    $layer.on('click', '.fe-popup-close', $.proxy(this._checkClose, this));
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
  },
  _checkClose: function () {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_DATA.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_DATA.TITLE,
      $.proxy(this._closePop, this), $.proxy(this._afterClose, this), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_DATA.BUTTON);
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.closeAll();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  }
};