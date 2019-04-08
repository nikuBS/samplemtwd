/**
 * @file myt-fare.bill.cashbag.tpoint.js
 * @author Jayoon Kong
 * @since 2018.11.7
 * @desc OK cashbag 및 Tpoint 1회 예약납부 및 자동납부 관리
 */

/**
 * @namespace
 * @desc OK cashbag, T포인트 1회납부 및 자동납부예약 namespace
 * @param rootEl - dom 객체
 * @param pointType - cashbag/tpoint
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
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-pay:visible'));

  this._init();
};

Tw.MyTFareBillCashbagTpoint.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    this.$isOneValid = false;
    this.$isAutoValid = true;
    this.$isAutoCardValid = true;
    this.$isSelectValid = false;

    this._initVariables('tab1');
    this._bindEvent();
  },
  /**
   * @function
   * @desc initialize variables
   * @param $targetId - 선택된 tab id
   */
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
    this.$onePayBtn = this.$container.find('.fe-tab1-pay');
    this.$autoPayBtn = this.$container.find('.fe-tab2-pay');

    this.$payBtn.show();
    this.$payBtn.siblings().hide();
  },
  /**
   * @function
   * @desc event binding
   */
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
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
    this.$onePayBtn.click(_.debounce($.proxy(this._onePay, this), 500));
    this.$autoPayBtn.click(_.debounce($.proxy(this._autoPay, this), 500));
  },
  /**
   * @function
   * @desc 포인트 조회하기 공통 컴포넌트 호출
   * @param e
   */
  _openGetPoint: function (e) {
    new Tw.MyTFareBillGetPoint(this.$container, $.proxy(this._setPointInfo, this), e);
  },
  /**
   * @function
   * @desc 포인트 조회 후 데이터 셋팅
   * @param result
   */
  _setPointInfo: function (result) {
    var $point = 0;
    if (this.$pointType === 'CPT') {
      $point = result.availPt; // ok cashbag point
    } else {
      $point = result.availTPt; // tpoint
    }

    this.$standardPoint.attr('id', $point).text(Tw.FormatHelper.addComma($point)); // 보유한 포인트
    this.$pointCardNumber.val(result.ocbCcno).attr('readonly', true); // 서버에서 조회된 카드번호
    this.$selectedTab.siblings().find('.fe-point-card').val(result.ocbCcno).attr('readonly', true);
    this.$isAutoCardValid = true;

    this.$pointWrap.removeClass('none');
    this.$getPointBtn.hide();
    this.$pointInfo.show();
  },
  /**
   * @function
   * @desc tab change event
   * @param event
   */
  _changeTab: function (event) {
    var $target = $(event.currentTarget);
    $target.find('button').attr('aria-selected', 'true');
    $target.siblings().find('button').attr('aria-selected', 'false');

    var $targetId = $target.attr('id');
    this._initVariables($targetId);
    this._checkIsAbled();
  },
  /**
   * @function
   * @desc 입력 필드 체크 후 버튼 활성화
   */
  _checkIsAbled: function () {
    if (this.$selectedTab.attr('id') === 'tab1-tab') { // 1회 납부 예약
      if (($.trim(this.$point.val()) !== '') && ($.trim(this.$pointCardNumber.val()) !== '') &&
        ($.trim(this.$pointPw.val()) !== '') && (this.$agree.is(':checked'))) {
        this.$payBtn.removeAttr('disabled');
      } else {
        this.$payBtn.attr('disabled', 'disabled');
      }
    } else { // 자동납부 예약
      if ((this.$pointSelector.attr('id') !== this.$pointSelector.attr('data-origin-id')) &&
        ($.trim(this.$pointCardNumber.val()) !== '') &&
        (this.$agree.is(':checked'))) {
        this.$payBtn.removeAttr('disabled');
      } else {
        this.$payBtn.attr('disabled', 'disabled');
      }
    }
  },
  /**
   * @function
   * @desc 숫자만 입력
   * @param event
   */
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target); // 숫자만 입력 가능
  },
  /**
   * @function
   * @desc point validation check
   */
  _checkPoint: function () {
    var isValid = false;
    var $message = this.$point.parent().siblings('.fe-error-msg');
    $message.empty();

    if (this.$pointWrap.hasClass('none')) {
      $message.text(Tw.ALERT_MSG_MYT_FARE.GET_POINT); // 포인트를 조회해 주세요.
    } else {
      if (!this._validation.checkEmpty(this.$point.val())) {
        $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V65); // 납부할 포인트를 입력해 주세요.
      } else if (!this._validation.checkIsMore(this.$point.val(), 1000)) {
        $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V8); // 1,000포인트 이상 입력해 주세요.
      } else if (!this._validation.checkIsAvailablePoint(this.$point.val(),
          this.$standardPoint.attr('id'))) {
        $message.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V27); // 보유 포인트보다 초과 입력했습니다.
      } else if (!this._validation.checkIsTenUnit(this.$point.val())) {
        $message.text(Tw.ALERT_MSG_MYT_FARE.TEN_POINT); // 10포인트 단위로 입력해 주세요.
      } else {
        isValid = true;
      }
    }

    this.$isOneValid = this._validation.showAndHideErrorMsg(this.$point, isValid); // validation check message
  },
  /**
   * @function
   * @desc 카드번호 입력 및 자릿수 체크
   * @param event
   */
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
  /**
   * @function
   * @desc 비밀번호 입력 및 자릿수 체크
   * @param event
   */
  _checkPassword: function (event) {
    var $target = $(event.currentTarget);
    this.$isOneValid = this._validation.showAndHideErrorMsg($target, this._validation.checkEmpty($target.val()), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V58) &&
      this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 6), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V7);
  },
  /**
   * @function
   * @desc 자동납부 해지
   * @param e
   */
  _cancel: function (e) {
    var $target = $(e.currentTarget);
    this._popupService.openConfirmButton('', Tw.ALERT_MSG_MYT_FARE.ALERT_2_A77.TITLE, // 자동납부 해지 확인 팝업창
      $.proxy(this._onCancel, this), $.proxy(this._autoCancel, this, $target), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A77.BUTTON, $target);
  },
  /**
   * @function
   * @desc 해지 확인
   */
  _onCancel: function () {
    this._isCancel = true;
    this._popupService.close();
  },
  /**
   * @function
   * @desc 해지 API 호출
   * @param $target
   */
  _autoCancel: function ($target) {
    if (this._isCancel) {
      this._apiService.request(Tw.API_CMD.BFF_07_0054, {reqClCd: '3', ptClCd: this.$pointType})
        .done($.proxy(this._cancelSuccess, this, $target))
        .fail($.proxy(this._fail, this, $target));
    }
  },
  /**
   * @function
   * @desc 해지 API 응답 처리
   * @param $target
   * @param res
   */
  _cancelSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=' + this.$pointType + '&type=cancel');
    } else {
      this._fail($target, res);
    }
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
      data: this._getData(),
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target), null, null, $target);
  },
  /**
   * @function
   * @desc get point selectbox
   * @returns {{list: *[]}[]}
   */
  _getData: function () {
    if (this.$pointType === 'CPT') {
      return Tw.POPUP_TPL.FARE_PAYMENT_POINT; // ok cashbag point
    }
    return Tw.POPUP_TPL.FARE_PAYMENT_TPOINT; // tpoint
  },
  /**
   * @function
   * @desc actionsheet event binding
   * @param $target
   * @param $layer
   */
  _selectPopupCallback: function ($target, $layer) {
    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
    $layer.on('click', '.fe-popup-close', $.proxy(this._checkSelected, this));
  },
  /**
   * @function
   * @desc 선택된 값 셋팅
   * @param $target
   * @param event
   */
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($.trim($selectedValue.parents('label').text()));

    this.$pointSelector.parent().siblings('.fe-error-msg').hide().attr('aria-hidden', 'true');
    this.$isSelectValid = true;

    this._checkIsAbled();
    this._popupService.close();
  },
  /**
   * @function
   * @desc 선택된 값이 있는지 체크
   */
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$pointSelector.attr('id'))) {
      this.$pointSelector.parent().siblings('.fe-error-msg').show().attr('aria-hidden', 'false');
      this.$pointSelector.focus();
      this.$isSelectValid = false;
    }
    this._popupService.close();
  },
  /**
   * @function
   * @desc 비밀번호 찾기 (OK cashbag site로 이동)
   */
  _goCashbagSite: function () {
    Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.OKCASHBAG);
  },
  /**
   * @function
   * @desc 개인정보 제공동의 팝업
   * @param event
   */
  _openAgreePop: function (event) {
    event.stopPropagation();
    this._popupService.open({
      hbs: 'MF_01_05_L01'
    },
      $.proxy(this._setClickEvent, this),
      $.proxy(this._setCheck, this),
      'agree',
      $(event.currentTarget));
  },
  /**
   * @function
   * @desc 동의 버튼 클릭 처리
   * @param $layer
   */
  _setClickEvent: function ($layer) {
    $layer.on('click', '.fe-agree-btn', $.proxy(this._agree, this));
  },
  /**
   * @function
   * @desc 동의 버튼 클릭 시 팝업 닫기
   */
  _agree: function () {
    this.$isAgree = true;
    this._popupService.close();
  },
  /**
   * @function
   * @desc 동의 버튼 클릭 시 부모페이지의 체크박스에도 클릭 처리
   */
  _setCheck: function () {
    if (this.$isAgree) {
      if (!this.$agree.is(':checked')) {
        this.$agree.trigger('click');
      }
    }
    this.$isAgree = false;
  },
  /**
   * @function
   * @desc 포인트 1회납부 예약 API 호출
   * @param e
   */
  _onePay: function (e) {
    var $target = $(e.currentTarget);
    if (this._validationService.isAllValid()) {
      if (this.$isOneValid) {
        var reqData = this._makeRequestDataForOne();
        this._apiService.request(Tw.API_CMD.BFF_07_0045, reqData)
          .done($.proxy(this._paySuccess, this, $target, ''))
          .fail($.proxy(this._fail, this, $target));
      }
    }
  },
  /**
   * @function
   * @desc 포인트 자동납부 예약 API 호출
   * @param e
   */
  _autoPay: function (e) {
    var $target = $(e.currentTarget);
    if (this._validationService.isAllValid()) {
      if (this.$isAutoValid && this.$isAutoCardValid && this.$isSelectValid) {
        var reqData = this._makeRequestDataForAuto();
        var type = 'auto';
        if (this.$autoInfo.is(':visible')) {
          type = 'change';
        }
        this._apiService.request(Tw.API_CMD.BFF_07_0054, reqData)
          .done($.proxy(this._paySuccess, this, $target, type))
          .fail($.proxy(this._fail, this, $target));
      }
    }
  },
  /**
   * @function
   * @desc API 응답 처리 (성공)
   * @param $target
   * @param type
   * @param res
   */
  _paySuccess: function ($target, type, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var point = this._getPointValue(type);
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=' +
        this.$pointType + '&type=' + type + '&point=' + point);
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc get point id
   * @param type
   * @returns {string}
   */
  _getPointValue: function (type) {
    var point = $.trim(this.$point.val());
    if (type === 'auto' || type === 'change') {
      point = this.$pointSelector.attr('id');
    }
    return point;
  },
  /**
   * @function
   * @desc API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    if (err.code === 'BIL0006') {
      this._popupService.openAlert(err.msg, Tw.POPUP_TITLE.NOTIFY, null, null, null, $target);
    } else {
      Tw.Error(err.code, err.msg).pop(null, $target);
    }
  },
  /**
   * @function
   * @desc 요청 파라미터 생성 (1회납부)
   * @returns {{ocbCcno: string, ptClCd: *, reqAmt: string, ocbPwd: string}}
   */
  _makeRequestDataForOne: function () {
    var reqData = {
      ocbCcno: $.trim(this.$pointCardNumber.val()),
      ptClCd: this.$pointType,
      reqAmt: $.trim(this.$point.val()),
      ocbPwd: $.trim(this.$pointPw.val())
    };
    return reqData;
  },
  /**
   * @function
   * @desc 요청 파라미터 생성 (자동납부)
   * @returns {{reqClCd: *|number, reqAmt, ptClCd: *, ocbCcno: string}}
   */
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
  /**
   * @function
   * @desc get auto type
   * @returns {number}
   */
  _getAutoType: function () {
    if (this.$autoInfo.is(':visible')) {
      return 2;
    }
    return 1;
  },
  /**
   * @function
   * @desc x 버튼 클릭 시 공통 confirm 노출
   */
  _onClose: function () {
    this._backAlert.onClose();
  }
};