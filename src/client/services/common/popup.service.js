Tw.PopupService = function () {
  this._prevHash = undefined;
  this._callback = null;
  this._init();
};

Tw.PopupService.prototype = {
  _init: function () {
    initHashNav($.proxy(this._onHashChange, this));

    $(document).on('click', '.popup-closeBtn', $.proxy(this.close, this));
    $(document).on('click', '.tw-popup-closeBtn', $.proxy(this.close, this));
    $(document).on('click', '.tw-popup-confirm', $.proxy(this._confirm, this));
  },
  _onHashChange: function (hash) {
    if ( hash.base === this._prevHash ) {
      Tw.Logger.info('[Popup Close]');
      this._popupClose();
      this._prevHash = undefined;
    }
  },
  _popupClose: function () {
    // TODO
    // skt_landing.action.popup.close();
    $('.popup-page').empty().remove();
    $('.popup').empty().remove();
    skt_landing.action.auto_scroll();
  },
  _addHash: function () {
    Tw.Logger.info('[Popup Open]');
    this._prevHash = location.hash;
    location.hash = 'popup';
  },
  _confirm: function () {
    this.close();
    if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback();
      this._callback = null;
    }
  },
  open: function (option) {
    this._addHash();
    skt_landing.action.popup.open(option);
  },
  openAlert: function (title, message, callback) {
    this._callback = callback;
    this._addHash();
    var option = {
      title: title,
      close_bt: true,
      title2: message,
      bt_num: 'one',
      type: [{
        class: 'bt-red1 tw-popup-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    skt_landing.action.popup.open(option);
  },
  openConfirm: function (title, message, callback) {
    this._callback = callback;
    this._addHash();
    var option = {
      title: title,
      close_bt: true,
      title2: message,
      bt_num: 'two',
      type: [{
        class: 'bt-white1 tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CANCEL
      }, {
        class: 'bt-red1 tw-popup-confirm',
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
  close: function () {
    history.back();
  }
};
