/**
 * FileName: recharge.refill.select.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.06.18
 */

Tw.RechargeRefillSelect = function (rootEl) {
  this.$container = rootEl;
  this.$document = $(document);
  this.window = window;

  this._apiService = new Tw.ApiService();
  this._popupService = new Tw.PopupService();
  this._history = new Tw.HistoryService();

  this._bindEvent();
};

Tw.RechargeRefillSelect.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.refill-select-btn', $.proxy(this._confirmRefill, this));
  },
  _confirmRefill: function () {
    var couponType = this.$container.find('label.checked').data('value');
    var endDate = this._getParams('endDt');
    this._openPopup(couponType, endDate);
  },
  _openPopup: function (couponType, endDate) {
    var title = couponType + Tw.MESSAGE.REFILL_INFO_01;
    var contents = Tw.MESSAGE.REFILL_INFO_02 + endDate + Tw.MESSAGE.REFILL_INFO_03;
    this._popupService.openConfirm(Tw.BUTTON_LABEL.NOTIFY, title, contents, $.proxy(this._submit, this));
  },
  _submit: function () {
    var reqData = this._makeRequestData();
    this._apiService.request(Tw.API_CMD.BFF_06_0007, reqData)
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },
  _makeRequestData: function () {
    var $target = this.$container.find('label.checked');
    var reqData = JSON.stringify({
      copnIsueNum: this._getParams('copnNm'),
      ofrRt: $target.data('ofrrt'),
      copnDtlClCd: $target.data('copndtlclcd')
    });
    return reqData;
  },
  _success: function (res) {
    this._setHistory();

    if (res.code === '00') {
      this._goLoad('/recharge/refill/complete');
    } else {
      this._goLoad('/recharge/refill/error');
    }
  },
  _fail: function (err) {
    Tw.Logger.log('refill fail', err);
  },
  _getParams: function (key) {
    return Tw.UrlHelper.getQueryParams()[key];
  },
  _goLoad: function (url) {
    this.window.location.href = url;
  },
  _setHistory: function () {
    this._history.pushUrl('/recharge/refill');
  }
};
