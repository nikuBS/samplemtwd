/**
 * FileName: myt-fare.bill.rainbow.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.7
 */

Tw.MyTFareBillRainbow = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillRainbow.prototype = {
  _init: function () {
    this._initVariables('tab1');
    this._bindEvent();
  },
  _initVariables: function ($targetId) {
    this.$standardPoint = this.$container.find('.fe-standard-point');
    this.$autoInfo = this.$container.find('.fe-auto-info');
    this.$selectedTab = this.$container.find('#' + $targetId + '-tab');
    this.$fareSelector = this.$selectedTab.find('.fe-select-fare');
    this.$point = this.$selectedTab.find('.fe-point');
    this.$payBtn = this.$container.find('.fe-' + $targetId + '-pay');
    this.$isValid = false;
    this.$isSelectValid = true;

    this.$payBtn.show();
    this.$payBtn.siblings().hide();
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-tab-selector > li', $.proxy(this._changeTab, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('blur', '.fe-point', $.proxy(this._checkPoint, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-select-fare', $.proxy(this._selectFare, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._cancel, this));
    this.$container.on('click', '.fe-tab1-pay', $.proxy(this._onePay, this));
    this.$container.on('click', '.fe-tab2-pay', $.proxy(this._autoPay, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
  },
  _changeTab: function (event) {
    var $targetId = $(event.currentTarget).attr('id');
    this._initVariables($targetId);
    this._checkIsAbled();
  },
  _checkIsAbled: function () {
    if (this.$selectedTab.attr('id') === 'tab1-tab') {
      if ((this.$fareSelector.attr('id') !== '') && ($.trim(this.$point.val()) !== '')) {
        this.$payBtn.removeAttr('disabled');
      } else {
        this.$payBtn.attr('disabled', 'disabled');
      }
    } else {
      if (this.$fareSelector.attr('id') !== '') {
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
      this._apiService.request(Tw.API_CMD.BFF_07_0056, { rbpChgRsnCd: 'T1' })
        .done($.proxy(this._cancelSuccess, this))
        .fail($.proxy(this._fail, this));
    }
  },
  _cancelSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=rainbow&type=cancel');
    } else {
      this._fail(res);
    }
  },
  _selectFare: function (event) {
    var $target = $(event.currentTarget);

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_RAINBOW,
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
    $layer.on('click', '.fe-popup-close', $.proxy(this._checkSelected, this));
  },
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$fareSelector.attr('id'))) {
      this.$fareSelector.parent().siblings('.fe-error-msg').show();
      this.$fareSelector.focus();
      this.$isSelectValid = false;
    }
    this._popupService.close();
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($.trim($selectedValue.parents('label').text()));

    this.$fareSelector.parent().siblings('.fe-error-msg').hide();
    this.$isSelectValid = true;

    this._checkIsAbled();
    this._popupService.close();
  },
  _checkPoint: function () {
    var isValid = false;
    var $message = this.$point.parent().siblings('.fe-error-msg');
    $message.empty();

    if (!this._validation.checkEmpty(this.$point.val())) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V65);
    } else if (!this._validation.checkIsAvailablePoint(this.$point.val(),
        parseInt(this.$standardPoint.attr('id'), 10))) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V27);
    } else if (!this._validation.checkIsMore(this.$point.val(), 1)) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.UP_TO_ONE);
    } else if (!this._validation.checkIsTenUnit(this.$point.val())) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.TEN_POINT);
    } else {
      isValid = true;
    }

    this.$isValid = this._validation.showAndHideErrorMsg(this.$point, isValid);
  },
  _isValidForAuto: function () {
    var isValid = this._validation.checkIsMore(parseInt(this.$standardPoint.attr('id'), 10), 1000);
    if (!isValid) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.UP_TO_TEN);
    }
    return isValid;
  },
  _onePay: function () {
    if (this.$isValid && this.$isSelectValid) {
      var reqData = this._makeRequestDataForOne();
      this._apiService.request(Tw.API_CMD.BFF_07_0048, reqData)
        .done($.proxy(this._paySuccess, this, ''))
        .fail($.proxy(this._fail, this));
    }
  },
  _autoPay: function () {
    if (this._isValidForAuto() && this.$isSelectValid) {
      var reqData = this._makeRequestDataForAuto();
      this._apiService.request(Tw.API_CMD.BFF_07_0056, reqData)
        .done($.proxy(this._paySuccess, this, 'auto'))
        .fail($.proxy(this._fail, this));
    }
  },
  _paySuccess: function (type, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=rainbow&type=' + type +
        '&point=' + this._getPointValue(type) + '&add=' + this.$fareSelector.attr('id'));
    } else {
      this._fail(res);
    }
  },
  _getPointValue: function (type) {
    var point = $.trim(this.$point.val());
    if (type === 'auto') {
      point = '';
    }
    return point;
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _makeRequestDataForOne: function () {
    var reqData = {
      reqRbpPt: $.trim(this.$point.val()),
      prodId: this.$fareSelector.attr('id')
    };
    return reqData;
  },
  _makeRequestDataForAuto: function () {
    var reqData = {
      prodId: this.$fareSelector.attr('id'),
      rbpChgRsnCd: 'A1'
    };
    return reqData;
  },
  _onClose: function () {
    if (this._isChanged()) {
      this._popupService.openConfirmButton(null, Tw.ALERT_MSG_CUSTOMER.ALERT_PRAISE_CANCEL.TITLE,
        $.proxy(this._closePop, this), $.proxy(this._afterClose, this));
    } else {
      this._historyService.goBack();
    }
  },
  _isChanged: function () {
    if (this.$selectedTab.attr('id') === 'tab1-tab') {
      return !Tw.FormatHelper.isEmpty(this.$fareSelector.attr('id')) || !Tw.FormatHelper.isEmpty(this.$point.val());
    } else {
      if (this.$autoInfo.is(':visible')) {
        return (this.$fareSelector.attr('id') !== this.$fareSelector.attr('data-origin-id'));
      } else {
        return !Tw.FormatHelper.isEmpty(this.$fareSelector.attr('id'));
      }
    }
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