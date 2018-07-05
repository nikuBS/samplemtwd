Tw.UIService = function () {
  this.setBack();
  this.setReplace();
  this.setBackRefresh();
};

Tw.UIService.prototype = {
  setBack: function () {
    /* 뒤로가기 추가 */
    $('.common-back').on('click', function () {
      Tw.Logger.info('[Common Back]');
      history.back();
    });
  },

  setReplace: function () {
    $('.replace-history').on('click', function ($event) {
      Tw.Logger.info('[Replace History]');
      location.replace($event.currentTarget.href);
      return false;
    });
  },

  setBackRefresh: function () {
    $(window).bind('pageshow', function($event) {
      if ($event.originalEvent.persisted || window.performance && window.performance.navigation.type === 2) {
        Tw.Logger.info('[Back Loaded]');
        if($('.back-reload').length > 0) {
          Tw.Logger.info('[Prev]', document.referrer);
          // document.location.reload();
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