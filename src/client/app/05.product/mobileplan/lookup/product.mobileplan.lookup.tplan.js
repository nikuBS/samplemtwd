/**
 * @file product.mobileplan.lookup.tplan.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.01
 */

Tw.ProductMobileplanLookupTplan = function(rootEl, prodId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._prodId = prodId;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductMobileplanLookupTplan.prototype = {

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
    this.$tab = this.$container.find('.fe-tab');
  },

  _bindEvent: function() {
    this.$btnCategory.on('click', $.proxy(this._openCategoryPopup, this));
    this.$btnGoTop.on('click', $.proxy(this._goTop, this));
    this.$tab.on('click', $.proxy(this._goTab, this));
  },

  _goTab: function(e) {
    this._historyService.replaceURL('/product/mobileplan/lookup/tplan?s_prod_id=' + this._prodId + '&tab_id=' + $(e.currentTarget).data('key'));
  },

  _getBenefitCategory: function() {
    var currentProdId = this._prodId;

    return _.map(_.keys(this._prodIdList), function(prodId, index) {
      return {
        'label-attr': 'id="ra' + index + '"',
        'txt': Tw.PRODUCT_INFINITY_CATEGORY[prodId],
        'radio-attr':'id="ra' + index + '" data-prod_id="' + prodId + '" ' + (currentProdId === prodId ? 'checked' : '')
      };
    });
  },

  _openCategoryPopup: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list': this._getBenefitCategory()
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindPopupEvent, this), $.proxy(this._onClosePopup, this), 'inifinity_category_popup', this.$btnCategory);
  },

  _bindPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '[data-prod_id]', $.proxy(this._setGoCategory, this));
  },

  _setGoCategory: function(e) {
    this._isGoCategory = true;
    this._goCategoryProdId = $(e.currentTarget).data('prod_id');
    this._popupService.close();
  },

  _onClosePopup: function() {
    if (!this._isGoCategory) {
      return;
    }

    this._historyService.replaceURL('/product/mobileplan/lookup/tplan?s_prod_id=' + this._goCategoryProdId);
  },

  _goTop: function() {
    $(window).scrollTop(0);
  }

};
