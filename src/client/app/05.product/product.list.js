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
    this.$orderBtn.click(_.debounce($.proxy(this._openOrderPopup, this), 300));
    this.$container.find('.fe-select-filter').click(_.debounce($.proxy(this._handleClickChangeFilters, this), 300));
  },

  cachedElement: function() {
    this.$total = this.$container.find('.number-text');
    this.$moreBtn = this.$container.find('.extraservice-more > button');
    this.$list = this.$container.find('ul.extraservice-list');
    this.$orderBtn = this.$container.find('.fe-select-order');
    this.$filters = this.$container.find('.fe-select-filter');
  },

  _handleLoadMore: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleSuccessLoadingData, this, undefined));
  },

  _handleLoadWithNewOrder: function(order) {
    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleSuccessLoadingData, this, order));
  },

  _handleSuccessLoadingData: function(order, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    if (order) {
      location.href = Tw.UrlHelper.replaceQueryParam('order', order);
    }

    var items = _.map(resp.result.products, $.proxy(this._mapProperData, this));

    this._params.searchLastProdId = items[items.length - 1].prodId;
    this._leftCount = (this._leftCount || resp.result.productCount) - items.length;

    var hasNone = this.$moreBtn.hasClass('none');
    if (this._leftCount > 0) {
      if (hasNone) {
        this.$moreBtn.removeClass('none').attr('aria-hidden', false);
      }
    } else if (!hasNone) {
      this.$moreBtn.addClass('none').attr('aria-hidden', true);
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

    if (!this._isEmptyAmount(item.basOfrDataQtyCtt)) {
      var data = Number(item.basOfrDataQtyCtt);
      if (isNaN(data)) {
        item.basOfrDataQtyCtt = item.basOfrDataQtyCtt;
      } else {
        item.basOfrDataQtyCtt = data + Tw.DATA_UNIT.GB;
      }
    } else if (!this._isEmptyAmount(item.basOfrMbDataQtyCtt)) {
      item.basOfrDataQtyCtt = Tw.FormatHelper.appendDataUnit(item.basOfrMbDataQtyCtt);
    }

    item.basOfrVcallTmsCtt = this._isEmptyAmount(item.basOfrVcallTmsCtt) ? null : Tw.FormatHelper.appendVoiceUnit(item.basOfrVcallTmsCtt);
    item.basOfrCharCntCtt = this._isEmptyAmount(item.basOfrCharCntCtt) ? null : Tw.FormatHelper.appendSMSUnit(item.basOfrCharCntCtt);

    if (this.CODE === 'F01100') {
      item.filters = _.filter(item.filters, function(filter) {
        return /^F011[2|3|6]/.test(filter.prodFltId);
      });
    }

    return item;
  },

  _openOrderPopup: function() {
    var searchType = this._params.searchOrder || this.DEFAULT_ORDER;
    var list = _.map(Tw.PRODUCT_LIST_ORDER, function(item) {
      if (item['radio-attr'].indexOf(searchType) >= 0) {
        return $.extend({}, item, {
          'radio-attr': item['radio-attr'] + ' checked'
        });
      }

      return item;
    });

    this._popupService.open(
      {
        hbs: 'actionsheet01', // hbs의 파일명
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        layer: true,
        data: [{ list: list }]
      },
      $.proxy(this._handleOpenOrderPopup, this),
      undefined,
      'order',
      this.$orderBtn
    );
  },

  _handleOpenOrderPopup: function($layer) {
    $layer.on('change', 'li input', $.proxy(this._handleSelectOrder, this));
  },

  _handleSelectOrder: function(e) {
    var $target = $(e.currentTarget),
      $li = $target.parents('li');
    var orderType = $target.data('order');

    if (this._params.searchOrder === orderType) {
      return;
    }

    this._params.searchOrder = orderType;
    delete this._params.searchLastProdId;
    delete this._leftCount;
    this.$orderBtn.text($li.find('.txt').text());
    this.$list.empty();

    this._handleLoadWithNewOrder(orderType);
    this._popupService.close();
  },

  _handleClickChangeFilters: function(e) {
    var $target = $(e.currentTarget);
    if (!this._filters) {
      this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.CODE }).done($.proxy(this._handleLoadFilters, this, $target));
    } else {
      this._openSelectFiltersPopup($target);
    }
  },

  _handleLoadFilters: function($target, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    this._filters = resp.result;
    this._openSelectFiltersPopup($target);
  },

  _openSelectFiltersPopup: function($target) {
    var currentFilters = this._params.searchFltIds,
      currentTag = this._params.searchTagId;
    this._hasSelectedTag = !!currentTag;

    var filters = _.chain(this._filters.filters)
      .map(function(filter) {
        return {
          prodFltId: filter.prodFltId,
          prodFltNm: filter.prodFltNm,
          subFilters:
            currentFilters && currentFilters.length > 0
              ? _.map(filter.subFilters, function(subFilter) {
                  if (currentFilters.indexOf(subFilter.prodFltId) >= 0) {
                    return $.extend({ checked: true }, subFilter);
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
            return $.extend({ checked: true }, tag);
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
      $.proxy(this._handleCloseSelectFilterPopup, this),
      'search',
      $target
    );
  },

  _handleOpenSelectFilterPopup: function($layer) {
    $layer.find('.select-list li.checkbox').click(_.debounce($.proxy(this._handleClickFilter, this, $layer), 300));
    $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
    $layer.on('click', '.resetbtn', $.proxy(this._handleResetFilters, this, $layer));
    $layer.find('.link').click(_.debounce($.proxy(this._openSelectTagPopup, this, $layer), 300));
  },

  _handleCloseSelectFilterPopup: function() {
    if (this._loadedNewSearch) {
      if (this._params.searchFltIds) {
        location.href = location.pathname + '?filters=' + this._params.searchFltIds;
      } else if (this._params.searchTagId) {
        location.href = location.pathname + '?tag=' + this._params.searchTagId;
      } else {
        location.href = location.pathname;
      }
    }
  },

  _handleClickFilter: function($layer, e) {
    var $target = $(e.currentTarget),
      $selectedTag = $layer.find('.suggest-tag-list .link.active');
    if ($selectedTag.length > 0) {
      $target.removeClass('checked').attr('aria-checked', false).find('input').removeAttr('checked');
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A17;
      this._popupService.openConfirmButton(
        ALERT.MSG,
        ALERT.TITLE,
        $.proxy(this._handleResetSelectedTag, this, $selectedTag, $target),
        $.proxy(this._handleCloseFilterAlert, this),
        Tw.BUTTON_LABEL.CLOSE,
        undefined,
        $target
      );
    }
  },

  _handleCloseFilterAlert: function() {
    if (this._hasSelectedTag) {
      this.$container.find('.select-list li.checkbox.checked').removeClass('checked').prop('aria-checked', false).find('input').removeAttr('checked');
    }
  },

  _handleResetSelectedTag: function($selectedTag, $target) {
    this._hasSelectedTag = false;
    $selectedTag.removeClass('active');
    $target.addClass('checked').attr('aria-checked', true).find('input').attr('checked', true);
    this._popupService.close();
  },

  _handleResetFilters: function($layer) {
    var selectedFilters = $layer.find('li[aria-checked="true"]'),
      selectedTag = $layer.find('.suggest-tag-list .link.active');
    selectedFilters.attr('aria-checked', false).removeClass('checked');
    selectedFilters.find('input').removeAttr('checked');

    if (selectedTag.length > 0) {
      selectedTag.removeClass('active');
    }
  },

  _openSelectTagPopup: function($layer, e) {
    if ($layer.find('li[aria-checked="true"]').length > 0) {
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A16;
      this._popupService.openConfirmButton(
        ALERT.MSG,
        ALERT.TITLE,
        $.proxy(this._handleConfirmSelectTag, this, e.currentTarget),
        null,
        Tw.BUTTON_LABEL.CLOSE,
        undefined,
        $(e.currentTarget)
      );
    } else {
      this._handleSelectTag(e.currentTarget);
    }
  },

  _handleSelectFilters: function($layer) {
    var searchFltIds = _.map($layer.find('input[checked="checked"]'), function(input) {
        return input.getAttribute('data-filter-id');
      }).join(','),
      originParams = this._params;

    if (searchFltIds.length === 0 && $layer.find('button.active').length > 0) {
      this._popupService.close();
      return;
    }

    this._params = { idxCtgCd: this.CODE };
    this._params.searchFltIds = searchFltIds;

    this._apiService
      .request(Tw.API_CMD.BFF_10_0031, this._params)
      .done($.proxy(this._handleLoadDataWithNewFilters, this, originParams, $layer.find('.bt-red1')));
  },

  _handleLoadDataWithNewFilters: function(originParams, $target, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    if (resp.result.products.length === 0) {
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A18;
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, undefined, undefined, undefined, $target);
      this._params = originParams;
    } else {
      this._popupService.close();
      this._loadedNewSearch = true;
    }
  },

  _handleConfirmSelectTag: function(target) {
    this._popupService.close();
    this._handleSelectTag(target);
  },

  _handleSelectTag: function(target) {
    var selectedTag = target.getAttribute('data-tag-id'),
      originParams = this._params;

    if (this._params.searchTagId === selectedTag) {
      this._popupService.close();
      return;
    }

    this._params = { idxCtgCd: this.CODE };
    this._params.searchTagId = selectedTag;
    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleLoadDataWithNewFilters, this, originParams, $(target)));
  },

  _isEmptyAmount: function(value) {
    return !value || value === '' || value === '-';
  }
};
