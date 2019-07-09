/**
 * @file 모바일 부가서비스 > 넘버플러스2
 * @author
 * @since 2019-07-04
 */

/**
 * @class
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 * @oaram {String} prodId 상품ID
 * @param {String} displayId 화면ID
 * @param {String} mobileplanId 요금제ID
 */
Tw.ProductMobileplanAddSettingNumberPlus2nd = function (rootEl, prodId, displayId, confirmOptions) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this.$container = rootEl;
  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));

  this._cachedElement();
  this._bindEvent();
};

Tw.ProductMobileplanAddSettingNumberPlus2nd.prototype = {

  /**
   * @member (Object)
   * @prop {Array} addlist 추가된 연락처 list
   */
  _data: {
    addList: []
  },

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    //this.$btnNativeContactList = this.$container.find('.fe-btn_native_contact');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-btn_del_num', $.proxy(this._delNum, this));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },

  /**
   * @function
   * @desc 회선 삭제 버튼 클릭 시
   * @param e - 회선 삭제 버튼 클릭 이벤트
   * @returns {*|void}
   */
  _delNum: function(e) {

    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A99.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A99.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A99.BUTTON, Tw.BUTTON_LABEL.CLOSE, null,
      $.proxy(this._delNumReq, this, $(e.currentTarget).data('svc_mgmt_num')));
  },

  /**
   * @function
   * @desc 회선 삭제 API 요청
   * @param svcMgmtNum - 서비스관리번호
   */
  _delNumReq: function(svcMgmtNum) {
    this._popupService.close();

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0022, {
      chldSvcMgmtNum: svcMgmtNum
    }, {}, [this._prodId]).done($.proxy(this._procTerminateRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
     
  },

  /**
   * @function
   * @desc 해지처리 API 응답 처리 & 가입유도팝업 조회 API 요청
   * @param resp - 해지처리 API 응답 값
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
   * @desc 가입유도팝업 조회 API 응답 값
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
   * @desc 가입유도팝업 실행
   * @param respResult - 가입유도팝업 API 응답 값
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
   * @param $popupContainer - 가입유도팝업 컨테이너 레이어
   */
  _bindVasTermPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 가입유도팝업 내 닫기버튼 클릭 시
   */
  _closeAndOpenResultPopup: function() {
    this._isResultPop = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료팝업 내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 완료팝업 실행
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
   * @desc 완료팝업 이벤트 바인딩
   * @param $popupContainer - 완료팝업 컨테이너 레이어
   */
  _openResPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 내 닫기버튼 클릭 시
   */
  _closePop: function() {
    //this._popupService.close();
  },

  /**
   * @function
   * @desc 회선 추가/삭제 API 응답 처리
   * @param resp - API 응답 값
   * @returns {*}
   */
  _onClosePop: function(resp) {

    this._historyService.replaceURL('/product/callplan?prod_id=' + this._prodId);
    Tw.CommonHelper.endLoading('.container');
  }
};
