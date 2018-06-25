Tw.UrlHelper = (function () {
  var getQueryParams = function () {
    var qs = document.location.search;
    qs = qs.split('+').join(' ');
    var params = {},
        tokens,
        re     = /[?&]?([^=]+)=([^&]*)/g;
    while ( tokens = re.exec(qs) ) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
  }


  return {
    getQueryParams: getQueryParams
  }
})();
