/**
 * FileName: recharge.refill.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.18
 */

Tw.RechargeRefill = function (rootEl) {
  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this._apiService = new Tw.ApiService();
  this._btnTarget = null;

  this._init();
  this._bindEvent();
};

Tw.RechargeRefill.prototype = {
  _init: function () {
    this.$refillBtn = this.$container.find('.link-long > a');
  },
  _bindEvent: function () {
    this.$document.on('click', '.select-cancel', $.proxy(this._closePopup, this));
    this.$document.on('click', '.select-submit', $.proxy(this._submit, this));

    this.$container.on('click', '.slick-slide', $.proxy(this._selectCoupon, this));
    this.$container.on('click', '.link-long > a', $.proxy(this._goRefill, this));
    this.$container.on('click', '.refill-history', $.proxy(this._goHistory, this));
    this.$container.on('click', '.show-product', $.proxy(this._showProduct, this));
  },
  _selectCoupon: function (event) {
    var $target = $(event.currentTarget);
    if ($target.find('.bt-select-arrow').hasClass('on')) {
      $target.find('.bt-select-arrow').removeClass('on');
      this.$refillBtn.addClass('disabled');
    } else {
      $target.find('.bt-select-arrow').addClass('on');
      $target.siblings().find('.bt-select-arrow').removeClass('on');
      this.$refillBtn.removeClass('disabled');
    }
  },
  _goRefill: function (event) {
    event.preventDefault();

    this._btnTarget = $(event.currentTarget);
    if (this._checkValidation(this._btnTarget)) {
      this._goLoad(this._makeUrl(this._btnTarget));
    }
  },
  _checkValidation: function ($target) {
    return (this._checkIsVisible($target)
      && this._checkIsReceived()
      && this._checkIsUsable($target)
      && this._checkConfirm());
  },
  _checkIsVisible: function ($target) {
    if ($target.hasClass('disabled')) {
      var message = Tw.MESSAGE.REFILL_A10;
      if (this._isRefillBtn($target)) {
        message = Tw.MESSAGE.REFILL_A09;
      }
      this._openAlert(message);
      return false;
    }
    return true;
  },
  _checkIsReceived: function () {
    var $selectedCoupon = this.$container.find('.bt-select-arrow.on');
    if ($selectedCoupon.parents('.slick-slide').hasClass('received')) {
      this._openAlert(Tw.MESSAGE.REFILL_A04);
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
      this._openAlert($msgNode.text());
      return false;
    }
    return true;
  },
  _checkIsFirst: function () {
    return this.$container.find('.slick-slide:first a').hasClass('on');
  },
  _checkConfirm: function () {
    if (!this._checkIsFirst()) {
      return this._openConfirm(Tw.MESSAGE.REFILL_A02);
    }
    return true;
  },
  _goHistory: function () {
    this._goLoad('/recharge/refill/history');
  },
  _goLoad: function (url) {
    this.$window.location.href = url;
  },
  _makeUrl: function ($target) {
    var $selectedCoupon = this.$container.find('.bt-select-arrow.on');
    var couponNumber = $selectedCoupon.parents('.slick-slide').attr('id');
    var endDate = $selectedCoupon.parents('.slick-slide').data('end');

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
  },
  _openAlert: function (message) {
    skt_landing.action.popup.open({
      'title': '알림',
      'close_bt': true,
      'title2': message,
      'bt_num': 'one',
      'type': [{
        class: 'bt-red1 select-cancel',
        txt: '확인'
      }]
    });
  },
  _openConfirm: function (message) {
    skt_landing.action.popup.open({
      'title': '알림',
      'close_bt': true,
      'title2': message,
      'bt_num': 'two',
      'type': [{
        class: 'bt-white1 select-cancel',
        txt: '취소'
      }, {
        class: 'bt-red1 select-submit',
        txt: '확인'
      }]
    });
  },
  _closePopup: function () {
    skt_landing.action.popup.close();
  },
  _submit: function () {
    this._closePopup();
    this._goLoad(this._makeUrl(this._btnTarget));
  }
};
