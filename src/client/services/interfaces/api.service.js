Tw.ApiService = function () {
  this._popupService = new Tw.PopupService();
  this._historyService = new Tw.HistoryService();
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
      pathVariables: pathVariables
    };
    var authUrl = command.method + '|' + command.path;
    if ( resp.code === Tw.API_CODE.BFF_0008 || resp.code === Tw.API_CODE.BFF_0009 || resp.code === Tw.API_CODE.BFF_0010 ) {
      Tw.Logger.info('[API Cert]', command);
      if ( resp.code === Tw.API_CODE.BFF_0010 ) {
        resp.result.authClCd = Tw.AUTH_CERTIFICATION_KIND.R;
      }
      var cert = new Tw.CertificationSelect();
      setTimeout($.proxy(function () {
        Tw.CommonHelper.allOffLoading();
        cert.open(resp.result, authUrl, requestInfo, deferred, $.proxy(this._completeCert, this));
      }, this), 0);
      return deferred.promise();
    } else if ( resp.code === Tw.API_CODE.BFF_0020 ) {
      var certRepresentative = new Tw.CertificationRepresentative();
      setTimeout($.proxy(function () {
        Tw.CommonHelper.allOffLoading();
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
        var arrParams = [];
        arrParams.push(requestInfo.command);
        arrParams.push(requestInfo.params);
        arrParams.push(requestInfo.headers);
        arrParams = arrParams.concat(requestInfo.pathVariables);

        this.request.apply(this, arrParams)
          .done($.proxy(this._successRequestAfterCert, this, deferred));
      }
    } else {
      deferred.resolve({ code: Tw.API_CODE.CERT_FAIL });
    }
  },
  _successRequestAfterCert: function (deferred, resp) {
    Tw.Logger.info('[API Resp Cert]', resp);
    deferred.resolve(resp);
  },

  _makeOptions: function (command, params, headers, pathVariables) {
    var prefix = this._setPrefix(command);
    var path = command.path;

    // var data = prefix === '/bypass' ? { parameter: params, pathVariables: pathVariables } : params;
    return {
      method: command.method,
      url: prefix + this._makePath(path, pathVariables),
      timeout: 10000,
      dataType: 'json',
      headers: this._makeHeaders(command, headers),
      data: command.method === Tw.API_METHOD.GET ? params : JSON.stringify(params)
    };
  },

  _makePath: function (path, pathVariables) {
    if ( pathVariables.length > 0 ) {
      _.map(pathVariables, $.proxy(function (argument, index) {
        path = path.replace(':args' + index, argument);
      }, this));
    }
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
      expired: 60 * 60 * 1000,
      loginType: loginType
    });
    if ( !Tw.FormatHelper.isEmpty(callback) ) {
      callback();
    }
  }
};
