/**
 * FileName: customer.notice.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.16
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
        $(window).scrollTop(item.offset().top);
      }, 500);
    }

    this._history.pathname += this._history.search;
    this._history.replace();
  },

  _getApi: function() {
    return Tw.API_CMD[this.API_CMD[this.$container.data('category')]];
  },

  _openCategorySelectPopup: function() {
    this._popupService.open({
      'hbs': 'select',
      'title': Tw.NOTICE.TITLE,
      'close_bt': true,
      'select': [
        {
          'options': [
            {'title': 'T world', checked: (this._category === 'tworld'), value: 'tworld',
              text: 'T world'},
            {'title': Tw.NOTICE.DIRECTSHOP, checked: (this._category === 'directshop'),
              value: 'directshop',  text: Tw.NOTICE.DIRECTSHOP },
            {'title': Tw.NOTICE.MEMBERSHIP, checked: (this._category === 'membership'),
              value: 'membership',  text: Tw.NOTICE.MEMBERSHIP },
            {'title': Tw.NOTICE.ROAMING, checked: (this._category === 'roaming'),
              value: 'roaming',  text: Tw.NOTICE.ROAMING }
          ]
        }
      ],
      'bt_num': 'one',
      'type': [{
        style_class: 'bt-red1 fe-btn-apply-category',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._categoryPopupBindEvent, this),
      $.proxy(function() {
        if (this.$container.data('category') === this._category) {
          return;
        }

        this._history.goLoad('/customer/notice?category=' + this._category);
      }, this));
  },

  _categoryPopupBindEvent: function($layer) {
    $layer.on('click', '.fe-btn-apply-category', $.proxy(this._applyCategory, this, $layer));
  },

  _applyCategory: function($layer) {
    this._category = $layer.find('input[name="radio"]:checked').val();
    this._popupService.close();
  },

  _loadMoreList: function() {
    this._apiService.request(this._getApi(), {page: this._page, size: 20}).done($.proxy(this._appendMoreList, this));
  },

  _getRemainCount: function(param) {
    var count = param.total - ((++this._page) * param.size);
    return count < 0 ? 0 : count;
  },

  _appendMoreList: function(res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return this._apiError(res);
    }

    this.$list.append(this._template({
      list: _.map(res.result.content, function(item) {
        item.type = Tw.FormatHelper.isEmpty(item.ctgNm) ? '' : item.ctgNm;
        item.date = Tw.FormatHelper.convertNumberDateToFormat(item.rgstDt, '.');
        item.itemClass = (item.isTop ? 'impo ' : '') + (item.isNew ? 'new' : '');
        return item;
      })
    }));

    if (res.result.last) this.$btnMoreList.remove();
    else {
      this.$btnMoreList.find('span').text('(' + this._getRemainCount({
        total: res.result.totalElements,
        size: res.result.pageable.pageSize
      })  + ')');
    }
  },

  _apiError: function (res) {
    this._popupService.openAlert(res.code + ' ' + res.msg);
    return false;
  }

};