/**
 * @file common.share.app-install.info.js
 * @author Jayoon Kong
 * @since 2018.11.30
 * @desc APP 설치 유도 페이지
 */

/**
 * @namespace
 * @desc APP 설치 유도 페이지 namespace
 * @param rootEl - dom 객체
 * @param target - page target
 * @param loginType - login type
 */
Tw.CommonShareAppInstallInfo = function (rootEl, target, loginType, referer) {
  this.$container = rootEl;
  this._target = target || '/main/home';
  this._loginType = loginType || 'N';
  this._twReferer = referer || '';

  this._popupService = Tw.Popup;

  this._isAndroid = Tw.BrowserHelper.isAndroid();
  this._isIos = Tw.BrowserHelper.isIos();
  this._isLink = false;

  this._bindEvent();

  this._historyService = new Tw.HistoryService();

  this._moveToTworld();

};

Tw.CommonShareAppInstallInfo.prototype = {
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-link', $.proxy(this._goLoad, this));
    this.$container.on('click', '.fe-tworld', $.proxy(this._onClickTworld, this));
    this.$container.on('click', '.fe-go-to-web', $.proxy(this._onClickTworldWeb, this));
  },
  /**
   * @function
   * @desc APP store로 이동
   * @param event
   */
  _goLoad: function (event) {
    var $target = $(event.currentTarget);
    Tw.CommonHelper.openUrlExternal($target.attr('data-link'));
  },
  /**
   * @function
   * @desc tworld 바로가기 클릭 event
   */
  _onClickTworld: function () {
    this._moveToTworld();
  },
    /**
   * @function
   * @desc tworld 바로가기
   */
  _moveToTworld: function() {
    var appCustomScheme = 'mtworldapp2://tworld?target=' + encodeURIComponent(this._target) + '&loginType=' + encodeURIComponent(this._loginType) + '&twReferer=' + encodeURIComponent(this._twReferer);

    if (this._isAndroid) {
      setTimeout($.proxy(this._checkStoreForAndroid, this), 1000);
    }

    if (this._isIos) {
      setTimeout($.proxy(this._checkStoreForIos, this), 1000);
    }

    setTimeout($.proxy(this._goApp, this, appCustomScheme), 0);
  },

  /**
   * @function
   * @desc check store for android
   */
  _checkStoreForAndroid: function () {
    if (!document.webkitHidden) {
      this._openHbs();
    }
  },
  /**
   * @function
   * @desc check store for iOS
   */
  _checkStoreForIos: function () {
    if (!document.webkitHidden) {
      this._href = Tw.OUTLINK.APP_STORE;
      this._goStore(true);
    }
  },
  /**
   * @function
   * @desc tworld app으로 이동
   * @param appCustomScheme
   */
  _goApp: function (appCustomScheme) {
    window.location.href = appCustomScheme;
  },
  /**
   * @function
   * @desc playstore/onestore 선택 actionsheet
   */
  _openHbs: function () {
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet03',
      layer: true,
      data: Tw.ANDROID_STORE
    },
      $.proxy(this._onSelectStore, this),
      $.proxy(this._goStore, this)
    );
  },
  /**
   * @function
   * @desc actionsheet event binding
   * @param $layer
   */
  _onSelectStore: function ($layer) {
    $layer.find('img').each($.proxy(this._getImgSrc, this));
    $layer.on('click', 'li', $.proxy(this._setStoreUrl, this));
    $layer.on('click', '.fe-close', $.proxy(this._onlyClose, this));
  },
  /**
   * @function
   * @desc get img src
   * @param idx
   * @param target
   */
  _getImgSrc: function (idx, target) {
    var $img = $(target);
    var src = Tw.Environment.cdn + $img.attr('src');
    $img.attr('src', src);
  },
  /**
   * @function
   * @desc set store url
   * @param event
   */
  _setStoreUrl: function (event) {
    var $target = $(event.currentTarget);
    var $id = $target.find('button').attr('id').toString().toUpperCase();

    this._href = Tw.OUTLINK[$id + '_STORE'];
    this._isLink = true;

    this._popupService.close();
  },
  /**
   * @function
   * @desc close
   */
  _onlyClose: function () {
    this._isLink = false;
  },
  /**
   * @function
   * @desc go to store
   * @param isLink
   */
  _goStore: function (isLink) {
    if (isLink || this._isLink) {
      // OP002-4633 : (W-1910-088-01) [바로가기] iOS 랜딩 시 외부 팝업 얼럿 호출 오류 수정건.
      // App 접속이 아니고, 아이폰 일경우
      if( !Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isIos()) {
        window.location.href = this._href;
      } else {
        Tw.CommonHelper.openUrlExternal(this._href);
      }
    }
  },
  /**
   * @function
   * @desc tworld web 바로가기 클릭 event
   */
  _onClickTworldWeb: function () {
    var url = 'https://m.tworld.co.kr' + this._target;
    this._historyService.goLoad(url);
  }
};