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
    this.$orderBtn.on('click', $.proxy(this._openOrderPopup, this));
    this.$container.on('click', '.fe-select-filter', $.proxy(this._handleClickChangeFilters, this));
  },

  cachedElement: function() {
    this.$total = this.$container.find('.number-text');
    this.$moreBtn = this.$container.find('.extraservice-more > button');
    this.$list = this.$container.find('ul.extraservice-list');
    this.$orderBtn = this.$container.find('.fe-select-order');
    this.$filters = this.$container.find('.fe-select-filter');
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

    var hasNone = this.$moreBtn.hasClass('none');
    if (this._leftCount > 0) {
      if (hasNone) {
        this.$moreBtn.removeClass('none');
      }
    } else if (!hasNone) {
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
      'order'
    );
  },

  _handleOpenOrderPopup: function($layer) {
    $layer.on('click', 'li.type1', $.proxy(this._handleSelectOrder, this));
  },

  _handleSelectOrder: function(e) {
    var $target = $(e.currentTarget);
    var orderType = $target.find('input').data('order');

    if (this._params.searchOrder === orderType) {
      return;
    }

    this._params.searchOrder = orderType;
    delete this._params.searchLastProdId;
    delete this._leftCount;
    this.$orderBtn.text($target.find('.txt').text());
    this.$list.empty();

    this._handleLoadMore();
    this._popupService.close();
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
      undefined,
      'search'
    );
  },

  _handleOpenSelectFilterPopup: function($layer) {
    $layer.on('click', '.select-list li.checkbox', $.proxy(this._handleClickFilter, this, $layer));
    $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
    $layer.on('click', '.resetbtn', $.proxy(this._handleResetFilters, this, $layer));
    $layer.on('click', '.link', $.proxy(this._openSelectTagPopup, this, $layer));
  },

  _handleClickFilter: function($layer, e) {
    var $target = $(e.currentTarget);
    if (this._hasSelectedTag) {
      $target.removeClass('checked').attr('aria-checked', false);
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A17;
      this._popupService.openConfirmButton(
        ALERT.MSG,
        ALERT.TITLE,
        $.proxy(this._handleResetSelectedTag, this, $layer, $target),
        null,
        Tw.BUTTON_LABEL.CLOSE
      );
    }
  },

  _handleResetSelectedTag: function($layer, $target) {
    this._hasSelectedTag = false;
    var selectedTag = $layer.find('.suggest-tag-list .link.active');
    if (selectedTag.length > 0) {
      selectedTag.removeClass('active');
    }
    $target.addClass('checked').attr('aria-checked', true);
    this._popupService.close();
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
      this._popupService.openConfirmButton(
        ALERT.MSG,
        ALERT.TITLE,
        $.proxy(this._handleSelectTag, this, e.currentTarget),
        null,
        Tw.BUTTON_LABEL.CLOSE
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

      this.$orderBtn.text(Tw.PRODUCT_LIST_ORDER[this.ORDER['recommand']].txt);

      if (resp.result.searchOption) {
        if (resp.result.searchOption.searchFltIds) {
          var filters = resp.result.searchOption.searchFltIds,
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
          this.$filters.html(this._filterTmpl(data));
        } else if (resp.result.searchOption.searchProdTagNm) {
          this.$filters.html(
            this._filterTmpl({
              leftCount: 0,
              filters: [resp.result.searchOption.searchProdTagNm]
            })
          );
        }
      }

      this._popupService.close();
      this._handleSuccessLoadingData(resp);
    }
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
    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleLoadDataWithNewFilters, this, originParams));
  },

  _isEmptyAmount: function(value) {
    return !value || value === '' || value === '-';
  }
};
