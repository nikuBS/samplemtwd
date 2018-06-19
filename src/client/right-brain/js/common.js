$(document).on('ready', function () {

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
  fix_scroll: function () {
    this.scroll_gap = $(window).scrollTop();
    $('#contents').css({
      'position':'fixed',
      'transform': 'translate(0 ,-' + this.scroll_gap + 'px)'
    });
    $('#header').css({
      'transform': 'translate(0 ,' + this.scroll_gap + 'px)'
    });
  },
  gnb_action : function(){
    skt_landing.action.scroll_top = skt_landing.util.win_info.get_scrollT();
    if(skt_landing.action.scroll_top > skt_landing.action.scroll_current && !(skt_landing.action.scroll_top + skt_landing.util.win_info.get_winH() >= $('body').height()-5) && (skt_landing.action.scroll_top > 0)){
      //$('.footer-wrap').hide();
      $('.gnb-wrap').removeClass('on');
    }else{
      //$('.footer-wrap').show();
      $('.gnb-wrap').addClass('on');
    }
    skt_landing.action.scroll_current = skt_landing.util.win_info.get_scrollT();
  },
  auto_scroll: function () {
    $('#contents').css({
      'position': 'relative',
      'transform': 'inherit'
    });
    $('#header').css({
      'transform': 'inherit'
    });
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
    ta.on('click', function () {
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
        if ($('.popup').length > 0) {
          _this.close();
        }
        $('body').append(html);
      }).done(function () {
        $('.popup-closeBtn').off('click').on('click', function () {
          _this.close();
        });
        _this.cancel();
        _this.scroll_chk();
        if(popup_info.hbs == 'popup'){
          skt_landing.widgets.widget_init('.popup');
        }else{
          skt_landing.widgets.widget_init('.popup-page');
        }
      });
      //skt_landing.action.popup.open({'title':'타이틀','contents':'팝업입니다.','type':[{class:'btn-submit',href:'#submit',txt:'확인'},{class:'btn-modify',href:'#modify',txt:'수정'},{class:'btn-cancel',href:'#cancel',txt:'취소'}]});
    },
    searchChange: function (popup_info) {
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
    },
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
    close: function () {
      $('.popup').empty().remove();
      skt_landing.action.auto_scroll();
    },
    cancel: function () {
      var _this = this;
      $('.btn-cancel').off('click').on('click', function () {
        _this.close();
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
