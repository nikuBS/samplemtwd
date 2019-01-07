/**
 * FileName: myt-fare.bill.option.sms.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.12.17
 */

Tw.MyTFareBillOptionSms = function (rootEl) {
  this.$container = rootEl;
  this.$bankList = [];

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._getBankList();
};

Tw.MyTFareBillOptionSms.prototype = {
  _getBankList: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0026, {})
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setBankList(res.result.virtualBankList);
    } else {
      this._fail(res);
    }
  },
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
  _bindEvent: function () {
    this.$container.on('click', '.fe-select-bank', $.proxy(this._selectBankList, this));
    this.$container.on('click', '.fe-request', $.proxy(this._request, this));
  },
  _selectBankList: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this.$bankList,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target));
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

    this.$container.find('.fe-request').removeAttr('disabled');
    this._popupService.close();
  },
  _request: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0064, {
      acntNum: Tw.UrlHelper.getQueryParams().num,
      billSmsYn: 'Y',
      bankCd1: this.$container.find('.fe-select-bank').attr('id')
    }).done($.proxy(this._smsSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _smsSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-fare/bill/option?type=sms');
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};