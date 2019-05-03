/**
 * @file masking.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.25
 */

/**
 * @class
 * @desc 공통 > 마스킹해제
 * @constructor
 */
Tw.MaskingComponent = function () {
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this.$btMasking = null;
  this._url = '';

  this._bindEvent();
};
Tw.MaskingComponent.prototype = {
  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$btMasking = $('.fe-bt-masking');
    this._url = 'GET|/v1/dummy/auth';
    this.$btMasking.on('click', _.debounce($.proxy(this._onClickMasking, this), 500));
  },

  /**
   * @function
   * @desc 마스킹 해체 버튼 click event 처리
   * @private
   */
  _onClickMasking: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0064, {})
      .done($.proxy(this._successGetData, this))
      .fail($.proxy(this._failGetData, this));
  },

  /**
   * @function
   * @desc 마스킹 해제 인증수단 요청 응답 처리
   * @param resp
   * @private
   */
  _successGetData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var params = $.extend(resp.result, {
        authClCd: Tw.AUTH_CERTIFICATION_KIND.A,
        prodProcType: ''
      });

      var cert = new Tw.CertificationSelect();
      cert.open(params, this._url, null, null, $.proxy(this._completeCert, this));
    }
  },

  /**
   * @function
   * @desc 마스킹 해제 인증수단 요청 실패 처리
   * @param error
   * @private
   */
  _failGetData: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 마스킹 해제 인증 완료 요청
   * @param resp
   * @private
   */
  _completeCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._apiService.request(Tw.NODE_CMD.SET_MASKING_COMPLETE, {
        svcMgmtNum: resp.svcMgmtNum
      }).done($.proxy(this._successMaskingComplete, this))
        .fail($.proxy(this._failMaskingComplete, this));
    }
  },

  /**
   * @function
   * @desc 마스킹 해제 인증 완료 요청 응답 처리
   * @param resp
   * @private
   */
  _successMaskingComplete: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 마스킹 해제 인증 완료 요청 실패 처리
   * @param error
   * @private
   */
  _failMaskingComplete: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  }
};
