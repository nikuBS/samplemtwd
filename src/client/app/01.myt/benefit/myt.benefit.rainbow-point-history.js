/**
 * FileName: myt.benefit.rainbow-point-history.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 14.
 */
Tw.MyTBenefitRainbowPointHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._dateHelper = Tw.DateHelper;
  this._popupService = Tw.Popup;
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTBenefitRainbowPointHistory.prototype = {
  _init: function () {
    this.today = this._dateHelper.getShortDateWithFormat(new Date(), 'YYYY-MM-DD');
    this._setPeriod(3);
  },

  _cachedElement: function () {
    this.$fromDate = this.$container.find('input[data-type="from"]');
    this.$toDate = this.$container.find('input[data-type="to"]');
  },

  _bindEvent: function () {
    this.$container.on('change', '.fe-period input', $.proxy(this._onChangePeriod, this));
    this.$container.on('click', 'button[data-id="search"]', $.proxy(this._onClickSearch, this));
  },

  _onChangePeriod: function (e) {
    var month = e.target.getAttribute('data-month');
    this._setPeriod(month);
  },

  _setPeriod: function (months) {
    this.$toDate.val(this.today);
    var strFrom = this._dateHelper.getPastShortDate(months + Tw.DATE_UNIT.MONTH);
    strFrom = this._dateHelper.getShortDateWithFormat(strFrom, 'YYYY-MM-DD');
    this.$fromDate.val(strFrom);
  },

  _onClickSearch: function (e) {
    var params = {
      fromDt: this.$fromDate.val().replace(/-/g, ''),
      toDt: this.$toDate.val().replace(/-/g, ''),
      page: 1,
      size: 20
    }
    this._apiService.request(Tw.API_CMD.BFF_05_0100, params)
      .done($.proxy(this._onHistoryDataReceived, this))
      .fail(function () {
      });
  },

  _onHistoryDataReceived: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      //TODO render the list
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  }
};