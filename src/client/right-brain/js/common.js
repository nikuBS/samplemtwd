$(document).on('ready', function () {
  $('html').addClass('device_'+skt_landing.util.win_info.get_device());
  skt_landing.action.top_btn();
  skt_landing.action.keyboard();
  if($('body').hasClass('bg-productdetail')){
    skt_landing.action.prd_header();
  }
  if($('.home-slider').length > 0){
    skt_landing.action.home_slider();
  }
  if($('#common-menu').length > 0){
    skt_landing.action.gnb();
  }
  skt_landing.action.header_shadow(); // 헤더 그림자 효과 (페이지)
  skt_landing.action.header_shadow_popup(); // 헤드 그림자 효과 (팝업)
});
$(window).on('resize', function () {

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
    $('.skip_navi, .container-wrap:last, .header-wrap:last, .gnb-wrap').attr({
      'aria-hidden':true,
      'tabindex':-1
    });
    /*
    $('#header').css({
      'transform': 'translate(0 ,' + this.scroll_gap + 'px)'
    });*/
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
    $('.skip_navi, .container-wrap:last, .header-wrap:last, .gnb-wrap').attr({
      'aria-hidden':false,
      'tabindex':''
    });
    /*$('#contents').css({
      'position': 'relative',
      'transform': 'inherit'
    });
    $('#header').css({
      'transform': 'inherit'
    });*/
    if($('.wrap > .popup,.wrap > .popup-page').length > 0){
      fix_target.scrollTop(this.scroll_gap[this.scroll_gap.length -1]);
    }else{
      $(window).scrollTop(this.scroll_gap[this.scroll_gap.length -1]);
    }
    this.scroll_gap.pop();
  },
  setFocus: function(target, idx){  // target : selector(string) | jquery selector
    var target = $(target),
        idx = idx ? idx : 0;
    target.eq(idx).attr('tabindex',0).focus(); //포커스
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
        $('html').stop().animate({
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
          co = obj.co,
          size = obj.size,
          tit_id = skt_landing.action.ran_id_create(),
          loading_box = $('<div class="loading" role="region" aria-labelledby="'+tit_id+'"></div>'),
          loading_ico = $('<div class="loading_ico"></div>'),
          loading_txt = $('<em id="'+tit_id+'">로딩중입니다.</em>'),
          svg_id = '',
          svg_color = '',
          svg = '';
      svg_id = skt_landing.action.loading.svg_id = skt_landing.action.ran_id_create();
      if(co == 'white'){
        svg_color = 'rgba(255,255,255,1)';
        loading_txt.addClass('white');
      }else if(co == 'blue'){
        svg_color = 'rgba(50,94,193,1)';
        loading_txt.addClass('blue');
      }else{
        svg_color = 'rgba(117,117,117,1)';
        loading_txt.addClass('grey');
      }
      svg = '<svg id="'+svg_id+'" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><circle id="actor_12" cx="65" cy="25" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_11" cx="75" cy="36" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_10" cx="79" cy="50" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_9" cx="75" cy="64" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_8" cx="65" cy="75" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_7" cx="50" cy="79" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_6" cx="35" cy="75" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_5" cx="25" cy="64" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_4" cx="21" cy="50" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_3" cx="25" cy="36" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_2" cx="35" cy="25" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_1" cx="50" cy="21" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle></svg>';
      // loading_box.appendTo($(ta));
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
      skt_landing.action.loading.ani();
    },
    off: function(obj){
      var ta = obj.ta;
      $('#'+$(ta).data('mate')).empty().remove();
      // if(ta == '.wrap'){
      //  skt_landing.action.auto_scroll();
      //}
      // $(ta).find($('.loading')).empty().remove();
    },
    ani: function(){
      var actors = {},
          node = document.getElementById(skt_landing.action.loading.svg_id).getElementsByTagName("circle");
      actors.actor_1 = {node: node[11],type: "circle",cx: 50,cy: 21,dx: 8,dy: 32,opacity: 1};
      actors.actor_2 = {node: node[10],type: "circle",cx: 35,cy: 25,dx: 8,dy: 32,opacity: 1};
      actors.actor_3 = {node: node[9],type: "circle",cx: 25,cy: 36,dx: 8,dy: 32,opacity: 1};
      actors.actor_4 = {node: node[8],type: "circle",cx: 21,cy: 50,dx: 8,dy: 32,opacity: 1};
      actors.actor_5 = {node: node[7],type: "circle",cx: 25,cy: 64,dx: 8,dy: 32,opacity: 1};
      actors.actor_6 = {node: node[6],type: "circle",cx: 35,cy: 75,dx: 8,dy: 32,opacity: 1};
      actors.actor_7 = {node: node[5],type: "circle",cx: 50,cy: 79,dx: 8,dy: 32,opacity: 1};
      actors.actor_8 = {node: node[4],type: "circle",cx: 65,cy: 75,dx: 8,dy: 32,opacity: 1};
      actors.actor_9 = {node: node[3],type: "circle",cx: 75,cy: 64,dx: 8,dy: 32,opacity: 1};
      actors.actor_10 = {node: node[2],type: "circle",cx: 79,cy: 50,dx: 8,dy: 32,opacity: 1};
      actors.actor_11 = {node: node[1],type: "circle",cx: 75,cy: 36,dx: 8,dy: 32,opacity: 1};
      actors.actor_12 = {node: node[0],type: "circle",cx: 65,cy: 25,dx: 8,dy: 32,opacity: 1};
      var tricks = {};
      tricks.trick_1 = (function (t, i) {
        i = (function (n) {
          return .5 > n ? 2 * n * n : -1 + (4 - 2 * n) * n
        })(i) % 1, i = 0 > i ? 1 + i : i;
        var _ = t.node;
        0.2 >= i ? _.setAttribute("opacity", i * (t.opacity / 0.2)) : i >= 0.8 ? _.setAttribute("opacity", t.opacity - (i - 0.8) * (t.opacity / (1 - 0.8))) : _.setAttribute("opacity", t.opacity)
      });
      var scenarios = {};
      scenarios.scenario_1 = {
        actors: ["actor_1", "actor_12", "actor_11", "actor_10", "actor_9", "actor_8", "actor_7", "actor_6", "actor_5", "actor_4", "actor_3", "actor_2", "actor_1"],
        tricks: [{
          trick: "trick_1",
          start: 0,
          end: 1.00
              }],
        startAfter: 600,
        duration: 2000,
        actorDelay: 100,
        repeat: 0,
        repeatDelay: 0
      };
      var _reqAnimFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame,
        fnTick = function (t) {
          var r, a, i, e, n, o, s, c, m, f, d, k, w;
          for (c in actors) actors[c]._tMatrix = [1, 0, 0, 1, 0, 0];
          for (s in scenarios)
            for (o = scenarios[s], m = t - o.startAfter, r = 0, a = o.actors.length; a > r; r++) {
              if (i = actors[o.actors[r]], i && i.node && i._tMatrix)
                for (f = 0, m >= 0 && (d = o.duration + o.repeatDelay, o.repeat > 0 && m > d * o.repeat && (f = 1), f += m % d / o.duration), e = 0, n = o.tricks.length; n > e; e++) k = o.tricks[e], w = (f - k.start) * (1 / (k.end - k.start)), tricks[k.trick] && tricks[k.trick](i, Math.max(0, Math.min(1, w)));
              m -= o.actorDelay
            }
          for (c in actors) i = actors[c], i && i.node && i._tMatrix && i.node.setAttribute("transform", "matrix(" + i._tMatrix.join() + ")");
          _reqAnimFrame(fnTick)
        };
      _reqAnimFrame(fnTick);
      }
  },
  popup: { //popup 공통
    open: function (popup_info,callback_open) {
      var _this = this;
      popup_info.hbs = popup_info.hbs ? popup_info.hbs : 'popup';
      $.get(popup_info.url+popup_info.hbs+'.hbs', function (text) {
        var tmpl = Handlebars.compile(text);
        var html = tmpl(popup_info);
        /*
        if(!popup_info.layer){
          skt_landing.action.fix_scroll();
        }else{
          if($('.wrap > .popup,.wrap > .popup-page').length == 0){
            skt_landing.action.fix_scroll();
          }
        }
        */
        /* 11.07 jsk */
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
        createdTarget.find('.popup-blind').on('click',function(e){
          e.stopPropagation();
        });
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
              layer_h = layer.height();
          layer.css({
            'height':layer_h,
            'bottom':0
          });
        }
      });
    },
    close_layer : function(callback){
      var layer = $('.popup .popup-page.layer');
      layer.css('bottom','-100%');
      setTimeout(function(){
        layer.closest('.popup').empty().remove();
        /* 11.07 jsk */
        if($('.wrap > .popup,.wrap > .popup-page').length == 0){
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
      /* 11.07 jsk */
      if($('.wrap > .popup,.wrap > .popup-page').length == 0){
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
    })
    $(document).on('focusout',selector, function(){
      $(this).closest('.popup-page').removeClass('focusin')
    })
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
  home_slider : function(){ // home 전체 슬라이더
    $('.home-slider .home-slider-belt').each(function(){
      $(this).slick({
          dots: false,
          infinite: false,
          speed: 300,
          slidesToShow: 1,
          adaptiveHeight: true,
          nextArrow:'.ico-home-tab-store',
          prevArrow:'.ico-home-tab-my',
          touchMove : false,
          touchThreshold : 2 /* 50% 이동해야지 넘어감 (1/touchThreshold) * the width */
      })
      .on('afterChange', function(slick, currentSlide){
          var homeIndex = $('.home-slider .home-slider-belt').slick('getSlick').currentSlide;
          $('.home-tab-belt .tab').eq(homeIndex).find('button, a').addClass('on').closest('.tab').siblings().find('button, a').removeClass('on');
      })
    })
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
    })
    $('.home-tab-belt button, a').on('click', function(){
        if(!$(this).hasClass('on')){
          $('.home-slider .home-slider-belt').slick('slickGoTo', $(this).closest('.tab').index());
          $(this).addClass('on').closest('.tab').siblings().find('button').removeClass('on');
        }
    })
  },
  header_shadow : function(){
    $(window).bind('scroll', function(){
      if(skt_landing.util.win_info.get_scrollT() == 0){
          $('body').removeClass('scroll');
      }else{
          $('body').addClass('scroll');
      }
    })
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
  },
  gnb : function(){
    $('.icon-gnb-menu').bind('click', function(){
      $('#common-menu').addClass('on');
      skt_landing.action.fix_scroll();
    })
    $('#common-menu .c-close').bind('click', function(){
      $('#common-menu').removeClass('on');
      skt_landing.action.auto_scroll();
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
      //connectWith: $target.selector,
      axis: 'y'
    };
    options = $.extend(defaults, options);
    $target.sortable(options).disableSelection();
   $target.on('touchstart touchend touchmove','.ui-state-default .bt-active button',function(e){
     e.stopPropagation();
   });
   $target.parent().on('click', '.connectedSortable .bt-active button', function(){
     if($(this).closest('.connectedSortable').hasClass('enabled')){
       $(this).closest('.ui-state-default').appendTo('#sortable-disabled');
       $(this).text('추가');
     }else{
       $(this).closest('.ui-state-default').prependTo('#sortable-enabled');
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