/**
 * FileName: customer.damage-info.guide.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

Tw.CustomerDamageInfoGuide = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._category = this.$container.data('category');

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerDamageInfoGuide.prototype = {

  _cachedElement: function() {
    this.$btnCategory = this.$container.find('.fe-btn_category');
    this.$btnListMore = this.$container.find('.fe-btn_list_more');
    this.$list = this.$container.find('.fe-list');
  },

  _bindEvent: function() {
    this.$btnCategory.on('click', $.proxy(this._openCategorySelectPopup, this));
    this.$btnListMore.on('click', $.proxy(this._showListMore, this));
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));
  },

  _openCategorySelectPopup: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list':[
            { 'label-attr': 'id="ra1"', 'txt': Tw.PROTECT_GUIDE.VIDEO,
              'radio-attr':'id="ra1" data-category="video" ' + (this._category === 'video' ? 'checked' : '') },
            { 'label-attr': 'id="ra2"', 'txt': Tw.PROTECT_GUIDE.WEBTOON,
              'radio-attr':'id="ra2" data-category="webtoon" ' + (this._category === 'webtoon' ? 'checked' : '') },
            { 'label-attr': 'id="ra3"', 'txt': Tw.PROTECT_GUIDE.LATEST,
              'radio-attr':'id="ra3" data-category="latest" ' + (this._category === 'latest' ? 'checked' : '') }
          ]
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._categoryPopupBindEvent, this), $.proxy(this._goCategory, this), 'guide_category');
  },

  _goCategory: function() {
    if (this.$container.data('category') === this._category) {
      return;
    }

    this._history.goLoad('/customer/damage-info/guide?category=' + this._category);
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

  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  }

};
