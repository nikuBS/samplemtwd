Tw.NextRoaming = function(rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._xTractorService = new Tw.XtractorService(this.$container);
  this._menuId = menuId;
};

Tw.NextRoaming.prototype = {
};

Tw.NextRoamingMenu = function(rootEl) {
  this.$container = rootEl;
};

Tw.NextRoamingMenu.prototype = {
  install: function () {
    var container = this.$container;
    $('#header').hide();

    var roamOff = Tw.CommonHelper.getSessionStorage('ROAMING_OFF');
    var mcc = Tw.CommonHelper.getSessionStorage('ROAMING_MCC');

    if (mcc && mcc !== '450' && roamOff !== 'Y') {
      $('#gnb .menu').on('click', function() {
        $('#roamingMenu').css('display', 'block');
        container.css('display', 'none');

        $('#roamingMenu .header .login').on('click', function(e) {
          new Tw.TidLandingComponent().goLogin('/product/roaming');
          e.stopPropagation();
        });
      });
      $(document).on('click', '#roamingMenu .header .close', function() {
        $('#roamingMenu').css('display', 'none');
        container.css('display', 'inherit');
      });
      $('#common-menu').hide();
    } else {
      var menu = new Tw.MenuComponent();
      $('#gnb .menu').on('click', function() {
        menu._onGnbBtnClicked();
      });
    }
  }
};
