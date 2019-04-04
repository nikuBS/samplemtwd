/**
 * @file main.home.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.06

 */

Tw.TestHome = function (rootEl, smartCard) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeSrevice = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._lineRegisterLayer = new Tw.LineRegisterComponent();

  this._smartCardOrder = JSON.parse(smartCard);

  this.$elBarcode = null;
  this.$elArrSmartCard = [];
  this.loadingStaus = [];

  this._cachedElement();
  this._bindEvent();
  this._openLineResisterPopup();

  // this._initScroll();
  this._getSmartCard(0);
  this._getSmartCard(1);
  this._getSmartCard(2);
  this._getSmartCard(3);
  this._getSmartCard(4);
};

Tw.TestHome.prototype = {
  GIFT_ERROR_CODE: {
    GFT0001: 'GFT0001',   // 제공자 선물하기 불가 상태
    GFT0002: 'GFT0002',   // 제공자 선물하기 불가 요금제
    GFT0003: 'GFT0003',   // 제공자 당월 선물가능 횟수 초과
    GFT0004: 'GFT0004',   // 제공자 당월 선물가능 용량 미달
    GFT0005: 'GFT0005',   // 제공자가 미성년자이면 선물하기 불가
    GFT0013: 'GFT0013'    // 기
  },

  _cachedElement: function () {
    this.$elBarcode = this.$container.find('#fe-membership-barcode');

    this._cachedSmartCard();
    this._cachedSmartCardTemplate();
    // this._makeBarcode();
  },
  _bindEvent: function () {
    this.$elBarcode.on('click', $.proxy(this._onClickBarcode, this));
    this.$container.on('click', '.fe-bt-go-recharge', $.proxy(this._onClickBtRecharge, this));

  },
  _makeBarcode: function () {
    var cardNum = this.$elBarcode.data('cardnum');
    if ( !Tw.FormatHelper.isEmpty(cardNum) ) {
      this.$elBarcode.JsBarcode(cardNum);
    }
  },
  _onClickBarcode: function () {
    var cardNum = this.$elBarcode.data('cardnum');
    var usedAmount = Tw.FormatHelper.addComma(this.$elBarcode.data('usedamount'));
    this._popupService.open({
      hbs: 'TH1_05',
      layer: true,
      data: {
        cardNum: cardNum,
        usedAmount: usedAmount
      }
    });
  },
  _openLineResisterPopup: function () {
    var layerType = this.$container.data('layertype');
    console.log('layerType : ', layerType);
    if ( !Tw.FormatHelper.isEmpty(layerType) ) {
      this._lineRegisterLayer.openRegisterLinePopup(layerType);
    }
  },
  _cachedSmartCard: function () {
    for ( var i = 0; i < 16; i++ ) {
      var $card = this.$container.find('.fe-smart-' + i);
      if ( $card.length > 0 ) {
        this.$elArrSmartCard.push($card);
        this.loadingStaus.push(false);
      }
    }
  },
  _cachedSmartCardTemplate: function () {

  },
  _getBillData: function (element) {
    $.when(
      $.ajax('/mock/home/BFF_05_0036.json'),
      $.ajax('/mock/home/BFF_05_0047.json')
    ).then($.proxy(this._successBillData, this, element));
    // this._apiService.requestArray([
    //   { command: Tw.API_CMD.BFF_05_0036, params: {} },
    //   { command: Tw.API_CMD.BFF_05_0047, params: {} }
    // ]).done($.proxy(this._successBillData, this, element))
    //   .fail($.proxy(this._failBillData, this));
  },
  _successBillData: function (element, charge, used) {
    console.log('successBillData', charge, used);
    charge = charge[0];
    used = used[0];
    var result = {
      showBill: false
    };
    if ( charge.code === Tw.API_CODE.CODE_00 && used.code === Tw.API_CODE.CODE_00 &&
      charge.result.colClCd !== Tw.MYT_FARE_BILL_CO_TYPE.BROADBAND ) {
      result = this._parseBillData({ charge: charge.result, used: used.result });
    }
    var $billTemp = $('#fe-smart-bill');
    var tplBillCard = Handlebars.compile($billTemp.html());
    element.html(tplBillCard(result));
    this._bindBillEvent();
  },
  _failBillData: function () {

  },
  _bindBillEvent: function () {
    this.$container.on('click', '#fe-bt-payment', $.proxy(this._onClickPayment, this));
  },
  _onClickPayment: function () {
    new Tw.MyTFareBill(this.$container);
  },
  _parseBillData: function (billData) {
    var repSvc = billData.charge.repSvcYn === 'Y';
    var totSvc = billData.charge.paidAmtMonthSvcCnt > 1;
    return {
      showBill: true,
      chargeAmtTot: Tw.FormatHelper.addComma(billData.charge.useAmtTot),
      usedAmtTot: Tw.FormatHelper.addComma(billData.used.useAmtTot),
      deduckTot: Tw.FormatHelper.addComma(billData.charge.deduckTotInvAmt),
      invEndDt: Tw.DateHelper.getShortDateNoDot(billData.charge.invDt),
      invStartDt: Tw.DateHelper.getShortFirstDateNoDot(billData.charge.invDt),
      invMonth: Tw.DateHelper.getCurrentMonth(Tw.DateHelper.AddMonth(billData.charge.invDt)),
      type1: totSvc && repSvc,
      type2: !totSvc,
      type3: totSvc && !repSvc

    };
  },
  _getContentData: function (element) {
    // $.ajax('/mock/home/BFF_05_0064.json')
    // this._apiService.request(Tw.API_CMD.BFF_05_0064, {})
      // .done($.proxy(this._successContentData, this, element))
      // .fail($.proxy(this._failContentData, this));
  },
  _successContentData: function (element, resp) {
    console.log('successContentData', resp);
    var result = {
      showContents: false,
      invMonth: Tw.DateHelper.getCurrentMonth()
    };
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      result = this._parseContentsData(resp.result);
    } else {
      // Tw.Error(resp.code, resp.msg).pop();
    }
    var $contentsTemp = $('#fe-smart-contents');
    var tplContentsCard = Handlebars.compile($contentsTemp.html());
    element.html(tplContentsCard(result));
  },
  _failContentData: function () {

  },
  _parseContentsData: function (contents) {
    if ( contents.useConAmtDetailList.length > 0 ) {
      return {
        showContents: true,
        invEndDt: Tw.DateHelper.getShortDateNoDot(contents.toDt),
        invStartDt: Tw.DateHelper.getShortDateNoDot(contents.fromDt),
        invMonth: Tw.DateHelper.getCurrentMonth(contents.fromDt),
        usedAmtTot: Tw.FormatHelper.addComma(contents.invDtTotalAmtCharge),
        detailList: _.map(contents.useConAmtDetailList, $.proxy(function (detail, index) {
          return {
            showDetail: index < 3,
            charge: Tw.FormatHelper.addComma(detail.useCharge),
            name: detail.useServiceNm,
            payTime: Tw.DateHelper.getFullDateAndTime(detail.payTime)
          };
        }, this))
      };
    }
    return {
      showContents: false,
      invMonth: Tw.DateHelper.getCurrentMonth()
    };
  },
  _getMicroPayData: function (element) {
    $.ajax('/mock/home/BFF_05_0079.json')
    // this._apiService.request(Tw.API_CMD.BFF_05_0079, {})
      .done($.proxy(this._successMicroPayData, this, element))
      .fail($.proxy(this._failMicroPayData, this));
  },
  _successMicroPayData: function (element, resp) {
    console.log('successMicroPay', resp);
    var result = {
      showMicro: false,
      invMonth: Tw.DateHelper.getCurrentMonth()
    };
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      result = this._parseMicroData(resp.result);
    } else {
      // Tw.Error(resp.code, resp.msg).pop();
    }
    var $microTemp = $('#fe-smart-micro-pay');
    var tplMicroCard = Handlebars.compile($microTemp.html());
    element.html(tplMicroCard(result));
  },
  _failMicroPayData: function () {

  },
  _parseMicroData: function (microData) {
    if ( microData.payHistoryCnt > 0 ) {
      return {
        showMicro: true,
        invEndDt: Tw.DateHelper.getShortDateNoDot(microData.toDt),
        invStartDt: Tw.DateHelper.getShortDateNoDot(microData.fromDt),
        invMonth: Tw.DateHelper.getCurrentMonth(microData.fromDt),
        usedAmtTot: Tw.FormatHelper.addComma(microData.totalSumPrice),
        detailList: _.map(microData.histories, $.proxy(function (detail, index) {
          return {
            showDetail: index < 3,
            charge: Tw.FormatHelper.addComma(detail.sumPrice),
            name: detail.serviceNm,
            payTime: Tw.DateHelper.getFullDateAndTime(detail.useDt),
            payMethod: Tw.MYT_FARE_HISTORY_MICRO_METHOD[detail.payMethod]
          };
        }, this))
      };
    }
    return {
      showMicro: false,
      invMonth: Tw.DateHelper.getCurrentMonth()
    };
  },
  _getGiftData: function (element, index) {
    // skt_landing.action.loading.on({ ta: '.fe-smart-' + index, co: 'grey', size: true });
    $.when(
      $.ajax('/mock/home/BFF_06_0015.json'),
      $.ajax('/mock/home/BFF_06_0014.json')
    ).then($.proxy(this._successGiftData, this, element));
    // this._apiService.requestArray([
    //   { command: Tw.API_CMD.BFF_06_0015, params: {} },
    //   { command: Tw.API_CMD.BFF_06_0014, params: { reqCnt: Tw.GIFT_REMAIN_RETRY } }
    // ]).done($.proxy(this._successGiftData, this, element))
    //   .fail($.proxy(this._failGiftData, this));
  },
  _successGiftData: function (element, sender, remain) {
    console.log('success gift', sender, remain);
    var $giftTemp = $('#fe-smart-gift');
    var tplGiftCard = Handlebars.compile($giftTemp.html());
    element.html(tplGiftCard(this._parseGiftData(sender[0], remain[0])));

    $('.fe-bt-go-gift').on('click', $.proxy(this._onClickBtGift, this, sender));
  },
  _failGiftData: function () {

  },
  _parseGiftData: function (sender, remain) {
    var result = {
      blockUsage: false,
      blockProduct: false,
      enableGiftBt: true
    };

    if ( new Date().getDate() === Tw.GIFT_BLOCK_USAGE ) {
      result.blockUsage = true;
      return result;
    }
    this._parseSenderData(sender, remain, result);

    return result;
  },

  _parseSenderData: function (sender, remain, result) {
    if ( sender.code === Tw.API_CODE.CODE_00 ) {
      this._parseRemainData(remain, result);
      result.dataGiftCnt = sender.result.dataGiftCnt;
      result.familyDataGiftCnt = sender.result.familyDataGiftCnt;
      result.familyMemberYn = sender.result.familyMemberYn === 'Y';
      result.goodFamilyMemberYn = sender.result.goodFamilyMemberYn === 'Y';
      result.enableGiftBt = !(sender.result.dataGiftCnt === '0' && sender.result.familyDataGiftCnt === '0');
    } else if ( sender.code === this.GIFT_ERROR_CODE.GFT0002 ) {
      result.blockProduct = true;
    } else {
      // Tw.Error(sender.code, sender.msg).pop();
    }
  },
  _parseRemainData: function (remain, result) {
    if ( remain.code === Tw.API_CODE.CODE_00 ) {
      result.dataRemQty = remain.result.dataRemQty;
    } else {
      result.dataRemQty = '32.2';
      // Tw.Error(remain.code, remain.msg).pop();
    }
  },
  _onClickBtGift: function (sender) {
    if ( sender.code === Tw.API_CODE.CODE_00 ) {
      if ( sender.result.dataGiftCnt > 0 ) {
        this._historyService.goLoad('/myt-data/giftdata');
      } else if ( sender.result.familyDataGiftCnt > 0 ) {
        this._historyService.goLoad('/myt-data/giftdata#auto');
      }
    }

  },
  _getRechargeData: function (element) {
    $.ajax('/mock/home/BFF_06_0001.json')
    // this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._successRechargeData, this, element))
      .fail($.proxy(this._failRechargeData, this));

  },
  _successRechargeData: function (element, resp) {
    console.log('successRechargeData', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var refillCoupons = resp.result.length;
      var $rechargeTemp = $('#fe-smart-recharge');
      var tplRechargeCard = Handlebars.compile($rechargeTemp.html());
      element.html(tplRechargeCard({ refillCoupons: refillCoupons }));
      $('.fe-bt-go-recharge').on('click', $.proxy(this._onClickBtRecharge, this));
    } else {
      // Tw.Error(resp.code, resp.msg).pop();
    }

  },
  _failRechargeData: function () {

  },
  _onClickBtRecharge: function ($event) {
    $event.stopPropagation();
    new Tw.ImmediatelyRechargeLayer(this.$container);
  },

  _elementScrolled: function (element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = element.offset().top;
    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
  },
  _initScroll: function () {
    this._checkScroll();
    $(window).scroll($.proxy(function () {
      this._checkScroll();
    }, this));
  },
  _checkScroll: function () {
    _.map(this.$elArrSmartCard, $.proxy(function (card, index) {
      if ( this._elementScrolled(card) ) {
        this._initSmartCard(index);
      }
    }, this));
  },
  _initSmartCard: function (index) {
    this._getSmartCard(index);
    this._getSmartCard(index + 1);
    this._getSmartCard(index + 2);
  },
  _getSmartCard: function (index) {
    if ( index < this.loadingStaus.length && !this.loadingStaus[index] ) {
      var cardNo = this.$elArrSmartCard[index].data('smartcard');
      this._drawSmartCard(cardNo, index);
      this.loadingStaus[index] = true;
    }
  },
  _drawSmartCard: function (cardNo, index) {
    switch ( cardNo ) {
      case Tw.HOME_SMART_CARD_E.BILL:
        this._getBillData(this.$elArrSmartCard[index]);
        break;
      case Tw.HOME_SMART_CARD_E.CONTENT:
        this._getContentData(this.$elArrSmartCard[index]);
        break;
      case Tw.HOME_SMART_CARD_E.MICRO_PAY:
        this._getMicroPayData(this.$elArrSmartCard[index]);
        break;
      case Tw.HOME_SMART_CARD_E.GIFT:
        this._getGiftData(this.$elArrSmartCard[index], index);
        break;
      case Tw.HOME_SMART_CARD_E.RECHARGE:
        this._getRechargeData(this.$elArrSmartCard[index]);
        break;
      default:
        Tw.Logger.warn('Not Support');
    }
  }

};