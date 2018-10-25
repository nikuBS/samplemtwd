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
    // Tw.Logger.log('[Popup] Hash Change', '#' + hash.base, lastHash);
    if ( !Tw.FormatHelper.isEmpty(lastHash) && ('#' + hash.base) === lastHash.curHash ) {
      var closeCallback = lastHash.closeCallback;
      this._prevHashList.pop();
      Tw.Logger.info('[Popup Close]');
      this._popupClose(closeCallback);
    }
  },
  _onOpenPopup: function () {
    var $popups = $('.tw-popup');
    var $currentPopup = $($popups[$popups.length - 1]);
    Tw.Logger.info('[Popup Open]');
    this._bindEvent($currentPopup);
    if ( !Tw.FormatHelper.isEmpty(this._openCallback) ) {
      this._sendOpenCallback($currentPopup);
    }
  },
  _popupClose: function (closeCallback) {
    this._confirmCallback = null;
    if ( !Tw.FormatHelper.isEmpty(closeCallback) ) {
      closeCallback();
    }
    skt_landing.action.popup.close();
  },
  _addHash: function (closeCallback, hashName) {
    var curHash = location.hash || '#';
    // Tw.Logger.log('[Popup] Add Hash', curHash);
    this._prevHashList.push({
      curHash: curHash,
      closeCallback: closeCallback
    });

    if ( Tw.FormatHelper.isEmpty(hashName) ) {
      hashName = '#popup' + this._prevHashList.length;
    } else {
      hashName = '#' + hashName + '_P';
    }

    // location.hash = 'popup' + this._prevHashList.length;
    history.pushState(this._popupObj, 'popup', hashName);
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
    this._openCallback = null;
  },
  _open: function (option) {
    skt_landing.action.popup.open(option, $.proxy(this._onOpenPopup, this));
  },
  open: function (option, openCallback, closeCallback, hashName) {
    this._setOpenCallback(openCallback);
    this._addHash(closeCallback, hashName);
    this._open(option);
  },
  openAlert: function (contents, title, btName, closeCallback) {
    var option = {
      title: title || Tw.POPUP_TITLE.NOTIFY,
      title_type: 'sub-c',
      contents: contents,
      bt: [{
        style_class: 'bt-blue1 tw-popup-closeBtn',
        txt: btName || Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._addHash(closeCallback);
    this._open(option);
  },
  openConfirm: function (contents, title, confirmCallback, closeCallback) {
    var option = {
      title: title || Tw.POPUP_TITLE.NOTIFY,
      title_type: 'sub',
      cont_align: 'tl',
      contents: contents,
      bt_b: [{
        style_class: 'pos-left tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CANCEL
      }, {
        style_class: 'bt-blue1 pos-right tw-popup-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };
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
  openTypeA: function (title, contents, icoType, openCallback, closeCallback) {
    var option = {
      ico: icoType || 'type2',
      title: title || Tw.POPUP_TITLE.NOTIFY,
      contents: contents,
      bt: [{
        style_class: 'bt-blue1 tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CLOSE
      }]
    };
    this._setOpenCallback(openCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openOneBtTypeB: function (title, contents, linkList, icoType, openCallback, closeCallback) {
    var option = {
      ico: icoType || 'type3',
      title: title || Tw.POPUP_TITLE.NOTIFY,
      contents: contents,
      link_list: linkList,
      bt: [{
        style_class: 'bt-blue1 tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CLOSE
      }]
    };
    this._setOpenCallback(openCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openTwoBtTypeB: function (title, contents, linkList, btName, icoType, openCallback, confirmCallback, closeCallback) {
    var option = {
      ico: icoType || 'type3',
      title: title || Tw.POPUP_TITLE.NOTIFY,
      contents: contents,
      link_list: linkList,
      bt: [{
        style_class: 'bt-blue1 tw-popup-confirm',
        txt: btName || Tw.BUTTON_LABEL.CONFIRM
      }, {
        style_class: 'bt-white2 tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CLOSE
      }]
    };
    this._setOpenCallback(openCallback);
    this._setConfirmCallback(confirmCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openTypeC: function (title, noticeList, icoType, openCallback, closeCallback) {
    var option = {
      ico: icoType || 'type4',
      title: title || Tw.POPUP_TITLE.NOTIFY,
      title_type: 'sub-c',
      notice_has: 'notice_has',
      notice_list: noticeList,
      bt: [{
        style_class: 'bt-white2 tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CLOSE
      }]
    };
    this._setOpenCallback(openCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openTypeD: function (title, contents, btName, icoType, openCallback, confirmCallback, closeCallback) {
    var option = {
      ico: icoType || 'type2',
      title: title || Tw.POPUP_TITLE.NOTIFY,
      contents: contents,
      bt: [{
        style_class: 'bt-red1 tw-popup-confirm',
        txt: btName || Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._setOpenCallback(openCallback);
    this._setConfirmCallback(confirmCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openModalTypeA: function (title, contents, btName, openCallback, confirmCallback, closeCallback) {
    var option = {
      title: title || Tw.POPUP_TITLE.NOTIFY,
      title_type: 'sub-c',
      cont_align: 'tc',
      contents: contents,
      bt_b: [{
        style_class: 'pos-left tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CANCEL
      }, {
        style_class: 'bt-red1 pos-right tw-popup-confirm',
        txt: btName || Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._setOpenCallback(openCallback);
    this._setConfirmCallback(confirmCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openModalTypeALeftAlign: function (title, contents, btName, openCallback, confirmCallback, closeCallback) {
    var option = {
      title: title || Tw.POPUP_TITLE.NOTIFY,
      title_type: 'sub',
      cont_align: 'tl',
      contents: contents,
      bt_b: [{
        style_class: 'pos-left tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CANCEL
      }, {
        style_class: 'bt-red1 pos-right tw-popup-confirm',
        txt: btName || Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._setOpenCallback(openCallback);
    this._setConfirmCallback(confirmCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  toast: function (message) {
    skt_landing.action.popup.toast({
      text: message,
      second: 5
    });
  },
  close: function () {
    Tw.Logger.log('[Popup] Call Close', location.hash);
    if ( /_P/.test(location.hash) || /popup/.test(location.hash) ) {
      Tw.Logger.log('[Popup] history back');
      history.back();
    }
  },
  afterRequestSuccess: function (historyUrl, mainUrl, linkText, text, subText) {
    this.open({
        'hbs': 'complete',
        'link_class': 'fe-payment-history',
        'link_text': linkText,
        'text': text,
        'sub_text': subText
      },
      $.proxy(this._onComplete, this),
      $.proxy(this._goLink, this, historyUrl, mainUrl),
      'complete'
    );
  },
  _onComplete: function ($layer) {
    $layer.on('click', '.fe-payment-history', $.proxy(this._setIsLink, this, 'history'));
    $layer.on('click', '.fe-submain', $.proxy(this._setIsLink, this, 'close'));
  },
  _setIsLink: function (type) {
    if (type === 'history') {
      this._isHistory = true;
    }
    this.close();
  },
  _goLink: function (historyUrl, mainUrl) {
    if (this._isHistory) {
      location.href = historyUrl;
    } else {
      location.href = mainUrl;
    }
  }
};
