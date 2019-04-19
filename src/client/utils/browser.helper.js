Tw.BrowserHelper = (function () {
  var userAgent = window.navigator.userAgent;
  /**
   * @desc 사용자 디바이스가 안드로이드 인지 여부
   * @returns {boolean}
   * @public
   */
  var isAndroid = function () {
    return /Android/i.test(userAgent);
  };

  /**
   * @desc 사용자 디바이스가 ios 인지 여부
   * @returns {boolean}
   * @public
   */
  var isIos = function () {
    return /iPhone|iPad|iPod/i.test(userAgent);
  };

  /**
   * @desc 사용자 디바이스가 모바일인지 여부
   * @returns {boolean}
   * @public
   */
  var isMobile = function () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  };

  /**
   * @desc 앱인지 여부
   * @returns {boolean}
   * @public
   */
  var isApp = function () {
    return /TWM_APP/i.test(userAgent);
  };

  /**
   * @desc 온라인 여부
   * @returns {boolean}
   * @public
   */
  var isOnline = function () {
    return window.navigator.onLine;
  };

  /**
   * @desc 삼성브라우저 여부
   * @returns {boolean}
   * @public
   */
  var isSamsung = function () {
    return /SamsungBrowser/i.test(userAgent);
  };

  /**
   * @desc ios 크롬 브라우저 여부
   * @returns {boolean}
   * @public
   */
  var isIosChrome = function () {
    return /CriOS/i.test(userAgent);
  };

  /**
   * @desc getter 
   * @returns {string}
   * @public
   */
  var getUserAgent = function () {
    return userAgent;
  };

  /**
   * @desc getter
   * @returns {string}
   * @public
   */
  var getAndroidVersion = function (ua) {
    ua = (ua || navigator.userAgent).toLowerCase();
    var match = ua.match(/android\s([0-9\.]*)/);
    return match ? match[1] : undefined;
  };

  return {
    isAndroid: isAndroid,
    isIos: isIos,
    isMobile: isMobile,
    isApp: isApp,
    isOnline: isOnline,
    isSamsung: isSamsung,
    isIosChrome: isIosChrome,
    getUserAgent: getUserAgent,
    getAndroidVersion: getAndroidVersion
  };
})();
