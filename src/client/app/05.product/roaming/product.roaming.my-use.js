/**
 * FileName: product.roaming.my-use.js
 * Author: Juho Kim (jhkim@pineone.com)
 * Date: 2018.11.20
 */

Tw.ProductRoamingMyUse = function(rootEl, options) {
  this.FE_TAB = '.fe-myuse-tab';
  this.FE_TABLIST = '.fe-myuse-tablist';

  this.$container = rootEl;
  this._hash = Tw.Hash;
  this._popupService = Tw.Popup;
  this._tidLanding = new Tw.TidLandingComponent();
  this._options = options;

  this._cachedElement();
  this._bindEvent();
  this._init();
};


Tw.ProductRoamingMyUse.prototype = {
  _cachedElement: function () {
    this.$tabLinker = this.$container.find(this.FE_TABLIST);
  },
  _bindEvent: function () {
    this.$tabLinker.on('click', this.FE_TAB, $.proxy(this._onTabChanged, this));
  },
  _init : function() {
    this._initTab();
    this._checkLogin();
  },
  _initTab: function() {
    var hash = window.location.hash;
    if (Tw.FormatHelper.isEmpty(hash)) {
      hash = this.$tabLinker.find(this.FE_TAB).eq(0).attr('href');
    }

    setTimeout($.proxy(function () {
      this.$tabLinker.find('a[href="' + hash + '"]').trigger('click');
    }, this), 0);
  },
  _onTabChanged: function (e) {
    // li 태그에 aria-selected 설정 (pub js 에서 제어)
    location.replace(e.currentTarget.href);

    // a 태그에 aria-selected 설정 (FE 에서 제어)
    this.$tabLinker.find(this.FE_TAB).attr('aria-selected', false);
    $(e.currentTarget).attr('aria-selected', true);
  },
  _checkLogin: function() {
    if (!this._options.isLogin) {
      if( !Tw.Environment.init ) {
        $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openLoginConfirm, this));
      } else {
        this._openLoginConfirm();
      }
    }
  },
  _openLoginConfirm: function() {
    return this._popupService.openConfirm(
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A20.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A20.TITLE,
      $.proxy(
        function () {
          this._popupService.close();
          this._tidLanding.goLogin();
        }, this
      ));
  }
};