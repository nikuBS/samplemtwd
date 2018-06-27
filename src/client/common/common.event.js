Tw.CommonEvent = function () {
  this.setBack();
  this.setReplace();
  this.setBackRefresh();
};

Tw.CommonEvent.prototype = {
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
    })
  },

  setBackRefresh: function () {
    $(window).bind("pageshow", function($event) {
      if ($event.originalEvent.persisted || window.performance && window.performance.navigation.type == 2) {
        Tw.Logger.info('[Back Loaded]');
        if($('.back-reload').length > 0) {
          Tw.Logger.info('[Prev]', document.referrer);
          document.location.reload();
        }
      }
    });
  }
};

Tw.CommonEvent.toggle = function (selector) {
  if ( selector.hasClass('on') ) {
    selector.removeClass('on');
  }
  else {
    selector.addClass('on');
  }
};

$(document).ready(function () {
  var commonEvent = new Tw.CommonEvent();
});