Tw.ErrorService = function() {
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  return $.proxy(this._init, this);
};

Tw.ErrorService.prototype = {
  _data: {},

  _init: function(code, msg) {
    this._data = {
      code: code || '',
      msg: msg || ''
    };

    return this;
  },

  pop: function() {
    var message = this._data.msg;
    if (!Tw.FormatHelper.isEmpty(this._data.code)) {
      message = '[' + this._data.code + '] ' + message;
    }

    this._popupService.openAlert(message);
  },

  page: function() {
    this._historyService.goLoad('/common/error?' + $.param(this._data));
  }

};