/**
 * @file [나의요금-자동납부_통합인출_해제] 관련 처리
 * @author Lee Kirim 
 * @since 2018-09-17
 */

 /**
  * @class 
  * @desc 자동납부 통합인출 해제를 위한 class
  * @param {Object} rootEl - 최상위 element Object
  * @param {JSON} data - myt-fare.info.cancel-draw.controlloer.ts 로 부터 전달되어 온 납부내역 정보
  */
Tw.MyTFareInfoCancelDraw = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._bankList = new Tw.MyTFareBillBankList(this.$container);
  
  this._init();
  this._cachedElement();
  this._bindEvent();
};

Tw.MyTFareInfoCancelDraw.prototype = {
  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * - rootPathName 현재 주소
   * @return {void}
   */
  _init: function () {
    this.rootPathName = this._historyService.pathname;
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * 은행 계좌 및 코드 없을 경우 취소하기 버튼 disabled 처리
   * - myt-fare.info.cancel-draw.html 참고
   */
  _cachedElement: function () {
    // 해지신청 버튼
    this.$cancelBtn = this.$container.find('.fe-btn-cancel');

    // page로 이동해서 정보 없을 가능성 전송버튼 disable
    if (Tw.FormatHelper.isEmpty(this.data.bankCd) || Tw.FormatHelper.isEmpty(this.data.bankAccount)) {
      this.$cancelBtn.find('button').prop('disabled', true);
    } 
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    // 해지신청 버튼 클릭
    this.$cancelBtn.on('click', 'button', $.proxy(this._processAutoWithdrawalCancel, this));
  },

  /**
   * @function
   * @member
   * @desc 해지신청호출 controller 에서 받은 bankCd, bankAccount 파라미터로 전송
   * @param {event} e 이벤트 발생 시킨 이벤트
   * @returns {void}
   */
  _processAutoWithdrawalCancel: function (e) {
    this._apiService.request(Tw.API_CMD.BFF_07_0069, {
      bankCd: this.data.bankCd,
      bankSerNum: this.data.bankAccount
    }).done($.proxy(this._successCancelAccount, this, $(e.currentTarget)))
      .fail($.proxy(this._apiError, this, $(e.currentTarget)));
  },

  /**
   * @function
   * @member
   * @param {Object} $target 이벤트 발생 시킨 엘리먼트 (해지신청 버튼)
   * @param {JSON} res API 반환 데이터
   * @desc 해지신청 성공시 해지확인창 띄움
   * @returns {void}
   */
  _successCancelAccount: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      /**
       * @desc 포인트 예약취소 알림 팝업
       * @param {string} msg 확인 메세지
       * @param {string} title 확인 제목
       * @param {string} label 확인 버튼 문구
       * @param {function} close_call_back_function 창 닫힌 후 실행할 function
       * @param {Object} $target 창 닫힌 후 포커스 될 타겟 element
       */
      this._popupService.openAlert(
        Tw.MYT_FARE_HISTORY_PAYMENT.CANCEL_AUTO_WITHDRAWAL,
        Tw.POPUP_TITLE.NOTIFY, 
        Tw.BUTTON_LABEL.CONFIRM, 
        $.proxy(this._closePopAndBack, this),
        $.proxy(this._closePopAndBack, this),
        $target
      );
    } else {
      // 코드값이 성공이 아닐경우 에러 반환
      this._apiError($target, res);
    }
  },

  /**
   * @function
   * @member
   * @returns {void}
   * @desc 해지신청 완료 확인창 닫기 시 팝업 닫고 뒤로 이동
   * 현재 팝업형식 페이지인데 closeAll 실행시 팝업형식의 엘리먼트까지 제거된다 만약 요건이 변경되어 뒤로가지 않고 
   * 머물러야 한다면 html 문서에 popup-page 클래스에 page 클래스를 추가하면 된다
   */
  _closePopAndBack: function() {
    this._popupService.closeAll();
    this._historyService.goBack();
  },

  /**
   * @function
   * @desc API 호출 후 에러 반환시 에러 서비스 호출
   * @param {Oject} $target API 호출시 이벤트 발생 시킨 엘리먼트
   * @param {JSON} err API 반환 코드 
   * @returns {boolean} false
   */
  _apiError: function ($target, err) {
    Tw.Error(err.code, Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.msg).pop(null, $target);
    return false;
  }
};
