$(document).on('ready', function () {
  skt_landing.widgets.widget_init();
});
/** 
 * 차트 관련 jQuery 확장 펑션
 * @class
 */
skt_landing.widgets = {
  /**
   * @summary 페이지 랜딩시 dom Attribute에 설정되어 요소에 대한 이벤트 function을 실행
   * @description
   * - 페이지 랜딩시 자동 활성화 처리됨
   * - skt_landing.widgets.widget_init()
   * @function
   * @param {Object} ta - selector
   * @example
   * .widget>widget_+"string"으로 정의되어 있는 함수자동 실행
  */
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
  /**
   * @summary ..widget-box.tube 의 ( radio, checkebox.. )등의 커스텀된 디자인 적용
   * @description
   * - {@link http://127.0.0.1:5500/html/templete/widget_tube.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_tube();
  */
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
  /**
   * @summary input value값 활성화시 'x'버튼에 대한 기능 정의
   * @description
   * - {@link http://127.0.0.1:5500/html/templete/component_list.html}
   * - {@link http://127.0.0.1:5500/html/templete/form.html}
   * @function
   * @example
   * skt_landing.widgets.widget_deltype();
  */
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
        if($this.hasClass('stop-bubble') == true){
           e.stopPropagation();    //@2019-03-12 stop-bubble 클래스 추가 ( 체크박스안에 삭제 버튼이 있는 경우 )
        }
        field.val('').focus();
        field.trigger('change');  //@19.03.25 input change 이벤트 전달
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
  /**
   * @summary .step-list li 요소의 on 클래스 여부에 따라 aria 상태 설정
   * @description
   * - {@link http://127.0.0.1:5500/html/templete/widget_step.html}
   * @function
   * @example
   * skt_landing.widgets.widget_step();
  */
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
  /**
   * @summary .radiobox :radio요소에 대한 이벤트 바인딩
   * @description
   * - {@link http://127.0.0.1:5500/html/templete/widget_radio.html}
   * - {@link http://127.0.0.1:5500/html/templete/component_list.html}
   * - {@link http://127.0.0.1:5500/html/templete/input.html}
   * @function
   * @param {object} ta - selector
   * @example
   * skt_landing.widgets.widget_radio();
  */  
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
  /**
   * @summary .checkbox :checkbox요소 대한 이벤트 바인딩
   * @description
   * - {@link http://127.0.0.1:5500/html/templete/widget_checkbox.html}
   * - {@link http://127.0.0.1:5500/html/templete/component_list.html}
   * - {@link http://127.0.0.1:5500/html/templete/input.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_check();
  */
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
  /**
   * @description
   * - autosms/js/widget.js파일에서 복사해옴 @190320 - 함수복사
   * - http://127.0.0.1:5500/html/templete/slider01.html
   * @function
   * @example
   * skt_landing.widgets.widget_slider();
  */
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
  /**
   * @summary .slider3 클래스에 대한 slick.js 적용 함수
   * @description
   * - autosms/js/widget.js파일에서 복사해옴 @190320 - 함수복사
   * - http://127.0.0.1:5500/html/templete/slider01.html
   * @function
   * @example
   * skt_landing.widgets.widget_slider3();
  */
  widget_slider3: function () {
    var widget = '.slider3';
    $(widget).each(function(){
      var _this = $(this).find('.slider');
      _this.slick({
        arrows: true,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        centerMode: false,
        focusOnSelect: true,
        focusOnChange: true
      })
    });
  },
  
  /**
   * @summary .slider4 클래스에 대한 slick.js 적용 함수
   * @description
   * - autosms/js/widget.js파일에서 복사해옴 @190320 - 함수복사
   * - slick.init, slick.beforeChange 이벤트 바인딩 되어 있슴
   * - {@link http://127.0.0.1:5500/html/templete/slider01.html}
   * @function
   * @example
   * skt_landing.widgets.widget_slider4();
  */
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
  /**
   * @summary .slider5 클래스에 대한 slick.js 적용 함수
   * @description
   * - autosms/js/widget.js파일에서 복사해옴 @190320 - 함수복사
   * - slick.init, slick.beforeChange 이벤트 바인딩 되어 있슴
   * - {@link http://127.0.0.1:5500/html/templete/slider01.html}
   * @function
   * @example
   * skt_landing.widgets.widget_slider5();
  */
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
  /**
   * @summary .draglist 클래스에 대한 함수
   * @description
   * - autosms/js/widget.js파일에서 복사해옴 @190320 - 함수복사
   * @function
   * @example
   * skt_landing.widgets.widget_draglist();
  */
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
  /**
   * @summary 파일 찾기
   * @description
   * - .widget-box.file 클래스에 대한 함수
   * - {@link http://127.0.0.1:5500/html/templete/form.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_file();
  */
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
  /**
   * @summary - 제목과 내용이 같이있는 텍스트폼 (focus시 디자인 적용)
   * @description
   * - .txfield-combined 클래스에 대한 이벤트 함수
   * - {@link http://127.0.0.1:5500/html/templete/form.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_tfCombined();
  */
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
  /**
   * @summary slick.afterChange, slick.setPosition 이벤트 활성화시 aria 속성 적용 ( slick 관련 )
   * @description
   * - global
   * @function
   * @param {Object} $slick - slick Object
   * @example
   * skt_landing.widgets.widget_accessability();
  */
  widget_accessability: function ($slick) {
    var _this = $slick;
    _this.on('afterChange', function (e, _slick) {
      if(!_slick.$dots) return;      
      var $dots = _slick.$dots.find('span');        
      $dots.each(function (idx, key) {
        $(this).attr({
          'role': 'tab',
          'aria-label': (idx + 1) + ' of ' + $dots.length,
          'aria-selected': 'false'
        });
      }).eq(_slick.currentSlide).attr({
        'aria-selected': 'true'
      });
    }).on('setPosition', function (e, _slick) {
      if(!_slick.$dots) return;
      var $dots = _slick.$dots.find('span');
      $dots.each(function (idx, key) {
        $(this).attr({
          'role': 'tab',
          'aria-label': (idx + 1) + ' of ' + $dots.length,
          'aria-selected': 'false',
          'id': 'slick-slide-control' + _slick.instanceUid + idx,
          'aria-controls': 'slick-slide' + _slick.instanceUid + idx
        });
      }).eq(_slick.currentSlide).attr({
        'aria-selected': 'true'
      });
    });
  },
  /**
   * @summary .slider1 클래스에 대한 slick, slick.beforeChange 이벤트 바인딩
   * @description
   * - .slider1-auto 클래스: 자동배너 추가 활성화
   * - {@link http://127.0.0.1:5500/html/templete/slider01.html}
   * - span > a 태그 변경시 slider01.html 내의 주석 참조 - @190417 접근성 대비 테스트
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_slider1();
  */
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
            return $('<button/>').text(i + 1);//@190418 - 접근성
          }
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
            return $('<button/>').text(i + 1);//@190418 - 접근성
          }
        });
      }
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
      
      skt_landing.widgets.widget_accessability(_this);  //@190315 - 접근성 aria
    });
  },
  /**
   * @summary 세로 슬라이더
   * @description
   * - 기존 바인딩 되어 있는 slick 요소를 destroy 후 재바인딩
   * - {@link http://127.0.0.1:5500/html/sprint/HO_01_01.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_slider2();
  */
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
      //skt_landing.widgets.widget_accessability(_this);  //@190315 - 접근성 aria
    });
  },
    /**
     * @summary .slider7 클래스에 대한 slick, slick.beforeChange 이벤트 바인딩
     * @description
     * - {@link http://127.0.0.1:5500/html/sprint/HO_01_01.html}
     * - span > a 태그 변경시 slider01.html 내의 주석 참조 - @190417 접근성 대비 테스트
     * @function
     * @param {Object} ta - selector
     * @example
     * skt_landing.widgets.widget_slider7();
     */
    widget_slider7: function (ta) {
        var widget = ta ? $(ta).find('.slider7') : $('.slider7');
        $(widget).each(function(){
            var $parent = $(this).closest('.section-box'),
                $card = $parent.find('.tod-mls-card'),
                actionTop = $parent.offset().top - ($parent.height() / 1.2),
                time = 2000;

            $(window).on('scroll', function () {
              if ($(this).scrollTop() > actionTop && $parent.data('action') === undefined) {
                $parent.data('action', true);
                $card.eq(0).fadeOut(time);
                $card.eq(1).fadeIn(time, function () {
                  // 슬라이더 설정
                  $card.eq(2).show();
                  $('.tod-mls-slider.slider').slick({
                      dots: true,
                      infinite: true,
                      speed: 300,
                      slidesToShow: 1,
                      adaptiveHeight: true
                  });
                  $card.eq(2).hide();
                  $card.eq(1).stop(true, true).fadeOut(time);
                  $card.eq(2).stop(true, true).fadeIn(time);

                  $('.tod-mls-ft > div').eq(0).fadeOut(time);
                  $('.tod-mls-ft > div').eq(1).fadeIn(time);
                });
              }
            });
        });
    },  
  /**
   * @summary 아코디언
   * @description
   * - .widget-box.accordion 클래스에 대한 이벤트 바인딩 함수
   * - {@link http://127.0.0.1:5500/html/templete/accordion.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_accordion();
  */
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
      //_this.find('.acco-cover.on .bt-whole button, .acco-box.on button').attr('aria-pressed', true);  //@0417 웹접근성 수정 ( 개발자체 소스 적용중 )
    })
  },
  /**
   * @summary - 아코디언 ( 컨텐츠 )
   * @description
   * - .widget-box.accordion2 클래스에 대한 이벤트 바인딩 함수
   * - 아코디언 type2
   * - {@link http://127.0.0.1:5500/html/templete/accordion2.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_accordion2();
  */
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
  /**
   * @summary - 스위치 ( checkbox )
   * @description
   * - .switch .btn-switch input 클래스에 대한 이벤트 바인딩 함수
   * - {@link http://127.0.0.1:5500/html/templete/component_etc.html} 
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_switch();
  */
  widget_switch: function (ta) {
    var widget = ta ? $(ta).find('.switch .btn-switch input') : $('.switch .btn-switch input');
    console.log(widget)
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
  /**
   * @summary - 스위치 ( radio )
   * @description
   * - .switch2 .btn-switch input 클래스에 대한 이벤트 바인딩 함수
   * - GB/MB 부분
   * - {@link http://127.0.0.1:5500/html/templete/component_etc.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_switch2();
  */
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
  /**
   * @summary - 토글
   * @description
   * - .bt-toggle 클래스에 대한 이벤트 바인딩 함수
   * - {@link http://127.0.0.1:5500/html/templete/toggle.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_toggle();
  */
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
  /**
   * @summary 탭 기능
   * @description
   * - .tabs .tab-area 클래스에 대한 이벤트 바인딩 함수
   * - {@link http://127.0.0.1:5500/html/templete/component_tabs.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.component_tabs();
  */
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
  /**
   * @summary .toggle01 클래스에 대한 이벤트 바인딩 함수
   * @description
   * - {@link 127.0.0.1:5500/html/templete/toggle02.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_toggle01();
  */
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
  /**
   * @summary .toggle02 클래스에 대한 이벤트 바인딩 함수
   * @description
   * - {@link 127.0.0.1:5500/html/templete/toggle01.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_toggle02();
  */
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
  /**
   * @summary 가로 스크롤 생성
   * @description
   * - .horizontal 클래스에 대한 이벤트 바인딩 함수
   * - {@link http://127.0.0.1:5500/html/templete/widget_horizontal.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_horizontal();
  */
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
  /**
   * @summary .widget-box.donutchart 클래스에 대한 이벤트 바인딩 함수
   * @description
   * - {@link http://127.0.0.1:5500/html/templete/widget_donutchart.html}
   * - {@link http://127.0.0.1:5500/html/templete/chart-js.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_donutchart();
  */
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
