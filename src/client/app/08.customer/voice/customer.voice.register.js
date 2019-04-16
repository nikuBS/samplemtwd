/**
 * @file [목소리인증하기-등록]
 * @author Lee Kirim
 * @since 2018-10-25
 */

 /**
 * @class 
 * @desc 목소리인증하기 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {Object} allSvc - 회선정보
 */
Tw.CustomerVoiceRegister = function (rootEl, allSvc) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._lineComponent = new Tw.LineComponent();
  this._allSvc = allSvc;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerVoiceRegister.prototype = {
  _init: function () {
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - customer.voice.register.html 참고
   */
  _cachedElement: function () {
    this.$btn_register = this.$container.find('.fe-btn_register'); // 신청하기 버튼
    // 회선정보 셀렉트박스 or text input (회선보유수에 따라) (text input 일때는 disabled 처리 되어있어 클릭 이벤트 발생하지 않음)
    this.$btn_select_phone = this.$container.find('.fe-select_phone'); 
    this.$check_voice_term = this.$container.find('.fe-check_voice_term'); // 이용동의 체크박스
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    this.$btn_register.on('click', $.proxy(this._onClickRegister, this)); // 신청하기 버튼 클릭 이벤트
    this.$check_voice_term.on('click', $.proxy(this._onClickAgreeTerm, this)); // 이용동의 체크 박스 클릭 이벤트
    this.$btn_select_phone.on('click', $.proxy(this._onShowSelectPhoneNumber, this)); // 회선정보 클릭이벤트
    this.$container.on('click touchstart touchend', '[data-service-number]', $.proxy(this._onChoiceNumber, this)); // 회선정보 선택 액션시트 열렸을 때 이벤트 바인드 root 에 이벤트를 걸어 액션시트 열렸을 때 따로 콜백 함수에 이벤트 바인드를 하지 않음
  },

  /**
   * @function
   * @desc 체크박스 클릭 이벤트 체크 토글은 common.js 에서 동작함 
   * 체크박스 체크 여부에 따라 신청하기 버튼 활성/비활성화
   */
  _onClickAgreeTerm: function () {
    if ( this.$check_voice_term.prop('checked') ) {
      this.$btn_register.prop('disabled', false);
    } else {
      this.$btn_register.prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 회선정보 클릭이벤트 회선 선택 액션시트 노출함
   */
  _onShowSelectPhoneNumber: function () {
    /**
     * @function
     * @desc 회선정보를 액션시트에 호출 형식에 맞도록 변환해 반환
     * @param {number | string} item 
     * @return {array} 
     */
    var fnSelectLine = function (item) {
      return {
        value: Tw.FormatHelper.conTelFormatWithDash(item.svcNum),
        option: this.$btn_select_phone.data('svcmgmtnum').toString() === item.svcMgmtNum ? 'checked' : '',
        attr: 'data-service-number=' + item.svcMgmtNum
      };
    };

    /**
     * @function 
     * @param {Object} {hbs: hbs 의 파일명, layer: 레이어 여부, title: 액션시트 제목, data: 데이터 리스트, btnfloating: {txt: 닫기버튼 문구, attr: 닫기버튼 attribute, class: 닫기버튼 클래스}}
     * @param {function} function_open_call_back 액션시트 연 후 호출 할 function
     * @param {function} function_close_call_back 액션시트 닫힌 후 호출할 function
     * @param {string} 액션시트 열 때 지정할 해쉬값, 기본값 popup{n}
     * @param {Object} $target 액션시트 닫힐 때 포커스 될 엘리먼트 여기에서는 카테고리 선택 버튼
     * @desc 라디오 선택 콤보박스 형태
     */
    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.CUSTOMER_VOICE.LINE_CHOICE,
        data: [{ list: this._allSvc.m.map($.proxy(fnSelectLine, this)) }]
      },
      null,
      null,
      null,
      this.$btn_select_phone
    );
  },

  /**
   * @function 
   * @desc 액션시트 클릭 이벤트 선택된 회선정보를 저장하고 회선정보 변경 함수를 호출한다.
   * @param {event} e 
   */
  _onChoiceNumber: function (e) {
    e.stopPropagation();
    e.preventDefault();

    var svcMgmtNum = $(e.currentTarget).data('service-number').toString(); // 서비스관리번호(_onShowSelectPhoneNumber 참조)
    var mdn = $(e.currentTarget).text().trim(); // 전화번호

    this.$btn_select_phone.data('svcmgmtnum', svcMgmtNum); // 셀렉트 버튼에 data 저장
    this.$btn_select_phone.text(mdn); // 셀렉트 버튼에 선택된 정보 text

    this._popupService.close(); // 액션시트 닫기

    this._lineComponent.changeLine(svcMgmtNum, mdn, $.proxy(function(){return null;}, this)); // 회선변경 호출(공통함수)
  },

  /**
   * @function
   * @desc 신청버튼 클릭 이벤트 API 호출 실행
   */
  _onClickRegister: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0034, { svcMgmtNum: this.$btn_select_phone.data('svcmgmtnum').toString() })
      .done($.proxy(this._onSuccessRegister, this))
      .fail($.proxy(this._onRegisterError, this));
  },

  _onSuccessRegister: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var sPhone = !!this.$btn_select_phone.val() ? this.$btn_select_phone.val() : this.$btn_select_phone.text(); // 입력한 회선정보 혹은 셀렉트로 저장된 text
      this._history.replaceURL('/customer/svc-info/voice/complete?targetNum=' + sPhone); // 페이지 이동
    } else {
      // 에러케이스
      this._onRegisterError(res);
    }
  },

  _onRegisterError: function (res) {
    /**
     * @function
     * @desc 등록하기 API 호출 에러 
     * @param {function} callback function
     * @param {element} btn 에러 팝업 닫힌 후 포커스될 타겟 등록하기 버튼
     */
    Tw.Error(res.code, res.msg).pop(null, this.$btn_register);
  }
};