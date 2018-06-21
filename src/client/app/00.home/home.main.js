// Author Ara Jo (araara.jo@sk.com)

Tw.HomeMain = function (rootEl) {
  Tw.View.apply(this, arguments);
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();

  this._init();
  this._bindEvent();
};

Tw.HomeMain.prototype = Object.create(Tw.View.prototype);
Tw.HomeMain.prototype.constructor = Tw.HomeMain;

Tw.HomeMain.prototype = Object.assign(Tw.HomeMain.prototype, {
  _init: function() {
    this.tplGiftCard = Handlebars.compile($('.gift-template').html());
    this.$giftCard = this.$container.find('#gift-card')
  },
  _bindEvent: function () {
    this.$container.on('click', '#refill-product', $.proxy(this._openRefillProduct, this));
    this.$container.on('click', '#gift-product', $.proxy(this._openRefillProduct, this));
    this.$container.on('click', '#gift-balance', $.proxy(this._getGiftBalance, this));
  },

  // 리필하기
  _openRefillProduct: function ($event) {
    $event.preventDefault();
    skt_landing.action.popup.open({
      hbs: 'DA_01_01_01_L01'// hbs의 파일명
    });
  },

  // 선물하기
  _openGiftProduct: function ($event) {
    $event.preventDefault();
    skt_landing.action.popup.open({
      hbs: 'DA_02_01_L01'// hbs의 파일명
    });
  },

  _getGiftBalance: function () {
    var resp = {
      code: '00',
      msg: 'success',
      result: {
        reqCnt: '1',
        giftRequestAgainYn: 'Y',
        dataRemQty: '3500'
      }
    };

    resp.result.showDataMb = Tw.FormatHelper.addComma(resp.result.dataRemQty);
    resp.result.showDataGb = Tw.FormatHelper.customDataFormat(resp.result.dataRemQty, 'MB', 'GB').data;
    this.$giftCard.html(this.tplGiftCard(resp.result));

    // this._apiService.request(Tw.API_CMD.BFF_06_0014, {})
    //   .done($.proxy(this._successGiftBalance, this))
    //   .fail($.proxy(this._failGiftBalance, this));
  },

  _successGiftBalance: function (resp) {
    resp.result.showDataMb = Tw.FormatHelper.addComma(resp.result.dataRemQty);
    resp.result.showDataGb = Tw.FormatHelper.customDataFormat(resp.result.dataRemQty, 'MB', 'GB').data;
    this.$giftCard.html(this.tplGiftCard(resp.result));
  },

  _failGiftBalance: function (error) {

  }
});


