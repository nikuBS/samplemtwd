class PopupService {
  _init () {
    this._hashService.initHashNav($.proxy(this._onHashChange, this));

  }
  _onHashChange (hash) {
    var lastHash = this._prevHashList[this._prevHashList.length - 1];
    // Tw.Logger.log('[Popup] Hash Change', '#' + hash.base, lastHash);
    if ( !Tw.FormatHelper.isEmpty(lastHash) && ('#' + hash.base) === lastHash.curHash ) {
      var closeCallback = lastHash.closeCallback;
      this._prevHashList.pop();
      Tw.Logger.info('[Popup Close]');
      this._popupClose(closeCallback);
    }
  }
  _onOpenPopup () {
    var $popups = $('.popup, .popup-page');
    var $currentPopup = $($popups[$popups.length - 1]);
    Tw.Logger.info('[Popup Open]');
    this._bindEvent($currentPopup);
    if ( !Tw.FormatHelper.isEmpty(this._openCallback) ) {
      this._sendOpenCallback($currentPopup);
    }
  }
  _popupClose (closeCallback) {
    this._confirmCallback = null;
    if ( !Tw.FormatHelper.isEmpty(closeCallback) ) {
      closeCallback();
    }
    skt_landing.action.popup.close();
  }
  _addHash (closeCallback) {
    var curHash = location.hash || '#';
    // Tw.Logger.log('[Popup] Add Hash', curHash);
    this._prevHashList.push({
      curHash: curHash,
      closeCallback: closeCallback
    });
    // location.hash = 'popup' + this._prevHashList.length;
    history.pushState(this._popupObj, 'popup', '#popup' + this._prevHashList.length);
  }
  _bindEvent ($container) {
    $container.on('click', '.popup-closeBtn', $.proxy(this.close, this));
    $container.on('click', '.tw-popup-closeBtn', $.proxy(this.close, this));
    $container.on('click', '.tw-popup-confirm', $.proxy(this._confirm, this));
  }
  _confirm () {
    if ( !Tw.FormatHelper.isEmpty(this._confirmCallback) ) {
      this._sendConfirmCallback();
    } else {
      this.close();
    }
  }
  _setConfirmCallback (callback) {
    if ( !Tw.FormatHelper.isEmpty(callback) ) {
      this._confirmCallback = callback;
    }
  }
  _setOpenCallback (callback) {
    if ( !Tw.FormatHelper.isEmpty(callback) ) {
      this._openCallback = callback;
    }
  }
  _sendConfirmCallback () {
    this._confirmCallback();
  }
  _sendOpenCallback ($container) {
    this._openCallback($container);
    this._openCallback = null;
  }
  _open (option) {
    skt_landing.action.popup.open(option, $.proxy(this._onOpenPopup, this));
  }
  open (option, openCallback, closeCallback) {
    this._setOpenCallback(openCallback);
    this._addHash(closeCallback);
    this._open(option);
  }
  openAlert (message, title, confirmCallback, closeCallback) {
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
  }
  openConfirm (title, message, contents, openCallback, confirmCallback, closeCallback) {
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
  }
  openChoice (title, list, type, openCallback, closeCallback) {
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
  }
  openSelect () {

  }
  close () {
    Tw.Logger.log('[Popup] Call Close', location.hash);
    if ( /popup/.test(location.hash) ) {
      Tw.Logger.log('[Popup] history back');
      history.back();
    }
  }
}

export default PopupService;
