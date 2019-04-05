/**
 * FileName: myt-fare.bill.option.register.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 * Annotation: 자동납부 신청 및 변경
 */

Tw.MyTFareBillOptionRegister = function (rootEl, bankList) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-pay'), true, true); // 유효성 검증
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-pay')); // 이동 키 클릭 시 다음 input으로 이동
  this._backAlert = new Tw.BackAlert(rootEl, true); // x 버튼 클릭 시 alert

  if (!(Tw.FormatHelper.isEmpty(bankList) || bankList === '[]')) {
    bankList = JSON.parse(window.unescape(bankList)); // 은행리스트(컨트롤러에서 조회)
  }
  this._bankList = new Tw.MyTFareBillBankList(rootEl, bankList); // 미리 조회된 은행리스트 전송

  this._init();
};

Tw.MyTFareBillOptionRegister.prototype = {
  _init: function () {
    this._validationService.bindEvent();
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {
    this.$radioBox = this.$container.find('.fe-radio-box');
    this.$infoWrap = this.$container.find('.fe-info-wrap');
    this.$selectedWrap = this.$container.find('.fe-bank-wrap');
    this.$bankWrap = this.$container.find('.fe-bank-wrap');
    this.$cardWrap = this.$container.find('.fe-card-wrap');
    this.$selectBank = this.$bankWrap.find('.fe-select-bank');
    this.$accountNumber = this.$bankWrap.find('.fe-account-number');
    this.$accountPhoneNumber = this.$bankWrap.find('.fe-phone-number');
    this.$cardPhoneNumber = this.$cardWrap.find('.fe-phone-number');
    this.$cardNumber = this.$cardWrap.find('.fe-card-number');
    this.$cardY = this.$cardWrap.find('.fe-card-y');
    this.$cardM = this.$cardWrap.find('.fe-card-m');
    this.$paymentDate = this.$cardWrap.find('.fe-payment-date');
    this.$payBtn = this.$container.find('.fe-pay');
    this.$isRadioChanged = false;
    this.$isAccountTabValid = false;
    this.$isCardTabValid = false;
    this.$isCardValid = true;
    this.$isFirstChange = true;
  },
  _bindEvent: function () {
    this.$radioBox.on('change', $.proxy(this._changeRadioBox, this));
    this.$container.on('click', '.fe-select-bank', $.proxy(this._selectBank, this));
    this.$container.on('click', '.fe-payment-date', $.proxy(this._changePaymentDate, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
    this.$payBtn.click(_.debounce($.proxy(this._submit, this), 500)); // 납부하기
  },
  _changeRadioBox: function (event) {
    // 라디오버튼 change에 따른 값 셋팅
    this.$isRadioChanged = true;

    var $target = $(event.target);
    var className = $target.attr('class');

    if (className === 'fe-bank') {
      this.$isCardValid = true;
    } else {
      this.$isCardValid = false;
    }
    this.$selectedWrap = this.$container.find('.' + className + '-wrap');

    this.$selectedWrap.show();
    this.$selectedWrap.siblings('.fe-wrap').hide();

    this._checkIsAbled();

    // 첫 change일 경우 유효성 검증 서비스 새로 호출
    if (this.$isFirstChange) {
      this._validationService.bindEvent();
    }
    this.$isFirstChange = false;
  },
  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this)); // 은행리스트 관련 공통 컴포넌트 호출
  },
  _checkIsAbled: function () {
    this._validationService.checkIsAbled();
  },
  _changePaymentDate: function (event) {
    var $target = $(event.currentTarget);

    // 카드납부 시 납부일 선택
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_CARD_DATE,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target), null, null ,$target);
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
    $target.text($selectedValue.parents('label').text());

    this._popupService.close();
  },
  _submit: function () {
    if (this._validationService.isAllValid()) {
      var reqData = this._makeRequestData();
      var apiName = this._getApiName();

      // 자동납부 신청 및 변경
      Tw.CommonHelper.startLoading('.container', 'grey');
      this._apiService.request(apiName, reqData)
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    }
  },
  _success: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.container');
      this._historyService.replaceURL('/myt-fare/bill/option?type=' + this.$infoWrap.attr('id'));
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code, err.msg).replacePage();
  },
  _makeRequestData: function () {
    var reqData = {}; // 요청 파라미터 (컨트롤러에서 BFF_07_0060 호출 후 가져온 정보를 그대로 전송함)
    reqData.acntNum = this.$infoWrap.attr('data-acnt-num');
    reqData.payMthdCd = this.$selectedWrap.attr('id');
    reqData.payerNumClCd = this.$infoWrap.attr('data-payer-num-cl-cd');
    reqData.serNum = this.$infoWrap.attr('data-ser-num');
    reqData.authReqSerNum = this.$infoWrap.attr('data-auth-req-ser-num');
    reqData.rltmSerNum = this.$infoWrap.attr('data-rltm-ser-num');

    if (this.$selectedWrap.hasClass('fe-bank-wrap')) { // 계좌이체일 경우 정보
      reqData.bankCardNum = $.trim(this.$accountNumber.val());
      reqData.bankCardCoCd = this.$selectBank.attr('id').toString();
      reqData.cntcNum = $.trim(this.$accountPhoneNumber.val());
    } else { // 카드납부일 경우 정보
      reqData.bankCardNum = $.trim(this.$cardNumber.val());
      reqData.cardEffYm = $.trim(this.$cardY.val()) + $.trim(this.$cardM.val());
      reqData.cntcNum = $.trim(this.$cardPhoneNumber.val());
      reqData.drwts = this.$paymentDate.attr('id').toString();
    }

    if (this.$infoWrap.attr('id') === 'new') {
      reqData.fstDrwSchdDt = this.$infoWrap.attr('data-fst-drw-schd-dt'); // 신청일 경우 정보 추가
    }
    return reqData;
  },
  _getApiName: function () {
    var apiName = '';
    if (this.$infoWrap.attr('id') === 'new') {
      apiName = Tw.API_CMD.BFF_07_0061; // 자동납부 신청
    } else {
      apiName = Tw.API_CMD.BFF_07_0062; // 자동납부 변경
    }
    return apiName;
  },
  _onClose: function () {
    this._backAlert.onClose();
  },
  _isChanged: function () {
    var isValid = this.$isRadioChanged;

    if (!isValid) {
      if (this.$selectedWrap.hasClass('fe-bank-wrap')) {
        isValid = !Tw.FormatHelper.isEmpty(this.$accountPhoneNumber.val()) || !Tw.FormatHelper.isEmpty(this.$accountNumber.val()) ||
          !Tw.FormatHelper.isEmpty(this.$container.find('.fe-select-bank').attr('id'));
      } else {
        isValid = !Tw.FormatHelper.isEmpty(this.$cardPhoneNumber.val()) || !Tw.FormatHelper.isEmpty(this.$cardNumber.val()) ||
          !Tw.FormatHelper.isEmpty(this.$cardY.val()) || !Tw.FormatHelper.isEmpty(this.$cardM.val());
      }
    }
    return isValid;
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.closeAll();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  }
};