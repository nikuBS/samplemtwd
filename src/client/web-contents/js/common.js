/** 
 * @summary 바닥 스크롤의 위치값
 * @global
*/
var current_scrollTop="";
var fixScroll_onoff="";
$(document).on('ready', function () {
  $('html').addClass('device_'+skt_landing.util.win_info.get_device());
  skt_landing.action.top_btn();
  skt_landing.action.headerHeight = 39; // [#OP002-130] 2019.05.08 [UX정합성 2차] 홈 화면 메인 탭메뉴 언더라인 노출 타이밍 오류
  if($('body').hasClass('bg-productdetail')){
    skt_landing.action.prd_header();
  }
  if ( $(window).scrollTop() > 0 ){
    $('body').addClass("scroll fly");
    $('#header').addClass('bg-type');
    if(skt_landing.util.win_info.get_scrollT() > skt_landing.action.headerHeight){  // [#OP002-130] 2019.05.08 [UX정합성 2차] 홈 화면 메인 탭메뉴 언더라인 노출 타이밍 오류
      $('.home-tab-belt').addClass('fixed');
    }
  }
  if($('#common-menu').length > 0){
    skt_landing.action.gnb();
  }

  var inputType = "input[type=text],input[type=file], input[type=password], input[type=number], input[type=email], input[type=tel], textarea";
  $(".device_ios "+inputType).focusin(function(){
    //$("#gnb .g-wrap").hide(); // 19.03.27 툴바 이슈 수정(하단 고정으로 하기로)
  });

  $(".device_ios "+inputType).focusout(function(){
    //$("#gnb .g-wrap").show(); // 19.03.27 툴바 이슈 수정(하단 고정으로 하기로)
  });

  skt_landing.action.header_shadow(); // header shadow effect (page)
  skt_landing.action.header_shadow_popup(); // header shadow effect (popup)
  skt_landing.action.focus_mousedown_style(document);
  skt_landing._originalSize = $(window).width() + $(window).height();

  var isIOS = skt_landing.util.win_info.get_device().toUpperCase() === 'IOS';
  if(isIOS == true){
    $('.resize-ios').on({
      'focus blur': function (e) {
        var osType = skt_landing.util.win_info.get_device().toUpperCase();
        $(window).trigger('resize', {dataset: {evt: e, tag: 'searchbox', osType: osType}});
      }
    });    
    $('.searchbox-header input[type="text"]').on({
      'focus blur': function (e) {
        if($("[class*='searchbox-layer']").siblings('[class*="cont-layer-blind"]').length > 0){
          skt_landing.action.checkScroll.lockScroll();
        }
      }
    });
  }
});

$(window).on('resize', function (e, datas) {  
  var ios = {
    evt: null,
    type: null,
    tag: null,
    osType: null
  };
  if(datas){
    ios.evt = datas.dataset.evt;
    ios.type = datas.dataset.evt.type;
    ios.tag = datas.dataset.tag;
    ios.osType = datas.dataset.osType;
  }
  var current_size = $(window).width() + $(window).height();
  if($(window).width() + $(window).height() === skt_landing._originalSize){
    $('.popup-page').removeClass('focusin');
  }

  if ( ios.type == 'focus' || Math.abs( current_size - skt_landing._originalSize ) > 200 ){
    //$("#gnb.on .g-wrap").hide(); // 19.03.27 툴바 이슈 수정(하단 고정으로 하기로)
    $(".bt-fixed-area").css("position","relative");
    $(".actionsheet_full .container").css("height", $(window).height() - 112+"px") // 19.02.26 팝업구조 변경시
    $(".searchbox-lock").css("maxHeight", $(window).height() - 66+"px"); // 19.03.11 search 자동완성 resize 높이값
    if ( !$(".searchbox-lock").hasClass("none") && $(".searchbox-lock").css("display") == "block" ){ // 19.03.11 search 자동완성 scroll lock // 03.13 조건추가
      skt_landing.action.checkScroll.lockScroll();
    } else {
      skt_landing.action.checkScroll.unLockScroll();
    }

    var $popupContainer = $('.popup-page.fixed-bottom, .popup-page.fixed-btn'); // 19.03.22 수정
    if($('.popup-page.fixed-bottom .bt-fixed-area').length > 0) $popupContainer.addClass('pb0');      //190318 하단 고정 버튼 위치 
  } else {
    //$("#gnb.on .g-wrap").show(); // 19.03.27 툴바 이슈 수정(하단 고정으로 하기로)
    $(".bt-fixed-area").css("position","fixed");
    $(".actionsheet_full .container").css("height", ""); // 19.02.26 팝업구조 변경시
    $(".searchbox-lock").css("maxHeight", "80%"); // 19.03.11 search 자동완성 resize 높이값
    if ( $(".searchbox-lock").hasClass("none") && $(".searchbox-lock").css("display") == "block" ){ // 19.03.11 search 자동완성 scroll lock // 03.13 조건추가
      skt_landing.action.checkScroll.lockScroll();
    } else {
      skt_landing.action.checkScroll.unLockScroll();      
    }

    var $popupContainer = $('.popup-page.fixed-bottom, .popup-page.fixed-btn'); // 19.03.22 수정
    if($('.popup-page.fixed-bottom .bt-fixed-area').length > 0) $popupContainer.removeClass('pb0');      //190318 하단 고정 버튼 위치 
  }
}).on('scroll', function () {
  for (var fn in scroll_fn) {
    eval(scroll_fn[fn]);
  }

  //190313: 메인탭 분리
  if(skt_landing.util.win_info.get_scrollT() == 0){
      $('body').removeClass('fly');
  }else{
      $('body').addClass('fly');
  }
  if(skt_landing.util.win_info.get_scrollT() > skt_landing.action.headerHeight){  // [#OP002-130] 2019.05.08 [UX정합성 2차] 홈 화면 메인 탭메뉴 언더라인 노출 타이밍 오류
      $('.home-tab-belt').addClass('fixed');
  }else{
      $('.home-tab-belt').removeClass('fixed');
  }
  
}).on('orientationchange', function () {
  for (var fn in resize_fn) {
    eval(resize_fn[fn]);
  }
}).on('mousewheel DOMMouseScroll', function (e) {

});
/** 
 * @summary js 내부 util
 * @class
 */
