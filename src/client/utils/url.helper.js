Tw.UrlHelper = (function() {
  var getQueryParams = function(url) {
    var qs = url || document.location.search;
    if (qs.indexOf('?') !== -1) {
      qs = qs.substring(qs.indexOf('?') + 1);
    }

    qs = qs.split('+').join(' ');
    var params = {},
      tokens,
      re = new RegExp(/[?&]?([^=]+)=([^&]*)/g);

    while ((tokens = re.exec(qs)) != null) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
  };

  var getLastPath = function() {
    var seg = document.location.pathname.substr(document.location.pathname.lastIndexOf('/') + 1);
    return seg;
  };

  return {
    getQueryParams: getQueryParams,
    getLastPath: getLastPath
  };
})();
