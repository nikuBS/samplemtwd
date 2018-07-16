Tw.PopupService = function () {
  this.$document = $(document);
  this._prevHashList = [];
  this._confirmCallback = null;
  this._openCallback = null;
  this._closeCallback = null;
  this._hashService = Tw.Hash;

  this._popupObj = {};

  this._init();
};

Tw.PopupService.prototype = {
  _init: function () {
    this._hashService.initHashNav($.proxy(this._onHashChange, this));

  },
  _onHashChange: function (hash) {
    var lastHash = this._prevHashList[this._prevHashList.length - 1];
    Tw.Logger.log('[Popup] Hash Change', '#' + hash.base, lastHash);
    if ( !Tw.FormatHelper.isEmpty(lastHash) && ('#' + hash.base) === lastHash.curHash ) {
      var closeCallback = lastHash.closeCallback;
      this._prevHashList.pop();
      Tw.Logger.info('[Popup Close]');
      this._popupClose(closeCallback);
    }
  },
  _onOpenPopup: function () {
    var $popups = $('.popup, .popup-page');
    var $currentPopup = $($popups[$popups.length - 1]);
    Tw.Logger.info('[Popup Open]');
    this._bindEvent($currentPopup);
    if ( !Tw.FormatHelper.isEmpty(this._openCallback) ) {
      this._sendOpenCallback($currentPopup);
    }
  },
  _popupClose: function (closeCallback) {
    this._confirmCallback = null;
    this._openCallback = null;
    if ( !Tw.FormatHelper.isEmpty(closeCallback) ) {
      closeCallback();
    }
    skt_landing.action.popup.close();
  },
  _addHash: function (closeCallback) {
    var curHash = location.hash || '#';
    Tw.Logger.log('[Popup] Add Hash', curHash);
    this._prevHashList.push({
      curHash: curHash,
      closeCallback: closeCallback
    });
    // location.hash = 'popup' + this._prevHashList.length;
    history.pushState(this._popupObj, 'popup', '#popup' + this._prevHashList.length);
  },
  _bindEvent: function ($container) {
    $container.on('click', '.popup-closeBtn', $.proxy(this.close, this));
    $container.on('click', '.tw-popup-closeBtn', $.proxy(this.close, this));
    $container.on('click', '.tw-popup-confirm', $.proxy(this._confirm, this));
  },
  _confirm: function () {
    if ( !Tw.FormatHelper.isEmpty(this._confirmCallback) ) {
      this._sendConfirmCallback();
    } else {
      this.close();
    }
  },
  _setConfirmCallback: function (callback) {
    if ( !Tw.FormatHelper.isEmpty(callback) ) {
      this._confirmCallback = callback;
    }
  },
  _setOpenCallback: function (callback) {
    if ( !Tw.FormatHelper.isEmpty(callback) ) {
      this._openCallback = callback;
    }
  },
  _sendConfirmCallback: function () {
    this._confirmCallback();
  },
  _sendOpenCallback: function ($container) {
    this._openCallback($container);
  },
  _open: function (option) {
    skt_landing.action.popup.open(option, $.proxy(this._onOpenPopup, this));
  },
  open: function (option, openCallback, closeCallback) {
    this._setOpenCallback(openCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openAlert: function (message, title, confirmCallback, closeCallback) {
    var option = {
      title: title || Tw.POPUP_TITLE.NOTIFY,
      close_bt: true,
      title2: message,
      bt_num: 'one',
      type: [{
        style_class: 'bt-red1 tw-popup-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._setConfirmCallback(confirmCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openConfirm: function (title, message, contents, openCallback, confirmCallback, closeCallback) {
    var option = {
      title: title,
      close_bt: true,
      title2: message,
      contents: contents || '',
      bt_num: 'two',
      type: [{
        style_class: 'bt-white1 tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CANCEL
      }, {
        style_class: 'bt-red1 tw-popup-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._setOpenCallback(openCallback);
    this._setConfirmCallback(confirmCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openChoice: function (title, list, type, openCallback, closeCallback) {
    var option = {
      hbs: 'choice',
      title: title,
      close_bt: true,
      list_type: type || 'type1',
      list: list
    };
    this._setOpenCallback(openCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openSelect: function () {

  },
  close: function () {
    Tw.Logger.log('[Popup] Call Close', location.hash);
    if ( /popup/.test(location.hash) ) {
      Tw.Logger.log('[Popup] history back');
      history.back();
    }
  }
};
