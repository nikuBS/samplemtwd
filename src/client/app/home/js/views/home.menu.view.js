Tw.HomeMenuView = function(rootEl) {
  this.$container = rootEl;

  this._uiFunction();
  this._bindEvent();
};

Tw.HomeMenuView.prototype = {
  _bindEvent: function() {
  },
  _uiFunction: function() {
    /* gnb close
                $(".header .close").click(function(e) {
                    e.preventDefault();
                    history.back();
                });
                */

    /* #gnb */
    $('#gnb > ul > li:has(ul)').addClass("has-sub");
    $('#gnb > ul > li > a').click(function() {
      var checkElement = $(this).next();
      $('#gnb li').removeClass('active');
      $(this).closest('li').addClass('active');
      if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
        $(this).closest('li').removeClass('active');
        checkElement.slideUp('normal');
      }
      if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
        $('#gnb ul ul:visible').slideUp('normal');
        checkElement.slideDown('normal');
      }
      if (checkElement.is('ul')) {
        return false;
      } else {
        return true;
      }
    });

    /* #gnb sub */
    $('.subs > li:has(ul)').addClass("has-susub");
    $('.subs > li > a').click(function() {
      var checkElement2 = $(this).next();
      $('.subs li').removeClass('active');
      $(this).closest('li').addClass('active');
      if((checkElement2.is('ul')) && (checkElement2.is(':visible'))) {
        $(this).closest('li').removeClass('active');
        checkElement2.slideUp('normal');
      }
      if((checkElement2.is('ul')) && (!checkElement2.is(':visible'))) {
        $('.subs ul:visible').slideUp('normal');
        checkElement2.slideDown('normal');
      }
      if (checkElement2.is('ul')) {
        return false;
      } else {
        return true;
      }
    });

    // bind swiper
    $('.slick-type02 .belt').slick({
      dots : true,
      arrows : false,
      infinite : true,
      touchThreshold : 100
    });
  }
};