/**
 * FileName: back.alert.component.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2019.02.14
 */

Tw.BackAlert = function (rootEl, isPage) {
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._isPage = isPage;

  this.init();
};

Tw.BackAlert.prototype = {
  init: function () {
    $(window).on(Tw.NATIVE_BACK, $.proxy(this.onClose, this));
  },
  onClose: function () {
    this._popupService.openConfirmButton(Tw.ALERT_CANCEL, null,
      $.proxy(this._closePop, this), $.proxy(this._closeCallback, this),
      Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  },
  _closePop: function () {
    this._isClose = true;

    if (this._isPage) {
      this._popupService.close();
    } else {
      this._popupService.closeAll();
    }
  },
  _closeCallback: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  }
};