/**
 * @file myt.fare.bill.prepay.change.limit.js
 * @author Jayoon Kong
 * @since 2018.10.09
 * @desc 소액결제/콘텐츠이용료 한도변경
 */

/**
 * @namespace
 * @desc 소액결제/콘텐츠이용료 한도변경 namespace
 * @param rootEl - dom 객체
 * @param title - 소액결제/콘텐츠이용료
 * @param $target - 현재 객체를 호출한 엘리먼트(ex: button)의 currentTarget
 */
Tw.MyTFareBillPrepayChangeLimit = function (rootEl, title, $target) {
  this.$container = rootEl;
  this.$title = title;
  this.$target = $target;
  this.$isClicked = false;
  this._isUnpaid = 'N';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._historyService = new Tw.HistoryService(rootEl);
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-change'));
  this._init();
};

Tw.MyTFareBillPrepayChangeLimit.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    this._getLimit();

    this.$monthSelector = null;
    this.$daySelector = null;
    this.$onceSelector = null;
  },
  /**
   * @function
   * @desc 한도 조회 API 호출
   */
  _getLimit: function () {
    var $target = this.$container.find('.tw-popup-closeBtn');
    var apiName = this._getLimitApiName();

    this._apiService.request(apiName, {})
      .done($.proxy(this._getLimitSuccess, this, $target))
      .fail($.proxy(this._fail, this, $target));
  },
  /**
   * @function
   * @desc 한도조회 api name 조회
   * @returns {string}
   */
  _getLimitApiName: function () {
    var apiName = '';
    if (this.$title === 'small') {
      apiName = Tw.API_CMD.BFF_05_0080; // 소액결제
    } else {
      apiName = Tw.API_CMD.BFF_05_0066; // 콘텐츠이용료
    }
    return apiName;
  },
  /**
   * @function
   * @desc 한도조회 API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _getLimitSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._isUnpaid = res.result.isUnpaid;
      this._changeLimit(res.result);
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc 한도조회 API 응답 처리 (실패)
   */
  _getLimitFail: function () {
    this._popupService.openOneBtTypeB(
      Tw.ALERT_MSG_MYT_FARE.NOT_ALLOWED_CHANGE_LIMIT,
      Tw.ALERT_MSG_MYT_FARE.NOT_ALLOWED_INFO_MESSAGE,
      [{
        style_class: 'fe-payment',
        txt: Tw.ALERT_MSG_MYT_FARE.GO_PAYMENT
      }],
      'type1',
      $.proxy(this._openLimitFail, this),
      null
    );
  },
  /**
   * @function
   * @desc 한도조회 실패 시 처리
   * @param $layer
   */
  _openLimitFail: function ($layer) {
    $layer.on('click', '.fe-payment', $.proxy(this._goSubmain, this));
  },
  /**
   * @function
   * @desc 서브메인 페이지로 이동
   */
  _goSubmain: function () {
    this._historyService.replaceURL('/myt-fare/submain');
  },
  /**
   * @function
   * @desc 한도변경 팝업 load
   * @param result
   */
  _changeLimit: function (result) {
    var hbsName = 'MF_06_02'; // 소액결제 한도변경
    if (this.$title === 'contents') {
      hbsName = 'MF_07_02'; // 콘텐츠이용료 한도변경
    }
    this._popupService.open({
      'hbs': hbsName
    }, $.proxy(this._openChangeLimit, this, result), null, 'change-limit', this.$target); // 한도변경 팝업
  },
  /**
   * @function
   * @desc 한도변경 팝업 load 후 init
   * @param result
   * @param $layer
   */
  _openChangeLimit: function (result, $layer) {
    this._initLayerVar($layer);
    this._setLimitData(result, $layer);
    this._setLimitEvent($layer);
  },
  /**
   * @function
   * @desc initialize variable
   * @param $layer
   */
  _initLayerVar: function ($layer) {
    this.$changeBtn = $layer.find('.fe-change');
  },
  /**
   * @function
   * @desc 한도 셋팅
   * @param result
   * @param $layer
   */
  _setLimitData: function (result, $layer) {
    this.$monthSelector = $layer.find('.fe-month'); // 월 한도
    this.$daySelector = $layer.find('.fe-day'); // 일 한도
    this.$onceSelector = $layer.find('.fe-once'); // 1회 한도

    var monthLimit = '';
    if (this.$title === 'small') {
      monthLimit = 'microPayLimitAmt'; // 소액결제
    } else {
      monthLimit = 'monLimit'; // 콘텐츠이용료
    }

    this.$monthSelector
      .attr({ 'id': result[monthLimit], 'origin-value': result[monthLimit] })
      .text(this._getLittleAmount(result[monthLimit]));
    this.$daySelector
      .attr({ 'id': result.dayLimit, 'origin-value': result.dayLimit })
      .text(this._getLittleAmount(result.dayLimit));
    this.$onceSelector
      .attr({ 'id': result.onceLimit, 'origin-value': result.onceLimit })
      .text(this._getLittleAmount(result.onceLimit));
  },
  /**
   * @function
   * @desc event binding
   * @param $layer
   */
  _setLimitEvent: function ($layer) {
    $layer.on('click', '.fe-month', $.proxy(this._selectAmount, this));
    $layer.on('click', '.fe-day', $.proxy(this._selectAmount, this));
    $layer.on('click', '.fe-once', $.proxy(this._selectAmount, this));
    this.$changeBtn.click(_.debounce($.proxy(this._openChangeConfirm, this), 500));
  },
  /**
   * @function
   * @desc 금액 list 셋팅
   * @param amount
   * @returns {string}
   */
  _getLittleAmount: function (amount) {
    var defaultValue = 50;
    if (amount > 0) {
      defaultValue = amount / 10000;
    }
    return defaultValue + Tw.CURRENCY_UNIT.TEN_THOUSAND; // 단위 바꿔서 보여주기
  },
  /**
   * @function
   * @desc 금액 list load
   * @param event
   */
  _selectAmount: function (event) {
    var $target = $(event.currentTarget);
    var $amount = $target.attr('id');
    var data = Tw.POPUP_TPL.FARE_PAYMENT_SMALL_LIMIT;
    if (this.$title === 'contents') {
      data = Tw.POPUP_TPL.FARE_PAYMENT_CONTENTS_LIMIT;
    }

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: data,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target, $amount));
  },
  /**
   * @function
   * @desc actionsheet event binding
   * @param $target
   * @param $amount
   * @param $layer
   */
  _selectPopupCallback: function ($target, $amount, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성

    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
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
    $target.text($selectedValue.parents('label').text());

    this._checkIsChanged();
    this._popupService.close();
  },
  /**
   * @function
   * @desc 변경여부 체크 후 버튼 활성화 처리
   */
  _checkIsChanged: function () {
    if (this._isChanged()) {
      this.$changeBtn.removeAttr('disabled');
    } else {
      this.$changeBtn.attr('disabled', 'disabled');
    }
  },
  /**
   * @function
   * @desc 한도변경 확인 confirm
   * @param e
   */
  _openChangeConfirm: function (e) {
    // OP002-2293 : 미납일 경우 한도 하향만 가능
    if (this._isUnpaid === 'Y' && this._checkIsUp()){
      this._getLimitFail();
    } else {
      var $target = $(e.currentTarget);
      this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A96.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A96.TITLE,
        $.proxy(this._onChange, this), $.proxy(this._change, this, $target), Tw.BUTTON_LABEL.CANCEL, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A96.BUTTON,
        $target);
    }
  },
  /**
   * @function
   * @desc 한도변경 확인
   */
  _onChange: function () {
    this.$isChange = true;
    this._popupService.close();
  },
  /**
   * @function
   * @desc 한도변경 API 호출
   * @param $target
   */
  _change: function ($target) {
    if (this.$isChange) {
      var apiName = this._changeLimitApiName();
      var reqData = this._makeRequestData();

      this.$isChanged = parseInt(this.$monthSelector.attr('id'), 10) !== parseInt(this.$monthSelector.attr('origin-value'), 10);

      this._apiService.request(apiName, reqData)
        .done($.proxy(this._changeLimitSuccess, this, $target))
        .fail($.proxy(this._fail, this, $target));
    }
  },
  /**
   * @function
   * @desc 한도변경 api name 조회
   * @returns {string}
   */
  _changeLimitApiName: function () {
    var apiName = '';
    var isUp = this._checkIsUp();

    if (this.$title === 'small') {
      if (isUp) {
        apiName = Tw.API_CMD.BFF_05_0081; // 소액결제 한도 상향
      } else {
        apiName = Tw.API_CMD.BFF_05_0176; // 소액결제 한도 하향
      }
    } else {
      if (isUp) {
        apiName = Tw.API_CMD.BFF_05_0067; // 콘텐츠이용료 한도 상향
      } else {
        apiName = Tw.API_CMD.BFF_05_0177; // 콘텐츠이용료 한도 하향
      }
    }
    return apiName;
  },
  /**
   * @function
   * @desc 한도 상향 여부 확인
   * @returns {boolean}
   */
  _checkIsUp: function () {
    // 2019-07-15 한도 상향 기준(OP002-2290) : "월한도"를 기준으로 함.
    return parseInt(this.$monthSelector.attr('id'), 10) > parseInt(this.$monthSelector.attr('origin-value'), 10);
  },
  /**
   * @function
   * @desc 요청 파라미터 생성
   * @returns {{}}
   */
  _makeRequestData: function () {
    var reqData = {};

    reqData.chgMLimit = this.$monthSelector.attr('id');
    reqData.chgDLimit = this.$daySelector.attr('id');
    reqData.chgOLimit = this.$onceSelector.attr('id');

    // 2019-08-26 OP002-3444 : 소액결제 한도변경(상/하향) 일 때, microPayLimitAmt(월한도) 값 추가됨.
    if (this.$title === 'small') {
      reqData.microPayLimitAmt = this.$monthSelector.attr('origin-value');
    }

    return reqData;
  },
  /**
   * @function
   * @desc 한도변경 API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _changeLimitSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (this.$isChanged) {
        this._setRemainAmount();
      }
      this._popupService.close();
      this._commonHelper.toast(Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE_LIMIT);
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc 한도변경 API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  /**
   * @function
   * @desc 한도 변경 성공 시 잔여한도 표시
   */
  _setRemainAmount: function () {
    var usedAmount = this.$container.find('.fe-use-amount').attr('id');
    var remainAmount = this.$monthSelector.attr('id');
    var remain = parseInt(remainAmount, 10) - parseInt(usedAmount, 10);

    if (remain < 0) {
      remain = 0;
    }
    var remainText = remain.toString();
    this.$container.find('.fe-remain-amount').attr('id', remainText)
      .text(Tw.FormatHelper.addComma(remainText));
  },
  /**
   * @function
   * @desc 한도변경 여부 체크
   * @returns {boolean}
   */
  _isChanged: function () {
    return this.$monthSelector.attr('id') !== this.$monthSelector.attr('origin-value') ||
      this.$daySelector.attr('id') !== this.$daySelector.attr('origin-value') ||
      this.$onceSelector.attr('id') !== this.$onceSelector.attr('origin-value');
  }
};
