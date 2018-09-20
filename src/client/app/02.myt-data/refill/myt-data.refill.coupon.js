/**
 * FileName: myt-data.refill.coupon.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.09.18
 */

Tw.MyTDataRefillCoupon = function (rootEl, coupons) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();

  this._couponList = JSON.parse(coupons);
  this._couponShowed = 20;  // default showing list count is 20
  this._couponItemTeplate = Handlebars.compile($('#tpl_coupon_item').html());

  this._cacheElements();
  this._bindEvent();
};

Tw.MyTDataRefillCoupon.prototype = {
  _cacheElements: function () {
    this.$couponContainer = this.$container.find('.coupon-list');
    this.$btnDiv = this.$container.find('.bt-more');
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-more', $.proxy(this._onMore, this));
    this.$container.on('click', '.fe-btn-refill, .fe-btn-gift', $.proxy(this._onSubmit, this));
  },
  _onMore: function () {
    var data = this._couponList.slice(this._couponShowed, this._couponShowed + 20);
    this.$couponContainer.append(this._couponItemTeplate({
      list: data
    }));
    this._couponShowed = this._couponShowed + data.length;

    if (this._couponShowed === this._couponList.length) {
      this.$btnDiv.addClass('none');
    }
  },
  _onSubmit: function (evt) {
    var no = evt.currentTarget.id;
    var name = evt.currentTarget.title.split('::')[0];
    var period = evt.currentTarget.title.split('::')[1];
    var tab = evt.currentTarget.className.includes('refill') ? 'refill' : 'gift';
    this._historyService.goLoad(
      '/myt/data/refill/coupon/use?tab=' + tab +'&no=' + no + '&name=' + name + '&period=' + period
    );
  }
};
