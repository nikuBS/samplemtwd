/**
 * FileName: imm-recharge-layer.component.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.10
 *
 */

Tw.ImmediatelyRechargeLayer = function ($element, options) {
  this.$container = $element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options || {};
  // this._prodId = this._options.prodId;
  this._bpcpService = Tw.Bpcp;
  this._bpcpService.setData(this.$container, '/myt-data/submain');
  this._historyService = new Tw.HistoryService(this.$container);
  this.immChargeData = {}; // 초기화
  this._tidLanding = new Tw.TidLandingComponent();
  this._initialize();
};

Tw.ImmediatelyRechargeLayer.prototype = {

  _initialize: function () {
    this._readOnlyProductIdList = ['NA00000138', 'NA00000719', 'NA00000720', 'NA00001901', 'NA00002244', 'NA00002373',
      'NA00002494', 'NA00002549', 'NA00002572', 'NA00002573', 'NA00002597', 'NA00002604', 'NA00002605', 'NA00002606',
      'NA00002865', 'NA00002867', 'NA00002887', 'NA00002974', 'NA00003018', 'NA00003311', 'NA00003312', 'NA00003314',
      'NA00003315', 'NA00003316', 'NA00003317', 'NA00003318', 'NA00003320', 'NA00003321', 'NA00003322', 'NA00003323',
      'NA00003324', 'NA00003325', 'NA00003326', 'NA00003327', 'NA00003328', 'NA00003329', 'NA00003362', 'NA00003368',
      'NA00003369', 'NA00003370', 'NA00003371', 'NA00003420', 'NA00003427', 'NA00003458', 'NA00003696', 'NA00003856',
      'NA00003857', 'NA00003858', 'NA00003859', 'NA00003860', 'NA00003861', 'NA00003862', 'NA00003863', 'NA00003864',
      'NA00003865', 'NA00003866', 'NA00003867', 'NA00003868', 'NA00003869', 'NA00003870', 'NA00003871', 'NA00003872',
      'NA00003873', 'NA00003874', 'NA00003875', 'NA00003886', 'NA00003887', 'NA00003888', 'NA00003889', 'NA00004142',
      'NA00004143', 'NA00004185', 'NA00004283', 'NA00004284', 'NA00004324', 'NA00004325', 'NA00004341', 'NA00004342',
      'NA00004410', 'NA00004435', 'NA00004655', 'NA00004725', 'NA00004726', 'NA00004778', 'NA00004779', 'NA00004846',
      'NA00004951', 'NA00004968', 'NA00004969', 'NA00005000', 'NA00005032', 'NA00005033', 'NA00005037', 'NA00005061',
      'NA00005062', 'NA00005063', 'NA00005064', 'NA00005065', 'NA00005066', 'NA00005073', 'NA00005084', 'NA00005109',
      'NA00005173', 'NA00005205', 'NA00005246', 'NA00005306', 'NA00005307', 'NA00005326', 'NA00005330', 'NA00005381',
      'NA00005382', 'NA00005509', 'NA00005510', 'NA00005511', 'NA00005723', 'NA00005736', 'NA00005806', 'NA00005848',
      'NA00005849', 'NA00005876', 'NA00005880'];
    this._immediatelyChargeRequest();
  },
  // api request
  _immediatelyChargeRequest: function () {
    var apiList = [
      { command: Tw.API_CMD.BFF_06_0009, params: {} },
      { command: Tw.API_CMD.BFF_06_0001, params: {} },
      { command: Tw.API_CMD.BFF_06_0020, params: {} },
      { command: Tw.API_CMD.BFF_06_0028, params: {} },
      { command: Tw.API_CMD.BFF_06_0034, params: {} },
      { command: Tw.API_CMD.BFF_05_0136, params: {} }
    ];
    this._apiService.requestArray(apiList)
      .done($.proxy(function (available, refill, ting, etc, limit, optSvc) {
        if ( available.code === Tw.API_CODE.CODE_00 ) {
          var availableFunc = available.result.option.reduce(function (memo, item) {
            return (memo + item.dataVoiceClCd);
          }, '');

          if ( availableFunc.indexOf('D') !== -1 && availableFunc.indexOf('V') !== -1 ) {
            this.immChargeData.available = 'ALL';
          }
          if ( availableFunc.indexOf('D') !== -1 ) {
            this.immChargeData.available = 'DATA';
          }
          if ( _.isEmpty(available.result.option) ) {
            this.immChargeData.available = 'NONE';
          }
          else {
            this.immChargeData.available = 'VOICE';
          }
        }
        else {
          this.immChargeData.available = null;
        }
        if ( refill.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.refill = refill.result;
        }
        else {
          this.immChargeData.refill = null;
        }
        if ( ting.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.ting = ting.result;
        }
        else if ( ting.code === Tw.API_CODE.ZPAYE0077 ) {
          // 팅 요금제 선물 차단 상태
          this.immChargeData.ting = null;
        }
        else {
          this.immChargeData.ting = ting;
        }
        if ( etc.code === Tw.API_CODE.CODE_00 ) {
          this.immChargeData.etc = etc.result;
        }
        else {
          //  RCG0062: 팅/쿠키즈/안심음성 요금제 미사용중인 경우
          this.immChargeData.etc = null;
        }
        if ( optSvc.code === Tw.API_CODE.CODE_00 ) {
          // optProdList -> disProdList 합쳐짐 (BE 1/14 기준)
          if ( optSvc.result.disProdList && optSvc.result.disProdList.length > 0 ) {
            _.filter(optSvc.result.disProdList, $.proxy(function (item) {
              // 부가서비스
              if ( !this._isLimited ) {
                this._isLimited = (this._readOnlyProductIdList.indexOf(item.prodId) > -1);
              }
            }, this));
          }
        }
        // 해당요금제에 속해 있는 경우만 노출
        if ( this._isLimited ) {
          // API 정상 리턴시에만 충전방법에 데이터한도요금제 항목 노출 (DV001-4362)
          if ( limit.code === Tw.API_CODE.CODE_00 ) {
            this.immChargeData.limit = limit.result;
          }
          else {
            this.immChargeData.limit = null;
          }
        }
        this._openPopup();
      }, this));
  },

  _openPopup: function () {
    var data = [];
    if ( this.immChargeData ) {
      if ( this.immChargeData.available !== 'NONE' && !_.isEmpty(this.immChargeData.refill) ) {
        data.push({
          title: Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.REFILL.TYPE,
          list: [{
            'option': 'refill',
            'button-attr': 'type="button"',
            'icon': 'ico1',
            'txt': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.REFILL.VALUE,
            'spot': this.immChargeData.refill.length + Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.REFILL.UNIT
          }]
        });
      }
      if (this._options.isPrepayment) {
        // TODO: GrandOpen 때 enable 처리
        data.push(Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.PREPAY);
      }
      var subList = [];
      if ( !_.isEmpty(this.immChargeData.limit) ) {
        var curLimit = parseInt(this.immChargeData.limit.currentTopUpLimit, 10);
        if ( this.immChargeData.limit.blockYn === 'N' || curLimit > 0 ) {
          subList.push({
            'option': 'limit',
            'button-attr': 'type="button"',
            'icon': 'ico4',
            'txt': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.VALUE.LIMIT
          });
        }
      }
      if ( !_.isEmpty(this.immChargeData.etc) ) {
        subList.push({
          'option': 'etc',
          'button-attr': 'type="button"',
          'icon': 'ico5',
          'txt': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.VALUE.ETC
        });
      }
      if ( !_.isEmpty(this.immChargeData.ting) ) {
        subList.push({
          'option': 'ting',
          'button-attr': 'type="button"',
          'icon': 'ico6',
          'txt': Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.VALUE.TING
        });
      }
      if (subList && subList.length > 0) {
        data.push({
          title: Tw.POPUP_TPL.IMMEDIATELY_CHARGE_DATA.CHARGE.TYPE,
          list: subList
        });
      }
    }
    this._popupService.open({
        hbs: 'DC_04',// hbs의 파일명
        layer: true,
        data: data
      }, $.proxy(this._onImmediatelyPopupOpened, this),
      $.proxy(this._onImmediatelyPopupClosed, this), 'DC_04', this.$container.find('[data-id=immCharge] button'));
  },

  // DC_O4 팝업 호출 후
  _onImmediatelyPopupOpened: function ($container) {
    this.$popupContainer = $container;
    var items = $container.find('li');
    for ( var i = 0; i < items.length; i++ ) {
      var item = items.eq(i);
      var classNm = item.attr('class').replace('type1', '').trim();
      switch ( classNm ) {
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
          item.on('click', $.proxy(this._onPrepayCoupon, this, classNm));
          break;
      }
    }
    this.$popupContainer.find('.fe-common-back').on('click', function () {
      window.history.back();
    });
    window.setTimeout($.proxy(function() {
      var $focusTarget = this.$popupContainer.find('.ac-tit:eq(0)');
      if ($focusTarget && $focusTarget.length > 0) {
        $focusTarget.attr('tabindex', -1).focus();
      }
    }, this), 500);
  },

  // DC_04 팝업 close 이후 처리 부분
  _onImmediatelyPopupClosed: function () {
    var $target = this.$popupContainer.find('[data-url]');
    if ( $target.length > 0 ) {
      this._historyService.goLoad($target.attr('data-url'));
    }
    else {
      $target = this.$popupContainer.find('[data-external]');
      if ( $target.length > 0 ) {
        this._bpcpService.open($target.attr('data-external'));
      }
    }
  },

  // DC_04 팝업내 아이템 선택시 이동
  _onImmDetailLimit: function (event) {
    var $target = $(event.target);
    $target.attr('data-url', '/myt-data/recharge/limit');
    this._popupService.close();
  },

  _onImmDetailEtc: function (event) {
    var $target = $(event.target);
    $target.attr('data-url', '/myt-data/recharge/cookiz');
    this._popupService.close();
  },

  _onImmDetailTing: function (event) {
    var $target = $(event.target);
    $target.attr('data-url', '/myt-data/recharge/ting');
    this._popupService.close();
  },

  _onImmDetailRefill: function (event) {
    var $target = $(event.target);
    $target.attr('data-url', '/myt-data/recharge/coupon/use?auto=Y');
    this._popupService.close();
  },

  _onPrepayCoupon: function (classNm, event) {
    var $target = $(event.currentTarget);
    switch ( classNm ) {
      case 'data_coupon':
        $target.attr('data-external', Tw.OUTLINK.DATA_COUPON.T_DATA);
        break;
      case 't_coupon':
        $target.attr('data-external', Tw.OUTLINK.DATA_COUPON.T_COUPON);
        break;
      case 'jeju_coupon':
        $target.attr('data-external', Tw.OUTLINK.DATA_COUPON.JEJU);
        break;
    }
    this._popupService.close();
  },

  _responseFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};