Tw.PopupService = function () {
  this.$document = $(document);
  this._prevHash = undefined;
  this._callback = null;
  this._hashService = Tw.Hash;
  this._init();
};

Tw.PopupService.prototype = {
  _init: function () {
    this._hashService.initHashNav($.proxy(this._onHashChange, this));

    this.$document.on('click', '.popup-closeBtn', $.proxy(this.close, this));
    this.$document.on('click', '.tw-popup-closeBtn', $.proxy(this.close, this));
    this.$document.on('click', '.tw-popup-confirm', $.proxy(this._confirm, this));
    this.$document.on('click', '.tw-popup-close', $.proxy(this._closeNoHash, this));
    this.$document.on('click', '.tw-popup-callback', $.proxy(this._sendCallback, this));
  },
  _onHashChange: function (hash) {
    if ( hash.base === this._prevHash ) {
      Tw.Logger.info('[Popup Close]');
      this._popupClose();
      this._prevHash = undefined;
    }
  },
  _popupClose: function () {
    this._callback = null;
    skt_landing.action.popup.close();
  },
  _addHash: function () {
    Tw.Logger.info('[Popup Open]');
    this._prevHash = location.hash;
    location.hash = 'popup';
  },
  _confirm: function () {
    this.close();
  },
  _closeNoHash: function () {
    skt_landing.action.popup.close();
  },
  _setCallback: function (callback) {
    if ( !Tw.FormatHelper.isEmpty(callback)) {
      this._callback = callback;
      return true;
    }
    return false;
  },
  _sendCallback: function() {
    this._callback();
  },
  open: function (option) {
    this._addHash();
    skt_landing.action.popup.open(option);
  },
  openAlert: function (title, message, callback) {
    var confirmClass = 'bt-red1 ' + (this._setCallback(callback) ? 'tw-popup-callback' : 'tw-popup-confirm');
    this._addHash();
    var option = {
      title: title,
      close_bt: true,
      title2: message,
      bt_num: 'one',
      type: [{
        class: confirmClass,
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    skt_landing.action.popup.open(option);
  },
  openAlertNoHash: function (title, message) {
    var option = {
      title: title,
      close_bt: true,
      title2: message,
      bt_num: 'one',
      type: [{
        class: 'bt-red1 tw-popup-close',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    skt_landing.action.popup.open(option);
  },
  openConfirm: function (title, message, contents, callback) {
    var confirmClass = 'bt-red1 ' + (this._setCallback(callback) ? 'tw-popup-callback' : 'tw-popup-confirm');
    this._addHash();
    var option = {
      title: title,
      close_bt: true,
      title2: message,
      contents: contents || '',
      bt_num: 'two',
      type: [{
        class: 'bt-white1 tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CANCEL
      }, {
        class: confirmClass,
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    skt_landing.action.popup.open(option);
  },
  openRefillProduct: function () {
    this.open({
      hbs: 'DA_01_01_01_L01'// hbs의 파일명
    });
  },
  openGiftProduct: function () {
    this.open({
      hbs: 'DA_02_01_L01'// hbs의 파일명
    });
  },
  openSms: function () {
    this.open({
      hbs: 'DA_02_01_04_L01'// hbs의 파일명
    });
  },
  openBank: function (list) {
    this.open({
      'hbs': 'choice',
      'title': Tw.POPUP_TITLE.SELECT_BANK,
      'close_bt': true,
      'list_type': '',
      'list': list
    });
  },
  close: function () {
    history.back();
  }
};
