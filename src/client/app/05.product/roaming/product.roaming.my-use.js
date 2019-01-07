/**
 * FileName: product.roaming.my-use.js
 * Author: Juho Kim (jhkim@pineone.com)
 * Date: 2018.11.20
 */

Tw.ProductRoamingMyUse = function(rootEl, options) {
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
    this.$tabOrTabpanel = this.$container.find('[role=tab],[role=tabpanel]');
  },
  _bindEvent: function () {
    $(window).on('hashchange', $.proxy(this._setTab, this));
  },
  _init : function() {
    this._initHash();
    this._setTab();
    this._checkLogin();
  },
  _initHash: function() {
    if (Tw.FormatHelper.isEmpty(window.location.hash)) {
      window.location.replace('#fee');
    }
  },
  _setTab: function() {
    var initTabKey = window.location.hash.replace('#', '');
    this.$tabOrTabpanel.attr('aria-selected','false')
        .filter('.' + initTabKey + '-tab').attr('aria-selected','true');
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