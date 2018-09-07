Tw.ApiService = function () {
  this._popupService = new Tw.PopupService();
};

Tw.ApiService.prototype = {
  request: function (command, params, headers) {
    var pathVariables = this._getPathVariables(arguments);
    var htOptions = this._makeOptions(command, params, headers, pathVariables);
    Tw.Logger.info('[API REQ]', htOptions);

    return $.ajax(htOptions)
      .then($.proxy(this._checkAuth, this, command, params));
  },

  requestAjax: function (command, data) {
    Tw.Logger.info('[API REQ ajax]', command, data);

    return $.ajax({
      headers: this._makeHeaders(command),
      method: command.method,
      url: command.url + command.path,
      data: command.method === Tw.API_METHOD.GET ? data : JSON.stringify(data)
    });
  },

  requestForm: function (command, data) {
    Tw.Logger.info('[API REQ Form]', command, data);

    return $.ajax({
      method: command.method,
      url: '/api' + command.path,
      processData: false,
      contentType: false,
      cache: false,
      data: data,
      enctype: 'multipart/form-data'
    });
  },

  _checkAuth: function (command, params, resp) {
    Tw.Logger.info('[API RESP]', resp);
    var deferred = $.Deferred();

    if ( resp.code === Tw.API_CODE.CODE_03 ) {
      this._cert = new Tw.CertificationSelect();
      setTimeout($.proxy(function () {
        var requestInfo = {
          command: command,
          params: params
        };
        // url, svcInfo, urlMeta, callbackFunction, deferred...
        this._cert.open(resp.result, requestInfo, deferred, $.proxy(this._completeCert, this));
      }, this), 0);
      return deferred.promise();
    } else {
      return resp;
    }
  },

  _completeCert: function (resp, deferred, requestInfo) {
    if ( !Tw.FormatHelper.isEmpty(resp) && resp.code === Tw.API_CODE.CODE_00 ) {
      this._setCert(requestInfo, deferred);
      // deferred.resolve({ code: Tw.API_CODE.CERT_SUCCESS });
    } else {
      deferred.resolve({ code: Tw.API_CODE.CERT_FAIL });
    }
  },
  _setCert: function (requestInfo, deferred) {
    this.request(Tw.NODE_CMD.SET_CERT, { url: '/bypass' + requestInfo.command.path })
      .done($.proxy(this._successSetCert, this, requestInfo, deferred));
  },
  _successSetCert: function (requestInfo, deferred, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.request(requestInfo.command, requestInfo.params)
        .done($.proxy(this._successRequestAfterCert, this, deferred));
    }
  },
  _successRequestAfterCert: function (deferred, resp) {
    deferred.resolve(resp);
  },

  _makeOptions: function (command, params, headers, pathVariables) {
    var prefix = this._setPrefix(command);
    var data = prefix === '/bypass' ? { parameter: params, pathVariables: pathVariables } : params;
    return {
      method: command.method,
      url: prefix + command.path,
      timeout: 10000,
      dataType: 'json',
      headers: this._makeHeaders(command, headers),
      data: command.method === Tw.API_METHOD.GET ? data : JSON.stringify(data)
    };
  },

  _makeHeaders: function (command, headers) {
    var contentType = 'application/json; charset=UTF-8';
    if ( !Tw.FormatHelper.isEmpty(command.contentType) ) {
      contentType = command.contentType;
    }
    return $.extend(headers, { 'content-type': contentType });
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

export default Tw.ApiService;
