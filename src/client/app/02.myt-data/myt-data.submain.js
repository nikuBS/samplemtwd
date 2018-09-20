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
  this.immChargeData = {}; // 초기화
  this._rendered();
  this._bindEvent();
  this._initialize();
};

Tw.MyTDataSubMain.prototype = {

  _rendered: function () {
    // 실시간잔여 상세
    this.$remnantBtn = this.$container.find('[data-id=remnant-detail]');
    // 즉시충전버튼
    if ( this.data.immCharge ) {
      this.$immChargeBtn = this.$container.find('[data-id=immCharge]');
    }
    // T끼리 데이터 선물 버튼
    if ( this.data.present ) {
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
    if ( this.data.immCharge ) {
      this.$immChargeBtn.on('click', $.proxy(this._onImmChargeDetail, this));
    }
    if ( this.data.present ) {
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
    if ( this.data.immCharge ) {
      this._immediatelyChargeRequest();
    }
  },

  // api request
  _immediatelyChargeRequest: function () {
    var apiList = [
      { command: Tw.API_CMD.BFF_06_0001, params: {} },
      { command: Tw.API_CMD.BFF_06_0020, params: {} },
      { command: Tw.API_CMD.BFF_06_0028, params: {} },
      { command: Tw.API_CMD.BFF_06_0034, params: {} }
    ];
    this._apiService.requestArray(apiList)
      .done($.proxy(function (refill, ting, etc, limit) {
        if ( refill.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.refill = refill.result;
        }
        else {
          this.immChargeData.refill = null;
        }
        if ( ting.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.ting = ting.result;
        }
        else {
          this.immChargeData.ting = null;
        }
        if ( etc.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.etc = etc.result;
        }
        else {
          this.immChargeData.etc = null;
        }
        if ( limit.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.limit = limit.result;
        }
        else {
          this.immChargeData.limit = null;
        }
      }, this));
  },


  // event callback funtion
  _onRemnantDetail: function () {
    this._historyService.goLoad('/myt/data/usage');
  },

  _onImmChargeDetail: function () {
    var data = [];
    if ( this.immChargeData ) {
      if ( !_.isEmpty(this.immChargeData.refill) ) {
        data.push({
          'type': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.REFILL.TYPE,
          'list': [{
            'option': 'refill',
            'value': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.REFILL.VALUE,
            'text2': this.immChargeData.refill.length + Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.REFILL.UNIT
          }]
        });
      }
      // 선불 쿠폰 TODO: API 완료 후 적용 필요함(TBD)
      data.push(Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.PREPAY);
      var subList = [];
      if ( !_.isEmpty(this.immChargeData.limit) ) {
        subList.push({
          'option': 'limit',
          'value': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.VALUE.LIMIT
        });
      }
      if ( !_.isEmpty(this.immChargeData.etc) ) {
        subList.push({
          'option': 'etc',
          'value': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.VALUE.ETC
        });
      }
      if ( !_.isEmpty(this.immChargeData.ting) ) {
        subList.push({
          'option': 'ting',
          'value': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.VALUE.TING
        });
      }
      data.push({
        'type': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.TYPE,
        'list': subList
      });
    }
    this._popupService.open({
        hbs: 'DC_04',// hbs의 파일명
        layer: true,
        title: Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.TITLE,
        data: data
      }, $.proxy(this._onImmediatelyPopupOpened, this),
      $.proxy(this._onImmediatelyPopupClosed, this), 'DC_04');
  },

  _onTPresentDetail: function () {
    // TODO: 경로 확인 후 업데이트 예정
    this._historyService.goLoad('/myt/data/gift');
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
    // TODO: 경로 확인 후 업데이트 예정
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

  // 다른 회선 더보기
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
  },

  // 팝업내 아이템 선택시 이동
  _onImmDetailLimit: function () {
    this._historyService.goLoad('/myt/data/limit');
  },

  _onImmDetailEtc: function () {
    this._historyService.goLoad('/myt/data/cookiz');
  },

  _onImmDetailTing: function () {
    this._historyService.goLoad('/myt/data/ting');
  },

  _onImmDetailRefill: function () {
    // TODO: 경로 확인 후 업데이트 예정
    this._historyService.goLoad('');
  },

  // DC_O4 팝업 호출 후
  _onImmediatelyPopupOpened: function ($container) {
    var items = $container.find('li');
    for ( var i = 0; i < items.length; i++ ) {
      var item = items.eq(i);
      switch ( item.attr('class') ) {
        case 'limit':
          item.on('click', $.proxy(this._onImmDetailLimit, this));
          break;
        case 'etc':
          item.on('click', $.proxy(this._onImmDetailEtc, this));
          break;
        case 'ting':
          item.on('click', $.proxy(this._onImmDetailTing, this));
          break;
        case 'refill':
          item.on('click', $.proxy(this._onImmDetailRefill, this));
          break;
      }
    }
  },

  _onImmediatelyPopupClosed: function () {

  }
};
