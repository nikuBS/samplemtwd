Tw.UIService = function () {
  this.setBack();
  this.setReplace();
  this.setBackRefresh();
  this.setMunu();
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
      }
    });
  },
  setMunu: function () {
    // TODO
    $('.all-menu-bt').off('click').on('click', function () {
      //skt_landing.action.gnb_menu.open(callback);
      skt_landing.action.gnb_menu.open(function () {
        console.log('gnb_menu open');
      });
    });
    $('.all-menu-close').off('click').on('click', function () {
      //skt_landing.action.gnb_menu.close(callback);
      skt_landing.action.gnb_menu.close(function () {
        console.log('gnb_menu close');
      });
    });
    $('.user-menu li .sub-menu').off('click').on('click', function () {
      //skt_landing.action.gnb_menu.depth_open(callback);
      skt_landing.action.gnb_menu.depth_open($(this), function () {
        console.log('gnb_menu_depth open');
      });
    });
    $('.all-menu-prev').off('click').on('click', function () {
      //skt_landing.action.gnb_menu.depth_close(callback);
      skt_landing.action.gnb_menu.depth_close(function () {
        console.log('gnb_menu_depth close');
      });
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