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

      if(this._param.searchFltIds){
          this._params.searchFltIds = this._param.searchFltIds;
      }

      if(this._param.searchOrder){
          this._params.searchOrder = this._param.searchOrder;
      }

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

      var currentTag = this._params.searchTagId;
      var tags = currentTag
          ? _.map(this._rmAddFilters.tags, function(tag) {
              if (currentTag === tag.tagId) {
                  return $.extend({ checked: true }, tag);
              }
              return tag;
          })
          : this._rmAddFilters.tags;

      this._popupService.open(
          {
              hbs: 'RM_12_01',
              data: {
                  filters: rmAddFilters,
                  tags: tags
              }
          },
          $.proxy(this._handleOpenAddFilterPopup, this),
          $.proxy(this._handleCloseAddFilterPopup, this),
          'search'
      );
  },
  _handleOpenAddFilterPopup: function ($layer) {
      $layer.on('click', '.btn-type01', $.proxy(this._bindAddFilterBtnEvent, this, $layer));
      $layer.on('click', '.resetbtn', $.proxy(this._handleAddResetBtn, this, $layer));
      $layer.on('click', '.bt-red1', $.proxy(this._handleRmAddSelectFilters, this, $layer));
      $layer.on('click', '.link', $.proxy(this._openRoamingAddTagPopup, this, $layer));
  },
  _handleCloseAddFilterPopup: function () {
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

        this._history.goLoad('/product/roaming/planadd?tag=' + selectedTag);
    },
  _handleRmAddSelectFilters: function ($layer){
      var searchRmFltIds = _.map($layer.find('input[checked="checked"]'), function(input) {
          return input.getAttribute('data-addfilter-id');
      }).join(','),
      originParams = this._params;

      if(searchRmFltIds === '' && !this._reset){
          this._popupService.close();
          return;
      }

      this._params = { idxCtgCd: this.RMADD_CODE };
      this._params.searchFltIds = searchRmFltIds;
      this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params)
          .done($.proxy(this._handleLoadNewAddFilters, this, originParams));
  },
  _handleLoadNewAddFilters: function(originParams, resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
          Tw.Error(resp.code, resp.msg).pop();
          return;
      }

      if (resp.result.products.length === 0) {
          this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A18.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A18.TITLE);
      } else {
          this._popupService.close();
          this._loadedNewSearch = true;
        }
    },
  _handleAddResetBtn: function ($layer) {
      $layer.find('.btn-type01').removeClass('checked');
      $layer.find('input').removeAttr('checked');

      var selectedTag = $layer.find('.suggest-tag-list .link.active');
      if (selectedTag.length > 0) {
          selectedTag.removeClass('active');
      }

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

      var selectedTag = $layer.find('.suggest-tag-list .link.active');
      if (selectedTag.length > 0) {
          selectedTag.removeClass('active');
      }

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
              btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
              layer: true,
              data: [{ list: this.orderList }]
          },
          $.proxy(this._handleOpenAddOrderPopup, this),
          undefined,
          'order'
      );
  },
    _handleOpenAddOrderPopup: function ($layer) {
      // $layer.on('click', 'ul.chk-link-list > li', $.proxy(this._handleSelectRmAddOrder, this));
      // var searchType = this.ORDER[this._params.searchOrder || this.DEFAULT_ORDER];
      // $layer.find('[id="ra' + searchType + '"]').attr('checked', 'checked');
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

    this._handleLoadNewOrder(orderType);
    this._popupService.close();
  },
  _handleLoadNewOrder:function (orderType) {
      this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params).done($.proxy(this._handleSuccessMoreAddData, this, orderType));
  },
  _handleMoreRoamingAdd: function () {
      this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params)
          .done($.proxy(this._handleSuccessMoreAddData, this, undefined));
  },
  _handleSuccessMoreAddData: function (orderType, resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
          Tw.Error(resp.code, resp.msg).pop();
          return;
      }

      if (orderType) {
          location.href = Tw.UrlHelper.replaceQueryParam('order', orderType);
      }
      var items = _.map(resp.result.products, function(item) {
          item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeAmt);
          return item;
      });

      var srchOrder = resp.result.searchOption.searchOrder;

      this.CURRENT_ORDER = srchOrder;

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
