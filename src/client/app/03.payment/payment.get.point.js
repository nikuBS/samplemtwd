/**
 * FileName: payment.get.point.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.16
 */

Tw.PaymentGetPoint = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this.open();
};

Tw.PaymentGetPoint.prototype = {
  open: function () {
    this._popupService.open({
      hbs: 'PA_05_04_L01'
    }, $.proxy(this._bindEvent, this));
  },
  _bindEvent: function ($layer) {
    $layer.on('keyup', 'input[type="text"]', $.proxy(this._onlyNumber, this));
    $layer.on('click', 'button', $.proxy(this._getPoint, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _getPoint: function () {
    if (this._isValid()) {

    }
  },
  _isValid: function () {
    return Tw.ValidationHelper.checkEmpty()
  }
};
