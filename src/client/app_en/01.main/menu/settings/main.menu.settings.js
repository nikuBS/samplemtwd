
Tw.MainMenuSettings = function (rootEl) {
  this.$container = rootEl;

  this._commonHelper = Tw.CommonHelper;

  this._cacheElements();
  this._bindEvents();
};

Tw.MainMenuSettings.prototype = {
  _cacheElements: function () {
    this.$toggleBtn = this.$container.find('#is-eng');
  },

  // 이벤트 핸들러
  _bindEvents: function() {
    this.$toggleBtn.on('click', $.proxy(this._handleToggle, this));
  },

  // toggle envent 핸들러
  _handleToggle: function() {
    var isEng = this._getGlobalLanguageCookie();
    if( isEng ) {
      document.cookie = Tw.COOKIE_KEY.GLOBAL_ENGLISH +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'; // 쿠키를 사용하지않음.

    } else {
      this._commonHelper.setCookie(Tw.COOKIE_KEY.GLOBAL_ENGLISH, true, 365 * 10); // session 쿠키를 사용하지않음.
    }
    
    if( Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      location.reload();
    }
  },

  // 글로벌 언어 쿠키값 조회.
  _getGlobalLanguageCookie: function() {
    return this._commonHelper.getCookie(Tw.COOKIE_KEY.GLOBAL_ENGLISH) || false;
  }

};
