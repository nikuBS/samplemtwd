/**
 * @file myt-join.myplan.js
 * @author Kim, Hansoo (keiches@sptek.co.kr)
 * @since 2019-12-04
 */
/**
 * @class Tw.MyTJoinMyPlan
 * @desc MyT > 나의 가입정보 > 나의 요금제
 * @param {Object} params
 */
Tw.MyTJoinMyPlan = function (params) {
  this.$container = params.$element;
  this._historyService = new Tw.HistoryService(this.$container);
  this._cachedElement();
  this._bindEvent();
  this._initialize();
};

Tw.MyTJoinMyPlan.prototype = {
  _cachedElement: function () {
    this.$routers = this.$container.find('[data-id=routers]');
    this.$actions = this.$container.find('[data-id=actions]');
    this.$btnMore = this.$container.find('.btn-more'); // .children().eq(0);
  },

  /**
   * @function _bindEvent
   * @desc 바인드 이벤트
   */
  _bindEvent: function () {
    this.$routers
      .on('click', '[data-id=bt-goto]', $.proxy(this._onBtGotoClicked, this));
    this.$actions
      .on('click', '[data-id=bt-alarm-available]', $.proxy(this._onBtAlarmAvailableClicked, this))
      .on('click', '[data-id=bt-change-plan]', $.proxy(this._onBtChangePlanClicked, this));
    if (this.$btnMore.length) {
      // this.$container.find('.btn-more').children().eq(0)
      this.$btnMore
        .one('click', '> button', $.proxy(function (event) {
          event.preventDefault();
          $(event.target).parent().hide();
          this.$container/*.find('.tod-full-link-list')*/.find('[data-id=addition-prods]').removeClass('tod-hidden-list')
            .find('button, a').eq(0).focus();
        }, this));
    }
  },

  _initialize: function () {
    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    /* this._lineComponent = */
    new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  },

  /**
   * @function _onBtGotoClicked
   * @desc
   * @private
   */
  _onBtGotoClicked: function (event) {
    var $target = $(event.target);
    var href = $.trim($target.data('href'));
    if (href) {
      this._historyService.goLoad(href);
    }
  },

  /**
   * @function _onBtAlarmAvailableClicked
   * @desc
   * @private
   */
  _onBtAlarmAvailableClicked: function () {
    this._historyService.goLoad('/myt-join/myplan/alarm');
  },

  /**
   * @function _onBtChangePlanClicked
   * @desc
   * @private
   */
  _onBtChangePlanClicked: function () {
    this._historyService.goLoad('/product/mobileplan');
  }
};
