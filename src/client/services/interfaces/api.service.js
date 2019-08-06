/**
 * @class
 * @desc API 요청을 위한 service
 * @constructor
 */
Tw.ApiService = function () {
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;
};

Tw.ApiService.prototype = {
  /**
   * @function
   * @desc API 요청
   * @param command
   * @param params
   * @param headers
   * @param pathParams
   * @param version
   * @param option
   * @returns {*}
   */
  request: function (command, params, headers, pathParams, version, option) {

    // cookie의 TWM 값과 sessionStorage에 저장된 값을 비교하여, 다를 경우 세션만료 페이지로 이동 시킨다.
    if(!Tw.CommonHelper.checkValidSession(location.pathname, command.path, 'CLIENT_API_REQ')) {
      return;
    } else {
      // var pathVariables = this._getPathVariables(arguments);
      pathParams = pathParams || [];
      var htOptions = this._makeOptions(command, params, headers, pathParams, version, option);
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
    }
    

  },

  /**
   * @function
   * @desc 여러개의 API 요청
   * @param requests
   * @returns {*}
   */
  requestArray: function (requests) {
    return $.when.apply($, _.map(requests, $.proxy(function (request) {
      return this.request(request.command, request.params, request.headers, request.pathParams, request.version);
    }, this)));
  },

  /**
   * @function
   * @desc 외부서버 API 요청
   * @param command
   * @param data
   * @returns {*|{readyState, getResponseHeader, getAllResponseHeaders, setRequestHeader, overrideMimeType, statusCode, abort}}
   */
  requestAjax: function (command, data) {
    Tw.Logger.info('[API REQ ajax]', command, data);

    return $.ajax({
      headers: this._makeHeaders(command),
      method: command.method,
      url: command.url + command.path,
      data: command.method === Tw.API_METHOD.GET ? data : JSON.stringify(data)
    });
  },

  /**
   * @function
   * @desc File 업로드 요청
   * @param command
   * @param data
   * @returns {*|{readyState, getResponseHeader, getAllResponseHeaders, setRequestHeader, overrideMimeType, statusCode, abort}}
   */
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

  /**
   * @function
   * @desc API 응답 예외처리 확인 (차단, 인증 등)
   * @param command
   * @param params
   * @param headers
   * @param pathParams
   * @param version
   * @param resp
   * @returns {*}
   * @private
   */
  _checkAuth: function (command, params, headers, pathParams, version, resp) {
    Tw.Logger.info('[API RESP]', resp);
    var deferred = $.Deferred();
    var path = '';
    var blockUrl = '';
    var hash = '';

    if ( !Tw.FormatHelper.isEmpty(resp.loginType) ) {
      this.sendNativeSession(resp.loginType);
      delete resp.loginType;
    }

    // cookie의 TWM 값과 sessionStorage에 저장된 값을 비교하여, 다를 경우 세션만료 페이지로 이동 시킨다.
    if(!Tw.CommonHelper.checkValidSession(location.pathname, command.path, 'CLIENT_API_RES')) {
      return;
    }

    if ( resp.code === Tw.API_CODE.NODE_1005 ) {
      var params = 'sess_invalid=Y'
        + '&pre_server_se=' + resp.result.preServerSession
        + '&cur_server_se=' + resp.result.curServerSession
        + '&url=' + resp.result.url
        + '&command_path=' + resp.result.commandPath
        + '&point=' + resp.result.point
        + '&target=' + resp.result.target;

      this._historyService.replaceURL('/common/member/logout/expire?' + params);
      return;
    }

    if ( resp.code === Tw.API_CODE.NODE_1004 ) {
      Tw.CommonHelper.setCookie(Tw.COOKIE_KEY.TWM_LOGIN, '');
      this._historyService.replaceURL('/common/member/logout/expire?target=' + location.pathname + location.search);
      return;
    }

    if ( resp.code === Tw.API_CODE.BFF_0003 ) {
      var loginCookie = Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.TWM_LOGIN);
      if ( !Tw.FormatHelper.isEmpty(loginCookie) && loginCookie === 'Y' ) {
        Tw.CommonHelper.setCookie(Tw.COOKIE_KEY.TWM_LOGIN, '');
        this._historyService.replaceURL('/common/member/logout/expire?target=' + location.pathname + location.search);
      } else {
        var tidLanding = new Tw.TidLandingComponent();
        tidLanding.goLogin(location.pathname + location.search);
      }
      return resp;
    }

    if ( resp.code === Tw.API_CODE.BFF_0006 || resp.code === Tw.API_CODE.BFF_0011 ) {
      path = location.pathname;
      hash = location.hash;
      if ( /\/main\/home/.test(path) || /\/main\/store/.test(path) || /\/submain/.test(path) || /menu/.test(hash) ) {
        return resp;
      } else {
        blockUrl = resp.result.fallbackUrl || '/common/util/service-block';
        this._historyService.replaceURL(blockUrl + '?fromDtm=' + resp.result.fromDtm + '&toDtm=' + resp.result.toDtm);
      }
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

  /**
   * @function
   * @desc 인증 완료
   * @param resp
   * @param deferred
   * @param requestInfo
   * @private
   */
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

  /**
   * @function
   * @desc 인증 완료후 API 응답 처리
   * @param deferred
   * @param resp
   * @private
   */
  _successRequestAfterCert: function (deferred, resp) {
    Tw.Logger.info('[API Resp Cert]', resp);
    deferred.resolve(resp);
  },

  /**
   * @function
   * @desc API 요청 option 구성
   * @param command
   * @param params
   * @param headers
   * @param pathVariables
   * @param version
   * @param option
   * @returns {{method: *, url: *, timeout: number, dataType: string, headers: *, data: string}}
   * @private
   */
  _makeOptions: function (command, params, headers, pathVariables, version, option) {
    var prefix = this._setPrefix(command);
    var path = command.path;

    // var data = prefix === '/bypass' ? { parameter: params, pathVariables: pathVariables } : params;
    var result = {
      method: command.method,
      url: prefix + this._makePath(path, pathVariables, version),
      timeout: 10000,
      dataType: 'json',
      headers: this._makeHeaders(command, headers),
      data: command.method === Tw.API_METHOD.GET ? params : JSON.stringify(params)
    };

    if ( !Tw.FormatHelper.isEmpty(option) ) {
      $.extend(result, option);
    }
    return result;
  },

  /**
   * @function
   * @desc API 요청 URL 구성
   * @param path
   * @param pathVariables
   * @param version
   * @returns {*}
   * @private
   */
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

  /**
   * @function
   * @desc API 요청 header 구성
   * @param command
   * @param headers
   * @private
   */
  _makeHeaders: function (command, headers) {
    var contentType = 'application/json; charset=UTF-8';
    if ( !Tw.FormatHelper.isEmpty(command.contentType) ) {
      contentType = command.contentType;
    }
    return $.extend(headers, { 'content-type': contentType });
  },

  /**
   * @function
   * @desc command에 따른 URL prefix 구성
   * @param command
   * @returns {string}
   * @private
   */
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

  /**
   * @function
   * @desc API 요청 path variable 구성
   * @param args
   * @returns {*}
   * @private
   */
  _getPathVariables: function (args) {
    var arrArgs = Array.prototype.slice.call(args);
    var argsLen = arrArgs.length;
    if ( argsLen > 3 ) {
      return arrArgs.slice(3, argsLen);
    }
    return [];
  },

  /**
   * @function
   * @desc Native에 세션 전달
   * @param loginType
   * @param callback
   */
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
