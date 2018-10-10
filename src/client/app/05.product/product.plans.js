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
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  console.log(params);

  this.cachedElement();
  this.bindEvent();
  this.init();
};

Tw.ProductPlans.prototype = {
  DEFAULT_ORDER: 'recommand',
  ORDER: {
    recommand: 0,
    lowprice: 1,
    highprice: 2
  },

  PLAN_CODE: 'F01100',
  init: function() {
    this._lastPlanId = this.$moreBtn.data('last-plan');
    this._leftCount = this.$moreBtn.data('left-count');
    this._plansTmpl = Handlebars.compile($('#fe-templ-plans').html());
  },

  bindEvent: function() {
    this.$container.on('click', '.bt-more > button', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '.fe-select-order', $.proxy(this._openOrderPopup, this));
    this.$container.on('click', '.fe-select-filter', $.proxy(this._handleClickChangeFilters, this));
  },

  cachedElement: function() {
    this.$moreBtn = this.$container.find('.bt-more > button');
    this.$list = this.$container.find('ul.recommendedrate-list');
  },

  _handleLoadMore: function() {
    var params = Object.assign(this._params, {});
    params.idxCtgCd = this.PLAN_CODE;
    if (this._lastPlanId) {
      params.searchLastProdId = this._lastPlanId;
    }

    $.ajax('http://localhost:3000/mock/product.list.json').done($.proxy(this._handleSuccessLoadingData, this));
    // this._apiService.request(Tw.API_CMD.BFF_10_0031, params).done($.proxy(this._handleSuccessLoadingData, this));
  },

  _handleSuccessLoadingData: function(resp) {
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
      if (this.$moreBtn.hasClass('none')) {
        this.$moreBtn.removeClass('none');
      }
      this.$moreBtn.text(this.$moreBtn.text().replace(/\((.+?)\)/, '(' + this._leftCount + ')'));
    } else {
      this.$moreBtn.addClass('none');
    }

    $list.append(this._plansTmpl({ items: items }));
  },

  _openOrderPopup: function() {
    var list = Tw.PRODUCT_PLANS_ORDER.slice();
    list[this.ORDER[this._params.searchOrder || this.DEFAULT_ORDER]].option = 'checked';

    this._popupService.open(
      {
        hbs: 'actionsheet_select_a_type', // hbs의 파일명
        layer: true,
        title: Tw.POPUP_TITLE.SELECT_ORDER,
        data: [{ list: list }]
      },
      $.proxy(this._handleOpenOrderPopup, this)
    );
  },

  _handleOpenOrderPopup: function($layer) {
    $layer.on('click', 'ul.chk-link-list > li', $.proxy(this._handleSelectOrder, this));
  },

  _handleSelectOrder: function(e) {
    var $target = $(e.currentTarget);
    var $list = $target.parent();
    var orderType = this._getOrderType($list.find('li').index($target));

    if (this._params.searchType === orderType) {
      return;
    }

    this._params.searchType = orderType;
    this.$container.find('.fe-select-order').text($target.find('span').text());
    delete this._lastPlanId;
    this.$list.empty();
    
    this._handleLoadMore();
    this._popupService.close();
  },

  _getOrderType: function(idx) {
    var keys = Object.keys(this.ORDER),
      i = 0;

    for (; i < keys.length; i++) {
      if (this.ORDER[keys[i]] === idx) {
        return keys[i];
      }
    }
  },

  _handleClickChangeFilters: function() {
    if (!this._filters) {
      // this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.PLAN_CODE }).done($.proxy(this._openSelectFiltersPopup, this));
      $.ajax('http://localhost:3000/mock/product.plans.filters.json').done($.proxy(this._handleLoadFilters, this));
    } else {
      this._openSelectFiltersPopup();
    }
  },

  _handleLoadFilters: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      // server error
      return;
    }

    this._filters = resp.result;
    this._openSelectFiltersPopup();
  },

  _openSelectFiltersPopup: function() {
    var deviceFilters = _.map(Tw.PRODUCT_LIST_DEVICE_FILTERS, $.proxy(function(filter) {
      var currentFilter = this._params.searchFltIds;
      if (currentFilter && currentFilter.indexOf(filter.id) >= 0) {
        return {
          id: filter.id,
          icon: filter.icon,
          name: filter.name,
          checked: true
        };
      }
      
      return filter;
    }, this));

    var filters = _.chain(this._filters.filters)
      .filter(function(filter) {
        return filter.prodFltId !== 'F01120';
      })
      .map($.proxy(function(filter) {
        return {
          prodFltId: filter.prodFltId,
          prodFltNm: filter.prodFltNm,
          subFilters: _.map(
            filter.subFilters,
            $.proxy(function(sFilter) {
              var currentFilter = this._params.searchFltIds;
              if (currentFilter && currentFilter.indexOf(sFilter.prodFltId) >= 0) {
                return {
                  prodFltId: sFilter.prodFltId,
                  prodFltNm: sFilter.prodFltNm,
                  checked: true
                };
              }
              return sFilter;
            }, this)
          )
        };
      }, this))
      .value();

      console.log(this._filters.tags);

    this._popupService.open(
      {
        hbs: 'MP_02_01',
        data: {
          deviceFilters: deviceFilters,
          filters: filters,
          tags: this._filters.tags
        }
      },
      $.proxy(this._handleOpenSelectFilterPopup, this)
    );
  },

  _handleOpenSelectFilterPopup: function($layer) {
    $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
    $layer.on('click', '.resetbtn', $.proxy(this._handleResetFilters, this, $layer));
    $layer.on('click', '.link', $.proxy(this._handleSelectTag, this));
  },

  _handleResetFilters: function ($layer) {
    var selectedFilters = $layer.find('li[aria-checked="true"]'), i = 0;

    for (; i < selectedFilters.length; i++) {
      selectedFilters[i].setAttribute('aria-checked', false);
      selectedFilters[i].className = selectedFilters[i].className.replace('checked', '');
      selectedFilters[i].children[0].setAttribute('checked', false);
    }
  },

  _handleSelectFilters: function ($layer) {
    var searchFltIds = _.map($layer.find('input[checked="checked"]'), function(input) {
      return input.getAttribute('data-filter-id');
    }).join(',');

    this._popupService.close();
    
    if (this._params.searchFltIds === searchFltIds) {
      return;
    }

    this._history.goLoad('/product/plans' + searchFltIds ? '?filters=' + searchFltIds : '');
  },

  _handleSelectTag: function (e) {
    var selectedTag = e.currentTarget.getAttribute('data-tag-id');

    this._popupService.close();
    
    if (this._params.selectedTag === selectedTag) {
      return;
    }

    this._history.goLoad('/product/plans?tag=' + selectedTag);
  }
}
