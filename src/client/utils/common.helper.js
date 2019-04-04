/**
 * @file common.helper.js
 * @author
 * @since 2018.05
 */

Tw.CommonHelper = (function () {
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
  // 앱 / 일반에서 링크 열기
  var openUrlExternal = function (url, option) {

    openUrl(url, Tw.NTV_BROWSER.EXTERNAL, option);
  };

  var openUrlInApp = function (url, option, title) {
    openUrl(url, Tw.NTV_BROWSER.INAPP, option, title);
  };

  var toast = function (message) {
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.Native.send(Tw.NTV_CMD.TOAST, {
        message: message
      });
    } else {
      Tw.Popup.toast(message);
    }
  };

  var toggle = function (selector) {
    if ( selector.hasClass('on') ) {
      selector.removeClass('on');
    } else {
      selector.addClass('on');
    }
  };

  var setLocalStorage = function (key, value) {
    localStorage.setItem(key, value);
  };

  var getLocalStorage = function (key) {
    return localStorage.getItem(key);
  };

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

  var setCookie = function (name, value, days) {
    var expires = '';
    if ( days ) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }

    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  };

  var removeLocalStorage = function (key) {
    return localStorage.removeItem(key);
  };

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

  var showDataCharge = function (confirmCallback, closeCallback) {
    Tw.Native.send(Tw.NTV_CMD.GET_NETWORK, {},
      $.proxy(function (res) {
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
        } else {
          if ( confirmCallback ) {
            confirmCallback();
          }

          if ( closeCallback ) {
            closeCallback();
          }
        }
      }, this)
    );
  };

  var share = function (content) {
    Tw.Native.send(Tw.NTV_CMD.SHARE, {
      content: content
    }, null);
  };

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

  var startLoading = function (target, color, size) {
    skt_landing.action.loading.on({ ta: target, co: color, size: size });
  };

  var endLoading = function (target) {
    skt_landing.action.loading.off({ ta: target });
  };

  var allOffLoading = function () {
    if ( $('.tw-loading').length > 0 ) {
      skt_landing.action.loading.allOff();
    }
  };

  var resetHeight = function ($element) {
    if (this._doingAnimateHeight) {
      clearTimeout(this._doingAnimateHeight);
    }
    this._doingAnimateHeight = setTimeout(function () {
      if (!Tw.FormatHelper.isEmpty($element.slick)) {
        $element.slick && $element.slick.animateHeight();
      }
    }, 200);
  };

  var resetPopupHeight = function () {
    skt_landing.action.popup.layer_height_chk();
  };

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

  var replaceCdnUrl = function (context) {
    return context.replace('/{{cdn}}/gi', Tw.Environment.cdn);
  };

  var isLowerVersionAndroid = function () {
    var androidVersion = Tw.BrowserHelper.getAndroidVersion();
    return androidVersion && androidVersion.indexOf('4') !== -1;
  };

  var replaceExternalLinkTarget = function($container) {
    _.each($container.find('.fe-link-external,[target=_blank]'), function(elem) {
      $(elem).attr('target', 'blank')
        .addClass('fe-link-external');
    });
  };

  var sendRequestImg = function(url) {
    document.createElement('img').setAttribute('src', url);
  };

  return {
    openUrlExternal: openUrlExternal,
    openUrlInApp: openUrlInApp,
    toggle: toggle,
    toast: toast,
    setLocalStorage: setLocalStorage,
    getLocalStorage: getLocalStorage,
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
    sendRequestImg: sendRequestImg
  };
})();
