/**
 * FileName: product.detail.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

Tw.ProductDetail = function(rootEl) {
  this.$container = rootEl;
  this._template = Handlebars.compile($('#tpl_recommended_rate_item').html());
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductDetail.prototype = {

  _init: function() {
    this._prodId = this.$container.data('prod_id');
    this._ctgCd = this.$container.data('ctg_cd');
    this._ctgKey = this.$container.data('ctg_key');
    this._filterIds = this.$container.data('filter_ids');
    this._loadRecommendedrateList();
  },

  _cachedElement: function() {
    this.$btnList = this.$container.find('.fe-btn_list');
    this.$btnJoin = this.$container.find('.fe-btn_join');
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$recommendRateList = this.$container.find('.fe-recommended_rate_list');
    this.$btnRecommendRateListMore = this.$container.find('.fe-btn_recommended_rate_list_more');
    this.$btnRecommendProd = this.$container.find('.fe-btn_recommend_prod');
  },

  _bindEvent: function() {
    this.$btnList.on('click', 'button', $.proxy(this._goBtnLink, this));
    this.$btnJoin.on('click', $.proxy(this._goJoinTerminate, this, '01'));
    this.$btnTerminate.on('click', $.proxy(this._goJoinTerminate, this, '03'));
    this.$btnRecommendRateListMore.on('click', $.proxy(this._goRecommendRateMoreList, this));
    this.$btnRecommendProd.on('click', $.proxy(this._goRecommendProd, this));
  },

  _getJoinTermCd: function(typcd) {
    if (typcd === 'SC') {
      return '01';
    }

    if (typcd === 'TE') {
      return '03';
    }

    return null;
  },

  _goBtnLink: function(e) {
    var $btn = $(e.currentTarget),
      typcd = $btn.data('typcd'),
      btnLink = $btn.data('url'),
      joinTermCd = this._getJoinTermCd(typcd);

    if (typcd === 'setting') {
      return this._openSettingPop();
    }

    if (typcd === 'SE') {
      return this._historyService.goLoad(btnLink);
    }

    if (Tw.FormatHelper.isEmpty(joinTermCd)) {
      return Tw.Error().page();
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0007, {
      joinTermCd: joinTermCd
    }, null, this._prodId)
      .done($.proxy(this._procAdvanceCheck, this, btnLink));
  },

  _goJoinTerminate: function(joinTermCd) {
    this._apiService.request(Tw.API_CMD.BFF_10_0007, {
      joinTermCd: joinTermCd
    }, null, this._prodId)
      .done($.proxy(this._goJoinTerminateResult, this, joinTermCd));
  },

  _goJoinTerminateResult: function(joinTermCd, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._historyService.goLoad('/product/' + (joinTermCd === '01' ? 'join' : 'terminate') + '/' + this._prodId);
  },

  _openSettingPop: function() {
    this._popupService.open({
      hbs: 'actionsheet_link_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT,
      data: [{
        'list': []
      }]
    }, $.proxy(this._bindPopupEvent, this), null, 'setting_pop');
  },

  _bindPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '[data-url]', $.proxy(this._selectSettingItem, this));
  },

  _selectSettingItem: function(e) {
    this._historyService.goLoad($(e.currentTarget).data('url'));
  },

  _procAdvanceCheck: function(btnLink, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(null, resp.msg).pop();
    }

    this._historyService.goLoad(btnLink);
  },

  _goRecommendProd: function(e) {
    var prodId = $(e.currentTarget).data('prod_id');
    if (Tw.FormatHelper.isEmpty(prodId)) {
      return;
    }

    this._historyService.goLoad('/product/detail/' + prodId);
  },

  _loadRecommendedrateList: function() {
    if (Tw.FormatHelper.isEmpty(this._filterIds) || Tw.FormatHelper.isEmpty(this._ctgCd)) {
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0031, {
      idxCtgCd: this._ctgCd,
      searchFltIds: this._filterIds,
      searchCount: 3,
      ignoreProdId: this._prodId
    }).done($.proxy(this._appendRecommendList, this));
  },

  _appendRecommendList: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || resp.result.productCount < 1) {
      return;
    }

    if (resp.result.productCount > 3) {
      this.$btnRecommendRateListMore.show();
    }

    this.$recommendRateList.find('.recommendedrate-list')
      .html(this._template({
        list: resp.result.products.map(function(item) {
          var isBasFeeAmt = isNaN(parseInt(item.basFeeAmt, 10));
          return Object.assign(item, {
            basFeeAmt: isBasFeeAmt ? item.basFeeAmt : Tw.FormatHelper.addComma(item.basFeeAmt),
            isNumberBasFee: !isBasFeeAmt
          });
        })
      }));

    this.$recommendRateList.show();
  },

  _goRecommendRateMoreList: function() {
    this._historyService.goLoad('/product/' + this._ctgKey + '?filters=' + this._filterIds);
  }

};
