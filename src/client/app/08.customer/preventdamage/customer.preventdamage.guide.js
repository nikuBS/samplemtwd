/**
 * FileName: customer.preventdamage.guide.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.24
 */

Tw.CustomerPreventdamageGuide = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._category = rootEl.data('category');

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerPreventdamageGuide.prototype = {

  _cachedElement: function() {
    this.$btnCategory = this.$container.find('.fe-btn_category');
  },

  _bindEvent: function() {
    this._popupService.close();
    this.$btnCategory.on('click', $.proxy(this._openCategorySelectPopup, this));
  },

  _openCategorySelectPopup: function() {
    this._popupService.open({
      'hbs': 'select',
      'title': Tw.PREVENTDAMAGE_GUIDE.TITLE,
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
    }, $.proxy(this._categoryPopupBindEvent, this));
  },

  _categoryPopupBindEvent: function($layer) {
    $layer.on('click', '.fe-btn-apply-category', $.proxy(this._applyCategory, this, $layer));
  },

  _applyCategory: function($layer) {
    this._category = $layer.find('input[name="radio"]:checked').val();
    this._popupService._popupClose();
    this._goList();
  },

  _goList : function() {
    location.href = '/customer/prevent-damage/guide?category=' + this._category;
  }

};