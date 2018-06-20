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
    this.$container.on('click', '.show-product', $.proxy(this._showProduct, this));
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
    if (this._checkValidation($target)) {
      this._goLoad(this._makeUrl($target));
    }
  },
  _checkValidation: function ($target) {
    return (this._checkIsVisible($target)
      && this._checkIsUsable()
      && this._checkConfirm());
  },
  _checkIsVisible: function ($target) {
    if ($target.hasClass('disabled')) {
      alert(Tw.MESSAGE.REFILL_A01);
      return false;
    }
    return true;
  },
  _checkIsUsable: function () {
    var $msgNode = this.$container.find('.no-use-message');
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
