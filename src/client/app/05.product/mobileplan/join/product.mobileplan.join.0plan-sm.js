/**
 * @file 상품 > 모바일요금제 > 가입 > 0플랜 스몰/미디엄
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-01-10
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품 코드
 * @param displayId - 화면 ID
 * @param sktProdBenfCtt - SKT만의 혜택
 * @param isOverPayReqYn - 초과 사용량 요청 API 성공 여부
 * @param useOptionProdId - 현재 사용중인 상품 코드 (Optional)
 * @param isComparePlanYn - 비교하기 데이터 존재 여부
 */
Tw.ProductMobileplanJoin0planSm = function(rootEl, prodId, displayId, sktProdBenfCtt, isOverPayReqYn, useOptionProdId, isComparePlanYn) {
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
  this._useOptionProdId = useOptionProdId;
  this._isSetOverPayReq = false;
  this._overpayRetryCnt = 0;
  this._startTime = null;
  this._confirmOptions = {};

  // Element 캐싱
  this._cachedElement();
  // 이벤트 바인딩
  this._bindEvent();
  // 최초 동작
  this._init();
};

Tw.ProductMobileplanJoin0planSm.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    // history back 으로 진입시에는 이전 페이지로 한번 더 bypass
    if (this._historyService.isBack()) {
      this._historyService.goBack();
    }
  },

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');  // 옵션 선택 Radio
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');  // 설정 완료 버튼
    this.$btnTimeSelect = this.$container.find('.fe-btn_time_select');  // 시간 설정 버튼
    this.$msg = this.$container.find('.fe-msg');  // 알림 메세지 영역
    this.$hour = this.$container.find('.fe-hour');  // 시간 노출 영역
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this)); // 옵션 선택 Radio 선택 시
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._reqOverpay, this), 500)); // 설정 완료 버튼 클릭 시
    this.$btnTimeSelect.on('click', $.proxy(this._openTimeSelectPop, this));  // 시간 설정 버튼 클릭 시
  },

  /**
   * @function
   * @desc - 설정완료 버튼 활성화 처리
   * @param e - 옵션 선택 Radio change 이벤트
   */
  _enableSetupButton: function(e) {
    // 매일3시간 선택 시, 영역 노출
    if ($(e.currentTarget).val() === 'NA00006163') {
      this.$btnTimeSelect.prop('disabled', false).removeAttr('disabled');
      this.$msg.removeClass('disabled');
    } else {
      this.$btnTimeSelect.prop('disabled', true).attr('disabled');
      this.$msg.addClass('disabled');
    }

    // 매일3시간 & 시간설정 미선택 상태
    if ($(e.currentTarget).val() === 'NA00006163' && Tw.FormatHelper.isEmpty(this._startTime)) {
      this.$btnSetupOk.prop('disabled', true).attr('disabled');
      return;
    }

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  /**
   * @function
   * @desc - 가입 정보확인 데이터 변환
   * @param result - 가입 정보확인 API 응답 값
   * @returns {any}
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
      settingSummaryTexts: [{
        spanClass: 'val',
        text: this.$container.find('.widget-box.radio input[type="radio"]:checked').parent().find('.mtext').text()
      }],
      downgrade: this._getDowngrade()
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
   * @desc 매일 3시간 시간설정 팝업 실행
   */
  _openTimeSelectPop: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data: [
        {
          'list': $.proxy(this._getTimeList, this)
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindTimePopup, this), null, 'select_time_select', this.$btnTimeSelect);
  },

  /**
   * @function
   * @desc 시간 목록 생성
   * @returns {Array}
   */
  _getTimeList: function() {
    var resultList = [];

    for(var i = 5; i <= 21; i++) {
      var strHour = (i < 10 ? '0' + i : i).toString();
      resultList.push({
        'label-attr': 'id="ra' + i + '"',
        'txt': strHour,
        'radio-attr': 'id="ra' + i + '" data-time="' + strHour + '" ' + (this._startTime === strHour ? 'checked' : '')
      });
    }

    return resultList;
  },

  /**
   * @function
   * @desc - 시간 설정 팝업 이벤트 바인딩
   * @param $popupContainer - 팝업 컨테이너 레이어
   */
  _bindTimePopup: function($popupContainer) {
    $popupContainer.on('click', '[data-time]', $.proxy(this._setTime, this));

    // 웹접근성 대응
    Tw.CommonHelper.focusOnActionSheet($popupContainer);
  },

  /**
   * @function
   * @desc - 시간 설정
   * @param e - 시간 설정 팝업 내 버튼 클릭 이벤트
   */
  _setTime: function(e) {
    var time = $(e.currentTarget).data('time').toString(),
      endTime = parseInt(time, 10) + 3;

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    this.$btnTimeSelect.html(time + ' ' + Tw.PERIOD_UNIT.HOUR + $('<div\>').append(this.$btnTimeSelect.find('.ico')).html());
    this.$hour.text(time + Tw.PERIOD_UNIT.HOUR + '~' + (endTime < 10 ? '0' + endTime : endTime) + Tw.PERIOD_UNIT.HOUR);

    this.$msg.show().attr('aria-hidden', 'false');
    this.$msg.removeClass('disabled');

    this._startTime = time;
    this._popupService.close();
  },

  /**
   * @function
   * @desc - 초과 사용량 조회 API
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
   * @desc 초과사용량 조회 API 응답
   * @param resp - API 응답 값
   * @returns {*|*|void}
   */
  _resOverpay: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    // 최대 3회까지 재시도 후 오류시 정보확인 레이어에서 대체 레이어를 노출한다.
    if (['ZEQPN0002', 'ZORDN3598'].indexOf(resp.code) !== -1 && this._overpayRetryCnt < 3) {
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
   * @desc 정보확인 API 호출
   */
  _procConfirm: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    var joinOptionVal = this.$container.find('.widget-box.radio input[type="radio"]:checked').val();

    this._apiService.request(Tw.API_CMD.BFF_10_0008, {
      option: Tw.FormatHelper.isEmpty(this._useOptionProdId) ?
        joinOptionVal : joinOptionVal + ',' + this._useOptionProdId
    }, {}, [this._prodId]).done($.proxy(this._procConfirmRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 정보확인 API 응답 값 처리, 공통 정보확인 팝업 호출
   * @param resp - API 응답 값
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
   * @desc 정보확인 팝업 Callback 처리 (가입처리 요청)
   */
  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    var optProdId = this.$container.find('.widget-box.radio input[type="radio"]:checked').val(),
      reqParams = {
        applyStaTm: optProdId === 'NA00006163' ? this._startTime + '00' : '',
        optProdId: optProdId,
        svcProdGrpId: ''
      };

    this._apiService.request(Tw.API_CMD.BFF_10_0012, reqParams,
      {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 가입처리 API 응답 값 처리
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
   * @desc 옵션 설정 값별 텍스트
   * @returns {string}
   */
  _getBasicText: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked'),
      txt = $checked.parent().find('.mtext').text() + '<br>';

    if ($checked.val() === 'NA00006163') {
      txt += this.$msg.text();
    } else {
      txt += $checked.data('desc');
    }

    return txt;
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

    var completeData = {
      prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
      prodId: this._prodId,
      basicTxt: this._getBasicText(),
      prodNm: this._confirmOptions.preinfo.toProdInfo.prodNm,
      typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
      isBasFeeInfo: this._confirmOptions.isNumberBasFeeInfo,
      basFeeInfo: this._confirmOptions.isNumberBasFeeInfo ?
        Tw.DATE_UNIT.MONTH_S + this._confirmOptions.toProdBasFeeInfo + Tw.CURRENCY_UNIT.WON : ''
    };

    this._popupService.open({
      hbs: 'complete_product',
      data: completeData
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
    this._apiService.request(Tw.NODE_CMD.DELETE_SESSION_STORE, {});
  },

  /**
   * @function
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc - 완료 팝업 내 A 하이퍼링크 클릭 시
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc - 가입유도팝업 실행
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
   * @desc - 가입유도팝업 이벤트 바인딩
   * @param $popupContainer
   * @private
   */
  _bindVasTermPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_back>button', $.proxy(this._closeAndOpenResultPopup, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 가입유도팝업 종료시
   */
  _closeAndOpenResultPopup: function() {
    this._isResultPop = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료 팝업 종료시
   */
  _onClosePop: function() {
    this._historyService.goBack();
  }

};
