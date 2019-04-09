/**
 * @file [나의요금-요금납부조회-상세보기] 관련 처리
 * @author Lee Kirim 
 * @since 2018-09-17
 */

 /**
  * @class 
  * @desc 요금납부조회 상세내역을 위한 class
  * 
  * @param {Object} rootEl - 최상위 element Object
  * @param {JSON} data - myt-fare.info.history.controlloer.ts 로 부터 전달되어 온 납부내역 정보
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

  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * - rootPathName 현재 주소
   * - detailData 자료 데이터
   * - queryParams 쿼리로 받아온 객체
   * - query type 에 따라 표기될 렌더링될 템플릿 설정
   * @return {void}
   */
  _init: function () {
    this.rootPathName = this._historyService.pathname;

    this.detailData = this.data.content ? this.data.content : {};
    this.queryParams = Tw.UrlHelper.getQueryParams();

    switch (this.queryParams.type) {
      case Tw.MYT_FARE_PAYMENT_TYPE.DIRECT:
        // 즉시납부 
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
  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - myt-fare.info.history.detail.html 참고
   */
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

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    // 세금계산서 보기 버튼
    this.$templateWrapper.find('.go-bill-tax').on('click',$.proxy(this._moveBillTax,this));
    // 현금영수증 보기 버튼
    this.$templateWrapper.find('.go-bill-cash').on('click',$.proxy(this._moveBillCash,this));
  },

  /**
   * @function
   * @member
   * @desc 세금계산서 보기로 이동
   */
  _moveBillTax: function (){
    this._historyService.goLoad('/myt-fare/info/bill-tax');
  },
  /**
   * @function
   * @member
   * @desc 현금영수증 보기로 이동
   */
  _moveBillCash: function (){
    this._historyService.goLoad('/myt-fare/info/bill-cash');
  }
};
