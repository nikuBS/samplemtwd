Tw.CommonHelper = (function () {
  var openUrl = function (url, browserType, option) {
    if ( url.indexOf('http') === -1 ) {
      url = 'http://' + url;
    }
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.Native.send(Tw.NTV_CMD.OPEN_URL, {
        type: browserType,
        href: url
      }, null);
    } else {
      var windowPopup = window.open(url, '_blank', option);
      if ( Tw.FormatHelper.isEmpty(windowPopup) ) {
        Tw.Popup.openAlert('Pop-up blocked');
      }
    }
  };
  // 앱 / 일반에서 링크 열기
  var openUrlExternal = function (url, option) {
    openUrl(url, Tw.NTV_BROWSER.EXTERNAL, option);
  };

  var openUrlInApp = function (url, option) {
    openUrl(url, Tw.NTV_BROWSER.INAPP, option);
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

  var showDataCharge = function (confirmCallback, cancelCallback) {
    Tw.Popup.openConfirm(
      Tw.POPUP_CONTENTS.NO_WIFI,
      Tw.POPUP_TITLE.EXTERNAL_LINK,
      function () {
        Tw.Popup.close();
        confirmCallback();
      },
      cancelCallback
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
              error: Tw.NTV_CODE.CODE_A80
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

  var resetHeight = function ($element) {
    $element.slick.animateHeight();
  };

  var openTermLayer = function (code) {
    Tw.Api.request(Tw.API_CMD.BFF_08_0059, {
      svcType: 'MM',
      serNum: code
    }).done(function (res) {
      if (res.code === Tw.API_CODE.CODE_00) {
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

  return {
    openUrlExternal: openUrlExternal,
    openUrlInApp: openUrlInApp,
    toggle: toggle,
    toast: toast,
    setLocalStorage: setLocalStorage,
    getLocalStorage: getLocalStorage,
    showDataCharge: showDataCharge,
    share: share,
    openFreeSms: openFreeSms,
    startLoading: startLoading,
    endLoading: endLoading,
    resetHeight: resetHeight,
    openTermLayer: openTermLayer
  };
})();
