function footer(){
  var prev = 0;
  var $window = $(window);
  var nav = $('footer');

  $window.on('scroll', function(){
    var scrollTop = $window.scrollTop();
    // if(scrollTop > prev && !(scrollTop + $window.height() == $('#wrap').height() && !(scrollTop == 0))){
    if(scrollTop > prev && !(scrollTop + $window.height() == $('#wrap').height())){ /* ios를 위해서 -값도 추가 처리 */
      nav.addClass('hidden')
    }else{
      nav.removeClass('hidden')
    }
    prev = scrollTop;
  });
}

$(window).load(function (){
  /* common */
  if ($('footer').length){
    footer();
  }
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
  /* 뒤로가기 추가 */
  $('.common-back').on('click', function () {
    window.history.back();
  });

  /* 리필하기 / swiper 추가 */
  $('.slider5').each(function (idx) {
    var swiper,
      tagClass = 'slide-number' + idx,
      _this = $(this).find('.slider-box').addClass(tagClass);
    _this.next().find('.total').text(_this.find('.swiper-slide').length);
    swiper = new Swiper('.slider5 .' + tagClass, {
      onInit: function (params) {
        _this.next().find('.current').text(params.activeIndex + 1);
        skt_landing.action.toggleon($('.bt-select-arrow'));
      },
      onSlideChangeStart: function (params) {
        _this.next().find('.current').text(params.activeIndex + 1);
      }
    });
  });
});