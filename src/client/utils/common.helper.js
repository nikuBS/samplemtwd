Tw.CommonHelper = (function () {
  /**
   * @desc 링크 오픈(외부링크, 내부 링크)
   * @param  {string} url
   * @param  {Tw.NTV_BROWSER} browserType
   * @param  {string} option
   * @param  {string} title
   * @private
   */
  var openUrl = function (url, browserType, option, title) {
    if ( url.indexOf('http') === -1 ) {
      url = 'http://' + url;
    }
    if ( Tw.BrowserHelper.isApp() ) {
      var param = {
        type: browserType,
        href: url
      };
      if ( !Tw.FormatHelper.isEmpty(title) ) {
        param.title = title;
      }
      Tw.Native.send(Tw.NTV_CMD.OPEN_URL, param, null);
    } else {
      var windowPopup = window.open(url, '_blank', option);
      if ( Tw.FormatHelper.isEmpty(windowPopup) ) {
        Tw.Popup.openAlert(Tw.POPUP_CONTENTS.POPUP_BLOCKED);
      }
    }
  };

  /**
   * @desc 외부 링크 열기
   * @param  {string} url
   * @param  {string} option
   * @public
   */
      // 앱 / 일반에서 링크 열기
  var openUrlExternal = function (url, option) {
    openUrl(url, Tw.NTV_BROWSER.EXTERNAL, option);
  };

  /**
   * @desc 외부 링크 열기(SSO)
   * @param  {string} url
   * @param  {object} service
   * @param  {string} option
   * @public
   */
  var openSsoUrlExternal = function (url, option) {

    if ( Tw.BrowserHelper.isApp() ) {
      // 암호화 호출
      Tw.Api.request(Tw.NODE_CMD.GET_SSO_URL, {
        url: encodeURIComponent(url)
      })
        .done($.proxy(function (res) {
          if ( res.code === Tw.API_CODE.CODE_00 ) {
            url = decodeURIComponent(res.result);
            Tw.Logger.info('[openSsoUrlExternal url]', url);
          }
          openUrlExternal(url, option);
        }, this))
        .fail($.proxy(function (error) {
          Tw.Logger.error(error);
          openUrlExternal(url, option);
        }, this));
    } else {
      openUrlExternal(url, option);
    }
  };

  /**
   * @desc 내부 링크 열기
   * @param  {string} url
   * @param  {string} option
   * @param  {string} title
   * @public
   */
  var openUrlInApp = function (url, option, title) {
    openUrl(url, Tw.NTV_BROWSER.INAPP, option, title);
  };


  /**
   * @desc 토스트 띄우기
   * @param  {string} message
   */
  var toast = function (message) {
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.Native.send(Tw.NTV_CMD.TOAST, {
        message: message
      });
    } else {
      Tw.Popup.toast(message);
    }
  };


  /**
   * @desc toggle 버튼
   * @param  {$object} selector
   */
  var toggle = function (selector) {
    if ( selector.hasClass('on') ) {
      selector.removeClass('on');
    } else {
      selector.addClass('on');
    }
  };

  /**
   * @desc setter
   * @param {string} key
   * @param {string} value
   * @public
   */
  var setLocalStorage = function (key, value) {
    localStorage.setItem(key, value);
  };

  /**
   * @desc getter
   * @param {string} key
   * @public
   */
  var getLocalStorage = function (key) {
    return localStorage.getItem(key);
  };

  /**
   * @desc 만료시간 포함한 로컬스토리지 저장
   * @param{string} key
   * @param{Object} value
   * @param{number} expiredays
   */
  var setLocalStorageExpire = function (key, value, expiredays) {
    var today = new Date();
    today.setDate(today.getDate() + expiredays);

    this.setLocalStorage(key, JSON.stringify({
      value: value,
      expireTime: today
    }));
  };

  /**
   * @desc 로컬스토리지 얻기. 만료시간이 지난데이터면 삭제함.
   * @param{string} key
   * @returns {string|undefined}
   */
  var getLocalStorageExpire = function (key) {
    var storedData = this.getLocalStorage(key);
    if ( Tw.FormatHelper.isEmpty(storedData) ) {
      return storedData;
    }
    try {
      storedData = JSON.parse(storedData);
      var now = new Date();
      now = Tw.DateHelper.convDateFormat(now);
      if ( Tw.DateHelper.convDateFormat(storedData.expireTime) < now ) { // 만료시간이 지난 데이터 일 경우
        this.removeLocalStorage(key);
        return undefined;
      }

      return storedData;
    } catch ( e ) {
      return storedData;
    }
  };

  /**
   * @desc setter
   * @param {string} key
   * @param {string} value
   * @public
   */
  var setSessionStorage = function (key, value) {
    sessionStorage.setItem(key, value);
  };

  /**
   * @desc getter
   * @param {string} key
   * @public
   */
  var getSessionStorage = function (key) {
    return sessionStorage.getItem(key);
  };

  /**
   * @desc delete data in session storage
   * @param {string} key
   * @public
   */
  var removeSessionStorage = function (key) {
    return sessionStorage.removeItem(key);
  };

  /**
   * @desc getter
   * @param {string} key
   * @public
   */
  var getCookie = function (key) {
    if ( Tw.FormatHelper.isEmpty(document.cookie) ) {
      return null;
    }
    var value = null;
    _.each(document.cookie.split(';'), function (cookieItem) {
      var cookieItemToken = cookieItem.split('=');
      if ( cookieItemToken[0].trim() === key ) {
        value = cookieItemToken[1];
        return false;
      }
    });

    return value;
  };

  /**
   * @desc setter
   * @param {string} key
   * @param {string} value
   * @param {number} days
   * @public
   */
  var setCookie = function (name, value, days) {
    var expires = '';
    if ( days ) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }

    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  };

  /**
   * @desc delete data in local storage
   * @param {string} key
   * @public
   */
  var removeLocalStorage = function (key) {
    return localStorage.removeItem(key);
  };

  /**
   * @desc upload files
   * @param {Tw.UPLOAD_TYPE} dest
   * @param {Array<File>} files
   * @public
   */
  var fileUpload = function (dest, files) {
    var formData = new FormData();
    if ( !Tw.FormatHelper.isEmpty(dest) ) {
      formData.append('dest', dest);
    }

    _.each(files, function (file) {
      formData.append('file', file);
    });

    return Tw.Api.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData);
  };

  /**
   * @desc 과금 팝업 오픈
   * @param  {function} confirmCallback
   * @param  {function} closeCallback
   * @public
   */
  var showDataCharge = function (confirmCallback, closeCallback) {
    // wifi가 아닌 상태에서 회원이면서 무한요금제면... 팝업 면제권
    function wifiCheckPopup(res) {
      if ( res.resultCode === Tw.NTV_CODE.CODE_00 && !res.params.isWifiConnected ) {
        Tw.Popup.openConfirm(
          Tw.POPUP_CONTENTS.NO_WIFI,
          null,
          function () {
            Tw.Popup.close();
            confirmCallback();
          },
          closeCallback
        );
      } else { // wifi 접속한 상태
        if ( confirmCallback ) {
          confirmCallback();
        }
        if ( closeCallback ) {
          closeCallback();
        }
      }
    }

    var _apiService = Tw.Api;
    // 응답이 오는지 체크해야 한다.
    // OP002-7559 => OP002-7574
    // 1. 회원체크
    _apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(function (res) {
        if ( res.code === Tw.API_CODE.CODE_00 ) {
          // 비회원일때...
          if ( res.result == null ) {
            Tw.Native.send(Tw.NTV_CMD.GET_NETWORK, {},
              $.proxy(function (res) {
                wifiCheckPopup(res);
              }, this)
            );
            return;
          }

          // Redis 상품원장 조회
          _apiService.request(Tw.NODE_CMD.GET_PRODUCT_INFO, { prodId: res.result.prodId })
            .done(function (resp) {

              if ( resp.code === Tw.API_CODE.CODE_00 ) { // resp.code === 정상
                // 1.1. 요금제 체크
                if ( '무제한'.indexOf(resp.result.summary.basOfrGbDataQtyCtt) !== -1 ) {
                  confirmCallback();
                } else {
                  // 1.2. 와이파이 체크
                  // 1.3. 와이파이면 바이패스
                  // 1.4. 와아파이 아니면 팝업
                  Tw.Native.send(Tw.NTV_CMD.GET_NETWORK, {},
                    $.proxy(function (res) {
                      wifiCheckPopup(res);
                    }, this)
                  );
                }
              } else { // resp.code === 비정상
                Tw.Native.send(Tw.NTV_CMD.GET_NETWORK, {},
                  $.proxy(function (res) {
                    wifiCheckPopup(res);
                  }, this)
                );
              }
            }).fail(null);
        } else { // 회원이아니다?
          // 2. 회원이 아니면 wifi 상태 체크 팝업
          Tw.Native.send(Tw.NTV_CMD.GET_NETWORK, {},
            $.proxy(function (res) {
              wifiCheckPopup(res);
            }, this)
          );
        }
      }, this)).fail(null);
  };

  /**
   * @desc 공유하기
   * @param  {string} content
   * @public
   */
  var share = function (content) {
    Tw.Native.send(Tw.NTV_CMD.SHARE, {
      content: content
    }, null);
  };

  /**
   * @desc 무료문자 보내기
   * @public
   */
  var openFreeSms = function () {
    Tw.Api.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(function (resp) {
        if ( resp.code === Tw.API_CODE.CODE_00 ) {
          if ( resp.result.totalSvcCnt > 0 && resp.result.expsSvcCnt < 1 ) {
            Tw.Native.send(Tw.NTV_CMD.FREE_SMS, {
              error: Tw.NTV_CODE.CODE_A80,
              msg: Tw.NTV_ERROR_MSG[Tw.NTV_CODE.CODE_A80]
            });
          } else {
            Tw.Native.send(Tw.NTV_CMD.FREE_SMS, {});
          }
        } else {
          Tw.Error(resp.code, resp.msg).pop();
        }
      }, this));
  };

  /**
   * @desc 로딩 보이기
   * @param  {string} target selector
   * @param  {string} color
   * @param  {number} size
   * @public
   */
  var startLoading = function (target, color, size) {
    skt_landing.action.loading.on({ ta: target, co: color, size: size });
  };

  /**
   * @desc 로딩 지우기
   * @param  {string} target selector
   * @public
   */
  var endLoading = function (target) {
    skt_landing.action.loading.off({ ta: target });
  };

  /**
   * @desc 모든 로딩 지우기
   * @public
   */
  var allOffLoading = function () {
    if ( $('.tw-loading').length > 0 ) {
      skt_landing.action.loading.allOff();
    }
  };

  /**
   * @desc slick 리셋 height
   * @param  {$object} $element
   * @public
   */
  var resetHeight = function ($element) {
    if ( this._doingAnimateHeight ) {
      clearTimeout(this._doingAnimateHeight);
    }
    this._doingAnimateHeight = setTimeout(function () {
      if ( !Tw.FormatHelper.isEmpty($element.slick) ) {
        $element.slick.animateHeight();
      }
    }, 200);
  };

  /**
   * @desc vkqdjq 리셋 height
   * @public
   */
  var resetPopupHeight = function () {
    skt_landing.action.popup.layer_height_chk();
  };

  /**
   * @desc 이용약관 팝업 열기
   * @param {string} code
   * @public
   */
  var openTermLayer = function (code) {
    Tw.Api.request(Tw.API_CMD.BFF_08_0059, {
      svcType: 'MM',
      serNum: code
    }).done(function (res) {
      if ( res.code === Tw.API_CODE.CODE_00 ) {
        Tw.Popup.open({
          hbs: 'HO_04_05_01_02_01',
          title: res.result.title,
          content: res.result.content
        });
      } else {
        Tw.Error(res.code, res.msg).pop();
      }
    }).fail(function (err) {
      Tw.Error(err.code, err.msg).pop();
    });
  };

  /**
   * @desc 이용약관 팝업 열기
   * @param {string} code
   * @public
   */
  var openTermLayer2 = function (code) {  // T World 이용약관
    Tw.Api.request(Tw.API_CMD.BFF_03_0032, {
      stplTypCd: code
    }).done(function (res) {
      if ( res.code === Tw.API_CODE.CODE_00 ) {
        var content = res.result.content.replace(/container/g, 'containerterm'); // css 충동 해결
        Tw.Popup.open({
          hbs: 'HO_04_05_01_02_01',
          title: res.result.title,
          content: content
        });
      } else {
        Tw.Error(res.code, res.msg).pop();
      }
    }).fail(function (err) {
      Tw.Error(err.code, err.msg).pop();
    });
  };

  /**
   * @desc cdn 주소 바꾸기
   * @param {string} context html contents
   * @public
   */
  var replaceCdnUrl = function (context) {
    return context.replace('/{{cdn}}/gi', Tw.Environment.cdn);
  };

  /**
   * @desc 안드로이드 4 버전인지
   * @public
   */
  var isLowerVersionAndroid = function () {
    var androidVersion = Tw.BrowserHelper.getAndroidVersion();
    return androidVersion && androidVersion.indexOf('4') !== -1;
  };

  /**
   * @desc 새창 열림 설정
   * @public
   */
  var replaceExternalLinkTarget = function ($container) {
    _.each($container.find('.fe-link-external,[target=_blank]'), function (elem) {
      $(elem).attr('target', '_blank')
        .addClass('fe-link-external');

      if ( Tw.FormatHelper.isEmpty($(elem).attr('title')) ) {
        $(elem).attr('title', Tw.WEB_ACCESSBILITY.NEW_WINDOW);
      }
    });
  };

  var sendRequestImg = function (url) {
    document.createElement('img').setAttribute('src', url);
  };

  /**
   *
   * @param {jQuery} $popupLayer
   */
  var focusOnActionSheet = function ($popupLayer) {
    // WARNING: jQuery DOM object를 인자로 하기 때문에, isEmpty()로 확인하면 안됨
    // NOTE: 궁극적으로 둘 중 하나라도 나와야 하기 때문
    /*
    if ($popupLayer.find('span.txt:eq(0)').length > 0) { // if (!Tw.FormatHelper.isEmpty($popupLayer.find('span.txt:eq(0)'))) {
      setTimeout(function () {
        $popupLayer.find('span.txt:eq(0)').focus();
      }, 300);
    } else {
      setTimeout(function () {
        $popupLayer.find('input:eq(0)').focus();
      }, 300);
    }
    */
    // 첫번째 제목을 선택
    var $target = $popupLayer.find('span.txt').eq(0);
    // Selector를 한번에 호출하는 것보다, 끊어서 호출하는 것이 좋음
    if ( $target.length === 0 ) {
      // 첫번째 입력 대상을 선택
      $target = $popupLayer.find('input').eq(0);
    }
    /*
    // li를 선택하도록 하는 코드
    if ($target.length === 0) {
      // 첫번째 목록의 첫번째 항목을 선택 (김동환 바이널씨 2019-12-04)
      $target = $popupLayer.find('ul').eq(0).children('li').eq(0);
    }
    */
    if ( $target.length ) {
      setTimeout(function () {
        $target.focus();
      }, 300);
    }
  };

  var setBannerForStatistics = function (banners, summary) {
    return _.map(banners, function (banner) {
      return $.extend({}, summary, banner);
    });
  };

  /**
   * @desc compare origin TWM and current TWM
   */
  var checkValidSession = function (url, commandPath, point) {
    var preTWM = this.getSessionStorage(Tw.SSTORE_KEY.PRE_TWM) || '';
    var curTWM = this.getCookie(Tw.COOKIE_KEY.TWM) || '';

    if ( this.getCookie(Tw.COOKIE_KEY.TWM_LOGIN) === 'Y' && !Tw.FormatHelper.isEmpty(curTWM) ) {
      // 값이 비어 있으면, TWM 값을 저장
      if ( Tw.FormatHelper.isEmpty(preTWM) ) {
        Tw.Logger.info('[checkValidSession]', 'Set PRE TWM : ', preTWM);
        this.setSessionStorage(Tw.SSTORE_KEY.PRE_TWM, this.getCookie(Tw.COOKIE_KEY.TWM));
      } else {
        if ( preTWM !== curTWM && location.search.indexOf('sess_invalid=Y') === -1 ) {
          Tw.Logger.error('[checkValidSession]', preTWM, curTWM);
          var historyService = new Tw.HistoryService();
          var params = 'sess_invalid=Y' +
            '&pre_twm=' + preTWM +
            '&cur_twm=' + curTWM +
            '&url=' + url +
            '&command_path=' + commandPath +
            '&point=' + point +
            '&target=' + location.pathname + location.search;

          historyService.replaceURL('/common/member/logout/expire?' + params);
          return false;
        }
      }
    }
    return true;
  };

  /**
   * @desc 외부 링크 열기. app 인 경우 과금발생 alert 띄우기
   * @param url
   * @param option
   */
  var openUrlExternalCharge = function (url, option) {
    var _openUrl = function () {
      openUrl(url, Tw.NTV_BROWSER.EXTERNAL, option);
    };
    if (Tw.BrowserHelper.isApp()) {
      showDataCharge(_openUrl);
      return;
    }
    _openUrl();
  };

  return {
    openUrlExternal: openUrlExternal,
    openUrlExternalCharge: openUrlExternalCharge,
    openSsoUrlExternal: openSsoUrlExternal,
    openUrlInApp: openUrlInApp,
    toggle: toggle,
    toast: toast,
    setLocalStorage: setLocalStorage,
    getLocalStorage: getLocalStorage,
    setLocalStorageExpire: setLocalStorageExpire,
    getLocalStorageExpire: getLocalStorageExpire,
    getCookie: getCookie,
    setCookie: setCookie,
    removeLocalStorage: removeLocalStorage,
    showDataCharge: showDataCharge,
    share: share,
    openFreeSms: openFreeSms,
    startLoading: startLoading,
    endLoading: endLoading,
    allOffLoading: allOffLoading,
    resetHeight: resetHeight,
    resetPopupHeight: resetPopupHeight,
    openTermLayer: openTermLayer,
    openTermLayer2: openTermLayer2,
    fileUpload: fileUpload,
    replaceCdnUrl: replaceCdnUrl,
    isLowerVersionAndroid: isLowerVersionAndroid,
    replaceExternalLinkTarget: replaceExternalLinkTarget,
    sendRequestImg: sendRequestImg,
    focusOnActionSheet: focusOnActionSheet,
    setBannerForStatistics: setBannerForStatistics,
    setSessionStorage: setSessionStorage,
    getSessionStorage: getSessionStorage,
    removeSessionStorage: removeSessionStorage,
    checkValidSession: checkValidSession
  };
})();
