/**
 * @file roaming.tariff.offer.js
 * @desc T로밍 > 요금제 추천
 * @author 황장호
 * @since 2020-09-30
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

  // 서비스별 이용 가능 국가 모듈
  this.$countries = new Tw.RoamingCountriesTariff(rootEl);
  this.bindEvents();
};

Tw.RoamingTariffOffer.prototype = {
  bindEvents: function () {
    // 서비스별 이용 가능 국가 다이얼로그 핸들러
    this.$container.on('click', '.others a', $.proxy(this._handleShowCountries, this));
  },
  afterInit: function() {

  },
  /**
   * @desc 추천된 요금제 우하단의 '더보기 +' 버튼 눌렀을 때 표시할 국가 팝업 노출
   * @param e EventObject
   */
  _handleShowCountries: function(e) {
    var target = e.currentTarget;
    var defaultProdId = target.getAttribute('data-prodId');
    
    // YT 요금제의 경우, 근접한 요금제 정보로 대치하여 표시 (2020-10-05 석연실님 요청)
    // baro YT 4GB NA6491 ---> baro 3GB NA 6489
    // baro YT 5GB NA6495 ---> baro 4GB NA 6493
    // baro YT 8GB NA6499 ---> baro 7GB NA 6497
    if (defaultProdId === 'NA00006491') { // baro YT 4GB
      defaultProdId = 'NA00006489'; // baro 3GB
    }
    if (defaultProdId === 'NA00006495') { // baro YT 5GB
      defaultProdId = 'NA00006493'; // baro 4GB
    }
    if (defaultProdId === 'NA00006499') { // baro YT 8GB
      defaultProdId = 'NA00006497'; // baro 7GB
    }
    this.$countries.showCountries(defaultProdId);
  }
};
