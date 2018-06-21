var skt_landing = {},
  frontend_fn = {
    popup_open: function(type){}
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
  if(('.gnb')){
    $('.gnb-list li').each(function(num){
      $(this).find('a').on('click',function(){
          if(!$(this).hasClass('on')){
            $('.gnb-list li a').removeClass('on');
            $(this).addClass('on');
          }
      });
    });
    scroll_fn['gnb'] = 'skt_landing.action.gnb_action()';
  }
});
