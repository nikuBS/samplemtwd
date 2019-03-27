/**
 * FileName: myt-fare.bill.$banklist.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.19
 * Annotation: 요금납부 [은행 선택] 셀렉트박스 선택 시 은행리스트 가져오는 공통 모듈
 */

Tw.MyTFareBillBankList = function (rootEl, bankList) {
  this.$bankList = [];
  this.$currentTarget = null;
  this.$container = rootEl;

  if (!Tw.FormatHelper.isEmpty(bankList)) {
    this._setBankList(bankList);
  }

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
};

Tw.MyTFareBillBankList.prototype = {
  init: function (event, callback) {
    this.$currentTarget = $(event.currentTarget);
    if (callback !== undefined) {
      this._callbackFunction = callback;
    }

    if (Tw.FormatHelper.isEmpty(this.$bankList)) {
      this._getBankList(); // 저장된 은행리스트가 없으면 API 호출 (최초 1회)
    }
    else {
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
      this._setBankList(res.result.payovrBankList, true);
    } else {
      this._getBankListFail(res);
    }
  },
  _getBankListFail: function (err) {
    Tw.Error(err.code, err.msg).pop(null, this.$currentTarget);
  },
  _setBankList: function (bankList, isData) { // 조회된 은행리스트를 actionsheet format에 맞춰 변수에 저장
    var formatList = [];
    for (var i = 0; i < bankList.length; i++) {
      var bankObj = {
        'label-attr': 'id=' + bankList[i].bankCardCoCd,
        'radio-attr': 'id=' + bankList[i].bankCardCoCd + ' name="r2"',
        'txt': bankList[i].bankCardCoNm
      };
      formatList.push(bankObj);
    }
    this.$bankList.push({
      'list': formatList
    });

    if (isData) {
      this._openBank();
    }
  },
  _openBank: function () {
    // 은행리스트를 actionsheet로 열기
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this.$bankList,
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._onOpenList, this), null, null, this.$currentTarget);
  }
};