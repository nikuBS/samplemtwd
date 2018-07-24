/**
 * FileName: myt.bill.billguide.subCallBill.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.16
 * Info: 콜기프트 요금
 */

Tw.mytBillBillguideSubCallBill = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._assign();
  this._bindEvent();
};

Tw.mytBillBillguideSubCallBill.prototype = {
  _assign: function () {
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
    this._apiService.request(Tw.API_CMD.BFF_05_0045, {
      startDt: this.startDt,
      endDt: this.endDt
    })
      .done($.proxy(this._submitSuccess, this))
      .fail($.proxy(this._submitFail, this));
  },

  _submitSuccess: function (resp) {
    if ( resp.code === '00' ) {
      if ( resp.result ) {
        var result = {
          callData: resp.result.callData,
          startDt: moment(this.startDt).format('YYYY.MM.DD'),
          endDt: moment(this.endDt).format('YYYY.MM.DD')
        };
        this._setDataToTemplate(this._$amtTotalWrap, 'fe-amt-total', result);
      } else {
        this._setDataToTemplate(this._$amtTotalWrap, 'fe-amt-empty', {});
      }
    }
  },

  _setDataToTemplate: function ($element, templateName, data) {
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
  }
};
