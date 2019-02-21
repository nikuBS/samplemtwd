/**
 * FileName: customer.damage-info.warning.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.07.26
 */

Tw.CustomerDamageInfoWarning = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._template = Handlebars.compile($('#tpl_warning_list_item').html());
  this._page = 1;

  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerDamageInfoWarning.prototype = {
  _cachedElement: function() {
    this.$list = this.$container.find('.fe-list');
    this.$btnMoreList = this.$container.find('.fe-btn_more_list');
  },

  _bindEvent: function() {
    this.$btnMoreList.on('click', $.proxy(this._loadMoreList, this));
  },

  _loadMoreList: function() {
    this._apiService.request(Tw.API_CMD.BFF_08_0063, {
      repCtgCd: 'A00002',
      page: this._page, size: 20
    }).done($.proxy(this._appendMoreList, this));
  },

  _getRemainCount: function(param) {
    var count = param.total - ((++param.page) * param.size);
    return count < 0 ? 0 : count;
  },

  _appendMoreList: function(res) {
    if (res.code !== Tw.API_CODE.CODE_00){
      return this._apiError(res);
    }

    this.$list.append(this._template({
      list: _.map(res.result.content, function(item) {
        item.date = Tw.DateHelper.getShortDateWithFormat(item.rgstDtm, 'YYYY.M.D.');
        return item;
      })
    }));

    if (res.result.last) this.$btnMoreList.remove();
    else {
      this.$btnMoreList.find('span').text('(' + this._getRemainCount({
        total: res.result.totalElements,
        page: res.result.pageable.pageNumber,
        size: res.result.pageable.pageSize
      }) + ')');
      this._page++;
    }
  },

  _apiError: function (res) {
    this._popupService.openAlert(res.code + ' ' + res.msg);
    return false;
  }
};