/**
 * @file myt-fare.bill.rainbow.js
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.11.7
 * Annotation: 레인보우포인트 1회 요금납부 예약 및 자동납부 관리
 */

Tw.MyTFareBillRainbow = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl, true);
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-pay:visible'));

  this._init();
};

Tw.MyTFareBillRainbow.prototype = {
  _init: function () {
    this.$isOneSelectValid = false;
    this.$isAutoSelectValid = false;
    this.$isPointValid = false;

    this._initVariables('tab1'); // 최초 1회납부 탭으로 initialize
    this._bindEvent();
  },
  _initVariables: function ($targetId) {
    this.$standardPoint = this.$container.find('.fe-standard-point');
    this.$autoInfo = this.$container.find('.fe-auto-info');
    this.$selectedTab = this.$container.find('#' + $targetId + '-tab');
    this.$fareSelector = this.$selectedTab.find('.fe-select-fare');
    this.$point = this.$selectedTab.find('.fe-point');
    this.$payBtn = this.$container.find('.fe-' + $targetId + '-pay');
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
    // 1회납부/자동납부 탭 change
    var $target = $(event.currentTarget);
    $target.find('button').attr('aria-selected', 'true');
    $target.siblings().find('button').attr('aria-selected', 'false');

    var $targetId = $target.attr('id');
    this._initVariables($targetId);
    this._checkIsAbled();
  },
  _checkIsAbled: function () {
    // 버튼 활성화
    if (this.$selectedTab.attr('id') === 'tab1-tab') { // 1회납부 예약일 경우
      if ((this.$fareSelector.attr('id') !== '') && ($.trim(this.$point.val()) !== '')) {
        this.$payBtn.removeAttr('disabled');
      } else {
        this.$payBtn.attr('disabled', 'disabled');
      }
    } else { // 자동납부 예약일 경우
      if (this.$fareSelector.attr('id') !== this.$fareSelector.attr('data-origin-id')) {
        this.$payBtn.removeAttr('disabled');
      } else {
        this.$payBtn.attr('disabled', 'disabled');
      }
    }
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target); // 숫자만 입력 가능
  },
  _cancel: function (e) {
    var $target = $(e.currentTarget);
    // 자동납부 해지 시 확인 팝업
    this._popupService.openConfirmButton('', Tw.ALERT_MSG_MYT_FARE.ALERT_2_A77.TITLE,
      $.proxy(this._onCancel, this), $.proxy(this._autoCancel, this, $target), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A77.BUTTON, $(e.currentTarget));
  },
  _onCancel: function () {
    this._isCancel = true;
    this._popupService.close();
  },
  _autoCancel: function ($target) {
    if (this._isCancel) {
      this._apiService.request(Tw.API_CMD.BFF_07_0056, { rbpChgRsnCd: 'T1' })
        .done($.proxy(this._cancelSuccess, this, $target))
        .fail($.proxy(this._fail, this, $target));
    }
  },
  _cancelSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=rainbow&type=cancel'); // 해지 완료 페이지로 이동
    } else {
      this._fail($target, res);
    }
  },
  _selectFare: function (event) {
    var $target = $(event.currentTarget);

    // 요금제 action sheet
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_RAINBOW,
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target), null, null, $target);
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

    this.$fareSelector.parent().siblings('.fe-error-msg').hide().attr('aria-hidden', 'true');
    this._setSelectorValidation(true);

    this._checkIsAbled();
    this._popupService.close();
  },
  _setSelectorValidation: function (isValid) {
    if (this.$selectedTab.attr('id') === 'tab1-tab') {
      this.$isOneSelectValid = isValid; // 1회납부 유효성 검증결과
    } else {
      this.$isAutoSelectValid = isValid; // 자동납부 유효성 검증결과
    }
  },
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$fareSelector.attr('id'))) {
      this.$fareSelector.parent().siblings('.fe-error-msg').show().attr('aria-hidden', 'false');
      this.$fareSelector.focus();
      this._setSelectorValidation(false);
    }
    this._popupService.close();
  },
  _checkPoint: function () {
    var isValid = false;
    var $message = this.$point.parent().siblings('.fe-error-msg');
    $message.empty();

    if (!this._validation.checkEmpty(this.$point.val())) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V65); // 납부할 포인트 입력
    } else if (!this._validation.checkIsAvailablePoint(this.$point.val(),
        parseInt(this.$standardPoint.attr('id'), 10))) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V27); // 보유 포인트 이상 입력
    } else if (!this._validation.checkIsMore(this.$point.val(), 1)) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.UP_TO_ONE); // 1포인트 이상 입력
    } else if (!this._validation.checkIsTenUnit(this.$point.val())) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.TEN_POINT); // 10포인트 단위로 입력
    } else {
      isValid = true;
    }

    this.$isPointValid = this._validation.showAndHideErrorMsg(this.$point, isValid); // validation message
  },
  _onePay: function (e) { // 1회납부
    var $target = $(e.currentTarget);
    if (this.$isPointValid && this.$isOneSelectValid) {
      var reqData = this._makeRequestDataForOne();
      this._apiService.request(Tw.API_CMD.BFF_07_0048, reqData)
        .done($.proxy(this._paySuccess, this, $target, ''))
        .fail($.proxy(this._fail, this, $target));
    } else {
      if (!this.$isPointValid) {
        this.$point.focus();
      } else {
        this.$fareSelector.focus();
      }
    }
  },
  _autoPay: function (e) { // 자동납부
    var $target = $(e.currentTarget);
    if (this.$isAutoSelectValid) {
      var reqData = this._makeRequestDataForAuto();
      this._apiService.request(Tw.API_CMD.BFF_07_0056, reqData)
        .done($.proxy(this._paySuccess, this, $target, 'auto'))
        .fail($.proxy(this._fail, this, $target));
    } else {
      this.$fareSelector.focus();
    }
  },
  _paySuccess: function ($target, type, res) { // 납부예약 완료
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=rainbow&type=' + type +
        '&point=' + this._getPointValue(type) + '&add=' + this.$fareSelector.attr('id'));
    } else {
      this._fail($target, res);
    }
  },
  _getPointValue: function (type) {
    var point = $.trim(this.$point.val());
    if (type === 'auto') {
      point = '';
    }
    return point;
  },
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  _makeRequestDataForOne: function () {
    // 1회납부예약 요쳥 파라미터
    var reqData = {
      reqRbpPt: $.trim(this.$point.val()),
      prodId: this.$fareSelector.attr('id')
    };
    return reqData;
  },
  _makeRequestDataForAuto: function () {
    // 자동납부예약 요청 파라미터
    var reqData = {
      prodId: this.$fareSelector.attr('id'),
      rbpChgRsnCd: 'A1'
    };
    return reqData;
  },
  _onClose: function () {
    this._backAlert.onClose(); // x 버튼 클릭 시 공통 얼럿 노출
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