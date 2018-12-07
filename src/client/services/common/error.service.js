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
      url: Tw.Environment.cdn + '/hbs/',
      'title': Tw.POPUP_TITLE.ERROR + '\n' + this._data.code,
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': this._data.msg,
      'bt_b': [{
        style_class: 'pos-right tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
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