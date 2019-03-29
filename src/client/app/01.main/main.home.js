/**
 * FileName: main.home.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.06
 */

Tw.MainHome = function (rootEl, smartCard, emrNotice, menuId, isLogin, actRepYn) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();

  this._smartCardOrder = JSON.parse(smartCard);

  this._menuId = menuId;
  this.$elBarcode = null;
  this.$elArrSmartCard = [];
  this.loadingStaus = [];
  this._emrNotice = null;
  this._targetDataLink = '';
  this._membershipBanner = null;
  this._isActRep = actRepYn === 'Y';

  this._lineComponent = new Tw.LineComponent();

  // if ( location.hash === '#store' ) {
  //   setTimeout($.proxy(function () {
  //     skt_landing.action.home_slider({ initialSlide: 1, callback: $.proxy(this._onChangeSlider, this) });
  //     skt_landing.action.notice_slider();
  //   }, this), 40);
  // } else {
  //   setTimeout($.proxy(function () {
  //     skt_landing.action.home_slider({ initialSlide: 0, callback: $.proxy(this._onChangeSlider, this) });
  //     skt_landing.action.notice_slider();
  //   }, this), 40);
  // }

  this._cachedDefaultElement();
  this._bindEventStore();
  this._bindEventLogin();

  this._initEmrNotice(emrNotice, isLogin === 'true');
  this._getQuickMenu(isLogin === 'true');
  this._startLazyRendering();

  if ( isLogin === 'true' ) {
    this._cachedElement();
    this._initWelcomeMsg();
    this._bindEvent();
    this._initScroll();
    this._setCoachMark();
  }
  new Tw.XtractorService(this.$container);
  this._nativeService.send(Tw.NTV_CMD.CLEAR_HISTORY, {});

  // Still Don't know why. temporal fix for link issue.
  $('.help-list li a').on('click', $.proxy(this._onClickInternal, this));
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
    TPLAN_DATA: 'tplan_data',
    TPLAN_PROD: 'tplan_prod'
  },
  _cachedDefaultElement: function () {
    // this.$tabStore = this.$container.find('.icon-home-tab-store');
    this.$hiddenNotice = this.$container.find('#fe-bt-hidden-notice');
    this.$hiddenNotice.on('click', $.proxy(this._onHiddenEventNotice, this));
  },
  _cachedElement: function () {
    this.$elBarcode = this.$container.find('#fe-membership-barcode');
    this.$barcodeGr = this.$container.find('#fe-membership-gr');
    this._svcMgmtNum = this.$container.find('.fe-bt-line').data('svcmgmtnum') &&
      this.$container.find('.fe-bt-line').data('svcmgmtnum').toString();

    this._cachedSmartCard();
    this._cachedSmartCardTemplate();
    this._makeBarcode();
  },
  _bindEvent: function () {
    this.$container.find('#fe-membership-extend').click(_.debounce($.proxy(this._onClickBarcode, this), 500));
    this.$container.on('click', '#fe-membership-go', $.proxy(this._onClickBarcodeGo, this));
    // this.$container.find('.fe-bt-go-recharge').click(_.debounce($.proxy(this._onClickBtRecharge, this),500));
    this.$container.find('.fe-bt-line').click(_.debounce($.proxy(this._onClickLine, this), 500));
    this.$container.find('#fe-bt-data-link').click(_.debounce($.proxy(this._onClickDataLink, this), 500));
    this.$container.on('click', '#fe-bt-link-broadband', $.proxy(this._onClickGoBroadband, this));
    this.$container.on('click', '#fe-bt-link-billguide', $.proxy(this._onClickGoBillGuide, this));
  },
  _bindEventStore: function () {
    this.$container.on('click', '.fe-home-external', $.proxy(this._onClickExternal, this));
    this.$container.on('click', '.fe-home-internal', $.proxy(this._onClickInternal, this));
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
  _onClickExternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openUrlExternal(url);
  },
  _onClickInternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    this._historyService.goLoad(url);
    // Tw.CommonHelper.openUrlInApp(url);

    $event.preventDefault();
    $event.stopPropagation();
  },
  _onClickLine: function ($event) {
    var $target = $($event.currentTarget);
    // var svcMgmtNum = $($event.currentTarget).data('svcmgmtnum');
    this._lineComponent.onClickLine(this._svcMgmtNum, $target);
  },
  _makeBarcode: function () {
    var cardNum = this.$elBarcode.data('cardnum');
    if ( !Tw.FormatHelper.isEmpty(cardNum) ) {
      this.$elBarcode.JsBarcode(cardNum, {
        background: 'rgba(255, 255, 255, 0)',
        displayValue: false
      });
    }
  },
  _onClickBarcode: function ($event) {
    var $target = $($event.currentTarget);
    if ( this.$elBarcode.length > 0 ) {
      var cardNum = this.$elBarcode.data('cardnum');
      var mbrGr = this.$barcodeGr.data('mbrgr');
      var showCardNum = this.$elBarcode.data('showcard');
      this._apiService.request(Tw.API_CMD.BFF_11_0001, {})
        .done($.proxy(this._successMembership, this, mbrGr, cardNum, showCardNum, $target));
    }

  },
  _onClickBarcodeGo: function () {
    this._historyService.goLoad('/membership/submain');
  },

  _successMembership: function (mbrGr, cardNum, showCardNum, $target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var usedAmt = resp.result.mbrUsedAmt;
      this._openBarcodePopup(mbrGr, cardNum, showCardNum, Tw.FormatHelper.addComma((+usedAmt).toString()), $target);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _openBarcodePopup: function (mbrGr, cardNum, showCardNum, usedAmount, $target) {
    this._popupService.open({
      hbs: 'HO_01_01_02',
      layer: true,
      data: {
        mbrGr: mbrGr,
        mbrGrStr: mbrGr.toUpperCase(),
        cardNum: cardNum,
        showCardNum: showCardNum,
        usedAmount: usedAmount
      }
    }, $.proxy(this._onOpenBarcode, this, cardNum), null, 'membership', $target);

  },
  _onOpenBarcode: function (cardNum, $popupContainer) {
    var $extendBarcode = $popupContainer.find('#fe-membership-barcode-extend');

    if ( !Tw.FormatHelper.isEmpty(this._membershipBanner) ) {
      new Tw.BannerService($popupContainer, this._membershipBanner.kind, this._membershipBanner.list, '7', $.proxy(this._successDrawBanner, this));
    }

    if ( !Tw.FormatHelper.isEmpty(cardNum) ) {
      $extendBarcode.JsBarcode(cardNum, {
        height: 60,
        margin: 0,
        displayValue: false
      });
    }
  },
  _onClickGoBroadband: function () {
    Tw.CommonHelper.openUrlExternal(Tw.OUTLINK.BROADBAND);
  },
  _onClickGoBillGuide: function () {
    this._historyService.goLoad('/myt-fare/billguide/guide');
  },
  _onClickDataLink: function ($event) {
    var $target = $($event.currentTarget);
    var isTplanProd = $target.data('tplanprod');
    this._apiService.request(Tw.API_CMD.BFF_06_0015, {})
      .done($.proxy(this._successGiftSender, this, isTplanProd, $target));
  },
  _successGiftSender: function (isTplanProd, $target, resp) {
    this._popupService.open({
      hbs: 'actionsheet_data',
      layer: true,
      enableGift: resp.code === Tw.API_CODE.CODE_00,
      tplanProd: isTplanProd
    }, $.proxy(this._onOpenDataLink, this), $.proxy(this._onCloseDataLink, this, $target), 'data-link', $target);
  },
  _onOpenDataLink: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-recharge-link', $.proxy(this._onClickRechargeLink, this));
    $popupContainer.on('click', '#fe-bt-gift-link', $.proxy(this._onClickGiftLink, this));
    $popupContainer.on('click', '#fe-bt-family-link', $.proxy(this._onClickFamilyLink, this));
  },
  _onCloseDataLink: function ($target) {
    switch ( this._targetDataLink ) {
      case this.DATA_LINK.RECHARGE:
        new Tw.ImmediatelyRechargeLayer(this.$container, {
          pathUrl: '/main/home'
        });
        break;
      case this.DATA_LINK.TPLAN_PROD:
        this._popupService.openConfirmButton(Tw.ALERT_MSG_HOME.A08.MSG, Tw.ALERT_MSG_HOME.A08.TITLE,
          $.proxy(this._onConfirmTplanProd, this), null,
          Tw.BUTTON_LABEL.CLOSE, Tw.ALERT_MSG_HOME.A08.BUTTON, $target);
        break;
      default:
        break;
    }
    this._targetDataLink = '';
  },
  _onConfirmTplanProd: function () {
    this._historyService.replaceURL('/product/callplan?prod_id=NA00006031');
  },
  _onClickRechargeLink: function () {
    this._targetDataLink = this.DATA_LINK.RECHARGE;
    this._popupService.close();
  },
  _onClickGiftLink: function () {
    this._historyService.replaceURL('/myt-data/giftdata');
  },
  _onClickFamilyLink: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0044, {})
      .done($.proxy(this._successTplan, this))
      .fail($.proxy(this._failTplan, this));
  },
  _successTplan: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/familydata');
    } else {
      this._targetDataLink = this.DATA_LINK.TPLAN_PROD;
      this._popupService.close();
    }
  },
  _failTplan: function (resp) {

  },
  _initEmrNotice: function (notice, isLogin) {
    if ( notice === 'true' ) {
      this._getHomeNotice(isLogin);
    }
  },
  _getHomeNotice: function (isLogin) {
    this._apiService.request(Tw.NODE_CMD.GET_HOME_NOTICE, {})
      .done($.proxy(this._successHomeNotice, this, isLogin));
  },
  _successHomeNotice: function (isLogin, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openEmrNotice(resp.result.emrNotice, isLogin);
    }
  },
  _openEmrNotice: function (notice) {
    // this.$hiddenNotice.trigger('click', {
    //   ntcTicNm: 'title',
    //   ntcCtt: 'content',
    //   ntcReqRsnCtt: '0'
    // });
    if ( !Tw.FormatHelper.isEmpty(notice) ) {
      var startTime = Tw.DateHelper.convDateFormat(notice.bltnStaDtm).getTime();
      var endTime = Tw.DateHelper.convDateFormat(notice.bltnEndDtm).getTime();
      var today = new Date().getTime();
      this._emrNotice = notice;
      if ( today > startTime && today < endTime && this._checkShowEmrNotice(notice, today) ) {
        this.$hiddenNotice.trigger('click', notice);
      }
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
  _openEmrNoticePopup: function (notice) {
    this._popupService.open({
      'pop_name': 'type_tx_scroll',
      'title': notice.ntcTitNm,
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': notice.ntcCtt,
      'bt_b': this._makeBtnList(notice)
    }, $.proxy(this._onOpenNotice, this), $.proxy(this._onCloseNotice, this), 'mainAuto');
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
    $popupContainer.on('click', '.fe-bt-week', $.proxy(this._confirmNoticeWeek, this));
    $popupContainer.on('click', '.fe-bt-never', $.proxy(this._confirmNoticeNever, this));
  },
  _onCloseNotice: function () {
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
    var command = Tw.API_CMD.BFF_04_0008;
    if ( this._isActRep ) {
      command = Tw.API_CMD.BFF_04_0009;
    }
    var storeBill = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.HOME_BILL));
    if ( Tw.FormatHelper.isEmpty(storeBill) || Tw.DateHelper.convDateFormat(storeBill.expired).getTime() < new Date().getTime() ||
      this._svcMgmtNum !== storeBill.svcMgmtNum ) {
      this._apiService.request(command, {})
        .done($.proxy(this._successBillData, this, element))
        .fail($.proxy(this._failBillData, this));
    } else {
      this._drawBillData(element, storeBill.data);
    }
  },
  _successBillData: function (element, resp) {
    var storeData = {
      data: resp,
      expired: Tw.DateHelper.add5min(new Date()),
      svcMgmtNum: this._svcMgmtNum
    };
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_BILL, JSON.stringify(storeData));

    this._drawBillData(element, resp);
  },
  _failBillData: function () {

  },
  _drawBillData: function (element, resp) {
    var result = this._parseBillData(resp);

    if ( !Tw.FormatHelper.isEmpty(result) ) {
      var $billTemp = $('#fe-smart-bill');
      var tplBillCard = Handlebars.compile($billTemp.html());
      element.html(tplBillCard(result));
      element.removeClass('empty');
      element.addClass('nogaps');
      element.find('#fe-bt-payment').click(_.debounce($.proxy(this._onClickPayment, this), 500));
    } else {
      element.hide();
    }
    this._resetHeight();
  },
  _onClickPayment: function ($event) {
    var svcAttrCd = $($event.currentTarget).data('svcattrcd');
    new Tw.MyTFareBill(this.$container, svcAttrCd);
  },
  _parseBillData: function (billData) {
    if ( billData.code === Tw.API_CODE.BFF_0006 || billData.code === Tw.API_CODE.BFF_0007 ) {
      return null;
    } else if ( billData.code === Tw.API_CODE.CODE_00 ) {
      return {
        showData: true,
        isActRep: this._isActRep,
        useAmtTot: billData.result.amt,
        invEndDt: Tw.DateHelper.getShortDate(billData.result.invDt),
        invStartDt: Tw.DateHelper.getShortFirstDate(billData.result.invDt),
        invMonth: Tw.DateHelper.getCurrentMonth(billData.result.invDt),
        billMonth: +Tw.DateHelper.getCurrentMonth(billData.result.invDt) + 1
      };
    } else {
      return {
        showData: false
      };
    }
  },
  _getMicroContentsData: function (element) {
    var microContentsStore = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.HOME_MICRO_CONTENTS));
    if ( Tw.FormatHelper.isEmpty(microContentsStore) || Tw.DateHelper.convDateFormat(microContentsStore.expired).getTime() < new Date().getTime() ||
      this._svcMgmtNum !== microContentsStore.svcMgmtNum ) {
      this._apiService.requestArray([
        { command: Tw.API_CMD.BFF_04_0006, params: {} },
        { command: Tw.API_CMD.BFF_04_0007, params: {} }
      ]).done($.proxy(this._successMicroContentsData, this, element))
        .fail($.proxy(this._failMicroContentsData, this));
    } else {

      this._drawMicroContentsData(element, microContentsStore.data.contents, microContentsStore.data.micro);
    }
  },
  _successMicroContentsData: function (element, contentsResp, microResp) {
    var storeData = {
      data: {
        contents: contentsResp,
        micro: microResp
      },
      expired: Tw.DateHelper.add5min(new Date()),
      svcMgmtNum: this._svcMgmtNum
    };
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_MICRO_CONTENTS, JSON.stringify(storeData));
    this._drawMicroContentsData(element, contentsResp, microResp);
  },
  _failMicroContentsData: function () {

  },
  _drawMicroContentsData: function (element, contentsResp, microResp) {
    var apiBlock = false;
    var result = {
      micro: 0,
      contents: 0,
      invEndDt: Tw.DateHelper.getShortDate(new Date()),
      invStartDt: Tw.DateHelper.getShortFirstDate(new Date())
    };
    if ( microResp.code === Tw.API_CODE.BFF_0006 || microResp.code === Tw.API_CODE.BFF_0007 ) {
      apiBlock = true;
    } else if ( microResp.code === Tw.API_CODE.CODE_00 ) {
      result.micro = Tw.FormatHelper.addComma(microResp.result.totalSumPrice);
    }

    if ( contentsResp.code === Tw.API_CODE.BFF_0006 || contentsResp.code === Tw.API_CODE.BFF_0007 ) {
      apiBlock = true;
    } else if ( contentsResp.code === Tw.API_CODE.CODE_00 ) {
      result.contents = Tw.FormatHelper.addComma(contentsResp.result.invDtTotalAmtCharge);
    }

    if ( apiBlock ) {
      element.hide();
    } else {
      var $microContentsTemp = $('#fe-smart-micro-contents');
      var tplMicroContentsCard = Handlebars.compile($microContentsTemp.html());
      element.html(tplMicroContentsCard(result));
      element.removeClass('empty');
      element.addClass('nogaps');
    }

    this._resetHeight();
  },

  _getGiftData: function (element) {
    this._apiService.request(Tw.API_CMD.BFF_06_0015, {})
      .done($.proxy(this._successGiftData, this, element))
      .fail($.proxy(this._failGiftData, this));
  },
  _successGiftData: function (element, resp) {
    if ( resp.code === Tw.API_CODE.BFF_0006 || resp.code === Tw.API_CODE.BFF_0007 ) {
      element.hide();
    } else if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( new Date().getDate() === Tw.GIFT_BLOCK_USAGE ) {
        this._drawGiftData(element, {
          blockUsage: true
        }, resp);
      } else {
        this._drawGiftData(element, this._parseGiftData(resp.result), resp);
      }
    } else {
      this._drawGiftData(element, {
        sender: false
      }, resp);
    }
    this._resetHeight();
  },
  _failGiftData: function () {

  },
  _drawGiftData: function (element, result, sender) {
    var $giftTemp = $('#fe-smart-gift');
    var tplGiftCard = Handlebars.compile($giftTemp.html());

    element.html(tplGiftCard(result));
    element.removeClass('empty');
    element.addClass('nogaps');

    var $textBalance = element.find('#fe-text-gift-balance');
    var $btBalance = element.find('#fe-bt-gift-balance');
    var $loading = element.find('#fe-text-gift-loading');
    var $textError = element.find('#fe-text-error');
    var $btGoGift = element.find('.fe-bt-go-gift');
    var $textErrorBalance = element.find('#fe-text-error-balance');

    $btGoGift.on('click', $.proxy(this._onClickBtGift, this, sender));
    if ( !result.blockUsage ) {
      $btBalance.on('click', $.proxy(this._onClickGiftBalance, this, element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance));
      this._getGiftBalance(0, element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance);
    }
  },
  _parseGiftData: function (sender) {
    return {
      sender: true,
      dataGiftCnt: sender.dataGiftCnt,
      familyDataGiftCnt: sender.familyDataGiftCnt,
      familyMemberYn: sender.familyMemberYn === 'Y',
      goodFamilyMemberYn: sender.goodFamilyMemberYn === 'Y'
    };
  },
  _getGiftBalance: function (reqCnt, element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance) {
    setTimeout($.proxy(function () {
      this._apiService.request(Tw.API_CMD.BFF_06_0014, { reqCnt: reqCnt })
        .done($.proxy(this._successGiftRemain, this, element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance));
    }, this), 3000);

  },
  _successGiftRemain: function (element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance, resp) {
    if ( resp.code === Tw.API_CODE.BFF_0006 || resp.code === Tw.API_CODE.BFF_0007 ) {
      element.hide();
      this._resetHeight();
    } else if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.giftRequestAgainYn === 'N' ) {
        if ( !Tw.FormatHelper.isEmpty(resp.result.dataRemQty) ) {
          $loading.parent().addClass('none');
          $textBalance.parent().removeClass('none');
          var remain = Tw.FormatHelper.convDataFormat(resp.result.dataRemQty, 'MB');
          $textBalance.text(remain.data);
          $textBalance.parent().append(remain.unit);

          $btGoGift.attr('disabled', false);
          $btGoGift.removeClass('bt-off');
        } else {
          $loading.parent().addClass('none');
          $btBalance.parent().removeClass('none');
        }
      } else {
        this._getGiftBalance(resp.result.reqCnt, element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance);
      }
    } else {
      $btGoGift.parent().addClass('none');
      $textError.text(resp.msg);
      $textError.removeClass('none');
      $textError.attr('aria-hidden', false);

      $loading.parent().addClass('none');
      $textErrorBalance.removeClass('none');
    }
  },
  _onClickBtGift: function (sender, $event) {
    var $target = $($event.currentTarget);
    if ( sender.code === Tw.API_CODE.CODE_00 ) {
      if ( sender.result.dataGiftCnt > 0 ) {
        this._historyService.goLoad('/myt-data/giftdata');
      } else {
        this._historyService.goLoad('/myt-data/giftdata#auto');
      }
    } else if ( sender.code === this.GIFT_ERROR_CODE.GFT0002 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_HOME.A05, null, null, null, null, $target);
    } else {
      this._popupService.openAlert(Tw.ALERT_MSG_HOME.A06, null, null, null, null, $target);
    }
  },
  _onClickGiftBalance: function (element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance, $event) {
    $event.preventDefault();
    $event.stopPropagation();

    $loading.parent().removeClass('none');
    $btBalance.parent().addClass('none');

    this._getGiftBalance(0, element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance);
  },
  _getRechargeData: function (element) {
    var $rechargeTemp = $('#fe-smart-recharge');
    var usageCode = $rechargeTemp.data('usagecode');

    if ( usageCode === Tw.API_CODE.BFF_0006 || usageCode === Tw.API_CODE.BFF_0007 ) {
      element.hide();
      this._resetHeight();
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
        .done($.proxy(this._successRechargeData, this, $rechargeTemp, element))
        .fail($.proxy(this._failRechargeData, this));
    }
  },
  _successRechargeData: function ($rechargeTemp, element, resp) {
    if ( resp.code === Tw.API_CODE.BFF_0006 || resp.code === Tw.API_CODE.BFF_0007 ) {
      element.hide();
    } else {
      var tplRechargeCard = Handlebars.compile($rechargeTemp.html());
      element.html(tplRechargeCard(this._parseRechargeData(resp)));
      element.removeClass('empty');
      element.addClass('nogaps');
      element.find('#fe-bt-go-recharge').click(_.debounce($.proxy(this._onClickBtRecharge, this), 500));
    }
    this._resetHeight();
  },
  _failRechargeData: function () {

  },
  _parseRechargeData: function (recharge) {
    if ( recharge.code === Tw.API_CODE.CODE_00 ) {
      return {
        showRefill: true,
        refillCoupons: recharge.result.length
      };
    } else {
      return {
        showRefill: false,
        refillCoupons: null
      };
    }
  },
  _onClickBtRecharge: function ($event) {
    $event.stopPropagation();
    new Tw.ImmediatelyRechargeLayer(this.$container, {
      pathUrl: '/main/home'
    });
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
      // case Tw.HOME_SMART_CARD_E.CONTENT:
      //   this._getContentData(this.$elArrSmartCard[index]);
      //   break;
      case Tw.HOME_SMART_CARD_E.MICRO_PAY:
        this._getMicroContentsData(this.$elArrSmartCard[index]);
        // this._getMicroPayData(this.$elArrSmartCard[index]);
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
    // if ( Tw.BrowserHelper.isApp() ) {
    //   Tw.CommonHelper.resetHeight($('.home-slider .home-slider-belt')[0]);
    // }
  },
  _initWelcomeMsg: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(Tw.NTV_CMD.IS_APP_CREATED, { key: Tw.NTV_PAGE_KEY.HOME_WELCOME }, $.proxy(this._onAppCreated, this));
    } else {
      this._getWelcomeMsg();
    }
  },
  _onAppCreated: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 && resp.params.value === 'Y' ) {
      this._getWelcomeMsg();
    }
  },
  _getWelcomeMsg: function () {
    this._apiService.request(Tw.NODE_CMD.GET_HOME_WELCOME, {})
      .done($.proxy(this._successWelcomeMsg, this));
  },
  _successWelcomeMsg: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( Tw.BrowserHelper.isApp() ) {
        this._nativeService.send(Tw.NTV_CMD.LOAD, {
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
      $('#fe-bt-noti-go').on('click', $.proxy(this._onClickGoNoti, this, list[0], nonShow));
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
      this._nativeService.send(Tw.NTV_CMD.SAVE, {
        key: Tw.NTV_STORAGE.HOME_WELCOME,
        value: nonShow
      });
    } else {
      Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_WELCOME, nonShow);
    }
    this._closeNoti();
  },
  _onClickGoNoti: function (noti, nonShow) {
    if ( noti.linkTrgtClCd === '1' ) {
      this._onClickCloseNoti(nonShow);
      this._historyService.goLoad(noti.linkUrl);
    } else if ( noti.linkTrgtClCd === '2' ) {
      this._onClickCloseNoti(nonShow);
      Tw.CommonHelper.openUrlExternal(noti.linkUrl);
    }
  },
  _setBanner: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._getTosAppBanner();
    } else {
      this._getTosWebBanner();
    }
  },
  _getTosAppBanner: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_BANNER_TOS, params: { code: '0001' } },
      { command: Tw.NODE_CMD.GET_BANNER_TOS, params: { code: '0002' } },
      { command: Tw.NODE_CMD.GET_BANNER_TOS, params: { code: '0003' } },
      { command: Tw.NODE_CMD.GET_BANNER_TOS, params: { code: '0007' } }
    ]).done($.proxy(this._successTosAppBanner, this));
  },
  _getTosWebBanner: function () {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_TOS, { code: '0005' })
      .done($.proxy(this._successTosWebBanner, this));
  },
  _successTosAppBanner: function (banner1, banner2, banner3, banner7) {
    var result = [{ target: '1', banner: banner1 },
      { target: '2', banner: banner2 },
      { target: '3', banner: banner3 },
      { target: '7', banner: banner7 }];
    this._drawBanner(result);
  },
  _successTosWebBanner: function (resp) {
    this._drawBanner([{ target: '5', banner: resp }]);
  },
  _drawBanner: function (banners) {
    var adminList = [];
    _.map(banners, $.proxy(function (bnr) {
      if ( this._checkTosBanner(bnr.banner, bnr.target) ) {
        if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) ) {
          if ( bnr.target === '7' ) {
            this._membershipBanner = {
              kind: Tw.REDIS_BANNER_TYPE.TOS,
              list: bnr.banner.result.imgList
            };
          } else {
            new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS, bnr.banner.result.imgList, bnr.target, $.proxy(this._successDrawBanner, this));
          }
        }
      } else {
        adminList.push(bnr);
      }
    }, this));

    if ( adminList.length > 0 ) {
      this._getAdminBanner(adminList);
    }
  },
  _checkTosBanner: function (tosBanner, target) {
    if ( tosBanner.code === Tw.API_CODE.CODE_00 ) {
      if ( tosBanner.result.bltnYn === 'N' ) {
        this.$container.find('ul.slider[data-location=' + target + ']').parents('div.nogaps').addClass('none');
        return true;
      } else {
        if ( tosBanner.result.tosLnkgYn === 'Y' ) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  },
  _getAdminBanner: function (adminList) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: this._menuId })
      .done($.proxy(this._successBanner, this, adminList));
  },
  _successBanner: function (adminList, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      _.map(adminList, $.proxy(function (target) {
        var banner = _.filter(resp.result.banners, function (banner) {
          return banner.bnnrLocCd === target.target;
        }).map(function(target) {
          target.bnnrImgAltCtt = target.bnnrImgAltCtt.replace(/<br>/gi, ' ');
          return target;
        });
        if ( banner.length > 0 ) {
          if ( target.target === '7' ) {
            this._membershipBanner = {
              kind: Tw.REDIS_BANNER_TYPE.ADMIN,
              list: banner
            };
          } else {
            new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, banner, target.target, $.proxy(this._successDrawBanner, this));
          }
        } else {
          this.$container.find('ul.slider[data-location=' + target.target + ']').parents('div.nogaps').addClass('none');
          this._resetHeight();
        }
      }, this));
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
      $quickMenuEl.html(tplQuick({
        list: list,
        enableEdit: quickMenu.enableEdit === 'Y',
        quick_xt_eid: Tw.BrowserHelper.isApp() ? 'CMMA_A2_B6-22' : 'MWMA_A2_B6-160',
        edit_xt_eid: Tw.BrowserHelper.isApp() ? 'CMMA_A2_B6-23' : 'MWMA_A2_B6-161'
      }));
    } else {
      if ( isLogin ) {
        var $quickEmptyTemp = $('#fe-home-quick-empty');
        var tplQuickEmpty = Handlebars.compile($quickEmptyTemp.html());
        $quickMenuEl.html(tplQuickEmpty({
          edit_xt_eid: Tw.BrowserHelper.isApp() ? 'CMMA_A2_B6-23' : 'MWMA_A2_B6-161'
        }));
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
        iconImgFilePathNm: Tw.FormatHelper.isEmpty(iconPath[index]) || iconPath[index] === 'null' ?
          '/img/dummy/icon_80px_default_shortcut@2x.png' : iconPath[index],    // iconImgFilePathNm
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
  },
  _onHiddenEventNotice: function ($event, notice) {
    setTimeout($.proxy(function () {
      this._openEmrNoticePopup(notice);
    }, this), 2000);
  },
  _setCoachMark: function () {
    new Tw.CoachMark(this.$container, '.fe-coach-line', Tw.NTV_STORAGE.COACH_LINE);
    new Tw.CoachMark(this.$container, '#fe-coach-data', Tw.NTV_STORAGE.COACH_DATA);
  },
  _onChangeSlider: function (currentSlider) {
    Tw.Logger.info('[Home Slider] change', currentSlider);
    if ( currentSlider === 0 ) {
      this._historyService.replaceURL('#');
    } else {
      this._historyService.replaceURL('#store');
    }
  },
  _startLazyRendering: function () {
    // var $homeStore = $('#fe-home-store');
    // if ( $homeStore.length > 0 ) {
    //   var tplHomeStore = Handlebars.compile($homeStore.html());
    //   this.$container.find('#fe-div-home-store').html(tplHomeStore());
    // }
    var $doLikeThis = $('#fe-home-do-like-this');
    if ( $doLikeThis.length > 0 ) {
      var tplDoLikeThis = Handlebars.compile($doLikeThis.html());
      this.$container.find('.fe-div-home-do-like-this').html(tplDoLikeThis());
    }
    var $notice = $('#fe-home-notice');
    if ( $notice.length > 0 ) {
      var tplNotice = Handlebars.compile($notice.html());
      this.$container.find('.fe-div-home-notice').html(tplNotice());
    }

    this._setBanner();
  }
};