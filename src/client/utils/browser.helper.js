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

  var isSamsung = function () {
    return /SamsungBrowser/i.test(userAgent);
  };

  var isIosChrome = function () {
    return /CriOS/i.test(userAgent);
  };

  var getUserAgent = function () {
    return userAgent;
  };

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
