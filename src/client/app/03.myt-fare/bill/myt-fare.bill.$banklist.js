/**
 * @file myt-fare.bill.$banklist.js
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.09.19
 * Annotation: 요금납부 [은행 선택] 셀렉트박스 선택 시 은행리스트 가져오는 공통 모듈
 */

Tw.MyTFareBillBankList = function (rootEl, bankList) {
  this.$accountBankList = [];
  this.$refundBankList = [];
  this.$currentTarget = null;
  this.$container = rootEl;

  if (!Tw.FormatHelper.isEmpty(bankList)) {
    this._setBankList(bankList); // 자동납부 신청 및 변경일 경우 기존 bankList를 받아옴
  }

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
};

Tw.MyTFareBillBankList.prototype = {
  init: function (event, callback) {
    this.$currentTarget = $(event.currentTarget);
    this.$isBank = this.$currentTarget.hasClass('fe-account-bank'); // 계좌이체 납부 대상 selector (환불계좌아님)

    if (callback !== undefined) {
      this._callbackFunction = callback;
    }

    if (Tw.FormatHelper.isEmpty(this.$refundBankList) && Tw.FormatHelper.isEmpty(this.$accountBankList)) {
      this._getBankList(); // 저장된 은행리스트가 없으면 API 호출 (최초 1회)
    } else {
      this._openBank(); // 은행리스트가 저장되어 있으면 바로 open
    }
  },
  _onOpenList: function ($layer) {
    var $id = this.$currentTarget.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._getSelectedBank, this)); // 선택 시 이벤트
    $layer.on('click', '.fe-popup-close', $.proxy(this._checkSelected, this)); // 닫기 이벤트
  },
  _getSelectedBank: function (event) {
    var $selectedBank = this.$currentTarget;
    var $target = $(event.target);
    $selectedBank.attr('id', $target.attr('id'));
    $selectedBank.text($target.parents('label').text());

    this.$currentTarget.parents('.fe-bank-wrap').find('.fe-bank-error-msg').hide().attr('aria-hidden', 'true');
    this._popupService.close();

    if (this._callbackFunction !== undefined) {
      var callbackFunction = this._callbackFunction;
      callbackFunction();
    }
  },
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$currentTarget.attr('id'))) {
      this.$currentTarget.parents('.fe-bank-wrap').find('.fe-bank-error-msg').show().attr('aria-hidden', 'false');
      this.$currentTarget.focus();
    }
    this._popupService.close();
  },
  _getBankList: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0022, {}) // 은행리스트 가져오는 API 호출
      .done($.proxy(this._getBankListSuccess, this))
      .fail($.proxy(this._getBankListFail, this));
  },
  _getBankListSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var result = res.result;
      // 납부할 은행리스트에 값이 있으면 셋팅하고 없으면 환불계좌리스트로 셋팅
      var accountList = Tw.FormatHelper.isEmpty(result.payBankList) ? result.payovrBankList : result.payBankList;

      this._setBankList(accountList, true, 'account'); // 납부할 은행리스트
      this._setBankList(result.payovrBankList, true, 'refund'); // 환불계좌 리스트
      this._openBank();
    } else {
      this._getBankListFail(res);
    }
  },
  _getBankListFail: function (err) {
    Tw.Error(err.code, err.msg).pop(null, this.$currentTarget);
  },
  _setBankList: function (bankList, isData, type) { // 조회된 은행리스트를 actionsheet format에 맞춰 변수에 저장
    var formatList = [];
    for (var i = 0; i < bankList.length; i++) {
      var bankObj = {
        'label-attr': 'id=' + bankList[i].bankCardCoCd,
        'radio-attr': 'id=' + bankList[i].bankCardCoCd + ' name="r2"',
        'txt': bankList[i].bankCardCoNm
      };
      formatList.push(bankObj);
    }

    if (type === 'account') {
      this.$accountBankList.push({ 'list': formatList });
    } else {
      this.$refundBankList.push({ 'list': formatList });
    }
  },
  _openBank: function () {
    // 은행리스트를 actionsheet로 열기
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this.$isBank ? this.$accountBankList : this.$refundBankList,
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._onOpenList, this), null, null, this.$currentTarget);
  }
};