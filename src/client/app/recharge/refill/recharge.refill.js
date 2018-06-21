Tw.MytRefill = function (rootEl) {
  this.$container = rootEl;
  this.window = window;
  this._apiService = new Tw.ApiService();

  this._init();
  this._bindEvent();
};

Tw.MytRefill.prototype = Object.create(Tw.View.prototype);
Tw.MytRefill.prototype.constructor = Tw.MytRefill;

Tw.MytRefill.prototype = Object.assign(Tw.MytRefill.prototype, {
  _init: function () {
    this.$refillBtn = this.$container.find('.link-long > a');
  },
  _bindEvent: function () {
    this.$container.on('click', '.coupon-cont', $.proxy(this._selectCoupon, this));
    this.$container.on('click', '.link-long > a', $.proxy(this._goRefill, this));
    this.$container.on('click', '.refill-history', $.proxy(this._goHistory, this));
    this.$container.on('click', '.show-product', $.proxy(this._showProduct, this));
  },
  _selectCoupon: function (event) {
    var $target = $(event.currentTarget).parents('.swiper-slide');
    if ($target.find('.bt-select-arrow').hasClass('on')) {
      $target.siblings().find('.bt-select-arrow').removeClass('on');
      this.$refillBtn.removeClass('disabled');
    } else {
      this.$refillBtn.addClass('disabled');
    }
  },
  _goRefill: function (event) {
    event.preventDefault();

    var $target = $(event.currentTarget);
    if (this._checkValidation($target)) {
      this._goLoad(this._makeUrl($target));
    }
  },
  _checkValidation: function ($target) {
    return (this._checkIsVisible($target)
      && this._checkIsUsable($target)
      && this._checkConfirm());
  },
  _checkIsVisible: function ($target) {
    if ($target.hasClass('disabled')) {
      var message = Tw.MESSAGE.REFILL_A10;
      if (this._isRefillBtn($target)) {
        message = Tw.MESSAGE.REFILL_A01;
      }
      alert(message);
      return false;
    }
    return true;
  },
  _checkIsUsable: function ($target) {
    var className = '.no-gift-use-message';
    if (this._isRefillBtn($target)) {
      className = '.no-refill-use-message';
    }
    var $msgNode = this.$container.find(className);
    if ($msgNode.length > 0) {
      alert($msgNode.text());
      return false;
    }
    return true;
  },
  _checkIsFirst: function () {
    return this.$container.find('.swiper-slide:first a').hasClass('on');
  },
  _checkConfirm: function () {
    if (!this._checkIsFirst()) {
      if (!confirm(Tw.MESSAGE.REFILL_A02)) {
        return false;
      }
    }
    return true;
  },
  _goHistory: function () {
    this._goLoad('/recharge/refill/history');
  },
  _goLoad: function (url) {
    this.window.location.href = url;
  },
  _makeUrl: function ($target) {
    var $selectedCoupon = this.$container.find('.bt-select-arrow.on');
    var couponNumber = $selectedCoupon.parents('.swiper-slide').attr('id');
    var endDate = $selectedCoupon.parents('.swiper-slide').data('end');

    var url = '/recharge/refill';
    if (this._isRefillBtn($target)) {
      url += '/select';
    } else {
      url += '/gift';
    }
    url += '?copnNm=' + couponNumber + '&endDt=' + endDate;
    return url;
  },
  _isRefillBtn: function ($target) {
    return $target.hasClass('refill-to-my-phone');
  },
  _showProduct: function (event) {
    event.preventDefault();
    skt_landing.action.popup.open({
      hbs:'DA_01_01_01_L01'
    });
  }
});
