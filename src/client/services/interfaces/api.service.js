Tw.ApiService = function () {
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;
};

Tw.ApiService.prototype = {
  request: function (command, params, headers, pathParams, version) {
    pathParams = pathParams || [];
    var htOptions = this._makeOptions(command, params, headers, pathParams, version);
    Tw.Logger.info('[API REQ]', htOptions);

    return $.ajax(htOptions)
      .then($.proxy(this._checkAuth, this, command, params, headers, pathParams, version))
      .fail(function (err) {
        if ( err.statusText === 'timeout' ) {
          err.code = 'timeout';
          err.msg = 'Timeout from ' + command.path;
        }
        return err;
      });
  },

  requestArray: function (requests) {
    return $.when.apply($, _.map(requests, $.proxy(function (request) {
      return this.request(request.command, request.params, request.headers, request.pathParams, request.version);
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

  _checkAuth: function (command, params, headers, pathParams, version, resp) {
    Tw.Logger.info('[API RESP]', resp);
    var deferred = $.Deferred();

    if ( !Tw.FormatHelper.isEmpty(resp.loginType) ) {
      this.sendNativeSession(resp.loginType);
      delete resp.loginType;
    }

    var requestInfo = {
      command: command,
      params: params,
      headers: headers,
      pathParams: pathParams,
      version: version
    };
    var authUrl = command.method + '|' + this._makePath(command.path, pathParams, version);
    if ( resp.code === Tw.API_CODE.BFF_0008 || resp.code === Tw.API_CODE.BFF_0009 || resp.code === Tw.API_CODE.BFF_0010 ) {
      Tw.Logger.info('[API Cert]', command);
      if ( resp.code === Tw.API_CODE.BFF_0010 ) {
        resp.result.authClCd = Tw.AUTH_CERTIFICATION_KIND.R;
      }
      var cert = new Tw.CertificationSelect();
      setTimeout($.proxy(function () {
        // Tw.CommonHelper.allOffLoading();
        cert.open(resp.result, authUrl, requestInfo, deferred, $.proxy(this._completeCert, this));
      }, this), 0);
      return deferred.promise();
    } else if ( resp.code === Tw.API_CODE.BFF_0020 ) {
      var certRepresentative = new Tw.CertificationRepresentative();
      setTimeout($.proxy(function () {
        // Tw.CommonHelper.allOffLoading();
        certRepresentative.open(resp.result, authUrl, requestInfo, deferred, $.proxy(this._completeCert, this));
      }, this), 0);
      return deferred.promise();
    } else {
      return resp;
    }
  },
  _completeCert: function (resp, deferred, requestInfo) {
    Tw.Logger.info('[Complete Cert]', resp);
    if ( !Tw.FormatHelper.isEmpty(resp) && resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.authKind === Tw.AUTH_CERTIFICATION_KIND.O ) {
        this._historyService.reload();
      } else {
        this.request(requestInfo.command, requestInfo.params, requestInfo.headers, requestInfo.pathParams, requestInfo.version)
          .done($.proxy(this._successRequestAfterCert, this, deferred));
      }
    } else if ( resp.code === Tw.API_CODE.CERT_CANCEL ) {
      Tw.CommonHelper.allOffLoading();
      // deferred.resolve(resp);
    } else {
      Tw.CommonHelper.allOffLoading();
      deferred.resolve(resp);
    }
  },
  _successRequestAfterCert: function (deferred, resp) {
    Tw.Logger.info('[API Resp Cert]', resp);
    deferred.resolve(resp);
  },

  _makeOptions: function (command, params, headers, pathVariables, version) {
    var prefix = this._setPrefix(command);
    var path = command.path;

    // var data = prefix === '/bypass' ? { parameter: params, pathVariables: pathVariables } : params;
    return {
      method: command.method,
      url: prefix + this._makePath(path, pathVariables, version),
      timeout: 10000,
      dataType: 'json',
      headers: this._makeHeaders(command, headers),
      data: command.method === Tw.API_METHOD.GET ? params : JSON.stringify(params)
    };
  },

  _makePath: function (path, pathVariables, version) {
    version = version || Tw.API_VERSION.V1;
    if ( pathVariables.length > 0 ) {
      _.map(pathVariables, $.proxy(function (argument, index) {
        path = path.replace(':args' + index, argument);
      }, this));
    }
    path = path.replace(':version', version);
    return path;
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
    } else if ( !Tw.FormatHelper.isEmpty(_.findKey(Tw.SESSION_CMD, command)) ) {
      return '/store';
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

  sendNativeSession: function (loginType, callback) {
    this._nativeService.send(Tw.NTV_CMD.SESSION, {
      serverSession: Tw.CommonHelper.getCookie('TWM'),
      expired: Tw.SESSION_EXPIRE_TIME,
      loginType: loginType
    });
    if ( !Tw.FormatHelper.isEmpty(callback) ) {
      callback();
    }
  }
};
