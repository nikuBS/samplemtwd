/**
 * FileName: product.infinity-benefit-usage-history.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

Tw.ProductInfinityBenefitUsageHistory = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = new Tw.PopupService();
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductInfinityBenefitUsageHistory.prototype = {

  _template: [],
  _prodId: 'NA00006114',
  _prodIdList: {
    NA00006114: 'infiTravelList',
    NA00006115: 'infiMovieList',
    NA00006116: 'infiWatchList',
    NA00006117: 'infiClubList'
  },
  _listTotal: 0,

  _cachedElement: function() {
    this.$btnCategory = this.$container.find('.fe-btn_category');
    this.$btnGoTop = this.$container.find('.fe-btn_go_top');
  },

  _bindEvent: function() {
    this.$btnCategory.on('click', $.proxy(this._openCategoryPopup, this));
    this.$btnGoTop.on('click', $.proxy(this._goTop, this));
  },

  _getBenefitCategory: function() {
    return _.map(_.keys(this._prodIdList), function(prodId) {
      return {
        value: Tw.PRODUCT_INFINITY_CATEGORY[prodId],
        attr: 'data-prod_id="' + prodId + '"'
      };
    });
  },

  _openCategoryPopup: function() {
    this._popupService.open({
      hbs: 'actionsheet_link_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT,
      data: [{
        'list': this._getBenefitCategory()
      }]
    }, $.proxy(this._bindPopupEvent, this), null, 'inifinity_category_popup');
  },

  _bindPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '[data-prod_id]', $.proxy(this._goOtherProdIdBenefitList, this));
  },

  _goOtherProdIdBenefitList: function(e) {
    this._historyService.goLoad('/product/infinity-benefit-usage-history?prod_id=' + $(e.currentTarget).data('prod_id'));
  },

  _goTop: function() {
    $(window).scrollTop(0);
  }

};
