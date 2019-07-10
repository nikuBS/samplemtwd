/**
 * @file 상품 > 모바일요금제 > 가입 > Data 인피니티
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-09
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면ID
 * @param sktProdBenfCtt - SKT만의 혜택
 * @param isOverPayReqYn - 초과사용량 조회 가능 여부
 * @param isComparePlanYn - 비교하기 요금제 여부
 * @param watchInfo - 보유 스마트워치 회선 정보
 */
Tw.ProductMobileplanJoinTplan = function(rootEl, prodId, displayId, sktProdBenfCtt, isOverPayReqYn, isComparePlanYn, watchInfo) {
  // 컨테이너 레이어 선언
  this.$container = rootEl;

  // 공통 모듈 선언
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  // 공통 변수 선언
  this._prodId = prodId;
  this._displayId = displayId;
  this._isOverPayReq = isOverPayReqYn === 'Y';
  this._isComparePlan = isComparePlanYn === 'Y';
  this._sktProdBenfCtt = window.unescape(sktProdBenfCtt);
  this._watchInfo = Tw.FormatHelper.isEmpty(watchInfo) ? null : JSON.parse(watchInfo);
  this._isSetOverPayReq = false;
  this._overpayRetryCnt = 0;
  this._smartWatchLine = null;
  this._smartWatchLineNumber = null;

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();

  // 최초 동작
  this._init();
};

