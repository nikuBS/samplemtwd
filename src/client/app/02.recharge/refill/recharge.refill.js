/**
 * FileName: recharge.refill.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.18
 */

Tw.RechargeRefill = function (rootEl) {
  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService();
  this._history.init();

  this._init();
  this._bindEvent();
};

Tw.RechargeRefill.prototype = {
  _init: function () {
    this.$refillBtn = this.$container.find('.link-long > a');
  },
  _bindEvent: function () {
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

    this.$btnTarget = $(event.currentTarget);
    if (this._checkValidation(this.$btnTarget)) {
      this._goLoad(this._makeUrl(this.$btnTarget));
    }
  },
  _checkValidation: function ($target) {
    return (this._checkIsVisible($target) &&
      this._checkIsReceived() &&
      this._checkIsUsable($target) &&
      this._checkConfirm());
  },
  _checkIsVisible: function ($target) {
    if ($target.hasClass('disabled')) {
      var message = Tw.MSG_RECHARGE.REFILL_A10;
      if (this._isRefillBtn($target)) {
        message = Tw.MSG_RECHARGE.REFILL_A09;
      }
      this._openAlert(message);
      return false;
    }
    return true;
  },
  _checkIsReceived: function () {
    var $selectedCoupon = this.$container.find('.bt-select-arrow.on');
    if ($selectedCoupon.parents('.slick-slide').hasClass('received')) {
      this._openAlert(Tw.MSG_RECHARGE.REFILL_A04);
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
      return this._openConfirm(Tw.MSG_RECHARGE.REFILL_A02);
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
  _showProduct: function () {
    this._popupService.open({
      hbs: 'DA_01_01_01_L01'// hbs의 파일명
    });
  },
  _openAlert: function (message) {
    this._popupService.openAlert(message);
  },
  _openConfirm: function (message) {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, message, '', null, $.proxy(this._submit, this));
  },
  _submit: function () {
    this._goLoad(this._makeUrl(this.$btnTarget));
  }
};
