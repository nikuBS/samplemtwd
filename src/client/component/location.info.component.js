/**
 * @file 위치정보 조회 관련 처리 (app, web)
 * @author 양정규
 * @since 2020-06-25
 */

/**
 * @constructor
 */
Tw.LocationInfoComponent = function () {
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
};

Tw.LocationInfoComponent.prototype = {

  /**
   * @function
   *  succCallback 성공 콜백
   * @param{function} failCallback 실패 콜백
   * @desc 현재 위치 조회 및 GPS ON/OFF 에 따른 BFF 위치정보 동의 여부 업데이트
   */
  getCurrentLocation: function (succCallback, failCallback) {
    /**
     * @function
     * @param{boolean} isGpsOn GPS ON/OFF 또는, 단말기의 위치 접근권한 여부
     * @param{function} succCallback
     * @param{function} failCallback
     * @param{JSON} resp  위치조회 결과
     * @returns {*}
     */
    var done = function (isGpsOn, succCallback, failCallback, resp) {
      // this._updateTermAgreements(isGpsOn);
      return isGpsOn ? succCallback(resp) : failCallback(resp);
    };

    if (Tw.BrowserHelper.isApp()) { // app 인 경우
      this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(function (res) {
        /**
         * res.resultCode 설명
         * 400 : 위치 권한이 없는 경우
         * 401 : GPS 꺼져 있는 경우
         * -1  :  위치를 못 잡은 경우
         */
        var _isGpsOn = [400, 401, -1].indexOf(parseInt(res.resultCode, 10)) === -1;
        var _resp = _isGpsOn ? res.params : res;
        done.call(this, _isGpsOn, succCallback, failCallback, _resp);
      }, this));
      return;
    }
    /**
     * [web 인 경우]
     * navigator.geolocation 이 보안상 "https" 에서만 동작 되도록 변경이 되어 http 프로토콜에서는 동작 불가함.
     * 단! 개발용인 로컬PC 의 http://localhost 로는 가능. 핸드폰으로 로컬 PC IP를 입력하여 접속하는 경우는 불가능 함!
     */
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition($.proxy(function (location) { // 위치 정보 확인 가능한 경우에 실행
        done.call(this, true, succCallback, failCallback, {
          longitude: location.coords.longitude,
          latitude: location.coords.latitude
        });
      }, this), $.proxy( function (err) {
        done.call(this, false, succCallback, failCallback, err);
      }, this)); // 위치 확인 불가능한 경우
    }
  },

  /**
   * @function
   * @desc 위치권한 동의 여부 BFF 조회
   * @param{function} agreeCallback 위치 동의시 수행할 콜백함수
   * @param{function} notAgreeCallback 위치 미동의시 수행할 콜백함수
   */
  checkLocationAgreement: function (agreeCallback, notAgreeCallback) {
    this._request(Tw.API_CMD.BFF_03_0021, {})
      .done(function (res) {
        if (res.result.twdLocUseAgreeYn === 'Y') {
          if (agreeCallback) {
            agreeCallback(res);
          }
        } else { // 서버의 위치 정보 동의 설정값이 미동의 일때
          if (notAgreeCallback) {
            notAgreeCallback(res);
          }
        }
      }).fail(function (res) {
      if (notAgreeCallback) {
        notAgreeCallback(res);
      }
    });
  },

  checkLocationAgreementWithAge: function (callback) {
    var request = this._apiService.request.bind(this._apiService);
    var response = this._apiService.response.bind(this._apiService);

    var resData = {
      over14: false, // 14세 미만여부
      locAgree: false // 위치권한 동의여부
    };
    request(Tw.API_CMD.BFF_08_0080, {}).then(function (resp) {
      var state = false;
      response(function () {
        state = resp.result.age  >= 14;
      }, resp);
      if (state) {
        return request(Tw.API_CMD.BFF_03_0021, {});
      }
      return null;
    }.bind(this)).done(function (resp) {
      if (resp === null) {
        return callback(resData);
      }
      response(function () {
        callback($.extend(resData, {
          over14: true,
          locAgree: resp.result.twdLocUseAgreeYn === 'Y'
        }));
      }, resp);
    });
  },

  /**
   * @function
   * @param{boolean} isGpsOn GPS ON/OFF 또는, 단말기의 위치 접근권한 여부
   * @desc 현재 위치 확인 후 BFF 이용동의 상태를 업데이트 해준다.
   */
  _updateTermAgreements: function (isGpsOn) {
    var gpsYN = isGpsOn ? 'Y' : 'N';
    // 위치권한 동의 여부 조회
    var setTermAgreements = function (res) {
      if (res.result.twdLocUseAgreeYn !== gpsYN){
        this._request(Tw.API_CMD.BFF_03_0022, {twdLocUseAgreeYn: gpsYN});
      }
    }.bind(this);
    this.checkLocationAgreement(setTermAgreements, setTermAgreements);
  },

  /**
   * @function
   * @param{{path: string, method: string}} bff BFF_ID
   * @param{Object} param 파라미터
   * @returns {{done: *}}
   * @desc BFF 요청 공통. 요청 실패를 공통으로 처리하려고 만듬.
   */
  /*_request: function (bff, param) {
    return this._apiService.requestDone(bff, param);
  }*/

  /**
   * @function
   * @param bff
   * @param param
   * @return {{done: (function(*): *)}}
   * @desc BFF 리퀘스트. 결과가 실패이면 로딩중 화면 비노출 및 다음스텝 진행안함.
   */
  _request: function (bff, param) {
    var $def = $.Deferred();
    this._apiService.request(bff, param).done(function (res){
      if (res.code !== Tw.API_CODE.CODE_00) {
        $def.reject(res);
      }else {
        $def.resolve(res);
      }
    }).fail(function (res){
      $def.reject(res);
    });

    return $def.promise();
  }
};
