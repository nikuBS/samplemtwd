$(document).on('ready', function () {
  skt_landing.widgets.widget_init();
});
skt_landing.widgets = {
  widget_init: function(ta){ // string : selector
    widget_list = {};
    ta = ta ? $(ta+' .widget') : $('.widget');
    ta.each(function (idx) {
      var com = $(this).find('>.widget-box').attr('class').replace(/widget-box /, '');
      widget_list['widget_' + com] = skt_landing.widgets['widget_' + com];
    });
    for (var com_name in widget_list) {
      widget_list[com_name](ta);
    }
  },
  widget_test: function () {
  },
  widget_tube: function (ta) {
    var widget = ta ? $(ta).find('.widget-box.tube') : $('.widget-box.tube');
    $(widget).each(function(){
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
  widget_step: function () {
    $('.step-list li').each(function(){
      if(!$(this).hasClass('on')){
        $(this).attr('aria-hidden', true);
      }
    });
  },
  widget_radio: function (ta) {
    var input = ta ? $(ta).find('.radiobox :radio') : $('.radiobox :radio');
    input.each(function () {
      var box = $(this).closest('.radiobox');
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
  widget_slider: function () {
    /*$('.slider').each(function (idx) {
      var swiper,
        tagClass = 'slide-number' + idx,
        _this = $(this).find('.slider-box').addClass(tagClass);
      _this.find('.page-total .total').text(_this.find('.swiper-slide').length);
      swiper = new Swiper('.slider .' + tagClass, {
        pagination: '.swiper-pagination',
        paginationClickable: true
      });
    });*/
  },
  widget_slider2: function () {
    /*$('.slider2').each(function (idx) {
      var swiper,
        tagClass = 'slide-number' + idx,
        _this = $(this).find('.slider-box').addClass(tagClass);
      _this.find('.page-total .total').text(_this.find('.swiper-slide').length);
      swiper = new Swiper('.slider2 .' + tagClass, {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        freeMode: true
      });
    });*/
  },
  widget_slider3: function (ta) {
    var widget = ta ? $(ta).find('.slider3') : $('.slider3');
    $(widget).each(function(){
      var _this = $(this).find('.slider');
      _this.slick({
        dots: true,
        arrows: true,
        infinite: false,
        speed : 300,
        slidesToShow: 3,
        slidesToScroll: 3,
        centerMode: false,
        focusOnSelect: false,
		customPaging: function(slider, i) {
			return $('<span />').text(i + 1);
		},
      });
      var $slick = _this.slick('getSlick');
      var $slides = $slick.$slides;
      var slideIndex = $slick.slickCurrentSlide();

      //슬라이더의 요소를 클릭시 요소에 대한 색상변환
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
      //@180709: 수정 - 끝
    });
  },
  widget_slider4: function (ta) {
    var widget = ta ? $(ta).find('.slider4') : $('.slider4');
    $(widget).each(function(){
      var _this = $(this).find('.slider');
      _this.slick({
        dots: false,
        arrows: false,
        infinite: false,
        slidesToShow: 1,
        centerMode: false,
        variableWidth: false,
        focusOnSelect: true,
        focusOnChange: true,
        responsive: [{
          settings:{
            centerPadding:0
          }
        }]
      });
      _this.on('init',function(){
        var totalBox = $(this).closest(widget).find('.page-total'),
            slick = _this.prop('slick');
        totalBox.find('.current').text(slick.currentSlide+1);
        totalBox.find('.total').text(slick.slideCount);
      })
        .trigger('init')
        .on('beforeChange',function(event, slick, currentSlide, nextSlide){
        var totalBox = $(this).closest(widget).find('.page-total');
        totalBox.find('.current').text(nextSlide+1);
        totalBox.find('.total').text(slick.slideCount);
      });
    });



      /*onAfterChange: function(){
            var currentSlide = $('.regular').slick('slickCurrentSlide');
          $('.current').text(currentSlide);
      }*/

    /*$('.slider4').each(function (idx) {
      var swiper,
        tagClass = 'slide-number' + idx,
        _this = $(this).find('.slider-box').addClass(tagClass);
      _this.next().find('.total').text(_this.find('.swiper-slide').length);
      swiper = new Swiper('.slider4 .' + tagClass, {
        onInit: function (params) {
          _this.next().find('.current').text(params.activeIndex + 1);
        },
        onSlideChangeStart: function (params) {
          _this.next().find('.current').text(params.activeIndex + 1);
        }
      });
    });*/
  },
  widget_slider5: function (ta) {
    var widget = ta ? $(ta).find('.slider5') : $('.slider5');
    $(widget).each(function(){
      var _this = $(this).find('.slider');
      _this.slick({
        dots: false,
        arrows: false,
        infinite: false,
        slidesToShow: 1,
        centerMode: false,
        variableWidth: false,
        focusOnSelect: true,
        focusOnChange: true,
        responsive: [{
          settings:{
            centerPadding:0
          }
        }]
      });
      _this.on('init',function(){
        var totalBox = $(this).closest(widget).find('.page-total'),
            slick = _this.prop('slick');
        totalBox.find('.current').text(slick.currentSlide+1);
        totalBox.find('.total').text(slick.slideCount);
        /*if($(this).find('.bt-select-arrow')){
          skt_landing.action.toggleon($('.bt-select-arrow'));
          $(this).find('.coupon-cont').on('click',function(){
            $(this).find('.bt-select-arrow').click();
          });
        }*/
        //var  slickCont = $(this).find('.slick-slide');
        //slickCont.each(function(){
        //  $(this).replaceWith($('<li>').append($(this).contents()));
        //});
        //$(this).replaceWith($('<ul>').append($(this).contents()));
      })
        .trigger('init')
        .on('beforeChange',function(event, slick, currentSlide, nextSlide){
        var totalBox = $(this).closest(widget).find('.page-total');
        totalBox.find('.current').text(nextSlide+1);
        totalBox.find('.total').text(slick.slideCount);
      });
    });
  },
  widget_accordion: function (ta) {
    var widget = ta ? $(ta).find('.widget-box.accordion') : $('.widget-box.accordion');
    $(widget).each(function(){
      var _this = $(this);
      if(_this.find('> .acco-cover > .bt-whole').length < 1){
        _this.find('.acco-cover').addClass('on');
      }

      var accoList = _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box');
      var accoList_leng = accoList.length;
      for(var i=0; i<accoList_leng; ++i){
        var forTarget = accoList.eq(i).find('> .acco-cont').children();
        forTarget = forTarget.children().length > 0 ? forTarget.children() : forTarget;
        var targetLineHeight = parseInt(forTarget.css('line-height')) ? parseInt(forTarget.css('line-height')) : 0,
            targetHeight = forTarget.height() ? forTarget.height() : 0;
        if(targetHeight > targetLineHeight || forTarget.length > 1){
          accoList.eq(i).find('> .acco-tit button').addClass('show-button');
        }else{
          accoList.eq(i).addClass('imp-view').find('> .acco-tit button').addClass('hide-button');
        }
      }
      if($(this).find('> .acco-cover > .acco-style').hasClass('none-event')) return ;

      var setOnList = _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box');
      for(var i=0, leng=setOnList.length; i<leng; ++i){
        if(setOnList.eq(i).find('> .acco-tit button').length < 1 && _this.find('.acco-cover.disabled').length < 1){
          setOnList.eq(i).addClass('on');
        }
      }
      _this.find('> .acco-cover > .bt-whole button').on('click',function(){
        if(!$(this).closest('.acco-cover').hasClass('on')){
          $(this).attr('aria-pressed', 'true');
        }else{
          $(this).attr('aria-pressed', 'false');
        }
        $(this).closest('.acco-cover').toggleClass('on');
      });
      _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box > .acco-tit button').on('click', function () {
        if(_this.find('> .acco-cover').hasClass('toggle')){
          $(this).closest('.acco-box').siblings().removeClass('on');
          $(this).closest('.acco-box').siblings().find('> .acco-tit button').attr('aria-pressed',false);
        }
        $(this).closest('.acco-box').toggleClass('on');
        if($(this).closest('.acco-box').hasClass('on')){
          $(this).attr('aria-pressed', 'true');
        }else{
          $(this).attr('aria-pressed', 'false');
        };
      });
    })
  },
  widget_accordion2: function(ta){
    var widget = ta ? $(ta).find('.widget-box.accordion2') : $('.widget-box.accordion2');
    $(widget).each(function(){
      var _this = $(this),
          box = _this.find('> .acco-style > .acco-box'),
          list = box.find('> .acco-list'),
          btn = list.find('> .acco-title button');
      for(var i=0,leng=list.length; i<leng;++i){
        setState(btn.eq(i), list.eq(i).hasClass('on'));
      }
      if($(this).find('> .acco-style').hasClass('none-event')) return;
      btn.on('click',function(){
        setState($(this), !$(this).closest('.acco-list').hasClass('on'));
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
    var widget = ta ? $(ta).find('.btn-switch input') : $('.btn-switch input');
    $(widget).each(function () {
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
      target = $(target);
      state = typeof state == 'boolean' ? state : target.closest('.btn-switch').hasClass('on');
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
  /*widget_draglist : function(ta){
    var widget = ta ? $(ta).find('.draglist') : $('.draglist');
    $(widget).each(function(){
      var _this = $(this);
      _this.find('.edit-bt').on('click',function(){
        init(_this);
      });
    });
    function init(ta){
      var posY = 0,
          gap = 0,
          container = ta,
          item_length = container.find('.drag-list li').length,
          pos_arr = [],
          target = null,
          set_list = [];
      container.find('.drag-list li')
        .on('touchstart', fn_dragstart)
        .on('touchmove', fn_dragmove)
        .on('touchend', fn_dragend);
      pos_arr = get_list_posY(container);
      container.find('.drag-list li').each(function(idx){
        set_list.push(idx);
      });
      container.find('.bt-updown').on('touchstart touchmove touchend',function(e){
        e.stopPropagation();
      });
      container.find('.drag-list .up-bt').on('click',fn_btup);
      container.find('.drag-list .down-bt').on('click',fn_btdown);
      container.find('.drag-list .toggle-bt').on('click',fn_btdel);
      container.find('.dimmed-list .toggle-bt').on('click',fn_btlive);
      function fn_dragstart(e){
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('on');
        target = $(this);
        var event = e.originalEvent.touches[0];
        posY = event.pageY;
        gap =  posY - $(this).offset().top;
        pos_arr = get_list_posY(container);
      }
      function fn_dragmove(e){
        e.preventDefault();
        var event = e.originalEvent.touches[0];
        posY = event.pageY - gap;
        $(this).css({
          top:posY
        });
        var current = current_item(pos_arr,posY);
        if(current == 'first'){
          container.find('.drag-list li:first').addClass('current').siblings('li').removeClass('current');
        }else if(current == 'last'){
          container.find('.drag-list li:last').addClass('current').siblings('li').removeClass('current');
        }else{
          container.find('.drag-list li:eq('+current+')').addClass('current').siblings('li').removeClass('current');
        }
      }
      function fn_dragend(e){
        e.preventDefault();
        $(this).removeClass('on');
        $(this).css({
          top:''
        });
        var current = current_item(pos_arr,posY);
        if(current == 'first'){
          container.find('.drag-list li:first').before(target);
        }else if(current == 'last'){
          container.find('.drag-list li:last').after(target);
        }else{
          container.find('.drag-list li:eq('+current+')').before(target);
        }
        container.find('.drag-list li').removeClass('current');
      }
      function fn_btup(){
        var prev_container = $(this).closest('li').prev();
        $(this).closest('li').insertBefore(prev_container);
        pos_arr = get_list_posY(container);
      }
      function fn_btdown(){
        var next_container = $(this).closest('li').next();
        $(this).closest('li').insertAfter(next_container);
        pos_arr = get_list_posY(container);
      }
      function fn_btdel(){
        var self_container = $(this).closest('li'),
            container = $(this).closest('.drag-list').next();
        $(this).find('span').text('보존');
        $(this).closest('li').off('touchstart touchend touchmove').appendTo(container);
        self_container.find('.toggle-bt').off('click').on('click',fn_btlive);
        pos_arr = get_list_posY(container);
      }
      function fn_btlive(){
        var self_container = $(this).closest('li'),
            container = $(this).closest('.dimmed-list').prev();
        $(this).find('span').text('삭제');
        $(this).closest('li')
          .on('touchstart', fn_dragstart)
          .on('touchmove', fn_dragmove)
          .on('touchend', fn_dragend)
          .appendTo(container);
        self_container.find('.up-bt').on('click',fn_btup);
        self_container.find('.down-bt').on('click',fn_btdown);
        self_container.find('.toggle-bt').off('click').on('click',fn_btdel);
      }
    }
    function current_item(pos_arr,posY){
      var current_count;
      for(var pos in pos_arr){
        if (posY < pos_arr[0]) {
          current_count = 'first';
          return current_count;
        } else if (posY > pos_arr[pos_arr.length - 1]) {
          current_count = 'last';
          return current_count;
        } else {
          if(pos_arr[pos] > posY){
            current_count = pos;
            return current_count;
          }
        }
      }
    }
    function get_list_posY(con_box) {
      var arr = [];
      con_box.find('.drag-list li').each(function (idx) {
        arr[idx] = $(this).offset().top;
      });
      return arr;
    }
  },*/
  widget_toggle: function(ta){
    var widget = ta ? $(ta).find('.btn-toggle') : $('.btn-toggle');
    $(widget).on('click', function(){
        var _this = $(this);
        $(this).closest('.toggle').find('.toggler').toggle('fast', function(){
            var isVisible = $(this).is(':visible');
            _this.attr('aria-pressed', (isVisible? 'true': 'false'));
        });
    });
  }
}
