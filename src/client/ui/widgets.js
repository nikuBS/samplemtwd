$(window).on('load', function () {
  skt_landing.widgets.widget_init();
});
skt_landing.widgets = {
  widget_init: function(ta){ // string : selector
    ta = ta ? $(ta+' .widget') : $('.widget');
    ta.each(function (idx) {
      var com = $(this).find('.widget-box').attr('class').replace(/widget-box /, '');
      widget_list['widget_' + com] = skt_landing.widgets['widget_' + com];
    });
    for (var com_name in widget_list) {
      widget_list[com_name]();
    }
  },
  widget_test: function () {
    console.log('ready test!');
  },
  // widget_switch: function () {
  //   console.log('ready switch!');
  // },
  widget_tube: function () {
    $('.widget .tube').each(function(){
      var _this = $(this);
      setRadioState(_this);
      _this.find('input').on('click',function(){
        setRadioState(_this);
      });
    });
    function setRadioState(box){
      var box = $(box),
          labels = box.find('label');
          leng = labels.length;
      for(var i=0;i<leng;++i){
        if(labels.eq(i).children().prop('checked')){
          labels.eq(i).addClass('checked');
        }else{
          labels.eq(i).removeClass('checked');
        }
        if(labels.eq(i).children().prop('disabled')){
          labels.eq(i).addClass('disabled');
        }else{
          labels.eq(i).removeClass('disabled');
        }
      }
    }
    console.log('ready tube!');
  },
  widget_step: function () {
    console.log('ready step!');
  },
  widget_select: function () {
    $('.bt-dropdown').on('click', function () {
      var _this = $(this),
        data_title;
      _this.data('title') ? data_title = true : data_title = false;

      var popupInfo = {
        'title_chk': data_title,
        'title': _this.data('title'),
        'value': _this.data('select').split(','),
        'txt': _this.data('txt')
      };
      $.get('/hbs/select.hbs', function (text) {
        var tmpl = Handlebars.compile(text);
        var html = tmpl(popupInfo);
        $('body').append(html);
      }).done(function () {
        $('.popup-closeBtn').off('click').on('click', function () {
          skt_landing.action.popup.close();
        });
        skt_landing.widgets.widget_radio();
        $('.select-submit').off('click').on('click', function () {
          _this.text($('.select-list li label.checked input').val());
          skt_landing.action.popup.close();
        });
      });
    });
    console.log('ready select!');
  },
  widget_radio: function () {
    var input = $('.radiobox :radio');
    input.each(function () {
      var box = $(this).closest('label');
      $(this).is(':checked') ? box.addClass('checked') : box.removeClass('checked');
      $(this).is(':disabled') ? box.addClass('disabled') : box.removeClass('disabled');
      $(this).on('click', function () {
        if ($(this).prop('disabled')) return;
        var nameGroup = $('[name=' + $(this).attr('name') + ']');
        nameGroup.closest('label').removeClass('checked');
        nameGroup.attr('checked', false);
        $(this).closest('label').addClass('checked');
        $(this).attr('checked', true);
      }).on('focusin', function () {
        $(this).closest('label').addClass('focus');
      }).on('focusout', function () {
        $(this).closest('label').removeClass('focus');
      });
    });
    console.log('ready radio!');
  },
  widget_check: function () {
    var input = $('.checkbox :checkbox');
    input.each(function () {
      var box = $(this).closest('label');
      $(this).is(':checked') ? box.addClass('checked') : box.removeClass('checked');
      $(this).is(':disabled') ? box.addClass('disabled') : box.removeClass('disabled');
      $(this).on('click', function () {
        if ($(this).prop('checked')) {
          box.addClass('checked');
          $(this).attr('checked', true);
        } else {
          box.removeClass('checked');
          $(this).attr('checked', false);
        }
      }).on('focusin', function () {
        $(this).closest('label').addClass('focus');
      }).on('focusout', function () {
        $(this).closest('label').removeClass('focus');
      });
    });
    console.log('ready check!');
  },
  widget_slider: function () {
    $('.slider').each(function (idx) {
      var swiper,
        tagClass = 'slide-number' + idx,
        _this = $(this).find('.slider-box').addClass(tagClass);
      _this.find('.page-total .total').text(_this.find('.swiper-slide').length);
      swiper = new Swiper('.slider .' + tagClass, {
        pagination: '.swiper-pagination',
        paginationClickable: true
      });
    });
    console.log('ready slider1!');
  },
  widget_slider2: function () {
    $('.slider2').each(function (idx) {
      var swiper,
        tagClass = 'slide-number' + idx,
        _this = $(this).find('.slider-box').addClass(tagClass);
      _this.find('.page-total .total').text(_this.find('.swiper-slide').length);
      swiper = new Swiper('.slider2 .' + tagClass, {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        freeMode: true
      });
    });
    console.log('ready slider2!');
  },
  widget_slider3: function () {
    $('.slider3').each(function (idx) {
      var swiper,
        tagClass = 'slide-number' + idx,
        _this = $(this).find('.slider-box').addClass(tagClass);
      _this.find('.page-total .total').text(_this.find('.swiper-slide').length);
      swiper = new Swiper('.slider3 .' + tagClass, {
        simulateTouch: false,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev'
      });
    });
    console.log('ready slider3!');
  },
  widget_slider4: function () {
    $('.slider4').each(function (idx) {
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
    });
    console.log('ready slider4!');
  },
  widget_slider5: function () {
    $('.slider5').each(function (idx) {
      var swiper,
        tagClass = 'slide-number' + idx,
        _this = $(this).find('.slider-box').addClass(tagClass);
      _this.next().find('.total').text(_this.find('.swiper-slide').length);
      swiper = new Swiper('.slider5 .' + tagClass, {
        onInit: function (params) {
          _this.next().find('.current').text(params.activeIndex + 1);
          skt_landing.action.toggleon($('.bt-select-arrow'));
        },
        onSlideChangeStart: function (params) {
          _this.next().find('.current').text(params.activeIndex + 1);
        }
      });
    });
    console.log('ready slider5!');
  },
  widget_accordion: function () {
    $('.accordion').each(function(){
      var _this = $(this);
      if(_this.find('> .acco-cover > .bt-whole').length < 1){
        _this.find('.acco-cover').addClass('on');
      }
      _this.find('> .acco-cover > .bt-whole button').on('click',function(){
        $(this).closest('.acco-cover').toggleClass('on');
      });
      _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box > .acco-tit button').on('click', function () {
        $(this).closest('.acco-box').toggleClass('on');
        if(_this.find('> .acco-cover').hasClass('toggle')){
          $(this).closest('.acco-box').siblings().removeClass('on');
        }
      });
    })
    console.log('ready accordion!');
  },
  widget_switch: function () {
    $('.btn-switch input').each(function () {
      if ($(this).prop('checked')) {
        $(this).closest('.btn-switch').addClass('on');
      } else {
        $(this).closest('.btn-switch').removeClass('on');
      }
    });
    $('.btn-switch input').on('change', function () {
      if ($(this).prop('checked')) {
        $(this).closest('.btn-switch').addClass('on');
      } else {
        $(this).closest('.btn-switch').removeClass('on');
      }
    });
    console.log('ready switch!');
  }
}
