/**
 * @namespace
 * @desc Error 팝업 및 페이지를 공통으로 처리하는 Service
 */
Tw.ErrorService = function() {
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  return $.proxy(this._init, this);
};

Tw.ErrorService.prototype = {
  _data: {},

  /**
   * @function
   * @desc code, msg 선언
   * @param code
   * @param msg
   * @returns {Tw.ErrorService}
   */
  _init: function(code, msg) {
    this._data = {
      code: code || '',
      msg: this._replaceBreakLines(msg)
    };

    return this;
  },

  /**
   * @function
   * @desc replace break lines
   * @param msg
   * @returns {null}
   */
  _replaceBreakLines: function(msg) {
    if (Tw.FormatHelper.isEmpty(msg)) {
      return null;
    }

    return msg.replace(/\\n/g, '<br>');
  },

  /**
   * @function
   * @desc 공통 에러 팝업
   * @param closeCallback
   * @param $target
   */
  pop: function(closeCallback, $target) {
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

  /**
   * @function
   * @desc error popup button click event
   * @param $layer
   */
  _request: function ($layer) {
    $layer.on('click', '.fe-request', $.proxy(this._goLoad, this));
  },

  /**
   * @function
   * @desc error popup confirm
   * @private
   */
  _goLoad: function () {
    this._isRequest = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 이메일 상담 페이지로 이동 및 콜백 함수 처리
   * @param closeCallback
   */
  _close: function (closeCallback) {
    if (this._isRequest) {
      location.href = '/customer/email'; 
    }

    if (closeCallback) {
      closeCallback();
    }
  },

  /**
   * @function
   * @desc go to error page
   */
  page: function() {
    this._historyService.goLoad('/common/error?' + $.param(this._data));
  },

  /**
   * @function
   * @desc go to error page with replace
   */
  replacePage: function() {
    this._historyService.replaceURL('/common/error?' + $.param(this._data));
  }

};