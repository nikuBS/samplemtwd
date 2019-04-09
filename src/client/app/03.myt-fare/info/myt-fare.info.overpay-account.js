/**
 * @file [나의요금-과납내역_환불받기] 관련 처리
 * @author Lee Kirim 
 * @since 2018-09-17
 */

/**
 * @class 
 * @desc 요금납부조회 리스트를 위한 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.info.overpay-account.controlloer.ts 로 부터 전달되어 온 계좌정보 정보
 */
Tw.MyTFareInfoOverpayAccount = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._bankList = new Tw.MyTFareBillBankList(this.$container);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTFareInfoOverpayAccount.prototype = {
  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * - refundAPI_option 환불요청 시 전달되야 할 파라미터 정의
   * @return {void}
   */
  _init: function () {
    this.refundAPI_option = {
      //rfndBankNum // 계좌번호
      //svcMgmtNum: this.paramData.svcMgmtNum,
      //rfndBankCd // 은행코드
    };
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - myt-fare.info.overpay-account.html 참고
   */
  _cachedElement: function () {
    this.$refundRequestBtn = this.$container.find('.fe-btn-refund button'); // send btn
    this.$bankList = this.$container.find('.bt-dropdown.big'); // 은행이름선택
    this.$bankAccountInput = this.$container.find('#fe-bank-account'); // 계좌번호 input
    this.$closeBtn = this.$container.find('.fe-btn-back'); // 닫기버튼
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    // 은행선택 버튼
    this.$bankList.on('click', $.proxy(this._selectBank, this));

    // 환불신청 버튼
    this.$refundRequestBtn.on('click', $.proxy(this._refundRequestSend, this));
    // 계좌입력 text input
    this.$bankAccountInput.on('keyup', $.proxy(this._accountInputHandler, this));
    // 계좌입력 text input 입력삭제 버튼
    this.$bankAccountInput.siblings('button.cancel').eq(0).on('click', $.proxy(this._accountInputHandler, this));

    // 창 닫기 버튼 (뒤로가기)
    this.$closeBtn.on('click', $.proxy(this._goBack, this));

    // 환불계좌, 은행입력 없으면 환불버튼 비활성화 시키는 함수
    this._refundAccountInfoUpdateCheck();
  },

  /**
   * @function
   * @member
   * @desc 은행선택 액션시트 호출 Tw.MyTFareBillBankList 참조
   * 은행 선택시 이벤트 발생시킨 버튼 엘리먼트 id 은행 코드로 변경 
   * 은행 선택 후 _checkIsAbled 실행 
   * @param {event} event 
   * @returns {void}
   */
  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this));
  },

  /**
   * @function
   * @member
   * @desc _selectBank 완료 후 callback function 
   * 호출 파라미터 중 rfndBankCd 설정 
   * isBankNameSeted true 
   * _refundAccountInfoUpdateCheck 실행 (환불신청 버튼 활성화 여부 결정)
   * @returns {void}
   */
  _checkIsAbled: function () {
    this.isBankNameSeted = true;
    this.refundAPI_option.rfndBankCd = this.$bankList.attr('id');
    this._refundAccountInfoUpdateCheck();
  },

  /**
   * @function 
   * @member
   * @desc 환불신청 API 실행
   * @param {event} e 
   */
  _refundRequestSend: function (e) {
    this._apiService.request(Tw.API_CMD.BFF_07_0088, this.refundAPI_option)
        .done($.proxy(this._successRegisterAccount, this, $(e.currentTarget)))
        .fail($.proxy(this._apiError, this, $(e.currentTarget)));
  },

  /**
   * @function
   * @member
   * @param {Object} $target 환불신청버튼 엘리먼트
   * @param {JSON} res 응답값
   * @returns {void}
   * @desc 환불신청 API 응답 성공시
   * 성공여부 확인창 오픈
   */
  _successRegisterAccount: function($target, res) {
    if(res.code === '00') {
      /**
       * @desc 포인트 예약취소 알림 팝업
       * @param {string} msg 확인 메세지
       * @param {string} title 확인 제목
       * @param {string} label 확인 버튼 문구
       * @param {function} close_call_back_function 창 닫힌 후 실행할 function
       * @param {Object} $target 창 닫힌 후 포커스 될 타겟 element
       */
      this._popupService.openAlert(
        Tw.POPUP_CONTENTS.REFUND_ACCOUNT_SUCCESS,
        Tw.POPUP_TITLE.NOTIFY, 
        Tw.BUTTON_LABEL.CONFIRM, 
        $.proxy(this._refreshOverPay, this),
        null,
        $target
      );
    } else {
      // 잘못된 계좌번호 일경우 FE 에서 메세지 변경 노출
      if(res.code === 'ZNGME0000') {
        res.msg = Tw.ALERT_MSG_MYT_FARE.ALERT_2_A32;
      }
      this._popupService.openAlert(
        res.msg, 
        Tw.POPUP_TITLE.NOTIFY, 
        Tw.BUTTON_LABEL.CONFIRM, 
        null,
        null,
        $target
      );
    }
  },

  /**
   * @function
   * @member
   * @returns {void}
   * @desc 은행, 계좌번호 입력시 환불신청 버튼 활성화 else 비활성화
   */
  _refundAccountInfoUpdateCheck: function () {
    if (this.isBankNameSeted && this.isBankAccountNumberSeted) {
      this.$refundRequestBtn.attr('disabled', false);
    } else {
      this.$refundRequestBtn.attr('disabled', true);
    }
  },

  /**
   * @function
   * @member
   * @returns {void}
   * @desc 환불 계좌 신청 완료 후 갱신 
   * 환불계좌 등록 성공 후 확인창 닫힌 후 callback function 
   * 뒤로 이동
   */
  _refreshOverPay: function() {
    this._historyService.goBack();
  },
  
  /**
   * @function
   * @member
   * @desc 계좌 text input 입력시 환불하기 버튼 활성 or 비활성화 조절을 위한 함수
   * @param {event} e 
   */
  _accountInputHandler: function (e) {
    this.isBankAccountNumberSeted = ($(e.currentTarget).val().length > 0);
    this.refundAPI_option.rfndBankNum = $(e.currentTarget).val();
    this._refundAccountInfoUpdateCheck();
  },

  /**
   * @function
   * @member
   * @returns {void}
   * @desc 뒤로가기
   */
  _goBack: function() {
    this._historyService.goBack();
  },

  /**
   * @function
   * @desc API 호출 후 에러 반환시 에러 서비스 호출
   * @param {Oject} $target API 호출시 이벤트 발생 시킨 엘리먼트
   * @param {JSON} err API 반환 코드 
   * @returns {function} 
   */
  _apiError: function ($target, err) {
    return Tw.Error(err.code, err.msg).pop(null, $target);
  }
};
