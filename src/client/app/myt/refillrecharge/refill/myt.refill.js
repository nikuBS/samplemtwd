Tw.MytRefill = function (rootEl) {
  this.$container = rootEl;
  this.window = window;
  this._apiService = new Tw.ApiService();

  this._bindEvent();
};

Tw.MytRefill.prototype = Object.create(Tw.View.prototype);
Tw.MytRefill.prototype.constructor = Tw.MytRefill;

Tw.MytRefill.prototype = Object.assign(Tw.MytRefill.prototype, {
  _bindEvent: function () {
    this.$container.on('click', '.coupon-cont', $.proxy(this._selectCoupon, this));
    this.$container.on('click', '.link-long > a', $.proxy(this._goRefill, this));
    this.$container.on('click', '.refill-history', $.proxy(this._goHistory, this));
    this.$container.on('click', '.bt-link-tx', $.proxy(this._showProduct, this));
  },
  _selectCoupon: function (event) {
    var $target = $(event.currentTarget).parents('.swiper-slide');
    var btn = this.$container.find('.link-long > a');
    if ($target.find('.bt-select-arrow').hasClass('on')) {
      $target.siblings().find('.bt-select-arrow').removeClass('on');
      btn.removeClass('disabled');
    } else {
      btn.addClass('disabled');
    }
  },
  _goRefill: function (event) {
    event.preventDefault();

    var $target = $(event.currentTarget);
    if (!$target.hasClass('disabled')) {
      this._goLoad(this._makeUrl($target));
    }
  },
  _goHistory: function () {
    this._goLoad('/myt/refill/history');
  },
  _goLoad: function (url) {
    this.window.location.href = url;
  },
  _makeUrl: function ($target) {
    var $selectedCoupon = this.$container.find('.bt-select-arrow.on');
    var couponNumber = $selectedCoupon.parents('.swiper-slide').attr('id');
    var endDate = $selectedCoupon.parents('.swiper-slide').data('end');

    var url = '/myt/refill';
    if ($target.hasClass('refill-to-my-phone')) {
      url += '/select';
    } else {
      url += '/gift';
    }
    url += '?copnNm=' + couponNumber + '&endDt=' + endDate;
    return url;
  },
  _showProduct: function (event) {
    event.preventDefault();
    skt_landing.action.popup.open({
      hbs:'DA_01_01_01_L01'
    });
  }
});
