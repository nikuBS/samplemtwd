/**
 * FileName: product.infinity-benefit-usage-history.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

Tw.ProductInfinityBenefitUsageHistory = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = new Tw.PopupService();
  this._cachedElement();
  this._bindEvent();
  this._initTemplate();
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
  _limitBenefitListCount: 20,
  _listTotal: 0,
  _page: 1,

  _initTemplate: function() {
    _.forEach(_.keys(this._prodIdList), function(prodId) {
      this._template[prodId] = Handlebars.compile($('#tpl_benefit_list_' + prodId).html());
    });
  },

  _cachedElement: function() {
    this.$btnCategory = this.$container.find('.fe-btn_category');
    this.$btnMore = this.$container.find('.fe-btn_more');
    this.$listBenefit = this.$container.find('.fe-list_benefit');
    this.$benefitTitle = this.$container.find('.fe-benefit_title');
    this.$benefitDescription = this.$container.find('.fe-benefit_description');
  },

  _bindEvent: function() {
    this.$btnCategory.on('click', $.proxy(this._openCategoryPopup, this));
    this.$btnMore.on('click', $.proxy(this._showMore, this));
  },

  _showMore: function() {
    this._page++;

    if ((this._listTotal - (this._limitBenefitListCount * this._page)) < 1) {
      return this.$btnMore.hide();
    }

    this.$listBenefit.find('li:lt(' + (this._limitBenefitListCount * this._page) + ')').show();
    this.$btnMore.html(Tw.BUTTON_LABEL.MORE + ' (' + (this._listTotal - (this._limitBenefitListCount * this._page)) + ')');
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
    $popupContainer.on('click', '[data-prod_id]', $.proxy(this._selectBenefitProdId, this));
  },

  _selectBenefitProdId: function(e) {
    this._prodId = $(e.currentTarget).data('prod_id');

    if (Tw.FormatHelper.isEmpty(this._prodId)) {
      return Tw.Error().page();
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0015, { tDiyGrCd: this._prodId }, null, 'NA00005959')
      .done($.proxy(this._applyBenefitUsageList, this));
  },

  _getList: function(result) {
    var resultList;

    switch(this._prodId) {
      case 'NA00006114':
      case 'NA00006115':
        resultList = _.map(result[this._prodIdList[this._prodId]], $.proxy(this._parseTravelAndMovieList, this));
        break;
      case 'NA00006116':
      case 'NA00006117':
        resultList = _.map(result[this._prodIdList[this._prodId]], $.proxy(this._parseWatchAndClubList, this));
        break;
    }

    this._listTotal = resultList.length;
    if (resultList.length > this._limitBenefitListCount) {
      this.$btnMore.text(Tw.BUTTON_LABEL.MORE + ' (' + (resultList.length - this._limitBenefitListCount) + ')');
      this.$btnMore.show();
    }

    return resultList;
  },

  _parseTravelAndMovieList: function(item, index) {
    item.issueDt = Tw.FormatHelper.isEmpty(item.issueDt) ? '' : Tw.DateHelper.getShortDateWithFormat(item.issueDt, 'YY.MM.DD');
    item.hpnDt = Tw.FormatHelper.isEmpty(item.hpnDt) ? '' : Tw.DateHelper.getShortDateWithFormat(item.hpnDt, 'YY.MM.DD');
    item.effDt = Tw.FormatHelper.isEmpty(item.effDt) ? '' : Tw.DateHelper.getShortDateWithFormat(item.effDt, 'YY.MM.DD');
    item.display = index < this._limitBenefitListCount ? '' : 'style="display: none"';

    return item;
  },

  _parseWatchAndClubList: function(item, index) {
    item.benfStaDt = Tw.FormatHelper.isEmpty(item.benfStaDt) ? '' : Tw.DateHelper.getShortDateWithFormat(item.benfStaDt, 'YY.MM.DD');
    item.benfEndDt = Tw.FormatHelper.isEmpty(item.benfEndDt) ? '' : Tw.DateHelper.getShortDateWithFormat(item.benfEndDt, 'YY.MM.DD');
    item.display = index < this._limitBenefitListCount ? '' : 'style="display: none"';

    return item;
  },

  _applyBenefitUsageList: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._page = 1;
    this.$btnMore.hide();

    this.$benefitTitle.text(resp.result.beforeTDiyGrNm.split('_').join(' '));
    this.$benefitDescription.text(Tw.PRODUCT_INFINITY_CATEGORY_DESC[this._prodId]);

    this.$listBenefit.html(this._template[this._prodId]({
      list: this._getList(resp.result)
    }));
  }

};
