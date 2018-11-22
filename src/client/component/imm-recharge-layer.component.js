/**
 * FileName: imm-recharge-layer.component.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.10
 *
 */

Tw.ImmediatelyRechargeLayer = function ($element) {
  this.$container = $element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this.immChargeData = {}; // 초기화
  this._initialize();
};

Tw.ImmediatelyRechargeLayer.prototype = {

  _initialize: function () {
    this._immediatelyChargeRequest();
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
        // API 정상 리턴시에만 충전방법에 데이터한도요금제 항목 노출 (DV001-4362)
        if ( limit.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.limit = limit.result;
        }
        else {
          this.immChargeData.limit = null;
        }
        this._openPopup();
      }, this));
  },

  _openPopup: function () {
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

  // DC_O4 팝업 호출 후
  _onImmediatelyPopupOpened: function ($container) {
    this.$popupContainer = $container;
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
        case 'data_coupon':
        case 't_coupon':
        case 'jeju_coupon':
          item.on('click', $.proxy(this._onPrepayCoupon, this));
          break;
      }
    }
  },

  // DC_04 팝업 close 이후 처리 부분
  _onImmediatelyPopupClosed: function () {
    var $target = this.$popupContainer.find('[data-url]');
    if ( $target.length > 0 ) {
      this._historyService.goLoad($target.attr('data-url'));
    }
  },

  // DC_04 팝업내 아이템 선택시 이동
  _onImmDetailLimit: function (event) {
    var $target = $(event.target);
    $target.attr('data-url', '/myt/data/limit');
    this._popupService.close();
  },

  _onImmDetailEtc: function (event) {
    var $target = $(event.target);
    $target.attr('data-url', '/myt/data/cookiz');
    this._popupService.close();
  },

  _onImmDetailTing: function (event) {
    var $target = $(event.target);
    $target.attr('data-url', '/myt/data/ting');
    this._popupService.close();
  },

  _onImmDetailRefill: function (event) {
    var $target = $(event.target);
    $target.attr('data-url', '/myt-data/recharge/coupon');
    this._popupService.close();
  },

  _onPrepayCoupon: function () {
    this._popupService.openAlert('TBD');
  }
};