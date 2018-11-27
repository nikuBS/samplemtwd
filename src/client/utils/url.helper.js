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

  var getLastPath = function () {
    var seg = document.location.pathname.substr(document.location.pathname.lastIndexOf('/') + 1);
    return seg;
  };

  return {
    getQueryParams: getQueryParams,
    getLastPath: getLastPath
  };
})();
