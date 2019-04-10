/**
 * @file benefit.my-benefit.js
 * @author Hyeryoun Lee
 * @since 2018-10-31
 */
/**
 * @class
 * @desc 혜택 > 나의 할인/혜택 화면(BS_01)을 위한 class
 * @param {Object} rootEl 최상위 element Object
 * @param {Object} okCash OK 캐쉬백 point
 * @param {Object} t T멤버십 point
 * @param {Object} rainbow Rainbow point
 * @returns {void}
 */
Tw.BenefitMyBenefit = function (rootEl, okCash, t, rainbow) {
  this._children = null;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();
  this._points = {
    ocb: okCash,
    t: t,
    rainbow: rainbow
  };
  this._cachedElement();
  this._bindEvent();

};

Tw.BenefitMyBenefit.prototype = {
  /**
   * @function
   * @desc Cache elements for binding events.
   * @returns {void}
   */
  _cachedElement: function () {
    this.$payBtn = this.$container.find('#fe-pay');
  },

  /**
   * @function
   * @desc Bind events to elements.
   */
  _bindEvent: function () {
    this.$payBtn.on('click', $.proxy(this._onClickPay, this));
    // BETA 버젼에서 임시로 외부링크로 이동
    // this.$container.find('[data-id="fe-membership"]').on('click', $.proxy(this._onClickMembership, this));
  },

  /**
   * @function
   * @desc Event listener for the button click on #fe-pay(포인트 요금납부)
   * @param event
   */
  _onClickPay: function (event) {
    // 포인트 요금납부 actionsheet open
    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      btnfloating: { 'attr': 'type="button" data-role="fe-bt-close"', 'txt': '닫기' ,'class': 'tw-popup-closeBtn'},
      data: [{
        'list': [
          {
            'button-attr': 'data-role="fe-link" data-url="/myt-fare/bill/cashbag"', 'check-attr': 'tit-full',
            txt: Tw.BENEFIT.PAYMENT.TYPE.OK + ' (' + this._points.ocb + 'P)'
          },
          {
            'button-attr': 'data-role="fe-link" data-url="/myt-fare/bill/tpoint"', 'check-attr': 'tit-full',
            txt: Tw.BENEFIT.PAYMENT.TYPE.T + ' (' + this._points.t + 'P)'
          },
          {
            'button-attr': 'data-role="fe-link" data-url="/myt-fare/bill/rainbow"', 'check-attr': 'tit-full',
            txt: Tw.BENEFIT.PAYMENT.TYPE.RAINBOW + '  (' + this._points.rainbow + 'P)'
          }
        ]
      }]
    }, $.proxy(this._bindPopupEvent, this), null, null, $(event.currentTarget));
  },

  /**
   * @function
   * @desc 포인트 요금납부 actionsheet event 설정
   * @param $layer
   */
  _bindPopupEvent: function ($layer) {
    $layer.find('[data-role="fe-link"]').on('click', $.proxy(this._setEvent, this));
  },
  /**
   * @function
   * @desc 포인트 요금납부 클릭 시 다음 주소 저장
   * @param e
   */
  _setEvent: function (e) {
    this.$uri = $(e.currentTarget).attr('data-url');
    if(this.$uri) {
      this._historyService.replaceURL(this.$uri);
    }
  }
};
