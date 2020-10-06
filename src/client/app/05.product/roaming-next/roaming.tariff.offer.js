/**
 * @file roaming.tariff.offer.js
 * @desc T로밍 > 추천 요금제
 */

Tw.RoamingTariffOffer = function (rootEl) {
  this.$container = rootEl;

  if (!Tw.Environment.init) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this.afterInit, this));
  } else {
    this.afterInit();
  }
  this.$menu = new Tw.RoamingMenu(rootEl);
  this.$menu.install();

  this.$countries = new Tw.RoamingCountriesTariff(rootEl);
  this.bindEvents();
};

Tw.RoamingTariffOffer.prototype = {
  bindEvents: function () {
    this.$container.on('click', '.others a', $.proxy(this._handleShowCountries, this));
  },
  afterInit: function() {

  },
  _handleShowCountries: function(e) {
    // 추천된 요금제 우하단의 '더보기 +' 버튼 눌렀을 때 표시할 국가 팝업 노출
    var target = e.currentTarget;
    var defaultProdId = target.getAttribute('data-prodId');
    this.$countries.showCountries(defaultProdId);
  }
};
