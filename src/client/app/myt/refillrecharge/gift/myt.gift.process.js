Tw.MytGiftProcess = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._lineService = new Tw.MytGiftLine();

  this._cachedElement();
  this._bindEvent();
  this.$init();
}

Tw.MytGiftProcess.prototype = {
  $init: function () {
  },

  _cachedElement: function () {
    this.$btn_next_process = this.$container.find('#next_process');
  },

  _bindEvent: function () {
    this.$btn_next_process.on('click', $.proxy(this.nextProcess, this));
    $(document).on('updateLineInfo', $.proxy(this.updateLineInfo, this));
  },

  updateLineInfo: function () {
    this.currentLine = this._lineService.getCurrentLine();

    console.log(this.currentLine);
  },

  nextProcess: function () {

  }
}