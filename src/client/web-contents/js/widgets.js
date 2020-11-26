﻿/* jshint ignore:start */
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
  widget_init: function (ta) { // string : selector
    /* 위젯 구간 */
    widget_list = {};
    var widget_ta = ta ? $(ta + ' .widget') : $('.widget');
    widget_ta.each(function (idx) {
      var com = $.trim($(this).find('>.widget-box').attr('class').replace(/widget-box /, ''));
      widget_list['widget_' + com] = skt_landing.widgets['widget_' + com];
    });
    for (var com_name in widget_list) {
      try {
        widget_list[com_name](widget_ta);
      }
      catch (err) {
        console.log('error : ' + com_name); // .widget > .widget-box 구조를 절대적 .widget-box에는 정해진 clsss명만 올수있음
      }
    }
    skt_landing.widgets.widget_deltype();

    /* 컴포넌트 실행 */
    component_list = {};
    var component_ta = ta ? $(ta + ' .component') : $('.component');
    component_ta.each(function (idx) {
      var com = $.trim($(this).find('.component-box').attr('class').replace(/component-box /, ''));
      component_list['component_' + com] = skt_landing.widgets['component_' + com];
    });
    for (var com_name in component_list) {
      try {
        component_list[com_name](component_ta);
      }
      catch (err) {
        console.log('error : ' + com_name); // .widget > .widget-box 구조를 절대적 .widget-box에는 정해진 clsss명만 올수있음
      }
    }

    skt_landing.widgets.widget_headerBorder(); // 190625 [OP002-403] 추가
  },
  /**
   * @summary data-header-noborder=true가 있는 경우 header의 하단 보더라인 제거. 헤더와 탭이 연속해서 있을 경우 사용.
   * @description
   * - {@link http://coding.tworld.co.kr:8088/html/sprint/CS_02_01_case1.html}
   * @function
   * @example
   * skt_landing.widgets.widget_headerBorder();
   */
  widget_headerBorder: function () {
    $('[data-header-noborder=true]').length === 1 && $('.h-belt').addClass('noborder');
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
    $(widget).each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var tube_box = $(this).find('.tube-list'),
          tube_list = tube_box.find('> li');
      var listClass = ['one', 'two', 'three', 'four', 'five'],
          classValue = null,
          classNum = 0;
      for (var i = 0, leng = listClass.length; i < leng; ++i) {
        if (tube_box.attr('class').indexOf(listClass[i]) > 0) {
          classValue = listClass[i];
          classNum = i + 1;
          break;
        }
      }
      if (!tube_list.hasClass('refil-tube')) {
        if (typeof classValue != 'string') {
          tube_box.addClass('five');
          classValue = 'five';
          classNum = 5;
        }
        tube_list.first().addClass('top-left');
        tube_list.last().addClass('bottom-right');
        tube_list.eq(tube_list.length < classNum ? tube_list.length - 1 : classNum - 1).addClass('top-right');
        tube_list.filter(function (index) {
          var val = 0;
          if (tube_list.length == classNum) {
            val = 0;
          }
          else if (tube_list.length > classNum && tube_list.length % classNum == 0) {
            val = parseInt(tube_list.length / classNum) * classNum - classNum;
          }
          else {
            val = parseInt(tube_list.length / classNum) * classNum;
          }
          return index === val;
        }).addClass('bottom-left');

      }

      var _this = $(this);
      if (_this.find('input:checked').length > 0) {
        setRadioState(_this.find('input:checked').last());
      }
      _this.find('input').on('change', function () {
        setRadioState($(this));
      }).on('focusin', function () {
        $(this).closest('li').addClass('focus');
      }).on('focusout', function () {
        $(this).closest('li').removeClass('focus');
      });
      _this.find('li').on('click', function (e) {
        if (e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return;
        $(this).find('input').trigger('change');
      });
    });

    function setRadioState(target) {
      var target = $(target),
          label = target.closest('li').not('.disabled');

      if (target.closest('li').hasClass('disabled')) return;
      if (target.closest('li').attr('role') === undefined) {
        label.siblings().removeClass('checked');
        label.siblings().find('input').attr('checked', false).prop('checked', false);
        label.addClass('checked');
        target.attr('checked', true).prop('checked', true);
      } else {
        target.closest('li').siblings('.disabled').attr('aria-disabled', true);
        label.siblings().removeClass('checked').attr('aria-checked', false);
        label.siblings().find('input').attr('checked', false).prop('checked', false);
        label.addClass('checked').attr('aria-checked', true);
        target.attr('checked', true).prop('checked', true);
      }
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
  widget_deltype: function () {
    $('.input').each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var bt = $(this).find('.cancel'),
          field = bt.prev();
      if (field.val() == '' || field.attr('readonly')) {
        bt.hide();
      } else {
        bt.show();
      }
      bt.on('click', function (e) {//@텍스트 삭제 버튼 수정
        var $this = $(this);
        if ($this.hasClass('stop-bubble') == true) {
          e.stopPropagation();    //@2019-03-12 stop-bubble 클래스 추가 ( 체크박스안에 삭제 버튼이 있는 경우 )
        }
        field.val('').focus();
        field.trigger('change');  //@19.03.25 input change 이벤트 전달
        bt.hide();
      });
      field.on('change keyup', function () {
        if ($(this).val() == '') {
          bt.hide();
        } else {
          bt.show();
        }
      });
      if (field.hasClass('text-auto-expand')) {
        field.on('input.text-auto-expand', function () {
          $(this).css('height', 'inherit');
          var scroll_height = $(this).get(0).scrollHeight;
          $(this).css('height', scroll_height + 'px');
        });
        if (field.is('[maxlength]')) {
          // if (!('maxLength' in field)) { // support browser check
          var maxLength = field.attr('maxlength');
          field.on('keyup', function () {
            var str_length = $(this).val().length;
            if (str_length > maxLength) {
              $(this).val($(this).val().substr(0, maxLength));
              $(this).trigger('input.text-auto-expand');
              return false;
            }
          });
          // }
        }
        bt.on('click', function () {
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
    $('.step-list li').each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      if (!$(this).hasClass('on')) {
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
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var box = $(this).closest('.radiobox'),
          attrRole = box.attr('role');	// 190626 - 라디오 버튼 기능 개선
      if ($(this).closest('.radio-slide').length > 0) {
        var radioSlide = $(this).closest('.radio-slide'),
            radioItems = radioSlide.find('.radiobox'),
            itemsW = 0;
        for (var i = 0, leng = radioItems.length; i < leng; ++i) {
          itemsW += radioItems.eq(i).outerWidth(true);
        }
        radioSlide.find('.select-list').css('width', itemsW + 1);
      }

      // 190626 - 라디오 버튼 기능 개선 START
      if (attrRole === 'radio') {
        $(this).is(':checked') ? box.addClass('checked').attr('aria-checked', true) : box.removeClass('checked').attr('aria-checked', false);
        $(this).is(':disabled') ? box.addClass('disabled').attr('aria-disabled', true) : box.removeClass('disabled');
      } else {
        $(this).is(':checked') ? box.addClass('checked') : box.removeClass('checked');
        $(this).is(':disabled') ? box.addClass('disabled') : box.removeClass('disabled');
      }
      // 190626 - 라디오 버튼 기능 개선 END

      $(this).on('change', function () {
        if ($(this).prop('disabled')) return;
        var nameGroup = $('[name=' + $(this).attr('name') + ']').not(this);
        attrRole === 'radio' ? nameGroup.closest('li').removeClass('checked').attr('aria-checked', false) : nameGroup.closest('li').removeClass('checked'); // 190626 - 라디오 버튼 기능 개선
        nameGroup.attr('checked', false).prop('checked', false);
        attrRole === 'radio' ? $(this).closest('li').addClass('checked').attr('aria-checked', true) : $(this).closest('li').addClass('checked'); // 190626 - 라디오 버튼 기능 개선
        $(this).attr('checked', 'checked').prop('checked', true);
      }).on('focusin', function () {
        box.addClass('focus');
      }).on('focusout', function () {
        box.removeClass('focus');
      });

      box.on('click', function (e) {
        if (e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return;
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
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var box = $(this).closest('.checkbox'),
          attrRole = box.attr('role');	// 190626 - 체크박스 기능 개선
      // 190626 - 체크박스 기능 개선 START
      if (attrRole === 'checkbox') {
        $(this).is(':checked') ? box.addClass('checked').attr('aria-checked', true) : box.removeClass('checked').attr('aria-checked', false);
        $(this).is(':disabled') ? box.addClass('disabled').attr('aria-disabled', true) : box.removeClass('disabled');
      } else {
        $(this).is(':checked') ? box.addClass('checked') : box.removeClass('checked');
        $(this).is(':disabled') ? box.addClass('disabled') : box.removeClass('disabled');
      }
      // 190626 - 체크박스 기능 개선 END
      $(this).on('click', function () {
        if ($(this).prop('checked')) {
          attrRole === 'checkbox' ? box.addClass('checked').attr('aria-checked', true) : box.addClass('checked'); // 190626 - 체크박스 기능 개선
          $(this).attr('checked', true);
        } else {
          attrRole === 'checkbox' ? box.removeClass('checked').attr('aria-checked', false) : box.removeClass('checked'); // 190626 - 체크박스 기능 개선
          $(this).attr('checked', false);
        }
      }).on('focusin', function () {
        box.addClass('focus');
      }).on('focusout', function () {
        box.removeClass('focus');
      });
      box.on('click', function (e) {
        if (e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return;
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
    $(widget).each(function () {
      var _this = $(this).find('.slider');
      _this.slick({
        arrows: true,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        centerMode: false,
        initialSlide: _this.data('initialslide')||0, // 191230 SKT 요청으로 추가
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
    $(widget).each(function () {
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
        initialSlide: _this.data('initialslide')||0, // 191230 SKT 요청으로 추가
        responsive: [{
          settings: {
            centerPadding: 0
          }
        }]
      });
      _this.on('init', function () {
        var totalBox = $(this).closest(widget).find('.page-total'),
            slick = _this.prop('slick');
        totalBox.find('.current').text(slick.currentSlide + 1);
        totalBox.find('.total').text(slick.slideCount);
      })
          .trigger('init')
          .on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            var totalBox = $(this).closest(widget).find('.page-total');
            totalBox.find('.current').text(nextSlide + 1);
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
    $(widget).each(function () {
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
        initialSlide: _this.data('initialslide')||0, // 191230 SKT 요청으로 추가
        responsive: [{
          settings: {
            centerPadding: 0
          }
        }]
      });
      _this.on('init', function () {
        var totalBox = $(this).closest(widget).find('.page-total'),
            slick = _this.prop('slick');
        totalBox.find('.current').text(slick.currentSlide + 1);
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
          .on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            var totalBox = $(this).closest(widget).find('.page-total');
            totalBox.find('.current').text(nextSlide + 1);
            totalBox.find('.total').text(slick.slideCount);
          });
    });
  },
  /**
   * @summary .slider6 클래스에 대한 slick.js 적용 함수
   * @description
   * - autosms/js/widget.js파일에서 복사해옴 @190320 - 함수복사
   * - slick.init, slick.beforeChange 이벤트 바인딩 되어 있슴
   * - {@link http://127.0.0.1:5500/html/templete/slider01.html}
   * @function
   * @example
   * skt_landing.widgets.widget_slider6();
   */
  widget_slider6: function () {
    var widget = '.slider6';
    $(widget).each(function () {
        var _this = $(this).find('.slider');
        _this.slick({
            dots: true,
            arrows: false,
            infinite: false,
            slidesToShow: 1,
            centerMode: true,
            centerPadding: '19px',
            variableWidth: false,
            focusOnSelect: true,
            focusOnChange: true,
            initialSlide: _this.data('initialslide')||0, // 191230 SKT 요청으로 추가
            responsive: [{
                settings: {
                    centerPadding: '15px'
                }
            }]
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
   * @summary .draglist 클래스에 대한 함수
   * @description
   * - autosms/js/widget.js파일에서 복사해옴 @190320 - 함수복사
   * @function
   * @example
   * skt_landing.widgets.widget_draglist();
   */
  widget_draglist: function () {
    $('.draglist').each(function () {
      var _this = $(this);
      _this.find('.edit-bt').on('click', function () {
        init(_this);
      });
    });

    function init(ta) {
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
      container.find('.drag-list li').each(function (idx) {
        set_list.push(idx);
      });
      container.find('.bt-updown').on('touchstart touchmove touchend', function (e) {
        e.stopPropagation();
      });
      container.find('.drag-list .up-bt').on('click', fn_btup);
      container.find('.drag-list .down-bt').on('click', fn_btdown);
      container.find('.drag-list .toggle-bt').on('click', fn_btdel);
      container.find('.dimmed-list .toggle-bt').on('click', fn_btlive);

      function fn_dragstart(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('on');
        target = $(this);
        var event = e.originalEvent.touches[0];
        posY = event.pageY;
        gap = posY - $(this).offset().top;
        pos_arr = get_list_posY(container);
      }

      function fn_dragmove(e) {
        e.preventDefault();
        var event = e.originalEvent.touches[0];
        posY = event.pageY - gap;
        $(this).css({
          top: posY
        });
        var current = current_item(pos_arr, posY);
        if (current == 'first') {
          container.find('.drag-list li:first').addClass('current').siblings('li').removeClass('current');
        } else if (current == 'last') {
          container.find('.drag-list li:last').addClass('current').siblings('li').removeClass('current');
        } else {
          container.find('.drag-list li:eq(' + current + ')').addClass('current').siblings('li').removeClass('current');
        }
      }

      function fn_dragend(e) {
        e.preventDefault();
        $(this).removeClass('on');
        $(this).css({
          top: ''
        });
        var current = current_item(pos_arr, posY);
        if (current == 'first') {
          container.find('.drag-list li:first').before(target);
        } else if (current == 'last') {
          container.find('.drag-list li:last').after(target);
        } else {
          container.find('.drag-list li:eq(' + current + ')').before(target);
        }
        container.find('.drag-list li').removeClass('current');
      }

      function fn_btup() {
        var prev_container = $(this).closest('li').prev();
        $(this).closest('li').insertBefore(prev_container);
        pos_arr = get_list_posY(container);
      }

      function fn_btdown() {
        var next_container = $(this).closest('li').next();
        $(this).closest('li').insertAfter(next_container);
        pos_arr = get_list_posY(container);
      }

      function fn_btdel() {
        var self_container = $(this).closest('li'),
            container = $(this).closest('.drag-list').next();
        $(this).find('span').text('보존');
        $(this).closest('li').off('touchstart touchend touchmove').appendTo(container);
        self_container.find('.toggle-bt').off('click').on('click', fn_btlive);
        pos_arr = get_list_posY(container);
      }

      function fn_btlive() {
        var self_container = $(this).closest('li'),
            container = $(this).closest('.dimmed-list').prev();
        $(this).find('span').text('삭제');
        $(this).closest('li')
            .on('touchstart', fn_dragstart)
            .on('touchmove', fn_dragmove)
            .on('touchend', fn_dragend)
            .appendTo(container);
        self_container.find('.up-bt').on('click', fn_btup);
        self_container.find('.down-bt').on('click', fn_btdown);
        self_container.find('.toggle-bt').off('click').on('click', fn_btdel);
      }
    }

    function current_item(pos_arr, posY) {
      var current_count;
      for (var pos in pos_arr) {
        if (posY < pos_arr[0]) {
          current_count = 'first';
          return current_count;
        } else if (posY > pos_arr[pos_arr.length - 1]) {
          current_count = 'last';
          return current_count;
        } else {
          if (pos_arr[pos] > posY) {
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
  widget_file: function (ta) {
    var input = ta ? $(ta).find('.widget-box.file') : $('.widget-box.file'), filebox; // 191217 [OP002-5134] 수정
    input.each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var file = $(this).find('.file'),
          vfile = $(this).find('.fileview');
      if (vfile) {
        file.on('change', function () {
          // 191217 [OP002-5134] START
          filebox = $(this).val().split('\\');
          vfile.val(filebox[filebox.length - 1]);
          // 191217 [OP002-5134] END
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

    box.each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var _this = $(this);
      var count = 0;
      _this.find('.input-focus').on('focus', function (e) {
        count++;
        _this.addClass('focus');
        if (count > 0) {
          _this.find('.inner-tx').addClass('once');
        }
      }).on('blur', function () {
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
      if (!_slick.$dots) return;
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
      if (!_slick.$dots) return;
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
    $(widget).each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      if ($(this).find('.slider > *').length == 1) {
        return;
      }
      if ($(this).find('.slick-initialized').length > 0) {
        $(this).find('.slider').slick('destroy');
      }
      var _this = $(this).find('.slider');
      if ($(this).data('slider-auto')) {    //@DV001-16538 // 190610_수정 : Slide Auto 기능 클래스에서 attr로 변경
        $(this).addClass('slider1-auto'); // 190610_추가
        _this.slick({
          autoplay: true,
          autoplaySpeed: 4000,
          dots: true,
          arrows: true,
          infinite: true,
          speed: 300,
          // useTransform : false,
          // mobileFirst : true,
          // useCSS : false,
          // useTransform : false,
          lazyLoad: 'progressive', // 190626_수정 : iOS에서 높이값 비정상적으로 계산되어 변경
          centerMode: false,
          focusOnSelect: false,
          touchMove: true,
          initialSlide: _this.data('initialslide')||0, // 191230 SKT 요청으로 추가
          customPaging: function (slider, i) {
            return $('<button/>').text(i + 1);//@190418 - 접근성
          }
        });

        // 190603 - 자동롤링 시 Play/Stop 버튼 기능 제공 START
        _this.after($('<button type="button" class="tod-bann-btn stop"><span class="blind">일시정지</span></button>'));
        _this.next('button.tod-bann-btn').on('click', function () {
          _this.slick($(this).hasClass('stop') ? 'slickPause' : 'slickPlay');
          $(this).find('.blind').html($(this).hasClass('stop') ? '재생' : '일시정지');
          $(this).toggleClass('stop', !$(this).hasClass('stop'));
        });
        // 190603 - 자동롤링 시 Play/Stop 버튼 기능 제공 END
      } else {
        _this.slick({
          dots: true,
          arrows: true,
          infinite: false,
          speed: 300,
          // useTransform : false,
          // mobileFirst : true,
          // useCSS : false,
          // useTransform : false,
          lazyLoad: 'progressive', // 190626_수정 : iOS에서 높이값 비정상적으로 계산되어 변경
          centerMode: false,
          focusOnSelect: false,
          touchMove: true,
          initialSlide: _this.data('initialslide')||0, // 191230 SKT 요청으로 추가
          customPaging: function (slider, i) {
            return $('<button/>').text(i + 1);//@190418 - 접근성
          }
        });
      }
      if (_this.find('.slick-slide').length == 1) {
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
    $(widget).each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      if ($(this).find('.slick-initialized').length > 0) {
        $(this).find('.slider').slick('destroy');
      }
      var _this = $(this).find('.slider');
      _this.slick({
        dots: false,
        arrows: false,
        infinite: true,
        speed: 700,
        centerMode: false,
        focusOnSelect: false,
        draggable: false,
        touchMove: false,
        swipe: false,
        vertical: true,
        verticalSwiping: true,
        initialSlide: _this.data('initialslide')||0, // 191230 SKT 요청으로 추가
        autoplay: true,
        autoplaySpeed: 5000
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
    $(widget).each(function () {
      var $parent = $(this).closest('.section-box'),
          $card = $parent.find('.tod-mls-card'),
          actionTop = $parent.offset().top - ($parent.height() / 1.2),
          time = 2000;

      $(window).on('scroll', function () {
        if ($(this).scrollTop() > actionTop && $parent.data('action') === undefined) {
          $parent.data('action', true);
          $card.eq(1).show();
          $('.tod-mls-slider.slider').slick({
            dots: true,
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            adaptiveHeight: true
          });
          $card.eq(1).hide();

          $card.eq(0).fadeOut(time);
          $card.eq(1).fadeIn(time);

          $('.tod-mls-ft > div').eq(0).fadeOut(time);
          $('.tod-mls-ft > div').eq(1).fadeIn(time);
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
    $(widget).each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var _this = $(this);
      if (_this.find('> .acco-cover > .bt-whole').length < 1) {
        _this.find('.acco-cover').addClass('on');
      }
      var accoList = _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box');
      var accoList_leng = accoList.length;
      if ($(this).find('> .acco-cover > .acco-style').hasClass('none-event')) return; // 이벤트를 적용하지 않을 경우

      var setOnList = _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box');
      for (var i = 0, leng = setOnList.length; i < leng; ++i) {
        if (setOnList.eq(i).find('> .acco-tit button').length < 1 && _this.find('.acco-cover.disabled').length < 1) {
          // 열고닫는 버튼이 없고 diabled 클래스도 없는 경우
          setOnList.eq(i).addClass('on');
        }
        if (setOnList.eq(i).find('> .acco-tit').length < 1 && setOnList.eq(i).find('> .acco-cont').length > 0) {
          // 제목이 없고 내용만 있는 경우
          setOnList.eq(i).addClass('imp-view');
        }
      }
      // _this.find('.acco-cover:not(".focuson")')/*.addClass('toggle')*/.find('.acco-box.on').removeClass('on');  // 2018-07-19 default : 모두 닫힘, toggle 여부에 따라 다름
      _this.find('> .acco-cover > .bt-whole button').on('click', function (event) {
        if (!$(this).closest('.acco-cover').hasClass('on')) {
          $(this).attr('aria-pressed', 'true');
          //$('.popup .popup-page.layer').animate({scrollTop:acco_top}, '200');
          event.stopPropagation();
        } else {
          $(this).attr('aria-pressed', 'false');
        }
        $(this).closest('.acco-cover').toggleClass('on');
      });
      _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box:not(".none-event") > .acco-tit button:not(".btn-tip,.close")').on('click', function (event) {  // 191121 [OP002-5134] 예외 클래스 추가

        if (_this.find('> .acco-cover').hasClass('toggle')) {
          $(this).closest('.acco-box').siblings().removeClass('on');
          $(this).closest('.acco-box').siblings().find('> .acco-tit button').attr('aria-pressed', false);
        }
        $(this).closest('.acco-box').toggleClass('on');

        if ($(this).closest('.acco-box').hasClass('on')) {
          $(this).attr('aria-pressed', 'true');
          event.stopPropagation();
        } else {
          $(this).attr('aria-pressed', 'false');
        }
        ;
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
  widget_accordion2: function (ta) {
    var widget = ta ? $(ta).find('.widget-box.accordion2') : $('.widget-box.accordion2');
    $(widget).each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var _this = $(this),
          box = _this.find('> .acco-style > .acco-box'),
          list = box.find('> .acco-list'),
          btn = list.find('> .acco-title button');
      for (var i = 0, leng = list.length; i < leng; ++i) {
        setState(btn.eq(i), list.eq(i).hasClass('on'));
      }
      box.on('click', '> .acco-list > .acco-title button', function () {
        if (!$(this).hasClass('none-event')) {
          setState($(this), !$(this).closest('.acco-list').hasClass('on'));
        }
      });

      function setState(button, state) {
        var button = $(button);
        if (state) {
          button.closest('.acco-list').addClass('on');
        } else {
          button.closest('.acco-list').removeClass('on');
        }
        if (box.hasClass('toggle') && state) {
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
    $(widget).each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      checkSwitch(this, !$(this).closest('.btn-switch').hasClass('on'));
      $(this).on('change', function () {
        checkSwitch(this);
      }).on('focusin', function () {
        $(this).closest('.btn-switch').addClass('focus');
      }).on('focusout', function () {
        $(this).closest('.btn-switch').removeClass('focus');
      });
      $(this).closest('.switch-style').on('click', function (e) {
        if (e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return;
        $(this).find('input').trigger('change');
      });
    });

    function checkSwitch(target, state) {
      var target = $(target),
          state = typeof state == 'boolean' ? state : target.closest('.btn-switch').hasClass('on'),
          roleType = target.closest('.switch-style').attr('role');

      if (target.attr('disabled')) {
        roleType && target.closest('.switch-style').attr('aria-disabled', true);
        target.closest('.btn-switch').addClass('disabled');
        return;
      } else {
        roleType && target.closest('.switch-style').attr('aria-disabled', false);
        target.closest('.btn-switch').removeClass('disabled');
      }
      if (state) {
        roleType && target.closest('.switch-style').attr('aria-checked', false);
        target.closest('.btn-switch').removeClass('on');
        target.attr('checked', false);
      } else {
        roleType && target.closest('.switch-style').attr('aria-checked', true);
        target.closest('.btn-switch').addClass('on');
        target.attr('checked', true);
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
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var box = $(this).closest('li');
      $(this).is(':checked') ? box.addClass('checked').attr('aria-checked', true) : box.removeClass('checked').attr('aria-checked', false);
      $(this).is(':disabled') ? box.addClass('disabled').attr('aria-disabled', true) : box.removeClass('disabled');
      $(this).on('change', function () {
        if ($(this).prop('disabled')) return;
        var nameGroup = $('[name=' + $(this).attr('name') + ']').not(this);
        nameGroup.closest('li').removeClass('checked').attr('aria-checked', false);
        nameGroup.attr('checked', false).prop('checked', false);
        $(this).closest('li').addClass('checked').attr('aria-checked', true);
        $(this).attr('checked', 'checked').prop('checked', true);
      }).on('focusin', function () {
        box.addClass('focus');
      }).on('focusout', function () {
        box.removeClass('focus');
      });

      box.on('click', function (e) {
        if (e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return;
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
  widget_toggle: function (ta) {
    var widget = ta ? $(ta).find('.bt-toggle') : $('.bt-toggle');
    widget.each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      $(this).on('click', function () {
        var _this = $(this);
        var toggler = _this.closest('.toggle').find('.toggler');
        // 200213 2020웹접근성 수정 START
		if (toggler.is(':hidden')) {
			toggler.slideDown().find('ul > li > button, a').eq(0).focus();
			_this.attr('aria-pressed', 'true').addClass('open').find('span.tod-blind').html('닫기');
		} else {
			toggler.slideUp();
			_this.attr('aria-pressed', 'false').removeClass('open').find('span.tod-blind').html('더보기');
		}
		// 200213 2020웹접근성 수정 END

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
      var _this = $(this),
          tabList = _this.find('.tab-linker'),
          tabCont = _this.find('.tab-contents');

      if ($(this).data('event') === undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      initLinkSlide(tabList);
      tabListOnChk();

      tabList.find('button:not(".tip-view"), a:not(".tip-view")').on('click', function () {
        if ($(this).hasClass('disabled')) { // .disabled시 비활성화
          return false;
        }
        $(this).attr('aria-selected', 'true').closest('li').attr('aria-selected', 'true').siblings().attr('aria-selected', 'false').find('button:not(".tip-view"), a:not(".tip-view")').attr('aria-selected', 'false'); // 190711 웹접근성 수정
        tabListOnChk();
        initLinkSlide(tabList);
      });

      function tabListOnChk() {
        var tabListIdx = tabList.find('li[aria-selected="true"]').index();
        if (tabListIdx != -1) {
          tabCont.children('ul').children('li').eq(tabListIdx).attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
        }
      }

      function initLinkSlide(tabList) {
        var items = tabList.find('li');
        var itemsW = parseInt(items.closest('ul').css('padding-left')) * 2;
        for (var i = 0, leng = items.length; i < leng; ++i) {
          itemsW += Math.ceil(items.eq(i).outerWidth(true));
        }
        if (skt_landing.util.win_info.get_winW() > itemsW) {
          items.closest('ul').css('width', '100%');
        } else {
          items.closest('ul').css('width', itemsW);
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
  widget_toggle01: function (ta) {
    var widget = ta ? $(ta).find('.toggle01') : $('.toggle01');
    $(widget).each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var _this = $(this);
      var _item = _this.find('> .representcharge-list > li');
      widget.on('click', '> .representcharge-list > li > .representcharge-info', function () {
        if ($(this).attr('aria-pressed') === 'true') {
          $(this).closest('li').removeClass('current');
          $(this).attr('aria-pressed', 'false');
        } else {
          $(this).closest('li').addClass('current');
          $(this).attr('aria-pressed', 'true');
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
  widget_toggle02: function (ta) {
    var widget = ta ? $(ta).find('.toggle02') : $('.toggle02');
    $(widget).each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var _this = $(this);
      var _list = _this.find('> .suggest-tag-list');
      var _btn = _this.find('.suggest-tag-morewrap button, .suggest-tag-morewrap a');
      var _ul = _this.find('ul:eq(0)');
      if (_list.height() >= _ul.height()) {
        _btn.remove();
      } else {
        widget.on('click', '> .suggest-tag-morewrap button, .suggest-tag-morewrap a', function () {
          if (_btn.attr('aria-pressed') === 'true') {
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
  widget_horizontal: function (ta) {
    var widget = $(ta).find('.horizontal');
    $(widget).each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var belt = $(this).find('.horizontal-list'),
          slide = $(this).find('.horizontal-slide'),
          items = belt.find('> li'),
          itemsW = 0;
      for (var i = 0; items.length > i; ++i) {
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
  widget_donutchart: function (ta) {
    var widget = ta ? $(ta).find('.widget-box.donutchart') : $('.widget-box.donutchart');
    $(widget).each(function () {
      if ($(this).data('event') == undefined) {
        $(this).data('event', 'bind')
      } else {
        return;
      }
      var time = 500,
          now = 0,
          interval = 10,
          max = 100,
          loop = 100,
          reverceTic = 1,
          _this = this;
      $(_this).find('.donut-chart .c100').each(function () {
        $(this)
        // .data('reverce', false)
            .data('now', 0)
            // .data('unit', (max - $(this).data('percent') + loop) / (time / interval)) // reverse operation
            .data('unit', ($(this).data('percent')) / (time / interval))
            .data('reverse', 0)
      })
      var t = setInterval(function () {
        $(_this).find('.donut-chart .c100').each(function () {
          if (!$(this).data('reverse')) {
            $(this).data('now', Math.ceil($(this).data('unit') * now / 10));
          } else {
            $(this).data('reverse', $(this).data('reverse') + 1)
            $(this).data('now', max - Math.floor($(this).data('unit') * $(this).data('reverse')));
          }
          $(this).attr('class', '').addClass('c100').addClass('p' + $(this).data('now'));
          if ($(this).data('now') >= max) { // reverse flag
            //$(this).data('now', max)
            //$(this).data('reverse', true) // reverse operation
          }
        })
        now += interval;
        if (now >= time) {
          $(_this).find('.donut-chart .c100').each(function () {
            $(this).attr('class', '').addClass('c100').addClass('p' + $(this).data('percent'));
          })
          clearInterval(t);
        }
      }, interval)
    });
  },
  /**
   * @summary .widget-box.chart 클래스에 대한 이벤트 바인딩 함수
   * @description
   * - {@link http://127.0.0.1:5500/html/templete/widget_donutchart.html}
   * - {@link http://127.0.0.1:5500/html/templete/chart-js.html}
   * @function
   * @param {Object} ta - selector
   * @example
   * skt_landing.widgets.widget_chart();
   */
  widget_chart: function (ta) {
    var widget = ta ? $(ta).find('.widget-box.chart') : $('.widget-box.chart');

    // degrees의 xy 좌표 계산
    function _toXY(cX, cY, r, degrees) {
      var rad = (degrees) * Math.PI / 180.0;

      return {
        x: cX + (r * Math.cos(rad)),
        y: cY + (r * Math.sin(rad))
      };
    }

    // 파이 그리는 함수
    function toPieChartItemPath(x, y, radiusIn, radiusOut, startAngle, endAngle) {
      var etc = 0, startIn, endIn, startOut, endOut, arcSweep1, arcSweep2, d;

      // radius 계산이 3시부터 시작되므로 위치값을 -90 시켜서 계산한다.
      startAngle = (startAngle - 90) < 0 ? 270 + startAngle : startAngle - 90;
      endAngle =  (endAngle - 90) <= 0 ? 270 + endAngle : endAngle - 90;

      if (startAngle > endAngle) {
        etc = startAngle;
        startAngle = endAngle;
        endAngle = etc;
        arcSweep1 = (endAngle - startAngle) <= 180 ? "1" : "0";
        arcSweep2 = 1;
      } else {
        arcSweep1 = (endAngle - startAngle) <= 180 ? "0" : "1";
        arcSweep2 = 0;
      }

      startIn = _toXY(x, y, radiusIn, endAngle);
      endIn = _toXY(x, y, radiusIn, startAngle);
      startOut = _toXY(x, y, radiusOut, endAngle);
      endOut = _toXY(x, y, radiusOut, startAngle);

      d = [
        "M", startIn.x, startIn.y,
        "L", startOut.x, startOut.y,
        "A", radiusOut, radiusOut, 0, arcSweep1, arcSweep2, endOut.x, endOut.y,
        "L", endIn.x, endIn.y,
        "A", radiusIn, radiusIn, 0, arcSweep1, arcSweep2, startIn.x, startIn.y,
        "z"
      ].join(" ");

      return d;
    }

    $(widget).each(function () {
      var $this = $(this),
          chartOption = {},
          chartType = $this.data('type');

      if ($this.data('event') === 'bind') return;

      if (chartType === 'pie') {
        chartOption.startAngle = 0;
        chartOption.endAngle = 0;
        chartOption.arcHeight = $this.find('svg').width() / 2;
        chartOption.textAngle = '';
        chartOption.textXY = {};


        $this.find('.chart-arc').each(function (idx, ele) {
          chartOption.startAngle = chartOption.endAngle;
          chartOption.piecePercent = ($(ele).data('percent') === 1) ? 0.99999 : $(ele).data('percent');
          chartOption.endAngle = chartOption.startAngle + (360 * chartOption.piecePercent);
          chartOption.textAngle = chartOption.startAngle + ((chartOption.endAngle - chartOption.startAngle) / 2);
          chartOption.textAngle = (chartOption.textAngle - 90) < 0 ? 270 + chartOption.textAngle : chartOption.textAngle - 90;
          chartOption.textXY = _toXY(chartOption.arcHeight, chartOption.arcHeight, chartOption.arcHeight / 2, chartOption.textAngle);

          $(ele).attr("d", toPieChartItemPath(chartOption.arcHeight, chartOption.arcHeight, 0, chartOption.arcHeight + $(ele).data('offsetHeight'), chartOption.startAngle, chartOption.endAngle));
          $this.find('.chart-txt').eq($(ele).index()).attr("x", chartOption.textXY.x - 15).attr("y", chartOption.textXY.y + 10);
        });
      } else if (chartType === 'triangle') {
        chartOption.pieceWidth = $this.data('width');
        chartOption.pieceHeight = $this.find('svg').height();
        chartOption.pieceOverlay = $this.data('overlay');
        chartOption.pieceCount = $this.find('polygon').length;
        chartOption.width = chartOption.pieceCount * chartOption.pieceWidth - (chartOption.pieceOverlay * (chartOption.pieceCount - 1));

        $this.find('svg').attr('width', chartOption.width);
        $this.find('polygon').each(function (idx, ele) {
          chartOption.topX = (chartOption.pieceWidth * idx) + (chartOption.pieceWidth / 2) - (chartOption.pieceOverlay * idx);
          chartOption.topY = chartOption.pieceHeight - (chartOption.pieceHeight * $(ele).data('percent'));
          chartOption.leftX = idx * chartOption.pieceWidth - (chartOption.pieceOverlay * idx);
          chartOption.leftY = chartOption.pieceHeight;
          chartOption.rightX = chartOption.leftX + chartOption.pieceWidth;
          chartOption.rightY = chartOption.pieceHeight;

          // 꼭지점 x,y / 왼쪽하단 x,y / 오른쪽하단 x,y 순으로 그린다
          $(ele).attr('points', chartOption.topX + ',' + chartOption.topY + ' ' + chartOption.leftX + ',' + chartOption.leftY + ' ' + chartOption.rightX + ',' + chartOption.rightY);
          if ($(ele).data('target') !== undefined) $($(ele).data('target')).css('top', chartOption.topY);
        });

      } else if (chartType === 'square') {
        chartOption.pieceWidth = $this.data('width');
        chartOption.pieceHeight = $this.find('svg').height();
        chartOption.pieceOverlay = $this.data('overlay');
        chartOption.pieceCount = $this.find('polygon').length;
        chartOption.width = chartOption.pieceCount * chartOption.pieceWidth - (chartOption.pieceOverlay * (chartOption.pieceCount - 1));

        $this.find('svg').attr('width', chartOption.width);
        $this.find('polygon').each(function (idx, ele) {
          chartOption.topLeftX = (chartOption.pieceWidth * idx) - (chartOption.pieceOverlay * idx);
          chartOption.topLeftY = chartOption.pieceHeight - (chartOption.pieceHeight * $(ele).data('percent'));
          chartOption.topRightX = chartOption.topLeftX + chartOption.pieceWidth;
          chartOption.topRightY = chartOption.topLeftY;
          chartOption.bottomLeftX = (chartOption.pieceWidth * idx) - (chartOption.pieceOverlay * idx);
          chartOption.bottomLeftY = chartOption.pieceHeight;
          chartOption.bottomRightX = chartOption.bottomLeftX + chartOption.pieceWidth;
          chartOption.bottomRightY = chartOption.pieceHeight;

          //  왼쪽상단 x,y / 오른쪽상단 x,y / 오른쪽하단 x,y / 왼쪽하단 x,y 순으로 그린다.
          $(ele).attr('points', chartOption.topLeftX + ',' + chartOption.topLeftY + ' ' + chartOption.topRightX + ',' + chartOption.topRightY + ' ' + chartOption.bottomRightX + ',' + chartOption.bottomRightY + ' ' + chartOption.bottomLeftX + ',' + chartOption.bottomLeftY);
          if ($(ele).data('target') !== undefined) $($(ele).data('target')).css('top', chartOption.topLeftY);
        });
      }
    });
  }
}
/* jshint ignore:end */