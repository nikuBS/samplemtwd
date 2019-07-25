/**
 * @file myt-fare.bill.prepay.pay.skpay.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2018.10.04
 * @desc SK pay 소액결제/콘텐츠이용료 선결제
 */

/**
 * @namespace
 * @desc SK pay 소액결제/콘텐츠이용료 선결제 namespace
 * @param rootEl - dom 객체
 * @param title - 소액결제/콘텐츠이용료
 * @param name - 회원명
 */
Tw.MyTFareBillPrepayPaySKpay = function (rootEl, title, name, isMasking, skpayInfo) {
  this.$container = rootEl;
  this.$title = title;
  this._name = name;
  this._isMasking = isMasking && isMasking === 'true' ? true : false;
  this.skpayInfo = (skpayInfo) ? skpayInfo.skpayInfo : undefined;
  this._amount = '0';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-check-pay'), null); // 유효성 검증
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-check-pay')); // 키패드 이동 클릭 시 다음 input으로 이동
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl, true); // x 버튼 클릭 시 공통 얼럿 노출

  this._init();
};

Tw.MyTFareBillPrepayPaySKpay.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    var prepayMain = new Tw.MyTFareBillPrepayMain(this.$container, this.$title, '.popup-page', $.proxy(this._setAvailableAmount, this));
    prepayMain.initRequestParam();

    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    prepayMain.getRemainLimit();

    this._initVariables();
    this._bindEvent();
  },
  /**
   * @function
   * @desc 선결제 가능금액 셋팅
   * @param res
   */
  _setAvailableAmount: function (res) {
    Tw.CommonHelper.endLoading('.popup-page', 'grey');

    this._amount = res.result.tmthChrgPsblAmt;
    this.$container.find('.fe-max-amount').attr('id', this._amount).text(Tw.FormatHelper.addComma(this._amount));
  },
  /**
   * @function
   * @desc initialize variables
   */
  _initVariables: function () {
    this.$prepayAmount = this.$container.find('.fe-prepay-amount');
    this.$payBtn = this.$container.find('.fe-check-pay');

    this._isPaySuccess = false;
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('input', '.required-input-field', $.proxy(this._setMaxValue, this));
    this.$container.on('click', '.fe-popup-close', $.proxy(this._onClose, this));
    this.$payBtn.click(_.debounce($.proxy(this._checkPay, this), 500));
  },

  /**
   * @function
   * @desc maxLength 적용
   * @param event
   */
  _setMaxValue: function (event) {
    var $target = $(event.currentTarget);
    var maxLength = $target.attr('maxLength');
    if ($target.attr('maxLength')) {
      if ($target.val().length >= maxLength) {
        $target.val($target.val().slice(0, maxLength));
      }
    }
  },
  /**
   * @function
   * @desc 유효성 검증 후 다음 화면으로 이동
   * @param e
   */
  _checkPay: function (e) {
    if (this._validationService.isAllValid()) {
      this._goCheck(e);
    }
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
   * @desc 전체 팝업 close
   */
  _closePop: function () {
    this._popupService.closeAll();
    this._historyService.replaceURL('/myt-fare/bill/' + this.$title);
  },
  /**
   * @function
   * @desc 결제확인 풀팝업 load
   * @param e
   */
  _goCheck: function (e) {
    this._popupService.open({
      'hbs': 'MF_06_03_03'
    },
      $.proxy(this._setData, this, e),
      null,
      'check-pay',
      $(e.currentTarget)
    );
  },
  /**
   * @function
   * @desc 결제확인 풀팝업 레이어에 데이터 셋팅
   * @param $layer
   */
  _setData: function (e, $layer) {
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma($.trim(this.$prepayAmount.val().toString())));
    $layer.find('.fe-mbr-name').text(this._name);

    this._payBtn = $layer.find('.fe-pay');
    this._payBtn.click(_.debounce($.proxy(this._pay, this, $layer, e), 500)); // 납부하기
    $layer.on('click', '.fe-close', $.proxy(this._close, this));
  },
  /**
   * @function
   * @desc 선결제 취소 확인 confirm
   * @param e
   */
  _close: function (e) {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.TITLE,
      $.proxy(this._closePop, this), null, null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.BUTTON, $(e.currentTarget));
  },
  /**
   * @function
   * @desc 선결제 API 호출
   * @param $layer
   */
  _pay: function ($layer, e) {
    new Tw.MyTFareBillPrepaySdkSKPay({
      $element: this.$container,
      data : {
        skpayInfo: this.skpayInfo,
        title: this.$title,
        requestSum: $.trim(this.$prepayAmount.val().toString())
      }
    }).goSkpay(e);
  }
};
