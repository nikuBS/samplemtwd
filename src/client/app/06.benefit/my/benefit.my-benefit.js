/**
 * FileName: benefit.my-benefit.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 31.
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
  _cachedElement: function () {
    this.$payBtn = this.$container.find('#fe-pay');
  },

  _bindEvent: function () {
    this.$payBtn.on('click', $.proxy(this._onClickPay, this));
  },

  _onClickPay: function () {
    this._popupService.open({
      hbs: 'actionsheet_link_a_type',
      layer: true,
      title: Tw.BENEFIT.PAYMENT.TITLE,
      data: [{

        'list': [
          {
            attr: 'data-role="fe-link"; data-url="/myt/fare/payment/cashbag"',
            value: Tw.BENEFIT.PAYMENT.TYPE.OK + ' (' + this._points.ocb + Tw.BENEFIT.PAYMENT.UNIT + ')'
          },
          {
            attr: 'data-role="fe-link"; data-url="/myt/fare/payment/tpoint"',
            value: Tw.BENEFIT.PAYMENT.TYPE.T + ' (' + this._points.t + Tw.BENEFIT.PAYMENT.UNIT + ')'
          },
          {
            attr: 'data-role="fe-link"; data-url="/myt/fare/payment/rainbow"',
            value: Tw.BENEFIT.PAYMENT.TYPE.RAINBOW + '  (' + this._points.rainbow + Tw.BENEFIT.PAYMENT.UNIT + ')'
          }
        ]
      }]
    }, $.proxy(this._bindBtnListEvent, this));
  },

  _bindBtnListEvent: function ($layer) {
    $layer.find('[data-role="fe-link"]').on('click', $.proxy(this._onClickPayByPointLinK, this));
  },

  _onClickPayByPointLinK: function (e) {
    var settingGoUrl = $(e.currentTarget).attr('data-url');
    this._historyService.goLoad(settingGoUrl);
  }
};
