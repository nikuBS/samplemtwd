/**
 * @file product.roaming.my-use.js
 * @author Juho Kim (jhkim@pineone.com)
 * @since 2018.11.20
 */

Tw.ProductRoamingMyUse = function(rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();
  this._options = options;

  this._cachedElement();
  this._bindEvent();
  this._init();
};


Tw.ProductRoamingMyUse.prototype = {
  FE: {
    TAB: '.fe-myuse-tab',
    TABLIST: '.fe-myuse-tablist',
    LINK_BTN: '.fe-myuse-link-btn'
  },
  _cachedElement: function () {
    this.$tabLinker = this.$container.find(this.FE.TABLIST);
  },
  _bindEvent: function () {
    this.$tabLinker.on('click', this.FE.TAB, $.proxy(this._onTabChanged, this));
    this.$container.on('click', this.FE.LINK_BTN, $.proxy(this._onLinkBtn, this));
  },
  _init : function() {
    this._initTab();
  },
  _initTab: function() {
    var hash = window.location.hash;
    if (Tw.FormatHelper.isEmpty(hash)) {
      hash = this.$tabLinker.find(this.FE.TAB).eq(0).attr('href');
    }

    setTimeout($.proxy(function () {
      this.$tabLinker.find('a[href="' + hash + '"]').trigger('click');
    }, this), 0);
  },
  _onTabChanged: function (e) {
    // li 태그에 aria-selected 설정 (pub js 에서 제어)
    location.replace(e.currentTarget.href);

    // a 태그에 aria-selected 설정 (FE 에서 제어)
    this.$tabLinker.find(this.FE.TAB).attr('aria-selected', false);
    $(e.currentTarget).attr('aria-selected', true);
  },
  _onLinkBtn: function (e) {
    var $target = $(e.currentTarget),
      url = $target.data('url'),
      prodId = $target.data('prod_id');

    if (url.indexOf('BEU:') !== -1) {
      return Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, url.replace('BEU:', '')));
    } else if (url.indexOf('NEU:') !== -1) {
      return this._openExternalUrl(url.replace('NEU:', ''));
    }

    this._historyService.goLoad(url + '?prod_id=' + prodId);
  },
  _openExternalUrl: function(url) {
    Tw.CommonHelper.openUrlExternal(url);
  }
};