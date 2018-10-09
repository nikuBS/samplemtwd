/**
 * FileName: product.plans.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.09
 */

Tw.ProductPlans = function(rootEl, params) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._params = params;

  this.bindEvent();
  this.init();
};

Tw.ProductPlans.prototype = {
  PLAN_CODE: 'F01100',
  init: function () {
    this._searchType = 'recommand';
    this._plansTmpl = Handlebars.compile($('#fe-templ-plans').html());
  },

  bindEvent: function () {
    this.$container.on('click', '.bt-more > button', $.proxy(this._handleLoadMore, this));
  }, 

  _handleLoadMore: function (e) {
    var lastPlanId = e.target.getAttribute('data-last-plan');
    var params = Object.assign(this._params, {});
    params.searchLastProdId = lastPlanId;
    params.searchOrder = this._searchType;

    $.ajax('http://localhost:3000/mock/product.list.json')
      .done($.proxy(this._handleSuccessLoadingData, this));
    // this._apiService.request(Tw.API_CMD.BFF_10_0031, params).done($.proxy(this._handleSuccessLoadingData, this));
  },

  _handleSuccessLoadingData: function (resp) {
    var $list = this.$container.find('ul.recommendedrate-list');
    var items = _.map(resp.result.products, function(item) {
      if (/^[0-9]+$/.test(item.basFeeAmt)) {
        item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeAmt);
        item.isMonthly = true;
      } 
      
      return item;
    });

    if (resp.code === Tw.API_CODE.CODE_00) {
      $list.append(this._plansTmpl({ items: items }));
    } else {
      // server error
    }
  }
};