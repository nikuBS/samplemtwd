/**
 * MenuName: T로밍 > 로밍 요금제 (RM_11)
 * @file product.roaming.fee.js
 * @author Eunjung Jung
 * @since 2018.11.12
 */

Tw.ProductRoamingFee = function (rootEl, params, pageInfo) {
  this.$container = rootEl;
  this.RM_CODE = pageInfo.code;
  this._popupService = Tw.Popup;
  this._param = params;

  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._findElement();
  this._bindRoamingPlanBtnEvents();
  this._roamingFeeInit();
};

Tw.ProductRoamingFee.prototype = {
  DEFAULT_ORDER: 'recommand',   // 리스트 정렬 기본 값 추천순
  CURRENT_ORDER : '',
  ORDER: {
      recommand: 0,
      highprice: 1,
      lowprice: 2
  },
  _roamingFeeInit: function () {
      this._params = {
          'idxCtgCd':'',            // 인덱스 카테고리
          'searchLastProdId':'',    // 조회 마지막 상품ID
          'searchFltIds ':'',       // 검색 필터들
          'searchTagId':'',         // 태그 검색
          'searchOrder':'',         // 정렬 옵션
          'searchCount':'',         // 조회개수(1 ~ 100)
          'ignoreProdId':''         // 무시할 삼품 정보
      };
      if(this._param.searchFltIds){
          this._params.searchFltIds = this._param.searchFltIds;
      }

      if(this._param.searchOrder){
          this._params.searchOrder = this._param.searchOrder;
      }

      this._params.idxCtgCd = this.RM_CODE;
      if(this._param.searchTagId){
          this._params.searchTagId = this._param.searchTagId;
          this.selectPlanTag = true;
      }else {
          this.selectPlanTag = false;
      }
      this._reset = false;
      this._params.searchLastProdId = this.$addBtn.data('last-product');
      this._leftCount = this.$addBtn.data('left-count');

      this._rmListTmpl = Handlebars.compile($('#fe-rmtmpl-plan').html());
      this._rmFilterTmpl = Handlebars.compile($('#fe-rmtmpl-filter').html());
  },
  _bindRoamingPlanBtnEvents: function () {
    this.$container.on('click', '.bt-more > button', $.proxy(this._handleMoreRoamingPlan, this));       // 더보기 버튼 클릭 이벤트
    this.$container.on('click', '.fe-roaming-order', $.proxy(this._openRoamingOrderPopup, this));       // 상품 정렬 클릭 이벤트
    this.$container.on('click', '.fe-roaming-filter', $.proxy(this._handleRoamingPlanFilters, this));   // 조건선택 클릭 이벤트
  },
  _findElement: function () {
    this.$addBtn = this.$container.find('.bt-more > button');                   // 더보기 버튼
    this.$roamingPlanlist = this.$container.find('ul.recommendedrate-list');    // 로밍 요금제 상품 리스트
    this.$roamingPlanItemCnt = this.$container.find('.fe-fee-cnt');             // 상품 리스트 개수
  },
  /**
   * 로밍 요금제 필터/태그 조회 요청.
   * @param event
   * @private
   */
  _handleRoamingPlanFilters: function(event) {
      if (!this._roamingFilters) {
          this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.RM_CODE })
          // $.ajax('http://localhost:3000/mock/product.roaming.BFF_10_0032.json')
              .done($.proxy(this._handleGetFilters, this, event));
      } else {
          this._openRoamingFiltersPopup(event);
      }
  },
   /**
    * _handleRoamingPlanFilters Success callback
    * @param event
    * @param resp
    * @private
    */
   _handleGetFilters: function(event, resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
          Tw.Error(resp.code, resp.msg).pop();
          return;
      }
      this._roamingFilters = resp.result;
      this._openRoamingFiltersPopup(event);
  },
  /**
   * 조회된 필터 정보들로 조건선택 팝업 호출.
   * @param event
   * @private
   */
  _openRoamingFiltersPopup: function (event) {
    var rmFilters = _.chain(this._roamingFilters.filters)
        .map(
            $.proxy(function(filter) {
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
            }, this)
          )
        .value();

    var currentTag = this._params.searchTagId;
      var tags = currentTag ?
        _.map(this._roamingFilters.tags, function(tag) {
              if (currentTag === tag.tagId) {
                  return $.extend({ checked: true }, tag);
              }
              return tag;
          })
          : this._roamingFilters.tags;

    this._popupService.open(
        {
            hbs: 'RM_11_01',
            data: {
                filters: rmFilters,
                tags: tags
            }
        },
        $.proxy(this._handleOpenFilterPopup, this),
        $.proxy(this._handleCloseFilterPopup, this),
        'search', $(event.currentTarget)
    );
  },
  _handleOpenFilterPopup: function ($layer) {
      $layer.on('click', '.btn-type01', $.proxy(this._bindFilterBtnEvent, this, $layer));       // 필터 버튼 클릭 이벤트
      $layer.on('click', '.resetbtn', $.proxy(this._handleResetBtn, this, $layer));             // 조건선택 팝업 초기화 클릭 이벤트
      $layer.on('click', '.bt-red1', $.proxy(this._handleRoamingSelectFilters, this, $layer));  // 적용하기 버튼 클릭 이벤트
      $layer.on('click', '.link', $.proxy(this._openRoamingTagPopup, this, $layer));            // 태그 버튼 클릭 이벤트
  },
  _handleCloseFilterPopup: function () {
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
   * 조건선택 팝업에서 태그 선택.
   * @private
   */
  _openRoamingTagPopup: function($layer, e) {
      // 필터가 선택된 상태에서 태그를 선택할 경우 alert호출.
      if ($layer.find('input[checked="checked"]').length > 0) {
          this._popupService.openConfirmButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A16.MSG,
              Tw.ALERT_MSG_PRODUCT.ALERT_3_A16.TITLE,
              $.proxy(this._handleSelectRomaingTag, this, e.currentTarget),
              null, Tw.BUTTON_LABEL.CLOSE,
              null, $(e.currentTarget));
      } else {
          this._handleSelectRomaingTag(e.currentTarget);
      }
  },
  /**
   * 로밍 요금제 조건선택 팝업에서 태그 선택 시 URL이동.
   * @private
   */
  _handleSelectRomaingTag: function(target) {
    var selectedTag = target.getAttribute('data-rmtag-id');

      if(selectedTag) {
          this.selectTag = true;
      }

    // 현재 적용되어 있는 태그와 선택된 태그가 같은 경우 팝업 닫기.
    if (this._params.searchTagId === selectedTag) {
        this._popupService.closeAll();
      return;
    }
    this._history.goLoad('/product/roaming/fee?tag=' + selectedTag);
  },
  /**
   * 로밍 요금제 조건선택 팝업 초기화 기능.
   */
  _handleResetBtn: function ($layer) {
      $layer.find('.btn-type01').removeClass('checked');
      $layer.find('input').removeAttr('checked');

      var selectedTag = $layer.find('.suggest-tag-list .link.active');
      if (selectedTag.length > 0) {
          selectedTag.removeClass('active');
      }

      this._reset = true;
      this.selectPlanTag = false;
    },
  /**
   * 로밍 요금제 조건선택 팝업 > 필터 선택.
   * @private
   */
  _bindFilterBtnEvent: function ($layer, e) {
    this.$filterBtn = $(e.currentTarget);
    this.$selectBtn =  $(e.currentTarget).find('input');
    this.selectFilter = this.$selectBtn.attr('data-rmfilter-id');
    var $selectTag = $layer.find('.suggest-tag-list .link.active');
    // 태그가 선택된 상태에서 필터 선택 시 alert 호출.
    if($selectTag.length > 0){
      var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A17;
      this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE,
        $.proxy(this._handleResetTag, this, $layer, this.$filterBtn), null, Tw.BUTTON_LABEL.CLOSE, null, $(e.currentTarget));
    } else {
      if(this.$filterBtn.hasClass('checked')){
          this.$filterBtn.removeClass('checked');
          this.$selectBtn.removeAttr('checked');
      }else {
          this.$filterBtn.addClass('checked');
          this.$selectBtn.attr('checked','checked');
      }
      this._reset = false;
    }
  },
  /**
   * 로밍 요금제 조건선택 팝업 필터 선택 후 적용하기 버튼 기능.
   * @private
   */
  _handleRoamingSelectFilters: function ($layer){
      // 선택된 필터 값
      var searchRmFltIds = _.map($layer.find('input[checked="checked"]'), function(input) {
          return input.getAttribute('data-rmfilter-id');
      }).join(','),
      originParams = this._params;

      if (searchRmFltIds === '' && $layer.find('button.active').length > 0) {
          this._popupService.close();
          return;
      }

      this._params = { idxCtgCd: this.RM_CODE };
      this._params.searchFltIds = searchRmFltIds;
      this._params.searchOrder = this.CURRENT_ORDER;

      Tw.Logger.info('[this._params]', this._params);

      this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params)
          .done($.proxy(this._handleLoadNewFilters, this, originParams));
  },
  /**
   * _handleRoamingSelectFilters Success callback
   * @private
   */
  _handleLoadNewFilters: function(originParams, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(resp.code, resp.msg).pop();
        return;
    }

    if (resp.result.products.length === 0) {
        this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A18.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A18.TITLE);
        this._params = originParams;
    } else {
        this._popupService.close();
        this._loadedNewSearch = true;
    }
  },
  /**
   * 더보기 버튼 선택 시 로밍 요금제 리스트 요청.
   * @private
   */
  _handleMoreRoamingPlan: function () {
      this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params)
          .done($.proxy(this._handleSuccessMoreData, this, undefined));
  },
  /**
   * _handleMoreRoamingPlan Success callback
   * @private
   */
  _handleSuccessMoreData: function (orderType, resp) {

      Tw.Logger.info('success more data orderType : ', orderType);
      Tw.Logger.info('success more data resp : ', resp);

      if (resp.code !== Tw.API_CODE.CODE_00) {
          Tw.Error(resp.code, resp.msg).pop();
          return;
      }

      if (orderType) {
          location.href = Tw.UrlHelper.replaceQueryParam('order', orderType);
      }

      var items = _.map(resp.result.products, function(item) {
          item.isNumber = $.isNumeric(Number(item.basFeeAmt));
          item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeAmt);
          return item;
      });

      var srchOrder = resp.result.searchOption.searchOrder;

      this.CURRENT_ORDER = srchOrder;

      this._params.searchLastProdId = items[items.length - 1].prodId;
      this._leftCount = (this._leftCount || resp.result.productCount) - items.length;

      if (this._leftCount > 0) {
          if (this.$addBtn.hasClass('none')) {
              this.$addBtn.removeClass('none');
          }
          this.$addBtn.text(this.$addBtn.text().replace(/\((.+?)\)/, '(' + this._leftCount + ')'));
      } else {
          this.$addBtn.addClass('none');
      }

      this.$roamingPlanlist.append(this._rmListTmpl({ items: items }));
      this.$roamingPlanItemCnt.text(resp.result.productCount);
  },
  /**
   * 로밍 요금제 리스트 정렬
   * @private
   */
  _openRoamingOrderPopup: function () {
      var searchType = this._params.searchOrder || this.DEFAULT_ORDER;
      this.orderList = _.map(Tw.PRODUCT_ROAMING_ORDER, function(item) {
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
              btnfloating: { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
              layer: true,
              data: [{ list: this.orderList }]
          },
          $.proxy(this._handleOpenOrderPopup, this),
          undefined,
          'order'
      );
  },
  /**
   * 리스트 정렬 action sheet openCallback
   * @private
   */
  _handleOpenOrderPopup: function ($layer) {
    // var searchType = this.ORDER[this._params.searchOrder || this.DEFAULT_ORDER];
    //
    // $layer.find('[id="ra' + searchType + '"]').attr('checked', 'checked');
    $layer.find('[data-role="fe-bt-close"]').on('click', $.proxy(this._popupService.close, this));
    $layer.on('click', 'ul.ac-list > li', $.proxy(this._handleSelectRoamingOrder, this));
  },
  /**
   *  태그 선택 초기화 기능
   * @param $layer
   * @param $target
   * @private
   */
  _handleResetTag: function ($layer, $target) {
      this._popupService.close();
      this.selectPlanTag = false;

      this.$filterBtn = $target;
      this.$selectBtn =  $target.find('input');
      this.selectFilter = this.$selectBtn.attr('data-rmfilter-id');

      var selectedTag = $layer.find('.suggest-tag-list .link.active');
      if (selectedTag.length > 0) {
          selectedTag.removeClass('active');
      }

      if(this.$filterBtn.hasClass('checked')){
          this.$filterBtn.removeClass('checked');
          this.$selectBtn.removeAttr('checked');
          // $layer.find('input[data-rmfilter-id=F01526]').removeAttr('checked');
          // $layer.find('input[data-rmfilter-id=F01526]').parent().removeClass('checked');
      }else {
          this.$filterBtn.addClass('checked');
          this.$selectBtn.attr('checked','checked');
      }
  },
  /**
   * 로밍 요금제 리스트 정렬 방식 선택
   * @param e
   * @private
   */
  _handleSelectRoamingOrder: function (e) {
      var $target = $(e.currentTarget);
      var $list = $target.parent();
      this.orderTypeIdx = $list.find('li').index($target);
      var orderType = this._getRoamingOrderType($list.find('li').index($target));

      if (this._params.searchOrder === orderType) {
          return;
      }

      this._params.searchOrder = orderType;
      delete this._params.searchLastProdId;
      delete this._leftCount;
      this.$container.find('.fe-roaming-order').text(this.orderList[this.orderTypeIdx].txt);
      this.$roamingPlanlist.empty();

      this._handleLoadNewOrder(orderType);
      this._popupService.close();
  },
  /**
   * 선택한 정렬방식으로 로밍 요금제 리스트 요청.
   * @param orderType
   * @private
   */
  _handleLoadNewOrder:function (orderType) {
      this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleSuccessMoreData, this, orderType));
  },
  _getRoamingOrderType: function(idx) {
      var keys = Object.keys(this.ORDER),
          i = 0;
       for (; i < keys.length; i++) {
          if (this.ORDER[keys[i]] === idx) {
              return keys[i];
          }
      }
  }
};