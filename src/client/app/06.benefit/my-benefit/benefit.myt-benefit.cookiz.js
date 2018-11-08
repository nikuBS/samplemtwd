/**
 * FileName: benefit.myt-benefit.cookiz
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 11. 5.
 */
Tw.BenefitMyBenefitCookiz = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._idxLastItem = 0;
  this._totalCount = 0;
  this.NUM_OF_ITEMS = 20;
  this._page = 1;

  this._cachedElement();
  this._bindEvent();
  this._requestPoints();
};

Tw.BenefitMyBenefitCookiz.prototype = {
  _cachedElement: function () {
    this.$list = this.$container.find('#fe-list');
    this.$btMore = this.$container.find('#fe-bt-more');
    this.$noItem = this.$container.find('#fe-no-item');
  },

  _bindEvent: function () {
    this.$btMore.on('click', $.proxy(this._onClickMore, this));
  },

  _requestPoints: function () {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });
    this._apiService
      .request(Tw.API_CMD.BFF_05_0122, { page: this._page++, size: this.NUM_OF_ITEMS })
      .done($.proxy(this._onReceivedData, this))
      .fail($.proxy(this._onError, this));
  },

  _onClickMore: function () {
    this._requestPoints();
  },

  _onReceivedData: function (resp) {
    skt_landing.action.loading.off({ ta: '.container', co: 'grey', size: true });
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._totalCount = resp.result.totRecCnt;
      if ( resp.result.length < 1 ) {
        this.$list.hide();
        this.$noItem.show();
      } else {
        var _items = $.extend(true, [], resp.result.history);
        _.map(_items, $.proxy(function (point) {
          point.point = Tw.FormatHelper.addComma(point.point);
          point.opDt = Tw.DateHelper.getShortFirstDateNoNot(point.opDt);
          point.type = Tw.BENEFIT.TYPE[point.opClCd];
        }, this));

        this._renderItems(_items);
      }
    } else {
      Tw.Error(resp.code, resp.msg).page();
    }
  },

  _renderItems: function (items) {
    var source = $('#fe-list-template').html();
    var template = Handlebars.compile(source);
    var output = template({ list: items });
    this.$list.append(output);

    this._idxLastItem += this.NUM_OF_ITEMS;
    var moreItems = this._totalCount - this._idxLastItem;
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
