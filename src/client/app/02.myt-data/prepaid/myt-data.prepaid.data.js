/**
 * @file myt-data.prepaid.data.js
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.11.28
 */

Tw.MyTDataPrepaidData = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-check-recharge'));
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-check-recharge'));
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl, true);

  this._cachedElement();
  this._init();
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
  _init: function () {
    this._getPpsInfo();
    this._getEmailAddress();
  },
  _getPpsInfo: function () {
    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_05_0013, {})
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._getFail, this));
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._bindEvent();
      this._setData(res.result);
    } else {
      this._getFail(res);
    }
  },
  _getFail: function (err) {
    Tw.CommonHelper.endLoading('.popup-page');
    Tw.Error(err.code, err.msg).replacePage();
  },
  _getEmailAddress: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0061, {})
      .done($.proxy(this._emailSuccess, this))
      .fail($.proxy(this._emailFail, this));
  },
  _emailSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$emailAddress.text(res.result.email);
    } else {
      this._emailFail();
    }
  },
  _emailFail: function () {
    this.$emailAddress.text('');
  },
  _bindEvent: function () {
    this.$dataSelector.on('click', $.proxy(this._openSelectPop, this));
    this.$container.on('click', '.fe-close-popup', $.proxy(this._onClose, this));
    this.$rechargeBtn.on('click', $.proxy(this._checkPay, this));
  },
  _setData: function (result) {
    var data = 0, dataText = 0;
    if (!Tw.FormatHelper.isEmpty(result.remained) && result.remained !== '0') {
      data = result.remained;
      dataText = Tw.FormatHelper.addComma(result.remained);
    }
    this.$data.attr('data-value', data).text(dataText);
    this.$dataSelector.attr('data-code', result.dataYn);

    this.$container.find('.fe-from-date').text(Tw.DateHelper.getShortDate(result.obEndDt));
    this.$container.find('.fe-to-date').text(Tw.DateHelper.getShortDate(result.inbEndDt));
    this.$container.find('.fe-remain-date').text(Tw.DateHelper.getShortDate(result.numEndDt));
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
      $.proxy(this._checkIsAbled, this),
      null,
      $target);
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
    this._validationService.checkIsAbled();
    this._popupService.close();
  },
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$dataSelector.attr('id'))) {
      this.$dataSelector.siblings('.fe-error-msg').show();
      this.$dataSelector.focus();
    }
    this._popupService.close();
  },
  _onClose: function () {
    this._backAlert.onClose();
  },
  _checkPay: function (e) {
    if (this._validationService.isAllValid()) {
      this._popupService.open({
        'hbs': 'DC_09_03_01',
        'title': Tw.MYT_DATA_PREPAID.DATA_TITLE
      },
        $.proxy(this._openCheckPay, this),
        $.proxy(this._afterRechargeSuccess, this),
        'check-pay',
        $(e.currentTarget)
      );
    }
  },
  _openCheckPay: function ($layer) {
    this._setLayerData($layer);
    this._setEvent($layer);
  },
  _afterRechargeSuccess: function () {
    if (this._isRechargeSuccess) {
      var data = Tw.FormatHelper.customDataFormat(this._afterData.toString().replace(',',''), Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB);
      this._historyService.replaceURL('/myt-data/recharge/prepaid/data-complete?data=' + data.data);
    } else if (this._isRechargeFail) {
      Tw.Error(this._err.code, this._err.msg).pop();
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
    $layer.on('click', '.fe-popup-close', $.proxy(this._close, this));
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

    Tw.CommonHelper.startLoading('.popup-page', 'grey');
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
      Tw.CommonHelper.endLoading('.popup-page');
      this._isRechargeSuccess = true;
      this._close();
    } else {
      this._rechargeFail(res);
    }
  },
  _rechargeFail: function (err) {
    Tw.CommonHelper.endLoading('.popup-page');
    this._isRechargeFail = true;
    this._err = {
      code: err.code,
      msg: err.msg
    };
    this._close();
  },
  _close: function () {
    this._popupService.close();
  }
};