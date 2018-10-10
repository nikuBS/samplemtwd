/**
 * FileName: product.plans.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.09
 */

Tw.ProductPlans = function(rootEl, params) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._params = params;

  this.cachedElement();
  this.bindEvent();
  this.init();
};

Tw.ProductPlans.prototype = {
  PLAN_CODE: 'F01100',
  init: function () {
    this._searchType = 'recommand';
    this._lastPlanId = this.$moreBtn.data('last-plan');
    this._leftCount = this.$moreBtn.data('left-count');
    this._plansTmpl = Handlebars.compile($('#fe-templ-plans').html());
  },

  bindEvent: function () {
    this.$container.on('click', '.bt-more > button', $.proxy(this._handleLoadMore, this));
  }, 

  cachedElement: function () {
    this.$moreBtn = this.$container.find('.bt-more > button');
  },

  _handleLoadMore: function (e) {
    var params = Object.assign(this._params, {});
    params.idxCtgCd = this.PLAN_CODE;
    params.searchLastProdId = this._lastPlanId;
    params.searchOrder = this._searchType;

    $.ajax('http://localhost:3000/mock/product.list.json')
      .done($.proxy(this._handleSuccessLoadingData, this));
    // this._apiService.request(Tw.API_CMD.BFF_10_0031, params).done($.proxy(this._handleSuccessLoadingData, this));
  },

  _handleSuccessLoadingData: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      // server error
      return;
    }
    var $list = this.$container.find('ul.recommendedrate-list');
    var items = _.map(resp.result.products, function(item) {
      if (/^[0-9]+$/.test(item.basFeeAmt)) {
        item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeAmt);
        item.isMonthly = true;
      } 
      
      return item;
    });

    this._lastPlanId = items[items.length - 1].prodId;
    this._leftCount = this._leftCount - items.length; 

    if (this._leftCount > 0) {
      this.$moreBtn.text(this.$moreBtn.text().replace(/\((.+?)\)/, '(' + this._leftCount + ')'));
    } else {
      this.$moreBtn.css('display', 'none');
    }
    
    $list.append(this._plansTmpl({ items: items }));
  }
};