/**
 * FileName: myt-fare.payment.change.address.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.13
 */

Tw.MyTFarePaymentChangeAddress = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._init();
};

Tw.MyTFarePaymentChangeAddress.prototype = {
  _init: function () {
    this._popupService.open({
      'hbs':'MF_05_02_02'
    },
      $.proxy(this._openChangeAddress, this),
      $.proxy(this._setToast, this),
      'address');
  },
  _openChangeAddress: function ($layer) {
    this.$layer = $layer;

    this._setInitData();
    this._bindEvent();
  },
  _setToast: function () {
    if (this.$isChanged) {
      this._commonHelper.toast(Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE);
    }
  },
  _setInitData: function () {
    this.$layer.find('.fe-phone').val(this.$container.find('.fe-phone').text());
    this.$layer.find('.fe-zip').val(this.$container.find('.fe-zip-code').attr('id'));
    this.$layer.find('.fe-main-address').val(this.$container.find('.fe-addr1').text());
    this.$layer.find('.fe-detail-address').val(this.$container.find('.fe-addr2').text());
  },
  _bindEvent: function () {
    this.$layer.on('keyup', '.fe-phone', $.proxy(this._checkNumber, this));
    this.$layer.on('keypress', '.fe-phone', $.proxy(this._setMaxValue, this));
    this.$layer.on('click', '.fe-post', $.proxy(this._getPostcode, this));
    this.$layer.on('change', '.fe-change-field', $.proxy(this._setChangeBtnAble, this));
    this.$layer.on('click', '.fe-change', $.proxy(this._changeAddress, this));
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);

    this._addHipen(target);
  },
  _setMaxValue: function (event) {
    var $target = $(event.currentTarget);
    return $target.val().length < $target.attr('maxLength');
  },
  _addHipen: function (target) {
    var target_val = target.value.replace(/\D[^\.]/g, '');

    if (target_val.length <= 10) {
      target.value = target_val.slice(0, 3) + '-' + target_val.slice(3, 6) + '-' + target_val.slice(6);
    } else {
      target.value = target_val.slice(0, 3) + '-' + target_val.slice(3, 7) + '-' + target_val.slice(7);
    }
  },
  _getPostcode: function () {
    new Tw.CommonPostcodeMain(this.$layer);
  },
  _setChangeBtnAble: function () {
    if (!(Tw.FormatHelper.isEmpty($.trim(this.$layer.find('.fe-phone').val())))) {
      this.$layer.find('.fe-change').removeAttr('disabled');
    } else {
      this.$layer.find('.fe-change').attr('disabled', 'disabled');
    }
  },
  _changeAddress: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0147, this._makeRequestData())
      .done($.proxy(this._changeSuccess, this))
      .fail($.proxy(this._changeFail, this));
  },
  _makeRequestData: function () {
    return {
      billSvcNum: $.trim(this.$layer.find('.fe-phone').val()),
      zip: $.trim(this.$layer.find('.fe-zip').val()),
      basAddr: $.trim(this.$layer.find('.fe-main-address').val()),
      dtlAddr: $.trim(this.$layer.find('.fe-detail-address').val())
    };
  },
  _changeSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$isChanged = true;
      this._popupService.close();
    } else {
      this._changeFail(res);
    }
  },
  _changeFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};