/**
 * @file myt-fare.bill.account.js
 * @author Jayoon Kong
 * @since 2018.09.17
 * @desc 계좌이체 즉시납부
 */

/**
 * @namespace
 * @desc 계좌이체 납부 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTFareBillAccount = function (rootEl) {
  this.$container = rootEl;

  this._paymentCommon = new Tw.MyTFareBillCommon(rootEl); // 납부할 회선 선택하는 공통 컴포넌트
  this._bankList = new Tw.MyTFareBillBankList(rootEl); // 은행리스트 가져오는 공통 컴포넌트
  this._backAlert = new Tw.BackAlert(rootEl, true); // x 버튼 클릭 시 alert 띄우는 컴포넌트

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-check-pay')); // validation check
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-check-pay')); // 키패드 이동 클릭 시 다음 input으로 이동

  this._paymentCommon.selectLine();
  this._init();
};

Tw.MyTFareBillAccount.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    this._initVariables();
    this._bindEvent();
    this._checkIsAuto(); // 자동납부 사용 여부 확인
  },
  /**
   * @function
   * @desc initialize variables
   */
  _initVariables: function () {
    this.$selectBank = this.$container.find('.fe-select-bank');
    this.$refundBank = this.$container.find('.fe-select-refund-bank');
    this.$accountNumber = this.$container.find('.fe-account-number');
    this.$refundNumber = this.$container.find('.fe-refund-account-number');
    this.$refundCheckBox = this.$container.find('.fe-refund-check-btn');
    this.$accountInputBox = this.$container.find('.fe-account-input');
    this.$refundInputBox = this.$container.find('.fe-refund-input');
    this.$payBtn = this.$container.find('.fe-check-pay');

    this._bankAutoYn = 'N';
    this._refundAutoYn = 'N';
    this._isPaySuccess = false;
    this._isFirstCheck = true;
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('change', '.fe-auto-info > li', $.proxy(this._onChangeOption, this)); // 자동납부 정보와 수동입력 중 선택
    this.$container.on('change', '.fe-auto-info', $.proxy(this._checkIsAbled, this)); // 하단버튼 활성화 체크
    this.$container.on('change', '.fe-refund-check-btn input[type="checkbox"]', $.proxy(this._showAndHideAccount, this)); // 환불계좌 체크박스
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this)); // 은행선택
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this)); // x버튼 클릭
    this.$payBtn.click(_.debounce($.proxy(this._checkPay, this), 500)); // 납부확인
  },
  /**
   * @function
   * @desc 자동납부 신청 여부 체크
   */
  _checkIsAuto: function () {
    if (this.$container.find('.fe-auto-info').is(':visible')) {
      this.$payBtn.removeAttr('disabled');
    }
  },
  /**
   * @function
   * @desc 자동납부계좌가 존재할 경우 자동납부계좌 및 수동입력 선택에 대한 처리
   * @param event
   */
  _onChangeOption: function (event) {
    var $target = $(event.currentTarget);
    var $bankTarget = null;
    var $numberTarget = null;
    var $isAccountInfo = $target.parent().hasClass('fe-account-info'); // 계좌번호

    // target setting
    if ($isAccountInfo) {
      $bankTarget = this.$selectBank; // 납부할 은행
      $numberTarget = this.$accountNumber; // 납부할 계좌번호
    } else {
      $bankTarget = this.$refundBank; // 환불받을 은행
      $numberTarget = this.$refundNumber; // 환불계좌번호
    }

    if ($target.hasClass('fe-manual-input')) {
      $target.addClass('checked');
      $bankTarget.removeAttr('disabled');
      $numberTarget.removeAttr('disabled');
    } else {
      $target.siblings().removeClass('checked');
      $bankTarget.attr('disabled', 'disabled');
      $numberTarget.attr('disabled', 'disabled');
      $numberTarget.parents('.fe-bank-wrap').find('.fe-error-msg').hide().attr('aria-hidden', 'true');
      $numberTarget.parents('.fe-bank-wrap').find('.fe-bank-error-msg').hide().attr('aria-hidden', 'true');
    }
  },
  /**
   * @function
   * @desc 환불계좌 선택 체크박스에 대한 처리
   * @param event
   */
  _showAndHideAccount: function (event) {
    var $target = $(event.currentTarget);
    var $parentTarget = $target.parents('.fe-refund-check-btn');

    if ($target.is(':checked')) {
      $parentTarget.addClass('on');

      if (this._isFirstCheck) {
        this.$refundNumber.on('keyup', $.proxy(this._checkNumber, this));
        this._isFirstCheck = false;
      }
    } else {
      $parentTarget.removeClass('on');
    }
    this._checkIsAbled();
  },
  /**
   * @function
   * @desc 숫자만 입력
   * @param event
   */
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);

    this._checkIsAbled();
  },
  /**
   * @function
   * @desc 은행리스트 가져오는 공통 컴포넌트 호출
   * @param event
   */
  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this));
  },
  /**
   * @function
   * @desc 필수입력필드 확인 후 하단 버튼 활성화/비활성화 처리
   */
  _checkIsAbled: function () {
    if (this.$accountNumber.attr('disabled') === 'disabled' &&
      (this.$refundCheckBox.hasClass('on') || this.$refundNumber.attr('disabled') === 'disabled')) {
      this.$payBtn.removeAttr('disabled');
    } else {
      this._validationService.checkIsAbled(); // 공통 validation service 호출
    }
  },
  /**
   * @function
   * @desc x버튼 클릭 시 공통 confirm 노출
   */
  _onClose: function () {
    this._backAlert.onClose();
  },
  /**
   * @function
   * @desc 모든 유효성 검증 후 납부내역 확인 풀팝업 load
   * @param e
   */
  _checkPay: function (e) {
    if (this._validationService.isAllValid()) {
      this._popupService.open({
          'hbs': 'MF_01_01_01',
          'title': Tw.MYT_FARE_PAYMENT_NAME.ACCOUNT,
          'unit': Tw.CURRENCY_UNIT.WON
        },
        $.proxy(this._openCheckPay, this), // open callback
        $.proxy(this._afterPaySuccess, this), // close callback
        'check-pay',
        $(e.currentTarget)
      );
    }
  },
  /**
   * @function
   * @desc 납부내역 확인 팝업 event 및 data 처리
   * @param $layer
   */
  _openCheckPay: function ($layer) {
    this._setData($layer); // 바닥페이지에서 넘어온 데이터 셋팅
    this._paymentCommon.getListData($layer); // 납부내역 확인 시 공통 컴포넌트의 리스트 호출
    this._payBtn = $layer.find('.fe-pay');

    $layer.on('click', '.fe-popup-close', $.proxy(this._checkClose, this)); // 닫기버튼 클릭 시 alert 노출
    this._payBtn.click(_.debounce($.proxy(this._pay, this), 500)); // 납부하기
  },
  /**
   * @function
   * @desc 납부내역 확인 팝업에 데이터 셋팅
   * @param $layer
   */
  _setData: function ($layer) {
    var data = this._getData();

    $layer.find('.fe-payment-option-name').attr('id', data.bankCd).text(data.bankNm);
    $layer.find('.fe-payment-option-number').attr('id', data.accountNum)
      .text(data.accountNum);
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma(this._paymentCommon.getAmount().toString()));

    if (this.$refundCheckBox.hasClass('on')) {
      $layer.find('.fe-payment-refund').attr('id', data.refundCd).attr('data-num', data.refundNum)
        .text(data.refundNm + ' ' + data.refundNum);
    }
  },
  /**
   * @function
   * @desc 부모페이지에서 요청 파라미터로 사용할 데이터 가져오기
   * @returns {{}}
   */
  _getData: function () {
    var isAccountInput = this.$accountInputBox.hasClass('checked');
    var isRefundInput = this.$refundInputBox.hasClass('checked');

    var data = {};

    // 납부할 계좌번호 (직접입력/자동납부계좌 선택)
    if (isAccountInput) {
      data.bankCd = this.$selectBank.attr('id');
      data.bankNm = this.$selectBank.text();
      data.accountNum = this.$accountNumber.val();
      this._bankAutoYn = 'N';
    } else {
      data.bankCd = this.$container.find('.fe-auto-account-bank').attr('data-code');
      data.bankNm = this.$container.find('.fe-auto-account-bank').attr('data-name');
      data.accountNum = this.$container.find('.fe-auto-account-number').text();
      this._bankAutoYn  = 'Y';
    }

    if (this.$refundCheckBox.hasClass('on')) {
      if (isRefundInput) {
        data.refundCd = this.$refundBank.attr('id');
        data.refundNm = this.$refundBank.text();
        data.refundNum = this.$refundNumber.val();
        this._refundAutoYn = 'N';
      } else {
        data.refundCd = this.$container.find('.fe-auto-refund-bank').attr('data-code');
        data.refundNm = this.$container.find('.fe-auto-refund-bank').attr('data-name');
        data.refundNum = this.$container.find('.fe-auto-refund-number').text();
        this._refundAutoYn = 'Y';
      }
    } else {
      this._refundAutoYn = 'N';
    }
    return data;
  },
  /**
   * @function
   * @desc 납부 완료 및 에러 처리
   */
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete'); // 완료 페이지로 이동
    } else if (this._isPayFail) {
      Tw.Error(this._err.code, this._err.msg).pop(); // 에러 시 공통팝업 호출
    }
  },
  /**
   * @function
   * @desc 요금납부 종료 confirm
   * @param e
   */
  _checkClose: function (e) {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.TITLE,
      $.proxy(this._closePop, this), $.proxy(this._afterClose, this), null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A101.BUTTON, $(e.currentTarget));
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
   * @desc 계좌이체 납부 API 호출
   * @param e
   */
  _pay: function (e) {
    var $target = $(e.currentTarget);
    var reqData = this._makeRequestData();

    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_07_0023, reqData)
      .done($.proxy(this._paySuccess, this, $target))
      .fail($.proxy(this._payFail, this, $target));
  },
  /**
   * @function
   * @desc 요청 파라미터 생성
   * @returns {{payOvrAutoYn: string|string, payOvrBankCd, payOvrBankNum, payOvrCustNm: string, bankAutoYn: string|string,
    * bankOrCardCode, bankOrCardName: string, bankOrCardAccn, unpaidBillList: *|Array}}
   */
  _makeRequestData: function () {
    var reqData = {
      payOvrAutoYn: this._refundAutoYn,
      payOvrBankCd: this.$container.find('.fe-payment-refund').attr('id'),
      payOvrBankNum: this.$container.find('.fe-payment-refund').attr('data-num'),
      payOvrCustNm: $.trim(this.$container.find('.fe-name').text()),
      bankAutoYn: this._bankAutoYn,
      bankOrCardCode: this.$container.find('.fe-payment-option-name').attr('id'),
      bankOrCardName: $.trim(this.$container.find('.fe-payment-option-name').text()),
      bankOrCardAccn: this.$container.find('.fe-payment-option-number').attr('id'),
      unpaidBillList: this._paymentCommon.getBillList()
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
