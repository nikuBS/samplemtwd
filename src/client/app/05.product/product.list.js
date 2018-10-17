/**
 * FileName: product.plans.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.09
 */

Tw.ProductList = function(rootEl, params, pageInfo) {
  this.$container = rootEl;
  this._params = params;

  this.CODE = pageInfo.code;
  this.TYPE = pageInfo.type;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this.cachedElement();
  this.bindEvent();
  this.init();
};

Tw.ProductList.prototype = {
  DEFAULT_ORDER: 'recommand',
  ORDER: {
    recommand: 0,
    highprice: 1,
    lowprice: 2
  },

  init: function() {
    this._params.idxCtgCd = this.CODE;
    this._params.searchLastProdId = this.$moreBtn.data('last-product');
    this._leftCount = this.$moreBtn.data('left-count');
    this._listTmpl = Handlebars.compile($('#fe-templ-' + this.TYPE).html());
  },

  bindEvent: function () {
    this.$container.on('click', '.bt-more > button', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '.fe-select-order', $.proxy(this._openOrderPopup, this));
    this.$container.on('click', '.fe-select-filter', $.proxy(this._handleClickChangeFilters, this));
  },

  cachedElement: function () {
    this.$moreBtn = this.$container.find('.bt-more > button');
    this.$list = this.$container.find('ul.recommendedrate-list');
  },
 
  _handleLoadMore: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleSuccessLoadingData, this));
  },

  _handleSuccessLoadingData: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    var items = _.map(resp.result.products, function(item) {
      if (item.basFeeAmt && /^[0-9]+$/.test(item.basFeeAmt)) {
        item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeAmt);
        item.isMonthly = true;
      } else if (item.basFeeInfo && /^[0-9]+$/.test(item.basFeeInfo)) {
        item.basFeeInfo = Tw.FormatHelper.addComma(item.basFeeInfo);
        item.isMonthly = true;
      }

      return item;
    });

    this._params.searchLastProdId = items[items.length - 1].prodId;
    this._leftCount = (this._leftCount || resp.result.productCount) - items.length;

    if (this._leftCount > 0) {
      if (this.$moreBtn.hasClass('none')) {
        this.$moreBtn.removeClass('none');
      }
      this.$moreBtn.text(this.$moreBtn.text().replace(/\((.+?)\)/, '(' + this._leftCount + ')'));
    } else {
      this.$moreBtn.addClass('none');
    }

    this.$list.append(this._listTmpl({ items: items }));
  },

  _openOrderPopup: function () {
    var list = Tw.PRODUCT_PLANS_ORDER.slice(), searchType = this.ORDER[this._params.searchOrder || this.DEFAULT_ORDER];
    list[searchType] = { value: list[searchType].value, option:  'checked'};

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

  _handleOpenOrderPopup: function ($layer) {
    $layer.on('click', 'ul.chk-link-list > li', $.proxy(this._handleSelectOrder, this));
  },

  _handleSelectOrder: function (e) {
    var $target = $(e.currentTarget);
    var $list = $target.parent();
    var orderType = this._getOrderType($list.find('li').index($target));

    if (this._params.searchOrder === orderType) {
      return;
    }

    this._params.searchOrder = orderType;
    delete this._params.searchLastProdId;
    delete this._leftCount;
    this.$container.find('.fe-select-order').text($target.find('span').text());
    this.$list.empty();
    
    this._handleLoadMore();
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

  _handleClickChangeFilters: function () {
    if (!this._filters) {
      this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.CODE }).done($.proxy(this._handleLoadFilters, this));
    } else {
      this._openSelectFiltersPopup();
    }
  },

  _handleLoadFilters: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    this._filters = resp.result;
    this._openSelectFiltersPopup();
  },

  _openSelectFiltersPopup: function () {
    var deviceFilters = _.map(Tw.PRODUCT_LIST_DEVICE_FILTERS, $.proxy(function (filter) {
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
      .filter(function (filter) {
        return filter.prodFltId !== 'F01120';
      })
      .map($.proxy(function (filter) {
        return {
          prodFltId: filter.prodFltId,
          prodFltNm: filter.prodFltNm,
          subFilters: _.map(
            filter.subFilters,
            $.proxy(function (sFilter) {
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

  _handleOpenSelectFilterPopup: function ($layer) {
    $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
    $layer.on('click', '.resetbtn', $.proxy(this._handleResetFilters, this, $layer));
    $layer.on('click', '.link', $.proxy(this._openSelectTagPopup, this));
  },

  _handleResetFilters: function ($layer) {
    var selectedFilters = $layer.find('li[aria-checked="true"]'), i = 0;

    for (; i < selectedFilters.length; i++) {
      selectedFilters[i].setAttribute('aria-checked', false);
      selectedFilters[i].className = selectedFilters[i].className.replace('checked', '');
      $(selectedFilters[i].children[0]).removeAttr('checked');
    }
  },

  _openSelectTagPopup: function (e) {
    var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A16;
    this._popupService.openConfirm(ALERT.MSG, ALERT.TITLE, $.proxy(this._handleSelectTag, this, e.currentTarget));
  },

  _handleSelectFilters: function ($layer) {
    var searchFltIds = _.map($layer.find('input[checked="checked"]'), function (input) {
      return input.getAttribute('data-filter-id');
    }).join(',');
    
    this._params = { idxCtgCd: this.CODE };
    this._params.searchFltIds = searchFltIds;

    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleLoadDataWithNewFilters, this));
  },

  _handleLoadDataWithNewFilters: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    if (resp.result.products.length === 0) {
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A18;
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
    } else {
      delete this._params.searchLastProdId;
      delete this._leftCount;
      this.$list.empty();
      this._popupService.close();
      this._handleSuccessLoadingData(resp);
    }
  },

  _handleSelectTag: function (target) {
    var selectedTag = target.getAttribute('data-tag-id');

    this._popupService.close();
    
    if (this._params.selectedTag === selectedTag) {
      return;
    }

    this._history.goLoad('/product/' + this.TYPE + '?tag=' + selectedTag);
  }
}
