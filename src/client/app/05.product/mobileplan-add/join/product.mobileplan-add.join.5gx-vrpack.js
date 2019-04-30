/**
 * @file 부가서비스 5gx vr pack
 * @author anklebreaker
 * @since 2019-04-05
 */

/**
 * @class
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 * @oaram {String} prodId 상품ID
 * @param {String} displayId 화면ID
 * @param {Object} confirmOptions 옵션
 */
Tw.ProductMobileplanAddJoin5gxVRpack = function (rootEl, prodId, displayId, confirmOptions) {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this.$container = rootEl;
  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));

  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();
};

Tw.ProductMobileplanAddJoin5gxVRpack.prototype = {

  /**
   * @member (String) 통합주소ID
   */
  _addressId: null,

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$inputDisabled = this.$container.find('.fe-input-disabled');
    this.$inputAddressZipcode = this.$container.find('.fe-address-zipcode');
    this.$inputAddressMain = this.$container.find('.fe-address-main');
    this.$inputAddressDetail = this.$container.find('.fe-address-detail');
    this.$btnSearchZipcode = this.$container.find('.fe-search-zipcode');

    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$btnSearchZipcode.on('click', $.proxy(this._onClickSearchZipcode, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirm, this), 500));
    this.$inputDisabled.on('focus', function() {
      $(this).trigger('blur');
    });
  },

  /**
   * @function
   * @desc 정보확인 데이터 변환
   * @param result - 정보확인 데이터
   * @returns {any | this | {isOverpayResult}}
   */
  _convConfirmOptions: function () {
    this._confirmOptions = $.extend(this._confirmOptions, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0)
    });
  },

  /**
   * @function
   * @desc 주소록 버튼 클릭
   * @param e - 클릭 이벤트
   */
  _onClickSearchZipcode: function (e) {
    new Tw.CommonPostcodeMain(this.$container, $(e.currentTarget), this._onSearchZipcode.bind(this));
  },

  /**
   * @function
   * @desc 주소록 콜백
   * @param data - response data
   */
  _onSearchZipcode: function (data) {
    this.$btnSetupOk.attr('disabled', false);

    this._apiService.request(Tw.API_CMD.BFF_10_0176, {
      basAddr: data.main,
      dtlAddr: data.detail,
      zip: data.zip
    })
    .done(function (res) {
      if (res.code !== '00') {
        Tw.Error('', Tw.ALERT_MSG_COMMON.SERVER_ERROR).pop();
        $.proxy(Tw.CommonHelper.endLoading('.container'), this);
        return;
      }
      this._addressId = res.result.integTxtAddrId;
      this.$inputAddressZipcode.val(data.zip);
      this.$inputAddressMain.val(data.main);
      this.$inputAddressDetail.val(data.detail);
      this.$btnSetupOk.attr('disabled', false);
    }.bind(this))
    .fail(function () {
      Tw.Error('', Tw.ALERT_MSG_COMMON.SERVER_ERROR).pop();
      $.proxy(Tw.CommonHelper.endLoading('.container'), this);
    }.bind(this));
  },

  /**
   * @function
   * @desc 설정완료 API 요청
   */
  _procConfirm: function () {
    new Tw.ProductCommonConfirm(true, null, $.extend(this._confirmOptions, {
      isMobilePlan: false,
      noticeList: this._confirmOptions.preinfo.joinNoticeList,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId]
      }]
    }), $.proxy(this._prodConfirmOk, this));
  },

  /**
   * @function
   * @desc 정보확인 공통 컴포넌트 콜백 & 가입 처리 API 요청
   */
  _prodConfirmOk: function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0018, {
      prodAddOpCtt1: this._addressId
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 가입 처리 API 응답
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procJoinRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_10_0038, {
      scrbTermCd: 'S'
    }, {}, [this._prodId]).done($.proxy(this._isVasTerm, this));
  },

  /**
   * @function
   * @desc 가입유도팝업 조회 API 응답 값
   * @param resp - API 응답 값
   * @returns {*}
   */
  _isVasTerm: function (resp) {
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
  _openSuccessPop: function () {
    if (!this._isResultPop) {
      return;
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN}],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
          this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  /**
   * @function
   * @desc 완료팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindJoinResPopup: function ($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료팝업내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 가입유도팝업 실행
   * @param respResult - 가입유도팝업 API 응답 값
   */
  _openVasTermPopup: function (respResult) {
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
   * @param $popupContainer - 가입유도팝업 컨테이너 레이어
   */
  _bindVasTermPopupEvent: function ($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 가입유도팝업 내 닫기 버튼 클릭 시
   */
  _closeAndOpenResultPopup: function () {
    this._isResultPop = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 가입유도팝업 내 닫기 버튼 클릭 시
   */
  _onClosePop: function () {
    this._historyService.goBack();
  }

};
