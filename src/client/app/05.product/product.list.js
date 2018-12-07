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
    this._filterTmpl = Handlebars.compile($('#fe-templ-filters').html());
  },

  bindEvent: function() {
    this.$moreBtn.on('click', $.proxy(this._handleLoadMore, this));
    this.$container.on('click', '.fe-select-order', $.proxy(this._openOrderPopup, this));
    this.$container.on('click', '.fe-select-filter', $.proxy(this._handleClickChangeFilters, this));
  },

  cachedElement: function() {
    this.$total = this.$container.find('.number-text');
    this.$moreBtn = this.$container.find('.extraservice-more > button');
    this.$list = this.$container.find('ul.extraservice-list');
  },

  _handleLoadMore: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleSuccessLoadingData, this));
  },

  _handleSuccessLoadingData: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    var items = _.map(resp.result.products, $.proxy(this._mapProperData, this));

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

  _mapProperData: function(item) {
    if (item.basFeeAmt && /^[0-9]+$/.test(item.basFeeAmt)) {
      item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeAmt);
      item.isNumber = true;
    } else if (item.basFeeInfo && /^[0-9]+$/.test(item.basFeeInfo)) {
      item.basFeeInfo = Tw.FormatHelper.addComma(item.basFeeInfo);
      item.isNumber = true;
    }

    item.basOfrDataQtyCtt = this._isEmptyAmount(item.basOfrDataQtyCtt) ? null : Tw.FormatHelper.appendDataUnit(item.basOfrDataQtyCtt);
    item.basOfrVcallTmsCtt = this._isEmptyAmount(item.basOfrVcallTmsCtt) ? null : Tw.FormatHelper.appendVoiceUnit(item.basOfrVcallTmsCtt);
    item.basOfrCharCntCtt = this._isEmptyAmount(item.basOfrCharCntCtt) ? null : Tw.FormatHelper.appendSMSUnit(item.basOfrCharCntCtt);

    return item;
  },

  _openOrderPopup: function() {
    var list = Tw.PRODUCT_PLANS_ORDER.slice(),
      searchType = this.ORDER[this._params.searchOrder || this.DEFAULT_ORDER];
    list[searchType] = { value: list[searchType].value, option: 'checked' };

    this._popupService.open(
      {
        hbs: 'actionsheet_select_a_type', // hbs의 파일명
        layer: true,
        title: Tw.POPUP_TITLE.SELECT_ORDER,
        data: [{ list: list }]
      },
      $.proxy(this._handleOpenOrderPopup, this),
      undefined,
      'order'
    );
  },

  _handleOpenOrderPopup: function($layer) {
    $layer.on('click', 'ul.chk-link-list > li', $.proxy(this._handleSelectOrder, this));
  },

  _handleSelectOrder: function(e) {
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
      this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.CODE }).done($.proxy(this._handleLoadFilters, this));
    } else {
      this._openSelectFiltersPopup();
    }
  },

  _handleLoadFilters: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    this._filters = resp.result;
    this._openSelectFiltersPopup();
  },

  _openSelectFiltersPopup: function() {
    var currentFilters = this._params.searchFltIds,
      currentTag = this._params.searchTagId;

    var filters = _.chain(this._filters.filters)
      .map(function(filter) {
        return {
          prodFltId: filter.prodFltId,
          prodFltNm: filter.prodFltNm,
          subFilters:
            currentFilters && currentFilters.length > 0
              ? _.map(filter.subFilters, function(subFilter) {
                  if (currentFilters.indexOf(subFilter.prodFltId) >= 0) {
                    return Object.assign({ checked: true }, subFilter);
                  }
                  return subFilter;
                })
              : filter.subFilters
        };
      })
      .value();

    var tags = currentTag
      ? _.map(this._filters.tags, function(tag) {
          if (currentTag === tag.tagId) {
            return Object.assign({ checked: true }, tag);
          }
          return tag;
        })
      : this._filters.tags;

    this._popupService.open(
      {
        hbs: 'MP_02_01',
        filters: filters,
        tags: tags,
        layer: true
      },
      $.proxy(this._handleOpenSelectFilterPopup, this),
      undefined,
      'search'
    );
  },

  _handleOpenSelectFilterPopup: function($layer) {
    $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
    $layer.on('click', '.resetbtn', $.proxy(this._handleResetFilters, this, $layer));
    $layer.on('click', '.link', $.proxy(this._openSelectTagPopup, this, $layer));
  },

  _handleResetFilters: function($layer) {
    var selectedFilters = $layer.find('li[aria-checked="true"]'),
      i = 0;

    for (; i < selectedFilters.length; i++) {
      selectedFilters[i].setAttribute('aria-checked', false);
      selectedFilters[i].className = selectedFilters[i].className.replace('checked', '');
      $(selectedFilters[i].children[0]).removeAttr('checked');
    }
  },

  _openSelectTagPopup: function($layer, e) {
    if ($layer.find('li[aria-checked="true"]').length > 0) {
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A16;
      this._popupService.openConfirm(ALERT.MSG, ALERT.TITLE, $.proxy(this._handleSelectTag, this, e.currentTarget));
    } else {
      this._handleSelectTag(e.currentTarget);
    }
  },

  _handleSelectFilters: function($layer) {
    var searchFltIds = _.map($layer.find('input[checked="checked"]'), function(input) {
        return input.getAttribute('data-filter-id');
      }).join(','),
      originParams = this._params;

    this._params = { idxCtgCd: this.CODE };
    this._params.searchFltIds = searchFltIds;

    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleLoadDataWithNewFilters, this, originParams));
  },

  _handleLoadDataWithNewFilters: function(originParams, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    if (resp.result.products.length === 0) {
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A18;
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
      this._params = originParams;
    } else {
      delete this._params.searchLastProdId;
      delete this._leftCount;
      this.$list.empty();

      if (this.$total.length > 0) {
        this.$total.text(resp.result.productCount);
      }

      if (resp.result.searchOption && resp.result.searchOption.searchFltIds) {
        var filters = resp.result.searchOption.searchFltIds,
          $filters = this.$container.find('.fe-select-filter'),
          data = {},
          DEFAILT_COUNT = 2;
        data.filters = _.map(filters.slice(0, DEFAILT_COUNT), function(filter, index) {
          if (index === 0) {
            return filter.prodFltNm + ',';
          }
          return filter.prodFltNm;
        });

        if (filters.length > DEFAILT_COUNT) {
          data.leftCount = filters.length - DEFAILT_COUNT;
        }
        $filters.html(this._filterTmpl(data));
      }

      this._popupService.close();
      this._handleSuccessLoadingData(resp);
    }
  },

  _handleSelectTag: function(target) {
    var selectedTag = target.getAttribute('data-tag-id');

    if (this._params.searchTagId === selectedTag) {
      this._popupService.close();
      return;
    }

    window.location.href = window.location.pathname + '?tag=' + selectedTag;
  },

  _isEmptyAmount: function(value) {
    return !value || value === '' || value === '-';
  }
};
