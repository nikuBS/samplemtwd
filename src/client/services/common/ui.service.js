Tw.UIService = function () {
  this.setBack();
  this.setForward();
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
  setForward: function () {
    $('.fe-common-forward').on('click', function () {
      Tw.Logger.info('[Common Forward]');
      window.history.forward();
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

        if ( Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH) === 'Y' ) {
          Tw.Logger.info('[Line Refresh]', document.referrer);
          // if ( Tw.BrowserHelper.isApp() ) {
            document.location.reload();
          // }
          if ( /\/main\/home/.test(location.href) ) {
            Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'N');
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
