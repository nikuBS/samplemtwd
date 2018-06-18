$(document).on('ready', function () {
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
  },
  widget_iscroll: function () {
    var widgetIscroll = $('.widget-box.iscroll'),
        iscroll = {};
    widgetIscroll.each(function(idx){
      var className = 'iscroll'+idx;
      var pastHeight = $(this).children('.iscroll-box').outerHeight();
      $(this).addClass(className);
      $(this).closest('.widget').css('height','100%');
      iscroll[className] = new IScroll(this);
      this.addEventListener('touchmove', function (e) { e.preventDefault(); }, {passive: false});
      $(this).on('click',function(){
        var presentHeight = $(this).children('.iscroll-box').outerHeight();
        if(pastHeight != presentHeight){
          pastHeight = presentHeight;
          iscroll[className].refresh();
        }
      });
    });
  },
  widget_switch: function () {
  },
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
  },
  widget_step: function () {
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
      if($('.popup').length > 0){
        $('.popup').empty().remove();
      }
      $.get(hbsURL+'select.hbs', function (text) {
        var tmpl = Handlebars.compile(text);
        var html = tmpl(popupInfo);
        $('body').append(html);
      }).done(function () {
        $('.popup-info').attr('tabindex',-1).focus(); //포커스
        $('.popup-info')[0].scrollIntoView();
        $('.popup-closeBtn').off('click').on('click', function () {
          skt_landing.action.popup.close();
          _this.attr('tabindex',0).focus().attr('tabindex',''); //포커스
        });
        skt_landing.widgets.widget_radio();
        $('.select-submit').off('click').on('click', function () {
          _this.text($('.select-list li label.checked input').val());
          skt_landing.action.popup.close();
          _this.attr('tabindex',0).focus().attr('tabindex',''); //포커스
        });
      });
    });
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
    /*$('.slider3').each(function (idx) {
      var swiper,
        tagClass = 'slide-number' + idx,
        _this = $(this).find('.slider-box').addClass(tagClass);
      _this.find('.page-total .total').text(_this.find('.swiper-slide').length);
      swiper = new Swiper('.slider3 .' + tagClass, {
        simulateTouch: false,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev'
      });
    });*/
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
        skt_landing.action.toggleon($('.bt-select-arrow'));
        console.log($(this));
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
  }
}
