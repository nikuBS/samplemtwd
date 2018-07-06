var skt_landing = {},
  frontend_fn = {
    popup_open: function(type){},
    popup_close: function(type){}
  },
  page_list = {},
  component_list = [],
  widget_list = [],
  section_list = [],
  resize_fn = [], //resize시 사용
  scroll_fn = [], //scroll시 사용
  wheel_fn = [], //wheel시 사용
  hbsURL = '/hbs/'; //hbs URL
$(document).on('ready', function () {
  /*** 페이지 구분 ***/
  var page_url = location.href.split('/'),
    head_title = '',
    head_common = ' | SKT Framework';
  page_url = page_url[page_url.length - 1].split('.')[0];
  switch (page_url) {
    case 'layout':
      head_title = '레이아웃 페이지'
      break;
    case 'main':
      head_title = '메인 페이지'
      break;
    case 'test':
      head_title = '테스트 페이지'
      break;
    default:
  }
  $('head title').text(head_title + head_common);
  if($('.gnb')){
    scroll_fn['gnb'] = 'skt_landing.action.gnb_action()';
  }
  if($('.all-menu')){
    $('.all-menu-bt').off('click').on('click',function(){
      var all_m_box = $('.all-menu');
      $('<div class="popup-blind"></div>').appendTo($('.wrap'));
        all_m_box.attr({
          'aria-hidden':false,
          'tabindex':0
        });
      all_m_box.stop().animate({
        right:'0%'
      },{
        queue:false,
        duration:500,
        complete:function(){
          skt_landing.action.fix_scroll();
          skt_landing.action.setFocus($('.all-menu-focus'),0);  
        }
      });
      $('.all-menu-close').off('click').on('click',function(){
        all_m_box.stop().animate({
          right:'-100%'
        },{
          queue:false,
          duration:500,
          complete:function(){
            all_m_box.attr({
              'aria-hidden':true,
              'tabindex':-1
            });
            skt_landing.action.auto_scroll();
            $('.all-menu-close').off('click');
            $('.popup-blind').empty().remove();
            skt_landing.action.setFocus($('.all-menu-bt'),0);
          }
        });
      });
      $('.user-menu li button').off('click').on('click',function(){
        $('.all-menu').scrollTop(0);
        $('.all-menu-box-depth2').stop().animate({
          'right':'0%'
        },{
          queue:false,
          duration:500,
          complete:function(){
            $('.all-menu-box').attr({
              'aria-hidden':true,
              'tabindex':-1
            });
            $('.all-menu-box-depth2').attr({
              'aria-hidden':false,
              'tabindex':0
            });
            skt_landing.action.setFocus($('.all-menu-box-depth2 h3'),0);
          }
        });
        $('.all-menu-prev').off('click').on('click',function(){
          $('.all-menu-box').attr({
            'aria-hidden':false,
            'tabindex':0
          });
          $('.all-menu-box-depth2').attr({
            'aria-hidden':true,
            'tabindex':-1
          });
          $('.all-menu-box-depth2').stop().animate({
            'right':'-100%'
          },{
            queue:false,
            duration:500,
            complete:function(){ 
              skt_landing.action.setFocus($('.all-menu-focus'),0); 
            }
          });
          $('.all-menu-prev').off('click');
        });
      });
    });
  }
});
