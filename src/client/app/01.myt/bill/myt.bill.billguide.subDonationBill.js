/**
 * FileName: myt.bill.billguide.subDonationBill.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.16
 * Info: 기부금/후원금
 */

Tw.mytBillBillguideSubDonationBill = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._assign();
  this._bindEvent();
  this._init();
};

Tw.mytBillBillguideSubDonationBill.prototype = {
  _assign: function () {
    this._$amtListWrap = this.$container.find('.amt-list-wrap');
    this._$amtTotalWrap = this.$container.find('.amt-total-wrap');
    this._$dateLi = this.$container.find('.tube-list li');
  },

  _bindEvent: function () {
    this._$dateLi.on('click', $.proxy(this._onClickDate, this));
  },

  _onClickDate: function (event) {
    var $target = $(event.currentTarget);
    var unit = $target.attr('unit');
    var measurements = $target.attr('measurements');
    this.startDt = this._getStartDt(unit, measurements);
    this.endDt = this._getEndDt();
    this._apiService.request(Tw.API_CMD.BFF_05_0038, {
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
      if ( resp.result && _.size(resp.result.donationList) ) {
        var donationList = this._getAmtList(resp.result.donationList);
        var amtTotal = this._getAmtTotal(resp.result);
        this._setDataToTemplate(this._$amtListWrap, 'amt-list', {
          donationList: donationList
        });
        this._setDataToTemplate(this._$amtTotalWrap, 'amt-total', amtTotal);
      } else {
        this._$amtListWrap.html('');
        this._setDataToTemplate(this._$amtTotalWrap, 'amt-empty', {});
      }
    }
  },

  _submitFail: function () {

  },

  _getAmtTotal: function(result) {
    return {
      amt: this._getAmtWithAdded(result.totSponAmt),
      startDt: moment(this.startDt).format('YYYY.MM.DD'),
      endDt: moment(this.endDt).format('YYYY.MM.DD')
    };
  },

  _getAmtList: function(donationList) {
    return _.each(donationList, $.proxy(function (amtItem) {
      amtItem.billTcDt = moment(amtItem.billTcDt).format('YYYY.MM.DD');
      amtItem.sponAmt = this._getAmtWithAdded(amtItem.sponAmt);
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
