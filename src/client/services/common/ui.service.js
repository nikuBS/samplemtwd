Tw.UIService = function () {
  this.setBack();
  this.setReplace();
  this.setBackRefresh();
};

Tw.UIService.prototype = {
  setBack: function () {
    /* 뒤로가기 추가 */
    $('.fe-common-back').on('click', function () {
      Tw.Logger.info('[Common Back]');
      window.history.back();
    });
  },

  setReplace: function () {
    $('.fe-replace-history').on('click', function ($event) {
      Tw.Logger.info('[Replace History]');
      location.replace($event.currentTarget.href);
      return false;
    });
  },

  setBackRefresh: function () {
    $(window).bind('pageshow', function ($event) {
      if ( $event.originalEvent.persisted || window.performance && window.performance.navigation.type === 2 ) {
        Tw.Logger.info('[Back Loaded]');
        if ( $('.fe-back-reload').length > 0 ) {
          Tw.Logger.info('[Prev]', document.referrer);
          document.location.reload();
        }

        if ( Tw.UIService.getLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH) === 'Y') {
          Tw.Logger.info('[Line Refresh]', document.referrer);
          document.location.reload();
          if ( /\/home/.test(location.href) ) {
            Tw.UIService.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'N');
          }
        }
      }
    });
  }
};

Tw.UIService.toggle = function (selector) {
  if ( selector.hasClass('on') ) {
    selector.removeClass('on');
  }
  else {
    selector.addClass('on');
  }
};

Tw.UIService.setLocalStorage = function (key, value) {
  localStorage.setItem(key, value);
};

Tw.UIService.getLocalStorage = function (key) {
  return localStorage.getItem(key);
};