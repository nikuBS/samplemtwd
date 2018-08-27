/**
 * FileName: myt.usage.24hours-50discount.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.27
 */

Tw.MyTUsage24Hours50Discount = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.MyTUsage24Hours50Discount.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-detail-date', $.proxy(this._onClickBtnDetailDate, this));
  },

  _onClickBtnDetailDate: function () {
    this._popupService.open({
      title: Tw.POPUP_TITLE.GUIDE,
      close_bt: true,
      title2: Tw.MSG_MYT.DISCOUNT.M01_TITLE,
      bt_num: 'one',
      contents: Tw.MSG_MYT.DISCOUNT.M01_CONTENTS,
      type: [{
        style_class: 'bt-red1 tw-popup-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    });
  }
};
