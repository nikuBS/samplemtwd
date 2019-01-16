/**
 * FileName: product.roaming.planadd.js
 * Author: Eunjung Jung ()
 * Date: 2018.11.12
 */

Tw.ProductRoamingPlanAdd = function (rootEl, params, roamingAddData, pageInfo) {
  this.$container = rootEl;
  this.RMADD_CODE = pageInfo.code;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(rootEl);
  this._param = params;
  this._roamingAddData = roamingAddData;

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
      if(this._param.searchTagId){
          this._params.searchTagId = this._param.searchTagId;
          this.selectTag = true;
      }else {
          this.selectTag = false;
      }
      this._reset = false;
      this._params.searchLastProdId = this.$rmAddBtn.data('last-product');
      this._leftCount = this.$rmAddBtn.data('left-count');

      this._rmListTmpl = Handlebars.compile($('#fe-rmtmpl-add').html());
      this._rmFilterTmpl = Handlebars.compile($('#fe-rmtmpl-addfilter').html());

      var totalCnt = Number(this._roamingAddData.productCount);
      if(totalCnt === 0) {
          var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A18;
          this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
      }

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
          // $.ajax('http://localhost:3000/mock/product.roaming.BFF_10_0032.json')
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
          this._popupService.openConfirmButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A16.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A16.TITLE,
              $.proxy(this._handleSelectRomaingAddTag, this, e.currentTarget), null, Tw.BUTTON_LABEL.CLOSE);
      } else {
          this._handleSelectRomaingAddTag(e.currentTarget);
      }
  },
    _handleSelectRomaingAddTag: function(target) {
        var selectedTag = target.getAttribute('data-rmtag-id');

        this._popupService.close();
        if(selectedTag) {
            this.selectTag = true;
        }
        if (this._params.searchTagId === selectedTag) {
            this._popupService.close();
            return;
        }

        this._params.searchTagId = selectedTag;
        this._params.searchLastProdId = '';
        this._params.searchFltIds = '';

        this._apiService.request(Tw.API_CMD.BFF_10_0000, this._params)
            .done($.proxy(this._handleLoadNewAddFilters, this));
        //this._history.goLoad('/product/roaming/planadd?tag=' + selectedTag);
    },
  _handleRmAddSelectFilters: function ($layer){
      var searchRmFltIds = _.map($layer.find('input[checked="checked"]'), function(input) {
          return input.getAttribute('data-addfilter-id');
      }).join(',');

      if(searchRmFltIds === '' && !this._reset){
          this._popupService.close();
          return;
      }

      this._params = { idxCtgCd: this.RMADD_CODE };
      this._params.searchFltIds = searchRmFltIds;
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

          if (resp.result.searchOption && resp.result.searchOption.searchFltIds.length > 0) {
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
          } else if(resp.result.searchOption && resp.result.searchOption.searchTagId){
              var tagNm = resp.result.searchOption.searchProdTagNm;
              var $tags = this.$container.find('.fe-rmadd-filter');
              var tagData = {'filters':[tagNm]};
              $tags.html(this._rmFilterTmpl(tagData));
          } else {
              var allData = {'filters':[]};
              this.$container.find('.fe-rmadd-filter').html(this._rmFilterTmpl(allData));
          }

          this._popupService.close();
          this._handleSuccessMoreAddData(resp);
        }
    },
  _handleAddResetBtn: function ($layer) {
      $layer.find('.btn-type01').removeClass('checked');
      $layer.find('input').removeAttr('checked');
      this._reset = true;
      this.selectTag = false;
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
      var $target = $(e.currentTarget);
      if(this.selectTag){
          var ALERT = Tw.ALERT_MSG_PRODUCT.ALERT_3_A17;
          this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE, $.proxy(this._handleResetTag, this, $layer, $target), null, Tw.BUTTON_LABEL.CLOSE);
      } else {
          this.$filterBtn = $(e.currentTarget);
          this.$selectBtn =  $(e.currentTarget).find('input');

          if(this.$filterBtn.hasClass('checked')){
              this.$filterBtn.removeClass('checked');
              this.$selectBtn.removeAttr('checked');
          }else {
              this.$filterBtn.addClass('checked');
              this.$selectBtn.attr('checked','checked');
          }
      }
      this._reset = false;
  },
  _handleResetTag: function ($layer, $target) {
    this._popupService.close();
      this._params.searchTagId = '';
      this.$selectBtn =  $target.find('input');

      if($target.hasClass('checked')){
          $target.removeClass('checked');
          this.$selectBtn.removeAttr('checked');
      }else {
          $target.addClass('checked');
          this.$selectBtn.attr('checked','checked');
      }

      this.selectTag = false;
  },
  _openRmAddOrderPopup: function () {
      this.orderList = Tw.PRODUCT_ROAMING_ORDER;
      this._popupService.open(
          {
              hbs: 'actionsheet01', // hbs의 파일명
              layer: true,
              btnfloating: { 'attr': 'type="button" data-role="fe-bt-close"', 'txt': '닫기' },
              data: [{ list: this.orderList }]
          },
          $.proxy(this._handleOpenAddOrderPopup, this),
          undefined,
          'order'
      );
  },
    _handleOpenAddOrderPopup: function ($layer) {
      // $layer.on('click', 'ul.chk-link-list > li', $.proxy(this._handleSelectRmAddOrder, this));
      var searchType = this.ORDER[this._params.searchOrder || this.DEFAULT_ORDER];
      $layer.find('[id="ra' + searchType + '"]').attr('checked', 'checked');
      $layer.find('[data-role="fe-bt-close"]').on('click', $.proxy(this._popupService.close, this));
      $layer.on('click', 'ul.ac-list > li', $.proxy(this._handleSelectRmAddOrder, this));
  },
    _handleSelectRmAddOrder: function (e) {
      var $target = $(e.currentTarget);
      var $list = $target.parent();
      this.orderTypeIdx = $list.find('li').index($target);
      var orderType = this._getRmAddOrderType($list.find('li').index($target));

      if (this._params.searchOrder === orderType) {
          return;
      }

      this._params.searchOrder = orderType;
      delete this._params.searchLastProdId;
      delete this._leftCount;
      this.$container.find('.fe-rmadd-order').text(this.orderList[this.orderTypeIdx].txt);
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
