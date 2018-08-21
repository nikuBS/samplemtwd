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
    $.when(this._popupService.close())
      .then(this._popupService.openAlert('[' + this._data.code + '] ' + this._data.msg));
  },

  page: function() {
    this._historyService.goLoad('/common/error?' + $.param(this._data));
  }

};