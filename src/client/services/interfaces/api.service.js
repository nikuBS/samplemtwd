Tw.ApiService = function () {
};

Tw.ApiService.prototype = {
  request: function (command, params, headers) {
    var pathVariables = this._getPathVariables(arguments);
    var htOptions = this._makeOptions(command, params, headers, pathVariables);
    Tw.Logger.info('[API REQ]', htOptions);

    return $.ajax(htOptions);
  },

  _makeOptions: function (command, params, headers, pathVariables) {
    var prefix = this._setPrefix(command);
    var data = prefix === '/bypass' ? { parameter: params, pathVariables: pathVariables } : params;
    return {
      type: command.method,
      url: prefix + command.path,
      dataType: 'json',
      timeout: 10000,
      headers: Object.assign({ 'content-type': 'application/json; charset=UTF-8' }, headers),
      data: command.method === Tw.API_METHOD.GET ? data : JSON.stringify(data)
    };
  },

  _setPrefix: function (command) {
    if ( !Tw.FormatHelper.isEmpty(_.findKey(Tw.API_CMD, command)) ) {
      return '/bypass';
    } else if ( !Tw.FormatHelper.isEmpty(_.findKey(Tw.NODE_CMD, command)) ) {
      return '/api';
    } else {
      return '';
    }
  },

  _getPathVariables: function (args) {
    var arrArgs = Array.prototype.slice.call(args);
    var argsLen = arrArgs.length;
    if ( argsLen > 3 ) {
      return arrArgs.slice(3, argsLen);
    }
    return [];
  }
};
