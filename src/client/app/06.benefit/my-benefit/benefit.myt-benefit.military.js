/**
 * FileName: benefit.myt-benefit.military.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 1.
 */
Tw.BenefitMyBenefitMilitary = function (rootEl) {
  this.NUM_OF_ITEMS = 20;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._cachedElement();
  this._bindEvent();
  this._requestPoints();
};

Tw.BenefitMyBenefitMilitary.prototype = {
  _cachedElement: function () {
    this.$list = this.$container.find('#fe-list');
    this.$btMore = this.$container.find('#fe-bt-more');
    this.$noItem = this.$container.find('#fe-no-item');
  },

  _bindEvent: function () {
    this.$btMore.on('click', $.proxy(this._onClickMore, this));
  },

  _requestPoints: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0121, {})
      .done($.proxy(this._onReceivedData, this))
      .fail($.proxy(this._onError, this));
  },

  _onClickMore: function () {
    this._renderItems();
  },

  _onReceivedData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.length < 1 ) {
        this.$list.hide();
        this.$noItem.show();
      } else {
        this._items = $.extend(true, [], resp.result);
        _.map(this._items, $.proxy(function (point) {
          point.point = Tw.FormatHelper.addComma(point.point);
          point.opDt = Tw.DateHelper.getShortDateWithFormat(point.opDt, 'YYYY.MM.DD.');
          point.type = Tw.BENEFIT.TYPE[point.opClCd];
        }, this));
        this._idxLastItem = 0;
        this._renderItems();
      }
    } else {
      Tw.Error(resp.code, resp.msg).page();
    }
  },

  _renderItems: function () {
    var items = this._items.slice(this._idxLastItem, this._idxLastItem + this.NUM_OF_ITEMS);
    var source = $('#fe-list-template').html();
    var template = Handlebars.compile(source);
    var output = template({ list: items });
    this.$list.append(output);
    this._idxLastItem += this.NUM_OF_ITEMS;
    var moreItems = this._items.length - this._idxLastItem;
    if ( moreItems > 0 ) {
      this.$btMore.show();
      this.$btMore.find('span').text('(' + moreItems + ')');
    } else {
      this.$btMore.hide();
    }
  },

  _onError: function (resp) {
    Tw.Error(resp.code, resp.msg).page();
  }

};
