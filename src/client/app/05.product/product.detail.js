/**
 * FileName: product.detail.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

Tw.ProductDetail = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductDetail.prototype = {

  _init: function() {
    this.prodId = this.$container.data('prod_id');
    this.settingButtonList = [];

    this.$btnSettingList.each(function(index, item) {
      this.settingButtonList.push({ value: $(item).text(), attr: 'data-url="' + index + '"' });
    }.bind(this));
    this.$btnSettingList.parent().remove();
  },

  _cachedElement: function() {
    this.$btnCommon = this.$container.find('.fe-btn_common');
    this.$btnSettingList = this.$container.find('.fe-btn_setting_list li');
  },

  _bindEvent: function() {
    this.$btnCommon.on('click', $.proxy(this._procCommonBtn, this));
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

  _procCommonBtn: function(e) {
    var typcd = $(e.currentTarget).data('typcd'),
      joinTermCd = this._getJoinTermCd(typcd);

    if (typcd === 'setting') {
      return this._openSettingPop();
    }

    if (typcd === 'SE') {
      return this._historyService.goLoad('/product/setting');
    }

    if (Tw.FormatHelper.isEmpty(joinTermCd)) {
      return Tw.Error().page();
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0007, {
      joinTermCd: joinTermCd
    }, null, this.prodId)
      .done($.proxy(this._procAdvanceCheck, this, typcd));
  },

  _openSettingPop: function() {
    this._popupService.open({
      hbs: 'actionsheet_link_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SELECT,
      data: [{
        'list': this.settingButtonList
      }]
    }, $.proxy(this._bindPopupEvent, this), null, 'setting_pop');
  },

  _bindPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '[data-url]', $.proxy(this._selectSettingItem, this));
  },

  _selectSettingItem: function(e) {
    this._historyService.goLoad($(e.currentTarget).data('url'));
  },

  _procAdvanceCheck: function(typcd, resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(null, resp.msg).pop();
    }

    if (typcd === 'SC') {
      return this._historyService.goLoad('/product/join/' + this.prodId);
    }

    this._historyService.goLoad('/product/terminate/' + this.prodId);
  }

};