skt_landing.util = {
  /**
   * @summary - 스크린 확인용 함수
   * @description 
   * - 모바일에서 로그 확인용
   * @function
   * @example
   * skt_landing.util.log(1, 2, 3, 'test');
  */
  log: function (){
    var conHtml = '<div id="log_tag" style="position: fixed; width: 100%; height: 15%; border: 1px solid red; background: #fff; overflow: scroll; z-index: 999999999; top: 0; left: 0;"></div>';
    var html = '';
    for(var key in arguments){
        html = html.concat(arguments[key]+"<br/>");
    }
    var $html = $('#log_tag');
    if($html.length == 0)            $(document.body).append(conHtml);            
    $html = $('#log_tag').prepend(html);

    if($._data($html[0], 'events')) return;
    var pos = {
        x: 0,
        y: 0
    }
  },
  /**
   * @summary window의 기본 정보
   * @class
  */
  win_info: {
   /**
    * @summary - window의 기본 너비값을 리턴
    * @function
    * @return {Integer} 너비값
    * @example
    * skt_landing.util.win_info.get_winW();
    */
    get_winW: function () {
      return $(window).width();
    },
    /**
    * @summary - window의 기본 높이값을 리턴
    * @function
    * @return {Integer} 높이값
    * @example
    * skt_landing.util.win_info.get_winH();
    */
    get_winH: function () {
      return $(window).height();
    },
    /**
    * @summary - window 스크롤의 위치값 리턴
    * @function
    * @return {Integer} 스크롤 위치값
    * @example
    * skt_landing.util.win_info.get_scrollT();
    */
    get_scrollT: function () {
      return $(window).scrollTop();
    },
    /**
    * @summary - window 스크롤의 위치값 세팅
    * @function
    * @param {Integer} num - 스크롤을 위치시킬 값
    * @param {Boolean} ani - 애니메이션 효과를 줄지 여부
    * @param {Integer} delay - 애니메이션 효과를 줄 경우 세팅될 duration 값
    * @param {Function} callback_fn - 애니메이션 효과가 끝난 후 실행될 함수
    * @example
    * skt_landing.util.win_info.set_scrollT(300, true, 300, function () { alert(1); });
    */
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
   /**
    * @summary - 접속한 device의 userAgent 정보를 리턴
    * @function
    * @return {String} device 정보
    * @example
    * skt_landing.util.win_info.get_device();
   */
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
  /**
  * @summary - 마지막 레이어 팝업(.tw-popup)의 z-index값을 리턴
  * @function
  * @return {String} z-index 값 리턴
  * @example
  * skt_landing.util.get_zindex();
  */
  get_zindex:function(){
    return parseInt($('.tw-popup').last().css('z-index'));
  },
  /**
  * @summary - 마지막 레이어 팝업(.tw-popup)의 z-index값을 세팅
  * @function
  * @paran {Integer} inc - 설정할 값
  * @example
  * skt_landing.util.set_zindex();
  */
  set_zindex:function(inc){
    if($('.tw-popup').length > 1){
      inc = inc ? inc : 100;
      var prevTarget = $('.tw-popup').last().prev(),
          currentTarget = $('.tw-popup').last();
      currentTarget.css('z-index',parseInt(prevTarget.css('z-index'))+inc);
    }
  }
};

/**
 * @summary 공통요소 설정
 * @class
*/
skt_landing.action = {  
  /** 
   * @summary - IOS일경우 스크롤 끝에 도달했을시 버튼이 따라 올라가지 않도록 설정
   * @description
   * - event: { scroll: .popup-page.tw-popup }
   * @function
   * @example
   *  skt_landing.action.bottom_fixed()
  */
  bottom_fixed: function () {
    $('.popup-page.tw-popup').off('scroll.popup').on('scroll.popup', function () { 
      var isIOS = skt_landing.util.win_info.get_device().toUpperCase() === 'IOS';
      if(!isIOS) return;
      var $this = $(this);
      var $header = $('.header-wrap');
      var $footer = $('.bt-fixed-area').addClass('fixed-bt');      
      var r = $this[0].scrollHeight-($this.height()+$header.height());
      
      if($this.scrollTop() < (r-$footer.height())) $footer.removeClass('fixed-bt');
    });
  },
  /**
   * @summary - skt_landing.action.fix_scroll()에 사용되는 scroll_gap (array)
  */
  scroll_gap: [],
  /**
  * @summary - 레이어 팝업류 열기시 scroll값 translate 전환
  * @description
  * - 레이어 팝업이 호출 되었을 경우 배경 스크롤이 움직이지 않게 하는 함수
  * @function
  * @example
  * skt_landing.action.fix_scroll();
  */
  fix_scroll: function () {
    fixScroll_onoff = true;
    var popups = $('.wrap > .popup,.wrap > .popup-page'), 
        fix_target = $('.wrap > .popup,.wrap > .popup-page').length > 1 ? popups.eq(popups.length-2).find('.container-wrap') : $('#contents'),
        scroll_value = $('.wrap > .popup,.wrap > .popup-page').length > 1 ? fix_target.scrollTop() : $(window).scrollTop();
    this.scroll_gap.push(scroll_value);
    if ( $(".idpt-popup").length > 0 ){
      fix_target.css({
        'position':'fixed',
        'transform': 'translate(0 ,-' + this.scroll_gap[this.scroll_gap.length -1] + 'px)',
        'width':'100%',
        'top': 0,
        'z-index': 100,
        'overflowY':'visible'
      }).find('input').attr('tabindex',-1);
      $('.idpt-popup').css({
        'transform': 'translate(0 ,' + this.scroll_gap[this.scroll_gap.length -1] + 'px)'
      });
    } else {
      fix_target.css({
        'position':'fixed',
        'transform': 'translate(0 ,-' + this.scroll_gap[this.scroll_gap.length -1] + 'px)',
        'width':'100%',
        'z-index': -1,
        'overflowY':'visible'
      }).find('input').attr('tabindex',-1);
    }
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
  },
  /**
  * @deprecated
  *   autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
  * @function
  * @example
  * skt_landing.action.all_menu();
  */  
  all_menu : function(){
    var all_btn = $('.depth-view');
    if(all_btn.length < 1) return;
    all_btn.on('click', function(){
      if(!$('.depth-view-box').hasClass('open')){
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
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   * skt_landing.action.gnb_action();
  */
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
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   * skt_landing.action.anchor();
  */
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
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   * skt_landing.action.selecton();
  */
  selecton: function (ta) {
    ta.on('click', function () {
      if (ta.find('a').length > 0) {
        $(this).find('a').addClass('on');
      } else {
        $(this).addClass('on');
      }
    });
  },
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   * skt_landing.action.toggleon();
  */
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
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   * skt_landing.action.share();
  */
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
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   *  skt_landing.action.change();
  */
  change: function (popup_info) {
    this.close();
    this.open(popup_info);
  },
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   *  skt_landing.action.cancel();
  */
  cancel: function () {
    var _this = this;
    $('.btn-cancel').off('click').on('click', function () {
      _this.close(this);
    });
  },
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   *  skt_landing.action.text_toggle();
  */
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
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   *  skt_landing.action.switch();
  */
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
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   *  skt_landing.action.select_sort();
  */
  select_sort: function () {
    $('.select-sort li a').off('click').on('click', function () {
      $(this).parent().addClass('on').siblings('li').removeClass('on');
    });
  },
  /**
   * @deprecated
   *  autosms/js/common.js파일에서 복사해옴 기능동작 여부는 확인 불가 @190320 - 함수복사
   * @function
   * @example
   *  skt_landing.action.iscroll();
  */
  iscroll:function(selector, height){
    if(!height){
      height = '100%';
    }
  },
  /**
   * @summary - 레이어 팝업류 닫기시 scroll 재설정 
   * @description 
   *  - 레이어 팝업이 닫히고 나서 호출하는 함수
   *  - 설정되어 있던 overflow, position값등을 초기화
   * @function
   * @example
   *  skt_landing.action.auto_scroll();
  */
  auto_scroll: function () {
    fixScroll_onoff = false;
    var popups = $('.wrap > .popup,.wrap > .popup-page'),
        fix_target = $('.wrap > .popup,.wrap > .popup-page').length > 0 ? popups.eq(popups.length-1).find('.container-wrap') : $('#contents');
    if ( $(".idpt-popup").length > 0 ){ // 19.03.15 수정
      fix_target.css({
        'position':'',
        'transform': '',
        'top': '',
        'z-index': '',
        'overflowY':''
      }).find('input').attr('tabindex','');
      $('.idpt-popup').css({
        'transform': ''
      });
    } else {
      fix_target.css({
        'position':'',
        'transform': '',
        'z-index':'',
        'overflowY':''
      }).find('input').attr('tabindex','');
    }      
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
    if($('.wrap > .popup,.wrap > .popup-page').length > 0){
      fix_target.scrollTop(this.scroll_gap[this.scroll_gap.length -1]);
    }else{
      $(window).scrollTop(this.scroll_gap[this.scroll_gap.length -1]);
    }
    this.scroll_gap.pop();
    $('body').css({
      '-webkit-overflow-scrolling': 'touch'
    });
    setTimeout(function () {
      $('body').removeAttr('style');
    }, 0);
  },
  /** 
  * @summary 스크롤 관련
  * @class
  */
  checkScroll: {
  /**
   * @summary - 스크롤 이벤트 취소용
   * @description 
   * - 이중 스크롤 제어용
   * @function
   * @example
   *   $scroller = $('overflow-y: scroll');
   *   $scroller.on({
   *     'touchstart.search-scroll-fix': skt_landing.action.checkScroll._refuseScroll.call(this).touchstart,
   *     'touchmove.search-scroll-fix': skt_landing.action.checkScroll._refuseScroll.call(this).touchmove
   *   });
  */
  _refuseScroll: function (opts) {
    return {
      touchstart: function (e) {
        var $this = $(this);
        $this.data('posY', e.originalEvent.touches[0].pageY);
      },
      touchmove: function (e) {
        var $this = $(this);
        var posY = e.originalEvent.touches[0].pageY;
        var dataPosY = parseFloat($this.data('posY'));
        var isMoveUp = (posY-[dataPosY]<0);
        var isMoveDown = (posY-[dataPosY]>0);
        var scrollLimit = $this.height()+$this.scrollTop();     //스크롤 컨테이너 높이값
        var isScrollFirst = $this.scrollTop() == 0;
        var isScrollEnd = (scrollLimit == $this[0].scrollHeight);    //컨텐츠 내용물의 높이
        var isLessContents = $this.height() >= $this[0].scrollHeight;   //컨텐츠의 내용이 scrollbox 보다 내용물이 적을 경우

        if(isMoveUp && isScrollEnd || isMoveDown && isScrollFirst){
            e.preventDefault();
        }
      }
    }
  },
  /**
   * @summary - ios 백그라운드 스크롤 이벤트 취소
   * @description 
   * - input에 input-scroll-fix 클래스 추가
   * - input의 스크롤 영역에 scroll-fix-container 클래스 추가
   * @function
   * @example
   *  <div class=".scroll-fix-container">
   *    <input class=".input-scroll-fix" />
   *  </div>
  */
  input_scroll_fix: function (opts) {      
    opts = $.extend({selector: '.input-scroll-fix', container: '.scroll-fix-container'}, opts);
    $(document.body).on({
      'focus.input-scroll-fix': function (e) {
          $(opts.container).off('touchstart.scroll-fix touchmove.scroll-fix').on({
              'touchstart.scroll-fix': skt_landing.action.checkScroll._refuseScroll.call(this).touchstart,
              'touchmove.scroll-fix': skt_landing.action.checkScroll._refuseScroll.call(this).touchmove
          });    
      },
      'blur.input-scroll-fix': function () {
        $(opts.container).off('touchstart.scroll-fix touchmove.scroll-fix');
      }
    }, opts.selector);

    $('.wrap').on({
        touchstart: skt_landing.action.checkScroll._refuseScroll.call(this).touchstart,
        touchmove: skt_landing.action.checkScroll._refuseScroll.call(this).touchmove
    }, '.popup-blind');
  },
  /**
   * @summary 레이어 팝업이 닫힌후 스크롤 원위치 복귀용 변수
   * @member
   */
    scrollTopPosition: '',
    /**
    * @summary - 레이어 팝업이 열린후 백그라운드 스크롤 비활성화
    * @function
    * @description
    * - html, body에 noscroll 클래스 추가
    * @example
    *  skt_landing.action.checkScroll.lockScroll();
    */
    lockScroll: function () {
      if(!$("html, body").hasClass('noscroll')){ // prevent lockScroll function
        skt_landing.action.checkScroll.scrollTopPosition = $(window).scrollTop();
        $("body > .wrap").css({
          top: - (skt_landing.action.checkScroll.scrollTopPosition)
        });
        $("html, body").addClass('noscroll');
      }
    },
    /**
    * @summary - 레이어 팝업이 닫힌후 백그라운드 스크롤 활성화
    * @function
    * @description
    * - html, body에 noscroll 클래스 제거
    * - scroll위치값 재설정 ( skt_landing.action.checkScroll.scrollTopPosition )
    * @example
    *  skt_landing.action.checkScroll.unLockScroll();
    */
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
/**
  * @summary - 포커스 설정
  * @description
  *   - 대상에 입력 포커스 설정
  * @function
  * @param {Object} target - selector[0]
  * @param {Integer} idx - target의 몇번재 요소로 설정할지에 대한 변수
  * @example
  *  skt_landing.action.setFocus();
  */
  setFocus: function(target, idx){  // target : selector(string) | jquery selector
    var target = $(target),
        idx = idx ? idx : 0;
    target.eq(idx).attr('tabindex',0).focus(); // focus
  },
  /**
  * @summary - 이벤트 발생시 head안에 동적 css style 적용
  * @function
  * @description
  * - d.event{ mousedown, keydown }
  * @param {Object} d - selector[0]
  * @example
  *  skt_landing.action.focus_mousedown_style(document);
  */
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
  /**
  * @summary - 탑버튼
  * @description
  * - touchstart, click 이벤트 발생시 스크롤 최상단으로 이동
  * - click{ .bt-top button.event }
  * - {@link http://127.0.0.1:5500/html/templete/component_button.html}
  * @function
  * @example
  *  skt_landing.action.top_btn();
  */
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
  /**
  * @summary - get : 랜덤문자열
  * @description
  *   - 랜덤 id생성후 리턴
  * @function
  * @return {String} ranid - String
  * @example
  *  skt_landing.action.ran_id_create();
  */
  ran_id_create:function(){
    var d = new Date().getTime(),
        ranid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
          var r = (d+Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
    return ranid;
  },
  
  /** 
  * @summary 로딩 서클 type2
  * @class
  */
  loading2: {
    /**
    * @summary - 로딩 서클 type2의 활성화
    * @description 
    * - {@link http://127.0.0.1:5500/html/templete/widget_loading.html}
    * @function
    * @param {Object} obj - selector[0]
    * @example
    *  skt_landing.action.loading2.on();
    */
    on: function (obj) {
      var ta = obj.ta,
      size = obj.size,
      tit_id = skt_landing.action.ran_id_create(),
      loading_box = $('<div class="loading tw-loading profile-main-loader" role="region" aria-labelledby="'+tit_id+'" onclick="return false;"></div>'),
      loading_ico = $('<div class="loader" onclick="return false;"></div>'),
      loading_txt = '';//$('<em id="'+tit_id+'" onclick="return false;">로딩중입니다.</em>'),
      svg_id = '',
      svg = '';
      svg_id = skt_landing.action.loading.svg_id = skt_landing.action.ran_id_create();

      svg = [
          '<div class="spinner_loading2" onclick="return false;"></div>'
      ];
      svg = svg.join('');

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
    }
  },
  /** 
  * @summary 로딩 서클 type
  * @class
  */
  loading: {
    svg_id:'',
  /**
    * @summary - 로딩서클 default 활성화
    * @description 
    * - {@link http://127.0.0.1:5500/html/templete/widget_loading.html}
    * @function
    * @param {Object} obj - selector[0]
    * @example
    *  skt_landing.action.loading.on();
    */
    on: function(obj){
      var ta = obj.ta,
          //co = obj.co,
          size = obj.size,
          tit_id = skt_landing.action.ran_id_create(),
          loading_box = $('<div class="loading tw-loading profile-main-loader" role="region" aria-labelledby="'+tit_id+'" onclick="return false;"></div>'),
          loading_ico = $('<div class="loader" onclick="return false;"></div>'),
          loading_txt = '';//$('<em id="'+tit_id+'" onclick="return false;">로딩중입니다.</em>'),
          svg_id = '',
          //svg_color = '',
          svg = '';
      svg_id = skt_landing.action.loading.svg_id = skt_landing.action.ran_id_create();

      svg = [
        '<div class="spinner_loading" onclick="return false;">',
        '    <div class="line"></div>',
        '    <div class="line"></div>',
        '    <div class="line"></div>',
        '    <div class="line"></div>',
        '    <div class="line"></div>',
        '    <div class="line"></div>',
        '    <div class="line"></div>',
        '    <div class="line"></div>',
        '    <div class="line"></div>',
        '</div>'
      ];
      svg = svg.join('');

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
  /**
    * @summary - 로딩서클 default 비활성화
    * @description 
    * - {@link http://127.0.0.1:5500/html/templete/widget_loading.html}
    * @function
    * @param {Object} obj - selector[0]
    * @example
    *  skt_landing.action.loading.off();
    */
    off: function(obj){
      var ta = obj.ta;
      $('#'+$(ta).data('mate')).empty().remove();
    },
  /**
    * @summary - 로딩서클 전체 닫기 ( 비활성화 )
    * @description 
    * - {@link http://127.0.0.1:5500/html/templete/widget_loading.html}
    * @function
    * @example
    *  skt_landing.action.loading.allOff();
    */
    allOff : function(){
      $('.tw-loading').empty().remove();
    }
  },
  /** 
  * @summary 팝업관련
  * @class
  */
  popup: { //popup 
    /**
    * @summary - 포커스 리턴용 레이어 팝업
    * @description
    * - {@link http://127.0.0.1:5500/html/templete/log/multi-layer2.html}
    * @function
    * @param {Object} el - selector
    * @param {Enum} popup_info - Object value
    * @param {Function} callback_open - 레이어 팝업이 열렸을때 호출 시키는 함수
    * @param {Function} callback_fail - 레이어 팝업이 열기 실패시 호출 시키는 함수
    * @param {Object} toggle_btn - 포커스 시킬 Object
    * @example
    * skt_landing.action.popup.popupWrap({ url: 'https://cdnm.tworld.co.kr/hbs/', layer: true, title: 'test' }, function () {});
    */
    popupWrap: function (el, popup_info,callback_open,callback_fail,toggle_btn) {
      var _this = this;
      _this.open(popup_info,callback_open,callback_fail,toggle_btn);

      //레이어 팝업이 열렸을 경우 해당 첫번째 항목으로 포커스 이동
      var timer = null;
      timer = setInterval(function () {
          var $dialog = $('[role="dialog"]');
          if($dialog.length > 0)               clearTimeout(timer);
          $('[role="dialog"]').attr('tabindex', -1).focus();
      }, 300);

      //닫기 버튼시 포커스 이동
      $(document).one('click', '.close-modal button, .close-modal a', function () {
          skt_landing.action.popup.allClose();
          $(el).focus();      //포커스 리턴
      });
    },
    /**
    * @summary - 레이어 팝업 호출
    * @description
    * - {@link http://127.0.0.1:5500/html/templete/log/multi-layer2.html}
    * - {@link http://127.0.0.1:5500/html/templete/test.html}
    * - event {focus, keydown, click, focus, document.modal:open}
    * @function
    * @param {Object} el - selector
    * @param {Enum} popup_info - Object value
    * @param {Function} callback_open - 레이어 팝업이 열렸을때 호출 시키는 함수
    * @param {Function} callback_fail - 레이어 팝업이 열기 실패시 호출 시키는 함수
    * @param {Object} toggle_btn - 포커스 시킬 Object
    * @example
    * skt_landing.action.popup.open({ url: 'https://cdnm.tworld.co.kr/hbs/', layer: true, title: 'test' }, function () {});
    * skt_landing.action.popup.open({
      url:'/hbs/',
          'title': '매월 자동으로<br/> 데이터를 공유하시겠습니까?',
          'bt_b': [{
              style_class: 'pos-left prev-step',  //prev-step 닫기 버튼용 기능 클래스
              txt: '취소'
          }]
      }, function () {}, function () {}, this);   //click한 객체의 instance가 있어야 탭으로 접근 가능함
    */
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
          layer.css({'bottom':0});
          if ( !layer.hasClass("actionsheet_full") ){
            layer.css({'height':layer_h});
            layerContainerWrap.css({'height':layer_h});
          }
        }
        current_scrollTop = $(window).scrollTop();
        if( $(".fixed-bottom-lock").css("display") == "block" ){
          $(".wrap, html").css({"height":"100%", "overflowY":"hidden"});
          $(window).scrollTop(current_scrollTop);
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

        var $popup = $('.popup.tw-popup');
        var $popWrap = $popup.not($popup.last()).find('.container-wrap');
        $popWrap.css({
            'overflowY': 'hidden'
        });
        $(document).trigger('modal:open', {obj: this});

        // 19.03.22 딤드처리된 popup 스크롤락
        if ( createdTarget.find(".popup-blind").css("display") == "block" && $(".actionsheet").length > 0 || $('.popup .input-scroll-fix').length > 0 ){
          var popCk = $('.popup-page.tw-popup'),
              popCk_wrap = popCk.not($(".actionsheet"));
          popCk_wrap.each(function(){
            $(this).css('overflowY', 'hidden');
          });
          $("html, .wrap").css("height", "100%");
          skt_landing.action.checkScroll.lockScroll();
          skt_landing.action.checkScroll.input_scroll_fix();
          $(window).scrollTop(current_scrollTop);
        }

        if($('.tw-popup').length > 1){
          $('.tw-popup').not(createdTarget).find('.container').css({
            'overflowY': 'hidden'
          });
        }

        if ( createdTarget.find(".popup-blind").css("display") == "block" && $("[role='alertdialog']").length > 0 ){
          $("html, .wrap").css({"height":"100%", "overflowY":"hidden"});
          skt_landing.action.checkScroll.lockScroll();
          $(window).scrollTop(current_scrollTop);
        }

        /** actionSheet 내의 라디오, 체크박스에 대한 aria 속성 설정 - @190417 접근성 대비 테스트 */
        /*var checkBox_Radio_Aria = function (){
          var $obj = $('.tw-popup:last [class*="type"]');
          var $forms = $obj.find('input[type="checkbox"], [type="radio"]');
          $forms.on({
            'init': function () {
              var $this = $(this);
              var isChecked = $this.prop('checked');
              $this.closest($obj).attr('aria-selected', isChecked);
              $this.attr('data-bind', 'check_radio');
              
              console.log($._data($this[0], 'events'), $this.length);
            },
            'change': function () {
              var $this = $(this);
              var $group = $('[name="'+($this.attr('name'))+'"]');
              var isRadio = ($this.attr('type').toUpperCase() == 'RADIO'? true: false);
              var isChecked = $this.prop('checked');
              
              if(isRadio){
                $group.closest($obj).attr('aria-selected', false);
                $this.closest($obj).attr('aria-selected', true);
              }else{
                $this.closest($obj).attr('aria-selected', isChecked);
                console.log(isChecked, $this)
              }
            }
          });   
          $forms = $forms.not($forms.filter('[data-bind]'));
          $forms.trigger('init').filter(':checked').triggerHandler('change');
        }();//*/
      }).fail(function() {
        if(callback_fail){
          callback_fail();
        }
      });
    },
  /**
    * @summary - 레이어 팝업의 높이값 설정용 함수
    * @function
    * @example
    * skt_landing.action.popup.layer_height_chk();
    */
    layer_height_chk : function(){
      var win_h = skt_landing.util.win_info.get_winH(),
          layer = $('.popup .popup-page.layer'),
          layerContainerWrap = $('.popup .popup-page.layer > .container-wrap'),
          layerContainer = $('.popup .popup-page.layer > .container-wrap > .container'),
          layer_h = layerContainer.innerHeight();
      if(layer_h > (win_h * .90)) {
        layer_h = win_h * .90;
      }
      layer.css({'bottom':0});
      if ( !layer.hasClass("actionsheet_full") ){
        layer.css({'height':layer_h});
        layerContainerWrap.css({'height':layer_h});
      }
    },
    /**
    * @summary - 레이어 팝업 닫기
    * @function
    * @description
    *   - {@link http://127.0.0.1:5500/html/templete/test.html}
    * @param {Function} callback - 레이어 팝업을 닫은후 실행되는 함수
    * @example
    * skt_landing.action.popup.close_layer();
    */
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
    /**
    * @summary - 레이어 팝업 닫기
    * @description
    * - event{document.modal:close}
    * - {@link http://127.0.0.1:5500/html/templete/test.html}
    * @function
    * @param {Object} target - selector
    * @example
    * skt_landing.action.popup.close();
    */
    close: function (target) {
      var popups = $('.wrap > .popup,.wrap > .popup-page'),
          createdTarget = popups.last();
      if ( createdTarget.find(".popup-blind").css("display") == "block" && $(".actionsheet").length > 0 || $('.popup .input-scroll-fix').length > 0 ){
        var popCk = $('.popup-page.tw-popup'),
            popCk_wrap = popCk.not($(".actionsheet"));
        popCk_wrap.each(function(){
          $(this).css('overflowY', '');
        });
        $("html, .wrap").css("height", "");
        skt_landing.action.checkScroll.unLockScroll();
        $(window).scrollTop(current_scrollTop);
      }

      $('.tw-popup').not(createdTarget).find('.container').css({
        'overflowY': ''
      });

      //툴팁부분
      if ( createdTarget.find(".popup-blind").css("display") == "block" && $("[role='alertdialog']").length > 0 ){
        $("html, .wrap").css({"height":"", "overflowY":""});
        skt_landing.action.checkScroll.unLockScroll();
        $(window).scrollTop(current_scrollTop);
        if( popups.length == 1 && fixScroll_onoff ){
          skt_landing.action.auto_scroll();
        }
      }

      //팝업떴을때 바닥 스크롤 생기는 이슈
      if( $(".fixed-bottom-lock").css("display") == "block" ){
        $(".wrap, html").css({"height":"", "overflowY":""});
        $(window).scrollTop(current_scrollTop);
      }

      //중복레이어 팝업내 스크롤
      var $popup = $('.popup.tw-popup');
      var $popWrap = $popup.find('.container-wrap');
      $popWrap.css({
          'overflowY': ''
      });
      $(document).trigger('modal:close', {obj: this, target: target});

      if(target){
        $(target).closest('.popup,.popup-page').empty().remove();
      }else{
        var popups = $('.wrap > .popup,.wrap > .popup-page');
        popups.eq(popups.length-1).empty().remove();
      }
      if($('.wrap > .popup,.wrap > .popup-page').length == 0 && !$('#common-menu').hasClass('on')){
        skt_landing.action.auto_scroll();
      }
      if ( $(".idpt-popup").length > 0 ){
        skt_landing.action.auto_scroll();
      }
    },
    /**
    * @summary - 전체 레이어 팝업 닫기
    * @description
    * - {@link http://127.0.0.1:5500/html/templete/test.html}
    * @function
    * @example
    * skt_landing.action.popup.allClose();
    */
    allClose : function (){      
      var popups = $('.wrap > .popup,.wrap > .popup-page');
      popups.not($('.page')).empty().remove();
      if($('.wrap > .popup,.wrap > .popup-page').length == 0 && !$('#common-menu').hasClass('on')){
        skt_landing.action.auto_scroll();
      } else {
        $(".wrap, html, .container-wrap, .container").css({"height":"", "overflowY":""});
        skt_landing.action.auto_scroll();
        skt_landing.action.checkScroll.unLockScroll();
      }
      if ( $(".idpt-popup").length > 0 ){
        skt_landing.action.auto_scroll();
      }
    },
    /**
    * @summary - 팝업의 높이값이 일정값 이상일 경우 max-height 설정
    * @description
    * - 컨텐츠(.popup-contents)의 높이가 290이상 일 경우 스크롤 설정(.scrolling)
    * @function
    * @example
    * skt_landing.action.popup.scroll_chk();
    */
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
    /**
    * @summary - 토스트 레이어 팝업
    * @function
    * @description
    * - {@link http://127.0.0.1:5500/html/popup/toast.html}
    * @param {Enum} popup_info - {url, hbs...}
    * @example
    * skt_landing.action.popup.toast();
    */
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
  /**
  * @summary - input에 focus/ focusout 시 하단 fixed 영역 설정/ 해제
  * @description
  * - event{ document.focusout, document.click }
  * @function
  * @example
  * skt_landing.action.keyboard();
  */
  keyboard : function(){ /* input에 focus시 하단 fixed 영역 해제 */
    var selector = '.popup-page textarea, .popup-page input[type=text], .popup-page input[type=date], .popup-page input[type=datetime-local], .popup-page input[type=email], .popup-page input[type=month], .popup-page input[type=number], .popup-page input[type=password], .popup-page input[type=search], .popup-page input[type=tel], .popup-page input[type=time], .popup-page input[type=url], .popup-page input[type=week]';
    $(document).on('focus',selector, function(){
      $(this).closest('.popup-page').addClass('focusin')
    });
    $(document).on('focusout',selector, function(){
      var el = $(this);
      $(document).click(function(e){
        if(!$(e.target).is(selector)) {
          el.closest('.popup-page').removeClass('focusin')
        }
      });
    });
  },
  /**
  * @summary - 상품상세 원장 헤더 색상 제어
  * @function
  * @description
  * - event:{ window.scroll }
  * @example
  * skt_landing.action.prd_header();
  */
  prd_header : function(){
    $('#header').removeClass('bg-type');
    $(window).bind('scroll', function(){
      if(skt_landing.util.win_info.get_scrollT() == 0){
        $('#header').removeClass('bg-type');
      }else{
        $('#header').addClass('bg-type');
        
      }
    })
  },
  /**
    * @summary - 메인화면 슬라이더
    * @deprecated
    * @function
    * @description
    * - event{ window.scroll, .home-tab-belt GamepadButton.click, .home-tab-belt a.click, .home-slider .home-slider-belt.beforeChagne, .home-slider .home-slider-belt.afterChange }
    * @param {Object} opts - {options1, options2 ...}
    * @param {Function} callback - callback 함수
    * @example
    * skt_landing.action.home_slider();
    */   
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
      if(skt_landing.util.win_info.get_scrollT() > skt_landing.action.headerHeight){  // [#OP002-130] 2019.05.08 [UX정합성 2차] 홈 화면 메인 탭메뉴 언더라인 노출 타이밍 오류
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
  /**
  * @summary - 스크롤시 body에 scroll 클래스 설정/ 해제
  * @description
  * - event{ window.scroll }
  * @function
  * @example
  * skt_landing.action.header_shadow();
  */
  header_shadow : function(){
    $(window).bind('scroll', function(){
      // [#OP002-130] 2019.05.08 [UX정합성 2차] 홈 화면 메인 탭메뉴 언더라인 노출 타이밍 오류 START
      if(skt_landing.util.win_info.get_scrollT() > skt_landing.action.headerHeight){
          $('body').addClass('scroll');
      }else{
          $('body').removeClass('scroll');
      }
      // [#OP002-130] 2019.05.08 [UX정합성 2차] 홈 화면 메인 탭메뉴 언더라인 노출 타이밍 오류 END
    });
  },
  /**
  * @summary - 스크롤시 .popup-page, .header-wrap에 scroll 클래스 설정/ 해제
  * @description
  * - .container-wrap 에 스크롤시 popup-page 에 scroll 클래스 등록/ 해제
  * - .container 에 스크롤시 .header-wrap 에 scrollshadow 클래스 등록/ 해제
  * event{ .container-wrap.scroll, .container.scroll, .popup-page.scroll }
  * @function
  * @example
  * skt_landing.action.header_shadow_popup();
  */
  header_shadow_popup : function(){
    $('.popup-page').each(function(){
      if($(this).data('scroll') == undefined){
        $(this).data('scroll', true);
        $(this).find('.container-wrap').on('scroll', function(){
          if($(this).scrollTop() > 0){
            $(this).closest('.popup-page').addClass('scroll');
          }else{
            $(this).closest('.popup-page').removeClass('scroll');
          }
        });

        $(this).find('.container').on('scroll', function(){ // 19.03.27 팝업 스크롤시 scroll 추가
          if($(this).scrollTop() > 0){
            $('.header-wrap').addClass('scrollshadow');
          }else{
            $('.header-wrap').removeClass('scrollshadow');
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
  /**
  * @summary - gnb관련 이벤트 함수
  * @description
  * - event{ .icon-gnb-menu.click, #common-menu .c-close.click, .section-cont.scroll, .bt-depth1 .more.click }
  * @function
  * @example
  * skt_landing.action.gnb();
  */
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
  /**
  * @summary - 세로로 올라가는 슬라이드 배너 형태
  * @description
  * - selector{ .notice-slider-type }
  * @function
  * @example
  * skt_landing.action.notice_slider();
  */
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
/** 
 * @summary skt_landing.dev 클래스
 * @class
 */
skt_landing.dev = {
  /**
  * @function
  * @example
  * skt_landing.dev.sortableInit();
  */
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