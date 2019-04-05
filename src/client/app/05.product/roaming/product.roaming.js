/**
 * @file product.roaming.js
 * @author Juho Kim (jhkim@pineone.com)
 * @since 2018.12.06
 */

Tw.ProductRoaming = function(rootEl, options) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._xTractorService = new Tw.XtractorService(this.$container);

  this._options = options;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductRoaming.prototype = {
  _cachedElement: function () {
    this.$formInfoBtnList = this.$container.find('.info-link-inner');
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-link-internal', $.proxy(this._onClickInternal, this));
    this.$formInfoBtnList.on('click', $.proxy(this._onClickFormInfo, this));
  },
  _init : function() {
    this._historyService.goHash('');
    this.nMax = this._options.banners.centerBanners.length - 1;
    this.$container.find('.fe-slide-banner').show();
    this._renderTopBanner();
  },
  _renderTopBanner: function() {
    setTimeout($.proxy(function () {
      new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, this._options.banners.topBanners, 'T');
    }, this), 0);
  },
  _onOpenFormInfo: function ($layer) {
    this.$prevBtn = $layer.find('#_dev_prev');
    this.$nextBtn = $layer.find('#_dev_next');
    this.$headerContainers = $layer.find('._dev_header');
    this.$contentContainers = $layer.find('._dev_html');

    this.$prevBtn.on('click', $.proxy(this._onClickPrevBtn, this));
    this.$nextBtn.on('click', $.proxy(this._onClickNextBtn, this));

    this._updateFormInfo();
  },
  _onClickInternal: function (event) {
    var url = $(event.currentTarget).data('url');
    this._historyService.goLoad(url);

    event.preventDefault();
    event.stopPropagation();
  },
  _onClickFormInfo: function(e) {
    var $target = $(e.currentTarget);
    this.idxSelect = $target.data('index');
    if (this.idxSelect < 0 || this.idxSelect > this.nMax) {
      return;
    }

    this._popupService.open({
        hbs: 'RM_01_XX',
        data: {
          banners: this._options.banners
        }
      },
      $.proxy(this._onOpenFormInfo, this), null, 'info', $target);
  },

  _onClickPrevBtn: function() {
    if (this.idxSelect > 0) {
      this.idxSelect--;
      this._updateFormInfo();
    }
  },
  _onClickNextBtn: function() {
    if (this.idxSelect < this.nMax) {
      this.idxSelect++;
      this._updateFormInfo();
    }
  },
  _updateFormInfo: function() {
    if ( this.idxSelect === this.nMax ) {
      this.$nextBtn.hide();
    } else {
      this.$nextBtn.show();
    }

    if ( this.idxSelect === 0 ) {
      this.$prevBtn.hide();
    } else {
      this.$prevBtn.show();
    }

    this.$headerContainers.hide().filter('[data-key="' + this.idxSelect + '"]').show();
    this.$contentContainers.hide().filter('[data-key="' + this.idxSelect + '"]').show();
  }
};