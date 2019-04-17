/**
 * @file myt-fare.bill.option.sms.js
 * @author Jayoon Kong
 * @since 2018.12.17
 * @desc 자동납부 해지 후 문자 알림서비스 신청
 */

/**
 * @namespace
 * @desc 문자 알림서비스 신청 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTFareBillOptionSms = function (rootEl) {
  this.$container = rootEl;
  this.$bankList = [];
  this.$requestBtn = this.$container.find('.fe-request');

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._getBankList(); // 입금전용계좌 리스트
};

Tw.MyTFareBillOptionSms.prototype = {
  /**
   * @function
   * @desc 입금전용계좌 API 호출
   */
  _getBankList: function () {
    var $target = this.$container.find('.fe-common-back');
    this._apiService.request(Tw.API_CMD.BFF_07_0026, {})
      .done($.proxy(this._getSuccess, this, $target))
      .fail($.proxy(this._fail, this, $target));
  },
  /**
   * @function
   * @desc 입금전용계좌 API 응답 처리
   * @param $target
   * @param res
   */
  _getSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setBankList(res.result.virtualBankList);
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc set banklist data
   * @param bankList
   */
  _setBankList: function (bankList) {
    if (!Tw.FormatHelper.isEmpty(bankList)) {
      var list = [];
      var listObj = {
        'list': []
      };

      for (var i = 0; i < bankList.length; i++) {
        var obj = {
          'label-attr': 'id="' + bankList[i].bankCd + '"',
          'radio-attr': 'id="' + bankList[i].bankCd + '" name="r2"',
          'txt': bankList[i].sBankNm + ' ' + bankList[i].sVirtualBankNum
        };
        listObj.list.push(obj);
      }
      list.push(listObj);
      this.$bankList = list;
    }
    this._bindEvent();
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-select-bank', $.proxy(this._selectBankList, this));
    this.$requestBtn.click(_.debounce($.proxy(this._request, this), 500)); // 납부하기
  },
  /**
   * @function
   * @desc banklist actionsheet load
   * @param event
   */
  _selectBankList: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this.$bankList,
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
   * @desc 선택된 값 셋팅
   * @param $target
   * @param event
   */
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.parents('label').text());

    this.$container.find('.fe-request').removeAttr('disabled');
    this._popupService.close();
  },
  /**
   * @function
   * @desc 문자 알림서비스 신청 API 호출
   * @param e
   */
  _request: function (e) {
    var $target = $(e.currentTarget);
    this._apiService.request(Tw.API_CMD.BFF_07_0064, {
      acntNum: Tw.UrlHelper.getQueryParams().num, // 이전 화면에서 넘어온 정보
      billSmsYn: 'Y',
      bankCd1: this.$container.find('.fe-select-bank').attr('id')
    }).done($.proxy(this._smsSuccess, this, $target))
      .fail($.proxy(this._fail, this, $target));
  },
  /**
   * @function
   * @desc 문자 알림서비스 신청 API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _smsSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/option?type=sms');
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc 문자 알림서비스 신청 API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  }
};