$(document).on('ready', function () {
  $('html').addClass('device_'+skt_landing.util.win_info.get_device());
  skt_landing.action.top_btn();
  //skt_landing.action.keyboard();
  if($('body').hasClass('bg-productdetail')){
    skt_landing.action.prd_header();
  }
  /*if($('.home-slider').length > 0){
    skt_landing.action.home_slider();
  }*/
  if($('#common-menu').length > 0){
    skt_landing.action.gnb();
  }
  skt_landing.action.header_shadow(); // header shadow effect (page)
  skt_landing.action.header_shadow_popup(); // header shadow effect (popup)
  skt_landing.action.focus_mousedown_style(document);
  skt_landing._originalSize = $(window).width() + $(window).height();
});
$(window).on('resize', function () {
  if($(window).width() + $(window).height() === skt_landing._originalSize){
    $('.popup-page').removeClass('focusin');
  }
  if($(window).width() + $(window).height() != skt_landing._originalSize){
    $("#gnb.on .g-wrap, .bt-fixed-area").css("position","relative");  
  }else{
    $("#gnb.on .g-wrap, .bt-fixed-area").css("position","fixed");  
  }
}).on('scroll', function () {
  for (var fn in scroll_fn) {
    eval(scroll_fn[fn]);
  }
}).on('orientationchange', function () {
  for (var fn in resize_fn) {
    eval(resize_fn[fn]);
  }
}).on('mousewheel DOMMouseScroll', function (e) {

});
skt_landing.util = {
  win_info: {
    get_winW: function () {
      return $(window).width();
    },
    get_winH: function () {
      return $(window).height();
    },
    get_scrollT: function () {
      return $(window).scrollTop();
    },
    set_scrollT: function (num, ani, delay, callback_fn) {
      if (ani) {
        $('body').stop().animate({
          'scrollTop': num
        }, {
          'queue': false,
          'duration': delay,
          'complete': callback_fn
        });
      } else {
        $('body').scrollTop(num);
      }
    },
    get_device: function () {
      var browser_name = undefined;
      var userAgent = navigator.userAgent.toLowerCase();
      switch (true) {
        case /iphone/.test(userAgent):
          browser_name = 'ios';
          break;
        case /android/.test(userAgent):
          browser_name = 'android';
          break;
        case /naver/.test(userAgent):
          browser_name = 'naver';
          break;
        case /msie 6/.test(userAgent):
          browser_name = 'ie6';
          break;
        case /msie 7/.test(userAgent):
          browser_name = 'ie7';
          break;
        case /msie 8/.test(userAgent):
          browser_name = 'ie8';
          break;
        case /msie 9/.test(userAgent):
          browser_name = 'ie9';
          break;
        case /msie 10/.test(userAgent):
          browser_name = 'ie10';
          break;
        case /edge/.test(userAgent):
          browser_name = 'edge';
          break;
        case /chrome/.test(userAgent):
          browser_name = 'chrome';
          break;
        case /safari/.test(userAgent):
          browser_name = 'safari';
          break;
        case /firefox/.test(userAgent):
          browser_name = 'firefox';
          break;
        case /opera/.test(userAgent):
          browser_name = 'opera';
          break;
        case /mac/.test(userAgent):
          browser_name = 'mac';
          break;
        default:
          browser_name = 'unknown';
      }
      return browser_name;
    }
  },
  get_zindex:function(){
    return parseInt($('.tw-popup').last().css('z-index'));
  },
  set_zindex:function(inc){
    if($('.tw-popup').length > 1){
      inc = inc ? inc : 100;
      var prevTarget = $('.tw-popup').last().prev(),
          currentTarget = $('.tw-popup').last();
      currentTarget.css('z-index',parseInt(prevTarget.css('z-index'))+inc);
    }
  }
};
skt_landing.action = {
  scroll_gap: [],
  fix_scroll: function () {
    var popups = $('.wrap > .popup,.wrap > .popup-page'),
        fix_target = $('.wrap > .popup,.wrap > .popup-page').length > 1 ? popups.eq(popups.length-2).find('.container-wrap') : $('#contents'),
        scroll_value = $('.wrap > .popup,.wrap > .popup-page').length > 1 ? fix_target.scrollTop() : $(window).scrollTop();
    this.scroll_gap.push(scroll_value);
    fix_target.css({
      'position':'fixed',
      'transform': 'translate(0 ,-' + this.scroll_gap[this.scroll_gap.length -1] + 'px)',
      'width':'100%',
      'z-index': -1,
      'overflow-y':'visible'
    }).find('input').attr('tabindex',-1);
    if($('.container-wrap').length == 1){
      $('body,html').css('height','100%');
       $('.wrap').css({
        'height':'100%',
        'padding':0
      });
    }
    if($('.footer-wrap.fixed').length > 0){
      var page_height = parseInt($('.container-wrap:last').closest('.popup-page').css('padding-top'));
      $('.container-wrap:last').find('.footer-wrap.fixed').css({
        'transform': 'translate(0 ,' + (this.scroll_gap[this.scroll_gap.length -1] - page_height)  + 'px)'
      });
    }
    if($('.idpt-popup').length > 0){
      $('.idpt-popup').css({
        'transform': 'translate(0 ,' + this.scroll_gap[this.scroll_gap.length -1] + 'px)'
      });
    }
    $('.skip_navi, .container-wrap:last, .header-wrap:last, .gnb-wrap').attr({
      'aria-hidden':true,
      'tabindex':-1
    });
  },
  auto_scroll: function () {
    var popups = $('.wrap > .popup,.wrap > .popup-page'),
        fix_target = $('.wrap > .popup,.wrap > .popup-page').length > 0 ? popups.eq(popups.length-1).find('.container-wrap') : $('#contents');
    fix_target.css({
      'position':'',
      'transform': '',
      'z-index':'',
      'overflow-y':''
    }).find('input').attr('tabindex','');
    if($('.container-wrap').length == 1){
      $('body,html').css('height','');
      $('.wrap').css({
        'height':'',
        'padding':''
      });
    }
    if($('.footer-wrap.fixed').length > 0){
      $('.container-wrap:last').find('.footer-wrap.fixed').css({
        'transform': ''
      });
    }
    if($('.idpt-popup').length > 0){
      $('.idpt-popup').css({
        'transform': ''
      });
    }
    $('.skip_navi, .container-wrap:last, .header-wrap:last, .gnb-wrap').attr({
      'aria-hidden':false,
      'tabindex':''
    });
    if($('.wrap > .popup,.wrap > .popup-page').length > 0){
      fix_target.scrollTop(this.scroll_gap[this.scroll_gap.length -1]);
    }else{
      $(window).scrollTop(this.scroll_gap[this.scroll_gap.length -1]);
    }
    this.scroll_gap.pop();
  },
  checkScroll: {
    scrollTopPosition: '',
    lockScroll: function () {
      if(!$("html, body").hasClass('noscroll')){ // prevent lockScroll function
        skt_landing.action.checkScroll.scrollTopPosition = $(window).scrollTop();
        // console.log(skt_landing.action.checkScroll.scrollTopPosition);
        $("body > .wrap").css({
          top: - (skt_landing.action.checkScroll.scrollTopPosition)
        });
        $("html, body").addClass('noscroll');
      }
    },
    unLockScroll: function () {
      if($("body").hasClass('noscroll')){
        $("body > .wrap").css({
          top: ''
        });
        $("html, body").removeClass('noscroll');
        
        window.scrollTo(0, skt_landing.action.checkScroll.scrollTopPosition);
        window.setTimeout(function () {
          skt_landing.action.checkScroll.scrollTopPosition = null;
        }, 0);
      }
    }
  },
  setFocus: function(target, idx){  // target : selector(string) | jquery selector
    var target = $(target),
        idx = idx ? idx : 0;
    target.eq(idx).attr('tabindex',0).focus(); // focus
  },
  focus_mousedown_style: function(d){
      var style_element = d.createElement('STYLE'),
          dom_events = 'addEventListener' in d,
          add_event_listener = function(type, callback){
          // Basic cross-browser event handling
          if(dom_events){
            d.addEventListener(type, callback);
          }else{
            d.attachEvent('on' + type, callback);
          }
        },
          set_css = function(css_text){
          // Handle setting of <style> element contents in IE8
          !!style_element.styleSheet ? style_element.styleSheet.cssText = css_text : style_element.innerHTML = css_text;
        };

      d.getElementsByTagName('HEAD')[0].appendChild(style_element);

      // Using mousedown instead of mouseover, so that previously focused elements don't lose focus ring on mouse move
      add_event_listener('mousedown', function(){
        set_css(':focus{outline:0}::-moz-focus-inner{border:0;}button:focus{outline:0}');
      });

      add_event_listener('keydown', function(){
        set_css('');
      });
  },
  top_btn: function () {
    $('.bt-top button').on('touchstart click', function () {
      if ($(this).parents().hasClass('popup-page')) {
        $('.container-wrap').stop().animate({
          'scrollTop': 0
        }, {
            queue: false,
            duration: 500
        });
      } else {
        $('body, html').stop().animate({
          'scrollTop': 0
        }, {
            queue: false,
            duration: 500
        });
      }
    });
  },
  ran_id_create:function(){
    var d = new Date().getTime(),
        ranid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
          var r = (d+Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
    return ranid;
  },
  loading: {
    svg_id:'',
    on: function(obj){
      var ta = obj.ta,
          //co = obj.co,
          size = obj.size,
          tit_id = skt_landing.action.ran_id_create(),
          loading_box = $('<div class="loading tw-loading profile-main-loader" role="region" aria-labelledby="'+tit_id+'"></div>'),
          loading_ico = $('<div class="loader"></div>'),
          loading_txt = $('<em id="'+tit_id+'">로딩중입니다.</em>'),
          svg_id = '',
          //svg_color = '',
          svg = '';
      svg_id = skt_landing.action.loading.svg_id = skt_landing.action.ran_id_create();

      svg = '<svg class="circular-loader"viewBox="25 25 50 50" ><circle class="loader-path" cx="50" cy="50" r="20" fill="none" stroke=#EF4B49" stroke-width="2" /></svg>';

      loading_box
        .css({
          width : $(ta).outerWidth(true),
          height : $(ta).outerHeight(true),
          left : $(ta).offset().left,
          top : $(ta).offset().top,
          'z-index' : 1000
        })
        .attr('id', 'loading' + Math.floor(Math.random()*1000))
        .appendTo($('body').find('.wrap:eq(0)'))
      $(ta).data('mate', loading_box.attr('id'))
      loading_ico.appendTo(loading_box);
      loading_ico.append(svg);
      if(!ta || ta == '.wrap'){
        skt_landing.action.fix_scroll();
      }
      if(size){
        loading_box.addClass('full');
        loading_ico.append(loading_txt);
      }
    },
    off: function(obj){
      var ta = obj.ta;
      $('#'+$(ta).data('mate')).empty().remove();
    },
    allOff : function(){
      $('.tw-loading').empty().remove();
    }
  },
  popup: { //popup 
    open: function (popup_info,callback_open,callback_fail,toggle_btn) {
      var _this = this;
      popup_info.hbs = popup_info.hbs ? popup_info.hbs : 'popup';
      $.get(popup_info.url+popup_info.hbs+'.hbs', function (text) {
        var tmpl = Handlebars.compile(text);
        var html = tmpl(popup_info);
        if($('.wrap > .popup,.wrap > .popup-page').length == 0){
          skt_landing.action.fix_scroll();
        }
        $('.wrap').append(html);
        skt_landing.util.set_zindex();
      }).done(function () {
        if(callback_open){
          callback_open();
        }
        var popups = $('.wrap > .popup,.wrap > .popup-page'),
            createdTarget = popups.last();
        if(popup_info.hbs == 'dropdown'){
          createdTarget.addClass('dropdown');
          createdTarget.find('.popup-contents').css('max-height',$(window).height()*0.65);
        }
        /*
        createdTarget.find('.popup-blind').on('click',function(e){
          e.stopPropagation();
        });
        */
        _this.scroll_chk();
        skt_landing.action.header_shadow_popup();
        if(createdTarget.hasClass('popup-page')){
          skt_landing.widgets.widget_init('.popup-page:last');
        }else{
          skt_landing.widgets.widget_init('.popup:last');
        }
        if(popup_info.layer){
          var win_h = skt_landing.util.win_info.get_winH(),
              layer = $('.popup .popup-page.layer'),
              layerContainerWrap = $('.popup .popup-page.layer > .container-wrap'),
              layer_h = layer.outerHeight();
          layer.css({
            'height':layer_h,
            'bottom':0
          });
          layerContainerWrap.css({
            'height':layer_h
          });
        }
        //wai-aria
        popups.attr('role','')
              .attr('aria-hidden','true');
        createdTarget.attr('role','dialog')
                     .attr('aria-hidden','false');
        /* move focus */
        if(typeof toggle_btn !== 'undefined'){
          var focusReturn = toggle_btn;
        	if(popups.length > 0){
            createdTarget.attr('tabindex', 0).focus();
            createdTarget.on('focus', function(e){
              $(this).on('keydown', function(e){
                var keyCode = e.keyCode || e.which;
                if(keyCode == 9) {
                  if(e.shiftKey && $(this).is(":focus")){
                    focusReturn.focus();
                  }
                }
              })
            });
            
            createdTarget.find('[data-return-focus="true"], .prev-step, .popup-closeBtn')
            .on("click", function(){
                focusReturn.focus();
            })
            .on("focus", function(e){
              $(this).on('keydown', function(e){
                var keyCode = e.keyCode || e.which;
                if(keyCode == 9) {
                  if(!e.shiftKey){
                    focusReturn.focus();
                  }
                }
              })
            });
          }
        }
                     
      }).fail(function() {
        if(callback_fail){
          callback_fail();
        }
      });
    },
    layer_height_chk : function(){
      var win_h = skt_landing.util.win_info.get_winH(),
          layer = $('.popup .popup-page.layer'),
          layerContainerWrap = $('.popup .popup-page.layer > .container-wrap'),
          layerContainer = $('.popup .popup-page.layer > .container-wrap > .container'),
          layer_h = layerContainer.innerHeight();
          if(layer_h > (win_h * .90)) {
            layer_h = win_h * .90;
          }
          // console.log(layer_h);
      layer.css({
        'height':layer_h,
        'bottom':0
      });
      layerContainerWrap.css({
        'height':layer_h
      });
    },
    close_layer : function(callback){
      var layer = $('.popup .popup-page.layer');
      layer.css('bottom','-100%');
      setTimeout(function(){
        layer.closest('.popup').empty().remove();
        if($('.wrap > .popup,.wrap > .popup-page').length == 0 && !$('#common-menu').hasClass('on')){
          skt_landing.action.auto_scroll();
        }
        if(callback){
          callback();
        }
      },500);
    },
    close: function (target) {
      if(target){
        $(target).closest('.popup,.popup-page').empty().remove();
      }else{
        var popups = $('.wrap > .popup,.wrap > .popup-page');
        popups.eq(popups.length-1).empty().remove();
      }
      if($('.wrap > .popup,.wrap > .popup-page').length == 0 && !$('#common-menu').hasClass('on')){
        skt_landing.action.auto_scroll();
      }
    },
    allClose : function (){
      var popups = $('.wrap > .popup,.wrap > .popup-page');
      popups.empty().remove();
      if($('.wrap > .popup,.wrap > .popup-page').length == 0 && !$('#common-menu').hasClass('on')){
        skt_landing.action.auto_scroll();
      }
    },
    scroll_chk: function () {
      var pop_h = $('.wrap > .popup,.wrap > .popup-page').last().find('.popup-contents').height();
      if (pop_h > 290) {
        $('.wrap > .popup,.wrap > .popup-page').last().find('.popup-info').addClass('scrolling');
        $('.wrap > .popup,.wrap > .popup-page').last().find('.popup-info .popup-contents').on('scroll',function(){
          var scrTop = $(this).scrollTop();
          if(scrTop == 0){
            $('.wrap > .popup,.wrap > .popup-page').last().find('.popup-info').removeClass('scrolling-shadow');
          }else if(scrTop != 0 && !$('.wrap > .popup,.wrap > .popup-page').last().find('.popup-info').hasClass('scrolling-shadow')){
            $('.wrap > .popup,.wrap > .popup-page').last().find('.popup-info').addClass('scrolling-shadow');
          }
        }).css({
          'max-height': skt_landing.util.win_info.get_winH() - 226
        });
      }
    },
    toast: function (popup_info) {
      var wrap = $('.toast-popup');
      if(wrap.length > 0){
        popup_info.wrap = false;
      }else{
        popup_info.wrap = true;
      }
      $.get(popup_info.url+'toast.hbs', function (text) {
        var tmpl = Handlebars.compile(text);
        var html = tmpl(popup_info);
        if(popup_info.wrap){
          $('body').append(html);
        }else{
          $('.toast-popup').append(html);
        }
      }).done(function () {
        var wrap = $('.toast-popup'),
            layer = wrap.find('.toast-layer').last(),
            layerH = layer.outerHeight(),
            transitionTime = parseFloat(layer.css('transition').split(' ')[1])*1500;
        layer.addClass('on')
        setTimeout(function(){
          layer.removeClass('on');
          setTimeout(function(){
            layer.remove();
          }, transitionTime);
        },popup_info.second * 1000);
      });
    }
  },
  keyboard : function(){ /* input에 focus시 하단 fixed 영역 해제 */
    var selector = '.popup-page textarea, .popup-page input[type=text], .popup-page input[type=date], .popup-page input[type=datetime-local], .popup-page input[type=email], .popup-page input[type=month], .popup-page input[type=number], .popup-page input[type=password], .popup-page input[type=search], .popup-page input[type=tel], .popup-page input[type=time], .popup-page input[type=url], .popup-page input[type=week]';
    $(document).on('focus',selector, function(){
      $(this).closest('.popup-page').addClass('focusin')
    });
    // $(document).on('focusout',selector, function(){
    //   $(this).closest('.popup-page').removeClass('focusin')
    // })
    $(document).on('focusout',selector, function(){
      var el = $(this);
      $(document).click(function(e){
        if(!$(e.target).is(selector)) {
          el.closest('.popup-page').removeClass('focusin')
        }
      });
    });
  },
  prd_header : function(){ // 상품상세 원장 헤더 색상 제어
    $('#header').removeClass('bg-type');
    $(window).bind('scroll', function(){
      if(skt_landing.util.win_info.get_scrollT() == 0){
        $('#header').removeClass('bg-type');
      }else{
        $('#header').addClass('bg-type');
        
      }
    })
  },
  home_slider : function(opts, callback){ // home 전체 슬라이더//2019.02.25 콜백추가
    if(opts){
      $('.home-slider > .home-slider-belt').addClass('home-slider-belt-active');
    }    
    if($('.home-slider > .slick-initialized').length > 0){
      $('.home-slider > .home-slider-belt').slick('destroy');
    }
	  var defaults = {
        dots: false,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        adaptiveHeight: true,
        nextArrow:'.ico-home-tab-store',
        prevArrow:'.ico-home-tab-my',
        touchMove : true,
        touchThreshold : 4 /* 50% 이동해야지 넘어감 (1/touchThreshold) * the width */
	};
	var options = $.extend({}, defaults, opts);
    var homeIndex = options.initialSlide ? options.initialSlide : 0;
    var callback = options.callback ? options.callback : undefined;    //2019.02.25 콜백추가
    if(options.initialSlide >= 0){
        $('.home-tab-belt .tab').eq(options.initialSlide).find('button, a').addClass('on').closest('.tab').siblings().find('button, a').removeClass('on');
    }
    $('.home-slider .home-slider-belt').each(function(){
      t = $(this).slick(options)
      .on('beforeChange', function(slick, currentSlide){
      })
      .on('afterChange', function(slick, currentSlide){
          if(homeIndex !== $('.home-slider .home-slider-belt').slick('getSlick').currentSlide){
            homeIndex = $('.home-slider .home-slider-belt').slick('getSlick').currentSlide;
            $("html, body").stop().animate({scrollTop:0}, 1, function(){});
            $('.home-tab-belt .tab').eq(homeIndex).find('button, a').addClass('on').closest('.tab').siblings().find('button, a').removeClass('on');
            //2019.02.25 콜백추가          
            if ( callback !== undefined ) {
              callback(homeIndex);
            }          
          }
      });
    });

    $(window).bind('scroll', function(){
      if(skt_landing.util.win_info.get_scrollT() == 0){
          $('body').removeClass('fly');
      }else{
          $('body').addClass('fly');
      }
      if(skt_landing.util.win_info.get_scrollT() > 39){
          $('.home-tab-belt').addClass('fixed');
      }else{
          $('.home-tab-belt').removeClass('fixed');
      }
    });
    $('.home-tab-belt button, .home-tab-belt a').on('click', function(){
        if(!$(this).hasClass('on')){
          $('.home-slider .home-slider-belt').slick('slickGoTo', $(this).closest('.tab').index());
          $(this).addClass('on').closest('.tab').siblings().find('button').removeClass('on');
        }
    });
  },
  header_shadow : function(){
    $(window).bind('scroll', function(){
      if(skt_landing.util.win_info.get_scrollT() == 0){
          $('body').removeClass('scroll');
      }else{
          $('body').addClass('scroll');
      }
    });
  },
  header_shadow_popup : function(){
    $('.popup-page').each(function(){
      if($(this).data('scroll') == undefined){
        $(this).data('scroll', true);
        $(this).find('.container-wrap').on('scroll', function(){
          if($(this).scrollTop() > 0){
            $(this).closest('.popup-page').addClass('scroll')
          }else{
            $(this).closest('.popup-page').removeClass('scroll')
          }
        })
      }
    })
    /* 2019.02.08 추가 하단에 팝업에 스크롤생성된게 왜 삭제됬는지 체크필요  */
    $('.popup-page').scroll(function(){
      if ($(this).scrollTop() > 0) {
        $('.header-wrap').addClass('scrollshadow');
      }else {
        $('.header-wrap').removeClass('scrollshadow');
      }
    });    
  },
  gnb : function(){
    $('.icon-gnb-menu').bind('click', function(){
      skt_landing.action.fix_scroll();
      $('#common-menu').addClass('on');
    })
    $('#common-menu .c-close').bind('click', function(){
      $('#common-menu').removeClass('on');
      if($('.wrap > .popup,.wrap > .popup-page').length == 0 && !$('#common-menu').hasClass('on')){
        skt_landing.action.auto_scroll();
      }
    })
    $('.section-cont').scroll(function(){
      if ($(this).scrollTop() > 0) {
        $('#common-menu').addClass('scroll');
        $('.userinfo').find('.bt').prop('disabled', true);
      }else {
        $('#common-menu').removeClass('scroll');
        $('.userinfo').find('.bt').prop('disabled', false);
      }
    });
    $('.bt-depth1 .more').on('click', function(e){
        if($(this).parent().next().is('.depth2')){
          $(this).parent().parent().toggleClass('open');
        }
    });
  },
  notice_slider : function(){
    var ta = ta ? $(ta).find('.notice-slide-type') : $('.notice-slide-type');
    $(ta).each(function(){
      if($(this).data('event') == undefined){
          $(this).data('event', 'bind')
      }else{
          return;
      }
      if($(this).find('.slick-initialized').length > 0){
          $(this).find('.slider').slick('destroy');
      }
      var _this = $(this).find('.slider');
      _this.slick({
          dots: false,
          arrows: false,
          infinite: true,
          speed : 700,
          centerMode: false,
          focusOnSelect: false,
          draggable: false,
          touchMove: false,
          swipe: false,
          vertical:true,
          verticalSwiping:true,
          autoplay:true,
          autoplaySpeed:5000
      });

      var $slick = _this.slick('getSlick');
      var $slides = $slick.$slides;
      var slideIndex = $slick.slickCurrentSlide();
      $slides.on('click', function () {
          var $this = $(this);
          slideIndex = $slides.index($this);
          $slides.removeClass('slick-current slick-active');
          $this.addClass('slick-current slick-active');
      });
      _this.on('beforeChange', function (e) {
          setTimeout(function () {
          $slides.eq(slideIndex).triggerHandler('click');
          }, 0);
      });
    });
  }
};
skt_landing.dev = {
  sortableInit: function(selector, options){
    if(!options){
      options = selector;
      selector = null;
    }
    var $target = $(selector)[0] == $( "#sortable-enabled" )[0] ? $(selector) : $( "#sortable-enabled" );
    var defaults = {
      axis: 'y',
      handle: '.ico-move'
    };
    options = $.extend(defaults, options);
    $target.sortable(options).disableSelection();
   $target.on('touchstart touchend touchmove','.ui-state-default .bt-active button',function(e){
     e.stopPropagation();
   });
   $target.parent().on('click', '.connectedSortable .bt-active button', function(){
     if($(this).closest('.connectedSortable').hasClass('enabled')){
       $('#sortable-disabled').prepend($(this).closest('.ui-state-default'));
       $(this).text('추가');
     }else{
       $(this).closest('.ui-state-default').appendTo('#sortable-enabled');
       $(this).text('삭제');
     }
   });
   $target.on('touchstart touchend touchmove','.bt-sort',function(e){
     e.stopPropagation();
   });
   $target.parent().on('click', '.connectedSortable .bt-sort', function(){
     var parent_cont = $(this).closest('.ui-state-default');
     if($(this).hasClass('up')){
       parent_cont.insertBefore(parent_cont.prev());
     }else{
       parent_cont.insertAfter(parent_cont.next());
     }
   });
  }
} 