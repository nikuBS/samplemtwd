/**
 * @file benefit.my-benefit.js
 * @author Hyeryoun Lee (skt.P130712@partner.sk.com)
 * @since 2018. 10. 31.
 * 혜택 > 나의 할인/혜택 화면(BS_01)
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
   * Cache elements for binding events.
   * @private
   */
  _cachedElement: function () {
    this.$payBtn = this.$container.find('#fe-pay');
  },

  _bindEvent: function () {
    this.$payBtn.on('click', $.proxy(this._onClickPay, this));
    // BETA 버젼에서 임시로 외부링크로 이동
    // this.$container.find('[data-id="fe-membership"]').on('click', $.proxy(this._onClickMembership, this));
  },

  /**
   * Event listener for the button click on #fe-pay(포인트 요금납부)
   * @param event
   * @private
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
   * 포인트 요금납부 actionsheet event 설정
   * @param $layer
   * @private
   */
  _bindPopupEvent: function ($layer) {
    $layer.find('[data-role="fe-link"]').on('click', $.proxy(this._setEvent, this));
  },
  /**
   * 포인트 요금납부 클릭 시 다음 주소 저장
   * @param e
   * @private
   */
  _setEvent: function (e) {
    this.$uri = $(e.currentTarget).attr('data-url');
    if(this.$uri) {
      this._historyService.replaceURL(this.$uri);
    }
  }

  /**
   * BETA 버젼에서 임시로 외부링크로 이동
   * @param e
   * @private
   */
  /*
  _onClickMembership: function () {
    // TODO Grand 버젼에서 삭제 필요
    Tw.CommonHelper.openUrlExternal('http://m.tmembership.tworld.co.kr/mobileWeb/html/main.jsp');
  }
  */
};
