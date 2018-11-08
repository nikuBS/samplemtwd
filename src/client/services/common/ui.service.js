Tw.UIService = function () {
  this.setBack();
  this.setReplace();
  this.setBackRefresh();
  this.setInputEvent();
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

        if ( Tw.UIService.getLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH) === 'Y' ) {
          Tw.Logger.info('[Line Refresh]', document.referrer);
          // if ( Tw.BrowserHelper.isApp() ) {
            document.location.reload();
          // }
          if ( /\/main\/home/.test(location.href) ) {
            Tw.UIService.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'N');
          }
        }
      }
    });
  },

  setInputEvent: function () {
    $('input').on('keypress', $.proxy(this.setMaxValue, this));
  },

  setMaxValue: function (event) {
    var $target = $(event.currentTarget);
    if ($target.attr('maxLength')) {
      if ( event.keyCode === 8 ) { return true; }
      return $target.val().length < $target.attr('maxLength');
    }
  }
};


// TODO : remove
Tw.UIService.toggle = function (selector) {
  if ( selector.hasClass('on') ) {
    selector.removeClass('on');
  }
  else {
    selector.addClass('on');
  }
};

// TODO : remove
Tw.UIService.setLocalStorage = function (key, value) {
  localStorage.setItem(key, value);
};

// TODO : remove
Tw.UIService.getLocalStorage = function (key) {
  return localStorage.getItem(key);
};