Tw.BrowserHelper = (function() {
  var userAgent = window.navigator.userAgent;
  var isAndroid = function() {
    if ( /Android/i.test(userAgent) ) {
      return true;
    }
    return false;
  };

  var isIos = function() {
    if ( /iPhone|iPad|iPod/i.test(userAgent) ) {
      return true;
    }
    return false;
  };

  var isMobile = function() {
    if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ) {
      return true;
    }
    return false;
  };

  var isOnline = function() {
    return window.navigator.onLine;
  };

  var getUserAgent = function() {
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
