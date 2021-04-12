Tw.SurveyService = function() {
  this._apiService = Tw.Api;
  new Tw.XtractorService($('body'));
  this._init();
};

Tw.SurveyService.prototype = {
  _init: function () {
    var menuDataInfo = JSON.parse(Tw.CommonHelper.getSessionStorage('MENU_DATA_INFO'));

    if (Tw.FormatHelper.isEmpty(menuDataInfo)) {
      this._getMenuData();
    } else {
      this._getSurveyFloatingBnnrInfo(menuDataInfo);
    }
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
        Tw.CommonHelper.setSessionStorage('MENU_DATA_INFO', JSON.stringify(resp.result.frontMenus));
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
    if (param) {
      // 해당되는 menuId가 없는 경우 불필요한 호출 제외
      this._apiService.request(Tw.API_CMD.BFF_08_0085, {menuId: param})
        .done($.proxy(this._drawSurveyFloatingBnnrPage, this));
    }
  },

  _drawSurveyFloatingBnnrPage: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result && res.result.length > 0) {
        $('.wrap').after(res.result[0].bnnrHtmlCtt);
        this._bindEvent();
      }
    }
  }
};
