/**
 * @file [나의요금-세금계산서_팩스재발행하기] 관련 처리
 * @author Lee Kirim 
 * @since 2019-01-30
 */

 /**
 * @class 
 * @desc 세금계산서_팩스재발행하기 위한 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.info.bill-cash.send-email.controlloer.ts 로 부터 전달되어 온 납부내역 정보
 */
Tw.MyTFareInfoBillTaxSendFax = function (rootEl, data) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);  

  this.data = JSON.parse(data);

  this._cachedElement();
  
  this._init();
  this._bindEvent();
};

Tw.MyTFareInfoBillTaxSendFax.prototype = {
  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * @return {void}
   */
  _init: function() {

  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - myt-fare.info.bill-tax.send-fax.html 참고
   */
  _cachedElement: function() {
    // 팩스번호 입력 input
    this.$faxNumberInput = this.$container.find('.input input[type="tel"]');
    // 팩스보내기 버튼
    this.$rerequestSendBtn = this.$container.find('.fe-submit button');
    // validation text
    this.$validataionTxt = this.$container.find('.fe-validation');
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   * @returns {void}
   */
  _bindEvent: function() {
    // 팩스보내기 버튼 클릭 이벤트
    this.$rerequestSendBtn.on('click', $.proxy(this._sendRerequestByFax, this));
    // 팩스input 입력 이벤트
    this.$faxNumberInput.on('keyup focusout', $.proxy(this._checkFaxNumber, this));
    // 팩스 Input 삭제버튼 클릭 이벤트
    this.$faxNumberInput.siblings('.cancel').on('click', $.proxy(function() {
      this.$faxNumberInput.val('').trigger('keyup');
      this.$rerequestSendBtn.attr('disabled', true);
    }, this));
    // 뒤로가기 버튼 클릭 이벤트
    this.$container.find('.fe-btn-back').on('click', $.proxy(this._goBack, this));
  },

  /**
   * @function
   * @member
   * @param {event} e 
   * @returns {void}
   * @desc 팩스 인풋 및 포커스 아웃시 입력된 값이 없을 때, 팩스 형식에 맞지 않을 때 밸리데이션 문구 노출 처리
   */
  _checkFaxNumber: function (e) {
    Tw.InputHelper.inputNumberOnly(e.currentTarget);
    var isTel = Tw.ValidationHelper.isTelephone($(e.currentTarget).val());
    var isEmpty = Tw.FormatHelper.isEmpty($(e.currentTarget).val());
    if (isEmpty) {
      this.$validataionTxt.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V73);
    } 
    else if (!isTel) {
      this.$validataionTxt.text(Tw.ALERT_MSG_MYT_FARE.ALERT_2_V74);
    }
    if(!isEmpty && isTel) {
      this.$rerequestSendBtn.attr('disabled', false);
      this.$validataionTxt.attr('aria-hidden', true).addClass('blind').text('');
    } else {
      this.$rerequestSendBtn.attr('disabled', true);
      this.$validataionTxt.attr('aria-hidden', false).removeClass('blind');
    }
  },
  
  /**
   * @function
   * @member
   * @param {event} e 
   * @desc 팩스재발급 요청 API 호출
   * @returns {void}
   */
  _sendRerequestByFax: function (e) {    
    this._apiService.request(Tw.API_CMD.BFF_07_0019, {
        fax:this.$faxNumberInput.val(),
        selSearch: this.data.taxBillYearMonth,
        selType:'M'
      })
        .done($.proxy(this._resSendCallback, this, $(e.currentTarget)))
        .fail($.proxy(this._apiError, this, $(e.currentTarget)));
  },

  /**
   * @function
   * @member
   * @param {Object} $target 팩스재발행하기 버튼 엘리먼트
   * @param {JSON} res 응답값
   */
  _resSendCallback: function($target, res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return this._apiError($target, res);
    }
    /**
     * @desc 포인트 예약취소 알림 팝업
     * @param {string} msg 확인 메세지
     * @param {string} title 확인 제목
     * @param {string} label 확인 버튼 문구
     * @param {function} close_call_back_function 창 닫힌 후 실행할 function
     * @param {Object} $target 창 닫힌 후 포커스 될 타겟 element
     */
    this._popupService.openAlert(
      Tw.FormatHelper.getDashedPhoneNumber(this.$faxNumberInput.val())+ ' ' + Tw.ALERT_MSG_MYT_FARE.ALERT_2_A28,
      Tw.POPUP_TITLE.NOTIFY, 
      Tw.BUTTON_LABEL.CONFIRM, 
      $.proxy(this._goBack, this),
      null,
      $target
    );
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
   * @returns {boolean} false
   */
  _apiError: function ($target, err) {
    return Tw.Error(err.code, err.msg).pop(null, $target);
  }
};