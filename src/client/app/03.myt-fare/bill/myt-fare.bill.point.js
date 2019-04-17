/**
 * @file myt-fare.bill.point.js
 * @author Jayoon Kong
 * @since 2018.09.17
 * @desc 포인트 요금납부
 */

/**
 * @namespace
 * @desc 포인트 요금납부 namespace
 * @param rootEl - dom 객체
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
  /**
   * @function
   * @desc init
   */
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  /**
   * @function
   * @desc initialize variables
   */
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
  /**
   * @function
   * @desc event binding
   */
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
  /**
   * @function
   * @desc 포인트 조회 공통 컴포넌트 호출
   * @param e
   */
  _openGetPoint: function (e) {
    new Tw.MyTFareBillGetPoint(this.$container, $.proxy(this._setPointInfo, this), e);
  },
  /**
   * @function
   * @desc 조회된 포인트 정보 셋팅
   * @param result
   */
  _setPointInfo: function (result) {
    this.$container.find('.fe-cashbag-point').attr('id', result.availPt)
      .text(Tw.FormatHelper.addComma(result.availPt.toString())); // 조회 후 cashbag point
    this.$container.find('.fe-t-point').attr('id', result.availTPt)
      .text(Tw.FormatHelper.addComma(result.availTPt.toString())); // 조회 후 tpoint
    this._pointCardNumber = result.ocbCcno;

    this.$getPointBtn.hide();
    this.$pointBox.show();
  },
  /**
   * @function
   * @desc 버튼 활성화 처리
   */
  _checkIsAbled: function () {
    if (this.$point.val() !== '' && this.$pointPw.val() !== '') {
      this.$container.find('.fe-check-pay').removeAttr('disabled');
    } else {
      this.$container.find('.fe-check-pay').attr('disabled', 'disabled');
    }
  },
  /**
   * @function
   * @desc 숫자만 입력
   * @param event
   */
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  /**
   * @function
   * @desc select point actionsheet
   * @param event
   */
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
  /**
   * @function
   * @desc actionsheet event binding
   * @param $target
   * @param $layer
   */
  _selectPopupCallback: function ($target, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성

    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
  },
  /**
   * @function
   * @desc 선택된 값 셋팅
   * @param $target
   * @param event
   */
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr({
      'id': $selectedValue.attr('id'),
      'data-code': $selectedValue.attr('data-code')
    });
    $target.text($selectedValue.parents('label').text());

    this._popupService.close();
  },
  /**
   * @function
   * @desc 비밀번호찾기 (OK cashbag site로 이동)
   */
  _goCashbagSite: function () {
    Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.OKCASHBAG);
  },
  /**
   * @function
   * @desc x 버튼 클릭 시 공통 confirm 노출
   */
  _onClose: function () {
    this._backAlert.onClose();
  },
  /**
   * @function
   * @desc 모든 유효성 검증 후 납부내역 확인 풀팝업 load
   */
  _checkPay: function () {
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
  /**
   * @function
   * @desc 납부내역 확인 팝업 event 및 data 처리
   * @param $layer
   */
  _openCheckPay: function ($layer) {
    this._setData($layer);
    this._paymentCommon.getListData($layer);
    this._payBtn = $layer.find('.fe-pay');

    $layer.on('click', '.fe-popup-close', $.proxy(this._checkClose, this));
    this._payBtn.click(_.debounce($.proxy(this._pay, this), 500)); // 납부하기
  },
  /**
   * @function
   * @desc 납부내역 확인 팝업에 데이터 셋팅
   * @param $layer
   */
  _setData: function ($layer) {
    $layer.find('.fe-check-title').text(this.$pointSelector.text());
    $layer.find('.fe-payment-option-name').attr('data-code', this.$pointSelector.attr('data-code'))
      .text(this._pointCardNumber);
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this.$point.val().toString()));

    $layer.find('.refund-pament-account').hide();
  },
  /**
   * @function
   * @desc 납부 완료 및 에러 처리
   */
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete');
    } else if (this._isPayFail) {
      Tw.Error(this._err.code, this._err.msg).pop();
    }
  },
  /**
   * @function
   * @desc 필수 입력값 유효성 검증
   */
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
  /**
   * @function
   * @desc password validation check
   * @param event
   */
  _checkPassword: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 6));
  },
  /**
   * @function
   * @desc 요금납부 종료 confirm
   */
  _checkClose: function () {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.TITLE,
      $.proxy(this._closePop, this), $.proxy(this._afterClose, this), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.BUTTON);
  },
  /**
   * @function
   * @desc close popup
   */
  _closePop: function () {
    this._isClose = true;
    this._popupService.close();
  },
  /**
   * @function
   * @desc close 이후 원래 페이지로 돌아가기
   */
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.resetHistory(-2);
    }
  },
  /**
   * @function
   * @desc 포인트 요금납부 API 호출
   * @param e
   */
  _pay: function (e) {
    var reqData = this._makeRequestData();
    var $target = $(e.currentTarget);

    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_07_0087, reqData)
      .done($.proxy(this._paySuccess, this, $target))
      .fail($.proxy(this._payFail, this, $target));
  },
  /**
   * @function
   * @desc 요청 파라미터 생성
   * @returns {{ocbCcno: null|*, ptClCd, point: string, pwd: string, count: number, contents: *|Array}}
   */
  _makeRequestData: function () {
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
  /**
   * @function
   * @desc pay API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _paySuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._isPaySuccess = true;
      this._popupService.close();
    } else {
      this._payFail($target, res);
    }
  },
  /**
   * @function
   * @desc pay API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _payFail: function ($target, err) {
    Tw.CommonHelper.endLoading('.popup-page');
    this._isPayFail = true;
    this._err = {
      code: err.code,
      msg: err.msg
    };
    this._popupService.close();
  }
};