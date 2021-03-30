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
  this._bpcpService = Tw.Bpcp;
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
  },

  _initialize: function () {
    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    // /* this._lineComponent = */ new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
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
    /*
    // [OP002-10778] V컬러링 옵션 상품인 경우 설정 버튼에서 과금팝업 노출 후 BPCP 화면으로 이동처리
    // API에서 전달받은 가공하지 않은 버튼 링크
    var linkUrl = $target.data('link-url');
    var targetUrl = $.trim($target.attr('data-href'));
    if ( targetUrl ) {
      if ( this._bpcpService.isBpcp(linkUrl) ) {
        // 요금 상품 중 BPCP 경로가 있는 경우
        if (Tw.BrowserHelper.isApp()) {
          Tw.CommonHelper.showDataCharge($.proxy(function () {
            this._bpcpService.open(linkUrl);
          }, this));
        } else {
          this._bpcpService.open(linkUrl);
        }
      } else {
        this._historyService.goLoad(targetUrl);
      }
    }
    */
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
