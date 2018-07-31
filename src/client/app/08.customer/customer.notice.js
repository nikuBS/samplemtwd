/**
 * FileName: customer.notice.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.16
 */

Tw.CustomerNotice = function(rootEl) {
  this.$container = rootEl;
  this._apiSerivce = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._template = Handlebars.compile($('#tpl_notice_list_item').html());
  this._page = 1;

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerNotice.prototype = {
  API_CMD: {
    tworld: 'BFF_08_0029',
    directshop: 'BFF_08_0030',
    membership: 'BFF_08_0031',
    roaming: 'BFF_08_0032'
  },

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

  _getApi: function() {
    return Tw.API_CMD[this.API_CMD[this.$container.data('category')]];
  },

  _openCategorySelectPopup: function() {
    this._popupService.open({
      'hbs': 'select',
      'title': Tw.NOTICE.TITLE,
      'select': [
        {
          'options': [
            {'title': 'T world', checked: (this.$container.data('category') === 'tworld'), value: 'tworld',
              text: 'T world'},
            {'title': Tw.NOTICE.DIRECTSHOP, checked: (this.$container.data('category') === 'directshop'),
              value: 'directshop',  text: Tw.NOTICE.DIRECTSHOP },
            {'title': Tw.NOTICE.MEMBERSHIP, checked: (this.$container.data('category') === 'membership'),
              value: 'membership',  text: Tw.NOTICE.MEMBERSHIP },
            {'title': Tw.NOTICE.ROAMING, checked: (this.$container.data('category') === 'roaming'),
              value: 'roaming',  text: Tw.NOTICE.ROAMING }
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
    this._history.goLoad('/customer/notice?category=' + $layer.find('input[name="radio"]:checked').val());
  },

  _loadMoreList: function() {
    this._apiService.request(this._getApi(), {
      page: this._page, size: 20
    }).done($.proxy(this._appendMoreList, this));
  },

  _getRemainCount: function(param) {
    var count = param.total - ((++param.page) * param.size);
    return count < 0 ? 0 : count;
  },

  _appendMoreList: function(res) {
    if (res.code !== Tw.API_CODE.CODE_00) return this._apiError(res);
    this.$list.append(this._template({
      list: res.result.content
    }));

    if (res.result.last) this.$btnMoreList.remove();
    else {
      this.$btnMoreList.find('span').text('(' + this._getRemainCount({
        total: res.result.totalElements,
        page: res.result.pageable.pageNumber,
        size: res.result.pageable.pageSize
      })  + ')');
      this._page++;
    }
  },

  _apiError: function (err) {
    Tw.Logger.error(err.code, err.msg);
    this._popupService.openAlert(Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg);
    return false;
  }

};