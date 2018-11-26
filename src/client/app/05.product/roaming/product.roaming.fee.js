/**
 * FileName: product.roaming.fee.js
 * Author: Eunjung Jung ()
 * Date: 2018.11.12
 */

Tw.ProductRoamingFee = function (rootEl, pageInfo) {
  this.$container = rootEl;
  this.RM_CODE = pageInfo.code;
  this._popupService = Tw.Popup;

  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._findElement();
  this._bindRoamingPlanBtnEvents();
  this._roamingFeeInit();
};

Tw.ProductRoamingFee.prototype = {
  DEFAULT_ORDER: 'recommand',
  ORDER: {
      recommand: 0,
      highprice: 1,
      lowprice: 2
  },
  _roamingFeeInit: function () {
      this._params = {
          'idxCtgCd':'',
          'searchLastProdId':'',
          'searchFltIds ':'',
          'searchTagId':'',
          'searchOrder':'',
          'searchCount':'',
          'ignoreProdId':''
      };

      this._params.idxCtgCd = this.RM_CODE;
      this._params.searchLastProdId = this.$addBtn.data('last-product');
      this._leftCount = this.$addBtn.data('left-count');

      this._rmListTmpl = Handlebars.compile($('#fe-rmtmpl-plan').html());
      this._rmFilterTmpl = Handlebars.compile($('#fe-rmtmpl-filter').html());

      console.log('params ==== ' + JSON.stringify(this._params));
      console.log(' leftCount : ' + this._leftCount);
  },
  _bindRoamingPlanBtnEvents: function () {
    this.$container.on('click', '.bt-more > button', $.proxy(this._handleMoreRoamingPlan, this));
    this.$container.on('click', '.fe-roaming-order', $.proxy(this._openRoamingOrderPopup, this));
    this.$container.on('click', '.fe-roaming-filter', $.proxy(this._handleRoamingPlanFilters, this));
  },
  _findElement: function () {
    this.$addBtn = this.$container.find('.bt-more > button');
    this.$roamingPlanlist = this.$container.find('ul.recommendedrate-list');
  },
  _handleRoamingPlanFilters: function() {
      if (!this._roamingFilters) {
          this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.RM_CODE })
              .done($.proxy(this._handleGetFilters, this));
      } else {
          this._openRoamingFiltersPopup();
      }
  },
   _handleGetFilters: function(resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
          Tw.Error(resp.code, resp.msg).pop();
          return;
      }
      this._roamingFilters = resp.result;
      this._openRoamingFiltersPopup();
  },
  _openRoamingFiltersPopup: function () {

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

    console.log('rmFilters == ' + JSON.stringify(rmFilters));

    this._popupService.open(
        {
            hbs: 'RM_11_01',
            data: {
                filters: rmFilters,
                tags: this._roamingFilters.tags
            }
        },
        $.proxy(this._handleOpenFilterPopup, this),
        undefined,
        'search'
    );
  },
  _handleOpenFilterPopup: function ($layer) {
      $layer.on('click', '.btn-type01', $.proxy(this._bindFilterBtnEvent, this, $layer));
      $layer.on('click', '.resetbtn', $.proxy(this._handleResetBtn, this, $layer));
      $layer.on('click', '.bt-red1', $.proxy(this._handleRoamingSelectFilters, this, $layer));
      $layer.on('click', '.link', $.proxy(this._openRoamingTagPopup, this, $layer));
  },
  _openRoamingTagPopup: function($layer, e) {
      if ($layer.find('input[checked="checked"]').length > 0) {
          this._popupService.openConfirm(Tw.ALERT_MSG_PRODUCT.ALERT_3_A16.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A16.TITLE,
              $.proxy(this._handleSelectRomaingTag, this, e.currentTarget));
      } else {
          this._handleSelectRomaingTag(e.currentTarget);
      }
  },
  _handleSelectRomaingTag: function(target) {
      var selectedTag = target.getAttribute('data-rmtag-id');
      if (this._params.selectedTagId === selectedTag) {
          this._popupService.close();
          return;
      }

    },
  _handleResetBtn: function ($layer) {
    $layer.find('.btn-type01').removeClass('checked');
    $layer.find('input').removeAttr('checked');
  },
  _bindFilterBtnEvent: function ($layer, e) {
    this.$filterBtn = $(e.currentTarget);
    this.$selectBtn =  $(e.currentTarget).find('input');
    this.selectFilter = this.$selectBtn.attr('data-rmfilter-id');

    if(this.selectFilter!=='F01526'){
        if(this.$filterBtn.hasClass('checked')){
            this.$filterBtn.removeClass('checked');
            this.$selectBtn.removeAttr('checked');
        }else {
            this.$filterBtn.addClass('checked');
            this.$selectBtn.attr('checked','checked');
        }
    }else {
        if(this.$selectBtn.parent('li').hasClass('checked')){
            this.$filterBtn.siblings().removeClass('checked');
            this.$filterBtn.removeClass('checked');

            this.$filterBtn.siblings().find('input').removeAttr('checked');
            this.$selectBtn.removeAttr('checked');
        }else {
            this.$filterBtn.siblings().addClass('checked');
            this.$filterBtn.addClass('checked');

            this.$filterBtn.siblings().find('input').attr('checked','checked');
            this.$selectBtn.attr('checked', 'checked');
        }
    }

  },
    _handleRoamingSelectFilters: function ($layer){
      var searchRmFltIds = _.map($layer.find('input[checked="checked"]'), function(input) {
          return input.getAttribute('data-rmfilter-id');
      }).join(',');

      console.log(searchRmFltIds);

      this._params = { idxCtgCd: this.RM_CODE };
      this._params.searchFltIds = searchRmFltIds;
      console.log(this._params);
      this._apiService.request(Tw.API_CMD.BFF_10_0000, this._params)
          .done($.proxy(this._handleLoadNewFilters, this));
  },
    _handleLoadNewFilters: function(resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
          Tw.Error(resp.code, resp.msg).pop();
          return;
      }

      if (resp.result.products.length === 0) {
          this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A18.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A18.TITLE);
      } else {
          delete this._params.searchLastProdId;
          delete this._leftCount;
          this.$roamingPlanlist.empty();

          if (resp.result.searchOption && resp.result.searchOption.searchFltIds) {
              var filters = resp.result.searchOption.searchFltIds;
              var $filters = this.$container.find('.fe-roaming-filter');
              var data = {};
              data.filters = _.map(filters.slice(0, 2), function(filter, index, arr) {
                  if (index === 0 && arr.length === 2) {
                      return filter.prodFltNm + ',';
                  }
                  return filter.prodFltNm;
              });

              if (filters.length > 2) {
                  data.leftCount = filters.length - 2;
              }
              $filters.html(this._rmFilterTmpl(data));
          }

          this._popupService.close();
          this._handleSuccessMoreData(resp);
      }
  },
  _handleMoreRoamingPlan: function () {
      this._apiService.request(Tw.API_CMD.BFF_10_0000, this._params)
          .done($.proxy(this._handleSuccessMoreData, this));
  },
  _handleSuccessMoreData: function (resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
          Tw.Error(resp.code, resp.msg).pop();
          return;
      }

      var items = _.map(resp.result.products, function(item) {
          item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeAmt);
          return item;
      });

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
  },
  _openRoamingOrderPopup: function () {
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
  _handleOpenOrderPopup: function ($layer) {
    $layer.on('click', 'ul.chk-link-list > li', $.proxy(this._handleSelectRoamingOrder, this));
  },
  _handleSelectRoamingOrder: function (e) {
      var $target = $(e.currentTarget);
      var $list = $target.parent();
      var orderType = this._getRoamingOrderType($list.find('li').index($target));

      if (this._params.searchOrder === orderType) {
          return;
      }

      this._params.searchOrder = orderType;
      delete this._params.searchLastProdId;
      delete this._leftCount;
      this.$container.find('.fe-roaming-order').text($target.find('span').text());
      this.$roamingPlanlist.empty();

      this._handleMoreRoamingPlan();
      this._popupService.close();
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