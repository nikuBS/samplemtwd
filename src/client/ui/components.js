$(window).on('load', function () {
  $('.component').each(function (idx) {
    var com = $(this).find('.component-box').attr('class').replace(/component-box /, '');
    component_list['component_' + com] = skt_landing.components['component_' + com];
  });
  for (var com_name in component_list) {
    component_list[com_name]();
  }
});
skt_landing.components = {
  component_test: function () {
    console.log('ready test!');
  },
  component_tabs: function () {
    var tabArr = $('.tabs .tab-area');
    tabArr.each(function () {
      var _this = $(this),
          tabList = _this.find('.tab-linker'),
          tabCont = _this.find('.tab-contents');
      tabListOnChk();
      tabList.find('a').on('click',function(e){
        e.preventDefault();
        $(this).closest('li').addClass('on').siblings().removeClass('on');
        tabListOnChk();
      });
      
      function tabListOnChk(){
        var tabListIdx = tabList.find('li.on').index();
        if(tabListIdx == -1){
          tabListIdx = tabList.find('li').eq(0).addClass('on').index();
        }
        tabCont.children('ul').children('li').eq(tabListIdx).addClass('on').siblings().removeClass('on');
        
      }
    });
    console.log('ready tabs!');
  },
  component_accordion: function () {
    var accoArr = $('.accordion');
    accoArr.each(function () {
      var ta = $(this);
      ta.on('click', '.acco-btn button', function () {
        var area = $(this).closest('.acco-area'),
          onTag = $(this).closest('li');
        if (area.hasClass('toggle')) {
          onTag.toggleClass('on');
        } else {
          if (onTag.hasClass('on')) {
            onTag.removeClass('on');
          } else {
            onTag.addClass('on').siblings('li').removeClass('on');
          }
        }
      });
    });
    console.log('ready accordion!');
  },
  component_flcarddefault: function () {
    skt_landing.action.toggleon($('.flcarddefault .bt-like')); //좋아요 스위치
    console.log('ready flcarddefault!');
  },
  component_flcardcta: function () {
    skt_landing.action.toggleon($('.flcardcta .bt-like')); //좋아요 스위치
    console.log('ready flcardcta!');
  },
  component_flcardbarcode: function () {
    console.log('ready flcardbarcode!');
  },
  component_flcardbanner1: function () {
    skt_landing.action.toggleon($('.flcardbanner1 .bt-like')); //좋아요 스위치
    console.log('ready flcardbanner1!');
  },
  component_flcardbanner2: function () {
    skt_landing.action.toggleon($('.flcardbanner2 .bt-scrap')); //스크랩 스위치
    console.log('ready flcardbanner2!');
  },
  component_flcardsns: function () {
    skt_landing.action.toggleon($('.flcardsns .bt-scrap')); //스크랩 스위치
    console.log('ready flcardsns!');
  }
}
