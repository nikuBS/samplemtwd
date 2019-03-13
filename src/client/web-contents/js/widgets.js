$(document).on('ready', function () {
  skt_landing.widgets.widget_init();
});
skt_landing.widgets = {
  widget_init: function(ta){ // string : selector
    /* 위젯 구간 */
    widget_list = {};
    var widget_ta = ta ? $(ta+' .widget') : $('.widget');
    widget_ta.each(function (idx) {
      var com = $.trim($(this).find('>.widget-box').attr('class').replace(/widget-box /, ''));
      widget_list['widget_' + com] = skt_landing.widgets['widget_' + com];
    });
    for (var com_name in widget_list) {
      try {
        widget_list[com_name](widget_ta);
      }
      catch(err) {
        console.log('error : ' + com_name); // .widget > .widget-box 구조를 절대적 .widget-box에는 정해진 clsss명만 올수있음 
      }
    }
    skt_landing.widgets.widget_deltype();
    
    /* 컴포넌트 실행 */
    component_list = {};
    var component_ta = ta ? $(ta+' .component') : $('.component');
    component_ta.each(function (idx) {
      var com = $.trim($(this).find('.component-box').attr('class').replace(/component-box /, ''));
      component_list['component_' + com] = skt_landing.widgets['component_' + com];
    });
    for (var com_name in component_list) {
      try {
        component_list[com_name](component_ta);
      }
      catch(err) {
        console.log('error : ' + com_name); // .widget > .widget-box 구조를 절대적 .widget-box에는 정해진 clsss명만 올수있음
      }
    }
  },
  widget_tube: function (ta) {
    var widget = ta ? $(ta).find('.widget-box.tube') : $('.widget-box.tube');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var tube_box = $(this).find('.tube-list'),
          tube_list = tube_box.find('> li');
      var listClass = ['one','two','three','four','five'],
          classValue = null,
          classNum = 0;
      for(var i=0, leng=listClass.length; i<leng; ++i){
        if(tube_box.attr('class').indexOf(listClass[i]) > 0){
          classValue = listClass[i];
          classNum = i+1;
          break;
        }
      }
      if(!tube_list.hasClass('refil-tube')){
        if(typeof classValue != 'string'){
          tube_box.addClass('five');
          classValue = 'five';
          classNum = 5;
        }
        tube_list.first().addClass('top-left');
        tube_list.last().addClass('bottom-right');
        tube_list.eq(tube_list.length < classNum ? tube_list.length-1 : classNum-1).addClass('top-right');
        tube_list.filter(function(index){
          var val = 0;
          if(tube_list.length == classNum){val = 0;}
          else if(tube_list.length > classNum && tube_list.length % classNum == 0){val = parseInt(tube_list.length / classNum) * classNum - classNum;}
          else{val = parseInt(tube_list.length / classNum) * classNum;}
          return index === val;
        }).addClass('bottom-left');

      }

      var _this = $(this);
      if(_this.find('input:checked').length > 0){
        setRadioState(_this.find('input:checked').last());
      }
      _this.find('input').on('change',function(){
        setRadioState($(this));
      }).on('focusin',function(){
        $(this).closest('li').addClass('focus');
      }).on('focusout',function(){
        $(this).closest('li').removeClass('focus');
      });
      _this.find('li').on('click',function(e){
        if(e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return ;
        $(this).find('input').trigger('change');
      });
    });
    function setRadioState(target){
      var target = $(target),
          label = target.closest('li').not('.disabled');
      if(target.closest('li').hasClass('disabled')) return ;
      target.closest('li').siblings('.disabled').attr('aria-disabled',true);
      label.siblings().removeClass('checked').attr('aria-checked',false);
      label.siblings().find('input').attr('checked',false).prop('checked',false);
      label.addClass('checked').attr('aria-checked',true);
      target.attr('checked',true).prop('checked',true);
    }
  },
  widget_deltype: function(){
    $('.input').each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var bt = $(this).find('.cancel'),
          field = bt.prev();
      if(field.val() == '' || field.attr('readonly')){
        bt.hide();
      }else{
        bt.show();
      }
      bt.on('click',function(e){//@텍스트 삭제 버튼 수정
        var $this = $(this);
        if($this.hasClass('stop-bubble') == true) e.stopPropagation();    //@2019-03-12 stop-bubble 클래스 추가 ( 체크박스안에 삭제 버튼이 있는 경우 )
        field.val('').focus();
        bt.hide();
      });
      field.on('change keyup',function(){
        if($(this).val() == ''){
          bt.hide();
        }else{
          bt.show();
        }
      });
      if(field.hasClass('text-auto-expand')) {
        field.on('input.text-auto-expand',function(){
          $(this).css('height', 'inherit');
          var scroll_height = $(this).get(0).scrollHeight;
          $(this).css('height', scroll_height + 'px');
        });
        if(field.is('[maxlength]')) {
          // if (!('maxLength' in field)) { // support browser check
            var maxLength = field.attr('maxlength');
            field.on('keyup',function(){
              var str_length = $(this).val().length;
              if(str_length > maxLength){
                // console.log(str_length);
                $(this).val($(this).val().substr(0, maxLength));
                $(this).trigger('input.text-auto-expand');
                return false;
              }
            });
          // }
        }
        bt.on('click',function(){
          field.css('height', 'inherit');
        });
      }
    });
  },
  widget_step: function () {
    $('.step-list li').each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      if(!$(this).hasClass('on')){
        $(this).attr('aria-hidden', true);
      }
    });
  },
  widget_radio: function (ta) {
    var input = ta ? $(ta).find('.radiobox :radio') : $('.radiobox :radio');
    input.each(function () {
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var box = $(this).closest('.radiobox');
      if($(this).closest('.radio-slide').length > 0){
        var radioSlide = $(this).closest('.radio-slide'),
            radioItems = radioSlide.find('.radiobox'),
            itemsW = 0;
        for(var i=0, leng=radioItems.length; i<leng; ++i){
          itemsW += radioItems.eq(i).outerWidth(true);
        }
        radioSlide.find('.select-list').css('width',itemsW + 1);
      }

      $(this).is(':checked') ? box.addClass('checked').attr('aria-checked',true) : box.removeClass('checked').attr('aria-checked',false);
      $(this).is(':disabled') ? box.addClass('disabled').attr('aria-disabled',true) : box.removeClass('disabled');
      
      $(this).on('change', function () {
        if ($(this).prop('disabled')) return;
        var nameGroup = $('[name=' + $(this).attr('name') + ']').not(this);
        nameGroup.closest('li').removeClass('checked').attr('aria-checked',false);
        nameGroup.attr('checked', false).prop('checked',false);
        $(this).closest('li').addClass('checked').attr('aria-checked',true);
        $(this).attr('checked', 'checked').prop('checked',true);
      }).on('focusin', function () {
        box.addClass('focus');
      }).on('focusout', function () {
        box.removeClass('focus');
      });

      box.on('click',function(e){
        if(e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return ;
        $(this).find('input').trigger('change');
      });
    });
  },
  widget_check: function (ta) {
    var input = ta ? $(ta).find('.checkbox :checkbox') : $('.checkbox :checkbox');
    input.each(function () {
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var box = $(this).closest('.checkbox');
      $(this).is(':checked') ? box.addClass('checked').attr('aria-checked',true) : box.removeClass('checked').attr('aria-checked',false);
      $(this).is(':disabled') ? box.addClass('disabled').attr('aria-disabled',true) : box.removeClass('disabled');
      $(this).on('click', function () {
        if ($(this).prop('checked')) {
          box.addClass('checked').attr('aria-checked',true);
          $(this).attr('checked', true);
        } else {
          box.removeClass('checked').attr('aria-checked',false);
          $(this).attr('checked', false);
        }
      }).on('focusin', function () {
        box.addClass('focus');
      }).on('focusout', function () {
        box.removeClass('focus');
      });
      box.on('click',function(e){
        if(e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return ;
        $(this).find('input').trigger('click');
      });
    });
  },
  widget_file: function(ta){
    var input = ta ? $(ta).find('.widget-box.file') : $('.widget-box.file');
    input.each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var file = $(this).find('.file'),
          vfile = $(this).find('.fileview');
      if(vfile){
        file.on('change',function(){
          vfile.val($(this).val());
        });
      }
    });
  },
  widget_tfCombined: function (ta) {
    var box = ta ? $(ta).find('.txfield-combined') : $('.txfield-combined');
   
      box.each(function(){
        if($(this).data('event') == undefined){
          $(this).data('event', 'bind')
        }else{
          return;
        }
        var _this = $(this);
        var count = 0;
        _this.find('.input-focus').on('focus',function(e){
          count ++;
          _this.addClass('focus');
          if(count > 0){
            _this.find('.inner-tx').addClass('once');
          }
        }).on('blur',function(){
          _this.removeClass('focus');
        });
      });
/* 정체 불명 
      box.find('.combined-cell').each(function(num){
        var _this = $(this);
        var _this_w = _this.width();
        var _dt_w = _this.find('dt').width();
        $('.combined-cell').eq(num).find('dt').width(_dt_w);
        $('.combined-cell').eq(num).find('dd').width(_this_w-_dt_w);
      });
*/
  },
  widget_slider1: function (ta) {
    var widget = ta ? $(ta).find('.slider1') : $('.slider1');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      if($(this).find('.slider > *').length == 1){
        return;
      }
      if($(this).find('.slick-initialized').length > 0){
        $(this).find('.slider').slick('destroy');
      }
      var _this = $(this).find('.slider');      
      if($(this).hasClass('slider1-auto')) {    //@DV001-16538
        _this.slick({
          autoplay: true,
          autoplaySpeed: 4000,
          dots: true,
          arrows: true,
          infinite: true,
          speed : 300,
          // useTransform : false,
          // mobileFirst : true,
          // useCSS : false,
          // useTransform : false,
          lazyLoad: 'ondemand',
          centerMode: false,
          focusOnSelect: false,
          touchMove : true,
          customPaging: function(slider, i) {
            return $('<span class="set-aria" />').text(i + 1);//@DV001-16733 span.set-aria
          },
        });
      }else{
        _this.slick({
          dots: true,
          arrows: true,
          infinite: false,
          speed : 300,
          // useTransform : false,
          // mobileFirst : true,
          // useCSS : false,
          // useTransform : false,
          lazyLoad: 'ondemand',
          centerMode: false,
          focusOnSelect: false,
          touchMove : true,
          customPaging: function(slider, i) {
            return $('<span class="set-aria"/>').text(i + 1);//@DV001-16733 span.set-aria
          },
        });
      }
      /*_this.slick({
        dots: true,
        arrows: true,
        infinite: false,
        speed : 300,
        // useTransform : false,
        // mobileFirst : true,
        // useCSS : false,
        // useTransform : false,
        lazyLoad: 'ondemand',
        centerMode: false,
        focusOnSelect: false,
        touchMove : true,
        customPaging: function(slider, i) {
          return $('<span />').text(i + 1);
        },
      });
      if($(this).hasClass('slider1-auto')) {
        _this.slick('destroy');
        _this.slick({
          autoplay: true,
          autoplaySpeed: 4000,
          dots: true,
          arrows: true,
          infinite: true,
          speed : 300,
          // useTransform : false,
          // mobileFirst : true,
          // useCSS : false,
          // useTransform : false,
          lazyLoad: 'ondemand',
          centerMode: false,
          focusOnSelect: false,
          touchMove : true,
          customPaging: function(slider, i) {
            return $('<span />').text(i + 1);
          },
        });
      }*/
      if(_this.find('.slick-slide').length == 1){
        _this.addClass('slick-dotted-none');
      }
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
          $slides.eq($slick.slickCurrentSlide()).triggerHandler('click');
        }, 0);
      });
      if($('.home-slider').length > 0){
        _this.on({
          'mousedown' : function(){
            $('.home-slider .home-slider-belt')[0].slick.setOption({
              swipe: false
            })
          },
          'touchstart' : function(){
            $('.home-slider .home-slider-belt')[0].slick.setOption({
              swipe: false
            })
          },
          'mouseup' : function(){
            setTimeout(function(){
              $('.home-slider .home-slider-belt')[0].slick.setOption({
                swipe: true
              })
            },200)
          },
          'edge' : function(){
            setTimeout(function(){
              $('.home-slider .home-slider-belt')[0].slick.setOption({
                swipe: true
              })
            },200)
          },
          'setPosition' : function(){
            setTimeout(function(){
              $('.home-slider .home-slider-belt')[0].slick.setOption({
                swipe: true
              })
            },200)
          },
          'beforeChange' : function(){
            setTimeout(function(){
              $('.home-slider .home-slider-belt')[0].slick.setOption({
                swipe: true
              })
            },200)
          },
          'afterChange' : function(){
            setTimeout(function(){
              $('.home-slider .home-slider-belt')[0].slick.setOption({
                swipe: true
              })
            },200)
          },
          'mousemove' : function(){
          },
          'swipe' : function(){
          }
        })
      }
    });
  },
  widget_slider2: function (ta) {
    var widget = ta ? $(ta).find('.slider2') : $('.slider2');
    $(widget).each(function(){
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
  },
  widget_accordion: function (ta) {
    var widget = ta ? $(ta).find('.widget-box.accordion') : $('.widget-box.accordion');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this);
      if(_this.find('> .acco-cover > .bt-whole').length < 1){
        _this.find('.acco-cover').addClass('on');
      }
      var accoList = _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box');
      var accoList_leng = accoList.length;
      if($(this).find('> .acco-cover > .acco-style').hasClass('none-event')) return ; // 이벤트를 적용하지 않을 경우

      var setOnList = _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box');
      for(var i=0, leng=setOnList.length; i<leng; ++i){
        if(setOnList.eq(i).find('> .acco-tit button').length < 1 && _this.find('.acco-cover.disabled').length < 1){
          // 열고닫는 버튼이 없고 diabled 클래스도 없는 경우
          setOnList.eq(i).addClass('on');
        }
        if(setOnList.eq(i).find('> .acco-tit').length < 1 && setOnList.eq(i).find('> .acco-cont').length > 0){
          // 제목이 없고 내용만 있는 경우
          setOnList.eq(i).addClass('imp-view');
        }
      }
      // _this.find('.acco-cover:not(".focuson")')/*.addClass('toggle')*/.find('.acco-box.on').removeClass('on');  // 2018-07-19 default : 모두 닫힘, toggle 여부에 따라 다름
      _this.find('> .acco-cover > .bt-whole button').on('click',function(event){
        if(!$(this).closest('.acco-cover').hasClass('on')){
          $(this).attr('aria-pressed', 'true');
          //$('.popup .popup-page.layer').animate({scrollTop:acco_top}, '200');
          event.stopPropagation();
        }else{
          $(this).attr('aria-pressed', 'false');
        }
        $(this).closest('.acco-cover').toggleClass('on');
      });
      _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box:not(".none-event") > .acco-tit button:not(".btn-tip")').on('click', function (event) {
        
        if(_this.find('> .acco-cover').hasClass('toggle')){
          $(this).closest('.acco-box').siblings().removeClass('on');
          $(this).closest('.acco-box').siblings().find('> .acco-tit button').attr('aria-pressed',false);
        }
        $(this).closest('.acco-box').toggleClass('on');

        if($(this).closest('.acco-box').hasClass('on')){
          $(this).attr('aria-pressed', 'true');
          event.stopPropagation();
        }else{
          $(this).attr('aria-pressed', 'false');
        };
      });
    })
  },
  widget_accordion2: function(ta){
    var widget = ta ? $(ta).find('.widget-box.accordion2') : $('.widget-box.accordion2');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this),
          box = _this.find('> .acco-style > .acco-box'),
          list = box.find('> .acco-list'),
          btn = list.find('> .acco-title button');
      for(var i=0,leng=list.length; i<leng;++i){
        setState(btn.eq(i), list.eq(i).hasClass('on'));
      }
      box.on('click','> .acco-list > .acco-title button',function(){
        if(!$(this).hasClass('none-event')){
          setState($(this), !$(this).closest('.acco-list').hasClass('on'));
        }
      });
      function setState(button, state){
        var button = $(button);
        if(state){
          button.closest('.acco-list').addClass('on');
        }else{
          button.closest('.acco-list').removeClass('on');
        }
        if(box.hasClass('toggle') && state){
          button.closest('.acco-list').siblings().find('> .acco-title button').attr('aria-pressed', false);
          button.closest('.acco-list').siblings().removeClass('on');
        }
        button.attr('aria-pressed', state);
      }
    });
  },
  widget_switch: function (ta) {
    var widget = ta ? $(ta).find('.switch .btn-switch input') : $('.switch .btn-switch input');
    $(widget).each(function () {
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      checkSwitch(this, !$(this).closest('.btn-switch').hasClass('on'));
      $(this).on('change', function () {
        checkSwitch(this);
      }).on('focusin',function(){
        $(this).closest('.btn-switch').addClass('focus');
      }).on('focusout',function(){
        $(this).closest('.btn-switch').removeClass('focus');
      });
      $(this).closest('.switch-style').on('click',function(e){
        if(e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return ;
        $(this).find('input').trigger('change');
      });
    });
    function checkSwitch(target, state){
      var target = $(target),
          state = typeof state == 'boolean' ? state : target.closest('.btn-switch').hasClass('on');
      if(target.attr('disabled')){
        target.closest('.switch-style').attr('aria-disabled', true);
        target.closest('.btn-switch').addClass('disabled');
        return ;
      }else{
        target.closest('.switch-style').attr('aria-disabled', false);
        target.closest('.btn-switch').removeClass('disabled');
      }
      if (state) {
        target.closest('.btn-switch').removeClass('on');
        target.closest('.switch-style').attr('aria-checked',false);
        target.attr('checked',false);
      } else {
        target.closest('.btn-switch').addClass('on');
        target.closest('.switch-style').attr('aria-checked',true);
        target.attr('checked',true);
      }

    }
  },
  widget_switch2: function (ta) {
    var widget = ta ? $(ta).find('.switch2 .btn-switch input') : $('.switch2 .btn-switch input');
    $(widget).each(function () {
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var box = $(this).closest('li');
      $(this).is(':checked') ? box.addClass('checked').attr('aria-checked',true) : box.removeClass('checked').attr('aria-checked',false);
      $(this).is(':disabled') ? box.addClass('disabled').attr('aria-disabled',true) : box.removeClass('disabled');
      $(this).on('change', function () {
        if ($(this).prop('disabled')) return;
        var nameGroup = $('[name=' + $(this).attr('name') + ']').not(this);
        nameGroup.closest('li').removeClass('checked').attr('aria-checked',false);
        nameGroup.attr('checked', false).prop('checked',false);
        $(this).closest('li').addClass('checked').attr('aria-checked',true);
        $(this).attr('checked', 'checked').prop('checked',true);
      }).on('focusin', function () {
        box.addClass('focus');
      }).on('focusout', function () {
        box.removeClass('focus');
      });

      box.on('click',function(e){
        if(e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return ;
        $(this).find('input').trigger('change');
      });
    });
  },
  widget_toggle: function(ta){
    var widget = ta ? $(ta).find('.bt-toggle') : $('.bt-toggle');
    widget.each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      $(this).on('click', function(){
        var _this = $(this);
        var toggler = _this.closest('.toggle').find('.toggler');
        if (toggler.is(':hidden')) {
          toggler.slideDown();
          _this.attr('aria-pressed', 'true');
          _this.addClass('open');
        } else {
          toggler.slideUp();
          _this.attr('aria-pressed', 'false');
          _this.removeClass('open');
        }
      })
    })
  },
  component_tabs: function (ta) {
    var tabArr = ta ? $(ta).find('.tabs .tab-area') : $('.tabs .tab-area');
    tabArr.each(function () {
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this),
          tabList = _this.find('.tab-linker'),
          tabCont = _this.find('.tab-contents');
      initLinkSlide(tabList);
      tabListOnChk();

      tabList.find('button:not(".tip-view"), a:not(".tip-view")').on('click',function(){
        if($(this).hasClass('disabled')){ // .disabled시 비활성화
          return false;
        }
        $(this).closest('li').attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
        tabListOnChk();
        initLinkSlide(tabList);
      });

      function tabListOnChk(){
        var tabListIdx = tabList.find('li[aria-selected="true"]').index();
        if(tabListIdx != -1){
          tabCont.children('ul').children('li').eq(tabListIdx).attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
        }
      }
      function initLinkSlide(tabList){
        var items = tabList.find('li');
        var itemsW = parseInt(items.closest('ul').css('padding-left'))*2;
        for(var i=0,leng=items.length; i<leng; ++i){
          itemsW += Math.ceil(items.eq(i).outerWidth(true));
        }
        if(skt_landing.util.win_info.get_winW() > itemsW){
          items.closest('ul').css('width','100%');
        }else{
          items.closest('ul').css('width',itemsW);
        }
      }
    });
  },
  widget_toggle01: function(ta) {
    var widget = ta ? $(ta).find('.toggle01') : $('.toggle01');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this);
      var _item = _this.find('> .representcharge-list > li');
      widget.on('click','> .representcharge-list > li > .representcharge-info',function(){
        if ( $(this).attr('aria-pressed') === 'true' ) {
          $(this).closest('li').removeClass('current');
          $(this).attr('aria-pressed','false');
        } else {
          $(this).closest('li').addClass('current');
          $(this).attr('aria-pressed','true');
        }
      });
    });
  },
  widget_toggle02: function(ta) {
    var widget = ta ? $(ta).find('.toggle02') : $('.toggle02');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this);
      var _list = _this.find('> .suggest-tag-list');
      var _btn  = _this.find('.suggest-tag-morewrap button, .suggest-tag-morewrap a');
      var _ul = _this.find('ul:eq(0)');
      if(_list.height() >= _ul.height()){
        _btn.remove();
      }else{
        widget.on('click','> .suggest-tag-morewrap button, .suggest-tag-morewrap a',function(){
          if ( _btn.attr('aria-pressed') === 'true' ) {
            $(_list).removeClass('openlist-wrap');
            $(_btn).removeClass('openbtn');
            $(_btn).attr('aria-pressed', 'false');
          } else {
            $(_list).addClass('openlist-wrap');
            $(_btn).addClass('openbtn');
            $(_btn).attr('aria-pressed', 'true');
          }
        });
      }
    });
  },
  widget_horizontal: function(ta){
    var widget = $(ta).find('.horizontal');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var belt = $(this).find('.horizontal-list'),
          slide = $(this).find('.horizontal-slide'),
          items = belt.find('> li'),
          itemsW = 0;
      for(var i=0; items.length > i; ++i){
        itemsW += Math.ceil(items.eq(i).outerWidth(true));
      }
      belt.css('width', itemsW + 3);
      /*
      if(itemsW <= slide.width()){
        belt.css('width','100%');
      }else if(itemsW > slide.width()){
        belt.css('width', itemsW + 1);
      }
      */
    });
  },
  widget_donutchart: function(ta){
    var widget = ta ? $(ta).find('.widget-box.donutchart') : $('.widget-box.donutchart');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var time = 500,
      now = 0,
      interval = 10,
      max = 100,
      loop = 100,
      reverceTic = 1,
      _this = this;
      $(_this).find('.donut-chart .c100').each(function(){
        $(this)
            // .data('reverce', false)
            .data('now', 0)
            // .data('unit', (max - $(this).data('percent') + loop) / (time / interval)) // reverse operation
            .data('unit', ($(this).data('percent')) / (time / interval))
            .data('reverse', 0)
      })
      var t = setInterval(function(){
        $(_this).find('.donut-chart .c100').each(function(){
            if(!$(this).data('reverse')){
               $(this).data('now', Math.ceil($(this).data('unit') * now / 10));
            }else{
              $(this).data('reverse', $(this).data('reverse') + 1)
              $(this).data('now', max - Math.floor($(this).data('unit') * $(this).data('reverse')));
            }
            $(this).attr('class','').addClass('c100').addClass('p'+$(this).data('now'));
            if($(this).data('now') >= max){ // reverse flag
              //$(this).data('now', max)
              //$(this).data('reverse', true) // reverse operation
            }
        })
        now += interval;
        if(now >= time){
          $(_this).find('.donut-chart .c100').each(function(){
            $(this).attr('class','').addClass('c100').addClass('p'+$(this).data('percent'));
          })
          clearInterval(t);
        }
      }, interval)
    });
  }
}
