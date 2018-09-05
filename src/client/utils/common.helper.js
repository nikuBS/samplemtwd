Tw.CommonHelper = (function () {
  var openUrl = function(url, browserType, option) {
    if ( url.indexOf('http') === -1 ) {
      url = 'http://' + url;
    }
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.Native.send(Tw.NTV_CMD.OPEN_URL, {
        type: browserType,
        href: url
      }, null);
    } else {
      var windowPopup = window.open(url, '_blank', option);
      if(Tw.FormatHelper.isEmpty(windowPopup)) {
        Tw.Popup.openAlert('Pop-up blocked');
      }
    }
  };
  // 앱 / 일반에서 링크 열기
  var openUrlExternal = function (url, option) {
    openUrl(url, Tw.NTV_BROWSER.EXTERNAL, option);
  };

  var openUrlInApp = function (url, option) {
    openUrl(url, Tw.NTV_BROWSER.INAPP, option);
  };

  return {
    openUrlExternal: openUrlExternal,
    openUrlInApp: openUrlInApp
  };
})();
