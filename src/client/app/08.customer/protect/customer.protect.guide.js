/**
 * FileName: customer.protect.guide.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

Tw.CustomerProtectGuide = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._category = this.$container.data('category');

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerProtectGuide.prototype = {

  _cachedElement: function() {
    this.$btnCategory = this.$container.find('.fe-btn_category');
    this.$btnListMore = this.$container.find('.fe-btn_list_more');
    this.$list = this.$container.find('.fe-list');
  },

  _bindEvent: function() {
    this.$btnCategory.on('click', $.proxy(this._openCategorySelectPopup, this));
    this.$btnListMore.on('click', $.proxy(this._showListMore, this));

    if (Tw.BrowserHelper.isApp()) {
      this.$container.on('click', '.fe-outlink', $.proxy(this._openOutlinkConfirm, this));
    }
  },

  _openCategorySelectPopup: function() {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.PROTECT_GUIDE.TITLE,
      data: [{
        'list': [
          { value: Tw.PROTECT_GUIDE.VIDEO, option: (this._category === 'video') ? 'checked' : '', attr: 'data-category="video"' },
          { value: Tw.PROTECT_GUIDE.WEBTOON, option: (this._category === 'webtoon') ? 'checked' : '', attr: 'data-category="webtoon"' },
          { value: Tw.PROTECT_GUIDE.LATEST, option: (this._category === 'latest') ? 'checked' : '', attr: 'data-category="latest"' }
        ]
      }]
    }, $.proxy(this._categoryPopupBindEvent, this), $.proxy(this._goCategory, this));
  },

  _goCategory: function() {
    if (this.$container.data('category') === this._category) {
      return;
    }

    this._history.goLoad('/customer/protect/guide/' + this._category);
  },

  _categoryPopupBindEvent: function($layer) {
    $layer.on('click', '[data-category]', $.proxy(this._applyCategory, this));
  },

  _applyCategory: function(e) {
    this._category = $(e.currentTarget).data('category');
    this._popupService.close();
  },

  _showListMore: function(e) {
    var hiddenLength = this.$list.find('li:hidden').length,
      listSize = this.$list.data('size');

    if (hiddenLength <= listSize) {
      this.$list.find('li:hidden').removeClass('none');
      $(e.currentTarget).parent().remove();
    }

    if (hiddenLength > listSize) {
      this.$list.find('li:hidden:lt(' + listSize + ')').removeClass('none');
      $(e.currentTarget).find('span').text('(' + hiddenLength + ')');
    }
  },

  _openOutlinkConfirm: function(e) {
    this._popupService.openAlert(Tw.MSG_COMMON.DATA_CONFIRM, null, $.proxy(this._openOutlink, this, $(e.currentTarget).attr('href')));

    e.preventDefault();
    e.stopPropagation();
  },

  _openOutlink: function(href) {
    this._popupService.close();
    Tw.CommonHelper.openUrlExternal(href);
  }

};
