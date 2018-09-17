$(document).on('ready', function () {
  skt_landing.components.component_init();
});
skt_landing.components = {
  component_init: function(ta){
    component_list = {};
    ta = ta ? $(ta+' .component') : $('.component');
    ta.each(function (idx) {
      var com = $(this).find('.component-box').attr('class').replace(/component-box /, '');
      component_list['component_' + com] = skt_landing.components['component_' + com];
    });
    for (var com_name in component_list) {
      component_list[com_name](ta);
    }  
  },
  component_test: function () {
  },
  component_tabs: function (ta) {
    var tabArr = ta ? $(ta).find('.tabs .tab-area') : $('.tabs .tab-area');
    tabArr.each(function () {
      var _this = $(this),
          tabList = _this.find('.tab-linker'),
          tabCont = _this.find('.tab-contents');
      initLinkSlide(tabList);
      tabListOnChk();
      tabList.find('button, a').on('click',function(){
        $(this).closest('li').attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
        tabListOnChk();
        initLinkSlide(tabList);
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
      function initLinkSlide(tabList){
        var items = tabList.find('li');
        var itemsW = parseInt(items.closest('ul').css('padding-left'))*2;
        for(var i=0,leng=items.length; i<leng; ++i){
          itemsW += items.eq(i).outerWidth(true);
        }
        if(skt_landing.util.win_info.get_winW() > itemsW){
          items.closest('ul').css('width','100%');
        }else{
          items.closest('ul').css('width',itemsW);
        }
        
      }
    });
  },
  component_flcarddefault: function (ta) {
    skt_landing.action.toggleon(ta ? $(ta).find('.flcarddefault .bt-like') : $('.flcarddefault .bt-like')); //좋아요 스위치
  },
  component_flcardcta: function (ta) {
    skt_landing.action.toggleon(ta ? $(ta).find('.flcardcta .bt-like') : $('.flcardcta .bt-like')); //좋아요 스위치
  },
  component_flcardbarcode: function () {
  },
  component_flcardbanner1: function (ta) {
    skt_landing.action.toggleon(ta ? $(ta).find('.flcardbanner1 .bt-like') : $('.flcardbanner1 .bt-like')); //좋아요 스위치
  },
  component_flcardbanner2: function (ta) {
    skt_landing.action.toggleon(ta ? $(ta).find('.flcardbanner2 .bt-scrap') : $('.flcardbanner2 .bt-scrap')); //스크랩 스위치
  },
  component_flcardsns: function (ta) {
    skt_landing.action.toggleon(ta ? $(ta).find('.flcardsns .bt-scrap') : $('.flcardsns .bt-scrap')); //스크랩 스위치
  }
}
