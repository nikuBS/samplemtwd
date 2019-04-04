/**
 * @file back.alert.component.js
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2019.02.14
 */

Tw.BackAlert = function (rootEl, isPage) {
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._isPage = isPage;
  this._isClose = false;
};

Tw.BackAlert.prototype = {
  init: function () {
    $(window).on(Tw.NATIVE_BACK, $.proxy(this.onClose, this));
  },
  onClose: function () {
    this._popupService.openConfirmButton(Tw.ALERT_CANCEL.CONTENTS, Tw.ALERT_CANCEL.TITLE,
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