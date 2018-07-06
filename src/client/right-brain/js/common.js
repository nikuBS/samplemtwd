$(document).on('ready', function () {
  $('html').addClass('device_'+skt_landing.util.win_info.get_device());
  skt_landing.action.all_menu();
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
  }
}
skt_landing.action = {
  scroll_top:0,
  scroll_current:0,
  scroll_gap: 0,
  scroll_gnb_timer: null,
  fix_scroll: function () {
    this.scroll_gap = $(window).scrollTop();
    $('.container-wrap').css({
      'position':'fixed',
      'transform': 'translate(0 ,-' + this.scroll_gap + 'px)',
      'width':'100%',
      'z-index': -1
    });
    $('body,html').css('height','100%');
     $('.wrap').css({
      'height':'100%',
      'padding':0
    });
    $('.skip_navi, .container-wrap, .header-wrap, .gnb-wrap').attr({
      'aria-hidden':true,
      'tabindex':-1
    });
    /*
    $('#header').css({
      'transform': 'translate(0 ,' + this.scroll_gap + 'px)'
    });*/
  },
  all_menu : function(){
    var all_btn = $('.depth-view');
    if(all_btn.length < 1) return;
    all_btn.on('click', function(){
      if(!$('.depth-view-box').hasClass('open')){
        console.log('a');
        $(this).addClass('on');
        $('.depth-view-box').addClass('open');
        $('.header-wrap').addClass('fixed');
        $('body').append('<div class="popup-blind"></div>');
        skt_landing.action.fix_scroll();
      }else{
        $(this).removeClass('on');
        $('.depth-view-box').removeClass('open');
        $('.header-wrap').removeClass('fixed');
        $('.popup-blind').remove();
        skt_landing.action.auto_scroll();
      }
    });
  },
  gnb_action : function(){
    skt_landing.action.scroll_top = skt_landing.util.win_info.get_scrollT();
    if(skt_landing.action.scroll_top > skt_landing.action.scroll_current && !(skt_landing.action.scroll_top + skt_landing.util.win_info.get_winH() >= $('body').height()-5) && (skt_landing.action.scroll_top > 0)){
      $('.gnb-wrap').removeClass('on');
      clearTimeout(this.scroll_gnb_timer);
      this.scroll_gnb_timer = setTimeout(function(){
        $('.gnb-wrap').addClass('on');
      },1500);
    }else{
      $('.gnb-wrap').addClass('on');
    }
    skt_landing.action.scroll_current = skt_landing.util.win_info.get_scrollT();
  },
  auto_scroll: function () {
    $('.container-wrap').css({
      'position':'',
      'transform': '',
      'z-index':''
    });
    $('body,html').css('height','');
    $('.wrap').css({
      'height':'',
      'padding':''
    });
    $('.skip_navi, .container-wrap, .header-wrap, .gnb-wrap').attr({
      'aria-hidden':false,
      'tabindex':0
    });
    /*$('#contents').css({
      'position': 'relative',
      'transform': 'inherit'
    });
    $('#header').css({
      'transform': 'inherit'
    });*/
    $(window).scrollTop(this.scroll_gap);
  },
  anchor: function () {
    $('.anchor').each(function (idx) {
      $(this).off('click').on('click', function () {
        var ta = $(this).data('target'), //data-target
          scroll_ta = $('.' + ta).offset().top,
          gab = 0;
        $('html,body').stop().animate({
          'scrollTop': scroll_ta
        }, {
          queue: false,
          duration: 500
        });
      });
    });
  },
  selecton: function (ta) {
    ta.on('click', function () {
      if (ta.find('a').length > 0) {
        $(this).find('a').addClass('on');
      } else {
        $(this).addClass('on');
      }
    });
  },
  toggleon: function (ta) {
    ta.on('click', function (e) {
      e.stopPropagation();
      if (ta.find('a').length > 0) {
        if (!$(this).find('a').hasClass('on')) {
          $(this).find('a').addClass('on');
        } else {
          $(this).find('a').removeClass('on');
        }
      } else {
        if (!$(this).hasClass('on')) {
          $(this).addClass('on');
        } else {
          $(this).removeClass('on');
        }
      }
    });
  },
  setFocus: function(target, idx){  // target : selector(string) | jquery selector
    var target = $(target),
        idx = idx ? idx : 0;
    target.eq(idx).attr('tabindex',0).focus(); //포커스 
  },
  top_btn: function () {
    if (skt_landing.util.win_info.get_scrollT() > 0) {
      $('.btn-top').show().on('click', function () {
        $('body').stop().animate({
          'scrollTop': 0
        });
      });
    } else {
      $('.btn-top').hide().off('click');
    }
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
      loading_box.appendTo($(ta));
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
      if(ta == '.wrap'){
        skt_landing.action.auto_scroll();
      }
      $(ta).find($('.loading')).empty().remove();
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
    button_size_check: function () {
      var btn_size = $('.btn-box a').size();
      var btn_width = 100 / btn_size;
      $('.btn-box a').css({
        'width': parseInt(btn_width) + '%'
      });
    },
    open: function (popup_info) {
      skt_landing.action.fix_scroll();
      var _this = this;
      popup_info.hbs = popup_info.hbs ? popup_info.hbs : 'popup';
      $.get(hbsURL+popup_info.hbs+'.hbs', function (text) {
        var tmpl = Handlebars.compile(text);
        var html = tmpl(popup_info);
        /*if ($('.popup').length > 0) {
          _this.close();
        }*/
        $('.wrap').append(html);
      }).done(function () {
        $('.popup').find('.popup-blind').on('click',function(e){
          e.stopPropagation();
        });
          $('.popup-closeBtn').off('click').on('click', function () {
              frontend_fn.popup_close(popup_info.front_close);
          _this.close(this);
          });
        _this.cancel();
        _this.scroll_chk();
         if(popup_info.hbs == 'popup' || popup_info.hbs == 'select'){
          skt_landing.widgets.widget_init('.popup');
        }else{
          skt_landing.widgets.widget_init('.popup-page');
        }
          frontend_fn.popup_open(popup_info.front_open);
      });
        //skt_landing.action.popup.open({'title':'타이틀','contents':'팝업입니다.','type':[{style_class:'btn-submit',href:'#submit',txt:'확인'},{style_class:'btn-modify',href:'#modify',txt:'수정'},{style_class:'btn-cancel',href:'#cancel',txt:'취소'}]});
    },
    /* 2018-06-19 삭제 */
    /*searchChange: function (popup_info) {
      skt_landing.action.fix_scroll();
      var _this = this;
      $.get(hbsURL+'popup-searchChange.hbs', function (text) {
        var tmpl = Handlebars.compile(text);
        var html = tmpl(popup_info);
        if ($('.popup').length > 0) {
          _this.close();
        }
        $('body').append(html);
      }).done(function () {
        $('.popup-closeBtn').off('click').on('click', function () {
          _this.close();
        });
        _this.cancel();
        skt_landing.widgets.widget_init('.popup');
      });
    },*/
    share: function (popup_info) {
      var _this = this;
      skt_landing.action.fix_scroll();
      $.get(hbsURL+'popup-share.hbs', function (text) {
        var tmpl = Handlebars.compile(text);
        var html = tmpl(popup_info);
        if ($('.popup').size() > 0) {
          _this.close();
        }
        $('body').append(html);
      }).done(function () {
        $('.popup-closeBtn').off('click').on('click', function () {
          _this.close();
        });
        $('.popup-sns li a').off('click').on('click', _this.sns);
        $('.btn-copy-url').off('click').on('click', function () {
          _this.close();
          _this.sns_url_copy();
        });
      });
    },
    change: function (popup_info) {
      this.close();
      this.open(popup_info);
    },
    close: function (target) {
      if(target){
        $(target).closest('.popup,.popup-page').empty().remove();
      }else{
        var popups = $('.popup,.popup-page');
        popups.eq(popups.length-1).empty().remove();
      }
      skt_landing.action.auto_scroll();
    },
    cancel: function () {
      var _this = this;
      $('.btn-cancel').off('click').on('click', function () {
        _this.close(this);
      });
    },
    scroll_chk: function () {
      var pop_h = $('.popup-contents').height();
      if (pop_h > 290) {
        $('.popup-info').addClass('scrolling');
      }
    }
  },
  text_toggle: function (ta, txt_leng) {
    if ($('.text-toggle').length > 0) {
      var ta_ = ta.find('span'),
        txt_html = ta_.html(),
        txt_text = ta_.text(),
        txt = '';
      txt = txt_text.substr(0, txt_leng);
      ta_.empty().html(txt + '...');
      $('.btn-des').off('click').on('click', function () {
        if ($(this).hasClass('compress')) {
          $(this).text('더보기');
          $(this).removeClass('compress');
          ta_.empty().html(txt + '...');
        } else {
          $(this).text('닫기');
          $(this).addClass('compress');
          ta_.empty().html(txt_html);
        }
      });
    }
  },
  switch: function (ta) {
    ta.on('click', function () {
      if (ta.find('a').length > 0) {
        if (!$(this).find('a').hasClass('on')) {
          $(this).find('a').addClass('on');
          $(this).siblings('li').find('a').removeClass('on');
        }
      }
    });
  },
  select_sort: function () {
    $('.select-sort li a').off('click').on('click', function () {
      $(this).parent().addClass('on').siblings('li').removeClass('on');
    });
  },
  iscroll:function(selector, height){
    if(!height){
      height = '100%';
    }
    // 2018-06-15
  }
}
