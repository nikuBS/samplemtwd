/**
 * FileName: product.additions.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.10
 */


Tw.ProductAdditions = function(rootEl, params) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._params = params;

  this.cachedElement();
  this.bindEvent();
  this.init();
};

Tw.ProductAdditions.prototype = {
  ADDITION_CODE: 'F01200',
  init: function () {
    this._searchType = 'recommand';
    this._lastAdditionId = this.$moreBtn.data('last-addition');
    this._leftCount = this.$moreBtn.data('left-count');
    this._additionsTmpl = Handlebars.compile($('#fe-templ-additions').html());
  },

  bindEvent: function () {
    this.$container.on('click', '.bt-more > button', $.proxy(this._handleLoadMore, this));
  }, 

  cachedElement: function () {
    this.$moreBtn = this.$container.find('.bt-more > button');
  },

  _handleLoadMore: function (e) {
    var params = Object.assign(this._params, {});
    params.idxCtgCd = this.ADDITION_CODE;
    params.searchLastProdId = this._lastAdditionId;
    params.searchOrder = this._searchType;

    $.ajax('http://localhost:3000/mock/product.additions.json')
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
      if (/^[0-9]+$/.test(item.basFeeInfo)) {
        item.basFeeInfo = Tw.FormatHelper.addComma(item.basFeeInfo);
        item.isMonthly = true;
      } 
      
      return item;
    });

    this._lastAdditionId = items[items.length - 1].prodId;
    this._leftCount = this._leftCount - items.length;

    if (this._leftCount > 0) {
      this.$moreBtn.text(this.$moreBtn.text().replace(/\((.+?)\)/, '(' + this._leftCount + ')'));
    } else {
      this.$moreBtn.css('display', 'none');
    }

    $list.append(this._additionsTmpl({ items: items }));
  }
};