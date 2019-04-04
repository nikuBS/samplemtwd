/**
 * @file error.service.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.05
 */

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
      msg: this._replaceBreakLines(msg)
    };

    return this;
  },

  _replaceBreakLines: function(msg) {
    if (Tw.FormatHelper.isEmpty(msg)) {
      return null;
    }

    return msg.replace(/\\n/g, '<br>');
  },

  pop: function(closeCallback, $target) { // open alert for error
    this._popupService.open({
      url: Tw.Environment.cdn + '/hbs/',
      'title': Tw.POPUP_TITLE.NOTIFY,
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': this._data.msg,
      'bt_b': [{
        style_class: 'pos-right tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    },
      $.proxy(this._request, this),
      $.proxy(this._close, this, closeCallback),
      null,
      $target
    );
  },

  _request: function ($layer) { // when open alert
    $layer.on('click', '.fe-request', $.proxy(this._goLoad, this));
  },

  _goLoad: function () {  // when click question button
    this._isRequest = true;
    this._popupService.close();
  },

  _close: function (closeCallback) {
    if (this._isRequest) {  // go to question by email after click question button 
      location.href = '/customer/email'; 
    }

    if (closeCallback) {
      closeCallback();
    }
  },

  page: function(replace) { // go to error page
    this._historyService.goLoad('/common/error?' + $.param(this._data));
  },

  replacePage: function(replace) {// go to error page with replace
    this._historyService.replaceURL('/common/error?' + $.param(this._data));
  }

};