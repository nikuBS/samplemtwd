/**
 * FileName: customer.notice.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.16
 */

Tw.CustomerNotice = function(rootEl) {
  this.$container = rootEl;
  this._apiSerivce = Tw.Api;
  this._popupService = Tw.Popup;
  this._category = rootEl.data('category');
  this._page = 1;
  this._pageNum = 20;

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerNotice.prototype = {

  _cachedElement: function() {
    this.$list = this.$container.find('ul[data-id="list"]');
    this.$btnCategory = this.$container.find('button[data-id="category"]');
    this.$btnMoreList = this.$container.find('.fe-btn_more_list');
  },

  _bindEvent: function() {
    this._popupService._popupClose();
    this.$btnCategory.on('click', $.proxy(this._openCategoryPopup, this));
    this.$btnMoreList.on('click', $.proxy(this._loadMoreList, this));
  },

  _openCategoryPopup: function() {
    this._popupService.open({
      'hbs': 'select',
      'title': '카테고리 설정',
      'select': [
        {
          'options': [
            {'title': 'Tworld', checked: (this._category === 'tworld'), value: 'tworld',  text: 'Tworld'},
            {'title': '다이렉트샵', checked: (this._category === 'directshop'), value: 'directshop',  text: '다이렉트샵' },
            {'title': '멤버십', checked: (this._category === 'membership'), value: 'membership',  text: '멤버십' },
            {'title': '로밍', checked: (this._category === 'roaming'), value: 'roaming',  text: '로밍' }
          ]
        }
      ],
      'bt_num': 'one',
      'type': [{
        style_class: 'bt-red1 fe-btn-apply-category',
        txt: '확인'
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

  _loadMoreList: function() {
    // @todo 비동기 API 호출하여 더보기 목록 append
  },

  _goList : function() {
    location.href = '/customer/notice?category=' + this._category;
  }

};