Tw.ProductMobileplanJoinTplan.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    if (this._historyService.isBack()) {
      this._historyService.goBack();
    }
  },

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._reqOverpay, this), 500));
  },

  /**
   * @function
   * @desc 설정 완료 버튼 토글
   * @param e - 옵션 선택 Radio change Event
   * @returns {*|*|boolean}
   */
  _enableSetupButton: function(e) {
    if ($(e.currentTarget).val() === 'NA00006116') {
      return this._selectSmartWatchItem();
    } else {
      this._smartWatchLine = null;
    }

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  /**
   * @function
   * @desc 스마트워치 회선 선택 분기처리
   */
  _selectSmartWatchItem: function() {
    this._isDisableSmartWatchLineInfo = false;
    this._smartWatchLine = null;
    this._smartWatchLineNumber = null;

    // 보유한 스마트워치 회선이 없을 때
    if (this._watchInfo.watchCase === 'C' || this._watchInfo.watchSvcList.length < 1) {
      return this._popupService.openConfirmButton(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A73.TITLE,
        $.proxy(this._enableSmartWatchLineInfo, this), $.proxy(this._procClearSmartWatchLineInfo, this), Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    }

    // 보유한 스마트워치 회선이 2개 이상 있을 때
    if (this._watchInfo.watchCase === 'B' && this._watchInfo.watchSvcList.length > 1) {
      return this._openSmartWatchLineSelectPopup();
    }

    // A; 스마트워치 결합된 회선이 있을 경우
    if (this._watchInfo.watchCase === 'A') {
      return true;
    }

    this._smartWatchLine = this._watchInfo.watchSvcList[0].watchSvcMgmtNum;
    this._smartWatchLineNumber = Tw.FormatHelper.conTelFormatWithDash(this._watchInfo.watchSvcList[0].watchSvcNumMask);
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    return true;
  },

  /**
   * @function
   * @desc 스마트워치 회선 없을 때, 옵션 선택 및 예 선택 했을 때
   */
  _enableSmartWatchLineInfo: function() {
    this._isDisableSmartWatchLineInfo = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 스마트워치 회선 없을 때, 옵션 선택 및 아니오 선택 했을 때
   */
  _procClearSmartWatchLineInfo: function() {
    if (this._isDisableSmartWatchLineInfo) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
      return;
    }

    this._clearSelectItem();
  },

  /**
   * @function
   * @desc 보유한 스마트워치 회선이 2개 이상일 떄
   */
  _openSmartWatchLineSelectPopup: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'title': Tw.POPUP_TITLE.TPLAN_SMARTWATCH,
          'list': this._watchInfo.watchSvcList.map($.proxy(this._getSmartWatchLineList, this))
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindSmartWatchLineSelectPopup, this), null, 'select_smart_watch_line_pop');
  },

  /**
   * @function
   * @desc 보유 스마트워치 회선 목록 데이터 변환
   * @param item - 스마트워치 회선
   * @param idx - 인덱스 키
   */
  _getSmartWatchLineList: function(item, idx) {
    return {
      'label-attr': 'id="ra' + idx + '"',
      'txt': Tw.FormatHelper.conTelFormatWithDash(item.watchSvcNumMask),
      'radio-attr': 'id="ra' + idx + '" data-num="' + item.watchSvcMgmtNum + '"' +
        ' data-svcnum="' + item.watchSvcNumMask + '" ' + (this._smartWatchLine === item.watchSvcMgmtNum ? 'checked' : '')
    };
  },

  /**
   * @function
   * @desc 스마트워치 선택 액션시트 팝업 이벤트 바인딩
   * @param $popupContainer - 액션시트 팝업 레이어
   */
  _bindSmartWatchLineSelectPopup: function($popupContainer) {
    $popupContainer.on('click', '[data-num]', $.proxy(this._setSmartWatchLine, this));
  },

  /**
   * @function
   * @desc 스마트워치 회선 선택 팝업에서 클릭 시
   * @param e - 클릭 이벤트
   */
  _setSmartWatchLine: function(e) {
    this._smartWatchLine = $(e.currentTarget).data('num');
    this._smartWatchLineNumber = $(e.currentTarget).data('svcnum');
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    this._popupService.close();
  },

  /**
   * @function
   * @desc 옵션 선택 초기화
   */
  _clearSelectItem: function() {
    var $elem = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    $elem.prop('checked', false);
    $elem.parents('.radiobox').removeClass('checked').attr('aria-checked', 'false');

    this.$btnSetupOk.attr('disabled');
    this.$btnSetupOk.prop('disabled', true);
  },

  /**
   * @function
   * @desc 정보확인 데이터 변환
   * @param result - 정보확인 데이터
   * @returns {any | this | {isOverpayResult}}
   */
  _convConfirmOptions: function(result) {
    this._confirmOptions = Tw.ProductHelper.convPlansJoinTermInfo(result);

    $.extend(this._confirmOptions, {
      svcNumMask: Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask),
      svcProdNm: this._confirmOptions.preinfo.frProdInfo.prodNm,
      svcProdBasFeeInfo: this._confirmOptions.preinfo.frProdInfo.basFeeInfo,
      toProdName: this._confirmOptions.preinfo.toProdInfo.prodNm,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.toProdInfo.basFeeInfo && !this._confirmOptions.preinfo.toProdInfo.basFeeInfo.isNaN,
      toProdBasFeeInfo: this._confirmOptions.preinfo.toProdInfo.basFeeInfo && this._confirmOptions.preinfo.toProdInfo.basFeeInfo.value,
      toProdDesc: this._sktProdBenfCtt,
      isJoinTermProducts: Tw.IGNORE_JOINTERM.indexOf(this._prodId) === -1,
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      autoJoinBenefitList: this._confirmOptions.preinfo.toProdInfo.chgSktProdBenfCtt,
      autoTermBenefitList: this._confirmOptions.preinfo.frProdInfo.chgSktProdBenfCtt,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0 ||
        this._confirmOptions.installmentAgreement.isInstallAgreement),
      isInstallmentAgreement: this._confirmOptions.installmentAgreement.isInstallAgreement,
      isMobilePlan: true,
      isNoticeList: true,
      isComparePlan: this._isComparePlan,
      noticeList: $.merge(this._confirmOptions.preinfo.termNoticeList, this._confirmOptions.preinfo.joinNoticeList),
      joinTypeText: Tw.PRODUCT_TYPE_NM.CHANGE,
      typeText: Tw.PRODUCT_CTG_NM.PLANS,
      confirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A2,
      downgrade: this._getDowngrade(),
      settingSummaryTexts: [{
        spanClass: 'val',
        text: this.$container.find('.widget-box.radio input[type="radio"]:checked').parent().find('.mtext').text()
      }]
    });

    return this._confirmOptions;
  },

  /**
   * @function
   * @desc DG 방어 메세지 처리
   * @returns {null|{isHtml: boolean, guidMsgCtt: *}}
   */
  _getDowngrade: function() {
    if (Tw.FormatHelper.isEmpty(this._confirmOptions.downgrade) || Tw.FormatHelper.isEmpty(this._confirmOptions.downgrade.guidMsgCtt)) {
      return null;
    }

    return {
      isHtml: this._confirmOptions.downgrade.htmlMsgYn === 'Y',
      guidMsgCtt: this._confirmOptions.downgrade.guidMsgCtt
    };
  },

  /**
   * @function
   * @desc 초과사용량 조회 API 요청
   * @returns {*|void}
   */
  _reqOverpay: function() {
    if (this._overpayRetryCnt > 2) {
      this._confirmOptions = $.extend(this._confirmOptions, {isOverPayError: true});
      return this._procConfirm();
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._overpayRetryCnt++;
    this._isSetOverPayReq = true;
    this._apiService.request(Tw.API_CMD.BFF_10_0010)
      .done($.proxy(this._resOverpay, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @param resp - 초과사용량 조회 API 응답 처리
   * @returns {*|*|void}
   */
  _resOverpay: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (['ZEQPN0002', 'ZORDN3598'].indexOf(resp.code) !== -1 && this._overpayRetryCnt < 3) { // 최대 3회까지 재조회 시도
      this._isSetOverPayReq = false;
      return this._reqOverpay();
    }

    var overpayResults = {
      isOverpayResult: resp.code === Tw.API_CODE.CODE_00
    };

    if (overpayResults.isOverpayResult) {
      var isDataOvrAmt = parseFloat(resp.result.dataOvrAmt) > 0,
        isVoiceOvrAmt = parseFloat(resp.result.voiceOvrAmt) > 0,
        isSmsOvrAmt = parseFloat(resp.result.smsOvrAmt) > 0;

      if (!isDataOvrAmt && !isVoiceOvrAmt && !isSmsOvrAmt) {
        overpayResults.isOverpayResult = false;
      } else {
        var convDataAmt = Tw.ProductHelper.convDataAmtIfAndBas(resp.result.dataIfAmt, resp.result.dataBasAmt);

        overpayResults = $.extend(overpayResults, {
          isDataOvrAmt: isDataOvrAmt,
          isVoiceOvrAmt: isVoiceOvrAmt,
          isSmsOvrAmt: isSmsOvrAmt,
          dataIfAmt: Tw.FormatHelper.addComma(convDataAmt.dataIfAmt) + convDataAmt.unit,
          dataBasAmt: Tw.FormatHelper.addComma(convDataAmt.dataBasAmt) + convDataAmt.unit,
          dataOvrAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.dataOvrAmt)),
          voiceIfAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.voiceIfAmt)),
          voiceBasAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.voiceBasAmt)),
          voiceOvrAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.voiceOvrAmt)),
          smsIfAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.smsIfAmt)),
          smsBasAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.smsBasAmt)),
          smsOvrAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.smsOvrAmt)),
          ovrTotAmt: Tw.FormatHelper.addComma(Math.ceil(resp.result.ovrTotAmt))
        });
      }
    }

    this._confirmOptions = $.extend(this._confirmOptions, {
      isOverpayResult: overpayResults.isOverpayResult,
      isOverPayError: !overpayResults.isOverpayResult && this._overpayRetryCnt > 2,
      overpay: overpayResults
    });

    this._procConfirm();
  },

  /**
   * @function
   * @desc 정보확인 API 요청
   */
  _procConfirm: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0008, {
      option: this.$container.find('.widget-box.radio input[type="radio"]:checked').val()
    }, {}, [this._prodId]).done($.proxy(this._procConfirmRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 정보확인 API 응답 값 처리 & 공통 정보확인 컴포넌트 실행
   * @param resp - 정보확인 API 응답 값
   * @returns {*}
   */
  _procConfirmRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    new Tw.ProductCommonConfirm(true, null, this._convConfirmOptions(resp.result), $.proxy(this._prodConfirmOk, this));
  },

  /**
   * @function
   * @desc 공통 정보확인 콜백 & 가입처리 API 요청
   */
  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    var optProdId = this.$container.find('.widget-box.radio input[type="radio"]:checked').val(),
      reqParams = {
        asgnNumList: [],
        optProdId: optProdId,
        svcProdGrpId: ''
      };

    if (!Tw.FormatHelper.isEmpty(this._smartWatchLine) && optProdId === 'NA00006116') {
      reqParams = $.extend(reqParams, {
        optWatchMgmtNum: this._smartWatchLine
      });
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0012, reqParams,
      {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 가입처리 API 응답 & 가입유도팝업 조회 API 요청
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');
    var fromProdId = this._confirmOptions.preinfo.frProdInfo.prodId, toProdId = this._prodId; 

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();

    //기존 가입중인 요금제 해지 메시지와 변경된 요금제 가입 메시지를 호출함.
    this._apiService.requestArray([
      {command: Tw.API_CMD.BFF_10_0038, params: {}, pathParams: [fromProdId]},
      {command: Tw.API_CMD.BFF_10_0038, params: {scrbTermCd: 'S'}, pathParams: [toProdId]}
    ]).done($.proxy(this._isVasTerm, this));
      
  },

  /**
   * @function
   * @desc 가입유도팝업 조회 API 응답 값 처리
   *        해지방어,가입유도 메시지가 존재하는지 확인후 해지방어 메시지가 존재하면 해지 방어 메시지를 팝업으로 출력함.
   * @param curResp - 해지방어팝업 조회 응답 API
   * @param newResp - 가입유도팝업 조회 응답 API 
   * @returns {*}
   */
  _isVasTerm: function(curResp, newResp) {
    var resps = [curResp, newResp].filter(function(res) {
      return res.code === Tw.API_CODE.CODE_00 && !Tw.FormatHelper.isEmpty(res.result);
    });
    
    if(resps.length < 1){
      this._isResultPop = true;
      return this._openSuccessPop();
    }

    this._openVasTermPopup(resps[0].result);
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   */
  _openSuccessPop: function() {
    if (!this._isResultPop) {
      return;
    }

    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    var completeData = {
      prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
      btList: [
        { link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }
      ],
      btClass: '',
      prodId: this._prodId,
      prodNm: this._confirmOptions.preinfo.toProdInfo.prodNm,
      typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
      isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
      basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
        this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
    };

    if ($checked.val() === 'NA00006116') {
      completeData = $.extend(completeData, {
        basicTxt: Tw.FormatHelper.isEmpty(this._smartWatchLineNumber) ? Tw.POPUP_CONTENTS.TPLAN_WATCH_NON_LINE :
          Tw.POPUP_CONTENTS.TPLAN_WATCH + this._smartWatchLineNumber,
        btList: [
          { link: '/product/callplan?prod_id=NA00005381', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.SMARTWATCH },
          { link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }
        ]
      });
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: completeData
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
    this._apiService.request(Tw.NODE_CMD.DELETE_SESSION_STORE, {});
  },

  /**
   * @function
   * @desc 완료팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 시
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
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
   * @desc 가입유도팝업 내 닫기 버튼 클릭 시
   */
  _closeAndOpenResultPopup: function() {
    this._isResultPop = true;
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
