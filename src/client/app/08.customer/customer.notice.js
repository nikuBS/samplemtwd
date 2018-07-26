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
    this.$list = this.$container.find('.fe-list');
    this.$btnCategory = this.$container.find('.fe-btn_category');
    this.$btnMoreList = this.$container.find('.fe-btn_more_list');
  },

  _bindEvent: function() {
    this._popupService.close();
    this.$btnCategory.on('click', $.proxy(this._openCategorySelectPopup, this));
    this.$btnMoreList.on('click', $.proxy(this._loadMoreList, this));
  },

  _openCategorySelectPopup: function() {
    this._popupService.open({
      'hbs': 'select',
      'title': Tw.NOTICE.TITLE,
      'select': [
        {
          'options': [
            {'title': 'T world', checked: (this._category === 'tworld'), value: 'tworld',  text: 'T world'},
            {'title': Tw.NOTICE.DIRECTSHOP, checked: (this._category === 'directshop'), value: 'directshop',  text: Tw.NOTICE.DIRECTSHOP },
            {'title': Tw.NOTICE.MEMBERSHIP, checked: (this._category === 'membership'), value: 'membership',  text: Tw.NOTICE.MEMBERSHIP },
            {'title': Tw.NOTICE.ROAMING, checked: (this._category === 'roaming'), value: 'roaming',  text: Tw.NOTICE.ROAMING }
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