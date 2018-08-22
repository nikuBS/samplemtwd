Tw.UrlHelper = (function () {
  var getQueryParams = function () {
    var qs = document.location.search;
    qs = qs.split('+').join(' ');
    var params = {},
        tokens,
        re     = new RegExp(/[?&]?([^=]+)=([^&]*)/g);

    while ( (tokens = re.exec(qs)) != null ) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
  };

  // 앱 / 일반에서 링크 열기
  var openUrl = function (url) {
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.Native.send(Tw.NTV_CMD.OPEN_URL, {
        type: 1,
        href: url
      }, null);
    } else {
      window.open( url, '_blank');
    }
  };

  return {
    getQueryParams: getQueryParams,
    openUrl : openUrl
  };
})();
