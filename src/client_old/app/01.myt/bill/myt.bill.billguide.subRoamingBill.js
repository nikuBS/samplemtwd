/**
 * FileName: myt.bill.billguide.subRoamingBill.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.16
 * Info: 로밍 사용요금
 */

Tw.mytBillBillguideSubRoamingBill = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._assign();
  this._bindEvent();
  this._init();
};

Tw.mytBillBillguideSubRoamingBill.prototype = {
  _assign: function () {
    this._$amtListWrap = this.$container.find('.fe-amt-list-wrap');
    this._$amtTotalWrap = this.$container.find('.fe-amt-total-wrap');
    this._$dateLi = this.$container.find('.tube-list li');
  },

  _bindEvent: function () {
    this._$dateLi.on('click', $.proxy(this._onClickDate, this));
  },

  _onClickDate: function (event) {
    var $target = $(event.currentTarget);
    var unit = $target.data('unit');
    var measurements = $target.data('measurements');
    this.startDt = this._getStartDt(unit, measurements);
    this.endDt = this._getEndDt();
    this._apiService.request(Tw.API_CMD.BFF_05_0044, {
      startDt: this.startDt,
      endDt: this.endDt
    })
      .done($.proxy(this._submitSuccess, this))
      .fail($.proxy(this._submitFail, this));
  },

  _init: function () {
  },

  _submitSuccess: function (resp) {
    if ( resp.code === '00' ) {
      if ( resp.result && _.size(resp.result.roamingList) ) {
        var amtList = this._getAmtList(resp.result.roamingList);
        var amtTotal = this._getAmtTotal(resp.result.roamingList);
        this._setDataToTemplate(this._$amtListWrap, 'fe-amt-list', {
          roamingList: amtList
        });
        this._setDataToTemplate(this._$amtTotalWrap, 'fe-amt-total', amtTotal);
      } else {
        this._$amtListWrap.html('');
        this._setDataToTemplate(this._$amtTotalWrap, 'fe-amt-empty', {});
      }
    }
  },

  _submitFail: function () {

  },

  _getAmtTotal: function(roamingList) {
    var amtTotal = _.find(roamingList, { chargetItemDesc: Tw.MSG_MYT.BILL_GUIDE_04 });
    amtTotal.amt = this._getAmtWithAdded(amtTotal.amt);
    amtTotal.startDt = moment(this.startDt).format('YYYY.MM.DD');
    amtTotal.endDt = moment(this.endDt).format('YYYY.MM.DD');
    return amtTotal;
  },

  _getAmtList: function(roamingList) {
    var amtList = _.reject(roamingList, { chargetItemDesc: Tw.MSG_MYT.BILL_GUIDE_04 });
    return _.each(amtList, $.proxy(function (amtItem) {
      amtItem.amt = this._getAmtWithAdded(amtItem.amt);
    }, this));
  },

  _setDataToTemplate: function($element, templateName, data) {
    $element.html(this._getTmplHtml(templateName, data));
  },

  _getStartDt: function (unit, measurements) {
    return moment().subtract(unit, measurements).format('YYYYMMDD');
  },

  _getEndDt: function () {
    return moment().format('YYYYMMDD');
  },

  _getTmplHtml: function (name, data) {
    var source = $('#' + name).html();
    var template = Handlebars.compile(source);
    return template(data);
  },

  _getAmtWithAdded: function (amt) {
    return Tw.FormatHelper.addComma(String(Math.floor(Number(amt))));
  }
};
