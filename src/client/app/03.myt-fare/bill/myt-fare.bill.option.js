/**
 * @file myt-fare.bill.option.js
 * @author Jayoon Kong
 * @since 2018.10.02
 * @desc 자동납부 방법 조회
 */

/**
 * @namespace
 * @desc 자동납부방법 조회 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTFareBillOption = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillOption.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    if( !Tw.Environment.init ) { // After call CDN
      $(window).on(Tw.INIT_COMPLETE, $.proxy(this._checkIsAfterChange, this));
    } else {
      this._checkIsAfterChange();
    }
    this._bindEvent();
  },
  /**
   * @function
   * @desc 다른 화면에서 자동납부 신청 및 변경 등의 작업 후 toast 노출 필요 시 쿼리스트링으로 해당 정보 보내온 값(type) 처리
   */
  _checkIsAfterChange: function () {
    var type = Tw.UrlHelper.getQueryParams().type;
    if (type) {
      var message = '';

      if (type === 'new' || type === 'sms') {
        message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_NEW; // 신청이 완료되었습니다.
      }
      if (type === 'change') {
        message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE; // 변경이 완료되었습니다.
      }

      if (!this._isBackOrReload() && message !== '') { // back key나 새로고침이 아닌 경우 토스트 노출
        this._commonHelper.toast(message);
      }
    }
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-auto', $.proxy(this._goAutoPayment, this));
    this.$container.on('click', '.fe-cancel', $.proxy(this._cancelAutoPayment, this));
    this.$container.on('click', '.fe-change-date', $.proxy(this._changePaymentDate, this));
    this.$container.on('click', '.fe-change-address', $.proxy(this._changeAddress, this));
  },
  /**
   * @function
   * @desc 자동납부 신청/변경 페이지로 이동
   */
  _goAutoPayment: function () {
    this._historyService.goLoad('/myt-fare/bill/option/register');
  },
  /**
   * @function
   * @desc 자동납부 해지 페이지로 이동
   */
  _cancelAutoPayment: function () {
    this._historyService.goLoad('/myt-fare/bill/option/cancel');
  },
  /**
   * @function
   * @desc 현재 계좌이체 자동납부 시 요금납부일 변경 가능 - 요금납부일 변경 actionsheet load
   * @param event
   */
  _changePaymentDate: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_BANK_DATE,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectDatePopupCallback, this, $target), null, null, $target);
  },
  /**
   * @function
   * @desc actionsheet event binding
   * @param $target
   * @param $layer
   */
  _selectDatePopupCallback: function ($target, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성

    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input[data-value="' + $id + '"]').attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedDate, this));
  },
  /**
   * @function
   * @desc 계좌이체 요금납부일 변경 API 호출
   * @param event
   */
  _setSelectedDate: function (event) {
    var $selectedValue = $(event.target);
    var code = $selectedValue.attr('id');
    var date = $selectedValue.parents('label').text().replace(Tw.PERIOD_UNIT.DAYS, '');

    this._apiService.request(Tw.API_CMD.BFF_07_0065, { payCyClCd: code })
      .done($.proxy(this._changeSuccess, this, date, $selectedValue))
      .fail($.proxy(this._changeFail, this, $selectedValue));

    this._popupService.close();
  },
  /**
   * @function
   * @desc 계좌이체 요금납부일 변경 API 응답 처리 (성공)
   * @param date
   * @param $target
   * @param res
   */
  _changeSuccess: function (date, $target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$container.find('.fe-pay-date').text(date);
      this.$container.find('.fe-change-date').hide();

      this._commonHelper.toast(Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE_DATE); // 변경 성공
    } else {
      this._changeFail($target, res);
    }
  },
  /**
   * @function
   * @desc 계좌이체 요금납부일 변경 API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _changeFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  /**
   * @function
   * @desc 지로/입금전용계좌 납부 시 주소 및 연락처변경 화면 이동
   */
  _changeAddress: function () {
    this._historyService.goLoad('/myt-fare/bill/option/change-address');
  },
  /**
   * @function
   * @desc 새로고침 또는 뒤로가기 여부 체크
   * @returns {boolean}
   */
  _isBackOrReload: function () {
    if (window.performance) {
      if (performance.navigation.type === 1 || performance.navigation.type === 2) {
        return true;
      }
    }
  }
};