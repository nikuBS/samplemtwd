/**
 * @file myt-fare.bill.point.js
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.09.17
 * Annotation: 포인트 요금납부
 */

Tw.MyTFareBillPoint = function (rootEl) {
  this.$container = rootEl;

  this._paymentCommon = new Tw.MyTFareBillCommon(rootEl); // 납부할 회선 선택하는 공통 컴포넌트
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl, true); // x 버튼 클릭 시 alert 띄우는 컴포넌트
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-check-pay')); // validation check
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-check-pay')); // 키패드 이동 클릭 시 다음 input으로 이동

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;

  this._init();
};

Tw.MyTFareBillPoint.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {
    this.$pointSelector = this.$container.find('.fe-select-point');
    this.$point = this.$container.find('.fe-point');
    this.$pointPw = this.$container.find('.fe-point-pw');
    this.$getPointBtn = this.$container.find('.fe-get-point-wrapper');
    this.$pointBox = this.$container.find('.fe-point-box');
    this.$payBtn = this.$container.find('.fe-check-pay');
    this.$isValid = false;
    this.$isChanged = false;

    this._pointCardNumber = null;
    this._isPaySuccess = false;
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-get-point', $.proxy(this._openGetPoint, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._checkNumber, this));
    this.$container.on('blur', '.fe-point', $.proxy(this._checkValidation, this));
    this.$container.on('blur', '.fe-point-pw', $.proxy(this._checkPassword, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-select-point', $.proxy(this._selectPoint, this));
    this.$container.on('click', '.fe-find-password', $.proxy(this._goCashbagSite, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
    this.$payBtn.click(_.debounce($.proxy(this._checkPay, this), 500)); // 납부확인
  },
  _openGetPoint: function (e) {
    new Tw.MyTFareBillGetPoint(this.$container, $.proxy(this._setPointInfo, this), e); // 포인트 조회 공통 컴포넌트 호출
  },
  _setPointInfo: function (result) {
    this.$container.find('.fe-cashbag-point').attr('id', result.availPt)
      .text(Tw.FormatHelper.addComma(result.availPt.toString())); // 조회 후 cashbag point
    this.$container.find('.fe-t-point').attr('id', result.availTPt)
      .text(Tw.FormatHelper.addComma(result.availTPt.toString())); // 조회 후 tpoint
    this._pointCardNumber = result.ocbCcno;

    this.$getPointBtn.hide();
    this.$pointBox.show();
  },
  _checkIsAbled: function () {
    if (this.$point.val() !== '' && this.$pointPw.val() !== '') {
      this.$container.find('.fe-check-pay').removeAttr('disabled');
    } else {
      this.$container.find('.fe-check-pay').attr('disabled', 'disabled');
    }
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target); // 숫자만 입력
  },
  _selectPoint: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_POINT_LIST,
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
    $target.attr({
      'id': $selectedValue.attr('id'),
      'data-code': $selectedValue.attr('data-code')
    });
    $target.text($selectedValue.parents('label').text());

    this._popupService.close();
  },
  _goCashbagSite: function () {
    Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.OKCASHBAG);
  },
  _onClose: function () {
    this._backAlert.onClose();
  },
  _checkPay: function () {
    // 모든 유효성 검증 후 납부내역 확인 풀팝업 load
    if (this._validationService.isAllValid()) {
      this._popupService.open({
          'hbs': 'MF_01_01_01',
          'title': Tw.MYT_FARE_PAYMENT_NAME.OK_CASHBAG,
          'unit': Tw.CURRENCY_UNIT.POINT
        },
        $.proxy(this._openCheckPay, this),
        $.proxy(this._afterPaySuccess, this),
        'check-pay'
      );
    }
  },
  _openCheckPay: function ($layer) {
    this._setData($layer);
    this._paymentCommon.getListData($layer);
    this._payBtn = $layer.find('.fe-pay');

    $layer.on('click', '.fe-popup-close', $.proxy(this._checkClose, this));
    this._payBtn.click(_.debounce($.proxy(this._pay, this), 500)); // 납부하기
  },
  _setData: function ($layer) {
    // 납부내역 확인 팝업에 데이터 셋팅
    $layer.find('.fe-check-title').text(this.$pointSelector.text());
    $layer.find('.fe-payment-option-name').attr('data-code', this.$pointSelector.attr('data-code'))
      .text(this._pointCardNumber);
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this.$point.val().toString()));

    $layer.find('.refund-pament-account').hide();
  },
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete');
    } else if (this._isPayFail) {
      Tw.Error(this._err.code, this._err.msg).pop();
    }
  },
  _checkValidation: function () {
    var $isSelectedPoint = this.$pointSelector.attr('id');
    var className = '.fe-cashbag-point';
    if ( $isSelectedPoint === Tw.PAYMENT_POINT_VALUE.T_POINT ) {
      className = '.fe-t-point';
    }

    var isValid = false;
    var $message = this.$point.parent().siblings('.fe-error-msg');
    $message.empty();

    if (!this._validation.checkIsAvailablePoint(this.$point.val(),
        parseInt(this.$pointBox.find(className).attr('id'), 10))) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V27); // 보유 포인트 이상 입력
    } else if (!this._validation.checkIsMore(this.$point.val(), 1000)) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V8); // 1,000 포인트 이상 입력
    } else if (!this._validation.checkIsTenUnit(this.$point.val())) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.TEN_POINT); // 10포인트 단위로 입력
    } else {
      isValid = true;
    }

    this.$isValid = this._validation.showAndHideErrorMsg(this.$point, isValid); // 에러메시지
  },
  _checkPassword: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 6));
  },
  _checkClose: function () {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.TITLE,
      $.proxy(this._closePop, this), $.proxy(this._afterClose, this), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.BUTTON);
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.close();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.resetHistory(-2);
    }
  },
  _pay: function (e) {
    var reqData = this._makeRequestData();
    var $target = $(e.currentTarget);

    // 포인트 요금납부
    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_07_0087, reqData)
      .done($.proxy(this._paySuccess, this, $target))
      .fail($.proxy(this._payFail, this, $target));
  },
  _makeRequestData: function () {
    // 요청 파라미터
    var reqData = {
      ocbCcno: this._pointCardNumber,
      ptClCd: this.$container.find('.fe-payment-option-name').attr('data-code'),
      point: $.trim(this.$point.val().toString().replace(',', '')),
      pwd: $.trim(this.$pointPw.val().toString()),
      count: this._paymentCommon.getBillList().length,
      contents: this._paymentCommon.getBillList()
    };
    return reqData;
  },
  _paySuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.container');
      this._isPaySuccess = true;
      this._popupService.close();
    } else {
      this._payFail($target, res);
    }
  },
  _payFail: function ($target, err) {
    Tw.CommonHelper.endLoading('.container');
    this._isPayFail = true;
    this._err = {
      code: err.code,
      msg: err.msg
    };
    this._popupService.close();
  }
};