/**
 * FileName: customer.preventdamage.guide.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.24
 */

Tw.CustomerPreventdamageGuide = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._category = this.$container.data('category');

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
    this.$btnCategory.on('click', $.proxy(this._openCategorySelectPopup, this));
    this.$btnListMore.on('click', $.proxy(this._showListMore, this));

    if (Tw.BrowserHelper.isApp()) {
      this.$container.on('click', '.fe-outlink', $.proxy(this._openOutlinkConfirm, this));
    }
  },

  _openCategorySelectPopup: function() {
    this._popupService.open({
      'hbs': 'select',
      'title': Tw.PREVENTDAMAGE_GUIDE.TITLE,
      'close_bt': true,
      'select': [
        {
          'options': [
            { 'title': Tw.PREVENTDAMAGE_GUIDE.VIDEO, checked: (this._category === 'video'),
              value: 'video', text: Tw.PREVENTDAMAGE_GUIDE.VIDEO },
            { 'title': Tw.PREVENTDAMAGE_GUIDE.WEBTOON, checked: (this._category === 'webtoon'),
              value: 'webtoon', text: Tw.PREVENTDAMAGE_GUIDE.WEBTOON },
            { 'title': Tw.PREVENTDAMAGE_GUIDE.LATEST, checked: (this._category === 'latest'),
              value: 'latest', text: Tw.PREVENTDAMAGE_GUIDE.LATEST }
          ]
        }
      ],
      'bt_num': 'one',
      'type': [{
        style_class: 'bt-red1 fe-btn-apply-category',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._categoryPopupBindEvent, this), $.proxy(this._goCategory, this));
  },

  _goCategory: function() {
    if (this.$container.data('category') === this._category) {
      return;
    }

    this._history.goLoad('/customer/prevent-damage/guide?category=' + this._category);
  },

  _categoryPopupBindEvent: function($layer) {
    $layer.on('click', '.fe-btn-apply-category', $.proxy(this._applyCategory, this, $layer));
  },

  _applyCategory: function($layer) {
    this._category = $layer.find('input[name="radio"]:checked').val();
    this._popupService.close();
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