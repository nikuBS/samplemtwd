Tw.NextRoaming = function(rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._xTractorService = new Tw.XtractorService(this.$container);
  this._menuId = menuId;
  
  this._bindEvent();
};

Tw.NextRoaming.prototype = {
  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-link-internal', $.proxy(this._onClickInternal, this));
  },
  /**
   * @function
   * @desc 링크 버튼 클릭 핸들러
   * @param {Object} event - 이벤트 객체
   */
  _onClickInternal: function (event) {
    var url = $(event.currentTarget).data('url');
    this._historyService.goLoad(url);

    event.preventDefault();
    event.stopPropagation();
  }  
};

Tw.NextRoamingMenu = function(rootEl) {
  this.$container = rootEl;
};

Tw.NextRoamingMenu.prototype = {
  install: function () {
    var container = this.$container;
    $('#header').remove();

    var mcc = Tw.CommonHelper.getLocalStorage('roamingMCC');
    if (mcc && mcc !== '450') {
      $('#gnb .menu').on('click', function() {
        $('#roamingMenu').css('display', 'block');
        container.css('display', 'none');
      });
      $('#roamingMenu .header .close').on('click', function() {
        container.css('display', 'block');
        $('#roamingMenu').css('display', 'none');
      });
      $('#common-menu').remove();
    } else {
      var menu = new Tw.MenuComponent();
      $('#gnb .menu').on('click', function() {
        menu._onGnbBtnClicked();
      });
    }
  },
};
