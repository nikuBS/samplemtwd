Tw.MyTFarePayment = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._init();
};

Tw.MyTFarePayment.prototype = {
  _init: function () {
    this._openPaymentOption();

    this.account = new Tw.MyTFarePaymentAccount();
    this.auto = new Tw.MyTFarePaymentAuto();
    this.card = new Tw.MyTFarePaymentCard();
    this.point = new Tw.MyTFarePaymentPoint();
    this.sms = new Tw.MyTFarePaymentSms();
  },
  _openPaymentOption: function () {
    this._popupService.open({
      hbs: 'actionsheet_link_b_type',// hbs의 파일명
      layer: true
    });
  }
};