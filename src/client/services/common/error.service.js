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
    this._popupService.open({
      hbs: 'error_common',
      data: this._data
    },
      $.proxy(this._request, this),
      $.proxy(this._close, this));
  },

  _request: function ($layer) {
    $layer.on('click', '.fe-request', $.proxy(this._goLoad, this));
  },

  _goLoad: function () {
    this._isRequest = true;
    this._popupService.close();
  },

  _close: function () {
    if (this._isRequest) {
      location.href = '/customer/email';
    }
  },

  page: function() {
    this._historyService.goLoad('/common/error?' + $.param(this._data));
  }

};