/**
 * @file main.home.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.06
 */

/**
 * @class
 * @desc 메인 > 홈(my)
 * @param rootEl - dom 객체
 * @param smartCard
 * @param emrNotice
 * @param menuId
 * @param isLogin
 * @param actRepYn
 * @constructor
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
  this._bindEventLanding();
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
  /**
   * @member {object}
   * @desc 선물하기 오류 코드
   * @readonly
   * @prop {string} GFT0001 제공자 선물하기 불가 상태
   * @prop {string} GFT0002 제공자 선물하기 불가 요금제
   * @prop {string} GFT0003 제공자 당월 선물가능 횟수 초과
   * @prop {string} GFT0004 제공자 당월 선물가능 용량 미달
   * @prop {string} GFT0005 제공자가 미성년자이면 선물하기 불가
   * @prop {string} GFT0013 그 외 기타에러
   */
  GIFT_ERROR_CODE: {
    GFT0001: 'GFT0001',
    GFT0002: 'GFT0002',
    GFT0003: 'GFT0003',
    GFT0004: 'GFT0004',
    GFT0005: 'GFT0005',
    GFT0013: 'GFT0013'
  },
  /**
   * @member {object}
   * @desc 충전/선물 랜딩 타입
   * @readonly
   * @prop {string} RECHARGE 충전하기
   * @prop {string} GIFT 선물하기
   * @prop {string} TPLAN_DATA T가족모아
   * @prop {string} TPLAN_PROD T가족모아 상품
   */
  DATA_LINK: {
    RECHARGE: 'recharge',
    GIFT: 'gift',
    TPLAN_DATA: 'tplan_data',
    TPLAN_PROD: 'tplan_prod'
  },
  /**
   * @function
   * @desc 로그인과 관계없는 element 변수 초기화
   * @return {void}
   * @private
   */
  _cachedDefaultElement: function () {
    // this.$tabStore = this.$container.find('.icon-home-tab-store');
    this.$hiddenNotice = this.$container.find('#fe-bt-hidden-notice');
    this.$hiddenNotice.on('click', $.proxy(this._onHiddenEventNotice, this));
  },

  /**
   * @function
   * @desc 로그인시 element 변수 초기화
   * @return {void}
   * @private
   */
  _cachedElement: function () {
    this.$elBarcode = this.$container.find('#fe-membership-barcode');
    this.$barcodeGr = this.$container.find('#fe-membership-gr');
    this.$elMembership = this.$container.find('#fe-membership-extend');
    this._svcMgmtNum = this.$container.find('.fe-bt-line').data('svcmgmtnum') &&
      this.$container.find('.fe-bt-line').data('svcmgmtnum').toString();

    this._cachedSmartCard();
    this._makeBarcode();
  },

  /**
   * @function
   * @desc 로그인과 관련 없는 이벤트 바인딩
   * @return {void}
   * @private
   */
  _bindEvent: function () {
    this.$elMembership.on('click', _.debounce($.proxy(this._onClickBarcode, this), 500));
    this.$container.on('click', '#fe-membership-go', $.proxy(this._onClickBarcodeGo, this));
    // this.$container.find('.fe-bt-go-recharge').click(_.debounce($.proxy(this._onClickBtRecharge, this),500));
    this.$container.on('click', '.fe-bt-line', _.debounce($.proxy(this._onClickLine, this), 500));
    this.$container.on('click', '#fe-bt-data-link', _.debounce($.proxy(this._onClickDataLink, this), 500));
    this.$container.on('click', '#fe-bt-link-broadband', $.proxy(this._onClickGoBroadband, this));
    this.$container.on('click', '#fe-bt-link-billguide', $.proxy(this._onClickGoBillGuide, this));
  },

  /**
   * @function
   * @desc 랜딩 관련 이벤트 바인딩
   * @return {void}
   * @private
   */
  _bindEventLanding: function () {
    this.$container.on('click', '.fe-home-external', $.proxy(this._onClickExternal, this));
    this.$container.on('click', '.fe-home-internal', $.proxy(this._onClickInternal, this));
    this.$container.on('click', '.fe-home-charge', $.proxy(this._onClickCharge, this));
  },

  /**
   * @function
   * @desc 로그인 이벤트 바인딩
   * @return {void}
   * @private
   */
  _bindEventLogin: function () {
    this.$container.on('click', '.fe-bt-home-login', $.proxy(this._onClickLogin, this));
    this.$container.on('click', '.fe-bt-home-slogin', $.proxy(this._onClickSLogin, this));
    this.$container.on('click', '.fe-bt-signup', $.proxy(this._onClickSignup, this));
  },

  /**
   * @function
   * @desc 로그인 버튼 클릭 처리
   * @return {void}
   * @private
   */
  _onClickLogin: function () {
    this._tidLanding.goLogin();
  },

  /**
   * @function
   * @desc 간편로그인 버튼 클릭 처리
   * @return {void}
   * @private
   */
  _onClickSLogin: function () {
    this._tidLanding.goSLogin();
  },

  /**
   * @function
   * @desc 회원가입 버튼 클릭 처리
   * @return {void}
   * @private
   */
  _onClickSignup: function () {
    this._tidLanding.goSignup();
  },

  /**
   * @function
   * @desc 외부 브라우저 랜딩 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickExternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @function
   * @desc 내부 이동 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickInternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    this._historyService.goLoad(url);

    $event.preventDefault();
    $event.stopPropagation();
  },

  /**
   * @function
   * @desc 과금 팝업 오픈 후 외부 브라우저 랜딩 처리
   * @param $event 이베트 객체
   * @return {void}
   * @private
   */
  _onClickCharge: function ($event) {
    Tw.CommonHelper.showDataCharge($.proxy(this._onClickExternal, this, $event));
  },

  /**
   * @function
   * @desc 회선번호 클릭시 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickLine: function ($event) {
    var $target = $($event.currentTarget);
    // var svcMgmtNum = $($event.currentTarget).data('svcmgmtnum');
    this._lineComponent.onClickLine(this._svcMgmtNum, $target);
  },

  /**
   * @function
   * @desc 멤버십 바코드 생성
   * @return {void}
   * @private
   */
  _makeBarcode: function () {
    var cardNum = '';
    if ( this.$elMembership.hasClass('fe-bff0011') ) {
      var membershipData = JSON.parse(Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.MEMBERSHIP_INFO));
      this.$barcodeGr.addClass(membershipData.mbrGr);
      if ( membershipData.mbrSt === 'SP' ) {
        this.$elMembership.find('#fe-membership-barcode-wrap').addClass('none').attr('aria-disabled', true);
        this.$elMembership.find('#fe-membership-stop').removeClass('none').attr('aria-disabled', false);
      } else {
        cardNum = membershipData.cardNum;
        this.$elMembership.find('#fe-membership-cardnum').text(membershipData.showCardNum);
        this.$elBarcode.attr('data-cardnum', cardNum);
        this.$elBarcode.attr('data-showcard', membershipData.showCardNum);
        this.$barcodeGr.attr('data-mbrgr', membershipData.mbrGr);
        this.$barcodeGr.attr('data-mbrst', membershipData.mbrSt);
      }
    } else {
      cardNum = this.$elBarcode.data('cardnum');
      var showCardNum = this.$elBarcode.data('showcard');
      var mbrGr = this.$barcodeGr.data('mbrgr');
      var mbrSt = this.$barcodeGr.data('mbrst');
      Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.MEMBERSHIP_INFO, JSON.stringify({
        cardNum: cardNum,
        showCardNum: showCardNum,
        mbrGr: mbrGr,
        mbrSt: mbrSt
      }));
    }
    if ( !Tw.FormatHelper.isEmpty(cardNum) ) {
      this.$elBarcode.JsBarcode(cardNum, {
        background: 'rgba(255, 255, 255, 0)',
        displayValue: false
      });
    }

  },

  /**
   * @function
   * @desc 멤버십 바코드 클릭시 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickBarcode: function ($event) {
    var $target = $($event.currentTarget);
    if ( this.$elBarcode.length > 0 ) {
      var cardNum = this.$elBarcode.data('cardnum');
      var mbrGr = this.$barcodeGr.data('mbrgr');
      var showCardNum = this.$elBarcode.data('showcard');

      if ( this.$elMembership.hasClass('fe-bff0011') ) {
        this._openBarcodePopup(mbrGr, cardNum, showCardNum, '- ', $target);

      } else {
        if ( !Tw.FormatHelper.isEmpty(cardNum) ) {
          this._apiService.request(Tw.API_CMD.BFF_11_0001, {})
            .done($.proxy(this._successMembership, this, mbrGr, cardNum, showCardNum, $target))
            .fail($.proxy(this._failMembership, this));
        }
      }


    }
  },

  /**
   * @function
   * @desc 멤버십 카드 클릭시 처리
   * @return {void}
   * @private
   */
  _onClickBarcodeGo: function () {
    this._historyService.goLoad('/membership/submain');
  },

  /**
   * @function
   * @desc 멤버십 데이터 처리
   * @param mbrGr 멤버십 그룹
   * @param cardNum 멤버십 카드 번호
   * @param showCardNum 화면 노출용 멤버십 카드 번호
   * @param $target
   * @param resp
   * @return {void}
   * @private
   */
  _successMembership: function (mbrGr, cardNum, showCardNum, $target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var usedAmt = resp.result.mbrUsedAmt;
      this._openBarcodePopup(mbrGr, cardNum, showCardNum, Tw.FormatHelper.addComma((+usedAmt).toString()), $target);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 멤버십 에러 처리
   * @param error
   * @private
   */
  _failMembership: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 멤버십 바코드 확장 팝업 오픈
   * @param mbrGr 멤버십 그룹
   * @param cardNum 멤버십 카드 번호
   * @param showCardNum 화면 노출용 멤버십 카드 번호
   * @param usedAmount 멤버십 사용량
   * @param $target
   * @return {void}
   * @private
   */
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

  /**
   * @function
   * @desc 멤버십 바코드 확장 팝업 오픈 callback
   * @param cardNum 멤버십 카드 번호
   * @param $popupContainer 팝업 객체
   * @return {void}
   * @private
   */
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

  /**
   * @function
   * @desc 브로드밴드 링크 클릭 처리
   * @return {void}
   * @private
   */
  _onClickGoBroadband: function () {
    Tw.CommonHelper.openUrlExternal(Tw.OUTLINK.BROADBAND);
  },

  /**
   * @function
   * @desc 요금안내서 버튼 클릭 처리
   * @return {void}
   * @private
   */
  _onClickGoBillGuide: function () {
    this._historyService.goLoad('/myt-fare/billguide/guide');
  },

  /**
   * @function
   * @desc 충전/선물 버튼 클릭 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickDataLink: function ($event) {
    var $target = $($event.currentTarget);
    var isTplanProd = $target.data('tplanprod');
    this._apiService.request(Tw.API_CMD.BFF_06_0015, {})
      .done($.proxy(this._successGiftSender, this, isTplanProd, $target))
      .fail($.proxy(this._failGiftSender, this));
  },

  /**
   * @function
   * @desc 충전/선물 레이어 데이터 요청 처리 및 팝업 오픈
   * @param isTplanProd
   * @param $target
   * @param resp
   * @return {void}
   * @private
   */
  _successGiftSender: function (isTplanProd, $target, resp) {
    this._popupService.open({
      hbs: 'actionsheet_data',
      layer: true,
      enableGift: resp.code === Tw.API_CODE.CODE_00,
      tplanProd: isTplanProd
    }, $.proxy(this._onOpenDataLink, this), $.proxy(this._onCloseDataLink, this, $target), 'data-link', $target);
  },

  /**
   * @function
   * @desc 충전/선물 레이어 선물하기 제공자 조회 에러 처리
   * @param error
   * @private
   */
  _failGiftSender: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 충전/선물 레이어 팝업 오픈 callback
   * @param $popupContainer 팝업 객체
   * @return {void}
   * @private
   */
  _onOpenDataLink: function ($popupContainer) {
    Tw.CommonHelper.focusOnActionSheet($popupContainer);

    $popupContainer.on('click', '#fe-bt-recharge-link', $.proxy(this._onClickRechargeLink, this));
    $popupContainer.on('click', '#fe-bt-gift-link', $.proxy(this._onClickGiftLink, this));
    $popupContainer.on('click', '#fe-bt-family-link', $.proxy(this._onClickFamilyLink, this));
  },

  /**
   * @function
   * @desc 충전/선물 레이어 팝업 클로즈 callback
   * @param $target
   * @return {void}
   * @private
   */
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

  /**
   * @function
   * @desc T가족모아 상품 안내 팝업 확인 버튼 클릭시 처리
   * @return {void}
   * @private
   */
  _onConfirmTplanProd: function () {
    this._historyService.replaceURL('/product/callplan?prod_id=NA00006031');
  },

  /**
   * @function
   * @desc 충전/선물 레이어 - 충전 클릭시 처리
   * @return {void}
   * @private
   */
  _onClickRechargeLink: function () {
    this._targetDataLink = this.DATA_LINK.RECHARGE;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 충전/선물 레이어 - 선물 클릭시 처리
   * @return {void}
   * @private
   */
  _onClickGiftLink: function () {
    this._historyService.replaceURL('/myt-data/giftdata');
  },

  /**
   * @function
   * @desc 충전/선물 레이어 - T가족모아 클릭시 처리
   * @return {void}
   * @private
   */
  _onClickFamilyLink: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0044, {})
      .done($.proxy(this._successTplan, this))
      .fail($.proxy(this._failTplan, this));
  },

  /**
   * @function
   * @desc T가족모아 가입 여부에 따른 분기 처리
   * @param resp
   * @return {void}
   * @private
   */
  _successTplan: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/familydata');
    } else {
      this._targetDataLink = this.DATA_LINK.TPLAN_PROD;
      this._popupService.close();
    }
  },

  /**
   * @function
   * @desc T가족모아 가입여부 API 오류 처리
   * @param error
   * @return {void}
   * @private
   */
  _failTplan: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 긴급공지 initialize
   * @param notice
   * @param isLogin
   * @return {void}
   * @private
   */
  _initEmrNotice: function (notice, isLogin) {
    // this.$hiddenNotice.trigger('click', {
    //   ntcTicNm: 'title',
    //   ntcCtt: 'content',
    //   ntcReqRsnCtt: '0'
    // });

    if ( notice === 'true' ) {
      this._getHomeNotice(isLogin);
    }
  },

  /**
   * @function
   * @desc 홈화면 공지사항 redis 데이터 요청
   * @param isLogin
   * @return {void}
   * @private
   */
  _getHomeNotice: function (isLogin) {
    this._apiService.request(Tw.NODE_CMD.GET_HOME_NOTICE, {})
      .done($.proxy(this._successHomeNotice, this, isLogin))
      .fail($.proxy(this._failHomeNotice, this));
  },

  /**
   * @function
   * @desc 홈화면 긴급공지사항 redis 데이터 resp 처리
   * @param isLogin
   * @param resp
   * @return {void}
   * @private
   */
  _successHomeNotice: function (isLogin, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openEmrNotice(resp.result.emrNotice, isLogin);
    }
  },

  /**
   * @function
   * @desc 홈화면 긴급공지사항 redis 데이터 실패 처리
   * @param error
   * @private
   */
  _failHomeNotice: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 홈화면 긴급공지 이벤트 처리
   * @param $event
   * @param notice
   * @return {void}
   * @private
   */
  _onHiddenEventNotice: function ($event, notice) {
    setTimeout($.proxy(function () {
      this._openEmrNoticePopup(notice);
    }, this), 2000);
  },

  /**
   * @function
   * @desc 홈화면 긴급공지사항 데이터 파싱
   * @param notice
   * @return {void}
   * @private
   */
  _openEmrNotice: function (notice) {
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

  /**
   * @function
   * @desc 홈화면 긴급공지사항 팝업 오픈 여부 처리
   * @param notice
   * @param today
   * @returns {boolean}
   * @private
   */
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

  /**
   * @function
   * @desc 홈화면 긴급공지사항 팝업 오픈
   * @param notice
   * @private
   */
  _openEmrNoticePopup: function (notice) {
    this._popupService.open({
      'pop_name': 'type_tx_scroll',
      'title': notice.ntcTitNm,
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': notice.ntcCtt,
      'bt_b': this._makeBtnList(notice)
    }, $.proxy(this._onOpenNotice, this), null, 'mainAuto');
  },

  /**
   * @function
   * @desc 긴급공지 버튼 파싱
   * @param notice
   * @returns {*[]}
   * @private
   */
  _makeBtnList: function (notice) {
    var NOTI_POPUP_STYLE = {
      '0': 'tw-popup-closeBtn',
      '7': 'fe-bt-oneday',
      '10': 'fe-bt-week',
      '100': 'fe-bt-never'
    };

    if ( notice.ntcReqRsnCtt === '0' ) {
      return [{
        style_class: 'tw-popup-closeBtn bt-gray1 pos-left',
        txt: Tw.BUTTON_LABEL.CLOSE
      }];
    } else {
      return [{
        style_class: 'tw-popup-closeBtn bt-gray1 pos-left',
        txt: Tw.BUTTON_LABEL.CLOSE
      }, {
        style_class: 'bt-red1 pos-right ' + (NOTI_POPUP_STYLE[notice.ntcReqRsnCtt] || 'tw-popup-closeBtn'),
        txt: Tw.NOTI_POPUP_BTN[notice.ntcReqRsnCtt] || Tw.BUTTON_LABEL.CONFIRM
      }];
    }
  },

  /**
   * @function
   * @desc 긴급공지 팝업 오픈 callback
   * @param $popupContainer
   * @private
   */
  _onOpenNotice: function ($popupContainer) {
    $popupContainer.on('click', '.fe-bt-oneday', $.proxy(this._confirmNoticeOneday, this));
    $popupContainer.on('click', '.fe-bt-week', $.proxy(this._confirmNoticeWeek, this));
    $popupContainer.on('click', '.fe-bt-never', $.proxy(this._confirmNoticeNever, this));
  },

  /**
   * @function
   * @desc 긴급공지 오늘하루보지않기 처리
   * @private
   */
  _confirmNoticeOneday: function () {
    var today = new Date();
    this._setEmrNotice(today.setDate(today.getDate() + 1));
    this._popupService.close();
  },

  /**
   * @function
   * @desc 긴급공지 일주일보지않기 처리
   * @private
   */
  _confirmNoticeWeek: function () {
    var today = new Date();
    this._setEmrNotice(today.setDate(today.getDate() + 7));
    this._popupService.close();
  },

  /**
   * @function
   * @desc 긴급공지 다시보지않기 처리
   * @private
   */
  _confirmNoticeNever: function () {
    this._setEmrNotice();
    this._popupService.close();
  },

  /**
   * @function
   * @desc 읽은 긴급공지 저장 처리
   * @param time
   * @private
   */
  _setEmrNotice: function (time) {
    var store = {
      id: this._emrNotice.ntcId,
      time: time || ''
    };
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_EMR_NOTICE, JSON.stringify(store));
  },

  /**
   * @function
   * @desc 스마트카드 객체 변수 초기화
   * @private
   */
  _cachedSmartCard: function () {
    for ( var i = 0; i < 16; i++ ) {
      var $card = this.$container.find('.fe-smart-' + i);
      if ( $card.length > 0 ) {
        this.$elArrSmartCard.push($card);
        this.loadingStaus.push(false);
      }
    }
  },

  /**
   * @function
   * @desc 요금안내서 카드 데이터 요청
   * @param element
   * @private
   */
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

  /**
   * @function
   * @desc 요금안내서 카드 데이터 처리
   * @param element
   * @param resp
   * @private
   */
  _successBillData: function (element, resp) {
    var storeData = {
      data: resp,
      expired: Tw.DateHelper.add5min(new Date()),
      svcMgmtNum: this._svcMgmtNum
    };
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.HOME_BILL, JSON.stringify(storeData));

    this._drawBillData(element, resp);
  },

  /**
   * @function
   * @desc 요금안내서 카드 데이터 실패 처리
   * @param error
   * @private
   */
  _failBillData: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 요금안내서 카드 렌더링
   * @param element
   * @param resp
   * @private
   */
  _drawBillData: function (element, resp) {
    var result = this._parseBillData(resp);

    if ( !Tw.FormatHelper.isEmpty(result) ) {
      var $billTemp = $('#fe-smart-bill');
      var tplBillCard = Handlebars.compile($billTemp.html());
      element.html(tplBillCard(result));
      element.removeClass('empty');
      element.addClass('nogaps');
      element.on('click', '#fe-bt-payment', _.debounce($.proxy(this._onClickPayment, this), 500));
    } else {
      element.hide();
    }
    this._resetHeight();
  },

  /**
   * @function
   * @desc 요금안내서 카드 내 납부하기 버튼 클릭 처리
   * @param $event
   * @private
   */
  _onClickPayment: function ($event) {
    var svcAttrCd = $($event.currentTarget).data('svcattrcd');
    new Tw.MyTFareBill(this.$container, svcAttrCd, $($event.currentTarget));
  },

  /**
   * @function
   * @desc 요금안내서 데이터 파싱
   * @param billData
   * @returns {*}
   * @private
   */
  _parseBillData: function (billData) {
    if ( billData.code === Tw.API_CODE.BFF_0006 || billData.code === Tw.API_CODE.BFF_0011 ) {
      if ( billData.result.fallbackClCd === 'F0004' ) {
        // 대체문구 추후적용
        return null;
      } else {
        return null;
      }
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

  /**
   * @function
   * @desc 소액결제/콘텐츠 이용요금 카드 데이터 요청
   * @param element
   * @private
   */
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

  /**
   * @function
   * @desc 소액결제/콘텐츠 이용요금 카드 데이터 처리
   * @param element
   * @param contentsResp
   * @param microResp
   * @private
   */
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

  /**
   * @function
   * @desc 소액결제/콘텐츠 이용요금 카드 데이터 요청 실패 처리
   * @param error
   * @private
   */
  _failMicroContentsData: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 소액결제/콘텐츠 이용요금 카드 렌더링
   * @param element
   * @param contentsResp
   * @param microResp
   * @private
   */
  _drawMicroContentsData: function (element, contentsResp, microResp) {
    var apiBlock = false;
    var result = {
      micro: 0,
      contents: 0,
      invEndDt: Tw.DateHelper.getShortDate(new Date()),
      invStartDt: Tw.DateHelper.getShortFirstDate(new Date())
    };
    if ( microResp.code === Tw.API_CODE.BFF_0006 || microResp.code === Tw.API_CODE.BFF_0011 ) {
      if ( microResp.result.fallbackClCd === 'F0004' ) {
        // 대체문구 추후적용
        apiBlock = true;
      } else {
        apiBlock = true;
      }
    } else if ( microResp.code === Tw.API_CODE.CODE_00 ) {
      result.micro = Tw.FormatHelper.addComma(microResp.result.totalSumPrice);
    }

    if ( contentsResp.code === Tw.API_CODE.BFF_0006 || contentsResp.code === Tw.API_CODE.BFF_0011 ) {
      if ( contentsResp.result.fallbackClCd === 'F0004' ) {
        // 대체문구 추후적용
        apiBlock = true;
      } else {
        apiBlock = true;
      }
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

  /**
   * @function
   * @desc 선물하기 카드 데이터 요청
   * @param element
   * @private
   */
  _getGiftData: function (element) {
    this._apiService.request(Tw.API_CMD.BFF_06_0015, {})
      .done($.proxy(this._successGiftData, this, element))
      .fail($.proxy(this._failGiftData, this));
  },

  /**
   * @function
   * @desc 선물하기 카드 데이터 처리
   * @param element
   * @param resp
   * @private
   */
  _successGiftData: function (element, resp) {
    if ( resp.code === Tw.API_CODE.BFF_0006 || resp.code === Tw.API_CODE.BFF_0011 ) {
      if ( resp.result.fallbackClCd === 'F0004' ) {
        // 대체문구 추후적용
        element.hide();
      } else {
        element.hide();
      }
    } else if ( resp.code === Tw.API_CODE.CODE_00 ) {
      // if ( new Date().getDate() === Tw.GIFT_BLOCK_USAGE ) {
      //   this._drawGiftData(element, {
      //     blockUsage: true
      //   }, resp);
      // } else {
      this._drawGiftData(element, this._parseGiftData(resp.result), resp);
      // }
    } else {
      this._drawGiftData(element, {
        sender: false
      }, resp);
    }
    this._resetHeight();
  },

  /**
   * @function
   * @desc 선물하기 카드 데이터 요청 실패 처리
   * @private
   */
  _failGiftData: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 선물하기 카드 렌더링
   * @param element
   * @param result
   * @param sender
   * @private
   */
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

  /**
   * @function
   * @desc 선물하기 카드 데이터 파싱
   * @param sender
   * @returns {{sender: boolean, dataGiftCnt: *, familyDataGiftCnt: *, familyMemberYn: boolean, goodFamilyMemberYn: boolean}}
   * @private
   */
  _parseGiftData: function (sender) {
    return {
      sender: true,
      dataGiftCnt: sender.dataGiftCnt,
      familyDataGiftCnt: sender.familyDataGiftCnt,
      familyMemberYn: sender.familyMemberYn === 'Y',
      goodFamilyMemberYn: sender.goodFamilyMemberYn === 'Y'
    };
  },

  /**
   * @function
   * @desc 선물하기 카드 잔여량 API 요청
   * @param reqCnt
   * @param element
   * @param $textBalance
   * @param $btBalance
   * @param $loading
   * @param $textError
   * @param $btGoGift
   * @param $textErrorBalance
   * @private
   */
  _getGiftBalance: function (reqCnt, element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance) {
    setTimeout($.proxy(function () {
      this._apiService.request(Tw.API_CMD.BFF_06_0014, { reqCnt: reqCnt })
        .done($.proxy(this._successGiftRemain, this, element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance))
        .fail($.proxy(this._failGiftRemain, this));
    }, this), 3000);

  },

  /**
   * @function
   * @desc 선물하기 카드 잔여량 데이터 처리
   * @param element
   * @param $textBalance
   * @param $btBalance
   * @param $loading
   * @param $textError
   * @param $btGoGift
   * @param $textErrorBalance
   * @param resp
   * @private
   */
  _successGiftRemain: function (element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance, resp) {
    if ( resp.code === Tw.API_CODE.BFF_0006 || resp.code === Tw.API_CODE.BFF_0011 ) {
      if ( resp.result.fallbackClCd === 'F0004' ) {
        // 대체문구 추후적용
        element.hide();
      } else {
        element.hide();
      }
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

  /**
   * @function
   * @desc 선물하기 카드 잔여량 실패 처리
   * @param error
   * @private
   */
  _failGiftRemain: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 선물하기 카드 내 선물하기 버튼 클릭 처리
   * @param sender
   * @param $event
   * @private
   */
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

  /**
   * @function
   * @desc 선물하기 카드 내 조회하기 버튼 클릭 처리
   * @param element
   * @param $textBalance
   * @param $btBalance
   * @param $loading
   * @param $textError
   * @param $btGoGift
   * @param $textErrorBalance
   * @param $event
   * @private
   */
  _onClickGiftBalance: function (element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance, $event) {
    $event.preventDefault();
    $event.stopPropagation();

    $loading.parent().removeClass('none');
    $btBalance.parent().addClass('none');

    this._getGiftBalance(0, element, $textBalance, $btBalance, $loading, $textError, $btGoGift, $textErrorBalance);
  },

  /**
   * @function
   * @desc 충전하기 카드 데이터 요청
   * @param element
   * @private
   */
  _getRechargeData: function (element) {
    var $rechargeTemp = $('#fe-smart-recharge');
    var usageCode = $rechargeTemp.data('usagecode');

    if ( usageCode === Tw.API_CODE.BFF_0006 || usageCode === Tw.API_CODE.BFF_0011 ) {
      element.hide();
      this._resetHeight();
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0001, {})
        .done($.proxy(this._successRechargeData, this, $rechargeTemp, element))
        .fail($.proxy(this._failRechargeData, this));
    }
  },

  /**
   * @function
   * @desc 충전하기 카드 데이터 처리
   * @param $rechargeTemp
   * @param element
   * @param resp
   * @private
   */
  _successRechargeData: function ($rechargeTemp, element, resp) {
    if ( resp.code === Tw.API_CODE.BFF_0006 || resp.code === Tw.API_CODE.BFF_0011 ) {
      if ( resp.result.fallbackClCd === 'F0004' ) {
        // 대체문구 추후적용
        element.hide();
      } else {
        element.hide();
      }
    } else {
      var tplRechargeCard = Handlebars.compile($rechargeTemp.html());
      element.html(tplRechargeCard(this._parseRechargeData(resp)));
      element.removeClass('empty');
      element.addClass('nogaps');
      element.on('click', '#fe-bt-go-recharge', _.debounce($.proxy(this._onClickBtRecharge, this), 500));
    }
    this._resetHeight();
  },

  /**
   * @function
   * @desc 충천하기 카드 데이터 요청 실패 처리
   * @private
   */
  _failRechargeData: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 충천하기 카드 데이터 파싱
   * @param recharge
   * @returns {*}
   * @private
   */
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

  /**
   * @function
   * @desc 충전하기 카드 내 충전하기 버튼 클릭 처리
   * @param $event
   * @private
   */
  _onClickBtRecharge: function ($event) {
    $event.stopPropagation();
    new Tw.ImmediatelyRechargeLayer(this.$container, {
      pathUrl: '/main/home',
      targetBtn: $($event.currentTarget)
    });
  },

  /**
   * @function
   * @desc 스크롤 이동시 element가 존재하는지 판단
   * @param element
   * @returns {boolean}
   * @private
   */
  _elementScrolled: function (element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = element.offset().top;
    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
  },

  /**
   * @function
   * @desc 스마트 카드 lazy loading을 위한 스크롤 initialize
   * @private
   */
  _initScroll: function () {
    this._checkScroll();
    $(window).scroll($.proxy(function () {
      this._checkScroll();
    }, this));
  },

  /**
   * @function
   * @desc 스크롤 이동 체크
   * @private
   */
  _checkScroll: function () {
    _.map(this.$elArrSmartCard, $.proxy(function (card, index) {
      if ( this._elementScrolled(card) ) {
        this._initSmartCard(index);
      }
    }, this));
  },

  /**
   * @function
   * @desc 스크롤 이동된 스마크 카드 및 위/아래 데이터 요청
   * @param index
   * @private
   */
  _initSmartCard: function (index) {
    this._getSmartCard(index - 1);
    this._getSmartCard(index);
    this._getSmartCard(index + 1);
  },

  /**
   * @function
   * @desc 스마트 카드 데이터 요청
   * @param index
   * @private
   */
  _getSmartCard: function (index) {
    if ( index >= 0 && index < this.loadingStaus.length && !this.loadingStaus[index] ) {
      var cardNo = this.$elArrSmartCard[index].data('smartcard');
      this._drawSmartCard(cardNo, index);
      this.loadingStaus[index] = true;
    }
  },

  /**
   * @function
   * @desc 스마트 카드 분기 처리
   * @param cardNo
   * @param index
   * @private
   */
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

  /**
   * @function
   * @desc 컨테이너 높이 조정
   * @private
   */
  _resetHeight: function () {
    // 스와이프 사용시 필요
    // if ( Tw.BrowserHelper.isApp() ) {
    //   Tw.CommonHelper.resetHeight($('.home-slider .home-slider-belt')[0]);
    // }
  },

  /**
   * @function
   * @desc 홈화면 welcome message initialize
   * @private
   */
  _initWelcomeMsg: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(Tw.NTV_CMD.IS_APP_CREATED, { key: Tw.NTV_PAGE_KEY.HOME_WELCOME }, $.proxy(this._onAppCreated, this));
    } else {
      this._getWelcomeMsg();
    }
  },

  /**
   * @function
   * @desc App 최초 로딩인지 확인
   * @param resp
   * @private
   */
  _onAppCreated: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 && resp.params.value === 'Y' ) {
      this._getWelcomeMsg();
    }
  },

  /**
   * @function
   * @desc 홈화면 welcome message 요청
   * @private
   */
  _getWelcomeMsg: function () {
    this._apiService.request(Tw.NODE_CMD.GET_HOME_WELCOME, {})
      .done($.proxy(this._successWelcomeMsg, this))
      .fail($.proxy(this._failWelcomeMsg, this));
  },

  /**
   * @function
   * @desc 홈화면 welcome message 처리
   * @param resp
   * @private
   */
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

  /**
   * @function
   * @desc 홈화면 welcome message 실패 처리
   * @param error
   * @private
   */
  _failWelcomeMsg: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 홈화면 welcome message 읽은 메시지 분기 처리
   * @param list
   * @param resp
   * @private
   */
  _onHomeWelcomeForDraw: function (list, resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._handleDrawNoti(list, resp.params.value);
    } else {
      this._handleDrawNoti(list, '');
    }
  },

  /**
   * @function
   * @desc 홈화면 welcome message 나타낼 메시지 처리
   * @param list
   * @param nonShow
   * @private
   */
  _handleDrawNoti: function (list, nonShow) {
    this._welcomeList = this._filterShowMsg(list, nonShow);
    this._drawWelcomeMsg(this._welcomeList, nonShow);
  },

  /**
   * @function
   * @desc 홈화면 welcome message 게시기간 판단
   * @param list
   * @param nonShow
   * @returns {*}
   * @private
   */
  _filterShowMsg: function (list, nonShow) {
    return _.filter(list, $.proxy(function (msg) {
      var startTime = Tw.DateHelper.convDateFormat(msg.expsStaDtm).getTime();
      var endTime = Tw.DateHelper.convDateFormat(msg.expsEndDtm).getTime();
      var today = new Date().getTime();
      return (nonShow.indexOf(msg.wmsgId) === -1 && startTime < today && endTime > today);
      // return nonShow.indexOf(msg.wmsgId) === -1;
    }, this));
  },

  /**
   * @function
   * @desc 홈화면 welcome message 렌더링
   * @param list
   * @param nonShow
   * @private
   */
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

  /**
   * @function
   * @desc 홈화면 welcome message 삭제
   * @private
   */
  _closeNoti: function () {
    this.$welcomeEl.hide();
  },

  /**
   * @function
   * @desc 홈화면 welcome message 'x' 버튼 클릭 처리
   * @param nonShow
   * @private
   */
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

  /**
   * @function
   * @desc 홈화면 welcome message 클릭 처리
   * @param noti
   * @param nonShow
   * @private
   */
  _onClickGoNoti: function (noti, nonShow) {
    if ( noti.linkTrgtClCd === '1' ) {
      this._onClickCloseNoti(nonShow);
      this._historyService.goLoad(noti.linkUrl);
    } else if ( noti.linkTrgtClCd === '2' ) {
      this._onClickCloseNoti(nonShow);
      Tw.CommonHelper.openUrlExternal(noti.linkUrl);
    }
  },

  /**
   * @function
   * @desc 배너 initialize
   * @private
   */
  _setBanner: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._getTosAppBanner();
    } else {
      this._getTosWebBanner();
    }
  },

  /**
   * @function
   * @desc 토스 배너 정보 요청 (앱)
   * @private
   */
  _getTosAppBanner: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_BANNER_TOS, params: { code: '0001' } },
      { command: Tw.NODE_CMD.GET_BANNER_TOS, params: { code: '0002' } },
      { command: Tw.NODE_CMD.GET_BANNER_TOS, params: { code: '0003' } },
      { command: Tw.NODE_CMD.GET_BANNER_TOS, params: { code: '0007' } }
    ]).done($.proxy(this._successTosAppBanner, this))
      .fail($.proxy(this._failTosAppBanner, this));
  },

  /**
   * @function
   * @desc 토스 배너 정보 요청 (웹)
   * @private
   */
  _getTosWebBanner: function () {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_TOS, { code: '0005' })
      .done($.proxy(this._successTosWebBanner, this))
      .fail($.proxy(this._failTosWebBanner, this));
  },

  /**
   * @function
   * @desc 토스 배너 처리 (앱)
   * @param banner1
   * @param banner2
   * @param banner3
   * @param banner7
   * @private
   */
  _successTosAppBanner: function (banner1, banner2, banner3, banner7) {
    var result = [{ target: '1', banner: banner1 },
      { target: '2', banner: banner2 },
      { target: '3', banner: banner3 },
      { target: '7', banner: banner7 }];
    this._drawBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 실패 처리 (앱)
   * @param error
   * @private
   */
  _failTosAppBanner: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 토스 배너 처리 (웹)
   * @param resp
   * @private
   */
  _successTosWebBanner: function (resp) {
    this._drawBanner([{ target: '5', banner: resp }]);
  },

  /**
   * @function
   * @desc 토스 배너 실패 처리 (웹)
   * @param error
   * @private
   */
  _failTosWebBanner: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
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

  /**
   * @function
   * @desc 토스 배너 게시 여부 결정
   * @param tosBanner
   * @param target
   * @returns {boolean}
   * @private
   */
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

  /**
   * @function
   * @desc 어드민 배너 정보 요청
   * @param adminList
   * @private
   */
  _getAdminBanner: function (adminList) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: this._menuId })
      .done($.proxy(this._successBanner, this, adminList))
      .fail($.proxy(this._failBanner, this));
  },

  /**
   * @function
   * @desc 어드민 배너 처리
   * @param adminList
   * @param resp
   * @private
   */
  _successBanner: function (adminList, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      _.map(adminList, $.proxy(function (target) {
        var banner = _.filter(resp.result.banners, function (banner) {
          return banner.bnnrLocCd === target.target;
        }).map(function (target) {
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

  /**
   * @function
   * @desc 어드민 배너 요청 실패 처리
   * @param error
   * @private
   */
  _failBanner: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 배너 렌더링 성공 callback
   * @private
   */
  _successDrawBanner: function () {
    // this._resetHeight();
  },

  /**
   * @function
   * @desc 바로가기 메뉴 요청
   * @param isLogin
   * @private
   */
  _getQuickMenu: function (isLogin) {
    this._apiService.request(Tw.NODE_CMD.GET_QUICK_MENU, {})
      .done($.proxy(this._successQuickMenu, this, isLogin))
      .fail($.proxy(this._failQuickMenu, this));
  },

  /**
   * @function
   * @desc 바로가기 메뉴 요청 처리
   * @param isLogin
   * @param resp
   * @private
   */
  _successQuickMenu: function (isLogin, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._drawQuickMenu(resp.result, isLogin);
    }
  },

  /**
   * @function
   * @desc 바로가기 메뉴 요청 실패 처리
   * @param error
   * @private
   */
  _failQuickMenu: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 바로가기 메뉴 렌더링
   * @param quickMenu
   * @param isLogin
   * @private
   */
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

  /**
   * @function
   * @desc 바로가기 메뉴 파싱
   * @param quickMenu
   * @returns {Array}
   * @private
   */
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

  /**
   * @function
   * @desc 바로가기 편집하기 클릭 처리
   * @param list
   * @private
   */
  _onClickQuickEdit: function (list, $event) {
    var quickEdit = new Tw.QuickMenuEditComponent();
    var $target = $($event.currentTarget);
    quickEdit.open(list, $.proxy(this._onChangeQuickMenu, this), $target);
  },

  /**
   * @function
   * @desc 바로가기 편집 완료 callback
   * @private
   */
  _onChangeQuickMenu: function () {
    this._getQuickMenu(true);
  },

  /**
   * @function
   * @desc 코치마크 처리
   * @private
   */
  _setCoachMark: function () {
    new Tw.CoachMark(this.$container, '.fe-coach-line', '.fe-coach-line-target', Tw.NTV_STORAGE.COACH_LINE);
    new Tw.CoachMark(this.$container, '#fe-coach-data', '.fe-coach-data-target', Tw.NTV_STORAGE.COACH_DATA);
  },

  /**
   * @function
   * @desc 스와이프 슬라이드 변경 callback
   * @param currentSlider
   * @private
   */
  _onChangeSlider: function (currentSlider) {
    Tw.Logger.info('[Home Slider] change', currentSlider);
    if ( currentSlider === 0 ) {
      this._historyService.replaceURL('#');
    } else {
      this._historyService.replaceURL('#store');
    }
  },

  /**
   * @function
   * @desc 홈화면 lazy rendering 처리
   * @private
   */
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