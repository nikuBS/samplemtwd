/**
 * @file [목소리인증하기]
 * @author Lee Kirim
 * @since 2018-10-24
 */

/**
 * @class 
 * @desc 목소리인증하기 class
 * @param {Object} rootEl - 최상위 element Object
 */
Tw.CustomerVoice = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(rootEl);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerVoice.prototype = {
  _init: function () {
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - customer.voice.html 참고
   */
  _cachedElement: function () {
    // 신청하기 버튼
    this.$btn_register = this.$container.find('.fe-btn_register');
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    // 신청하기 버튼 클릭 이벤트
    this.$btn_register.on('click', $.proxy(this._checkHistories, this));
  },

  /**
   * @function
   * @desc 신청하기 버튼 클릭시 신청가능여부 조회 API 호출
   */
  _checkHistories: function () {
    this.$btn_register.prop('disabled', true); // 중복 클릭 방지 disabled 처리

    this._apiService.request(Tw.API_CMD.BFF_08_0009, {})
      .done($.proxy(this._onSuccessVoiceStatus, this))
      .fail($.proxy(this._onError, this));
  },

  /**
   * @function 
   * @desc 신청가능여부 조회 API 응답 처리
   * @param {JSON} res 
   */
  _onSuccessVoiceStatus: function (res) {
    this.$btn_register.prop('disabled', false); // 버튼 재활성화 
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.historiesYn = res.result.hitoriesYn; // 응답값 변수로 설정
      this._onClickRegister();
    } else if (Tw.API_CODE.COM001) {
      // 에러 코드 분기 처리 회선번호 없을 때 문구 노출
      this._popupService.openAlert(
        Tw.CUSTOMER_VOICE.NOLINE
      );
    } else {
      // 에러 케이스 반환
      this._onError(res);
    }
  },

  /**
   * @function
   * @desc 신청 가능할 때 historiesYn = 'N' 신청이력없음
   */
  _onClickRegister: function () {
    if ( this.historiesYn === 'N' ) {
      this._history.goLoad('/customer/svc-info/voice/register');
    } else {
      // 이력있음 확인 팝업
      this._popupService.openConfirmButton(
        Tw.CUSTOMER_VOICE.CALL_TO_CUSTOMER_CENTER,
        Tw.CUSTOMER_VOICE.EXIST_PREVIOUS_INFO,
        $.proxy(this._callCustomer, this),
        $.proxy(this._onCancel, this),
        Tw.BUTTON_LABEL.CLOSE,
        Tw.ALERT_MSG_MYT_DATA.CALL_CUSTOMER_CENTER);
    }
  },

  /**
   * @function
   * @desc 이력있어 전화로 연결
   */
  _callCustomer: function () {
    var sCustomerCall = 'tel://114';
    this._history.goLoad(sCustomerCall);
  },

  /**
   * @function
   * @desc 이력있음 확인 팝업 callback 
   */
  _onCancel: function () {
    this._popupService.close();
  },

  _onError: function (res) {
    Tw.Error(res.code, res.msg).pop();
  }
};