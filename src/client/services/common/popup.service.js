/**
 * @class
 * @desc popup service
 */
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
  this._firePop = false;

  this._init();
};

Tw.PopupService.prototype = {
  /**
   * @desc initialize service
   * @private
   */
  _init: function () {
    this._hashService.initHashNav($.proxy(this._onHashChange, this));
    window.onpopstate = $.proxy(this._onPopState, this);
  },
  /**
   * @desc bind handler for hash change
   * @private
   */
  _onHashChange: function (hash) {
    Tw.Logger.log('[Popup] Hash Change', hash, '', this._firePop);
    if ( !this._firePop ) {
      if ( Tw.FormatHelper.isEmpty(this._prevHashList) &&
        hash.base.indexOf('_P') >= 0 || hash.base.indexOf('popup') >= 0 ) {
        this._blockEmptyHash();
      }
    }
    this._firePop = false;
  },
  /**
   * @desc bind handler for pop state
   * @private
   */
  _onPopState: function () {
    this._firePop = true;
    this._historyBack = false;
    var hash = location.hash || '#';
    var lastHash = this._prevHashList[this._prevHashList.length - 1];
    var $popupLastFocus = null; // 팝업 닫힌 후 포커스되어야 할 엘리먼트

    Tw.Logger.log('[Popup] Pop State', this._popupObj, 'hash=', hash, 'prev=', lastHash);

    if ( !Tw.FormatHelper.isEmpty(lastHash) ) {
      var $prevPop = $('[hashName="' + lastHash.curHash + '"]');
      $popupLastFocus = $prevPop.length ? $prevPop.data('lastFocus') : null;

      if ( hash === lastHash.curHash ) {
        var closeCallback = lastHash.closeCallback;
        this._prevHashList.pop();
        Tw.Logger.info('[Popup Close]');
        this._popupClose(closeCallback);
        if ( $popupLastFocus ) {
          $popupLastFocus.focus();
        }
      }
    } else if ( hash.indexOf('_P') >= 0 || hash.indexOf('popup') >= 0 ) {
      this._blockEmptyHash();
    }
  },

  /**
   * @desc go back, when last hash is empty
   * @private
   */
  _blockEmptyHash: function () {
    if ( Tw.BrowserHelper.isSamsung() ) {
      if ( window.performance && performance.navigation.type === 1 ) {
        this._emptyHash();
      } else {
        this._goBack();
      }
    } else {
      this._goBack();
    }
  },
  
  /**
   * @desc  callback for opening popup
   * @param  {$object} evt jquery object for event target
   * @private
   */
  _onOpenPopup: function (evt) {
    var $popups = $('.tw-popup');
    var $currentPopup = $($popups[$popups.length - 1]);
    Tw.Logger.info('[Popup Open]', this._prevHashList);
    this._bindEvent($currentPopup);
    if ( !Tw.FormatHelper.isEmpty(this._openCallback) ) {
      this._sendOpenCallback($currentPopup);
    }
    Tw.Tooltip.popInit($popups.last());

    // 포커스 영역 저장 후 포커스 이동
    var thisHash = this._prevHashList[this._prevHashList.length - 1];
    var $focusEl = evt ? (evt.length ? evt : $(evt.currentTarget)) : $(':focus');
    $focusEl = this._getEnableFocusEl($focusEl); // 닫힐때 포커스 타겟 저장

    // 돌아갈 focus 타겟 저장여부
    if ( $focusEl && $focusEl.length && thisHash && !$focusEl.is('.tw-popup') && !$focusEl.is('.fe-nofocus-move') ) {
      $currentPopup.attr('hashName', thisHash.curHash).data('lastFocus', $focusEl);
    }

    // 팝업 focus 여부
    if ( !($focusEl && ($focusEl.is('.fe-nofocus-move') || $focusEl.find('.fe-nofocus-move').length)) ) {
      // this._popupFocus($currentPopup); // 팝업포커스
      $currentPopup.attr({ 'tabindex': 0, 'aria-modal': true, 'aria-hidden': false }).focus();
      if ( $currentPopup.find('.popup-page, .popup-info').length ) {
        $currentPopup.find('.popup-page, .popup-info').attr('tabindex', 0).eq(0).focus();
        if ( Tw.BrowserHelper.isIos() ) {
          $currentPopup.find('.popup-page.actionsheet').find('*').filter(function () {
            return !$(this).attr('tabindex');
          }).attr('tabindex', 0);
          $currentPopup.find('li').eq(0).focus();
        }
      }
      if ( $currentPopup.find('h1').length ) {
        $currentPopup.find('h1').attr('tabindex', 0).eq(0).focus();
      }
      if ( $currentPopup.find('.focus-elem').length ) {
        $currentPopup.find('.focus-elem').attr('tabindex', 0).eq(0).focus();
      }
      // $currentPopup.children(':not(.popup-blind)').eq(0).attr('tabindex', -1).focus(); // 팝업열릴 때 해당 팝업 포커스
      //$currentPopup.attr({'tabindex': 0, 'aria-hidden': 'false'}).find('button').focus();
    }
    // 포커스 영역 저장 후 포커스 이동 end

  },

  /**
   * @desc  callback for failure to open popup
   * @param  {object} retryParams parameters
   * @private
   */
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

  /**
   * @desc  callback for retrying to open popup
   * @param  {object} retryParams parameters
   * @private
   */
  _onRetry: function (retryParams) {
    setTimeout($.proxy(function () {
      this._setOpenCallback(retryParams.openCallback);
      this._setConfirmCallback(retryParams.confirmCallback);
      this._addHash(retryParams.closeCallback, retryParams.curHash);
      this._open(retryParams.option, retryParams.evt);
    }, this), 200);
  },

  /**
   * @desc  callback for retry to open popup
   * @param  {object} retryParams parameters
   * @private
   */
  _popupClose: function (closeCallback) {
    this._confirmCallback = null;
    if ( !Tw.FormatHelper.isEmpty(closeCallback) ) {
      closeCallback();
    }
    skt_landing.action.popup.close();

    var $lastPopup = $('.tw-popup').last();
    $lastPopup.attr('aria-hidden', 'false');
  },

  /**
   * @desc push hash to list with callback fuction
   * @param  {Function} closeCallback
   * @param  {string} hashName
   * @private
   */
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

    // location.hash = hashName;
    history.pushState(this._popupObj, hashName, hashName);
  },

  /**
   * @desc bind events
   * @param  {$object} $container jquery object for container
   * @private
   */
  _bindEvent: function ($container) {
    $container.on('click', '.popup-blind', _.debounce($.proxy(this._onClickBlind, this, $container), 500));
    $container.on('click', '.popup-closeBtn', _.debounce($.proxy(this.close, this), 500));
    $container.on('click', '.tw-popup-closeBtn', _.debounce($.proxy(this.close, this), 500));
    $container.on('click', '.tw-popup-confirm', _.debounce($.proxy(this._confirm, this), 500));
  },

  /**
   * @desc when click background on popup
   * @param  {$object} $container jquery object for container
   * @private
   */
  _onClickBlind: function ($container) {
    if ( $container.find('.fe-no-blind-close').length === 0 ) {
      this.close();
    }
  },

  /**
   * @desc handler for click confirm button
   * @private
   */
  _confirm: function () {
    if ( !Tw.FormatHelper.isEmpty(this._confirmCallback) ) {
      this._sendConfirmCallback();
    } else {
      this.close();
    }
  },

  /**
   * @desc set callback for click confirm button
   * @private
   */
  _setConfirmCallback: function (callback) {
    if ( !Tw.FormatHelper.isEmpty(callback) ) {
      this._confirmCallback = callback;
    }
  },

  /**
   * @desc set callback for opening confirm button
   * @private
   */
  _setOpenCallback: function (callback) {
    if ( !Tw.FormatHelper.isEmpty(callback) ) {
      this._openCallback = callback;
    }
  },

  /**
   * @desc execute callback for click confirm button
   * @private
   */
  _sendConfirmCallback: function () {
    this._confirmCallback();
  },

  /**
   * @desc execute callback for opening confirm button
   * @private
   */
  _sendOpenCallback: function ($container) {
    this._openCallback($container);
    this._openCallback = null;
  },

  /**
   * @desc open popup
   * @param  {object} option popup options
   * @param  {$object} evt jquery object for event target
   * @private
   */
  _open: function (option, evt) {
    // CDN Url 셋팅 안된 채로 open 시도시 200ms 지연 후 재시도
    if ( Tw.FormatHelper.isEmpty(Tw.Environment.cdn) ) {
      setTimeout($.proxy(function () {
        this._open(option, evt);
      }, this), 200);
      return;
    }

    $.extend(option, {
      url: Tw.Environment.cdn + '/hbs/',
      cdn: Tw.Environment.cdn
    });

    skt_landing.action.popup.open(option, $.proxy(this._onOpenPopup, this, evt), $.proxy(this._onFailPopup, this, {
      option: option,
      openCallback: this._openCallback,
      confirmCallback: this._confirmCallback,
      evt: evt
    }));
  },
  
  /**
   * @desc open popup
   * @param  {object} option popup options
   * @param  {Function} openCallback
   * @param  {Function} closeCallback
   * @param  {string} hashName
   * @param  {$object} evt jquery object for event target
   * @public
   */
  open: function (option, openCallback, closeCallback, hashName, evt) {
    this._setOpenCallback(openCallback);
    this._addHash(closeCallback, hashName);
    this._open(option, evt);
  },

  /**
   * @desc open alert
   * @param  {string} contents
   * @param  {string} title
   * @param  {string} btName
   * @param  {Function} closeCallback
   * @param  {string} hash
   * @param  {$object} evt
   * @public
   */
  openAlert: function (contents, title, btName, closeCallback, hash, evt) {
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
    this._open(option, evt);
  },
  
  /**
   * @desc open confirm popup
   * @param  {string} contents
   * @param  {string} title
   * @param  {Function} confirmCallback
   * @param  {Function} closeCallback
   * @param  {$object} evt
   * @public
   */
  openConfirm: function (contents, title, confirmCallback, closeCallback, evt) {
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
    this._open(option, evt);
  },

  /**
   * @desc open custom confirm popup
   * @param  {string} contents
   * @param  {string} title
   * @param  {Function} confirmCallback
   * @param  {Function} closeCallback
   * @param  {string} cancelButton
   * @param  {string} confirmButton
   * @param  {$object} evt
   * @public
   */
  openConfirmButton: function (contents, title, confirmCallback, closeCallback, cancelButton, confirmButton, evt) {
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
    this._open(option, evt);
  },
  
  /**
   * @desc open alert
   * @param  {string} title
   * @param  {string} contents
   * @param  {string} icoType
   * @param  {Function} openCallback
   * @param  {Function} closeCallback
   * @param  {$object} evt
   * @public
   */
  openTypeA: function (title, contents, icoType, openCallback, closeCallback, evt) {
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
    this._open(option, evt);
  },
  
  /**
   * @desc open alert
   * @param  {string} title
   * @param  {string} contents
   * @param  {Array} linkList
   * @param  {string} icoType
   * @param  {Function} openCallback
   * @param  {Function} closeCallback
   * @param  {$object} evt
   * @public
   */
  openOneBtTypeB: function (title, contents, linkList, icoType, openCallback, closeCallback, evt) {
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
    this._open(option, evt);
  },

  /**
   * @desc open confirm popup
   * @param  {string} title
   * @param  {string} contents
   * @param  {string} btName
   * @param  {Function} openCallback
   * @param  {Function} confirmCallback
   * @param  {Function} closeCallback
   * @param  {string} hashName
   * @param  {string} align
   * @param  {$object} evt
   * @public
   */
  openModalTypeA: function (title, contents, btName, openCallback, confirmCallback, closeCallback, hashName, align, evt) {
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
    this._open(option, evt);
  },

  /**
   * @desc open poppup for change line
   * @param  {object} from service info
   * @param  {object} target current line 
   * @param  {string} btName
   * @param  {Function} openCallback
   * @param  {Function} confirmCallback
   * @param  {Function} closeCallback
   * @param  {string} hashName
   * @param  {string} align
   * @param  {$object} evt
   * @public
   */
  openSwitchLine: function (from, target, btName, openCallback, confirmCallback, closeCallback, hashName, align, evt) {

    // 회선 정보
    _.each([from, target], function (item) {
      if ( ['S1', 'S2'].indexOf(item.svcAttrCd) > -1 ) {
        item.descSvcNum = item.addr;
      } else {
        item.descSvcNum = Tw.FormatHelper.conTelFormatWithDash(item.svcNum.replace(/-/g, ''));
      }
    });

    // 회선 타입
    var clsNm = 'cellphone';
    if ( target.svcAttrCd.indexOf('S') > -1 ) {
      if ( target.svcAttrCd === 'S1' ) {
        clsNm = 'internet';
      } else {
        clsNm = 'pc';
      }
    }
    else if ( ['M3', 'M4'].indexOf(target.svcAttrCd) > -1 ) {
      clsNm = 'tablet';
    }

    var template = Handlebars.compile(Tw.MYT_TPL.SWITCH_LINE_POPUP.CONTENTS);
    var contents = template({
      svcNum: target.descSvcNum,
      desc: _.isEmpty(target.nickNm) ? target.eqpMdlNm : target.nickNm,
      clsNm: clsNm
    });
    template = Handlebars.compile(Tw.MYT_TPL.SWITCH_LINE_POPUP.TITLE);
    var title = template({
      svcNum: from.descSvcNum
    });

    // openModalTypeA
    var option = {
      title: title,
      title_type: 'sub',
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
    this._open(option, evt);
  },

  /**
   * @desc open modal poup had two buttons
   * @param  {string} title
   * @param  {string} contents
   * @param  {string} btName
   * @param  {string} closeBtName
   * @param  {Function} openCallback
   * @param  {Function} confirmCallback
   * @param  {Function} closeCallback
   * @param  {string} hashName
   * @param  {$object} evt
   * @public
   */
  openModalTypeATwoButton: function (title, contents, btName, closeBtName, openCallback, confirmCallback, closeCallback, hashName, evt) {
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
    this._open(option, evt);
  },

  /**
   * @desc open toast
   * @param {string} message 
   * @public
   */
  toast: function (message) {
    skt_landing.action.popup.toast({
      url: Tw.Environment.cdn + '/hbs/',
      text: message,
      second: 5
    });
  },

  /**
   * @desc close popup
   * @public
   */
  close: function () {
    Tw.Logger.log('[Popup] Call Close', location.hash);
    if ( /_P/.test(location.hash) || /popup/.test(location.hash) ) {
      Tw.Logger.log('[Popup] history back');

      if ( Tw.BrowserHelper.isIosChrome() && /mainAuto/.test(location.hash) ) {
        var lastHash = this._prevHashList[this._prevHashList.length - 1];
        var closeCallback = lastHash.closeCallback;
        location.hash = lastHash.curHash;
        this._prevHashList.pop();
        this._popupClose(closeCallback);
        history.replaceState(this._popupObj, '', '');
      } else if ( Tw.BrowserHelper.isIosChrome() && /search_keyword_err/.test(location.hash) ){
        //검색 ios chrome 에서 팝업 안닫히는 현상 예외
        this._popupClose();
        this._historyService.goBack();
        setTimeout($.proxy(function(){
          if(this._prevHashList[this._prevHashList.length - 1].curHash!=='#'&&this._historyService.getHash()===''){
            this._addHash(function () {
              $('.keyword-list-base').remove();
            },'input');
          }
        },this),300);
      } else {
        if ( /\/main\/home/.test(location.href) || /\/main\/store/.test(location.href) ) {
          setTimeout($.proxy(function () {
            if ( this._historyBack && this._prevHashList.length > 0 ) {
              this._historyBack = false;
              var lastHash = this._prevHashList[this._prevHashList.length - 1];
              var closeCallback = lastHash.closeCallback;
              location.hash = lastHash.curHash;
              this._prevHashList.pop();
              this._popupClose(closeCallback);
            }
          }, this), 500);
        }

        this._historyBack = true;
        history.back();
      }
    }
  },

  /**
   * @desc close all popup
   * @public
   */
  closeAll: function ($container, $focusTarget) {
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

      if ($container) {
        $container.find('.popup-page').attr('aria-hidden', 'false');
      }

      if ($focusTarget) {
        $focusTarget.focus();
      }
    }
  },

  /**
   * @desc go to link after close all popup
   * @param {string} targetUrl
   * @public
   */
  closeAllAndGo: function (targetUrl) {
    var hashLength = this._prevHashList.length;
    this._prevHashList = [];
    skt_landing.action.popup.allClose();
    history.go(-hashLength);

    setTimeout(function () {
      location.replace(targetUrl);
    }, 0);
  },

  /**
   * @desc whether current page is popup or not
   * @public
   */
  isPopup: function () {
    var $popups = $('.tw-popup');
    var $currentPopup = $($popups[$popups.length - 1]);

    if ( /_P/.test(location.hash) || /popup/.test(location.hash) ) {
      return $currentPopup;
    }
    return null;
  },

  /**
   * @desc open complete popup
   * @param  {string} historyUrl
   * @param  {string} mainUrl
   * @param  {string} linkText
   * @param  {string} text
   * @param  {string} subText
   * @public
   */
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
  
  /**
   * @desc bind event to complete popup
   * @param  {string} historyUrl
   * @param  {string} mainUrl
   * @param  {$object} $layer
   * @private
   */
  _onComplete: function (historyUrl, mainUrl, $layer) {
    $layer.on('click', '.fe-payment-history', $.proxy(this._goLink, this, historyUrl));
    $layer.on('click', '.fe-submain', $.proxy(this._goLink, this, mainUrl));
  },

  /**
   * @desc go link
   * @param  {string} url
   * @private
   */
  _goLink: function (url) {
    if ( typeof(url) === 'object' ) {
      this.open({
        'hbs': url.hbs
      }, url.open, url.close, url.name);
    } else {
      location.href = url;
    }
  },

  /**
   * @desc go back
   * @private
   */
  _goBack: function () {
    history.back();
  },

  /**
   * @desc remove hash
   * @private
   */
  _emptyHash: function () {
    history.replaceState(this._popupObj, '#', '#');
  },

  // Ios환경에서 포커스 가능한 객체 구하기
  _getEnableFocusEl: function ($focusEl) {
    var $resultEl = $focusEl;
    // ios 에서는 selectable element만 가능
    if ( Tw.BrowserHelper.isIos() ) {
      if ( !$resultEl.is('button') && !$resultEl.is('[type=radio]') ) {
        if ( $resultEl.find('button').length ) {
          $resultEl = $resultEl.find('button').eq(0);
        } else if ( $resultEl.find('[type=radio]').length ) {
          $resultEl.find('[type=radio]').eq(0);
        }
      }
      return $resultEl;
    }
    return $resultEl;
  }
};
