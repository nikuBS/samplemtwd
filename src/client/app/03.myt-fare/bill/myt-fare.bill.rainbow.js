/**
 * @file myt-fare.bill.rainbow.js
 * @author Jayoon Kong
 * @since 2018.11.7
 * @desc 레인보우포인트 1회 요금납부 예약 및 자동납부 관리
 */

/**
 * @function
 * @desc 레인보우포인트 1회납부 및 자동납부 예약 namespace
 * @param rootEl - dom 객체
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
  /**
   * @function
   * @desc init
   */
  _init: function () {
    this.$isOneSelectValid = false;
    this.$isAutoSelectValid = false;
    this.$isPointValid = false;

    this._initVariables('tab1'); // 최초 1회납부 탭으로 initialize
    this._bindEvent();
  },
  /**
   * @function
   * @desc initialize variables
   * @param $targetId - 선택된 tab id
   */
  _initVariables: function ($targetId) {
    this.$standardPoint = this.$container.find('.fe-standard-point');
    this.$autoInfo = this.$container.find('.fe-auto-info');
    this.$selectedTab = this.$container.find('#' + $targetId + '-tab');
    this.$fareSelector = this.$selectedTab.find('.fe-select-fare');
    this.$point = this.$selectedTab.find('.fe-point');
    this.$payBtn = this.$container.find('.fe-' + $targetId + '-pay');
    this.$onePayBtn = this.$container.find('.fe-tab1-pay');
    this.$autoPayBtn = this.$container.find('.fe-tab2-pay');
    this.$isSelectValid = true;

    this.$payBtn.show();
    this.$payBtn.siblings().hide();
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-tab-selector > li', $.proxy(this._changeTab, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$container.on('keyup', '.required-input-field', $.proxy(this._checkNumber, this));
    this.$container.on('blur', '.fe-point', $.proxy(this._checkPoint, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$container.on('click', '.fe-select-fare', $.proxy(this._selectFare, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._cancel, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
    this.$onePayBtn.click(_.debounce($.proxy(this._onePay, this), 500));
    this.$autoPayBtn.click(_.debounce($.proxy(this._autoPay, this), 500));
  },
  /**
   * @function
   * @desc change tab event (1회납부/자동납부 탭 change)
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
   * @desc 버튼 활성화 처리
   */
  _checkIsAbled: function () {
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
  /**
   * @function
   * @desc 숫자만 입력 가능
   * @param event
   */
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  /**
   * @function
   * @desc 자동납부 해지
   * @param e
   */
  _cancel: function (e) {
    var $target = $(e.currentTarget);
    // 자동납부 해지 시 확인 팝업
    this._popupService.openConfirmButton('', Tw.ALERT_MSG_MYT_FARE.ALERT_2_A77.TITLE,
      $.proxy(this._onCancel, this), $.proxy(this._autoCancel, this, $target), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A77.BUTTON, $(e.currentTarget));
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
      this._apiService.request(Tw.API_CMD.BFF_07_0056, { rbpChgRsnCd: 'T1' })
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
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=rainbow&type=cancel'); // 해지 완료 페이지로 이동
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc 납부대상 actionsheet 생성
   * @param event
   */
  _selectFare: function (event) {
    var $target = $(event.currentTarget);

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_RAINBOW,
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target), null, null, $target);
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
    $layer.on('click', '.fe-popup-close', $.proxy(this._checkSelected, this));
  },
  /**
   * @function
   * @desc 선택된 값 처리
   * @param $target
   * @param event
   */
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($.trim($selectedValue.parents('label').text()));

    this.$fareSelector.parent().siblings('.fe-error-msg').hide().attr('aria-hidden', 'true');
    this._setSelectorValidation(true);

    this._checkIsAbled();
    this._popupService.close();
  },
  /**
   * @function
   * @desc validation 대상 셋팅
   * @param isValid
   */
  _setSelectorValidation: function (isValid) {
    if (this.$selectedTab.attr('id') === 'tab1-tab') {
      this.$isOneSelectValid = isValid; // 1회납부 유효성 검증결과
    } else {
      this.$isAutoSelectValid = isValid; // 자동납부 유효성 검증결과
    }
  },
  /**
   * @function
   * @desc 선택된 값이 있는지 체크
   */
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$fareSelector.attr('id'))) {
      this.$fareSelector.parent().siblings('.fe-error-msg').show().attr('aria-hidden', 'false');
      this.$fareSelector.focus();
      this._setSelectorValidation(false);
    }
    this._popupService.close();
  },
  /**
   * @function
   * @desc point validation check
   */
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
    } else {
      isValid = true;
    }

    this.$isPointValid = this._validation.showAndHideErrorMsg(this.$point, isValid); // validation message
  },
  /**
   * @function
   * @desc 1회 납부 API 호출
   * @param e
   */
  _onePay: function (e) {
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
  /**
   * @function
   * @desc 자동납부 API 호출
   * @param e
   */
  _autoPay: function (e) {
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
  /**
   * @function
   * @desc 납부 API 응답 처리
   * @param $target
   * @param type
   * @param res
   */
  _paySuccess: function ($target, type, res) {
    if (res.code === Tw.API_CODE.CODE_00) { // 납부예약 완료
      this._historyService.replaceURL('/myt-fare/bill/point-complete?title=rainbow&type=' + type +
        '&point=' + this._getPointValue(type) + '&add=' + this.$fareSelector.attr('id'));
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc get point value
   * @param type
   * @returns {string}
   */
  _getPointValue: function (type) {
    var point = $.trim(this.$point.val());
    if (type === 'auto') {
      point = '';
    }
    return point;
  },
  /**
   * @function
   * @desc API error 처리
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  /**
   * @function
   * @desc 요청 파라미터 생성 (1회납부예약)
   * @returns {{reqRbpPt: string, prodId}}
   */
  _makeRequestDataForOne: function () {
    var reqData = {
      reqRbpPt: $.trim(this.$point.val()),
      prodId: this.$fareSelector.attr('id')
    };
    return reqData;
  },
  /**
   * @function
   * @desc 요청 파라미터 생성 (자동납부예약)
   * @returns {{prodId, rbpChgRsnCd: string}}
   */
  _makeRequestDataForAuto: function () {
    var reqData = {
      prodId: this.$fareSelector.attr('id'),
      rbpChgRsnCd: 'A1'
    };
    return reqData;
  },
  /**
   * @function
   * @desc x 버튼 클릭 시 공통 confirm 노출
   */
  _onClose: function () {
    this._backAlert.onClose();
  }
};
