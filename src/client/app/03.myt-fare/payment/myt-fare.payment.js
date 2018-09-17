Tw.MyTFarePayment = function (rootEl) {
  this.$container = rootEl;
  this._init();
};

Tw.MyTFarePayment.prototype = {
  _init: function () {
    this.account = new Tw.MyTFarePaymentAccount();
    this.auto = new Tw.MyTFarePaymentAuto();
    this.card = new Tw.MyTFarePaymentCard();
    this.point = new Tw.MyTFarePaymentPoint();
    this.sms = new Tw.MyTFarePaymentSms();
  }
};