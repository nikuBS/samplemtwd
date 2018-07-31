/**
 * FileName: customer.preventdamage.guide.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.24
 */

Tw.CustomerPreventdamageGuide = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerPreventdamageGuide.prototype = {

  _cachedElement: function() {
    this.$btnCategory = this.$container.find('.fe-btn_category');
    this.$btnListMore = this.$container.find('.fe-btn_list_more');
    this.$list = this.$container.find('.fe-list');
  },

  _bindEvent: function() {
    this._popupService.close();
    this.$btnCategory.on('click', $.proxy(this._openCategorySelectPopup, this));
    this.$btnListMore.on('click', $.proxy(this._showListMore, this));
  },

  _openCategorySelectPopup: function() {
    this._popupService.open({
      'hbs': 'select',
      'title': Tw.PREVENTDAMAGE_GUIDE.TITLE,
      'select': [
        {
          'options': [
            { 'title': Tw.PREVENTDAMAGE_GUIDE.VIDEO, checked: (this.$container.data('category') === 'video'),
              value: 'video', text: Tw.PREVENTDAMAGE_GUIDE.VIDEO },
            { 'title': Tw.PREVENTDAMAGE_GUIDE.WEBTOON, checked: (this.$container.data('category') === 'webtoon'),
              value: 'webtoon', text: Tw.PREVENTDAMAGE_GUIDE.WEBTOON },
            { 'title': Tw.PREVENTDAMAGE_GUIDE.LATEST, checked: (this.$container.data('category') === 'latest'),
              value: 'latest', text: Tw.PREVENTDAMAGE_GUIDE.LATEST }
          ]
        }
      ],
      'bt_num': 'one',
      'type': [{
        style_class: 'bt-red1 fe-btn-apply-category',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._categoryPopupBindEvent, this));
  },

  _categoryPopupBindEvent: function($layer) {
    $layer.on('click', '.fe-btn-apply-category', $.proxy(this._applyCategory, this, $layer));
  },

  _applyCategory: function($layer) {
    this._history.goLoad('/customer/prevent-damage/guide?category=' + $layer.find('input[name="radio"]:checked').val());
  },

  _showListMore: function(e) {
    var hiddenLength = this.$list.find('li:hidden').length,
      listSize = this.$list.data('size');

    if (hiddenLength <= listSize) {
      this.$list.find('li:hidden').show();
      $(e.currentTarget).parent().remove();
    }

    if (hiddenLength > listSize) {
      this.$list.find('li:hidden:lt(' + listSize + ')').show();
      $(e.currentTarget).find('span').text('(' + hiddenLength + ')');
    }
  }

};