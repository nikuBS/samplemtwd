/**
 * FileName: payment.point.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.06
 */

Tw.PaymentPoint = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this._initVariables();
  this._bindEvent();
};

Tw.PaymentPoint.prototype = {
  _initVariables: function () {
    this.$cardNumber = this.$container.find('.card-number');
    this.$password = this.$container.find('.password');
    this.$agreement = this.$container.find('.cashbag-agree');
    this.$pointList = this.$container.find('.cashbag-point-list');
    this.$cashbagPoint = this.$container.find('.cashbag-point');
    this.$rainbowPoint = this.$container.find('.rainbow-point');
    this.$pointSelectBox = this.$container.find('.select-auto-cashbag-point');
    this.$productSelectBox = this.$container.find('.select-product-one');
    this.$productSelectBoxForAuto = this.$container.find('.select-product-auto');
    this.$errorContainer = this.$container.find('.error-data');
    this.$selectedPoint = null;
    this.$pointType = null;
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('click', '.select-payment-point', $.proxy(this._changeStep, this));
    this.$container.on('click', '.select-auto-cashbag-point', $.proxy(this._selectAutoCashbagPoint, this));
    this.$container.on('click', '.select-product', $.proxy(this._selectProduct, this));
    this.$container.on('click', '.cashbag-agree', $.proxy(this._openCashbagAgree, this));
    this.$container.on('click', '.pay-cashbag-one', $.proxy(this._payCashbagOne, this));
    this.$container.on('click', '.pay-cashbag-auto', $.proxy(this._payCashbagAuto, this));
    this.$container.on('click', '.pay-rainbow-one', $.proxy(this._payRainbowOne, this));
    this.$container.on('click', '.pay-rainbow-auto', $.proxy(this._payRainbowAuto, this));
    this.$container.on('click', '.cancel-cashbag-autopay', $.proxy(this._cancelAutoPay, this));
    this.$container.on('click', '.cancel-rainbow-autopay', $.proxy(this._cancelAutoPay, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _changeStep: function (event) {
    event.preventDefault();

    var $target = $(event.currentTarget);
    this._setType($target);
    this._go($target.data('value'));
  },
  _selectAutoCashbagPoint: function () {
    this._popupService.open({
      'hbs': 'select',
      'title': 'OK캐쉬백 포인트 선택',
      'multiplex': true,
      'close_bt': true,
      'select': [
        {
          'style_num': 'three',
          'style_class': 'point-select',
          'options': [
            {checked: false,value: '500P'},
            {checked: true,value: '1,000P'},
            {checked: false,value: '1,500P'},
            {checked: false,value: '2,000P'},
            {checked: false,value: '2,500P'},
            {checked: false,value: '3,000P'},
            {checked: false,value: '3,500P'},
            {checked: false,value: '4,000P'},
            {checked: false,value: '4,500P'},
            {checked: false,value: '5,000P'},
            {checked: false,value: '5,500P'},
            {checked: false,value: '6,000P'},
            {checked: false,value: '6,500P'},
            {checked: false,value: '7,000P'},
            {checked: false,value: '7,500P'},
            {checked: false,value: '8,000P'},
            {checked: false,value: '8,500P'},
            {checked: false,value: '9,000P'},
            {checked: false,value: '9,500P'},
            {checked: false,value: '10,000P'}
          ]
        }
      ]
    }, $.proxy(this._onOpenSelect, this));
  },
  _onOpenSelect: function($layer) {
    $layer.on('click', '.point-select', $.proxy(this._setPoint, this, $layer));
  },
  _setPoint: function ($layer) {
    var point = $layer.find('input:checked').val();
    this.$pointSelectBox.attr('id', point).text(point);
    this.$selectedPoint = point.replace(',', '').replace('P', '');
    this._popupService.close();
  },
  _setType: function ($target) {
    this.$pointType = $target.data('type');
    this.$autoCode = $target.data('code');
    this.$container.find('.point-title').hide();
    this.$container.find('.point-pay-info').hide();
    this.$container.find('.' + this.$pointType + '-title').show();
    this.$container.find('.' + this.$pointType + '-info').show();
  },
  _openCashbagAgree: function () {
    if (this.$agreement.is(':checked')) {
      this._popupService.open({
        hbs:'PA_05_01_L01'
      }, $.proxy(this._onOpenAgree, this));
    }
  },
  _onOpenAgree: function ($layer) {
    $layer.on('click', 'button', this._popupService.close);
  },
  _selectProduct: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.openChoice(Tw.MSG_PAYMENT.SELECT_PRODUCT, this._getProductList(), 'type3', $.proxy(this._onOpenProduct, this, $target));
  },
  _onOpenProduct: function ($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._setProduct, this, $target));
  },
  _setProduct: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr('id', $selectedValue.find('button').attr('id'));
    $target.text($selectedValue.text());
    this._popupService.close();
  },
  _payCashbagOne: function (event) {
    event.preventDefault();

    if (this._isValidForCashbagOne()) {
      var reqData = this._makeRequestDataForCashbagOne();
      this._apiService.request(Tw.API_CMD.BFF_07_0045, reqData)
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _makeRequestDataForCashbagOne: function () {
    return {
      ocbCcno: $.trim(this.$cardNumber.val()),
      ptClCd: this.$pointType,
      reqAmt: $.trim(this.$cashbagPoint.val()),
      ocbPwd: $.trim(this.$password.val())
    };
  },
  _payCashbagAuto: function (event) {
    event.preventDefault();

    if (this._isValidForCashbagAuto()) {
      var reqData = this._makeRequestDataForCashbagAuto();
      this._apiService.request(Tw.API_CMD.BFF_07_0054, reqData)
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _makeRequestDataForCashbagAuto: function () {
    var point = this.$selectedPoint;
    if (this.$pointType === 'TPT') {
      point = this.$pointList.find('input:checked').attr('title').replace(',', '');
    }

    var code = this.$autoCode.toString();
    var reqData = {
      reqClCd: code,
      ptClCd: this.$pointType,
      reqAmt: point
    };
    if (code === Tw.PAYMENT_OPTION.NEW) {
      var cardNum = $.trim(this.$cardNumber.val());
      if (cardNum.includes('*')) {
        cardNum = this.$cardNumber.data('value').toString();
      }
      reqData.ocbCcno = cardNum;
    }
    return reqData;
  },
  _payRainbowOne: function (event) {
    event.preventDefault();

    if (this._isValidForRainbow()) {
      var reqData = this._makeRequestDataForRainbow();
      this._apiService.request(Tw.API_CMD.BFF_07_0048, reqData)
        .done($.proxy(this._paySuccess, this))
        .fail($.proxy(this._payFail, this));
    }
  },
  _makeRequestDataForRainbow: function () {
    return {
      reqRbpPt: $.trim(this.$rainbowPoint.val()),
      prodId: this.$productSelectBox.attr('id')
    };
  },
  _payRainbowAuto: function (event) {
    event.preventDefault();

    this._apiService.request(Tw.API_CMD.BFF_07_0056, { prodId: this.$productSelectBoxForAuto.attr('id'), rbpChgRsnCd: Tw.RAINBOW_CHANGE_CODE.REQUEST })
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setData(res);
      this._history.setHistory();
      this._go('#complete');
    } else {
      this._payFail(res);
    }
  },
  _payFail: function (res) {
    this.$errorContainer.find('.code').empty().text(res.code);
    this.$errorContainer.find('.message').empty().text(res.orgDebugMessage);
    this._go('#error');
  },
  _setData: function (res) {
    var $target = this.$container.find('.complete-target');
    var $result = res.result;
    for (var key in $result) {
      $target.find('.' + key).text($result[key]);
    }
  },
  _cancelAutoPay: function (event) {
    this._popupService.openConfirm(null, Tw.MSG_PAYMENT.AUTO_A08, null, null, $.proxy(this._cancel, this, $(event.currentTarget)));
  },
  _cancel: function ($target) {
    var apiName = Tw.API_CMD.BFF_07_0054;
    var isRainbow = false;
    if ($target.hasClass('cancel-rainbow-autopay')) {
      apiName = Tw.API_CMD.BFF_07_0056;
      isRainbow = true;
    }
    var reqData = this._makeRequestDataForCancel(isRainbow, $target);
    this._apiService.request(apiName, reqData)
      .done($.proxy(this._cancelSuccess, this))
      .fail($.proxy(this._cancelFail, this));

    this._popupService.close();
  },
  _makeRequestDataForCancel: function (isRainbow, $target) {
    var reqData = {};
    if (isRainbow) {
      reqData.rbpChgRsnCd = Tw.RAINBOW_CHANGE_CODE.CANCEL;
    } else {
      reqData.reqClCd = Tw.PAYMENT_OPTION.CANCEL;
      reqData.ptClCd = $target.data('type');
    }
    return reqData;
  },
  _cancelSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.POINT_A02, null, $.proxy(this._cancalSuccessCallback, this));
    } else {
      this._popupService.close();
    }
  },
  _cancelFail: function () {
    Tw.Logger.info('autopay cancel fail');
  },
  _cancalSuccessCallback: function () {
    this._popupService.close();
    window.location.reload();
  },
  _isValidForCashbagOne: function () {
    var point = this.$container.find('.point-title:visible .point-value').text().replace(',', '');
    return (this._validation.checkEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkLength(this.$cardNumber.val(), 16, Tw.MSG_PAYMENT.REALTIME_A06) &&
      this._validation.checkEmpty(this.$password.val(), Tw.MSG_PAYMENT.AUTO_A04) &&
      this._validation.checkLength(this.$password.val(), 4, Tw.MSG_PAYMENT.REALTIME_A07) &&
      this._validation.checkIsAgree(this.$agreement, Tw.MSG_PAYMENT.POINT_A03) &&
      this._checkPoint(this.$cashbagPoint.val(), 1000, point));
  },
  _isValidForCashbagAuto: function () {
    var isTPoint = null;
    if (this.$pointType === 'TPT') {
      isTPoint = true;
    }
    return (this._validation.checkEmpty(this.$cardNumber.val(), Tw.MSG_PAYMENT.AUTO_A05) &&
      this._validation.checkLength(this.$cardNumber.val(), 16, Tw.MSG_PAYMENT.REALTIME_A06) &&
      this._validation.checkIsAgree(this.$agreement, Tw.MSG_PAYMENT.POINT_A03)) &&
      this._validation.checkIsSelected(this.$pointSelectBox, Tw.MSG_PAYMENT.POINT_A07, isTPoint);
  },
  _isValidForRainbow: function () {
    var point = this.$container.find('.rainbow-point-value').text().replace(',', '');
    return this._checkPoint(this.$rainbowPoint.val(), 1, point);
  },
  _checkPoint: function ($value, minPoint, havePoint) {
    return (this._validation.checkEmpty($value, Tw.MSG_PAYMENT.POINT_A04) &&
      this._validation.checkIsAvailablePoint($value, havePoint, Tw.MSG_PAYMENT.REALTIME_A12) &&
      this._validation.checkIsMore($value, minPoint, Tw.MSG_PAYMENT.REALTIME_A08) &&
      this._validation.checkIsTenUnit($value, Tw.MSG_PAYMENT.POINT_A06));
  },
  _checkIsAvailableCard: function ($cardNum) {
    this._apiService.request(Tw.API_CMD.BFF_07_0024, { cardNum: $cardNum })
      .done($.proxy(this._checkSuccess, this))
      .fail($.proxy(this._checkFail, this));
  },
  _checkSuccess: function (res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      this._popupService.openAlert(Tw.MSG_PAYMENT.POINT_A05);
      return false;
    }
    return true;
  },
  _checkFail: function () {
    Tw.Logger.info('card check request fail');
  },
  _go: function (hash) {
    window.location.hash = hash;
  },
  _getProductList: function () {
    return [
      { 'attr': 'id="CCBBAE0"', text: '국내 음성 통화료' },
      { 'attr': 'id="CCRPDDC"', text: '국내 데이터 통화료' },
      { 'attr': 'id="CCBCOE0"', text: '부가서비스(컬러링)' },
      { 'attr': 'id="CCPCRBE"', text: '부가서비스(퍼팩트콜)' },
      { 'attr': 'id="CCPLRBE"', text: '부가서비스(퍼팩트콜라이트)' },
      { 'attr': 'id="CCRMRBE"', text: '로밍사용요금' },
      { 'attr': 'id="CCRPGDC"', text: '기본료 및 월정액 이용요금' }
    ];
  }
};