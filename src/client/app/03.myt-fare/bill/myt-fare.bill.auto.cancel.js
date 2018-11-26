/**
 * FileName: myt-fare.bill.auto.cancel.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 */

Tw.MyTFareBillAutoCancel = function (rootEl, $layer) {
  this.$container = rootEl;
  this.$layer = $layer;
  this.$bankList = [];
  this.$infoBox = this.$container.find('.fe-info');

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._bindEvent();
};

Tw.MyTFareBillAutoCancel.prototype = {
  _bindEvent: function () {
    this.$layer.on('click', '.fe-go-cancel', $.proxy(this._cancel, this));
  },
  _cancel: function () {
    var reqData = this._makeRequestData();
    this._apiService.request(Tw.API_CMD.BFF_07_0063, reqData)
      .done($.proxy(this._cancelSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _cancelSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var link = null;
      var linkText = null;
      var subMessage = null;

      if (!(Tw.FormatHelper.isEmpty(res.result.depositBankList))) {
        link = {
          hbs: 'MF_05_01_03',
          open: $.proxy(this._openSmsInfo, this, res.result.depositBankList),
          close: $.proxy(this._closeSmsInfo, this),
          name: 'sms'
        };
        linkText = Tw.MYT_FARE_PAYMENT_NAME.GO_SMS;
        subMessage = Tw.MYT_FARE_PAYMENT_NAME.SMS_MESSAGE;
      }

      this._popupService.afterRequestSuccess(link, '/myt-fare/bill/option',
        linkText, Tw.MYT_FARE_PAYMENT_NAME.CANCEL, subMessage);
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _makeRequestData: function () {
    var $selectBox = this.$layer.find('.fe-select-payment-option');
    var reqData = {
      acntNum: this.$infoBox.attr('data-acnt-num'),
      payerNumClCd: this.$infoBox.attr('data-payer-num-cl-cd'),
      payMthdCd: this.$infoBox.attr('data-pay-mthd-cd'),
      newPayMthdCd: $selectBox.find('.checked').attr('id'),
      bankCardCoCd: this.$infoBox.attr('data-bank-card-co-cd'),
      bankPrtYn: this.$infoBox.attr('data-bank-prt-yn'),
      serNum: this.$infoBox.attr('data-ser-num'),
      authReqSerNum: this.$infoBox.attr('data-auth-req-ser-num'),
      rltmSerNum: this.$infoBox.attr('data-rltm-ser-num')
    };
    return reqData;
  },
  _openSmsInfo: function (bankList, $layer) {
    this.$layer = $layer;
    $layer.on('click', '.fe-select-bank', $.proxy(this._setBankList, this, bankList));
    $layer.on('click', '.fe-request', $.proxy(this._request, this));
  },
  _closeSmsInfo: function () {
    if (this.$isComplete) {
      this._historyService.goLoad('/myt-fare/bill/option?type=sms');
    }
  },
  _setBankList: function (bankList, event) {
    if (Tw.FormatHelper.isEmpty(this.$bankList)) {
      var list = [];
      var listObj = {
        'list': []
      };

      for (var i = 0; i < bankList.length; i++) {
        var obj = {
          'option': 'bank-name',
          'attr': 'id="' + bankList[i].bankCd + '"',
          'value': bankList[i].bankNm
        };
        listObj.list.push(obj);
      }
      list.push(listObj);
      this.$bankList = list;
    }
    this._selectBankList(event);
  },
  _selectBankList: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_BANK,
      data: this.$bankList
    }, $.proxy(this._selectPopupCallback, this, $target));
  },
  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '.bank-name', $.proxy(this._setSelectedValue, this, $target));
  },
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.text());

    this.$layer.find('.fe-request').removeAttr('disabled');
    this._popupService.close();
  },
  _request: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0064, {
      acntNum: this.$infoBox.attr('data-acnt-num'),
      billSmsYn: 'Y',
      bankCd1: this.$layer.find('.fe-select-bank').attr('id')
    }).done($.proxy(this._smsSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  _smsSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$isComplete = true;
      this._popupService.close();
    } else {
      this._fail(res);
    }
  }
};