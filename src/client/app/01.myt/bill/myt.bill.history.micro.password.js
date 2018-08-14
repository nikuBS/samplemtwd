/**
 * FileName: myt.bill.history.micro.password.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.26
 */

Tw.MyTBillHistoryMicroPassword = function (rootEl, current, isUsePassword) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  // console.log(current, isUsePassword);

  if (isUsePassword !== 'NC' && isUsePassword !== 'AC') {
    this._apiError({code: isUsePassword});
    return false;
  }

  this._init();
};

Tw.MyTBillHistoryMicroPassword.prototype = {
  _init: function () {

  },

  _apiError: function (err, callback) {
    Tw.Logger.error(err.code, err.msg);
    var msg = Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg;
    this._popupService.openAlert(msg, Tw.POPUP_TITLE.NOTIFY, callback, callback);
    return false;
  }
};
