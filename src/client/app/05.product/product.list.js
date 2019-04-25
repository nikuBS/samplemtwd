/**
 * @file 요금제, 부가서비스 리스트 < 상품
 * @author Jiyoung Jo
 * @since 2018.10.09
 */

Tw.ProductList = function(rootEl, params, pageInfo) {
  this.$container = rootEl;
  this._params = params;

  this.CODE = pageInfo.code;
  this.TYPE = pageInfo.type;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductList.prototype = {
  DEFAULT_ORDER: 'recommand',
  ORDER: {
    recommand: 0,
    highprice: 1,
    lowprice: 2
  },

  /**
   * @desc 핸들바 등 추기화
   * @private
   */
  _init: function() {
    this._params.idxCtgCd = this.CODE;
    this._params.searchLastProdId = this.$moreBtn.data('last-product');
    this._leftCount = this.$moreBtn.data('left-count');
    this._listTmpl = Handlebars.compile($('#fe-templ-' + this.TYPE).html());
    this._filterTmpl = Handlebars.compile($('#fe-templ-filters').html());
  },

  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$moreBtn.on('click', $.proxy(this._handleLoadMore, this));
    this.$orderBtn.click(_.debounce($.proxy(this._openOrderPopup, this), 300));
    this.$container.find('.fe-select-filter').click(_.debounce($.proxy(this._handleClickChangeFilters, this), 300));
  },

  /**
   * @desc jquery 객체 캐싱
   * @private
   */
  _cachedElement: function() {
    this.$total = this.$container.find('.number-text');
    this.$moreBtn = this.$container.find('.extraservice-more > button');
    this.$list = this.$container.find('ul.extraservice-list');
    this.$orderBtn = this.$container.find('.fe-select-order');
    this.$filters = this.$container.find('.fe-select-filter');
  },

  /**
   * @desc 더보기 버튼 클릭시 BFF 서버에 요청
   * @private
   */
  _handleLoadMore: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleSuccessLoadingData, this, undefined));
  },

  /**
   * @desc 순서를 바겼을 때
   * @param {string} order 리스팅 순서
   * @private
   */
  _handleLoadWithNewOrder: function(order) {
    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleSuccessLoadingData, this, order));
  },

  /**
   * @desc 새로운 데이터가 로딩됐을 때
   * @param {string} order 리스팅 순서
   * @param {object} resp 서버 응답
   * @private
   */
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

  /**
   * @desc 상품 데이터 변경
   * @param {object} item 상품 항목 1개
   */
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
      var data = Number(item.basOfrMbDataQtyCtt);
      
      if (isNaN(data)) {
        item.basOfrDataQtyCtt = item.basOfrMbDataQtyCtt;
      } else {
        data = Tw.FormatHelper.convDataFormat(item.basOfrMbDataQtyCtt, Tw.DATA_UNIT.MB);
        item.basOfrDataQtyCtt = data.data + data.unit;
        item.basOfrDataQtyCtt = data + Tw.DATA_UNIT.GB;
      }

      
    }

    item.basOfrVcallTmsCtt = this._isEmptyAmount(item.basOfrVcallTmsCtt) ? null : Tw.FormatHelper.appendVoiceUnit(item.basOfrVcallTmsCtt);
    item.basOfrCharCntCtt = this._isEmptyAmount(item.basOfrCharCntCtt) ? null : Tw.FormatHelper.appendSMSUnit(item.basOfrCharCntCtt);

    if (this.CODE === 'F01100') {
      item.filters = _.filter(item.filters, function(filter, idx, filters) {
        // 기기, 데이터, 대상 필터 1개씩만 노출
        return _.findIndex(filters, function(item) {
            return item.supProdFltId === filter.supProdFltId;
          }) === idx && /^F011[2|3|6]0$/.test(filter.supProdFltId);
      });
    }

    return item;
  },

  /**
   * @desc 리스팅 순서 변경 팝업 오픈
   * @private
   */
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

  /**
   * @desc 리스팅 순서 변경 팝업 오픈 시 이벤트 바인딩
   * @param {$object} $layer 팝업 레이어 jquery 객체
   * @private
   */
  _handleOpenOrderPopup: function($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer);
    $layer.on('change', 'li input', $.proxy(this._handleSelectOrder, this));
  },

  /**
   * @desc 리스팅 순서 변경 클릭 시
   * @param {Event} e 클릭 이벤트 객체
   * @private
   */
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

  /**
   * @desc 사용자가 필터 클릭 시
   * @param {Event} e 클릭 이벤트 객체
   * @private
   */
  _handleClickChangeFilters: function(e) {
    var $target = $(e.currentTarget);
    if (!this._filters) { // 필터 리스트가 없을 경우 BFF에 요청
      this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.CODE }).done($.proxy(this._handleLoadFilters, this, $target));
    } else {
      this._openSelectFiltersPopup($target);
    }
  },

  /**
   * @desc 필터 리스트 요청 응답 시
   * @param {$object} $target 팝업 닫은 후 포커스 이동을 위한 jquery 객체
   * @param {*} resp 
   * @private
   */
  _handleLoadFilters: function($target, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      return;
    }

    this._filters = resp.result;
    this._openSelectFiltersPopup($target);
  },

  /**
   * @desc 필터 변경 팝업 오픈 시 기선택된 필터, 태그 선택 처리 추가
   * @param {$object} $target 팝업 닫은 후 포커스 이동을 위한 jquery 객체
   * @private
   */
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
            currentFilters && currentFilters.length > 0 ? 
              _.map(filter.subFilters, function(subFilter) {
                if (currentFilters.indexOf(subFilter.prodFltId) >= 0) {
                  return $.extend({ checked: true }, subFilter);
                }
                return subFilter;
              }) : 
              filter.subFilters
        };
      })
      .value();

    var tags = currentTag ? 
      _.map(this._filters.tags, function(tag) {
        if (currentTag === tag.tagId) {
          return $.extend({ checked: true }, tag);
        }
        return tag;
      }) : 
      this._filters.tags;

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

  /**
   * @desc 필터 변경 팝업 오픈 시 팝업에 이벤트 바인딩
   * @param {$object} $layer 팝업 레이어 jquery 객체
   * @private
   */
  _handleOpenSelectFilterPopup: function($layer) {
    $layer.find('.select-list li.checkbox').click(_.debounce($.proxy(this._handleClickFilter, this, $layer), 300));
    $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
    $layer.on('click', '.resetbtn', $.proxy(this._handleResetFilters, this, $layer));
    $layer.find('.link').click(_.debounce($.proxy(this._openSelectTagPopup, this, $layer), 300));
  },

  /**
   * @desc 필터 변경 후, 히스토리 관리를 위해서 새로운 페이지로 이동 시킴(기획 요청 사항)
   * @private
   */
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

  /**
   * @desc 필터 클릭 시 
   * @param {$object} $layer 필터 변경 팝업 레이어 jquery 객체
   * @param {Event} e 클릭 이벤트
   * @private
   */
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

  /**
   * @desc 기 선택된 태그가 있을 때, 사용자가 필터 선택 Alert에서 취소 버튼 클릭 시 현재 선택된 필터 지움
   * @private
   */
  _handleCloseFilterAlert: function() {
    if (this._hasSelectedTag) {
      this.$container.find('.select-list li.checkbox.checked').removeClass('checked').prop('aria-checked', false).find('input').removeAttr('checked');
    }
  },

  /**
   * @desc 기 선택된 태그가 있을 때, 사용자가 필터 선택 Alert에서 확인 버튼 클릭 시 기선택된 태그 상태 지움
   * @private
   */
  _handleResetSelectedTag: function($selectedTag, $target) {
    this._hasSelectedTag = false;
    $selectedTag.removeClass('active');
    $target.addClass('checked').attr('aria-checked', true).find('input').attr('checked', true);
    this._popupService.close();
  },

  /**
   * @desc 필터 선택 초기화 버튼 클릭 시 선택된 필터 or 태그 지움
   * @param {$object} $layer 필터 변경 팝업 레이어 jquery 객체
   * @private
   */
  _handleResetFilters: function($layer) {
    var selectedFilters = $layer.find('li[aria-checked="true"]'),
      selectedTag = $layer.find('.suggest-tag-list .link.active');
    selectedFilters.attr('aria-checked', false).removeClass('checked');
    selectedFilters.find('input').removeAttr('checked');

    if (selectedTag.length > 0) {
      selectedTag.removeClass('active');
    }
  },

  /**
   * @desc 필터 변경 팝업에서 태그 클릭 시
   * @param {$object} $layer 필터 변경 팝업 레이어 jquery 객체
   * @param {Event}} e 클릭 이벤트 객체
   */
  _openSelectTagPopup: function($layer, e) {
    var $target = $(e.currentTarget);
    if ($layer.find('li[aria-checked="true"]').length > 0) {
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A16;
      this._popupService.openConfirmButton(
        ALERT.MSG,
        ALERT.TITLE,
        $.proxy(this._handleConfirmSelectTag, this, $target),
        null,
        Tw.BUTTON_LABEL.CLOSE,
        undefined,
        $target
      );
    } else {
      this._handleSelectTag($target);
    }
  },

  /**
   * @desc 필터 변경하기 버튼 클릭 시 필터 적용
   * @param {$object} $layer 필터 변경 팝업 레이어 jquery 객체
   * @private
   */
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

  /**
   * @desc 리스트 데이터 요청 응답 시
   * @param {object} originParams 필터 변경되기 전 파라미터
   * @param {$object} $target alert 후 포커스 이동을 위한 타깃 jquery 객체
   * @param {object} resp 서버 응답 값
   * @private
   */
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

  /**
   * @desc '선택된 필터가 해제되고 태그가 선택됩니다' alert 창에서 확인 버튼 클릭 시
   * @param {$object} $target alert 후 포커스 이동을 위한 타깃 jquery 객체
   * @private
   */
  _handleConfirmSelectTag: function($target) {
    this._popupService.close();
    this._handleSelectTag($target);
  },

  /**
   * @desc 태그 선택 시
   * @param {$object} $target alert 후 포커스 이동을 위한 타깃 jquery 객체
   * @private
   */
  _handleSelectTag: function($target) {
    var selectedTag = $target.data('tag-id'),
      originParams = this._params;

    if (this._params.searchTagId === selectedTag) {
      this._popupService.close();
      return;
    }

    this._params = { idxCtgCd: this.CODE };
    this._params.searchTagId = selectedTag;
    this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleLoadDataWithNewFilters, this, originParams, $target));
  },

  /**
   * @desc BFF의 음성, 데이터, 문자 데이터가 빈 값인지 확인
   * @param {string} value BFF의 음성, 데이터, 문자 데이터
   * @private
   */
  _isEmptyAmount: function(value) {
    return !value || value === '' || value === '-';
  }
};
