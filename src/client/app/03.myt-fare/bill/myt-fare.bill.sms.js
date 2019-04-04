/**
 * @file myt-fare.bill.sms.js
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.09.17
 * Annotation: 요금납부 시 입금전용계좌 SMS 신청
 */

Tw.MyTFareBillSms = function (rootEl) {
  this.$container = rootEl;
  this.$accountSelector = this.$container.find('.fe-account-selector');
  this.$accountList = this.$container.find('.fe-account-list');

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;

  this._paymentCommon = new Tw.MyTFareBillCommon(rootEl); // 납부할 회선 선택하는 공통 컴포넌트
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl, true); // x 버튼 클릭 시 alert 띄우는 컴포넌트

  this._init();
};

Tw.MyTFareBillSms.prototype = {
  _init: function () {
    this._bindEvent();
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-account-selector', $.proxy(this._selectAccountList, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
    this.$container.on('click', '.fe-pay', $.proxy(this._pay, this));
  },
  _selectAccountList: function (event) {
    // 입금전용계좌 조회
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this._getAccountList(),
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

    this._popupService.close();
  },
  _getAccountList: function () {
    // 리스트 만들기
    var accountList = [];
    var listObj = {
      'list': []
    };
    this.$accountList.find('li').each(function () {
      var $this = $(this);
      var obj = {
        'label-attr': 'id="' + $this.attr('id') + '"',
        'radio-attr': 'id="' + $this.attr('id') + '" name="r2"',
        'txt': $this.text()
      };
      listObj.list.push(obj);
    });
    accountList.push(listObj);

    return accountList;
  },
  _onClose: function () {
    this._backAlert.onClose();
  },
  _isChanged: function () {
    var $amount = this.$container.find('.fe-amount');
    if ($amount.is(':visible')) {
      if (Tw.FormatHelper.addComma($amount.attr('data-value')) !== $amount.text()) {
        return true;
      }
    }
    return this.$accountSelector.attr('id') !== this.$accountSelector.attr('data-origin-id');
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.closeAll();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  },
  _pay: function (e) {
    var $target = $(e.currentTarget);
    this._apiService.request(Tw.API_CMD.BFF_07_0027, { msg: $.trim(this.$accountSelector.text()) })
      .done($.proxy(this._paySuccess, this, $target))
      .fail($.proxy(this._payFail, this, $target));
  },
  _paySuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var svcNum = '';
      if (!Tw.FormatHelper.isEmpty(res.result.svcNum)) {
        svcNum = Tw.FormatHelper.conTelFormatWithDash(res.result.svcNum);
      }
      this._historyService.replaceURL('/myt-fare/bill/pay-complete?type=sms&svcNum=' + svcNum);
    } else {
      this._payFail($target, res);
    }
  },
  _payFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  }
};