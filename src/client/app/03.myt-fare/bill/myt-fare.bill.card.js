/**
 * @file myt-fare.bill.card.js
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.09.17
 * Annotation: 체크/신용카드 즉시납부
 */

Tw.MyTFareBillCard = function (rootEl) {
  this.$container = rootEl;

  this._paymentCommon = new Tw.MyTFareBillCommon(rootEl); // 납부할 회선 선택하는 공통 컴포넌트
  this._bankList = new Tw.MyTFareBillBankList(rootEl); // 은행리스트 가져오는 공통 컴포넌트
  this._backAlert = new Tw.BackAlert(rootEl, true); // x 버튼 클릭 시 alert 띄우는 컴포넌트

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-check-pay')); // validation check
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-check-pay')); // 키패드 이동 클릭 시 다음 input으로 이동

  this._init();
};

Tw.MyTFareBillCard.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardTypeSelector = this.$container.find('.fe-select-card-type');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$refundBank = this.$container.find('.fe-select-refund-bank');
    this.$refundNumber = this.$container.find('.fe-refund-account-number');
    this.$refundBox = this.$container.find('.fe-refund-box');
    this.$refundInputBox = this.$container.find('.fe-refund-input');
    this.$payBtn = this.$container.find('.fe-check-pay');

    this._refundAutoYn = 'N';
    this._isPaySuccess = false;
  },
  _bindEvent: function () {
    this.$container.on('change', '.fe-auto-info > li', $.proxy(this._onChangeOption, this)); // 자동납부 정보와 수동입력 중 선택
    this.$container.on('change', '.fe-auto-info', $.proxy(this._checkIsAbled, this)); // 하단버튼 활성화 체크
    this.$container.on('change', '.fe-refund-check-btn input[type="checkbox"]', $.proxy(this._showAndHideAccount, this)); // 환불계좌 체크박스
    this.$container.on('click', '.fe-select-card-type', $.proxy(this._selectCardType, this)); // 카드 할부기간 선택
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this)); // 은행선택
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this)); // x버튼 클릭
    this.$payBtn.click(_.debounce($.proxy(this._checkPay, this), 500)); // 납부확인
  },
  _onChangeOption: function (event) {
    var $target = $(event.currentTarget);

    if ($target.hasClass('fe-manual-input')) {
      $target.addClass('checked');
      this.$refundBank.removeAttr('disabled');
      this.$refundNumber.removeAttr('disabled');
    } else {
      $target.siblings().removeClass('checked');
      this.$refundBank.attr('disabled', 'disabled');
      this.$refundNumber.attr('disabled', 'disabled');
      this.$refundNumber.parents('.fe-bank-wrap').find('.fe-error-msg').hide().attr('aria-hidden', 'true');
      this.$refundNumber.parents('.fe-bank-wrap').find('.fe-bank-error-msg').hide().attr('aria-hidden', 'true');
    }
  },
  _showAndHideAccount: function (event) {
    var $target = $(event.currentTarget);
    var $parentTarget = $target.parents('.fe-refund-check-btn');

    if ($target.is(':checked')) {
      $parentTarget.addClass('on');
    } else {
      $parentTarget.removeClass('on');
    }
  },
  _selectCardType: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_CARD_TYPE_LIST, // 카드 할부기간 action sheet load
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target), null, null, $target);
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
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.parents('label').text()); // 선택된 값을 button에 셋팅

    this._popupService.close();
  },
  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this)); // 은행리스트 가져오는 공통 컴포넌트 호출
  },
  _checkIsAbled: function () {
    this._validationService.checkIsAbled(); // 공통 validation service 호출
  },
  _checkPay: function (e) {
    // 모든 유효성 검증 후 납부내역 확인 풀팝업 load
    if (this._validationService.isAllValid()) {
      this._popupService.open({
          'hbs': 'MF_01_01_01',
          'title': Tw.MYT_FARE_PAYMENT_NAME.CARD,
          'unit': Tw.CURRENCY_UNIT.WON
        },
        $.proxy(this._openCheckPay, this), // open callback
        $.proxy(this._afterPaySuccess, this), // close callback
        'check-pay',
        $(e.currentTarget)
      );
    }
  },
  _onClose: function () {
    this._backAlert.onClose(); // x버튼 클릭 시 공통 alert 노출
  },
  _openCheckPay: function ($layer) {
    this._setData($layer); // 바닥페이지에서 넘어온 데이터 셋팅
    this._paymentCommon.getListData($layer); // 납부내역 확인 시 공통 컴포넌트의 리스트 호출
    this._payBtn = $layer.find('.fe-pay');

    $layer.on('click', '.fe-popup-close', $.proxy(this._checkClose, this)); // 닫기버튼 클릭 시 alert 노출
    this._payBtn.click(_.debounce($.proxy(this._pay, this), 500)); // 납부하기
  },
  _setData: function ($layer) {
    var data = this._getData();

    $layer.find('.fe-payment-option-name').attr('id', this.$cardNumber.attr('data-code')).text(this.$cardNumber.attr('data-name'));
    $layer.find('.fe-payment-option-number').attr('id', data.cardNum).text(data.cardNum);
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this._paymentCommon.getAmount().toString()));
    $layer.find('.fe-payment-refund').attr('id', data.refundCd).attr('data-num', data.refundNum)
      .text(data.refundNm + ' ' + data.refundNum);
  },
  _getData: function () {
    var isRefundInput = this.$refundInputBox.hasClass('checked');

    var data = {};
    data.cardNum = $.trim(this.$cardNumber.val());

    // 직접입력/자동납부계좌 사용
    if (isRefundInput) {
      data.refundCd = this.$refundBank.attr('id');
      data.refundNm = this.$refundBank.text();
      data.refundNum = this.$refundNumber.val();
      this._refundAutoYn = 'N';
    } else {
      data.refundCd = this.$container.find('.fe-auto-refund-bank').attr('data-code');
      data.refundNm = this.$container.find('.fe-auto-refund-bank').text();
      data.refundNum = this.$container.find('.fe-auto-refund-number').text();
      this._refundAutoYn = 'Y';
    }
    return data;
  },
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete'); // 완료 페이지로 이동
    } else if (this._isPayFail) {
      Tw.Error(this._err.code, this._err.msg).pop(); // 에러 시 공통팝업 호출
    }
  },
  _checkClose: function (e) {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.TITLE,
      $.proxy(this._closePop, this), $.proxy(this._afterClose, this), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.BUTTON, $(e.currentTarget));
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
    var $target = $(e.currentTarget);
    var reqData = this._makeRequestData();

    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_07_0025, reqData)
      .done($.proxy(this._paySuccess, this, $target))
      .fail($.proxy(this._payFail, this, $target));
  },
  _makeRequestData: function () {
    // 요청 파라미터 json data 만들기
    var reqData = {
      payOvrAutoYn: this._refundAutoYn,
      payOvrBankCd: this.$container.find('.fe-payment-refund').attr('id'),
      payOvrBankNum: this.$container.find('.fe-payment-refund').attr('data-num'),
      payOvrCustNm: $.trim(this.$container.find('.fe-name').text()),
      bankOrCardCode: this.$container.find('.fe-payment-option-name').attr('id'),
      bankOrCardName: this.$container.find('.fe-payment-option-name').text(),
      bankOrCardAccn: this.$container.find('.fe-payment-option-number').attr('id'),
      ccPwd: $.trim(this.$cardPw.val()),
      cdexpy: $.trim(this.$cardY.val()).substr(2,2),
      cdexpm: $.trim(this.$cardM.val()),
      instmm: this.$cardTypeSelector.attr('id'),
      unpaidBillList: this._paymentCommon.getBillList()
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