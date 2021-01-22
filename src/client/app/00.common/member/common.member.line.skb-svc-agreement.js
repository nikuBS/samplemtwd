/**
 * @file common.member.line.skb-svc-agreement.js
 * @author Kangta Kim (kangta.kim@sk.com)
 * @since 2019.12.11
 */

/**
 * @class
 * @desc 공통 > 회선관리
 * @param rootEl
 * @param svcInfo
 * @constructor
 */
Tw.CommonMemberLineSkbSvcAgreement = function (rootEl, svcInfo) {
  this.$container = rootEl;
  this._svcInfo = svcInfo;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._tooltipService = Tw.Tooltip;
  this._historyService = new Tw.HistoryService();

  this._cacheElements();
  this._bindEvent();
};

Tw.CommonMemberLineSkbSvcAgreement.prototype = {

  _cacheElements: function() {
    this.$btnTerm = this.$container.find('.fe-bt-term');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-bt-cancel', $.proxy(function() { this._historyService.goBack(); }, this));
    this.$container.on('click', '.fe-bt-term', $.proxy( this._openTermDetail, this ));
    this.$container.on('click', '.fe-bt-next', $.proxy(this._callIsOverFourteen, this));
  },

  /**
   * @function
   * @desc 약관 레이어 팝업
   * @private
   */
  _openTermDetail: function (event) {
    Tw.CommonHelper.openTermLayer( $(event.currentTarget).attr('value') );
  },

  /**
   * @function
   * @desc 만 14세 이상 여부 확인 API 호출
   * @private
   */
  _callIsOverFourteen: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0080, {})
    .done( $.proxy(this._checkIsOverFourteen, this) )
    .fail( $.proxy(this._failedApiCall, this) );
  },

  /**
   * @function
   * @desc 만 14세 이상 여부에 따라 2단계 진입 또는 에러메시지 발생
   * @private
   */
  _checkIsOverFourteen: function(resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.age >= 14 ) {
        this._callDisagreeLineCheck();
      } else {
        this._popupService.openAlert(Tw.ALERT_MSG_COMMON.BROADBAND_AGREEMENT_UNDER_FOURTEEN);
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 티월드동의 미동의 회선 조회 API 호출
   * @private
   */
  _callDisagreeLineCheck: function () {
    this._hidePopup(); // 회선관리 페이지 팝업 숨김처리

    this._apiService.request(Tw.API_CMD.BFF_05_0214, {})
      .done($.proxy(this._successDisagreeLineCheck, this))
      .fail($.proxy(this._failedApiCall, this));
  },

  /**
   * @function
   * @desc 티월드동의 미동의 회선 조회 API 응답 수신
   * @private
   */
  _successDisagreeLineCheck: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {

      var disagreedLineList = [];
      var totalLineCount = 0;
      var serialNumber = 0;

      resp.result.forEach( function (line) {
        totalLineCount = line.msvcTotalCnt;
        disagreedLineList.push({
          serialNumber: serialNumber,
          isInternet: line.svcCd === Tw.BROADBAND_SVC_CODE.INTERNET || false,
          isIptv: line.svcCd === Tw.BROADBAND_SVC_CODE.IPTV || false,
          isPhone: line.svcCd === Tw.BROADBAND_SVC_CODE.PHONE || false,
          svcName: Tw.BROADBAND_SVC_CODE_NAME[line.svcCd],
          address: line.zssaBasAddr,
          isNone: serialNumber < 10 ? '' : ' none'
        });
        serialNumber++;
      });

      // 미동의 회선이 없는 경우
      if ( totalLineCount === 0 ) {
        this._popupService.open({
          hbs: 'CO_01_05_03_02_NO_BROADBAND_LINE',
          layer: true,
          cdn: Tw.Environment.cdn
        }, $.proxy(this._noLinePopupOpenCallback, this), null, 'no-line');
      } else { // 미동의 회선이 있는 경우
        // 티월드동의 동의처리 2단계 팝업 호출
        this._popupService.open({
          hbs: 'CO_01_05_03_02',
          layer: true,
          disagreedLine: disagreedLineList,
          totalLineCount: totalLineCount,
          noMore: disagreedLineList.length < 11
        }, $.proxy(this._agreementPopupOpenCallback, this), null, 'line-check');
      }
    } else { // 조회 오류 시 Error 처리
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  // 닫기 버튼 클릭 시 페이지 진입 이전 화면으로 이동
  _noLinePopupOpenCallback: function($popupContainer) {
    $popupContainer.on('click', '.fe-bt-close', $.proxy( function() { this._historyService.go(-2); }, this ));
  },

  /**
   * @function
   * @desc API 응답 없음
   * @private
   */
  _failedApiCall:function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  _agreementPopupOpenCallback: function ($popupContainer) {
    $popupContainer.on('click', '.fe-bt-close', $.proxy(this._openAlertBeforeClose, this));
    $popupContainer.on('click', '.fe-bt-more', $.proxy(this._showMore, this));
    $popupContainer.on('click', '.fe-bt-agreement', $.proxy(this._confirmAgreement, this));
  },

  _openAlertBeforeClose: function() {
    this._popupService.openModalTypeA(
      '',
      Tw.ALERT_MSG_COMMON.BROADBAND_AGREEMENT_CANCEL_ALERT,
      null,
      null,
      // 닫기 버튼 클릭 시 페이지 진입 이전 화면으로 이동
      $.proxy( function() { this._historyService.go(-3); }, this));
  },

  /**
   * @function
   * @desc 더보기
   */
  _showMore: function () {
    this.$container.find('.fe-disagree-line.none').slice(0, 10).removeClass('none');
    if ( this.$container.find('.fe-disagree-line.none').length === 0 ) {
      this.$container.find('.fe-bt-more').addClass('none');
    }
  },

  _confirmAgreement: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0215, {})
      .done( $.proxy(this._openConfirmPopup, this) )
      .fail( $.proxy(this._failedApiCall, this) );
  },

  _openConfirmPopup: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.open({
        hbs: 'CO_01_02_04_03_SKB_AGREEMENT',
        layer: true
      }, $.proxy(this._confirmPopupOpenCallback, this), null, 'confirm');
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _confirmPopupOpenCallback: function($popupContainer) {
    $popupContainer.on('click', '.fe-bt-confirm', $.proxy( this._goLoadLineManagement, this));
  },

  _goLoadLineManagement: function () {
    this._historyService.goLoad('/common/member/line');
  },

  /**
   * @function
   * @desc 동의하고 회선 확인하기 버튼 클릭 후 회선관리 화면 팝업 미노출 처리
   * @private
   */
  _hidePopup: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      this._setLocalStorage('hideSkbAgreePop', this._svcInfo.userId, 365 * 10);
    } else {
      this._setCookie('hideSkbAgreePop', this._svcInfo.userId, 365 * 10);
    }
  },

  /**
   * @function
   * @desc 다음에 하기 처리 (Native localstorage 영역에 저장, 반영구적으로 비노출)
   */
  _setLocalStorage: function (key, userId, expiredays) {
    var keyName = key + '_' + userId;
    var today = new Date();

    today.setDate(today.getDate() + expiredays);

    Tw.CommonHelper.setLocalStorage(keyName, JSON.stringify({
      expireTime: today
    }));
  },

  /**
   * @function
   * @desc 다음에 보기 쿠키 처리 (반영구적으로 비노출)
   */
  _setCookie: function (key, userId, expiredays) {
    var cookieName = key + '_' + userId;
    var today = new Date();

    today.setDate(today.getDate() + expiredays);

    document.cookie = cookieName + '=Y; path=/; expires=' + today.toGMTString() + ';';
  }
};
