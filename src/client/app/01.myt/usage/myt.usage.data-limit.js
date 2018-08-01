Tw.MytUsageDataLimit = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);

  this._bindEvent();
};

Tw.MytUsageDataLimit.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.prev-step', $.proxy(this._onClickPrevStep, this));
  },

  _onClickPrevStep: function () {
    this._history.goBack();
  }
};
