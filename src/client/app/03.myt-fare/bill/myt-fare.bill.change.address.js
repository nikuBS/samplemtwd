/**
 * FileName: myt-fare.bill.change.address.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.13
 */

Tw.MyTFareBillChangeAddress = function (rootEl) {
  this.$container = rootEl;
  this.$isValid = true;
  this._phoneModifyYn = 'N';
  this._addrModifyYn = 'N';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._validation = Tw.ValidationHelper;

  this._historyService = new Tw.HistoryService(rootEl);

  this._bindEvent();
};

Tw.MyTFareBillChangeAddress.prototype = {
  _bindEvent: function () {
    this.$container.on('keyup', '.required-input-field', $.proxy(this._setChangeBtnAble, this));
    this.$container.on('keyup', '.fe-phone', $.proxy(this._checkNumber, this));
    this.$container.on('blur', '.fe-phone', $.proxy(this._checkPhoneNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._setChangeBtnAble, this));
    this.$container.on('click', '.fe-post', $.proxy(this._getPostcode, this));
    this.$container.on('click', '.fe-change', $.proxy(this._changeAddress, this));
    // this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
  },
  _checkNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.target);
    var $target = $(event.target);

    if (this._phoneModifyYn === 'N') {
      if (Tw.InputHelper.isDeleteKey(event)) {
        this._phoneModifyYn = 'Y';
        $target.val('');
      }
    }

    $target.val(Tw.FormatHelper.conTelFormatWithDash($target.val()));
    this._setChangeBtnAble();
  },
  _checkPhoneNumber: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 11), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V18);

    if (this.$isValid) {
      var isPhone = this._validation.isCellPhone($target.val()) || this._validation.isTelephone($target.val());
      this.$isValid = this._validation.showAndHideErrorMsg($target, isPhone, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V9);
    }
  },
  _getPostcode: function () {
    new Tw.CommonPostcodeMain(this.$container, $.proxy(this._setAddress, this));
  },
  _setAddress: function (address) {
    this.$container.find('.fe-zip').val(address.zip);
    this.$container.find('.fe-main-address').val(address.main);
    this.$container.find('.fe-detail-address').val(address.detail);

    this._addrModifyYn = 'Y';
    this._setChangeBtnAble();
  },
  _setChangeBtnAble: function () {
    if (!Tw.FormatHelper.isEmpty($.trim(this.$container.find('.fe-phone').val()))) {
      this.$container.find('.fe-change').removeAttr('disabled');
    } else {
      this.$container.find('.fe-change').attr('disabled', 'disabled');
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
    if (this._addrModifyYn === 'N') {
      this._checkIsChangedDetailAddress();
    }
    this._changeData = {
      billSvcNum: $.trim(this.$container.find('.fe-phone').val()),
      zip: $.trim(this.$container.find('.fe-zip').val()),
      basAddr: $.trim(this.$container.find('.fe-main-address').val()),
      dtlAddr: $.trim(this.$container.find('.fe-detail-address').val()),
      svcNumChgYn: this._phoneModifyYn,
      addrChgYn: this._addrModifyYn
    };
    return this._changeData;
  },
  _checkIsChangedDetailAddress: function () {
    var $detailAddress = this.$container.find('.fe-detail-address');
    if ($detailAddress.attr('data-origin-value') !== $.trim($detailAddress.val())) {
      this._addrModifyYn = 'Y';
    }
  },
  _changeSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.goLoad('/myt-fare/bill/option?type=change');
    } else {
      this._changeFail(res);
    }
  },
  _changeFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _onClose: function () {
    // if (this._isChanged()) {
    //   this._popupService.openConfirmButton(Tw.ALERT_CANCEL, null,
    //     $.proxy(this._closePop, this), $.proxy(this._afterClose, this),
    //     Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    // } else {
    //   this._historyService.goBack();
    // }
  },
  _isChanged: function () {
    this._checkIsChangedDetailAddress();
    return Tw.FormatHelper.isEmpty(this.$container.find('.fe-phone').val()) || this._phoneModifyYn === 'Y' || this._addrModifyYn === 'Y';
  },
  _closePop: function () {
    this._isClose = true;
    this._popupService.closeAll();
  },
  _afterClose: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  }
};