/**
 * FileName: myt-fare.info.history.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFareInfoHistoryDetail = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';

  this._historyService = new Tw.HistoryService(rootEl);

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareInfoHistoryDetail.prototype = {
  _init: function () {
    this.rootPathName = this._historyService.pathname;

    this.detailData = JSON.parse(Tw.UIService.getLocalStorage('detailData'));
    this.queryParams = Tw.UrlHelper.getQueryParams();

    switch (this.queryParams.type) {
      case 'DI':
        this.detailData.dataUseTermStart = this.detailData.dataDt.substr(0, 8) + '01';
        this.detailData = Object.assign(this.detailData, this.data.data, {
          invYearMonth:Tw.DateHelper.getShortDateNoDate(this.data.data.invDt),
          reqDate:Tw.DateHelper.getShortDate(this.data.data.reqDtm),
          comDate:Tw.DateHelper.getShortDate(this.data.data.opDt)
        });
        /*this.detailData.cardNum = this.data.data.cardNum;
        this.detailData.aprvNum = this.data.data.aprvNum;*/
        switch (this.detailData.dataPayType) {
          case 'CARD':
          case 'POINT':
            this.$templateWrapper.append(this.$template.$directOCBandCard(this.detailData));
            break;
          case 'BANK':
            this.$templateWrapper.append(this.$template.$directBank(this.detailData));
            break;
          default: 
            this.$templateWrapper.append(this.$template.$directBase(this.detailData));
            break;
        }
          break;
      case 'AU':    
          this.$templateWrapper.append(this.$template.$directBase(this.detailData));
        break;
      case 'AT':
        // 자동납부 카드/계좌
        this.detailData.dataUseTermStart = Tw.DateHelper.getShortDate(Tw.DateHelper.getShortFirstDateNoDot(this.detailData.dataLastInvDt));
        this.$templateWrapper.append(this.$template.$auto(this.detailData));
        break;
      case 'RP':
        // 포인트 납부예약
        this.$templateWrapper.append(this.$template.$reservePoint(this.detailData));
        break;
      case 'PN': 
        // 포인트 자동납부
        this.$templateWrapper.append(this.$template.$autoPoint(this.detailData));
        break;
      default: 
        // case : MP, CP (소액/콘텐츠)
        this.$templateWrapper.append(this.$template.$microContents(this.detailData));
        break;
    }
  },

  _updateViewMoreBtnRestCounter: function(e) {
    e.text(e.text().replace(/\((.+?)\)/, '(' + this.renderListData.restCount + ')'));
  },

  _cachedElement: function () {
    this.$templateWrapper = this.$container.find('#fe-detail-wrapper');

    this.$template = {
      $directBase : Handlebars.compile($('#fe-payment-detail-dt').html()),
      $directOCBandCard : Handlebars.compile($('#fe-payment-detail-ocb-card').html()),
      $directBank : Handlebars.compile($('#fe-payment-detail-bank').html()),
      $auto : Handlebars.compile($('#fe-payment-detail-auto').html()),
      $microContents : Handlebars.compile($('#fe-payment-detail-micro-contents').html()),
      $reservePoint: Handlebars.compile($('#fe-payment-detail-reserve-point').html()),
      $autoPoint: Handlebars.compile($('#fe-payment-detail-auto-point').html())
    };
  },

  _bindEvent: function () {
    this.$templateWrapper.find('.go-bill-tax').on('click',$.proxy(this._moveBillTax,this));
    this.$templateWrapper.find('.go-bill-cash').on('click',$.proxy(this._moveBillCash,this));
  },

  _moveBillTax: function (){
    this._historyService.goLoad('/myt-fare/info/bill-tax');
  },

  _moveBillCash: function (){
    this._historyService.goLoad('/myt-fare/info/bill-cash');
  }
};
