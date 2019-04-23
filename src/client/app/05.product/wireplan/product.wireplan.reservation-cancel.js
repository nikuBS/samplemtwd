/**
 * @file 상품 > 유선 부가서비스 > 예약 취소
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-02-12
 * @todo 개발은 완료 되었으나 Spec-out 되어 미사용 중
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param confirmOptions - 정보확인 데이터
 * @param currentAdditionsInfo - 현재 부가서비스 데이터
 */
Tw.ProductWireplanReservationCancel = function(rootEl, prodId, confirmOptions, currentAdditionsInfo) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));
  this._currentAdditionsInfo = JSON.parse(window.unescape(currentAdditionsInfo));
  this._isJoinCancel = this._currentAdditionsInfo.scrbTermClCd === '01';

  this._convConfirmOptions();
  this._bindEvent();
};

Tw.ProductWireplanReservationCancel.prototype = {

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._getJoinConfirmContext, this));
  },

  /**
   * @function
   * @desc 정보확인 hbs GET
   */
  _getJoinConfirmContext: function() {
    $.get(Tw.Environment.cdn + '/hbs/product_wireplan_confirm.hbs', $.proxy(this._setConfirmBodyIntoContainer, this));
  },

  /**
   * @function
   * @desc 정보확인 Context Compile
   * @param context - 정보확인 hbs Context
   */
  _setConfirmBodyIntoContainer: function(context) {
    var tmpl = Handlebars.compile(context),
      html = tmpl(this._confirmOptions);

    this.$container.html(html);
    this._callConfirmCommonJs();
    Tw.Tooltip.separateMultiInit(this.$container);
  },

  /**
   * @function
   * @desc 정보확인 데이터 변환
   */
  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      isTerm: !this._isJoinCancel,
      isWireplan: true,
      isNoticeList: true,
      title: this._isJoinCancel ? Tw.RESERVATION_CANCEL.JOIN : Tw.RESERVATION_CANCEL.TERMINATE,
      applyBtnText: Tw.BUTTON_LABEL.TERMINATE,
      joinTypeText: Tw.PRODUCT_TYPE_NM.TERMINATE,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: this._confirmOptions.preinfo.svcNumMask,
      svcNickname: Tw.SVC_CD[this._confirmOptions.preinfo.svcCd],
      isAgreement: this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.isTermStplAgree,
      iconClass: this._getIcon()
    });
  },

  /**
   * @function
   * @desc 정보확인 팝업 내 아이콘 분기처리
   * @returns {string}
   */
  _getIcon: function() {
    if (this._confirmOptions.preinfo.reqProdInfo.svcCd === 'P') {
      return 'ico-type1';
    }

    return 'ico-type1';
  },

  /**
   * @function
   * @desc 공통 정보확인 컴포넌트 실행 (isPopup false)
   */
  _callConfirmCommonJs: function() {
    new Tw.ProductCommonConfirm(
      false,
      this.$container,
      $.extend(this._confirmOptions, {
        confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A4,
        isWireplan: true,
        noticeList: this._confirmOptions.noticeList,
        isTerm: !this._isJoinCancel,
        isWidgetInit: true
      }),
      $.proxy(this._prodConfirmOk, this)
    );
  },

  /**
   * @function
   * @desc 예약 취소 API 요청
   * @param callbackParams - 콜백 파라미터
   */
  _prodConfirmOk: function(callbackParams) {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService
      .request(
        Tw.API_CMD.BFF_10_0138,
        {
          addInfoExistYn: this._currentAdditionsInfo.btnData.addInfoExistYn,
          addInfoRelScrnId: this._currentAdditionsInfo.btnData.addInfoRelScrnId,
          addSvcAddYn: this._currentAdditionsInfo.btnData.addSvcAddYn,
          serNum: this._currentAdditionsInfo.btnData.serNum,
          cntcPlcInfoRgstYn: this._currentAdditionsInfo.btnData.cntcPlcInfoRgstYn,
          svcProdGrpCd: this._currentAdditionsInfo.btnData.svcProdGrpCd,
          termRsnCd: callbackParams.termRsnCd
        },
        {},
        [this._prodId]
      )
      .done($.proxy(this._procTerminateRes, this));
  },

  /**
   * @function
   * @desc API 응답 처리
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procTerminateRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0038, {}, {}, [this._prodId]).done($.proxy(this._isVasTerm, this));
  },

  /**
   * @function
   * @desc 가입유도팝업 여부 API 응답 값
   * @param resp - API 응답 값
   * @returns {*}
   */
  _isVasTerm: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      this._isResultPop = true;
      return this._openSuccessPop();
    }

    this._openVasTermPopup(resp.result);
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   */
  _openSuccessPop: function() {
    if (!this._isResultPop) {
      return;
    }

    this._popupService.open(
      {
        hbs: 'complete_product',
        data: {
          btList: [{ link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
          btClass: 'item-one',
          prodId: this._prodId,
          prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
          typeNm: Tw.PRODUCT_TYPE_NM.TERMINATE,
          isBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
          basFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo ?
            this._confirmOptions.preinfo.reqProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
        }
      },
      $.proxy(this._openResPopupEvent, this),
      $.proxy(this._onClosePop, this),
      'terminate_success'
    );
  },

  /**
   * @function
   * @desc 완료팝업 이벤트 바인딩
   * @param $popupContainer - 완료팝업 컨테이너 레이어
   */
  _openResPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료팝업내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 가입유도팝업 실행
   * @param respResult - 가입유도팝업 데이터
   */
  _openVasTermPopup: function(respResult) {
    var popupOptions = {
      hbs: 'MV_01_02_02_01',
      bt: [
        {
          style_class: 'unique fe-btn_back',
          txt: Tw.BUTTON_LABEL.CLOSE
        }
      ]
    };

    if (respResult.prodTmsgTypCd === 'H') {
      popupOptions = $.extend(popupOptions, {
        editor_html: Tw.CommonHelper.replaceCdnUrl(respResult.prodTmsgHtmlCtt)
      });
    }

    if (respResult.prodTmsgTypCd === 'I') {
      popupOptions = $.extend(popupOptions, {
        img_url: respResult.rgstImgUrl,
        img_src: Tw.Environment.cdn + respResult.imgFilePathNm
      });
    }

    this._isResultPop = true;
    this._popupService.open(popupOptions, $.proxy(this._bindVasTermPopupEvent, this), $.proxy(this._openSuccessPop, this), 'vasterm_pop');
  },

  /**
   * @function
   * @desc 가입유도팝업 이벤트 바인딩
   * @param $popupContainer - 팝업 컨테이너 레이어
   */
  _bindVasTermPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 팝업 내 닫기 버튼 클릭 시
   */
  _closeAndOpenResultPopup: function() {
    this._isResultPop = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료 팝업 내 닫기 버튼 클릭 시
   */
  _closePop: function() {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 팝업 종료 시
   */
  _onClosePop: function() {
    this._historyService.goBack();
  }
};
