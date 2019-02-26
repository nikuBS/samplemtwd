/**
 * FileName: myt-fare.bill.cashbag.tpoint.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.7
 */

Tw.MyTFareBillCashbagTpoint = function (rootEl, pointType) {
  this.$container = rootEl;
  this.$pointType = pointType;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._validationService = new Tw.ValidationService(rootEl);
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl, true);

  this._init();
};

Tw.MyTFareBillCashbagTpoint.prototype = {
  _init: function () {
    this.$isOneValid = false;
    this.$isAutoValid = true;
    this.$isAutoCardValid = true;
    this.$isSelectValid = false;

    this._initVariables('tab1');
    this._bindEvent();
  },
  _initVariables: function ($targetId) {
    this.$pointWrap = this.$container.find('.fe-point-wrap');
    this.$standardPoint = this.$container.find('.fe-standard-point');
    this.$getPointBtn = this.$container.find('.fe-get-point-wrapper');
    this.$pointInfo = this.$container.find('.fe-point-info');
    this.$autoInfo = this.$container.find('.fe-auto-info');
    this.$selectedTab = this.$container.find('#' + $targetId + '-tab');
    this.$pointCardNumber = this.$selectedTab.find('.fe-point-card');
    this.$pointSelector = this.$selectedTab.find('.fe-select-point');
    this.$point = this.$selectedTab.find('.fe-point');
    this.$pointPw = this.$selectedTab.find('.fe-point-pw');
    this.$agree = this.$container.find('.fe-agree');
    this.$payBtn = this.$container.find('.fe-' + $targetId + '-pay');

    this.$payBtn.show();
    this.$payBtn.siblings().hide();
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-get-point', $.proxy(this._openGetPoint, this));
    this.$container.on('click', '.fe-tab-selector > li', $.proxy(this._changeTab, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._checkNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('blur', 'input.fe-point', $.proxy(this._checkPoint, this));
    this.$container.on('blur', '.fe-point-card', $.proxy(this._checkCardNumber, this));
    this.$container.on('blur', '.fe-point-pw', $.proxy(this._checkPassword, this));
    this.$container.on('change', '.fe-agree', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._cancel, this));
    this.$container.on('click', '.fe-select-point', $.proxy(this._selectPoint, this));
    this.$container.on('click', '.fe-find-password', $.proxy(this._goCashbagSite, this));
    this.$container.on('click', '.fe-agree-view', $.proxy(this._openAgreePop, this));
    this.$container.on('click', '.fe-tab1-pay', $.proxy(this._onePay, this));
    this.$container.on('click', '.fe-tab2-pay', $.proxy(this._autoPay, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
  },
  _openGetPoint: function () {
    new Tw.MyTFareBillGetPoint(this.$container, $.proxy(this._setPointInfo, this));
  },
  _setPointInfo: function (result) {
    var $point = 0;
    if (this.$pointType === 'CPT') {
      $point = result.availPt;
    } else {
      $point = result.availTPt;
    }

    this.$standardPoint.attr('id', $point).text(Tw.FormatHelper.addComma($point));
    this.$pointCardNumber.val(result.ocbCcno).attr('readonly', true);
    this.$selectedTab.siblings().find('.fe-point-card').val(result.ocbCcno).attr('readonly', true);
    this.$isAutoCardValid = true;

    this.$pointWrap.removeClass('none');
    this.$getPointBtn.hide();
    this.$pointInfo.show();
  },
  _changeTab: function (event) {
    var $targetId = $(event.currentTarget).attr('id');
    this._initVariables($targetId);
    this._checkIsAbled();
  },
  _checkIsAbled: function () {
    if (this.$selectedTab.attr('id') === 'tab1-tab') {
      if (($.trim(this.$point.val()) !== '') && ($.trim(this.$pointCardNumber.val()) !== '') &&
        ($.trim(this.$pointPw.val()) !== '') && (this.$agree.is(':checked'))) {
        this.$payBtn.removeAttr('disabled');
      } else {
        this.$payBtn.attr('disabled', 'disabled');
      }
    } else {
      if ((this.$pointSelector.attr('id') !== this.$pointSelector.attr('data-origin-id')) &&
        ($.trim(this.$pointCardNumber.val()) !== '') &&
        (this.$agree.is(':checked'))) {
        this.$payBtn.removeAttr('disabled');
      } else {
        this.$payBtn.attr('disabled', 'disabled');
      }
    }
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  _checkPoint: function () {
    var isValid = false;
    var $message = this.$point.parent().siblings('.fe-error-msg');
    $message.empty();

    if (this.$pointWrap.hasClass('none')) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.GET_POINT);
    } else {
      if (!this._validation.checkEmpty(this.$point.val())) {
        $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V65);
      } else if (!this._validation.checkIsMore(this.$point.val(), 1000)) {
        $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V8);
      } else if (!this._validation.checkIsAvailablePoint(this.$point.val(),
          this.$standardPoint.attr('id'))) {
        $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V27);
      } else if (!this._validation.checkIsTenUnit(this.$point.val())) {
        $message.text(Tw.ALERT_MSG_MYT_FARE.TEN_POINT);
      } else {
        isValid = true;
      }
    }

    this.$isOneValid = this._validation.showAndHideErrorMsg(this.$point, isValid);
  },
  _checkCardNumber: function (event) {
    var $target = $(event.currentTarget);
    var isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkEmpty($target.val()), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V60) &&
      this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 16), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V26);

    if (this.$selectedTab.attr('id') === 'tab1-tab') {
      this.$isOneValid = isValid;
    } else {
      this.$isAutoCardValid = isValid;
    }
  },
  _checkPassword: function (event) {
    var $target = $(event.currentTarget);
    this.$isOneValid = this._validation.showAndHideErrorMsg($target, this._validation.checkEmpty($target.val()), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V58) &&
      this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 6), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V7);
  },
  _cancel: function () {
    this._popupService.openConfirmButton('', Tw.ALERT_MSG_MYT_FARE.ALERT_2_A77.TITLE,
      $.proxy(this._onCancel, this), $.proxy(this._autoCancel, this), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A77.BUTTON);
  },
  _onCancel: function () {
    this._isCancel = true;
    this._popupService.close();
  },
  _autoCancel: function () {
    if (this._isCancel) {
      this._apiService.request(Tw.API_CMD.BFF_07_0054, {reqClCd: '3', ptClCd: this.$pointType})
        .done($.proxy(this._cancelSuccess, this))
        .fail($.proxy(this._fail, this));
    }
  },
  _cancelSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=' + this.$pointType + '&type=cancel');
    } else {
      this._fail(res);
    }
  },
  _selectPoint: function (event) {
    var $target = $(event.currentTarget);

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this._getData(),
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _getData: function () {
    if (this.$pointType === 'CPT') {
      return Tw.POPUP_TPL.FARE_PAYMENT_POINT;
    }
    return Tw.POPUP_TPL.FARE_PAYMENT_TPOINT;
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
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($.trim($selectedValue.parents('label').text()));

    this.$pointSelector.parent().siblings('.fe-error-msg').hide();
    this.$isSelectValid = true;

    this._checkIsAbled();
    this._popupService.close();
  },
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$pointSelector.attr('id'))) {
      this.$pointSelector.parent().siblings('.fe-error-msg').show();
      this.$pointSelector.focus();
      this.$isSelectValid = false;
    }
    this._popupService.close();
  },
  _goCashbagSite: function () {
    Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.OKCASHBAG);
  },
  _openAgreePop: function (event) {
    event.stopPropagation();
    this._popupService.open({
      hbs: 'MF_01_05_L01'
    },
      $.proxy(this._setClickEvent, this),
      $.proxy(this._setCheck, this),
      'agree');
  },
  _setClickEvent: function ($layer) {
    $layer.on('click', '.fe-agree-btn', $.proxy(this._agree, this));
  },
  _agree: function () {
    this.$isAgree = true;
    this._popupService.close();
  },
  _setCheck: function () {
    if (this.$isAgree) {
      if (!this.$agree.is(':checked')) {
        this.$agree.trigger('click');
      }
    }
  },
  _onePay: function () {
    if (this._validationService.isAllValid()) {
      if (this.$isOneValid) {
        var reqData = this._makeRequestDataForOne();
        this._apiService.request(Tw.API_CMD.BFF_07_0045, reqData)
          .done($.proxy(this._paySuccess, this, ''))
          .fail($.proxy(this.fail, this));
      }
    }
  },
  _autoPay: function () {
    if (this._validationService.isAllValid()) {
      if (this.$isAutoValid && this.$isAutoCardValid && this.$isSelectValid) {
        var reqData = this._makeRequestDataForAuto();
        var type = 'auto';
        if (this.$autoInfo.is(':visible')) {
          type = 'change';
        }
        this._apiService.request(Tw.API_CMD.BFF_07_0054, reqData)
          .done($.proxy(this._paySuccess, this, type))
          .fail($.proxy(this.fail, this));
      }
    }
  },
  _paySuccess: function (type, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var point = this._getPointValue(type);
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=' +
        this.$pointType + '&type=' + type + '&point=' + point);
    } else {
      this.fail(res);
    }
  },
  _getPointValue: function (type) {
    var point = $.trim(this.$point.val());
    if (type === 'auto' || type === 'change') {
      point = this.$pointSelector.attr('id');
    }
    return point;
  },
  fail: function (err) {
    if (err.code === 'BIL0006') {
      this._popupService.openAlert(err.msg, Tw.POPUP_TITLE.NOTIFY);
    } else {
      Tw.Error(err.code, err.msg).pop();
    }
  },
  _makeRequestDataForOne: function () {
    var reqData = {
      ocbCcno: $.trim(this.$pointCardNumber.val()),
      ptClCd: this.$pointType,
      reqAmt: $.trim(this.$point.val()),
      ocbPwd: $.trim(this.$pointPw.val())
    };
    return reqData;
  },
  _makeRequestDataForAuto: function () {
    var autoType = this._getAutoType();
    var cardNumber = $.trim(this.$pointCardNumber.val());

    if (this.$autoInfo.is(':visible')) {
      cardNumber = this.$pointCardNumber.attr('id');
    }

    var reqData = {
      reqClCd: autoType,
      reqAmt: this.$pointSelector.attr('id'),
      ptClCd: this.$pointType,
      ocbCcno: cardNumber
    };
    return reqData;
  },
  _getAutoType: function () {
    if (this.$autoInfo.is(':visible')) {
      return 2;
    }
    return 1;
  },
  _onClose: function () {
    this._backAlert.onClose();
    // if (this._isChanged()) {
    //   this._popupService.openConfirmButton(Tw.ALERT_CANCEL, null,
    //     $.proxy(this._closePop, this), $.proxy(this._afterClose, this),
    //     Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    // } else {
    //   this._historyService.goBack();
    // }
  },
  _isChanged: function () {
    var isChanged = false;
    if (!this.$pointCardNumber.attr('readOnly')) {
      if (!Tw.FormatHelper.isEmpty(this.$pointCardNumber.val())) {
        isChanged = true;
      }
    }

    if (!isChanged) {
      if (this.$selectedTab.attr('id') === 'tab1-tab') {
        isChanged = !Tw.FormatHelper.isEmpty(this.$point.val()) || !Tw.FormatHelper.isEmpty(this.$pointPw.val());
      } else {
        isChanged = true;
      }
    }
    return isChanged;
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