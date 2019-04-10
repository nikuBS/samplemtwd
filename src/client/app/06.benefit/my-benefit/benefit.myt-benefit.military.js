/**
 * @file benefit.myt-benefit.military.js
 * @author Hyeryoun Lee
 * @since 2018-11-1
 */
/**
 * @class
 * @desc 혜택 > 나의 혜택/할인 > 지켜줘서 고마원 현역플랜 포인트(BS_01_01_05)을 위한 class
 * @param {Object} rootEl 최상위 element Object
 * @returns {void}
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
  /**
   * @function
   * @desc Cache elements for binding events.
   * @returns {void}
   */
  _cachedElement: function () {
    this.$list = this.$container.find('#fe-list');
    this.$btMore = this.$container.find('#fe-bt-more');
    this.$noItem = this.$container.find('#fe-no-item');
  },
  /**
   * @function
   * @desc Bind events to elements.
   */
  _bindEvent: function () {
    this.$btMore.on('click', $.proxy(this._onClickMore, this));
  },
  /**
   * @function
   * @desc Request the military point list.
   */
  _requestPoints: function () {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0121, {})
      .done($.proxy(this._onReceivedData, this))
      .fail($.proxy(this._onError, this));
  },
  /**
   * @function
   * @desc Event listener for the button click on #fe-bt-more(더보기)
   */
  _onClickMore: function () {
    this._renderItems();
  },
  /**
   * @function
   * @desc Success callback for _requestPoints.
   * @param resp
   */
  _onReceivedData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.length < 1 ) {
        this.$list.hide();
        this.$noItem.show();
        this.$list.attr('aria-hidden', true);
        this.$noItem.attr('aria-hidden', false);
      } else {
        this._items = $.extend(true, [], resp.result);
        _.map(this._items, $.proxy(function (point) {
          point.point = Tw.FormatHelper.addComma(point.point);
          point.opDt = Tw.DateHelper.getShortDateWithFormat(point.opDt, 'YYYY.M.D.');
          point.type = Tw.BENEFIT.TYPE[point.opClCd];
        }, this));
        this._idxLastItem = 0;
        this._renderItems();
        this.$list.attr('aria-hidden', false);
        this.$noItem.attr('aria-hidden', true);
      }
    } else {
      Tw.Error(resp.code, resp.msg).page();
    }
  },
  /**
   * @function
   * @desc Render the point list.
   * @param items
   */
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
      this.$btMore.attr('aria-hidden', false);
     // this.$btMore.find('span').text('(' + moreItems + ')'); // 더보기 갯수 표시 안 함.
    } else {
      this.$btMore.hide();
      this.$btMore.attr('aria-hidden', true);
    }
  },
  /**
   * Error callback for _requestPoints.
   * @param resp response
   */
  _onError: function (resp) {
    Tw.Error(resp.code, resp.msg).page();
  }

};
