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
    this.$container.on('click', '.bt-select-arrow', $.proxy(this._selectCoupon, this));
    this.$container.on('click', '.refill-to-my-phone', $.proxy(this._goRefill, this));
    this.$container.on('click', '.refill-history', $.proxy(this._goHistory, this));
  },
  _selectCoupon: function ($event) {
    var $target = $($event.target);
    if ($target.hasClass('on')) {
      $target.parents().siblings().find('.bt-select-arrow').removeClass('on');
    }
  },
  _goRefill: function ($event) {
    $event.preventDefault();
    var $selectedCoupon = this.$container.find('.bt-select-arrow.on');
    var couponNumber = $selectedCoupon.parents('.swiper-slide').attr('id');
    var endDate = $selectedCoupon.parents('.swiper-slide').data('end');

    this._setLocalStorage({'refillCouponNumber': couponNumber, 'refillCouponEndDate': endDate});
    this._goLoad('/myt/refill/select');
  },
  _goHistory: function () {
    this._goLoad('/myt/refill/history');
  },
  _setLocalStorage: function (dataMap) {
    for (var key in dataMap) {
      localStorage.setItem(key, dataMap[key]);
    }
  },
  _goLoad: function (url) {
    this.window.location.href = url;
  }
});
