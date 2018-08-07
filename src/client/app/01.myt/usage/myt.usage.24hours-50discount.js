Tw.MytUsage24Hours50Discount = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.MytUsage24Hours50Discount.prototype = {
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
