$(document).on('ready', function () {
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
  },
  component_tabs: function () {
    var tabArr = $('.tabs .tab-area');
    tabArr.each(function () {
      var _this = $(this),
          tabList = _this.find('.tab-linker'),
          tabCont = _this.find('.tab-contents');
      tabListOnChk();
      tabList.find('button, a').on('click',function(){
        $(this).closest('li').attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
        tabListOnChk();
      });

      function tabListOnChk(){
        var tabListIdx = tabList.find('li[aria-selected="true"]').index();
        /*if(tabListIdx == -1){
          tabListIdx = tabList.find('li').eq(0).attr('aria-selected', 'true').index();
        }*/
        if(tabListIdx != -1){
          tabCont.children('ul').children('li').eq(tabListIdx).attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
        }
      }
    });
  },
  component_flcarddefault: function () {
    skt_landing.action.toggleon($('.flcarddefault .bt-like')); //좋아요 스위치
  },
  component_flcardcta: function () {
    skt_landing.action.toggleon($('.flcardcta .bt-like')); //좋아요 스위치
  },
  component_flcardbarcode: function () {
  },
  component_flcardbanner1: function () {
    skt_landing.action.toggleon($('.flcardbanner1 .bt-like')); //좋아요 스위치
  },
  component_flcardbanner2: function () {
    skt_landing.action.toggleon($('.flcardbanner2 .bt-scrap')); //스크랩 스위치
  },
  component_flcardsns: function () {
    skt_landing.action.toggleon($('.flcardsns .bt-scrap')); //스크랩 스위치
  }
}
