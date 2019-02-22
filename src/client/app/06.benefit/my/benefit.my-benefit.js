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
      hbs: 'actionsheet01',
      layer: true,
      btnfloating: { 'attr': 'type="button" data-role="fe-bt-close"', 'txt': '닫기' },
      data: [{
        'list': [
          {
            'button-attr': 'data-role="fe-link" data-url="/myt-fare/bill/cashbag"', 'check-attr': 'tit-full',
            txt: Tw.BENEFIT.PAYMENT.TYPE.OK + ' (' + this._points.ocb + Tw.BENEFIT.PAYMENT.UNIT + ')'
          },
          {
            'button-attr': 'data-role="fe-link" data-url="/myt-fare/bill/tpoint"', 'check-attr': 'tit-full',
            txt: Tw.BENEFIT.PAYMENT.TYPE.T + ' (' + this._points.t + Tw.BENEFIT.PAYMENT.UNIT + ')'
          },
          {
            'button-attr': 'data-role="fe-link" data-url="/myt-fare/bill/rainbow"', 'check-attr': 'tit-full',
            txt: Tw.BENEFIT.PAYMENT.TYPE.RAINBOW + '  (' + this._points.rainbow + Tw.BENEFIT.PAYMENT.UNIT + ')'
          }
        ]
      }]
    }, $.proxy(this._bindPopupEvent, this));
  },

  _bindPopupEvent: function ($layer) {
    $layer.find('[data-role="fe-link"]').on('click', $.proxy(this._onClickPayByPointLinK, this));
    $layer.find('[data-role="fe-bt-close"]').on('click', $.proxy(this._popupService.close, this));
  },

  _onClickPayByPointLinK: function (e) {
    var settingGoUrl = $(e.currentTarget).attr('data-url');
    // back으로 돌아오면 url에 hash 때문에 actionsheet 오동작
    this._historyService.replace('/benefit/my');
    this._historyService.goLoad(settingGoUrl);
  }
};
