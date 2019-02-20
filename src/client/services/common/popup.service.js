Tw.PopupService = function () {
  this.$document = $(document);
  this.$window = $(window);
  this._prevHashList = [];
  this._confirmCallback = null;
  this._openCallback = null;
  this._closeCallback = null;
  this._hashService = Tw.Hash;
  this._historyService = new Tw.HistoryService();

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
      if ( skt_landing.action.checkScroll && skt_landing.action.checkScroll.unLockScroll ) {
        skt_landing.action.checkScroll.unLockScroll();
      }

      var closeCallback = lastHash.closeCallback;
      this._prevHashList.pop();
      Tw.Logger.info('[Popup Close]');
      this._popupClose(closeCallback);
    }
  },
  _onOpenPopup: function () {
    var $popups = $('.tw-popup');
    var $currentPopup = $($popups[$popups.length - 1]);
    Tw.Logger.info('[Popup Open]', this._prevHashList);
    this._bindEvent($currentPopup);
    if ( !Tw.FormatHelper.isEmpty(this._openCallback) ) {
      this._sendOpenCallback($currentPopup);
    }
    Tw.Tooltip.popInit($popups.last());
  },
  _onFailPopup: function (retryParams) {
    if ( Tw.BrowserHelper.isApp() ) {
      var lastHash = this._prevHashList[this._prevHashList.length - 1];

      this._prevHashList = [];
      this.close();

      setTimeout($.proxy(function () {
        Tw.Native.send(Tw.NTV_CMD.OPEN_NETWORK_ERROR_POP, {}, $.proxy(this._onRetry, this, $.extend(retryParams, lastHash)));

        if ( Tw.BrowserHelper.isIos() ) {
          window.onNativeCallback = $.proxy(this._onRetry, this, $.extend(retryParams, lastHash));
        }
      }, this), 100);
    }
  },
  _onRetry: function (retryParams) {
    setTimeout($.proxy(function () {
      this._setOpenCallback(retryParams.openCallback);
      this._setConfirmCallback(retryParams.confirmCallback);
      this._addHash(retryParams.closeCallback, retryParams.curHash);
      this._open(retryParams.option);
    }, this), 200);
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

    location.hash = hashName;
    // history.pushState(this._popupObj, 'popup', hashName);
  },
  _bindEvent: function ($container) {
    // $('.popup-blind').on('click', $.proxy(this.close, this));
    $container.on('click', '.popup-blind', $.proxy(this._onClickBlind, this, $container));
    $container.on('click', '.popup-closeBtn', $.proxy(this.close, this));
    $container.on('click', '.tw-popup-closeBtn', $.proxy(this.close, this));
    $container.on('click', '.tw-popup-confirm', $.proxy(this._confirm, this));
  },
  _onClickBlind: function ($container) {
    if ( $container.find('.fe-no-blind-close').length === 0 ) {
      this.close();
    }
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
    $.extend(option, {
      url: Tw.Environment.cdn + '/hbs/',
      cdn: Tw.Environment.cdn
    });

    if ( skt_landing.action.checkScroll && skt_landing.action.checkScroll.lockScroll ) {
      skt_landing.action.checkScroll.lockScroll();
    }

    skt_landing.action.popup.open(option, $.proxy(this._onOpenPopup, this), $.proxy(this._onFailPopup, this, {
      option: option,
      openCallback: this._openCallback,
      confirmCallback: this._confirmCallback
    }));
  },
  open: function (option, openCallback, closeCallback, hashName) {
    this._setOpenCallback(openCallback);
    this._addHash(closeCallback, hashName);
    this._open(option);
  },
  openAlert: function (contents, title, btName, closeCallback, hash) {
    var option = {
      title: title,
      title_type: 'sub',
      cont_align: 'tl',
      contents: contents,
      bt_b: [{
        style_class: 'bt-red1 pos-right tw-popup-closeBtn',
        txt: btName || Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._addHash(closeCallback, hash);
    this._open(option);
  },
  openConfirm: function (contents, title, confirmCallback, closeCallback) {
    var option = {
      title: title,
      title_type: 'sub',
      cont_align: 'tl',
      contents: contents,
      bt_b: [{
        style_class: 'pos-left tw-popup-closeBtn',
        txt: Tw.BUTTON_LABEL.CANCEL
      }, {
        style_class: 'bt-red1 pos-right tw-popup-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._setConfirmCallback(confirmCallback);
    this._addHash(closeCallback);
    this._open(option);
  },
  openConfirmButton: function (contents, title, confirmCallback, closeCallback, cancelButton, confirmButton) {
    var option = {
      title: title,
      title_type: 'sub',
      cont_align: 'tl',
      contents: contents,
      bt_b: [{
        style_class: 'pos-left tw-popup-closeBtn',
        txt: cancelButton || Tw.BUTTON_LABEL.CANCEL
      }, {
        style_class: 'bt-red1 pos-right tw-popup-confirm',
        txt: confirmButton || Tw.BUTTON_LABEL.CONFIRM
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
      title: title,
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
      title: title,
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
      title: title,
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
      title: title,
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
      url: Tw.Environment.cdn + '/hbs/',
      ico: icoType || 'type2',
      title: title,
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
  openModalTypeA: function (title, contents, btName, openCallback, confirmCallback, closeCallback, hashName, align) {
    var option = {
      title: title,
      title_type: 'sub',
      cont_align: align || 'tl', // 기본 룰 예외로 중앙정렬 처리가 필요하여 추가 [DV001-14268]
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
    this._addHash(closeCallback, hashName);
    this._open(option);
  },
  openModalTypeATwoButton: function (title, contents, btName, closeBtName, openCallback, confirmCallback, closeCallback, hashName) {
    var option = {
      title: title,
      title_type: 'sub',
      cont_align: 'tl',
      contents: contents,
      bt_b: [{
        style_class: 'pos-left tw-popup-closeBtn',
        txt: closeBtName || Tw.BUTTON_LABEL.CANCEL
      }, {
        style_class: 'bt-red1 pos-right tw-popup-confirm',
        txt: btName || Tw.BUTTON_LABEL.CONFIRM
      }]
    };
    this._setOpenCallback(openCallback);
    this._setConfirmCallback(confirmCallback);
    this._addHash(closeCallback, hashName);
    this._open(option);
  },
  openModalTypeALeftAlign: function (title, contents, btName, openCallback, confirmCallback, closeCallback) {
    var option = {
      title: title,
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
      url: Tw.Environment.cdn + '/hbs/',
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
  closeAll: function () {
    var hashLength = this._prevHashList.length;
    if ( hashLength > 0 ) {
      _.map(this._prevHashList, $.proxy(function (prevHash) {
        if ( !Tw.FormatHelper.isEmpty(prevHash.closeCallback) ) {
          setTimeout(function () {
            prevHash.closeCallback();
          }, 0);
        }
      }, this));
      this._prevHashList = [];
      skt_landing.action.popup.allClose();
      history.go(-hashLength);
    }
  },
  closeAllAndGo: function (targetUrl) {
    var hashLength = this._prevHashList.length;
    this._prevHashList = [];
    skt_landing.action.popup.allClose();
    history.go(-hashLength);

    setTimeout(function () {
      location.replace(targetUrl);
    }, 0);
  },
  isPopup: function () {
    var $popups = $('.tw-popup');
    var $currentPopup = $($popups[$popups.length - 1]);

    if ( /_P/.test(location.hash) || /popup/.test(location.hash) ) {
      return $currentPopup;
    }
    return null;
  },
  afterRequestSuccess: function (historyUrl, mainUrl, linkText, text, subText) {
    this.open({
        hbs: 'complete',
        link_class: 'fe-payment-history',
        link_text: linkText,
        text: text,
        sub_text: subText
      },
      $.proxy(this._onComplete, this, historyUrl, mainUrl),
      $.proxy(this._goBack, this),
      'complete'
    );
  },
  _onComplete: function (historyUrl, mainUrl, $layer) {
    $layer.on('click', '.fe-payment-history', $.proxy(this._goLink, this, historyUrl));
    $layer.on('click', '.fe-submain', $.proxy(this._goLink, this, mainUrl));
  },
  _goLink: function (url) {
    if ( typeof(url) === 'object' ) {
      this.open({
        'hbs': url.hbs
      }, url.open, url.close, url.name);
    } else {
      location.href = url;
    }
  },
  _goBack: function () {
    history.back();
  }
};
