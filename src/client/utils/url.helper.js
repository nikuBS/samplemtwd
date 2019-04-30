Tw.UrlHelper = (function () {
  /**
   * @desc get query params from url
   * @param  {string|undefined} url
   * @returns {[key: string]: string} 
   * @public
   */
  var getQueryParams = function (url) {
    var qs = url || document.location.search;
    if ( qs.indexOf('#') !== -1 ) {
      qs = qs.substring(0, qs.indexOf('#'));
    }
    if ( qs.indexOf('?') !== -1 ) {
      qs = qs.substring(qs.indexOf('?') + 1);
    }

    qs = qs.split('+').join(' ');
    var params = {},
        tokens,
        re     = new RegExp(/[?&]?([^=]+)=([^&]*)/g);

    while ( (tokens = re.exec(qs)) != null ) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
    return params;
  };

  /**
   * @desc get latest uri
   * @returns {string}
   * @public 
   */
  var getLastPath = function () {
    var seg = document.location.pathname.substr(document.location.pathname.lastIndexOf('/') + 1);
    return seg;
  };

  /**
   * @desc chage value of query parameter
   * @param  {string} key
   * @param  {string} value
   * @param  {string|undefined} url
   * @returns {string}
   * @public
   */
  var replaceQueryParam = function (key, value, url) {
    var current = url || location.href;

    if ( current.indexOf(key) !== -1 ) {
      return current.replace(new RegExp('(' + key + '=)[^&]+', 'g'), '$1' + value);
    } else {
      var separator = location.href.indexOf('?') === -1 ? '?' : '&';
      return current + separator + key + '=' + value;
    }
  };

  return {
    getQueryParams: getQueryParams,
    getLastPath: getLastPath,
    replaceQueryParam: replaceQueryParam
  };
})();
