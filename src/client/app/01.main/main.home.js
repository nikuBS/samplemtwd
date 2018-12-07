/**
 * FileName: main.home.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.06

 */

Tw.MainHome = function (rootEl, smartCard) {
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

  this._lineComponent = new Tw.LineComponent();
  this._cachedElement();
  this._bindEvent();
  this._openLineResisterPopup();

  this._initScroll();
};

Tw.MainHome.prototype = {
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
    this.$barcodeGr = this.$container.find('#fe-membership-gr');

    this._cachedSmartCard();
    this._cachedSmartCardTemplate();
    this._makeBarcode();
  },
  _bindEvent: function () {
    this.$elBarcode.on('click', $.proxy(this._onClickBarcode, this));
    this.$container.on('click', '.fe-bt-go-recharge', $.proxy(this._onClickBtRecharge, this));
    this.$container.on('click', '#fe-bt-quick-edit', $.proxy(this._onClickQuickEdit, this));
    this.$container.on('click', '.fe-bt-line', $.proxy(this._onClickLine, this));
  },
  _onClickLine: function ($event) {
    var svcMgmtNum = $($event.currentTarget).data('svcmgmtnum');
    this._lineComponent.onClickLine(svcMgmtNum);
  },
  _makeBarcode: function () {
    var cardNum = this.$elBarcode.data('cardnum');
    if ( !Tw.FormatHelper.isEmpty(cardNum) ) {
      this.$elBarcode.JsBarcode(cardNum);
    }
  },
  _onClickBarcode: function () {
    var cardNum = this.$elBarcode.data('cardnum');
    var mbrGr = this.$barcodeGr.data('mbrgr');
    var usedAmount = Tw.FormatHelper.addComma(this.$elBarcode.data('usedamount'));
    this._popupService.open({
      hbs: 'HO_01_01_02',
      layer: true,
      data: {
        mbrGr: mbrGr,
        mbrGrStr: mbrGr.toUpperCase(),
        cardNum: cardNum,
        usedAmount: usedAmount
      }
    }, $.proxy(this._onOpenBarcode, this, cardNum));
  },
  _onOpenBarcode: function (cardNum, $popupContainer) {
    var extendBarcode = $popupContainer.find('#fe-membership-barcode-extend');
    if ( !Tw.FormatHelper.isEmpty(cardNum) ) {
      extendBarcode.JsBarcode(cardNum);
    }
  },
  _onClickQuickEdit: function () {
    this._popupService.open({
      hbs: 'HO_01_01_01',
      layer: true
    }, $.proxy(this._onOpenQuickEdit, this), $.proxy(this._onCloseQuickEdit, this));
  },
  _onOpenQuickEdit: function ($popupContainer) {

  },
  _onCloseQuickEdit: function () {

  },
  _openLineResisterPopup: function () {
    $(window).on('env', $.proxy(function () {
      var layerType = this.$container.data('layertype');
      // layerType = Tw.LOGIN_NOTICE_TYPE.CUSTOMER_PASSWORD;
      Tw.Logger.info('[Home] layerType', layerType);
      if ( !Tw.FormatHelper.isEmpty(layerType) ) {
        if ( layerType === Tw.LOGIN_NOTICE_TYPE.NEW_CUSTOMER || layerType === Tw.LOGIN_NOTICE_TYPE.EXIST_CUSTOMER ) {
          this._lineRegisterLayer.openRegisterLinePopup(layerType);
        } else if ( layerType === Tw.LOGIN_NOTICE_TYPE.CUSTOMER_PASSWORD ) {
          this._openCustomerPasswordGuide();
        }
      }
    }, this));
  },
  _openCustomerPasswordGuide: function () {
    this._popupService.openTypeD(Tw.LOGIN_CUS_PW_GUIDE.TITLE, Tw.LOGIN_CUS_PW_GUIDE.CONTENTS, Tw.LOGIN_CUS_PW_GUIDE.BUTTON, '',
      null, $.proxy(this._confirmCustPwGuide, this), $.proxy(this._closeCustPwGuide, this));
  },
  _confirmCustPwGuide: function () {
    this._popupService.close();
  },
  _closeCustPwGuide: function () {
    this._historyService.goLoad('/myt-join/custpassword');
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
    this._apiService.requestArray([
      { command: Tw.API_CMD.BFF_05_0036, params: {} },
      { command: Tw.API_CMD.BFF_05_0047, params: {} }
    ]).done($.proxy(this._successBillData, this, element))
      .fail($.proxy(this._failBillData, this));
  },
  _successBillData: function (element, charge, used) {
    var result = null;
    if ( charge.code === Tw.API_CODE.CODE_00 && used.code === Tw.API_CODE.CODE_00 &&
      charge.result.colClCd !== Tw.MYT_FARE_BILL_CO_TYPE.BROADBAND ) {
      result = this._parseBillData({ charge: charge.result, used: used.result });
    }
    if ( !Tw.FormatHelper.isEmpty(result) ) {
      var $billTemp = $('#fe-smart-bill');
      var tplBillCard = Handlebars.compile($billTemp.html());
      element.html(tplBillCard(result));
    } else {
      element.hide();
    }

    this._resetHeight();
  },
  _failBillData: function () {

  },
  _onClickPayment: function () {
    new Tw.MyTFareBill(this.$container);
  },
  _parseBillData: function (billData) {
    var repSvc = billData.charge.repSvcYn === 'Y';
    var totSvc = billData.charge.paidAmtMonthSvcCnt > 1;
    return {
      chargeAmtTot: Tw.FormatHelper.addComma(billData.charge.useAmtTot),
      usedAmtTot: Tw.FormatHelper.addComma(billData.used.useAmtTot),
      deduckTot: Tw.FormatHelper.addComma(billData.charge.deduckTotInvAmt),
      invEndDt: Tw.DateHelper.getShortDate(billData.charge.invDt),
      invStartDt: Tw.DateHelper.getShortFirstDate(billData.charge.invDt),
      invMonth: Tw.DateHelper.getCurrentMonth(Tw.DateHelper.AddMonth(billData.charge.invDt)),
      type1: totSvc && repSvc,
      type2: !totSvc,
      type3: totSvc && !repSvc

    };
  },
  _getContentData: function (element) {
    this._apiService.request(Tw.API_CMD.BFF_05_0064, {})
      .done($.proxy(this._successContentData, this, element))
      .fail($.proxy(this._failContentData, this));
  },
  _successContentData: function (element, resp) {
    var result = null;
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      result = this._parseContentsData(resp.result);
    }
    if ( !Tw.FormatHelper.isEmpty(result) ) {
      var $contentsTemp = $('#fe-smart-contents');
      var tplContentsCard = Handlebars.compile($contentsTemp.html());
      element.html(tplContentsCard(result));
    } else {
      element.hide();
    }
    this._resetHeight();

  },
  _failContentData: function () {

  },
  _parseContentsData: function (contents) {
    if ( contents.useConAmtDetailList.length > 0 ) {
      return {
        showContents: true,
        invEndDt: Tw.DateHelper.getShortDate(contents.toDt),
        invStartDt: Tw.DateHelper.getShortDate(contents.fromDt),
        invMonth: Tw.DateHelper.getCurrentMonth(contents.fromDt),
        usedAmtTot: Tw.FormatHelper.addComma(contents.invDtTotalAmtCharge),
        listLength: contents.useConAmtDetailList
      };
    }
  },
  _getMicroPayData: function (element) {
    // $.ajax('/mock/home.micro-pay.json')
    this._apiService.request(Tw.API_CMD.BFF_05_0079, {})
      .done($.proxy(this._successMicroPayData, this, element))
      .fail($.proxy(this._failMicroPayData, this));
  },
  _successMicroPayData: function (element, resp) {
    var result = null;
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      result = this._parseMicroData(resp.result);
    }
    if ( !Tw.FormatHelper.isEmpty(result) ) {
      var $microTemp = $('#fe-smart-micro-pay');
      var tplMicroCard = Handlebars.compile($microTemp.html());
      element.html(tplMicroCard(result));
    } else {
      element.hide();
    }
    this._resetHeight();
  },
  _failMicroPayData: function () {

  },
  _parseMicroData: function (microData) {
    if ( microData.payHistoryCnt > 0 ) {
      return {
        invEndDt: Tw.DateHelper.getShortDate(microData.toDt),
        invStartDt: Tw.DateHelper.getShortDate(microData.fromDt),
        invMonth: Tw.DateHelper.getCurrentMonth(microData.fromDt),
        usedAmtTot: Tw.FormatHelper.addComma(microData.totalSumPrice),
        listLength: microData.payHistoryCnt
      };
    }
  },
  _getGiftData: function (element, index) {
    // skt_landing.action.loading.on({ ta: '.fe-smart-' + index, co: 'grey', size: true });
    if ( new Date().getDate() === Tw.GIFT_BLOCK_USAGE ) {
      this._drawGiftData(element, {
        blockUsage: true
      });
    } else {
      this._apiService.requestArray([
        { command: Tw.API_CMD.BFF_06_0015, params: {} },
        { command: Tw.API_CMD.BFF_06_0014, params: { reqCnt: Tw.GIFT_REMAIN_RETRY } }
      ]).done($.proxy(this._successGiftData, this, element))
        .fail($.proxy(this._failGiftData, this));
    }
  },
  _successGiftData: function (element, sender, remain) {
    var result = null;

    if ( sender.code === Tw.API_CODE.CODE_00 ) {
      result = this._parseGiftData(sender, remain);
    }
    this._drawGiftData(element, result, sender);
    this._resetHeight();
  },
  _failGiftData: function () {

  },
  _drawGiftData: function (element, result, sender) {
    if ( !Tw.FormatHelper.isEmpty(result) ) {
      var $giftTemp = $('#fe-smart-gift');
      var tplGiftCard = Handlebars.compile($giftTemp.html());
      element.html(tplGiftCard(result));
      $('#fe-bt-go-gift').on('click', $.proxy(this._onClickBtGift, this, sender));
    } else {
      element.hide();
    }
  },
  _parseGiftData: function (sender, remain) {
    return {
      dataRemQty: this._parseRemainData(remain),
      dataGiftCnt: sender.result.dataGiftCnt,
      familyDataGiftCnt: sender.result.familyDataGiftCnt,
      familyMemberYn: sender.result.familyMemberYn === 'Y',
      goodFamilyMemberYn: sender.result.goodFamilyMemberYn === 'Y'
    };
  },
  _parseRemainData: function (remain) {
    if ( remain.code === Tw.API_CODE.CODE_00 ) {
      return remain.result.dataRemQty;
    } else {
      return '32.2';
      // Tw.Error(remain.code, remain.msg).pop();
    }
  },
  _onClickBtGift: function (sender) {
    if ( sender.code === Tw.API_CODE.CODE_00 ) {
      if ( sender.result.dataGiftCnt > 0 ) {
        this._historyService.goLoad('/myt-data/giftdata');
      } else {
        this._historyService.goLoad('/myt-data/giftdata#auto');
      }
    } else if ( sender.code === this.GIFT_ERROR_CODE.GFT0002 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_HOME.A05);
    } else {
      this._popupService.openAlert(Tw.ALERT_MSG_HOME.A06);
    }

  },
  _getRechargeData: function (element) {
    this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
      .done($.proxy(this._successRechargeData, this, element))
      .fail($.proxy(this._failRechargeData, this));

  },
  _successRechargeData: function (element, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var refillCoupons = resp.result.length;
      var $rechargeTemp = $('#fe-smart-recharge');
      var tplRechargeCard = Handlebars.compile($rechargeTemp.html());
      element.html(tplRechargeCard({ refillCoupons: refillCoupons }));
      $('#fe-bt-go-recharge').on('click', $.proxy(this._onClickBtRecharge, this));
    } else {
      element.hide();
    }
    this._resetHeight();
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
  },
  _resetHeight: function () {
    Tw.CommonHelper.resetHeight($('.home-slider .home-slider-belt')[0]);
  }

};