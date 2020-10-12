/**
 * @file myt-fare.bill.prepay.auto.js
 * @author 공자윤 (jayoon.kong@sk.com)
 * @since 2018.08.06
 * @desc 소액결제/콘텐츠이용료 자동 선결제 신청 및 변경
 */

/**
 * @namespace
 * @desc 소액결제/콘텐츠이용료 자동 선결제 신청 및 변경 namespace
 * @param rootEl - dom 객체
 * @param title - 소액결제/콘텐츠이용료
 * @param type - 신청/변경
 */
Tw.MyTFareBillPrepayAuto = function (rootEl, title, type, isMasking) {
  this.$container = rootEl;
  this.$title = title;
  this._isSmall = title === 'small';
  this.$type = type;
  this.$isPage = true;
  this._isMasking = isMasking && isMasking === 'true';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-pay')); // 유효성 검증
  // this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-pay'), true); // 유효성 검증
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-pay')); // 키패드 이동 클릭 시 다음 input으로 이동
  this._bankList = new Tw.MyTFareBillBankList(rootEl); // 은행리스트 가져오는 공통 컴포넌트
  this._backAlert = new Tw.BackAlert(rootEl, true); // x 버튼 클릭 시 공통 얼럿 노출
  this._recvAutoCardNumber = ''; // 수신한 자동납부 카드번호

  this._init();
};

