/**
 * @file myt-fare.info.history.js
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018. 9. 17
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

    this.detailData = this.data.content ? this.data.content : JSON.parse(Tw.CommonHelper.getLocalStorage('detailData'));
    this.queryParams = Tw.UrlHelper.getQueryParams();

    switch (this.queryParams.type) {
      case Tw.MYT_FARE_PAYMENT_TYPE.DIRECT:
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
      case Tw.MYT_FARE_PAYMENT_TYPE.AUTOALL:    
        // 통합인출 조회
          this.$templateWrapper.append(this.$template.$autoUnit(this.detailData));
        break;
      case Tw.MYT_FARE_PAYMENT_TYPE.AUTO:
        // 자동납부 카드/계좌
        this.$templateWrapper.append(this.$template.$auto(this.detailData));
        break;
      case Tw.MYT_FARE_PAYMENT_TYPE.PRESERVE:
        // 포인트 납부예약
        this.$templateWrapper.append(this.$template.$reservePoint(this.detailData));
        break;
      case Tw.MYT_FARE_PAYMENT_TYPE.PAUTO: 
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
      $autoUnit : Handlebars.compile($('#fe-payment-detail-auto-unit').html()), // 통합인출
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
