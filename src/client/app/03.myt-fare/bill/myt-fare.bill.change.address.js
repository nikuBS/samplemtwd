/**
 * FileName: myt-fare.bill.change.address.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.13
 */

Tw.MyTFareBillChangeAddress = function (rootEl) {
  this.$container = rootEl;
  this.$isValid = true;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._validation = Tw.ValidationHelper;

  this._init();
};

Tw.MyTFareBillChangeAddress.prototype = {
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
    this.$layer.on('keyup', '.required-input-field', $.proxy(this._setChangeBtnAble, this));
    this.$layer.on('keyup', '.fe-phone', $.proxy(this._checkNumber, this));
    this.$layer.on('input', '.fe-phone', $.proxy(this._setMaxValue, this));
    this.$layer.on('blur', '.fe-phone', $.proxy(this._checkPhoneNumber, this));
    this.$layer.on('click', '.cancel', $.proxy(this._setChangeBtnAble, this));
    this.$layer.on('click', '.fe-post', $.proxy(this._getPostcode, this));
    this.$layer.on('click', '.fe-change', $.proxy(this._changeAddress, this));
  },
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);

    this._addHipen(target);
    this._setChangeBtnAble();
  },
  _setMaxValue: function (event) {
    var $target = $(event.currentTarget);
    var maxLength = $target.attr('maxLength');
    if ($target.attr('maxLength')) {
      if ($target.val().length >= maxLength) {
        $target.val($target.val().slice(0, maxLength));
      }
    }
  },
  _checkPhoneNumber: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 12));
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
    this._setChangeBtnAble();
    new Tw.CommonPostcodeMain(this.$layer);
  },
  _setChangeBtnAble: function () {
    if (!Tw.FormatHelper.isEmpty($.trim(this.$layer.find('.fe-phone').val())) &&
      !Tw.FormatHelper.isEmpty($.trim(this.$layer.find('.fe-detail-address').val()))) {
      this.$layer.find('.fe-change').removeAttr('disabled');
    } else {
      this.$layer.find('.fe-change').attr('disabled', 'disabled');
    }
  },
  _changeAddress: function () {
    if (this.$isValid) {
      this._apiService.request(Tw.API_CMD.BFF_05_0147, this._makeRequestData())
        .done($.proxy(this._changeSuccess, this))
        .fail($.proxy(this._changeFail, this));
    }
  },
  _makeRequestData: function () {
    this._changeData = {
      billSvcNum: $.trim(this.$layer.find('.fe-phone').val()),
      zip: $.trim(this.$layer.find('.fe-zip').val()),
      basAddr: $.trim(this.$layer.find('.fe-main-address').val()),
      dtlAddr: $.trim(this.$layer.find('.fe-detail-address').val())
    };
    return this._changeData;
  },
  _changeSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setChangedData();

      this.$isChanged = true;
      this._popupService.close();
    } else {
      this._changeFail(res);
    }
  },
  _changeFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _setChangedData: function () {
    this.$container.find('.fe-phone').text(this._changeData.billSvcNum);
    this.$container.find('.fe-zip').text(this._changeData.zip);
    this.$container.find('.fe-addr1').text(this._changeData.basAddr);
    this.$container.find('.fe-addr2').text(this._changeData.dtlAddr);
  }
};