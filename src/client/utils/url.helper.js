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

  return {
    getQueryParams: getQueryParams,
  };
})();
