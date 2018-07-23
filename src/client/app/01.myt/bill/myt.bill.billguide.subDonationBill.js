/**
 * FileName: myt.bill.billguide.subDonationBill.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.16
 * Info: 기부금/후원금
 */

Tw.mytBillBillguideSubDonationBill = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._donationList = [];
  this._LENGTH_PER_PAGE = 10;
  this._currentPage = 1;

  this._assign();
  this._bindEvent();
};

Tw.mytBillBillguideSubDonationBill.prototype = {
  _assign: function () {
    this._$amtListWrap = this.$container.find('.fe-amt-list-wrap');
    this._$amtTotalWrap = this.$container.find('.fe-amt-total-wrap');
    this._$amtPagingWrap = this.$container.find('.fe-amt-paging-wrap');
  },

  _bindEvent: function () {
    this.$container.on('click', '.tube-list li', $.proxy(this._onClickDate, this));
    this.$container.on('click', '.fe-amt-paging-wrap .fe-btn-page', $.proxy(this._onClickBtnPage, this));
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

  _onClickBtnPage: function (event) {
    var $target = $(event.currentTarget);
    if ( $target.data('idx') === this._currentPage ) {
      return;
    }
    this._currentPage = $target.data('idx');
    this.$container.find('.fe-amt-paging-wrap .fe-btn-page').removeClass('active');
    $target.addClass('active');
    this._drawList();
  },

  _submitSuccess: function (resp) {
    if ( resp.code === '00' ) {
      var donationList = resp.result.donationList;
      if ( resp.result && _.size(donationList) ) {
        this._donationList = donationList;
        this._drawList();
        this._drawPaging();
        var amtTotal = this._getAmtTotal(resp.result);
        this._setDataToTemplate(this._$amtTotalWrap, 'fe-amt-total', amtTotal);
      } else {
        this._$amtListWrap.html('');
        this._$amtPagingWrap.html('');
        this._setDataToTemplate(this._$amtTotalWrap, 'fe-amt-empty', {});
      }
    }
  },

  _drawList: function () {
    var listPerpage = this._getAmtListPerPage();
    this._$amtListWrap.html('');
    this._setDataToTemplate(this._$amtListWrap, 'fe-amt-list', {
      donationList: listPerpage
    });
  },

  _drawPaging: function () {
    var pagingSize = Math.ceil(Number(_.size(this._donationList) / this._LENGTH_PER_PAGE));
    var pages = _.map(_.range(pagingSize), $.proxy(function (v, idx) {
      return {
        isActive: (this._currentPage - 1) === idx,
        idx: idx + 1
      };
    }, this));

    this._setDataToTemplate(this._$amtPagingWrap, 'fe-amt-paging', {
      pages: pages
    });
  },

  _submitFail: function () {

  },

  _getAmtTotal: function (result) {
    return {
      amt: this._getAmtWithAdded(result.totSponAmt),
      startDt: moment(this.startDt).format('YYYY.MM.DD'),
      endDt: moment(this.endDt).format('YYYY.MM.DD')
    };
  },

  _getAmtListPerPage: function () {
    var list = [];
    var start = (this._currentPage - 1) * this._LENGTH_PER_PAGE;
    var end = (this._currentPage * this._LENGTH_PER_PAGE);
    for ( var i = start; i < end; i++ ) {
      if ( this._donationList[i] ) {
        var item = this._donationList[i];
        item.billTcDt = moment(item.billTcDt).format('YYYY.MM.DD');
        item.sponAmt = this._getAmtWithAdded(item.sponAmt);
        list.push(item);
      }
    }
    return list;
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
  },

  _getAmtWithAdded: function (amt) {
    return Tw.FormatHelper.addComma(String(Math.floor(Number(amt))));
  }
};
