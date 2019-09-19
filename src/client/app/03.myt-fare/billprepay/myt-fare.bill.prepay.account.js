/**
 * @file myt-fare.bill.prepay.account.js
 * @author 양정규
 * @since 2019.09.27
 * @desc 나의 요금 > 소액결제/콘텐츠 이용료 > 선결제 > 실시간 계좌이체
 */

/**
 * @namespace
 * @desc 실시간 계좌이체 namespace
 * @param rootEl - dom 객체
 * @param title - small(소액결제), contents(콘텐츠 이용료)
 */
Tw.MyTFareBillPrepayAccount = function (rootEl, title) {
  this.$container = rootEl;
  this.$title = title;
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

Tw.MyTFareBillPrepayAccount.prototype = {
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
    this._checkIsAuto(); // 자동납부 사용 여부 확인
  },
  /**
   * @function
   * @desc initialize variables
   */
  _initVariables: function () {
    this.$prepayAmount = this.$container.find('.fe-prepay-amount');
    this.$selectBank = this.$container.find('.fe-select-bank');
    this.$accountNumber = this.$container.find('.fe-account-number');
    this.$accountInputBox = this.$container.find('.fe-account-input');
    this.$payBtn = this.$container.find('.fe-check-pay');
    this.$maxAmount = this.$container.find('.fe-max-amount');
    this.$name = this.$container.find('.fe-name');
    this._bankAutoYn = 'N';
    this._isPaySuccess = false;
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-max-amount', $.proxy(this._prepayHistoryMonth, this));
    this.$container.on('input', '.required-input-field', $.proxy(this._setMaxValue, this));
    this.$container.on('change', '.fe-account-info > li', $.proxy(this._onChangeOption, this)); // 자동납부 정보와 수동입력 중 선택
    this.$container.on('change', '.fe-account-info', $.proxy(this._checkIsAbled, this)); // 하단버튼 활성화 체크
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this)); // 은행선택
    this.$container.on('click', '.fe-popup-close', $.proxy(this._onClose, this)); // x버튼 클릭
    this.$payBtn.click(_.debounce($.proxy(this._checkPay, this), 500)); // 납부확인
  },

  /**
   * @function
   * @desc 선결제 가능금액 셋팅
   * @param res
   */
  _setAvailableAmount: function (res) {
    Tw.CommonHelper.endLoading('.popup-page', 'grey');
    var amount = res.result.tmthChrgPsblAmt;
    this.$maxAmount.attr('id', amount).text(Tw.FormatHelper.addComma(amount));
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
   * @desc 월별 이용내역 조회 페이지로 이동
   */
  _prepayHistoryMonth: function () {
    this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/monthly');
  },

  /**
   * @function
   * @desc 자동납부 신청 여부 체크
   */
  _checkIsAuto: function () {
    // 자동납부계좌 없는경우 "직접입력" 부분 선택 및 활성화
    if (!this.$container.find('.fe-auto-info').is(':visible')) {
      this.$accountInputBox.trigger('change').find('input').prop('checked',true);
    }
  },
  /**
   * @function
   * @desc 자동납부계좌가 존재할 경우 자동납부계좌 및 수동입력 선택에 대한 처리
   * @param event
   */
  _onChangeOption: function (event) {
    var $target = $(event.currentTarget);
    var $bankTarget = this.$selectBank; // 납부할 은행
    var $numberTarget = this.$accountNumber; // 납부할 계좌번호

    // target setting
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
    if (this.$accountNumber.attr('disabled') === 'disabled') {
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
   * @desc 결제 확인 풀팝업 닫기 클릭 시 확인 confirm
   * @param e
   */
  _close: function (e) {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.TITLE,
      $.proxy(this._closePop, this), null, null, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A100.BUTTON, $(e.currentTarget));
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
   * @desc 선결제 API 호출
   */
  _pay: function () {
    var apiName = this._getApiName();
    var reqData = this._makeRequestData();

    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(apiName, reqData)
      .done($.proxy(this._paySuccess, this))
      .fail($.proxy(this._payFail, this));
  },
  /**
   * @function
   * @desc 결제확인 풀팝업 레이어에 데이터 셋팅
   * @param $layer
   */
  _setData: function ($layer) {
    var data = this._getData();

    $layer.find('.fe-payment-option-name').attr('id', data.bankCd).text(data.bankNm);
    $layer.find('.fe-payment-option-number').attr('id', data.accountNum).text(data.accountNum);
    $layer.find('.fe-payment-amount').text(Tw.FormatHelper.addComma($.trim(this.$prepayAmount.val().toString())));
    $layer.find('.fe-mbr-name').text(this.$name.text().trim());

    this._payBtn = $layer.find('.fe-pay');
    this._payBtn.click(_.debounce($.proxy(this._pay, this), 500)); // 납부하기
    $layer.on('click', '.fe-close', $.proxy(this._close, this));
  },
  /**
   * @function
   * @desc 부모페이지에서 요청 파라미터로 사용할 데이터 가져오기
   * @returns {{}}
   */
  _getData: function () {
    var isAccountInput = this.$accountInputBox.hasClass('checked');
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
    return data;
  },
  /**
   * @function
   * @desc 납부 완료 및 에러 처리
   */
  _afterPaySuccess: function () {
    if (this._isPaySuccess) {
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=' + this.$title); // 완료 페이지로 이동
    } else if (this._isPayFail) {
      Tw.Error(this._err.code, this._err.msg).pop(); // 에러 시 공통팝업 호출
    }
  },
  /**
   * @function
   * @desc close popup
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
        'hbs': 'MF_06_03_02'
      },
      $.proxy(this._setData, this),
      $.proxy(this._afterPaySuccess, this),
      'check-pay',
      $(e.currentTarget)
    );
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
   * @desc 요청 파라미터 생성
   * @returns {{payOvrAutoYn: string|string, payOvrBankCd, payOvrBankNum, payOvrCustNm: string, bankAutoYn: string|string,
    * bankOrCardCode, bankOrCardName: string, bankOrCardAccn, unpaidBillList: *|Array}}
   */
  _makeRequestData: function () {
    var data = this._getData();
    return {
      bankAutoYn : this._bankAutoYn, // 자동납부 계좌 유무
      tmthChrgPsblAmt: this.$maxAmount.attr('id'), // 선결제 가능금액
      requestSum: $.trim(this.$prepayAmount.val().toString()),  // 선결제 금액
      checkAuto: 'N', // 자동납정보 이용여부
      settlWayCd: '41', // 실시간계좌이체, 체크/신용카드 결제 구분코드 (체크/신용카드 : 02, 실시간계좌이체 : 41)
      bankCode: data.bankCd, // 은행코드
      bankAccn: data.accountNum // 은행계좌번호
    };
  },
  /**
   * @function
   * @desc pay API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _paySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._isPaySuccess = true;
      this._popupService.close();
    } else {
      this._payFail(res);
    }
  },
  /**
   * @function
   * @desc pay API 응답 처리 (실패)
   * @param $target
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
  }
};
