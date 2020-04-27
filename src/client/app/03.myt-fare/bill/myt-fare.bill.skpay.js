/**
 * @file myt-fare.bill.skpay.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.06.25
 * @desc SK pay 즉시납부
 */

/**
 * @namespace
 * @desc SK pay 납부 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTFareBillSkpay = function (params) {
  this.$container = params.$element;
  this.redirectUri = params.data;
  this.svcNumber = params.svcNumber;
  this.svcMgmtNum = params.svcMgmtNum;
  this.acntNum = params.acntNum;
  this._paymentCommon = new Tw.MyTFareBillCommon(this.$container); // 납부할 회선 선택하는 공통 컴포넌트
  this._bankList = new Tw.MyTFareBillBankList(this.$container); // 은행리스트 가져오는 공통 컴포넌트
  this._backAlert = new Tw.BackAlert(this.$container, true); // x 버튼 클릭 시 alert 띄우는 컴포넌트

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._validationService = new Tw.ValidationService(this.$container, this.$container.find('.fe-check-pay')); // validation check
  this._focusService = new Tw.InputFocusService(this.$container, this.$container.find('.fe-check-pay')); // 키패드 이동 클릭 시 다음 input으로 이동

  this._paymentCommon.selectLine();
  this._init();
};

Tw.MyTFareBillSkpay.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  /**
   * @function
   * @desc initialize variables
   */
  _initVariables: function () {
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardTypeSelector = this.$container.find('.fe-select-card-type');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$refundBank = this.$container.find('.fe-select-refund-bank');
    this.$refundNumber = this.$container.find('.fe-refund-account-number');
    this.$refundCheckBox = this.$container.find('.fe-refund-check-btn');
    this.$refundInputBox = this.$container.find('.fe-refund-input');
    this.$payBtn = this.$container.find('.fe-check-pay');

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
   * @desc 환불계좌 옵션으로 자동납부계좌가 존재할 경우 자동납부계좌/수동입력 선택 이벤트
   * @param event
   */
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
  /**
   * @function
   * @desc 환불계좌 체크박스 선택 이벤트 처리
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
      this._checkIsAbled();
    } else {
      $parentTarget.removeClass('on');
      this.$payBtn.removeAttr('disabled');
    }

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
   * @desc actionsheet event binding
   * @param $target - 클릭한 버튼 객체
   * @param $layer - actionsheet 객체
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
   * @desc 선택한 값 셋팅
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
   * @desc 은행리스트 가져오는 공통 컴포넌트 호출
   * @param event
   */
  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this));
  },
  /**
   * @function
   * @desc 필수값 유효성 검증 및 버튼 활성화 처리
   */
  _checkIsAbled: function () {
    this._validationService.checkIsAbled(); // 공통 validation service 호출
  },
    /**
   * @function
   * @desc SK pay 납부는 1,000 미만은 불가. 1,000 이상만 가능
   */
  _checkIsPayLimit: function () {
    var amount = this._paymentCommon.getAmount();
    if (amount < 1000) {
      Tw.Error(Tw.ALERT_MSG_SKPAY.PAY_LIMIT.CODE, Tw.ALERT_MSG_SKPAY.PAY_LIMIT.CONTENTS).pop();
      return false;
    }
    return true;
  },
  /**
   * @function
   * @desc 모든 유효성 검증 후 납부내역 확인 풀팝업 load
   * @param e
   */
  _checkPay: function (e) {
    if (this._checkIsPayLimit() && this._validationService.isAllValid()) {
      this._popupService.open({
        'hbs': 'MF_01_01_01',
        'title': Tw.MYT_FARE_PAYMENT_NAME.SKPAY,
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
   * @desc x버튼 클릭 시 공통 confirm 노출
   */
  _onClose: function () {
    this._backAlert.onClose();
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
    this._payBtn.click(_.debounce($.proxy(this._goSkpay, this), 500)); // SK pay로 이동
  },
  /**
   * @function
   * @desc 납부내역 확인 팝업에 데이터 셋팅
   * @param $layer
   */
  _setData: function ($layer) {
    var data = this._getData();

    $layer.find('.fe-payment-option-name').attr('id', this.$cardNumber.attr('data-code')).text(this.$cardNumber.attr('data-name'));
    $layer.find('.fe-payment-option-number').attr('id', data.cardNum).text(data.cardNum);
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
    var isRefundInput = this.$refundInputBox.hasClass('checked');

    var data = {};
    data.cardNum = $.trim(this.$cardNumber.val());

    if (this.$refundCheckBox.hasClass('on')) {
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
   * @desc SK pay 납부 API 호출
   * @param e
   */
  _goSkpay: function (e) {
    try {
      this._encryptedUserAgent = SKpaySDK.generateUserAgent();
      var _name = this.svcNumber + this.$container.find('.fe-multi-line').text();
      var _itemsOffered = [];
      var billDetailList = this._paymentCommon.getBillDetailList();
      if(billDetailList){
        for (var i in billDetailList) {
          var item = {
            identifier: billDetailList[i].billSvcMgmtNum, //billSvcMgmtNum
            name : billDetailList[i].invDt,
            price : billDetailList[i].payAmt,
            category: "미납요금", //fix
            provider: {
              "identifier": billDetailList[i].billAcntNum //청구계정번호(bill_acnt_num)
            }
          };
          _itemsOffered.push(item);
        }
      }
      var _acceptedPaymentMethods = [];
      _acceptedPaymentMethods.push({ category: "CreditCard"});
      _acceptedPaymentMethods.push({ category: "DebitCard"});
      _acceptedPaymentMethods.push({ category: "DirectDebit"});
  
      var dateReq = {
        "acntNum": this.acntNum, //계정번호
        "totPayAmt": this._paymentCommon.getAmount().toString(), //총 금액
        "payOvrBankCd": this.$container.find('.fe-payment-refund').attr('id'),
        "payOvrBankNum": this.$container.find('.fe-payment-refund').attr('data-num'),
        "encryptedUserAgent": this._encryptedUserAgent, //User Agent
        "offer": {
          "identifier": this.svcMgmtNum, //SvcMgmtNum : 대표서비스 넘버
          "name": 'SKT 요금', //fix
          "price": this._paymentCommon.getAmount().toString(), //청구금액
          "itemsOffered": _itemsOffered,
          "acceptedPaymentMethods": _acceptedPaymentMethods,
          "offeredBy": {
            "identifier": "skt-tworld" //fix
          }
        }
      };

      this._apiService.request(Tw.API_CMD.BFF_07_0095, dateReq)
        .done($.proxy(this._onSuccessSkpayAuth, this))
        .fail($.proxy(this._onFailSkpayAuth, this));
    } catch (e) {
      if (e instanceof ReferenceError) {
        Tw.Error(Tw.ALERT_MSG_SKPAY.NOT_RESPONSE.CODE, Tw.ALERT_MSG_SKPAY.NOT_RESPONSE.CONTENTS).pop();
      }
    }
  },
  /**
   * @function
   * @desc SK pay 납부 API 성공 시 SK Pay 페이지 호출
   * @param resp
   */
  _onSuccessSkpayAuth: function (resp) {
    Tw.CommonHelper.endLoading('.popup-page');
    if (resp.code === Tw.API_CODE.CODE_00) {
      this._popupService.close();
      SKpaySDK.performPaymentWithUI({
        authorizationGrant: resp.result.authorizationGrant,
        offerToken: resp.result.offerToken,
        orderNumber: resp.result.orderNumber,
        redirectUri: this.redirectUri + '?dataKey=' + resp.result.orderNumber
      });
    }
    else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  /**
   * Error callback for _requestMembershipJoin
   * @param resp
   * @private
   */
  _onFailSkpayAuth: function (resp) {
    Tw.CommonHelper.endLoading('.popup-page');
    Tw.Error(resp.code, resp.msg).pop();
  },
  /**
   * @function
   * @desc 요청 파라미터 생성
   * @returns {{payOvrAutoYn: string|string, payOvrBankCd, payOvrBankNum, payOvrCustNm: string, bankOrCardCode, bankOrCardName,
   * bankOrCardAccn, ccPwd: string, cdexpy: string, cdexpm: string, instmm, unpaidBillList: *|Array}}
   */
  _makeRequestData: function () {

    var reqData = {
      payOvrAutoYn: this._refundAutoYn,
      payOvrBankCd: this.$container.find('.fe-payment-refund').attr('id'),
      payOvrBankNum: this.$container.find('.fe-payment-refund').attr('data-num'),
      payOvrCustNm: $.trim(this.$container.find('.fe-name').text()),
      bankOrCardCode: this.$container.find('.fe-payment-option-name').attr('id'),
      bankOrCardName: this.$container.find('.fe-payment-option-name').text(),
      bankOrCardAccn: this.$container.find('.fe-payment-option-number').attr('id'),
      ccPwd: $.trim(this.$cardPw.val()),
      cdexpy: $.trim(this.$cardY.val()).substr(2, 2),
      cdexpm: $.trim(this.$cardM.val()),
      instmm: this.$cardTypeSelector.attr('id'),
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