Tw.MyTFareBillPrepayAuto.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    this._initVariables();
    this._bindEvent();

    // this._validationService.bindEvent();
    /*
        납부방법(계좌이체, 체크/신용카드) 별 서버 렌더링시에 노출/비노출 해야하나,
        미리 비노출 하게되면, ValidationService 가 먹히지 않아서 일단 노출 후
        트리거(click) 으로 비선택 영역을 비노출 처리한다.
     */
    this.$payMethod.filter(':checked').trigger('click');
    setTimeout($.proxy(this._checkStandardAmount, this), 100); // 기준금액 체크

    // 마스킹 해제 시 [카드 자동납부 정보] 자동으로 호출한다.
    // 20.10.6 다시 자동 호출 제거. 기획 문종수 책임 요청.
    /*if (this._isMasking) {
      this.$container.find('.fe-card-info').trigger('click');
    }*/
  },
  /**
   * @function
   * @desc initialize variables
   */
  _initVariables: function () {
    this._standardAmountList = [];
    this._prepayAmountList = [];

    this.$selectBank = this.$container.find('.fe-select-bank');
    this.$standardAmount = this.$container.find('.fe-standard-amount');
    this.$prepayAmount = this.$container.find('.fe-prepay-amount');
    this.$birth = this.$container.find('.fe-birth');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$payBtn = this.$container.find('.fe-pay');

    this.$accountArea = this.$container.find('.fe-account-area'); // 예금주명 영역
    this.$cardArea = this.$container.find('.fe-card-area'); // 카드주명 영역
    this.$accountNumber = this.$container.find('.fe-account-number');
    this.$payMethod = this.$container.find('input[data-pay-method]'); // 납부방법
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('change', '.fe-auto-info > li', $.proxy(this._onChangeOption, this)); // 자동납부 정보와 수동입력 중 선택
    this.$container.on('click', '.fe-standard-amount', $.proxy(this._selectAmount, this, this._standardAmountList));
    this.$container.on('click', '.fe-prepay-amount', $.proxy(this._selectAmount, this, this._prepayAmountList));
    this.$container.on('click', '.fe-card-info', _.debounce($.proxy(this._getCardInfo, this), 500));
    this.$payMethod.on('click', $.proxy(this._showPayMethod, this));
    this.$payBtn.click(_.debounce($.proxy(this._autoPrepay, this), 500));
    this.$container.on('click', '.select-bank', $.proxy(this._selectBank, this)); // 은행선택
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
  },

  /**
   * @function
   * @desc 납부방법 변경시 선택영역 노출/비노출
   * @param event
   * @private
   */
  _showPayMethod: function (event) {
    var showArea = $(event.currentTarget).data('payMethod');
    this.$container.find('.fe-box').addClass('none')
      .filter('.'+showArea).removeClass('none');
    this._checkIsAbled();
  },

  /**
   * @function
   * @desc 납부방법(계좌이체, 체크/신용카드) 중에서 계좌이체 방법인지 유무
   * @return {boolean}
   * @private
   */
  _isAccountMethod: function () {
    return this.$payMethod.filter(':checked').data('payMethod') === 'fe-account-area';
  },

  /**
   * @function
   * @desc 기준금액 0원일 경우 에러 팝업 보여주고 뒤로가기
   */
  _checkStandardAmount: function () {
    if (this.$standardAmount.attr('id') < 1) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.NOT_ALLOWED_AUTO_PREPAY, null, null, $.proxy(this._goBack, this));
    }
  },
  /**
   * @function
   * @desc go back
   */
  _goBack: function () {
    this._historyService.goBack();
  },

  /**
   * @function
   * @desc 자동납부계좌가 존재할 경우 자동납부계좌 및 수동입력 선택에 대한 처리
   * @param event
   */
  _onChangeOption: function (event) {
    var $target = $(event.currentTarget);
    // target setting
    var $bankTarget = this.$selectBank; // 납부할 은행
    var $numberTarget = this.$accountNumber; // 납부할 계좌번호

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
    this._checkIsAbled();
  },

  /**
   * @function
   * @desc 필수 입력 필드 체크 후 버튼 활성화 처리
   */
  _checkIsAbled: function () {
    // this._validationService.checkIsAbled(); // 공통 모듈 호출
    if (this._isAccountMethod() && this.$accountNumber.attr('disabled') === 'disabled') {
      this.$payBtn.removeAttr('disabled');
    } else {
      this._validationService.checkIsAbled(); // 공통 validation service 호출
    }
  },
  /**
   * @function
   * @desc 기준금액 및 선결제 금액 action sheet
   * @param $list
   * @param event
   */
  _selectAmount: function ($list, event) {
    var $target = $(event.currentTarget);
    var $amount = $target.attr('data-max-value');

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this._getAmountList($list, $amount),
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
   * @desc 선택된 값 처리
   * @param $target
   * @param event
   */
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.parents('label').text());

    if ($target.hasClass('fe-standard-amount')) {
      this.$prepayAmount.attr('id', $selectedValue.attr('id'));
      this.$prepayAmount.text($selectedValue.parents('label').text());
    }

    // this._checkSelected();
    this._popupService.close();
  },
  /**
   * @function
   * @desc 기준금액 및 선결제금액 값 확인 후 버튼 활성화 처리
   */
  _checkSelected: function () {
    if (this.$prepayAmount.attr('id') !== this.$prepayAmount.attr('data-origin-id') ||
    this.$standardAmount.attr('id') !== this.$standardAmount.attr('data-origin-id')) {
      this._validationService._setButtonAbility($.proxy(this._isAmountValid, this));
    }
  },
  /**
   * @function
   * @desc 기준금액 list로 만드는 작업
   * @param $amountList
   * @param $amount
   * @returns {*}
   */
  _getAmountList: function ($amountList, $amount) {
    if (Tw.FormatHelper.isEmpty($amountList)) {
      var listObj = {
        'list': []
      };
      var firstAmt = 10000;
      var strdAmt = $amount / firstAmt;

      for (var i = strdAmt; i >= 1; i--) {
        var obj = {
          'label-attr': 'id="' + i * firstAmt + '"',
          'radio-attr': 'id="' + i * firstAmt + '" name="r2"',
          'txt': i + Tw.CURRENCY_UNIT.TEN_THOUSAND
        };
        listObj.list.push(obj);
      }
      $amountList.push(listObj);
    }
    return $amountList;
  },
  /**
   * @function
   * @desc 유효성 검증 후 자동선결제
   * @param e
   */
  _autoPrepay: function (e) {
    if (this._isAmountValid() && this._validationService.isAllValid()) {
      this._pay(e);
    }
  },
  /**
   * @function
   * @desc 선결제 금액보다 기준금액이 클 경우 기준금액에 맞게 셋팅
   * @returns {boolean|*}
   */
  _isAmountValid: function () {
    return this._validation.showAndHideErrorMsg(this.$prepayAmount,
      this._validation.checkIsMoreAndSet(this.$standardAmount, this.$prepayAmount));
  },
  /**
   * @function
   * @desc 자동선결제 신청 및 변경 API 호출
   * @param e
   */
  _pay: function (e) {
    var reqData = this._makeRequestData();
    var bffId = this._getBffId();
    var $target = $(e.currentTarget);

    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService.request(bffId, reqData)
      .done($.proxy(this._paySuccess, this, $target))
      .fail($.proxy(this._payFail, this, $target));
  },
  /**
   * @function
   * @desc 조건에 따라 요청 파라미터 셋팅
   * @returns {{checkAuto: string, autoChrgStrdAmt, autoChrgAmt}}
   */
  _makeRequestData: function () {
    var reqData = {
      checkAuto: 'N',
      autoChrgStrdAmt: this.$standardAmount.attr('id'), // 기준금액
      autoChrgAmt: this.$prepayAmount.attr('id') // 자동 선결제 금액
    };

    // 납부방법 분기
    if (this._isAccountMethod()) { // 계좌이체 일때
      // 계좌유형(자동납부 계좌, 직접입력)
      var accountNumber = this.$accountNumber.val(),
        accountCd = this.$selectBank.attr('id');
      reqData.isAutoBankInfo = this.$container.find('[name="isAutoBankInfo"]:checked').val();
      reqData.bankAccount = accountNumber; // 계좌번호
      reqData.bank_card_co_cd = accountCd; // 은행코드
      var isAccountChange = accountCd !== String(this.$selectBank.data('origin-val'));
      isAccountChange = isAccountChange || accountNumber !== String(this.$accountNumber.data('origin-val'));
      reqData.autoBankCardUdtYn = isAccountChange ? 'Y' : 'N';
    } else { // 체크/신용카드 일때
      // if (!(isChange && reqData.checkRadio === 'A')) {}
      // '신청' 일때만 cardBirth 보냄
      if (this.$type !== 'change') {
        reqData.cardBirth = $.trim(this.$birth.val());
      }
      reqData.cardNum = $.trim(this.$cardNumber.val());
      reqData.cardType = this.$cardNumber.attr('data-code');
      reqData.cardNm = this.$cardNumber.attr('data-name');
      reqData.cardEffYM = $.trim(this.$cardY.val())+ $.trim(this.$cardM.val());
      reqData.cardPwd = $.trim(this.$cardPw.val());
      reqData.isAutoCardInfo = this._recvAutoCardNumber === this.$cardNumber.val() ? 'Y':'N'; // [OP002-1754]2019-07-02 추가
      // 기존카드 사용여부 (Y: 변경, N: 기존카드 사용)
      reqData.autoBankCardUdtYn = this.$cardNumber.val() !== String(this.$cardNumber.data('origin-val')) ? 'Y' : 'N';
    }

    return reqData;
  },
  /**
   * @function
   * @desc bff id 조회
   * @returns bff id
   */
  _getBffId: function () {
    var bffId;
    // 납부방법 (계좌이체, 체크/신용카드) 소액결제, 콘텐츠이용료 별로 bff 구분
    // 계좌이체 일때
    if (this._isAccountMethod()) {
      bffId = this._isSmall ? Tw.API_CMD.BFF_07_0105 : Tw.API_CMD.BFF_07_0106;
    } else { // 체크/신용카드 일때
      bffId = this._isSmall ? Tw.API_CMD.BFF_07_0076 : Tw.API_CMD.BFF_07_0083;
    }
    return bffId;
  },
  /**
   * @function
   * @desc 자동선결제 신청 및 변경 API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _paySuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.container');
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=' + this.$title + '&sub=' + this.$type);
    } else {
      this._payFail($target, res);
    }
  },
  /**
   * @function
   * @desc 자동선결제 신청 및 변경 API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _payFail: function ($target, err) {
    Tw.CommonHelper.endLoading('.container');
    // 실패 메시지를 안주는 경우가 있어서 default 내용을 넣어준다.
    if (Tw.FormatHelper.isEmpty(err.msg)) {
      err.msg = Tw.ALERT_MSG_MYT_FARE.AUTO_PREPAY_FAIL;
    }
    Tw.Error(err.code, err.msg).pop(null, $target);
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
        this.$cardNumber.val(result.s_bank_card_num).trigger('change');
        this._getMessageTarget($(e.currentTarget)).hide().attr('aria-hidden', 'true');
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
  },

  /**
   * @function
   * @desc 은행리스트 가져오는 공통 컴포넌트 호출
   * @param event
   */
  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this));
  }
};
