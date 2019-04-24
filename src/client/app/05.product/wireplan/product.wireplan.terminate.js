/**
 * @file 상품 > 유선 부가서비스 > 해지
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-22
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param confirmOptions - 정보확인 데이터
 * @param btnData - 버튼 데이터
 */
Tw.ProductWireplanTerminate = function(rootEl, prodId, confirmOptions, btnData) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._prodId = prodId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));
  this._btnData = JSON.parse(window.unescape(btnData));

  this._convConfirmOptions();
  this._bindEvent();
};

Tw.ProductWireplanTerminate.prototype = {

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
   * @desc 정보확인 hbs Compile
   * @param context - hbs Context
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
      pageId: 'M000434',
      isTerm: true,
      isWireplan: true,
      isNoticeList: true,
      title: Tw.PRODUCT_TYPE_NM.TERMINATE,
      applyBtnText: Tw.BUTTON_LABEL.TERMINATE,
      joinTypeText: Tw.PRODUCT_TYPE_NM.TERMINATE,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: this._confirmOptions.preinfo.reqProdInfo.svcCd === 'P' ?
        Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask) : this._confirmOptions.preinfo.svcNumMask,
      svcNickname: Tw.SVC_CD[this._confirmOptions.preinfo.reqProdInfo.svcCd],
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
      return 'ico-type2';
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
        isTerm: true,
        isWidgetInit: true
      }),
      $.proxy(this._prodConfirmOk, this)
    );
  },

  /**
   * @function
   * @desc 정보확인 콜백시 해지 API 요청
   * @param callbackParams - 정보확인 콜백 데이터
   */
  _prodConfirmOk: function(callbackParams) {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService
      .request(
        Tw.API_CMD.BFF_10_0100,
        {
          addInfoExistYn: this._btnData.addInfoExistYn,
          addInfoRelScrnId: this._btnData.addInfoRelScrnId,
          addSvcAddYn: this._btnData.addSvcAddYn,
          serNum: '',
          cntcPlcInfoRgstYn: this._btnData.cntcPlcInfoRgstYn,
          svcProdGrpCd: this._btnData.svcProdGrpCd,
          termRsnCd: callbackParams.termRsnCd
        },
        {},
        [this._prodId]
      )
      .done($.proxy(this._procTerminateRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 해지 API 응답 처리
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
   * @desc 가입유도팝업 응답 처리
   * @param resp - 가입유도팝업 조회 API 응답 값
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
          prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
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
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 레이어
   */
  _openResPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 A 하이퍼링크 핸들링
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
   * @param $popupContainer - 가입유도팝업 레이어
   */
  _bindVasTermPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 가입유도팝업 레이어 닫기 버튼 클릭 시
   */
  _closeAndOpenResultPopup: function() {
    this._isResultPop = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료팝업 닫기 버튼 클릭 시
   */
  _closePop: function() {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료 팝업 종료 시
   */
  _onClosePop: function() {
    this._historyService.goBack();
  }
};
