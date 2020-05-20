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
  this._rendered();
  this._bindEvent();
  // this._initialize();
};

Tw.MyTJoinMyPlan.prototype = {
  _rendered: function () {
    this.$routers = this.$container.find('[data-id=routers]');
    this.$actions = this.$container.find('[data-id=actions]');
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
  },

  /*
  _initialize: function () {
    //
  },
  */

  /**
   * @function _onBtGotoClicked
   * @desc
   * @private
   */
  _onBtGotoClicked: function (event) {
    var $target = $(event.target);
    var url = $.trim($target.attr('data-href'));
    if (url) {
      this._historyService.goLoad(url);
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
