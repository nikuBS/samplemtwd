/**
 * FileName: myt-fare.bill.prepay.auto.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.06
 * Annotation: 소액결제/콘텐츠이용료 자동 선결제 신청 및 변경
 */

Tw.MyTFareBillPrepayAuto = function (rootEl, title, type) {
  this.$container = rootEl;
  this.$title = title;
  this.$type = type;
  this.$isPage = true;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-pay'), true);
  this._backAlert = new Tw.BackAlert(rootEl, true);

  this._init();
};

Tw.MyTFareBillPrepayAuto.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();

    this._validationService.bindEvent();
    setTimeout($.proxy(this._changeLimit, this), 100);
  },
  _initVariables: function () {
    this._standardAmountList = [];
    this._prepayAmountList = [];

    this.$standardAmount = this.$container.find('.fe-standard-amount');
    this.$prepayAmount = this.$container.find('.fe-prepay-amount');
    this.$cardWrap = this.$container.find('.fe-card-wrap');
    this.$firstCardNum = this.$container.find('.fe-card-num:first');
    this.$lastCardNum = this.$container.find('.fe-card-num:last');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$changeMoneyInfo = this.$container.find('.fe-change-money-info');
    this.$changeCardInfo = this.$container.find('.fe-change-card-info');
    this.$changeType = 'A';
    this.$isFirstChangeToC = true;
    this.$isFirstChangeToT = true;
  },
  _bindEvent: function () {
    this.$container.on('change', '.fe-change-type', $.proxy(this._changeType, this));
    this.$container.on('click', '.fe-standard-amount', $.proxy(this._selectAmount, this, this._standardAmountList));
    this.$container.on('click', '.fe-prepay-amount', $.proxy(this._selectAmount, this, this._prepayAmountList));
    this.$container.on('click', '.fe-amount-info', $.proxy(this._openAmountInfo, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._autoPrepay, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
  },
  _changeLimit: function () {
    if (this.$standardAmount.attr('id') < 1) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.NOT_ALLOWED_AUTO_PREPAY, null, null, $.proxy(this._goBack, this));
    }
  },
  _goBack: function () {
    this._historyService.goBack();
  },
  _changeType: function (event) {
    var $target = $(event.target);

    if ($target.hasClass('fe-money')) {
      this.$changeType = 'A';

      this.$cardWrap.hide();
      this.$changeMoneyInfo.show();
      this.$changeCardInfo.hide();
      this.$firstCardNum.hide();
      this.$lastCardNum.hide();

      this._checkSelected();
    } else if ($target.hasClass('fe-card')) {
      this.$changeType = 'C';

      this.$cardWrap.show();
      this.$changeMoneyInfo.hide();
      this.$changeCardInfo.hide();
      this.$firstCardNum.hide();
      this.$lastCardNum.show();

      if (this.$isFirstChangeToC) {
        this._validationService.bindEvent();
      }
      this.$isFirstChangeToC = false;
    } else {
      this.$changeType = 'T';

      this.$cardWrap.show();
      this.$changeMoneyInfo.show();
      this.$changeCardInfo.hide();
      this.$firstCardNum.hide();
      this.$lastCardNum.show();

      if (this.$isFirstChangeToT) {
        this._validationService.bindEvent();
      }
      this.$isFirstChangeToT = false;
    }
    this._checkIsAbled();
  },
  _checkIsAbled: function () {
    this._validationService.checkIsAbled();
  },
  _selectAmount: function ($list, event) {
    var $target = $(event.currentTarget);
    var $amount = $target.attr('data-max-value');

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this._getAmountList($list, $amount),
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.parents('label').text());

    if ($target.hasClass('fe-standard-amount')) {
      this.$prepayAmount.attr('id', $selectedValue.attr('id'));
      this.$prepayAmount.text($selectedValue.parents('label').text());
    }

    this._checkSelected();
    this._popupService.close();
  },
  _checkSelected: function () {
    if (this.$prepayAmount.attr('id') !== this.$prepayAmount.attr('data-origin-id') ||
    this.$standardAmount.attr('id') !== this.$standardAmount.attr('data-origin-id')) {
      this._validationService._setButtonAbility($.proxy(this._isAmountValid, this));
    }
  },
  _getAmountList: function ($amountList, $amount) {
    if (Tw.FormatHelper.isEmpty($amountList)) {
      var listObj = {
        'list': []
      };
      var firstAmt = 10000;
      var strdAmt = $amount / firstAmt;

      for (var i = strdAmt; i >= 1; i--) {
        var obj = {
          'label-attr': 'id="' + i * firstAmt + '"',
          'radio-attr': 'id="' + i * firstAmt + '" name="r2"',
          'txt': i + Tw.CURRENCY_UNIT.TEN_THOUSAND
        };
        listObj.list.push(obj);
      }
      $amountList.push(listObj);
    }
    return $amountList;
  },
  _openAmountInfo: function () {
    this._popupService.openAlert(Tw.AMOUNT_INFO[this.$title.toUpperCase() + '_CONTENTS'], Tw.AMOUNT_INFO.TITLE, Tw.BUTTON_LABEL.CONFIRM);
  },
  _autoPrepay: function () {
    if (this._isAmountValid() && this._validationService.isAllValid()) {
      this._pay();
    }
  },
  _isAmountValid: function () {
    return this._validation.showAndHideErrorMsg(this.$prepayAmount,
      this._validation.checkIsMoreAndSet(this.$standardAmount, this.$prepayAmount));
  },
  _pay: function () {
    var reqData = this._makeRequestData();
    var apiName = this._getApiName();

    this._apiService.request(apiName, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _makeRequestData: function () {
    var reqData = {
      checkAuto: 'N',
      autoChrgStrdAmt: this.$standardAmount.attr('id'),
      autoChrgAmt: this.$prepayAmount.attr('id')
    };

    if (this.$type === 'change') {
      reqData.checkRadio = this.$changeType;
    }

    if (!(this.$type === 'change' && this.$changeType === 'A')) {
      reqData.cardNum = $.trim(this.$cardNumber.val());
      reqData.cardType = this.$cardNumber.attr('data-code');
      reqData.cardNm = this.$cardNumber.attr('data-name');
      reqData.cardEffYM = $.trim(this.$cardY.val())+ $.trim(this.$cardM.val());
      reqData.cardPwd = $.trim(this.$cardPw.val());
    }
    return reqData;
  },
  _getApiName: function () {
    var apiName = '';
    if (this.$title === 'small') {
      apiName = Tw.API_CMD.BFF_07_0076;
    } else {
      apiName = Tw.API_CMD.BFF_07_0083;
    }
    return apiName;
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=' + this.$title + '&sub=' + this.$type);
    } else {
      this._payFail(res);
    }
  },
  _payFail: function (err) {
    if (err.code === 'BIL0006') {
      this._popupService.openAlert(err.msg, Tw.POPUP_TITLE.NOTIFY);
    } else {
      Tw.Error(err.code, err.msg).pop();
    }
  },
  _onClose: function () {
    this._backAlert.onClose();
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.close();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  }
};