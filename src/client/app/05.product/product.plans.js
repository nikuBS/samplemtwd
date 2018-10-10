/**
 * FileName: product.plans.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.09
 */

Tw.ProductPlans = function(rootEl, params) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._params = params;

  this.cachedElement();
  this.bindEvent();
  this.init();
};

Tw.ProductPlans.prototype = {
  ORDER: {
    'recommand': 0,
    'lowprice': 1,
    'highprice': 2
  },

  PLAN_CODE: 'F01100',
  init: function () {
    this._orderType = 'recommand';
    this._lastPlanId = this.$moreBtn.data('last-plan');
    this._leftCount = this.$moreBtn.data('left-count');
    this._plansTmpl = Handlebars.compile($('#fe-templ-plans').html());
  },

  bindEvent: function () {
    this.$container.on('click', '.bt-more > button', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '.fe-select-order', $.proxy(this._openOrderPopup, this));
  }, 

  cachedElement: function () {
    this.$moreBtn = this.$container.find('.bt-more > button');
    this.$list = this.$container.find('ul.recommendedrate-list');
  },
  
  _handleLoadMore: function () {
    var params = Object.assign(this._params, {});
    params.idxCtgCd = this.PLAN_CODE;
    if (this._lastPlanId) {
      params.searchLastProdId = this._lastPlanId;
    }
    params.searchOrder = this._orderType;

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
  },

  _openOrderPopup: function () {
    var list = Tw.PRODUCT_PLANS_ORDER.slice();
    list[this.ORDER[this._orderType]].option = 'checked';

    this._popupService.open({
      hbs:'actionsheet_select_a_type',// hbs의 파일명
      layer:true,
      title: Tw.POPUP_TITLE.SELECT_ORDER,
      data:[{ list: list }]
    }, $.proxy(this._handleOpenOrderPopup, this))
  },

  _handleOpenOrderPopup: function ($layer) {
    $layer.on('click', 'ul.chk-link-list > li', $.proxy(this._handleSelectOrder, this));
  },

  _handleSelectOrder: function (e) {
    var $target = $(e.currentTarget);
    var $list = $target.parent();
    var orderType = this._getOrderType($list.find('li').index($target));

    this.$container.find('.fe-select-order').text($target.find('span').text());
    this._handleLoadNewData(orderType);
    this._popupService.close();
  }, 

  _getOrderType: function (idx) {
    var keys = Object.keys(this.ORDER), i = 0;

    for (; i < keys.length; i++) {
      if (this.ORDER[keys[i]] === idx) {
        return keys[i];
      }
    }
  },

  _handleLoadNewData: function (orderType) {
    if (this._orderType === orderType) {
      return;
    }

    this._orderType = orderType;
    this.$list.empty();
    delete this._lastPlanId;

    this._handleLoadMore();
  }
};