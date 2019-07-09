/**
 * @file myt-fare.bill.prepay.pay.js
 * @author Jayoon Kong
 * @since 2018.10.04
 * @desc 소액결제/콘텐츠이용료 선결제
 */

/**
 * @namespace
 * @desc 소액결제/콘텐츠이용료 선결제 namespace
 * @param rootEl - dom 객체
 * @param title - 소액결제/콘텐츠이용료
 * @param name - 회원명
 */
Tw.MyTFareBillPrepayPay = function (rootEl, title, name) {
  this.$container = rootEl;
  this.$title = title;
  this._name = name;
  this._amount = '0';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-check-pay'), null); // 유효성 검증
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-check-pay')); // 키패드 이동 클릭 시 다음 input으로 이동
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl, true); // x 버튼 클릭 시 공통 얼럿 노출
  this._recvAutoCardNumber = ''; // 수신한 자동납부 카드번호

  this._init();
};

Tw.MyTFareBillPrepayPay.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    var prepayMain = new Tw.MyTFareBillPrepayMain(this.$container, this.$title, '.popup-page', $.proxy(this._setAvailableAmount, this));
    prepayMain.initRequestParam();

    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    prepayMain.getRemainLimit();

    this._setInitValue();
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
   * @desc set name
   */
  _setInitValue: function () {
    this.$container.find('.fe-name').val(this._name);
  },
  /**
   * @function
   * @desc initialize variables
   */
  _initVariables: function () {
    this.$prepayAmount = this.$container.find('.fe-prepay-amount');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardTypeSelector = this.$container.find('.fe-select-card-type');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$payBtn = this.$container.find('.fe-check-pay');
    this.$isValid = false;
    this.$isCardValid = false;

    this._isPaySuccess = false;
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('input', '.required-input-field', $.proxy(this._setMaxValue, this));
    this.$container.on('click', '.fe-select-card-type', $.proxy(this._selectCardType, this));
    this.$container.on('click', '.fe-popup-close', $.proxy(this._onClose, this));
    this.$container.on('click', '.fe-card-info', _.debounce($.proxy(this._getCardInfo, this), 500));
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
   * @desc 카드 할부기간 선택
   * @param event
   */
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_CARD_TYPE_LIST,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
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
    $target.text($selectedValue.parents('label').text());

    this._popupService.close();
  },
  /**
   * @function
   * @desc 유효성 검증 후 다음 화면으로 이동
   * @param e
   */
  _checkPay: function (e) {
    if (this._isAvailable()) {
      if (this._validationService.isAllValid()) {
        this._goCheck(e);
      }
    }
  },
  /**
   * @function
   * @desc 납부할 요금이 50,000원 미만일 경우 일시불만 가능
   */
  _isAvailable: function () {
    var amount = this.$prepayAmount.val();
    if (amount < 50000 && this.$container.find('.fe-select-card-type').attr('id') !== '00') {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.ALERT_CARD_TYPE);
      return false;
    }
    return true;
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
      'hbs': 'MF_06_03_01'
    },
      $.proxy(this._setData, this),
      $.proxy(this._afterPaySuccess, this),
      'check-pay',
      $(e.currentTarget)
    );
  },
  /**
   * @function
   * @desc 결제확인 풀팝업 레이어에 데이터 셋팅
   * @param $layer
   */
  _setData: function ($layer) {
    $layer.find('.fe-payment-option-name').attr('id', this.$cardNumber.attr('data-code')).text(this.$cardNumber.attr('data-name'));
    $layer.find('.fe-payment-option-number').text(this.$cardNumber.val());
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma($.trim(this.$prepayAmount.val().toString())));
    $layer.find('.fe-mbr-name').text(this._name);
    $layer.find('.fe-payment-type').text(this.$cardTypeSelector.text());

    this._payBtn = $layer.find('.fe-pay');
    this._payBtn.click(_.debounce($.proxy(this._pay, this, $layer), 500)); // 납부하기
    $layer.on('click', '.fe-close', $.proxy(this._close, this));
  },
  /**
   * @function
   * @desc 선결제 완료 처리
   */
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=' + this.$title); // 선결제 완료 페이지로 이동
    } else if (this._isPayFail) {
      Tw.Error(this._err.code, this._err.msg).pop();
    }
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
  _pay: function ($layer) {
    var apiName = this._getApiName();
    var reqData = this._makeRequestData($layer);

    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(apiName, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  /**
   * @function
   * @desc 선결제 api name 조회
   * @returns {string}
   */
  _getApiName: function () {
    var apiName = '';
    if (this.$title === 'small') {
      apiName = Tw.API_CMD.BFF_07_0074; // 소액결제 선결제
    } else {
      apiName = Tw.API_CMD.BFF_07_0082; // 콘텐츠이용료 선결제
    }
    return apiName;
  },
  /**
   * @function
   * @desc 요청 파라미터 생성
   * @param $layer
   * @returns {{tmthChrgPsblAmt: string, checkAuto: string, requestSum: string, cardNumVal,
   * cardCorp, cardNm, cardExpyyVal: string, instMm, cardPwdVal: string}}
   */
  _makeRequestData: function ($layer) {
    var reqData = {
      tmthChrgPsblAmt: this._amount, // 선결제 가능금액
      checkAuto: 'N',
      requestSum: $.trim(this.$prepayAmount.val().toString()),
      cardNumVal: $layer.find('.fe-payment-option-number').text(),
      cardCorp: $layer.find('.fe-payment-option-name').attr('id'),
      cardNm: $layer.find('.fe-payment-option-name').text(),
      cardExpyyVal: $.trim(this.$cardY.val())+ $.trim(this.$cardM.val()),
      instMm: this.$cardTypeSelector.attr('id').toString(),
      cardPwdVal: $.trim(this.$cardPw.val().toString()),
      isAutoCardInfo: this._recvAutoCardNumber === this.$cardNumber.val() ? 'Y':'N' // [OP002-1754]2019-07-02 추가
    };
    return reqData;
  },
  /**
   * @function
   * @desc 선결제 API 응답 처리 (성공)
   * @param res
   */
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._isPaySuccess = true;
      this._popupService.closeAll();
    } else {
      this._payFail(res);
    }
  },
  /**
   * @function
   * @desc 선결제 API 응답 처리 (실패)
   * @param err
   */
  _payFail: function (err) {
    Tw.CommonHelper.endLoading('.popup-page');

    this._isPayFail = true;
    this._err = {
      code: err.code,
      msg: err.msg
    };
    this._popupService.close();
  },

  /**
   * @function
   * @desc 자동납부 카드정보 조회
   */
  _getCardInfo: function (e) {
    this._apiService.request(Tw.API_CMD.BFF_07_0098, {})
      .done($.proxy(this._cardInfoSuccess, this, e))
      .fail($.proxy(this._cardInfoFail, this, e));

  },

  /**
   * @function
   * @param e
   * @param res
   * @desc 자동납부 카드정보 응답 처리 (성공)
   */
  _cardInfoSuccess: function (e, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.popup-page');
      var result = res.result;
      // 납부방법(01:은행, 02:카드, 03:지로, 04:가상)
      if (result.payMthdCd === '02' && !Tw.FormatHelper.isEmpty(result.s_bank_card_num)) {
        this._recvAutoCardNumber = result.s_bank_card_num;
        this.$cardNumber.val(result.s_bank_card_num);
      } else {
        this._cardInfoFail(e);
      }
    }else {
      this._cardInfoFail(e);
    }
  },

  /**
   * @function
   * @desc get message target
   * @param $target
   * @returns {this | *}
   */
  _getMessageTarget: function ($target) {
    var $messageTarget = $target.parent().siblings('.fe-error-msg');
    if ($target.attr('data-valid-label') === 'expiration' || $target.attr('data-err-target') === 'fe-exp-wrap') {
      $messageTarget = $target.parents('.fe-exp-wrap').siblings('.fe-error-msg');
    }
    return $messageTarget;
  },

  /**
   * @function
   * @param e
   * @desc 자동납부 카드정보 응답 처리 (실패)
   */
  _cardInfoFail: function (e) {
    Tw.CommonHelper.endLoading('.popup-page');
    this._getMessageTarget($(e.currentTarget)).text(Tw.ALERT_MSG_MYT_FARE.EMPTY_CARD_INFO)
      .show()
      .attr('aria-hidden', 'false');
  }
};
