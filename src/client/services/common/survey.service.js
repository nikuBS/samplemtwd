Tw.SurveyService = function() {
  this._apiService = Tw.Api;    

  this._init();
};
  
Tw.SurveyService.prototype = {
  _init: function () {
      this._getMenuData();
  },

  _bindEvent: function () {
    $('.floating-close').on('click', $.proxy(this._closeFloatingBanner, this));
  },


  _closeFloatingBanner: function () {
    $('.tod-floating').hide();
  },


  _getMenuData: function () {
    this._apiService.request(Tw.NODE_CMD.GET_MENU, {}) // redis에서 메뉴트리 구성 조회
    .done($.proxy(function (resp) {
      if ( resp.code === Tw.API_CODE.CODE_00 ) {
        this._getSurveyFloatingBnnrInfo(resp.result.frontMenus);
      }
    }, this));      
  },    
  
  _getSurveyFloatingBnnrInfo: function (menuList) {
    var urlPath = location.pathname;
    var param = '';

    if (menuList.length > 0) {
      for (var i = 0; i < menuList.length; i++) {
        if (urlPath === menuList[i].menuUrl) {
          param = menuList[i].menuId;
        }
      }
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0085, {menuId: param})
    .done($.proxy(this._drawSurveyFloatingBnnrPage, this));
  },
  
  
  _drawSurveyFloatingBnnrPage: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      if (res.result.length > 0) {
        // console.log('대상화면임');
        $('.wrap').after(res.result[0].bnnrHtmlCtt);
        this._bindEvent();
      } else {
        // console.log('대상화면 아님');
      }    
    }
  }
};