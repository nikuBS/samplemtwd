/**
 * @file myt-fare.bill.$banklist.js
 * @author Jayoon Kong
 * @since 2018.09.19
 * @desc 요금납부 [은행 선택] 셀렉트박스 선택 시 은행리스트 가져오는 공통 모듈
 */

/**
 * @namespace
 * @desc 은행리스트 namespace
 * @param rootEl - dom 객체
 * @param bankList - 기존에 조회된 bank list
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
  /**
   * @function
   * @desc 다른 모듈에서 호출하는 초기함수
   * @param event
   * @param callback
   */
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
  /**
   * @function
   * @desc list event binding
   * @param $layer
   */
  _onOpenList: function ($layer) {
    var $id = this.$currentTarget.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._getSelectedBank, this)); // 선택 시 이벤트
    $layer.on('click', '.fe-popup-close', $.proxy(this._checkSelected, this)); // 닫기 이벤트
  },
  /**
   * @function
   * @desc 선택한 은행 버튼에 셋팅
   * @param event
   */
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
  /**
   * @function
   * @desc 선택한 값이 있는지 체크
   */
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$currentTarget.attr('id'))) {
      this.$currentTarget.parents('.fe-bank-wrap').find('.fe-bank-error-msg').show().attr('aria-hidden', 'false');
      this.$currentTarget.focus();
    }
    this._popupService.close();
  },
  /**
   * @function
   * @desc 은행리스트 조회 API 호출
   */
  _getBankList: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0022, {}) // 은행리스트 가져오는 API 호출
      .done($.proxy(this._getBankListSuccess, this))
      .fail($.proxy(this._getBankListFail, this));
  },
  /**
   * @function
   * @desc 은행리스트 조회 API 응답 처리 (성공)
   * @param res
   */
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
  /**
   * @function
   * @desc 은행리스트 조회 API 응답 처리 (실패)
   * @param err
   */
  _getBankListFail: function (err) {
    Tw.Error(err.code, err.msg).pop(null, this.$currentTarget);
  },
  /**
   * @function
   * @desc 조회된 은행리스트를 actionsheet format에 맞춰 변수에 저장
   * @param bankList
   * @param isData - API 조회 데이터 여부
   * @param type - 은행계좌/환불계좌 구분
   */
  _setBankList: function (bankList, isData, type) {
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
  /**
   * @function
   * @desc open banklist actionsheet
   */
  _openBank: function () {
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this.$isBank ? this.$accountBankList : this.$refundBankList,
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._onOpenList, this), null, null, this.$currentTarget);
  }
};