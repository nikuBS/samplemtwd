/**
 * FileName: myt.usage.ting.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018.08.02
 */
Tw.MytUsageTing = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._bindEvent();
};

Tw.MytUsageTing.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-popup-info', $.proxy(this._onClickPopupInfo, this));
  },

  _onClickPopupInfo: function () {
    var options = {
      'title': Tw.POPUP_TITLE.GUIDE,
      'close_bt': true,
      'title2': Tw.MSG_MYT.USAGE_TING_M03.TITLE,
      'contents': Tw.MSG_MYT.USAGE_TING_M03.CONTENTS,
      'bt_num': 'one',
      'type': [{
        style_class: 'bt-red1',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }
    this._popupService.open(options, $.proxy(this._onOpenPopup, this));
  },

  _onOpenPopup: function ($popup) {
    $popup.one('click', '.bt-red1 button', function () {
      Tw.Popup.close();
    })
  }
};
