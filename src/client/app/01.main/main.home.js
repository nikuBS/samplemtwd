/**
 * FileName: main.home.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.06

 */

Tw.MainHome = function (rootEl, smartCard, emrNotice, menuId, isLogin) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeSrevice = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._lineRegisterLayer = new Tw.LineRegisterComponent();
  this._tidLanding = new Tw.TidLandingComponent();

  this._smartCardOrder = JSON.parse(smartCard);

  this.$elBarcode = null;
  this.$tabStore = null;
  this.$elArrSmartCard = [];
  this.loadingStaus = [];
  this._emrNotice = null;
  this._targetDataLink = '';

  this._lineComponent = new Tw.LineComponent();

  this._openEmrNotice(emrNotice);
  this._setBanner(menuId);
  this._cachedDefaultElement();
  this._bindEventStore();
  this._bindEventLogin();
  this._getQuickMenu(isLogin === 'true');

  if ( isLogin === 'true' ) {
    this._cachedElement();
    this._getWelcomeMsg();
    this._bindEvent();
    this._initScroll();
  } else {
    setTimeout($.proxy(function () {
      this.$tabStore.trigger('click');
    }, this), 0);
  }
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
  DATA_LINK: {
    RECHARGE: 'recharge',
    GIFT: 'gift',
    FAMILY: 'family'
  },
  _cachedDefaultElement: function () {
    this.$tabStore = this.$container.find('.icon-home-tab-store');
  },
  _cachedElement: function () {
    this.$elBarcode = this.$container.find('#fe-membership-barcode');
    this.$barcodeGr = this.$container.find('#fe-membership-gr');

    this._cachedSmartCard();
    this._cachedSmartCardTemplate();
    this._makeBarcode();
  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-membership-extend', $.proxy(this._onClickBarcode, this));
    this.$container.on('click', '#fe-membership-go', $.proxy(this._onClickBarcodeGo, this));
    this.$container.on('click', '.fe-bt-go-recharge', $.proxy(this._onClickBtRecharge, this));
    this.$container.on('click', '.fe-bt-line', $.proxy(this._onClickLine, this));
    this.$container.on('click', '#fe-bt-data-link', $.proxy(this._openDataLink, this));
    this.$container.on('click', '#fe-bt-link-broadband', $.proxy(this._onClickGoBroadband, this));
    this.$container.on('click', '#fe-bt-link-billguide', $.proxy(this._onClickGoBillGuide, this));
  },
  _bindEventStore: function () {
    this.$container.on('click', '#fe-bt-direct-support', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.DIRECT_SUPPORT));
    this.$container.on('click', '#fe-bt-direct-home', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.DIRECT_HOME));
    this.$container.on('click', '.fe-bt-direct-home', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.DIRECT_HOME));
    this.$container.on('click', '#fe-bt-direct-accessory', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.DIRECT_ACCESSORY));
    this.$container.on('click', '#fe-bt-direct-phone', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.DIRECT_PHONE));
    this.$container.on('click', '#fe-bt-direct-tablet', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.DIRECT_TABLET));
    this.$container.on('click', '#fe-bt-direct-nugu', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.DIRECT_NUGU));
    this.$container.on('click', '.fe-bt-direct-nugu', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.DIRECT_NUGU));
    this.$container.on('click', '#fe-bt-iphone-xs', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.IPHONE_XS));
    this.$container.on('click', '#fe-bt-iphone-xr', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.IPHONE_XR));
    this.$container.on('click', '#fe-bt-galaxy-s9', $.proxy(this._onClickExternalLink, this, Tw.OUTLINK.GALAXY_S9));
  },
  _bindEventLogin: function () {
    this.$container.on('click', '.fe-bt-home-login', $.proxy(this._onClickLogin, this));
    this.$container.on('click', '.fe-bt-home-slogin', $.proxy(this._onClickSLogin, this));
    this.$container.on('click', '.fe-bt-signup', $.proxy(this._onClickSignup, this));
  },
  _onClickLogin: function () {
    this._tidLanding.goLogin();
  },
  _onClickSLogin: function () {
    this._tidLanding.goSLogin();
  },
  _onClickSignup: function () {
    this._tidLanding.goSignup();
  },
  _onClickExternalLink: function (url) {
    Tw.CommonHelper.openUrlExternal(url);
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
    this._apiService.request(Tw.API_CMD.BFF_11_0001, {})
      .done($.proxy(this._successMembership, this, mbrGr, cardNum));
  },
  _onClickBarcodeGo: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      if ( Tw.BrowserHelper.isAndroid() ) {
        Tw.CommonHelper.openUrlExternal('http://www.sktmembership.co.kr:90/mobile/tm.jsp?m1=00&targetUrl=/recommend/recommendMain.do?bannerpoc=2018_155');
      } else {
        Tw.CommonHelper.openUrlExternal('http://www.sktmembership.co.kr:90/mobile/tm.jsp?m1=00&targetUrl=/recommend/recommendMain.do?bannerpoc=2018_156');
      }
    }
  },
  _successMembership: function (mbrGr, cardNum, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var usedAmt = resp.result.mbrUsedAmt;
      this._openBarcodePopup(mbrGr, cardNum, Tw.FormatHelper.addComma((+usedAmt).toString()));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _openBarcodePopup: function (mbrGr, cardNum, usedAmount) {
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
      extendBarcode.JsBarcode(cardNum, { height: 75, margin: 0 });
    }
  },
  _onClickGoBroadband: function () {
    Tw.CommonHelper.openUrlExternal(Tw.OUTLINK.BROADBAND);
  },
  _onClickGoBillGuide: function () {
    this._historyService.goLoad('/myt-fare/billguide/guide')
  },
  _openDataLink: function () {
    this._popupService.open({
      hbs: 'actionsheet03',
      layer: true,
      data: Tw.HOME_DATA_LINK
    }, $.proxy(this._onOpenDataLink, this), $.proxy(this._onCloseDataLink, this));
  },
  _onOpenDataLink: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-recharge-link', $.proxy(this._onClickRechargeLink, this));
    $popupContainer.on('click', '#fe-bt-gift-link', $.proxy(this._onClickGiftLink, this));
    $popupContainer.on('click', '#fe-bt-family-link', $.proxy(this._onClickFamilyLink, this));
  },
  _onCloseDataLink: function () {
    switch ( this._targetDataLink ) {
      case this.DATA_LINK.RECHARGE:
        new Tw.ImmediatelyRechargeLayer(this.$container);
        break;
      case this.DATA_LINK.GIFT:
        this._historyService.goLoad('/myt-data/giftdata');
        break;
      case this.DATA_LINK.FAMILY:
        this._historyService.goLoad('/myt-data/familydata');
        break;
      default:
        break;
    }
    this._targetDataLink = '';

  },
  _onClickRechargeLink: function () {
    this._targetDataLink = this.DATA_LINK.RECHARGE;
    this._popupService.close();
  },
  _onClickGiftLink: function () {
    this._targetDataLink = this.DATA_LINK.GIFT;
    this._popupService.close();
  },
  _onClickFamilyLink: function () {
    this._targetDataLink = this.DATA_LINK.FAMILY;
    this._popupService.close();
  },
  _openEmrNotice: function (notice) {
    if ( notice === 'true' ) {
      this._getHomeNotice();
    } else {
      this._openLineResisterPopup();
    }
  },
  _getHomeNotice: function () {
    this._apiService.request(Tw.NODE_CMD.GET_HOME_NOTICE, {})
      .done($.proxy(this._successHomeNotice, this));
  },
  _successHomeNotice: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openNoticePopup(resp.result.emrNotice);
    }
  },
  _openNoticePopup: function (notice) {
    var startTime = Tw.DateHelper.convDateFormat(notice.bltnStaDtm).getTime();
    var endTime = Tw.DateHelper.convDateFormat(notice.bltnEndDtm).getTime();
    var today = new Date().getTime();
    this._emrNotice = notice;
    if ( today > startTime && today < endTime && this._checkShowEmrNotice(notice, today) ) {
      this._popupService.open({
        'pop_name': 'type_tx_scroll',
        'title': notice.ntcTitNm,
        'title_type': 'sub',
        'cont_align': 'tl',
        'contents': notice.ntcCtt,
        'bt_b': this._makeBtnList(notice)
      }, $.proxy(this._onOpenNotice, this), $.proxy(this._onCloseNotice, this));
    } else {
      this._openLineResisterPopup();
    }
  },
  _checkShowEmrNotice: function (notice, today) {
    var stored = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.HOME_EMR_NOTICE));
    if ( !Tw.FormatHelper.isEmpty(stored) && stored.id === notice.ntcId ) {
      if ( stored.time === '' ) {
        return false;
      }
      return stored.time < today;
    }
    return true;
  },
  _makeBtnList: function (notice) {
    var NOTI_POPUP_STYLE = {
      '0': 'tw-popup-closeBtn',
      '7': 'fe-bt-oneday',
      '10': 'fe-bt-week',
      '100': 'fe-bt-never'
    };
    return [{
      style_class: 'tw-popup-closeBtn bt-gray1 pos-left',
      txt: Tw.BUTTON_LABEL.CLOSE
    }, {
      style_class: 'bt-red1 pos-right ' + (NOTI_POPUP_STYLE[notice.ntcReqRsnCtt] || 'tw-popup-closeBtn'),
      txt: Tw.NOTI_POPUP_BTN[notice.ntcReqRsnCtt] || Tw.BUTTON_LABEL.CONFIRM
    }];
  },
  _onOpenNotice: function ($popupContainer) {
    $popupContainer.on('click', '.fe-bt-oneday', $.proxy(this._confirmNoticeOneday, this));
    $popupContainer.on('click', '.fe-bt-week', $.proxy(this._confirmNoticeWeek));
    $popupContainer.on('click', '.fe-bt-never', $.proxy(this._confirmNoticeNever));
  },
  _onCloseNotice: function () {
    this._openLineResisterPopup();
  },
  _confirmNoticeOneday: function () {
    var today = new Date();
    this._setEmrNotice(today.setDate(today.getDate() + 1));
    this._popupService.close();
  },
  _confirmNoticeWeek: function () {
    var today = new Date();
    this._setEmrNotice(today.setDate(today.getDate() + 7));
    this._popupService.close();
  },
  _confirmNoticeNever: function () {
    this._setEmrNotice();
    this._popupService.close();
  },
  _setEmrNotice: function (time) {
    var store = {
      id: this._emrNotice.ntcId,
      time: time || ''
    };
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_EMR_NOTICE, JSON.stringify(store));
  },
  _openLineResisterPopup: function () {
    var layerType = this.$container.data('layertype');
    // var layerType = Tw.LOGIN_NOTICE_TYPE.NEW_CUSTOMER;
    Tw.Logger.info('[Home] layerType', layerType);
    if ( !Tw.FormatHelper.isEmpty(layerType) ) {
      if ( layerType === Tw.LOGIN_NOTICE_TYPE.NEW_CUSTOMER || layerType === Tw.LOGIN_NOTICE_TYPE.EXIST_CUSTOMER ) {
        setTimeout($.proxy(function () {
          this._lineRegisterLayer.openRegisterLinePopup(layerType);
        }, this), 100);
      } else if ( layerType === Tw.LOGIN_NOTICE_TYPE.CUSTOMER_PASSWORD ) {
        this._openCustomerPasswordGuide();
      } else if ( layerType === Tw.LOGIN_NOTICE_TYPE.NEW_LINE ) {
        setTimeout($.proxy(function () {
          this._popupService.openAlert(Tw.ALERT_MSG_HOME.NEW_LINE, null, null, $.proxy(this._closeNewLine, this));
        }, this), 100);
      }
    }
  },
  _closeNewLine: function () {
    this._historyService.goLoad('/common/member/line');
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
        listLength: contents.useConAmtDetailList.length
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

    this._getSmartCard(index - 1);
    this._getSmartCard(index);
    this._getSmartCard(index + 1);
  },
  _getSmartCard: function (index) {
    if ( index >= 0 && index < this.loadingStaus.length && !this.loadingStaus[index] ) {
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
  },
  _getWelcomeMsg: function () {
    this._apiService.request(Tw.NODE_CMD.GET_HOME_WELCOME, {})
      .done($.proxy(this._successWelcomeMsg, this));
  },
  _successWelcomeMsg: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( Tw.BrowserHelper.isApp() ) {
        this._nativeSrevice.send(Tw.NTV_CMD.LOAD, {
          key: Tw.NTV_STORAGE.HOME_WELCOME
        }, $.proxy(this._onHomeWelcomeForDraw, this, resp.result.welcomeMsgList));
      } else {
        var nonShow = Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.HOME_WELCOME) || '';
        this._handleDrawNoti(resp.result.welcomeMsgList, nonShow);
      }
    }
  },
  _onHomeWelcomeForDraw: function (list, resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._handleDrawNoti(list, resp.params.value);
    } else {
      this._handleDrawNoti(list, '');
    }
  },
  _handleDrawNoti: function (list, nonShow) {
    this._welcomeList = this._filterShowMsg(list, nonShow);
    this._drawWelcomeMsg(this._welcomeList, nonShow);
  },
  _filterShowMsg: function (list, nonShow) {
    return _.filter(list, $.proxy(function (msg) {
      var startTime = Tw.DateHelper.convDateFormat(msg.expsStaDtm).getTime();
      var endTime = Tw.DateHelper.convDateFormat(msg.expsEndDtm).getTime();
      var today = new Date().getTime();
      return (nonShow.indexOf(msg.wmsgId) === -1 && startTime < today && endTime > today);
      // return nonShow.indexOf(msg.wmsgId) === -1;
    }, this));
  },
  _drawWelcomeMsg: function (list, nonShow) {
    this.$welcomeEl = this.$container.find('#fe-tmpl-noti');
    if ( this.$welcomeEl.length > 0 && list.length > 0 ) {
      var $welcomeTemp = $('#fe-home-welcome');
      var tplWelcome = Handlebars.compile($welcomeTemp.html());
      this.$welcomeEl.html(tplWelcome({ msg: list[0] }));
      $('#fe-bt-noti-close').on('click', $.proxy(this._onClickCloseNoti, this, nonShow));
      $('#fe-bt-noti-go').on('click', $.proxy(this._onClickGoNoti, this, list[0]));
      // $('#fe-bt-go-recharge').on('click', $.proxy(this._onClickBtRecharge, this));
      this._resetHeight();
    } else {
      this.$welcomeEl.hide();
    }
  },
  _closeNoti: function () {
    this.$welcomeEl.hide();
  },
  _onClickCloseNoti: function (nonShow) {
    if ( nonShow === '' ) {
      nonShow = this._welcomeList[0].wmsgId;
    } else {
      nonShow = nonShow + ',' + this._welcomeList[0].wmsgId;
    }
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeSrevice.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.HOME_WELCOME,
        value: nonShow
      });
    } else {
      Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_WELCOME, nonShow);
    }
    this._closeNoti();
  },
  _onClickGoNoti: function (noti) {
    if ( noti.linkTrgtClCd === '1' ) {
      this._historyService.goLoad(noti.linkUrl);
    } else if ( noti.linkTrgtClCd === '2' ) {
      Tw.CommonHelper.openUrlExternal(noti.linkUrl);
    }
  },
  _setBanner: function (menuId) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: menuId })
      .done($.proxy(this._successBanner, this));
  },
  _successBanner: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      new Tw.BannerService(this.$container, resp.result.banners, $.proxy(this._successDrawBanner, this));
    }
  },
  _successDrawBanner: function () {
    this._resetHeight();
  },
  _getQuickMenu: function (isLogin) {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._successQuickMenu, this, isLogin));
  },
  _successQuickMenu: function (isLogin, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._drawQuickMenu(resp.result, isLogin);
    }
  },
  _drawQuickMenu: function (quickMenu, isLogin) {
    var list = this._parseQuickMenu(quickMenu);
    var $quickMenuEl = this.$container.find('#fe-tmpl-quick');
    if ( $quickMenuEl.length > 0 && list.length > 0 ) {
      var $quickTemp = $('#fe-home-quick');
      var tplQuick = Handlebars.compile($quickTemp.html());
      $quickMenuEl.html(tplQuick({ list: list, isLogin: isLogin }));
    } else {
      if ( isLogin ) {
        var $quickEmptyTemp = $('#fe-home-quick-empty');
        var tplQuickEmpty = Handlebars.compile($quickEmptyTemp.html());
        $quickMenuEl.html(tplQuickEmpty());
      }
    }
    $('.fe-bt-quick-edit').on('click', $.proxy(this._onClickQuickEdit, this, list));
  },
  _parseQuickMenu: function (quickMenu) {
    var menuId = Tw.FormatHelper.isEmpty(quickMenu.menuIdStr) || quickMenu.menuIdStr === 'null' || quickMenu.menuIdStr === ' ' ? [] :
      quickMenu.menuIdStr.indexOf('|') !== -1 ? quickMenu.menuIdStr.split('|') : [quickMenu.menuIdStr.trim()];
    var iconPath = Tw.FormatHelper.isEmpty(quickMenu.iconPathStr) || quickMenu.iconPathStr === 'null' || quickMenu.iconPathStr === ' ' ? [] :
      quickMenu.iconPathStr.indexOf('|') !== -1 ? quickMenu.iconPathStr.split('|') : [quickMenu.iconPathStr.trim()];
    var menuNm = Tw.FormatHelper.isEmpty(quickMenu.menuNmStr) || quickMenu.menuNmStr === 'null' || quickMenu.menuNmStr === ' ' ? [] :
      quickMenu.menuNmStr.indexOf('|') !== -1 ? quickMenu.menuNmStr.split('|') : [quickMenu.menuNmStr.trim()];
    var menuUrl = Tw.FormatHelper.isEmpty(quickMenu.menuUrlStr) || quickMenu.menuUrlStr === 'null' || quickMenu.menuUrlStr === ' ' ? [] :
      quickMenu.menuUrlStr.indexOf('|') !== -1 ? quickMenu.menuUrlStr.split('|') : [quickMenu.menuUrlStr.trim()];
    var result = [];
    _.map(menuId, $.proxy(function (id, index) {
      var menu = {
        menuId: id,
        iconImgFilePathNm: iconPath[index] || '/dummy/icon_80px_default_shortcut@2x.png',    // iconImgFilePathNm
        menuNm: menuNm[index],
        menuUrl: menuUrl[index]
      };
      result.push(menu);
    }, this));
    return result;
  },
  _onClickQuickEdit: function (list) {
    var quickEdit = new Tw.QuickMenuEditComponent();
    quickEdit.open(list, $.proxy(this._onChangeQuickMenu, this));
  },
  _onChangeQuickMenu: function () {
    this._getQuickMenu(true);
  }
};