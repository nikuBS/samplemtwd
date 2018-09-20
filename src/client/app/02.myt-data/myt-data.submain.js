/**
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.17
 *
 */

Tw.MyTDataSubMain = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this.data = params.data;
  this._rendered();
  this._bindEvent();
  this._initialize();
};

Tw.MyTDataSubMain.prototype = {

  _rendered: function () {
    // 실시간잔여 상세
    this.$remnantBtn = this.$container.find('[data-id=remnant-detail]');
    // 즉시충전버튼
    if (this.data.immCharge) {
      this.$immChargeBtn = this.$container.find('[data-id=immCharge]');
    }
    // T끼리 데이터 선물 버튼
    if (this.data.present) {
      this.$presentBtn = this.$container.find('[data-id=present]');
    }
    // TODO: 선불쿠폰 API 기능 완료 후 작업(TBD)
    // this.$prepayContainer = this.$container.find('[data-id=prepay-container]');
    if ( this.data.refill ) {
      this.$refillBtn = this.$container.find('[data-id=refill]');
    }
    if ( this.data.isBenefit ) {
      this.$dataBenefitBtn = this.$container.find('[data-id=benefit]');
      this.$dataUsefulBtn = this.$container.find('[data-id=useful]');
    }

    if ( this.data.breakdownList ) {
      this.$breakdownDetail = this.$container.find('[data-id=bd-container] .bt');
    }
    if ( this.data.otherLines.length > 0 ) {
      this.$otherLines = this.$container.find('[data-id=other-lines] li');
      if ( this.data.otherLines.length > 20 ) {
        this.$otherLinesMoreBtn = this.$otherLines.find('.bt-more button');
        this.$moreTempleate = Handlebars.compile(Tw.MYT_DATA.SUBMAIN.MORE_LINE_TEMP);
      }
    }
  },

  _bindEvent: function () {
    this.$remnantBtn.on('click', $.proxy(this._onRemnantDetail, this));
    if (this.data.immCharge) {
      this.$immChargeBtn.on('click', $.proxy(this._onImmChargeDetail, this));
    }
    if (this.data.present) {
      this.$presentBtn.on('click', $.proxy(this._onTPresentDetail, this));
    }
    if ( this.data.refill ) {
      this.$refillBtn.on('click', $.proxy(this._onRefillDetail, this));
    }
    if ( this.data.isBenefit ) {
      this.$dataBenefitBtn.on('click', $.proxy(this._onDataBenefitDetail, this));
      this.$dataUsefulBtn.on('click', $.proxy(this._onDataUsefulDetail, this));
    }

    if ( this.data.breakdownList ) {
      this.$breakdownDetail.on('click', $.proxy(this._onBreakdownListDetail, this));
    }
    if ( this.data.otherLines.length > 0 ) {
      this.$otherLines.on('click', $.proxy(this._onOtherLinesItemDetail, this));
      if ( this.data.otherLines.length > 20 ) {
        this.$otherLinesMoreBtn.on('click', $.proxy(this._onOtherLinesMore, this));
      }
    }
  },

  _initialize: function () {

  },

  // event callback funtion
  _onRemnantDetail: function () {
    this._historyService.goLoad('/myt/data/usage');
  },

  _onImmChargeDetail: function () {

  },

  _onTPresentDetail: function () {

  },

  // 데이터 혜텍
  _onDataBenefitDetail: function () {
    this._popupService.openAlert('TBD');
    //this._historyService.goLoad('/myt/data/refill/coupon'); (TBD)
  },

  // 데이터활용하기
  _onDataUsefulDetail: function () {
    this._popupService.openAlert('TBD');
    //this._historyService.goLoad('/myt/data/refill/coupon'); (TBD)
  },

  // 리필쿠폰
  _onRefillDetail: function () {
    this._historyService.goLoad('/myt/data/refill/coupon');
  },

  // 충전/선물내역 상세
  _onBreakdownListDetail: function () {
    this._historyService.goLoad('');
  },

  // 다른 회선 잔여량 상세
  _onOtherLinesItemDetail: function (event) {
    var $target = $(event.target),
        mgmtNum = $target.attr('data-svc-mgmt-num'),
        url     = '/myt/data/ddddd',
        isChild = $target.is('.badge');
    if ( isChild ) {
      // 자녀회선
      url = '/myt/data/childddddddd';
    }
    this._historyService.goLoad(url + mgmtNum);
  },

  _onOtherLinesMore: function () {
    var totalCount = this.data.otherLines.length - this.$otherLines.length;
    if ( totalCount > 0 ) {
      this.data.otherLines.splice(0, totalCount);
      var length = this.data.otherLines.length > 20 ? 20 : this.data.otherLines.length;
      for ( var i = 0; i < length; i++ ) {
        var result = this.$moreTempleate(this.data.otherLines[i]);
        this.$otherLines.parents('ul.list-comp-lineinfo').append(result);
      }
    }
  }
};
