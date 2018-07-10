Tw.PopupService = function () {
  this.$document = $(document);
  this._prevHash = undefined;
  this._confirmCallback = null;
  this._openCallback = null;
  this._hashService = Tw.Hash;
  this._init();
};

Tw.PopupService.prototype = {
  _init: function () {
    this._hashService.initHashNav($.proxy(this._onHashChange, this));

  },
  _onHashChange: function (hash) {
    if ( ('#' + hash.base) === this._prevHash ) {
      Tw.Logger.info('[Popup Close]');
      this._popupClose();
      this._prevHash = undefined;
    }
  },
  _onOpenPopup: function () {
    Tw.Logger.info('[Popup Open]');
    var $popups = $('.popup, .popup-page');
    var $currentPopup = $($popups[$popups.length - 1]);
    this._bindEvent($currentPopup);
    if ( !Tw.FormatHelper.isEmpty(this._openCallback) ) {
      this._sendOpenCallback($currentPopup);
    }
  },
  _popupClose: function () {
    this._confirmCallback = null;
    this._openCallback = null;
    skt_landing.action.popup.close();
  },
  _addHash: function () {
    this._prevHash = location.hash;
    location.hash = 'popup';
  },
  _bindEvent: function ($container) {
    $container.on('click', '.popup-closeBtn', $.proxy(this.close, this));
    $container.on('click', '.tw-popup-closeBtn', $.proxy(this.close, this));
    $container.on('click', '.tw-popup-confirm', $.proxy(this._confirm, this));
    $container.on('click', '.tw-popup-closeNoHash', $.proxy(this._closeNoHash, this));
  },
  _confirm: function () {
    if ( !Tw.FormatHelper.isEmpty(this._confirmCallback) ) {
      this._sendConfirmCallback();
    } else {
      this.close();
    }
  },
  _closeNoHash: function () {
    skt_landing.action.popup.close();
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
  open: function (option, openCallback) {
    this._setOpenCallback(openCallback);
    this._addHash();
    this._open(option);
  },
  openAlert: function (message, title) {
    var option = {
      title: title || Tw.POPUP_TITLE.NOTIFY,
      close_bt: true,
      title2: message,
      bt_num: 'one',
      type: [{
        style_class: 'bt-red1 tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._addHash();
    this._open(option);
  },
  openAlertNoHash: function (message, title) {
    var option = {
      title: title || Tw.POPUP_TITLE.NOTIFY,
      close_bt: true,
      title2: message,
      bt_num: 'one',
      type: [{
        style_class: 'bt-red1 tw-popup-closeNoHash',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._open(option);
  },
  openConfirm: function (title, message, contents, openCallback, confirmCallback) {
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
    this._addHash();
    this._open(option);
  },
  openChoice: function (title, list, type, openCallback) {
    var option = {
      hbs: 'choice',
      title: title,
      close_bt: true,
      list_type: type || 'type1',
      list: list
    };
    this._setOpenCallback(openCallback);
    this._addHash();
    this._open(option);
  },
  openSelect: function () {

  },
  close: function () {
    if ( location.hash === '#popup' ) {
      history.back();
    }
  }
};
