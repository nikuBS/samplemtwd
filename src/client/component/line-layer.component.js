/**
 * @file line-layer.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.02.01
 */

/**
 * @class
 * @desc 공통 > 로그인 최초 레이어 설정
 * @constructor
 */
Tw.LineLayerComponent = function () {
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  var layerType = Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.LAYER_CHECK);
  Tw.Logger.info('[LineLayerComponent]', layerType);

  if ( !Tw.FormatHelper.isEmpty(layerType) ) {
    this._checkLayerType(layerType);
  }
};

Tw.LineLayerComponent.prototype = {
  /**
   * @function
   * @desc 로그인시 받아온 layerType 확인
   * @param layerType
   * @private
   */
  _checkLayerType: function (layerType) {
    Tw.Logger.info('[Home] layerType', layerType);
    if ( !Tw.FormatHelper.isEmpty(layerType) ) {
      if ( layerType === Tw.LOGIN_NOTICE_TYPE.NEW_CUSTOMER || layerType === Tw.LOGIN_NOTICE_TYPE.EXIST_CUSTOMER ) {
        this._openLineResisterPopup(layerType);
      } else if ( layerType === Tw.LOGIN_NOTICE_TYPE.CUSTOMER_PASSWORD ) {
        this._openPasswordGuide();
      } else if ( layerType === Tw.LOGIN_NOTICE_TYPE.NEW_LINE ) {
        this._openNewLine();
      }
    }
  },

  /**
   * @function
   * @desc 회선 정보 요청
   * @param layerType
   * @private
   */
  _openLineResisterPopup: function (layerType) {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._successGetSvcInfo, this, layerType))
      .fail($.proxy(this._failGetSvcInfo, this));
  },

  /**
   * @desc 회선 정보 응답 처리 및 회선 등록 화면 이동
   * @param layerType
   * @param resp
   * @private
   */
  _successGetSvcInfo: function (layerType, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var cnt = resp.result.totalSvcCnt - resp.result.expsSvcCnt;
      if ( cnt > 0 ) {
        setTimeout($.proxy(function () {
          this._historyService.goLoad('/common/member/line/register?type=' + layerType + '&landing=' + encodeURIComponent(location.pathname + location.search));
        }, this), 1000);
      }
    }
  },

  /**
   * @desc 회선 정보 요청 실패 처리
   * @param error
   * @private
   */
  _failGetSvcInfo: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 고객보호비밀번호 설정 가이드 팝업 요청
   * @private
   */
  _openPasswordGuide: function () {
    setTimeout($.proxy(function () {
      this._openCustomerPasswordGuide();
    }, this), 2000);
  },

  /**
   * @function
   * @desc 신규 회선 안내 팝업 오픈
   * @private
   */
  _openNewLine: function () {
    setTimeout($.proxy(function () {
      this._popupService.openAlert(Tw.ALERT_MSG_HOME.NEW_LINE, null, null, $.proxy(this._closeNewLine, this), 'mainAuto');
    }, this), 2000);
  },

  /**
   * @function
   * @desc 고객보호비밀번호 설정 가이드 팝업 오픈
   * @private
   */
  _openCustomerPasswordGuide: function () {
    this._popupService.open({
      hbs: 'popup',
      title: Tw.LOGIN_CUS_PW_GUIDE.TITLE,
      title_type: 'sub',
      cont_align: 'tl',
      contents: Tw.LOGIN_CUS_PW_GUIDE.CONTENTS,
      infocopy: [{
        info_contents: Tw.LOGIN_CUS_PW_GUIDE.INFO,
        bt_class: 'none'
      }],
      bt_b: [{
        style_class: 'bt-red1 pos-right fe-go',
        txt: Tw.LOGIN_CUS_PW_GUIDE.BUTTON
      }]
    }, $.proxy(this._confirmCustPwGuide, this), $.proxy(this._closeCustPwGuide, this), 'mainAuto');
  },

  /**
   * @function
   * @desc 고객보호비밀번호 설정 가이드 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $popupContainer
   * @private
   */
  _confirmCustPwGuide: function ($popupContainer) {
    $popupContainer.on('click', '.fe-go', $.proxy(this._onClickGoPwGuide, this));
  },

  /**
   * @function
   * @desc 고객보호비밀번호 설정 가이드 팝업 클로즈 콜백
   * @private
   */
  _closeCustPwGuide: function () {
    if ( this._goCustPwd ) {
      this._historyService.goLoad('/myt-join/custpassword');
    }
  },

  /**
   * @function 고객보호비밀번호 설정페이지 이동 버튼 click event 처리
   * @desc
   * @private
   */
  _onClickGoPwGuide: function () {
    this._goCustPwd = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 신규회선 안내 팝업 클로즈 콜백
   * @private
   */
  _closeNewLine: function () {
    this._historyService.goLoad('/common/member/line');
  }
};

