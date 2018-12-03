/**
 * FileName: product.roaming.planadd.js
 * Author: Eunjung Jung ()
 * Date: 2018.11.12
 */

Tw.ProductRoamingPlanAdd = function (rootEl, pageInfo) {
  this.$container = rootEl;
  this.RMADD_CODE = pageInfo.code;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._findAddElement();
  this._bindRoamingAddBtnEvents();
  this._roamingAddInit();
};

Tw.ProductRoamingPlanAdd.prototype = {
  DEFAULT_ORDER: 'recommand',
  ORDER: {
      recommand: 0,
      highprice: 1,
      lowprice: 2
  },
  _roamingAddInit: function () {
      this._params = {
          'idxCtgCd':'',
          'searchLastProdId':'',
          'searchFltIds ':'',
          'searchTagId':'',
          'searchOrder':'',
          'searchCount':'',
          'ignoreProdId':''
      };

      this._params.idxCtgCd = this.RMADD_CODE;
      this._params.searchLastProdId = this.$rmAddBtn.data('last-product');
      this._leftCount = this.$rmAddBtn.data('left-count');

      this._rmListTmpl = Handlebars.compile($('#fe-rmtmpl-add').html());
      this._rmFilterTmpl = Handlebars.compile($('#fe-rmtmpl-addfilter').html());

      console.log('params ==== ' + JSON.stringify(this._params));
      console.log(' leftCount : ' + this._leftCount);
  },
  _findAddElement: function () {
      this.$rmAddBtn = this.$container.find('.bt-more > button');
      this.$rmPlanAddlist = this.$container.find('ul.recommendedrate-list');
      this.$roamingAddItemCnt = this.$container.find('.fe-planadd-cnt');
  },
  _bindRoamingAddBtnEvents: function () {
      this.$container.on('click', '.bt-more > button', $.proxy(this._handleMoreRoamingAdd, this));
      this.$container.on('click', '.fe-rmadd-order', $.proxy(this._openRmAddOrderPopup, this));
      this.$container.on('click', '.fe-rmadd-filter', $.proxy(this._handleRoamingAddFilters, this));
  },
  _handleRoamingAddFilters: function() {
      if (!this._rmAddFilters) {
          this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.RMADD_CODE })
              .done($.proxy(this._handleGetRmAddFilters, this));
      } else {
          this._openRmAddFiltersPopup();
      }
  },
  _openRmAddFiltersPopup: function () {

      var rmAddFilters = _.chain(this._rmAddFilters.filters)
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

      console.log('rm add Filters : ' + JSON.stringify(rmAddFilters));

      this._popupService.open(
          {
              hbs: 'RM_12_01',
              data: {
                  filters: rmAddFilters,
                  tags: this._rmAddFilters.tags
              }
          },
          $.proxy(this._handleOpenAddFilterPopup, this),
          undefined,
          'search'
      );
  },
  _handleOpenAddFilterPopup: function ($layer) {
      $layer.on('click', '.btn-type01', $.proxy(this._bindAddFilterBtnEvent, this, $layer));
      $layer.on('click', '.resetbtn', $.proxy(this._handleAddResetBtn, this, $layer));
      $layer.on('click', '.bt-red1', $.proxy(this._handleRmAddSelectFilters, this, $layer));
      $layer.on('click', '.link', $.proxy(this._openRoamingAddTagPopup, this, $layer));
  },
  _openRoamingAddTagPopup: function($layer, e) {
      if ($layer.find('input[checked="checked"]').length > 0) {
          this._popupService.openConfirm(Tw.ALERT_MSG_PRODUCT.ALERT_3_A16.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A16.TITLE,
              $.proxy(this._handleSelectRomaingAddTag, this, e.currentTarget));
      } else {
          this._handleSelectRomaingAddTag(e.currentTarget);
      }
  },
    _handleSelectRomaingAddTag: function(target) {
        var selectedTag = target.getAttribute('data-addfilter-id');
        if (this._params.selectedTagId === selectedTag) {
            this._popupService.close();
            return;
        }

    },
  _handleRmAddSelectFilters: function ($layer){
      var searchRmFltIds = _.map($layer.find('input[checked="checked"]'), function(input) {
          return input.getAttribute('data-addfilter-id');
      }).join(',');

      console.log(searchRmFltIds);

      this._params = { idxCtgCd: this.RMADD_CODE };
      this._params.searchFltIds = searchRmFltIds;
      console.log(this._params);
      this._apiService.request(Tw.API_CMD.BFF_10_0000, this._params)
          .done($.proxy(this._handleLoadNewAddFilters, this));
  },
  _handleLoadNewAddFilters: function(resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
          Tw.Error(resp.code, resp.msg).pop();
          return;
      }

      if (resp.result.products.length === 0) {
          this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A18.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A18.TITLE);
      } else {
          delete this._params.searchLastProdId;
          delete this._leftCount;
          this.$rmPlanAddlist.empty();

          if (resp.result.searchOption && resp.result.searchOption.searchFltIds) {
              var filters = resp.result.searchOption.searchFltIds;
              var $filters = this.$container.find('.fe-rmadd-filter');
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
          this._handleSuccessMoreAddData(resp);
        }
    },
  _handleAddResetBtn: function ($layer) {
      $layer.find('.btn-type01').removeClass('checked');
      $layer.find('input').removeAttr('checked');
  },
  _handleGetRmAddFilters: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(resp.code, resp.msg).pop();
        return;
    }
    this._rmAddFilters = resp.result;
    this._openRmAddFiltersPopup();
  },
  _bindAddFilterBtnEvent: function ($layer, e) {
      this.$filterBtn = $(e.currentTarget);
      this.$selectBtn =  $(e.currentTarget).find('input');

      if(this.$filterBtn.hasClass('checked')){
          this.$filterBtn.removeClass('checked');
          this.$selectBtn.removeAttr('checked');
      }else {
          this.$filterBtn.addClass('checked');
          this.$selectBtn.attr('checked','checked');
      }
  },
  _openRmAddOrderPopup: function () {
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
          $.proxy(this._handleOpenAddOrderPopup, this),
          undefined,
          'order'
      );
  },
    _handleOpenAddOrderPopup: function ($layer) {
      $layer.on('click', 'ul.chk-link-list > li', $.proxy(this._handleSelectRmAddOrder, this));
  },
    _handleSelectRmAddOrder: function (e) {
      var $target = $(e.currentTarget);
      var $list = $target.parent();
      var orderType = this._getRmAddOrderType($list.find('li').index($target));

      if (this._params.searchOrder === orderType) {
          return;
      }

      this._params.searchOrder = orderType;
      delete this._params.searchLastProdId;
      delete this._leftCount;
      this.$container.find('.fe-rmadd-order').text($target.find('span').text());
      this.$rmPlanAddlist.empty();

      this._handleMoreRoamingAdd();
      this._popupService.close();
    },
  _handleMoreRoamingAdd: function () {
      this._apiService.request(Tw.API_CMD.BFF_10_0000, this._params)
          .done($.proxy(this._handleSuccessMoreAddData, this));
  },
  _handleSuccessMoreAddData: function (resp) {
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
          if (this.$rmAddBtn.hasClass('none')) {
              this.$rmAddBtn.removeClass('none');
          }
          this.$rmAddBtn.text(this.$rmAddBtn.text().replace(/\((.+?)\)/, '(' + this._leftCount + ')'));
      } else {
          this.$rmAddBtn.addClass('none');
      }
      this.$rmPlanAddlist.append(this._rmListTmpl({ items: items }));
      this.$roamingAddItemCnt.text(resp.result.productCount);
    },
    _getRmAddOrderType: function(idx) {
        var keys = Object.keys(this.ORDER),
            i = 0;
        for (; i < keys.length; i++) {
            if (this.ORDER[keys[i]] === idx) {
                return keys[i];
            }
        }
    }
};
