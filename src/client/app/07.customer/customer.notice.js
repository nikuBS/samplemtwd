/**
 * FileName: customer.notice.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.10.23
 */

Tw.CustomerNotice = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._template = Handlebars.compile($('#tpl_notice_list_item').html());
  this._category = this.$container.data('category');
  this._page = 1;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerNotice.prototype = {
  API_CMD: {
    tworld: 'BFF_08_0029',
    directshop: 'BFF_08_0039',
    membership: 'BFF_08_0031',
    roaming: 'BFF_08_0040'
  },

  _cachedElement: function() {
    this.$list = this.$container.find('.fe-list');
    this.$btnCategory = this.$container.find('.fe-btn_category');
    this.$btnMoreList = this.$container.find('.fe-btn_more_list');
  },

  _bindEvent: function() {
    this.$btnCategory.on('click', $.proxy(this._openCategorySelectPopup, this));
    this.$btnMoreList.on('click', $.proxy(this._loadMoreList, this));
  },

  _init: function() {
    var hashSerNum = location.hash.replace('#', '');
    if (Tw.FormatHelper.isEmpty(hashSerNum)) {
      return;
    }

    var item = this.$list.find('[data-sernum="' + hashSerNum  + '"]');
    if (item.length > 0) {
      setTimeout(function() {
        item.trigger('click');
      }, 0);
    }

    this._history.pathname += this._history.search;
    this._history.replace();
  },

  _getApi: function() {
    return Tw.API_CMD[this.API_CMD[this.$container.data('category')]];
  },

  _openCategorySelectPopup: function() {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.NOTICE.TITLE,
      data: [{
        'list': [
          { value: 'T world', option: (this._category === 'tworld') ? 'checked' : '', attr: 'data-category="tworld"' },
          { value: Tw.NOTICE.DIRECTSHOP, option: (this._category === 'directshop') ? 'checked' : '', attr: 'data-category="directshop"' },
          { value: Tw.NOTICE.MEMBERSHIP, option: (this._category === 'membership') ? 'checked' : '', attr: 'data-category="membership"' },
          { value: Tw.NOTICE.ROAMING, option: (this._category === 'roaming') ? 'checked' : '', attr: 'data-category="roaming"' }
        ]
      }]
    }, $.proxy(this._categoryPopupBindEvent, this), $.proxy(this._goCategory, this), 'inifinity_category_popup');
  },

  _goCategory: function() {
    if (this.$container.data('category') === this._category) {
      return;
    }

    this._history.goLoad('/customer/notice/' + this._category);
  },

  _categoryPopupBindEvent: function($layer) {
    $layer.on('click', '[data-category]', $.proxy(this._applyCategory, this));
  },

  _applyCategory: function(e) {
    this._category = $(e.currentTarget).data('category');
    this._popupService.close();
  },

  _loadMoreList: function() {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });
    this._apiService.request(this._getApi(), {page: this._page, size: 20}).done($.proxy(this._appendMoreList, this));
  },

  _getRemainCount: function(param) {
    var count = param.total - ((++this._page) * param.size);
    return count < 0 ? 0 : count;
  },

  _appendMoreList: function(res) {
    skt_landing.action.loading.off({ ta: '.container' });
    if (res.code !== Tw.API_CODE.CODE_00) {
      return this._apiError(res);
    }

    this.$container.find('.acco-tit button').off();
    this.$list.append(this._template({
      list: _.map(res.result.content, $.proxy(this._convertItem, this))
    }));

    skt_landing.widgets.widget_init('.wrap');

    if (res.result.last) this.$btnMoreList.remove();
    else {
      this.$btnMoreList.find('span').text('(' + this._getRemainCount({
        total: res.result.totalElements,
        size: res.result.pageable.pageSize
      })  + ')');
    }
  },

  _convertItem: function(item) {
    return $.extend(item, {
      type: Tw.FormatHelper.isEmpty(item.ctgNm) ? '' : item.ctgNm,
      date: Tw.DateHelper.getShortDateWithFormat(item.rgstDt, 'YY.MM.DD'),
      itemClass: (item.isTop ? 'impo ' : '') + (item.isNew ? 'new' : ''),
      content: this._fixHtml(item.content)
    });
  },

  _fixHtml: function(html) {
    var doc = document.createElement('div');
    doc.innerHTML = html;

    return doc.innerHTML;
  },

  _apiError: function (res) {
    this._popupService.openAlert(res.code + ' ' + res.msg);
    return false;
  }

};