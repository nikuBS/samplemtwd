Tw.ApiService = function () {
  this._popupService = new Tw.PopupService();
  this._nativeService = Tw.Native;
};

Tw.ApiService.prototype = {
  request: function (command, params, headers) {
    var pathVariables = this._getPathVariables(arguments);
    var htOptions = this._makeOptions(command, params, headers, pathVariables);
    Tw.Logger.info('[API REQ]', htOptions);

    return $.ajax(htOptions)
      .then($.proxy(this._checkAuth, this, command, params, headers, pathVariables));
  },

  requestArray: function (requests) {
    return $.when.apply($, _.map(requests, $.proxy(function (request) {
      return this.request(request.command, request.params, request.headers);
    }, this)));
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

  _checkAuth: function (command, params, headers, pathVariables, resp) {
    Tw.Logger.info('[API RESP]', resp, JSON.stringify(resp));
    var deferred = $.Deferred();

    if ( !Tw.FormatHelper.isEmpty(resp.serverSession) ) {
      this.sendNativeSession(resp.serverSession, resp.loginType);
      delete resp.serverSession;
      delete resp.loginType;
    }

    if ( resp.code === Tw.API_CODE.CODE_03 ) {
      this._cert = new Tw.CertificationSelect();
      setTimeout($.proxy(function () {
        var requestInfo = {
          command: command,
          params: params,
          headers: headers,
          pathVariables: pathVariables
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
      var arrParams = [];
      arrParams.push(requestInfo.command);
      arrParams.push(requestInfo.params);
      arrParams.push(requestInfo.headers);
      arrParams = arrParams.concat(requestInfo.pathVariables);

      this.request.apply(this, arrParams)
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
  },

  setSession: function (callback) {
    this.request(Tw.NODE_CMD.GET_SERVER_SERSSION, {})
      .done($.proxy(this._successSession, this, callback));
  },

  _successSession: function (callback, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.sendNativeSession(resp.result.serverSession, resp.result.loginType);
      if(!Tw.FormatHelper.isEmpty(callback)) {
        callback();
      }
    }
  },
  sendNativeSession: function (serverSession, loginType) {
    this._nativeService.send(Tw.NTV_CMD.SESSION, {
      serverSession: serverSession,
      expired: 60 * 60 * 1000,
      loginType: loginType
    });
  }
};
