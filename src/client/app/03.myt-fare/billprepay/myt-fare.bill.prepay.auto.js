/**
 * FileName: myt-fare.bill.prepay.auto.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.06
 * Annotation: 소액결제/콘텐츠이용료 자동 선결제 신청 및 변경
 */

Tw.MyTFareBillPrepayAuto = function (rootEl, title, type) {
  this.$container = rootEl;
  this.$title = title;
  this.$type = type;
  this.$isPage = true;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-pay'), true); // 유효성 검증
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-pay')); // 키패드 이동 클릭 시 다음 input으로 이동
  this._backAlert = new Tw.BackAlert(rootEl, true); // x 버튼 클릭 시 공통 얼럿 노출

  this._init();
};

Tw.MyTFareBillPrepayAuto.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();

    this._validationService.bindEvent();
    setTimeout($.proxy(this._checkStandardAmount, this), 100); // 기준금액 체크
  },
  _initVariables: function () {
    this._standardAmountList = [];
    this._prepayAmountList = [];

    this.$standardAmount = this.$container.find('.fe-standard-amount');
    this.$prepayAmount = this.$container.find('.fe-prepay-amount');
    this.$cardWrap = this.$container.find('.fe-card-wrap');
    this.$firstCardNum = this.$container.find('.fe-card-num:first');
    this.$lastCardNum = this.$container.find('.fe-card-num:last');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$changeMoneyInfo = this.$container.find('.fe-change-money-info');
    this.$changeCardInfo = this.$container.find('.fe-change-card-info');
    this.$payBtn = this.$container.find('.fe-pay');
    this.$changeType = 'A';
    this.$isFirstChangeToC = true;
    this.$isFirstChangeToT = true;
  },
  _bindEvent: function () {
    this.$container.on('change', '.fe-change-type', $.proxy(this._changeType, this));
    this.$container.on('click', '.fe-standard-amount', $.proxy(this._selectAmount, this, this._standardAmountList));
    this.$container.on('click', '.fe-prepay-amount', $.proxy(this._selectAmount, this, this._prepayAmountList));
    this.$payBtn.click(_.debounce($.proxy(this._autoPrepay, this), 500));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));

  },
  _checkStandardAmount: function () {
    // 기준금액 0원일 경우 에러 팝업 보여주고 뒤로가기
    if (this.$standardAmount.attr('id') < 1) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.NOT_ALLOWED_AUTO_PREPAY, null, null, $.proxy(this._goBack, this));
    }
  },
  _goBack: function () {
    this._historyService.goBack();
  },
  _changeType: function (event) {
    var $target = $(event.target);

    if ($target.hasClass('fe-money')) { // 금액만
      this.$changeType = 'A';

      this.$cardWrap.hide();
      this.$changeMoneyInfo.show();
      this.$changeCardInfo.hide();
      this.$firstCardNum.hide();
      this.$lastCardNum.hide();

      this._checkSelected();
    } else if ($target.hasClass('fe-card')) { // 카드만
      this.$changeType = 'C';

      this.$cardWrap.show();
      this.$changeMoneyInfo.hide();
      this.$changeCardInfo.hide();
      this.$firstCardNum.hide();
      this.$lastCardNum.show();

      if (this.$isFirstChangeToC) {
        this._validationService.bindEvent();
      }
      this.$isFirstChangeToC = false;
    } else { // 금액 및 카드
      this.$changeType = 'T';

      this.$cardWrap.show();
      this.$changeMoneyInfo.show();
      this.$changeCardInfo.hide();
      this.$firstCardNum.hide();
      this.$lastCardNum.show();

      if (this.$isFirstChangeToT) {
        this._validationService.bindEvent();
      }
      this.$isFirstChangeToT = false;
    }
    this._checkIsAbled();
  },
  _checkIsAbled: function () {
    // 버튼 활성화 체크
    this._validationService.checkIsAbled();
  },
  _selectAmount: function ($list, event) {
    var $target = $(event.currentTarget);
    var $amount = $target.attr('data-max-value');

    // 기준금액 및 선결제 금액 action sheet
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this._getAmountList($list, $amount),
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
    $target.text($selectedValue.parents('label').text());

    // 선택된 값 세팅
    if ($target.hasClass('fe-standard-amount')) {
      this.$prepayAmount.attr('id', $selectedValue.attr('id'));
      this.$prepayAmount.text($selectedValue.parents('label').text());
    }

    this._checkSelected();
    this._popupService.close();
  },
  _checkSelected: function () {
    // 버튼 활성화 체크
    if (this.$prepayAmount.attr('id') !== this.$prepayAmount.attr('data-origin-id') ||
    this.$standardAmount.attr('id') !== this.$standardAmount.attr('data-origin-id')) {
      this._validationService._setButtonAbility($.proxy(this._isAmountValid, this));
    }
  },
  _getAmountList: function ($amountList, $amount) {
    // 기준금액 List로 만드는 작업
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
  _autoPrepay: function (e) {
    // 유효성 검증 후 자동선결제
    if (this._isAmountValid() && this._validationService.isAllValid()) {
      this._pay(e);
    }
  },
  _isAmountValid: function () {
    return this._validation.showAndHideErrorMsg(this.$prepayAmount,
      this._validation.checkIsMoreAndSet(this.$standardAmount, this.$prepayAmount)); // 선결제 금액보다 기준금액이 클 경우 기준금액에 맞게 셋팅
  },
  _pay: function (e) {
    var reqData = this._makeRequestData();
    var apiName = this._getApiName();
    var $target = $(e.currentTarget);

    // 자동선결제 신청 및 변경 API 호출
    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService.request(apiName, reqData)
      .done($.proxy(this._paySuccess, this, $target))
      .fail($.proxy(this._payFail, this, $target));
  },
  _makeRequestData: function () {
    // 조건에 따라 요청 파라미터 셋팅
    var reqData = {
      checkAuto: 'N',
      autoChrgStrdAmt: this.$standardAmount.attr('id'),
      autoChrgAmt: this.$prepayAmount.attr('id')
    };

    if (this.$type === 'change') {
      reqData.checkRadio = this.$changeType;
    }

    if (!(this.$type === 'change' && this.$changeType === 'A')) {
      reqData.cardNum = $.trim(this.$cardNumber.val());
      reqData.cardType = this.$cardNumber.attr('data-code');
      reqData.cardNm = this.$cardNumber.attr('data-name');
      reqData.cardEffYM = $.trim(this.$cardY.val())+ $.trim(this.$cardM.val());
      reqData.cardPwd = $.trim(this.$cardPw.val());
    }
    return reqData;
  },
  _getApiName: function () {
    var apiName = '';
    if (this.$title === 'small') {
      apiName = Tw.API_CMD.BFF_07_0076; // 소액결제
    } else {
      apiName = Tw.API_CMD.BFF_07_0083; // 콘텐츠이용료
    }
    return apiName;
  },
  _paySuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.container');
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=' + this.$title + '&sub=' + this.$type);
    } else {
      this._payFail($target, res);
    }
  },
  _payFail: function ($target, err) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  _onClose: function () {
    this._backAlert.onClose();
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.close();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  }
};