/**
 * @file 바로 공유 < T가족모아데이터 공유설정 < T가족모아 데이터 < 나의 데이터/통화 < MyT
 * @author Jiyoung Jo
 * @since 2018.10.04
 */

Tw.MyTDataFamilyShareImmediately = function($wrap, tabId) {
  this.$wrap = $wrap;
  this.$container = $wrap.find('#' + tabId);
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataFamilyShareImmediately.prototype = {
  _init: function() {
    this.MAIN_URL = '/myt-data/familydata';
    this._getShareData(0);
    new Tw.MyTDataFamilyShare(this.$container, this.$submit);
  },

  /**
   * @desc jquery 객체 캐싱
   */
  _cachedElement: function() {
    this.$submit = this.$wrap.find('#fe-submit-immediatly button');
    this.$amountInput = this.$container.find('.fe-amount');
    this.$amount = this.$container.find('.pt10 > .txt-c1');
    this.$retrieveBtn = this.$container.find('#fe-retrieve');
  },

  /**
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    // $('.wrap').on('click', '.prev-step', $.proxy(this._openCancelPopup, this));
    this.$submit.on('click', $.proxy(this._confirmSubmit, this));
    this.$retrieveBtn.on('click', $.proxy(this._handleClickRetrive, this));
  },

  /**
   * @desc 조회하기 버튼 클릭 시
   */
  _handleClickRetrive: function() {
    this.$container.find('#fe-ing').removeClass('none');  // 조회중입니다. 노출
    this.$retrieveBtn.addClass('none'); // 조회하기 버튼 삭제
    this._getShareData(0);
  },

  /**
   * @desc 서버에 공유 가능 데이터 조회 요청 
   * @param {string} requestCount 서버 input parameter
   */
  _getShareData: function(requestCount) {
    this._apiService.request(Tw.API_CMD.BFF_06_0045, { reqCnt: String(requestCount) }).done($.proxy(this._handleDoneShareData, this));
  },

  /**
   * @desc 서버 응답 시
   */
  _handleDoneShareData: function(resp) {
    if (resp.code === Tw.MYT_DATA_FAMILYDATA_SHARE_DATA_CODE.TIMEOUT) { // 조회하기 요청 Timeout
      this._setRetrieveStatus();
    } else if (resp.code === Tw.MYT_DATA_FAMILYDATA_SHARE_DATA_CODE.IS_ZERO) {  // 공유가능데이터가 0일 때
      this._successGetShareData({ tFmlyShrblQty: '0' });
    } else if (resp.code !== Tw.API_CODE.CODE_00) { // 기타 에러
      Tw.Error(resp.code, resp.msg).pop();
    } else if (resp.result) {
      if (resp.result.nextReqYn !== 'Y') {
        this._successGetShareData(resp.result);
      } else {
        setTimeout($.proxy(this._getShareData, this, resp.result.reqCnt), 3000);  // BFF 요청 사항 - 요청 후 3초 딜레이
      }
    }
  },

  /**
   * @desc 조회하기 버튼 노출
   */
  _setRetrieveStatus: function() {
    this.$container.find('#fe-ing').addClass('none');
    this.$retrieveBtn.removeClass('none');
    this._popupService.openAlert(
      Tw.ALERT_MSG_MYT_DATA.ALERT_2_A216, 
      Tw.POPUP_TITLE.NOTIFY, 
      undefined, 
      undefined, 
      undefined, 
      this.$retrieveBtn // 웹접근성 포커스 처리를 위한 jquery 객체
    );
  },

  /**
   * @desc 공유 가능 데이터 가져오기 성공 시
   * @param {string} share 공유 가능 데이터 양(BFF 서버에서 내려주는 모든 타입이 string 임)
   */
  _successGetShareData: function(share) {
    var amount = Number(share.tFmlyShrblQty) || 0;
    if (share.tFmlyShrblQty) {  
      if (amount >= 1) {
        this.$container.find('#fe-ing').addClass('none');
        this.$amountInput.attr('data-share-amount', amount);
        this.$amount.text(amount + Tw.DATA_UNIT.GB);
        this.$container.find('.txt-c2').text(amount + Tw.DATA_UNIT.GB);
        this.$amount.removeClass('none');
        this.$container.find('.btn-type01').removeAttr('disabled');
        this.$amountInput.removeAttr('disabled');
      } else {  // 공유 가능 데이터 양이 1 미만인 경우 공유 불가
        this.$container
          .find('#fe-share')
          .addClass('none')
          .attr('aria-hidden', true);
        this.$container.find('.fe-submit').remove();
        this.$container
          .find('#fe-share-none')
          .removeClass('none')
          .attr('aria-hidden', false);
      }
    } else {  // 공유 가능 데이터 값이 빈 값일 경우, 재조회 요청
      setTimeout($.proxy(this._setRetrieveStatus, this), 3000); // BFF 요청 사항 - 요청 후 3초 딜레이
    }
  },

  /**
   * @desc 공유하기 버튼 클릭 시
   * @param {Event} e 클릭 이벤트 객체
   */
  _confirmSubmit: function(e) {
    var POPUP = Tw.MYT_DATA_FAMILY_CONFIRM_SHARE;
    this._popupService.openModalTypeA(  // 공유 확인 팝업
      POPUP.TITLE,
      POPUP.CONTENTS.replace('{data}', this.$amountInput.val()),
      POPUP.BTN_NAME,
      null,
      $.proxy(this._handleSubmit, this),
      undefined,
      undefined,
      undefined,
      $(e.currentTarget)  // 웹접근성 포커스 처리를 위한 jquery 객체
    );
  },

  /**
   * @desc 사용자가 공유 확인 팝업에서 확인 버튼 클릭 시
   */
  _handleSubmit: function() { 
    this._popupService.close();
    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService
      .request(Tw.API_CMD.BFF_06_0046, { dataQty: this.$amountInput.val() })
      .done($.proxy(this._handleSuccessSubmit, this))
      .fail($.proxy(this._fail, this));
  },

  /**
   * @desc 서버에서 공유하기 응답 시
   * @param {object} resp 서버 응답 데이터
   */
  _handleSuccessSubmit: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {  // 서버 응답 에러 노출
      Tw.CommonHelper.endLoading('.container');
      Tw.Error(resp.code, resp.msg).pop();
    } else {
      var ALERT = Tw.MYT_DATA_FAMILY_SUCCESS_SHARE;
      setTimeout( // BFF 요청 사항 - 요청 후 3초 딜레이 추가
        $.proxy(function() {
          Tw.CommonHelper.endLoading('.container');
          this._popupService.afterRequestSuccess(this.MAIN_URL, this.MAIN_URL, undefined, ALERT.TITLE, undefined);
        }, this),
        3000
      );
    }
  },

  /**
   * 서버 요청 timeout 발생 시
   */
  _fail: function() {
    Tw.CommonHelper.endLoading('.container');
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  }
};
