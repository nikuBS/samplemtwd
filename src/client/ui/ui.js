$(window).load(function () {
  /* /home/home.html */
  if ($('.slick-type01').length) {
    $('.slick-type01 .belt').slick({
      dots: false,
      arrows: false,
      infinite: false,
      touchThreshold: 100
    })
  }
  /* /home/gnb.html */
  if ($('.slick-type02').length) {
    $('.slick-type02 .belt').slick({
      dots: true,
      arrows: false,
      infinite: true,
      touchThreshold: 100
    })
  }
  /* /home/gnb.html */
  if ($('#gnb').length) {
    $('#gnb > ul > li:has(ul)').addClass("has-sub");
    $('#gnb > ul > li > a').click(function () {
      var checkElement = $(this).next();
      $('#gnb li').removeClass('active');
      $(this).closest('li').addClass('active');
      if ((checkElement.is('ul')) && (checkElement.is(':visible'))) {
        $(this).closest('li').removeClass('active');
        checkElement.slideUp('normal');
      }
      if ((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
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
    $('.subs > li > a').click(function () {
      var checkElement2 = $(this).next();
      $('.subs li').removeClass('active');
      $(this).closest('li').addClass('active');
      if ((checkElement2.is('ul')) && (checkElement2.is(':visible'))) {
        $(this).closest('li').removeClass('active');
        checkElement2.slideUp('normal');
      }
      if ((checkElement2.is('ul')) && (!checkElement2.is(':visible'))) {
        $('.subs ul:visible').slideUp('normal');
        checkElement2.slideDown('normal');
      }
      if (checkElement2.is('ul')) {
        return false;
      } else {
        return true;
      }
    });
  }
  /* myt/MY_02_02_03.html */
  if ($('.guide .btn-toggle').length) {
    $('.guide .btn-toggle').bind('click', function () {
      if (!$(this).parent().hasClass('on')) {
        $(this).parent().addClass('on').siblings().removeClass('on');
      } else {
        $(this).parent().removeClass('on');
      }
      return false;
    })
  }
})