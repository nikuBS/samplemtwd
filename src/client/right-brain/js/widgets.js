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
      widget_list[com_name]();
    }
  },
  widget_test: function () {
  },
  widget_tube: function () {
    $('.widget .tube').each(function(){
      var tube_list = $(this).find('.tube-list');
      if(!tube_list.attr('class').match(' ')){
        tube_list.addClass('five');
      }
      var tube_li = tube_list.find('li');
      if(tube_li.outerWidth() * tube_li.length <= tube_list.outerWidth()){
        tube_li.first().addClass('first');
        tube_li.last().addClass('last');
      }

      var _this = $(this);
      /*if(_this.find('li.checked').length < 1){
        setRadioState(_this.find('input').eq(0));
      }*/
      _this.find('input').on('change',function(){
        setRadioState($(this));
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
  },
  widget_radio: function () {
    var input = $('.radiobox :radio');
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
  widget_check: function () {
    var input = $('.checkbox :checkbox');
    input.each(function () {
      var box = $(this).closest('.checkbox');
      $(this).is(':checked') ? box.addClass('checked').attr('aria-checked',true) : box.removeClass('checked').attr('aria-checked',false);
      $(this).is(':disabled') ? box.addClass('disabled').attr('aria-disabled',true) : box.removeClass('disabled').attr('aria-checked',false);
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
  widget_slider3: function () {
    var widget = '.slider3';
    $(widget).each(function(){
      var _this = $(this).find('.slider');
      _this.slick({
        arrows: true,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        centerMode: false,
        focusOnSelect: true,
        focusOnChange: true
      })
    });
  },
  widget_slider4: function () {
    var widget = '.slider4';
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
  widget_slider5: function () {
    var widget = '.slider5';
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
  widget_accordion: function () {
    $('.accordion').each(function(){
      var _this = $(this);
      if(_this.find('> .acco-cover > .bt-whole').length < 1){
        _this.find('.acco-cover').addClass('on');
      }
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
        if($(this).attr('aria-pressed', 'false')){
          $(this).attr('aria-pressed', 'true')
        }else{
          $(this).attr('aria-pressed', 'false')
        };
      });
    })
  },
  widget_accordion2: function(){
    $('.accordion2').each(function(){
      var _this = $(this),
          box = _this.find('> .acco-style > .acco-box'),
          list = box.find('> .acco-list'),
          btn = list.find('> .acco-title button');
      for(var i=0,leng=list.length; i<leng;++i){
        setState(btn.eq(i), list.eq(i).hasClass('on'));
      }
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
  widget_switch: function () {
    $('.btn-switch input').each(function () {
      checkSwitch(this, !$(this).closest('.btn-switch').hasClass('on'));
      $(this).on('change', function () {
        checkSwitch(this);
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
        target.closest('.btn-switch').removeClass('on').attr('aria-checked',false);
        target.attr('checked',false);
      } else {
        target.closest('.btn-switch').addClass('on').attr('aria-checked',true);
        target.attr('checked',true);
      }
    }
  },
  widget_draglist : function(){
    $('.draglist').each(function(){
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
  },
  widget_sortlist : function(){
    $( "#sortable-enabled" ).sortable({
      connectWith: "#sortable-enabled",
      axis: 'y'
    }).disableSelection();
    $('.ui-state-default .bt-active').on('touchstart touchend touchmove',function(e){
      e.stopPropagation();
    });
    $(document).on('click', '.connectedSortable .bt-active', function(){
      if($(this).closest('.connectedSortable').hasClass('enabled')){
        $(this).parent().appendTo('#sortable-disabled');
        $(this).find('.blind').text('회선 활성화 하기');
      }else{
        $(this).parent().prependTo('#sortable-enabled');
        $(this).find('.blind').text('회선 삭제 하기');
      }
    });
    $('.bt-sort').on('touchstart touchend touchmove',function(e){
      e.stopPropagation();
    });
    $(document).on('click', '.connectedSortable .bt-sort', function(){
      var parent_cont = $(this).closest('.ui-state-default');
      if($(this).hasClass('up')){
        parent_cont.insertBefore(parent_cont.prev());
      }else{
        parent_cont.insertAfter(parent_cont.next());
      }
    });
  },
    widget_toggle: function () {
        $('.btn-toggle').on('click', function () {
            var _this = $(this);
            $(this).closest('.toggle').find('.toggler').toggle('fast', function () {
                var isVisible = $(this).is(':visible');
                _this.attr('aria-pressed', (isVisible ? 'true' : 'false'));
            });
        });
    }
}
