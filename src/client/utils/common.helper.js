Tw.CommonHelper = (function () {
  // 앱 / 일반에서 링크 열기
  var openUrl = function (url) {
    if ( url.indexOf('http') === -1 ) {
      url = 'http://' + url;
    }
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.Native.send(Tw.NTV_CMD.OPEN_URL, {
        type: Tw.NTV_BROWSER.EXTERNAL,
        href: url
      }, null);
    } else {
      window.open(url, '_blank');
    }
  };

  return {
    openUrl: openUrl
  };
})();
