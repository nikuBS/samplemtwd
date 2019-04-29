/**
 * @file benefit.dis-pgm.input.js
 * @author Kim In Hwan (skt.P132150@partner.sk.com)
 * @since 2018.12.18
 */
/**
 * @class
 * @desc 혜택할인 > 상품상세 > 무약정 가입
 * @param {JSON} params
 */
Tw.BenefitDisPgmInput = function (rootEl, prodId, confirmOptions, selType) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));
  this._selType = selType; // 선택약정

  this._init();
};

Tw.BenefitDisPgmInput.prototype = {
  /**
   * @function
   * @desc 초기설정
   */
  _init: function () {
    if ( this._selType ) {
      var data = {};
      var curDate = new Date();
      var nextDate_1 = new Date(curDate.getFullYear() + 1, curDate.getMonth(), curDate.getDate() - 1);
      var nextDate_2 = new Date(curDate.getFullYear() + 2, curDate.getMonth(), curDate.getDate() - 1);
      data.monthDetail = {
        'M0012': Tw.DateHelper.getShortDate(curDate) + ' ~ ' + Tw.DateHelper.getShortDate(nextDate_1),
        'M0024': Tw.DateHelper.getShortDate(curDate) + ' ~ ' + Tw.DateHelper.getShortDate(nextDate_2)
      };
      data.monthCode = { 'M0012': '12', 'M0024': '24' };
      $.extend(this._confirmOptions, data);
    } else {
      $(window).on('hashchange', $.proxy(this._onHashChange, this));
    }
    this._convConfirmOptions();
    this._bindEvent();
  },
  /**
   * @function
   * @desc 바인드 이벤트
   */
  _bindEvent: function () {
    // window 'env' 이벤트 발생시 페이지를 팝업으로 호출 - 상품 쪽과 동일
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._callConfirmCommonJs, this));
  },
  /**
   * @function
   * @desc 정보확인 공통 실행
   */
  _convConfirmOptions: function () {
    this._confirmOptions = $.extend(this._confirmOptions, {
      title: Tw.PRODUCT_TYPE_NM.JOIN,
      applyBtnText: Tw.BUTTON_LABEL.JOIN,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.DISCOUNT_PROGRAM,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0),
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1
    });
  },
  /**
   * @function
   * @desc 공통 정보확인 컴포넌트 호출 (isPopup false)
   */
  _callConfirmCommonJs: function () {
    var options = $.extend(this._confirmOptions, {
      isSelectedProgram: true,
      isContractPlan: this._confirmOptions.isContractPlan,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      setInfo: 'set-info',
      setInfoProdId: this._prodId,
      isTerm: false,
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A3,
      isNoticeList: true,
      isMobilePlan: false,
      isDiscountPgm: true
    });

    if ( this._selType ) {
      options.selType = this._selType;
      options.settingSummaryTexts = [
        {
          spanClass: 'term',
          text: this._confirmOptions.monthCode[this._selType] + Tw.DATE_UNIT.MONTH
        },
        {
          spanClass: 'date',
          text: this._confirmOptions.monthDetail[this._selType]
        }];
    }
    new Tw.ProductCommonConfirm(true, this.$container, options, $.proxy(this._prodConfirmOk, this));
  },
  /**
   * @function
   * @desc 정보확인 콜백 시
   */
  _prodConfirmOk: function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    if ( this._selType ) {
      this._apiService.request(Tw.API_CMD.BFF_10_0063, {
        svcAgrmtPrdCd: this._selType
      }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
        .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
    }
    else {
      this._apiService.request(Tw.API_CMD.BFF_10_0035, {
        addCd: '2'
      }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
        .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
    }
  },
  /**
   * @function
   * @desc 가입하기 API 응답 처리
   * @param resp - API 응답 값 확인 및 가입유도팝업 조회 API 요청
   */
  _procJoinRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      return Tw.Error(resp.code, resp.msg).pop();
    }
    // DV001-16396 timer 삭제
    this._openSuccessPop();
  },
  /**
   * @function
   * @desc 완료 팝업 실행
   */
  _openSuccessPop: function () {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.DISCOUNT_PROGRAM,
        btList: [{ link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo ?
          this._confirmOptions.preinfo.reqProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), null , 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },
  /**
   * @function
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindJoinResPopup: function ($popupContainer) {
    $popupContainer.on('click','.btn-floating.tw-popup-closeBtn', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));

  },
  /**
   * @function
   * @desc 완료 팝업 내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function (e) {
    $(window).off('hashchange', $.proxy(this._onHashChange, this));
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },
  /**
   * @function
   * @desc 완료 팝업 내 닫기 버튼 클릭 시
   */
  _closePop: function () {
    this._historyService.replaceURL('/product/callplan?prod_id='+this._prodId);
    this._popupService.closeAllAndGo('/product/callplan?prod_id='+this._prodId);
  },
  /**
   * @function
   * @desc hash 변경 시 호출
   * @param {JSON} hash
   */
  _onHashChange: function (e) {
    // join_confirm 팝업에서 back key로 이동시 강제로 back
    if ( e.originalEvent.oldURL.endsWith('join_success_P') ) {
      this._historyService.goBack();
    }
    else if ( location.hash === '') {
      this._historyService.goBack();
    }
  }
};

