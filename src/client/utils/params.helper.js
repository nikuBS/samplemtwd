/**
 * @file params.helper.js
 * @author
 * @since 2018.05
 */

Tw.ParamsHelper = (function () {
  var getQueryParams = function(url) {
    if (url.indexOf('?') !== -1) {
      var queryString = url.split('?')[1].split('#')[0];
      var arrParams = queryString.split('&');
      var obj = {};

      var arrLength = arrParams.length;
      for (var i = 0; i < arrLength; i++) {
        var item = arrParams[i].split('=');
        obj[item[0]] = decodeURIComponent(item[1]);
      }

      return obj;
    }
    return null;
  };

  return {
    getQueryParams: getQueryParams
  };
})();
