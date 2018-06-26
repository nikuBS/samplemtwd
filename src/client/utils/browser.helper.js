Tw.BrowserHelper = (function () {
  var userAgent = window.navigator.userAgent;
  var isAndroid = function () {
    return /Android/i.test(userAgent);
  };

  var isIos = function () {
    return /iPhone|iPad|iPod/i.test(userAgent);
  };

  var isMobile = function () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  };

  var isApp = function () {
    return /TWM_APP/i.test(userAgent);
  };

  var isOnline = function () {
    return window.navigator.onLine;
  };

  var getUserAgent = function () {
    return userAgent;
  };

  return {
    isAndroid: isAndroid,
    isIos: isIos,
    isMobile: isMobile,
    isOnline: isOnline,
    getUserAgent: getUserAgent
  }
})();
