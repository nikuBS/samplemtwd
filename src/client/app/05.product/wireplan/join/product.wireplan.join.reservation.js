/**
 * @file 인터넷/전화/TV > 가입 상담/예약
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-10-30
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param isProduct - 상품 카테고리별 회선 보유 여부
 */
Tw.ProductWireplanJoinReservation = function(rootEl, isProduct) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 공통 모듈 설정
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-btn_apply'));
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();

  // Global 변수 선언
  this._prodIdFamilyList = ['NA00002040', 'NH00000133', 'NH00000083'];  // 가족형 결합상품 상품코드
  this._prodIdList = $.merge(this._prodIdFamilyList, ['NH00000103']); // 결합상품 코드
  this._isProduct = Tw.FormatHelper.isEmpty(isProduct) ? null : JSON.parse(isProduct);  // 상품 카테고리별 회선 보유 여부
  this._logged = false; // 로그인 여부
  this._isLoadCombineList = false;  // 결합상품 가입 여부 조회를 추가로 하지 않기 위해
  this._currentCombineProductList = []; // 가입한 결합상품 코드 저장용 배열

  // 결합상품 코드 변환 (PLM상품코드 <-> Tw상품코드)
  this._convertProdIds = {
    NH00000103: 'TW00000009',
    NA00002040: 'TW20000010',
    NH00000083: 'TW20000008'
  };

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();

  // Initialize
  this._init();
};

Tw.ProductWireplanJoinReservation.prototype = {

  /**
   * @function
   * @desc Initialize
   */
  _init: function() {
    // 상품 카테고리 값 저장
    this._typeCd = this.$container.data('type_cd');

    // 결합상품이 아닐때 툴팁 노출
    if (this._typeCd !== 'combine') {
      this.$nonCombineTip.show().attr('aria-hidden', 'false');
    }

    // 로그인 상태 조회
    this._reqSvcMgmtNum();
  },

  /**
   * @function
   * @desc 결합상품 일 경우 최초 실행
   */
  _initCombineProduct: function() {
    this.$combineWrap.show().attr('aria-hidden', 'false');

    if (this._logged) {
      this._getCurrentCombineList();
    }
  },

  /**
   * @function
   * @desc 로그인 완료 후 페이지 재진입시 기 입력한 데이터 복원
   */
  _restoreLocalStorage: function() {
    if (!Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.PRODUCT_JOIN_RESERVATION)) { // 저장된 데이터 없으면 차단
      return;
    }

    if (!this._logged) {
      return Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.PRODUCT_JOIN_RESERVATION);  // 로그인 안한 상태서 진입시에도 차단, 데이터 있으면 날림
    }

    var data = Tw.CommonHelper.getLocalStorage(Tw.LSTORE_KEY.PRODUCT_JOIN_RESERVATION); // 키는 생성됬으나 값이 없을 경우 예외처리, 차단
    if (Tw.FormatHelper.isEmpty(data)) {
      return;
    }

    data = JSON.parse(data);
    if (data.expireTime < new Date().getTime()) { // 만료시간이 지난 데이터 일 경우 사용하지 않고 차단
      return;
    }

    // 데이터 복원
    this.$reservName.val(data.name);  // 신청자 이름
    this.$reservNumber.val(data.number).trigger('change');  // 상담가능 번호
    this._typeCd = data.typeCd; // 상품 카테고리 코드
    this._prodId = data.prodId; // 상품 코드 (결합상품 only)

    this._typeCdPopupClose(); // 상품 카테고리 값에 따른 UI 처리를 위한 호출
    this._setCombineResult(); // 결합상품 데이터 처리

    this.$agreeWrap.find('input[type=checkbox]').trigger('click');  // 약관 동의 체크
    this.$combineSelected.trigger('click'); // 상세 결합상품 정보 제공 체크

    if (Tw.FormatHelper.isEmpty(this._prodId) && this._prodId !== 'NH00000103') { // 개인형 결합상품이 아닐때 추가정보 체크영역 노출
      this.$combineExplain.attr('aria-disabled', false).removeClass('disabled');
      this.$combineExplain.find('input[type=checkbox]').removeAttr('disabled').prop('disabled', false);
    }

    if (data.isExplain) { // 기 데이터에 추가정보 체크영역 체크 되어 있었을 경우 복원
      this.$combineExplain.find('input[type=checkbox]').trigger('click');
    }

    this._procApplyCheck(); // 설정완료 버튼 클릭 처리
    Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.PRODUCT_JOIN_RESERVATION); // 기 데이터 삭제
  },

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$reservName = this.$container.find('#formInput01');  // 신청자 이름
    this.$reservNumber = this.$container.find('#formInput02');  // 상담가능 번호
    this.$agreeWrap = this.$container.find('.fe-agree_wrap'); // 약관동의 영역
    this.$combineSelected = this.$container.find('.fe-combine_selected'); // 상세 결합상품 정보제공 영역 내 체크박스
    this.$combineExplain = this.$container.find('.fe-combine_explain'); // 추가정보 제공 여부 영역
    this.$combineWrap = this.$container.find('.fe-combine_wrap'); // 상세 결합상품 정보제공 영역
    this.$formData = this.$container.find('.fe-form_data'); // 신청자 정보 영역 (이름 & 번호)
    this.$nonCombineTip = this.$container.find('.fe-non_combine_tip');  // 툴팁 selector (not 결합상품)
    this.$combineExplainCheckboxWrap = this.$container.find('.fe-combine_explan_checkbox_wrap');  // 추가 정보와 서류 제출 체크박스
    this.$combineExplainAllWrap = this.$container.find('.fe-combine_explain_all_wrap'); // 상세 결합상품 정보 제공 내 셀렉트 영역
    this.$inputName = this.$container.find('.fe-input_name'); // 신청자 이름

    this.$btnAgreeView = this.$container.find('.fe-btn_agree_view');  // 개인정보 제공 동의 자세히 보기 팝업
    this.$btnApply = this.$container.find('.fe-btn_apply'); // 신청하기 or 다음 버튼
    this.$btnSelectTypeCd = this.$container.find('.fe-btn_select_type_cd'); // 상품 카테고리 선택 버튼
    this.$btnSelectCombine = this.$container.find('.fe-btn_select_combine');  // 상세 결합상품 선택 버튼
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$container.on('keyup input', '.fe-input_name', $.proxy(this._toggleInputCancelBtn, this)); // 이름 입력시
    this.$container.on('keyup input', '.fe-input_phone_number', $.proxy(this._detectInputNumber, this));  // 번호 입력시
    this.$container.on('blur', '.fe-input_phone_number', $.proxy(this._blurInputNumber, this)); // 번호 입력창 blur 시
    this.$container.on('focus', '.fe-input_phone_number', $.proxy(this._focusInputNumber, this)); // 번호 입력창 focus 시
    this.$container.on('click', '.fe-btn_cancel', $.proxy(this._procClearInput, this)); // input 옆 X버튼 클릭시

    this.$btnAgreeView.on('click', $.proxy(this._openAgreePop, this));  // 약관동의 팝업 자세히 보기 클릭 시
    this.$btnApply.on('click', _.debounce($.proxy(this._procApplyCheck, this), 500));  // 신청하기 or 다음 버튼 클릭 시
    this.$btnSelectTypeCd.on('click', $.proxy(this._openTypeCdPop, this));  // 상품 카테고리 선택 버튼 클릭 시
    this.$btnSelectCombine.on('click', $.proxy(this._openCombinePop, this));

    this.$combineSelected.on('change', $.proxy(this._changeCombineSelected, this));
    this.$agreeWrap.on('change', 'input[type=checkbox]', $.proxy(this._procEnableApplyCheck, this));
    this.$formData.on('keyup input', 'input', $.proxy(this._procEnableApplyCheck, this));
    this.$combineExplain.on('change', 'input[type=checkbox]', $.proxy(this._onChangeCombineExplain, this));
  },

  /**
   * @function
   * @desc SvcInfo GET
   */
  _reqSvcMgmtNum: function() {
    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._setSvcMgmtNum, this));
  },

  /**
   * @function
   * @desc SvcInfo GET Resp
   * @param resp - SvcInfo resp
   */
  _setSvcMgmtNum: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      if (this._typeCd === 'combine') {
        this._initCombineProduct();
      }

      return;
    }

    this._logged = true;
    this._svcMgmtNum = resp.result.svcMgmtNum;
    this._restoreLocalStorage();

    if (this._typeCd === 'combine') {
      this._initCombineProduct();
    }
  },

  /**
   * @function
   * @desc 상품 분류
   */
  _openTypeCdPop: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list':[
            { 'label-attr': 'id="ra1"', 'txt': Tw.PRODUCT_RESERVATION.cellphone,
              'radio-attr':'id="ra1" data-type_cd="cellphone" ' + (this._typeCd === 'cellphone' ? 'checked' : '') },
            { 'label-attr': 'id="ra2"', 'txt': Tw.PRODUCT_RESERVATION.internet,
              'radio-attr':'id="ra2" data-type_cd="internet" ' + (this._typeCd === 'internet' ? 'checked' : '') },
            { 'label-attr': 'id="ra3"', 'txt': Tw.PRODUCT_RESERVATION.phone,
              'radio-attr':'id="ra3" data-type_cd="phone" ' + (this._typeCd === 'phone' ? 'checked' : '') },
            { 'label-attr': 'id="ra4"', 'txt': Tw.PRODUCT_RESERVATION.tv,
              'radio-attr':'id="ra4" data-type_cd="tv" ' + (this._typeCd === 'tv' ? 'checked' : '') },
            { 'label-attr': 'id="ra5"', 'txt': Tw.PRODUCT_RESERVATION.combine,
              'radio-attr':'id="ra5" data-type_cd="combine" ' + (this._typeCd === 'combine' ? 'checked' : '') }
          ]
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._typeCdPopupBindEvent, this), $.proxy(this._typeCdPopupClose, this), 'type_cd_select', this.$btnSelectTypeCd);
  },

  /**
   * @function
   * @desc 상품 분류 선택 팝업 이벤트 바인딩
   * @param $popupContainer - 상품 분류 선택 팝업 컨테이너
   */
  _typeCdPopupBindEvent: function($popupContainer) {
    $popupContainer.on('click', '[data-type_cd]', $.proxy(this._setTypeCd, this));

    // 웹접근성 대응
    Tw.CommonHelper.focusOnActionSheet($popupContainer);
  },

  /**
   * @function
   * @desc 상품 분류 선택 처리
   * @param e - 상품 분류 선택 클릭 이벤트
   */
  _setTypeCd: function(e) {
    this._typeCd = $(e.currentTarget).data('type_cd');
    this._popupService.close();
  },

  /**
   * @function
   * @desc 상품 분류 선택 팝업 종료 시
   */
  _typeCdPopupClose: function() {
    if (this._typeCd !== 'combine') {
      this._resetCombineWrap();
      this.$combineWrap.hide().attr('aria-hidden', 'true');
      this.$nonCombineTip.show().attr('aria-hidden', 'false');
    } else {
      this.$combineWrap.show().attr('aria-hidden', 'false');
      this.$nonCombineTip.hide().attr('aria-hidden', 'true');
      this._getCurrentCombineList();
    }

    this.$btnApply.attr('data-tracker_tw_type_cd', this._typeCd)
    this.$btnSelectTypeCd.text(Tw.PRODUCT_RESERVATION[this._typeCd]);
    this._historyService.replacePathName(window.location.pathname + '?type_cd=' + this._typeCd);
  },

  /**
   * @function
   * @desc 결합상품 영역 초기화
   */
  _resetCombineWrap: function() {
    this.$combineSelected.prop('checked', false);
    this.$combineSelected.parent().removeClass('checked').attr('aria-checked', 'false');
    this._changeCombineSelected();
  },

  /**
   * @function
   * @desc 결합상품 서류제출 체크 영역 처리
   */
  _changeCombineSelected: function() {
    if (this.$combineSelected.is(':checked')) {
      this.$combineExplainAllWrap.show().attr('aria-hidden', 'false');
      return;
    }

    this._prodId = null;
    this._setBtnCombineTxt(Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NONE.TITLE);

    this.$combineExplainAllWrap.hide().attr('aria-hidden', 'true');
    this.$combineExplainCheckboxWrap.hide().attr('aria-hidden', 'true');
    this.$combineExplain.attr('aria-disabled', true).addClass('disabled').removeClass('checked');
    this.$combineExplain.find('input[type=checkbox]').attr('disabled', 'disabled').prop('disabled', true)
      .prop('checked', false);
  },

  /**
   * @function
   * @desc 결합상품 선택 팝업
   */
  _openCombinePop: function() {
    this._popupService.open({
      hbs:'actionsheet05',
      layer:true,
      data:[
        {
          'title': Tw.PRODUCT_COMBINE_PRODUCT.GROUP_PERSONAL,
          'list':[
            { 'label-attr': 'id="ra1"', 'txt': Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000103.TITLE,
              'cont-txt': Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000103.EXPLAIN,
              'radio-attr':'id="ra1" data-prod_id="NH00000103" ' + (this._prodId === 'NH00000103' ? 'checked' : '') }
          ]
        },
        {
          'title': Tw.PRODUCT_COMBINE_PRODUCT.GROUP_FAMILY,
          'list': [
            { 'label-attr': 'id="ra2_1"', 'txt': Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NA00002040.TITLE,
              'cont-txt': Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NA00002040.EXPLAIN,
              'radio-attr':'id="ra2_1" data-prod_id="NA00002040" ' + (this._prodId === 'NA00002040' ? 'checked' : '') },
            { 'label-attr': 'id="ra2_2"', 'txt': Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000133.TITLE,
              'cont-txt': Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000133.EXPLAIN,
              'radio-attr':'id="ra2_2" data-prod_id="NH00000133" ' + (this._prodId === 'NH00000133' ? 'checked' : '') },
            { 'label-attr': 'id="ra2_3"', 'txt': Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000083.TITLE,
              'cont-txt': Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NH00000083.EXPLAIN,
              'radio-attr':'id="ra2_3" data-prod_id="NH00000083" ' + (this._prodId === 'NH00000083' ? 'checked' : '') },
            { 'label-attr': 'id="ra2_4"',
              'txt': Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.ETC.TITLE,
              'radio-attr':'id="ra2_4" data-prod_id="' + (!Tw.FormatHelper.isEmpty(this._prodId) &&
              Tw.FormatHelper.isEmpty(Tw.PRODUCT_COMBINE_PRODUCT.ITEMS[this._prodId]) ? this._prodId : 'ETC') +
                '" ' + ((this._isEtcProd || this._prodId === 'ETC') ? 'checked' : '') }
          ]
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindCombinePop, this), $.proxy(this._setCombineResult, this), 'combine_select', this.$btnSelectCombine);
  },

  /**
   * @function
   * @desc 결합상품 선택 팝업 이벤트 바인딩
   * @param $popupContainer - 결합상품 선택 팝업 컨테이너 레이어
   */
  _bindCombinePop: function($popupContainer) {
    $popupContainer.on('click', '[data-prod_id]', $.proxy(this._setCombine, this));
  },

  /**
   * @function
   * @desc 결합상품 선택 시
   * @param e - 선택 클릭 이벤트
   */
  _setCombine: function(e) {
    this.$combineSelected.prop('checked', true);
    this.$combineSelected.parent().addClass('checked').attr('aria-checked', 'true');
    this._prodId = $(e.currentTarget).data('prod_id');
    this._popupService.close();
  },

  /**
   * @function
   * @desc 결합상품 선택 후
   */
  _setCombineResult: function() {
    this._toggleCombineExplain();
    this._setBtnCombineTxt(this._getCombineProdNm());
    this._onChangeCombineExplain();
  },

  /**
   * @function
   * @desc 선택된 결합상품명 선택 버튼에 반영
   * @param txt - 결합상품명
   */
  _setBtnCombineTxt: function(txt) {
    this.$btnSelectCombine.html(txt + $('<div\>').append(this.$btnSelectCombine.find('.ico')).html());
  },

  /**
   * @function
   * @desc 상품코드로 결합상품명 산출
   * @returns {string|*}
   */
  _getCombineProdNm: function() {
    if (Tw.FormatHelper.isEmpty(this._prodId)) {
      return Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.NONE.TITLE;
    }

    if (!Tw.FormatHelper.isEmpty(Tw.PRODUCT_COMBINE_PRODUCT.ITEMS[this._prodId])) {
      return Tw.PRODUCT_COMBINE_PRODUCT.ITEMS[this._prodId].TITLE;
    }

    return Tw.PRODUCT_COMBINE_PRODUCT.ITEMS.ETC.TITLE;
  },

  /**
   * @function
   * @desc 결합상품 서류제출영역 처리
   * @todo 기획 요청으로 해당 영역 비노출 처리되어 있음
   */
  _toggleCombineExplain: function() {
    if (Tw.FormatHelper.isEmpty(this._prodId)) {
      return;
    }

    if (this._prodId === 'NH00000103') {
      this.$combineExplain.removeClass('checked');
      this.$combineExplain.find('input[type=checkbox]').prop('checked', false).removeAttr('checked')
        .attr('disabled', 'disabled').prop('disabled', true);
      this.$combineExplain.attr('aria-disabled', true).addClass('disabled');
      // this.$combineExplainCheckboxWrap.hide().attr('aria-hidden', 'true');
    } else {
      this.$combineExplain.find('input[type=checkbox]').removeAttr('disabled').prop('disabled', false);
      this.$combineExplain.attr('aria-disabled', false).removeClass('disabled');
      // this.$combineExplainCheckboxWrap.show().attr('aria-hidden', 'false');
    }
  },

  /**
   * @function
   * @desc 약관 동의 팝업 실행
   * @param e - 약관 보기 클릭 이벤트
   */
  _openAgreePop: function(e) {
    this._popupService.open({
      hbs: 'FT_01_03_L01_case',
      layer: true
    }, $.proxy(this._bindAgreePop, this), null, 'agree_pop', $(e.currentTarget));
  },

  /**
   * @function
   * @desc 약관 동의 팝업 이벤트 바인딩
   * @param $popupContainer - 약관 동의 팝업 컨테이너 레이어
   */
  _bindAgreePop: function($popupContainer) {
    $popupContainer.find('.fe-btn_ok').on('click', $.proxy(this._setAgreeAndclosePop, this));
  },

  /**
   * @function
   * @desc 약관 동의 팝업 내 동의 버튼 클릭 시
   */
  _setAgreeAndclosePop: function() {
    this._popupService.close();

    if (!this.$agreeWrap.find('input[type=checkbox]').is(':checked')) {
      this.$agreeWrap.find('input[type=checkbox]').trigger('click');
    }
  },

  /**
   * @function
   * @desc 삭제 버튼 클릭 시
   * @param e - 클릭 이벤트
   */
  _procClearInput: function(e) {
    var $btnCancel = $(e.currentTarget);
    $btnCancel.parent().find('input').val('');
    $btnCancel.removeClass('block');

    if ($btnCancel.hasClass('fe-clear_check')) {
      this._procEnableApplyCheck();
    }
  },

  /**
   * @function
   * @desc 신청하기 버튼 활성화 여부 산출
   * @returns {*|void}
   */
  _procEnableApplyCheck: function() {
    if (this.$agreeWrap.find('input[type=checkbox]:not(:checked)').length > 0) {
      return this._toggleApplyBtn(false);
    }

    if ($.trim(this.$reservName.val()).length < 1 || this.$reservNumber.val().length < 1) {
      return this._toggleApplyBtn(false);
    }

    this._toggleApplyBtn(true);
  },

  /**
   * @function
   * @desc 회선 입력란 keyup|input Event 시
   * @param e - keyup|input Event
   */
  _detectInputNumber: function(e) {
    var $input = $(e.currentTarget);

    $input.val($input.val().replace(/[^0-9]/g, ''));

    if ($input.val().length > 11) {
      $input.val($input.val().substr(0, 11));
    }

    this._toggleInputCancelBtn(e);
  },

  /**
   * @function
   * @desc 회선 입력란 blur Event
   * @param e - blur Event
   */
  _blurInputNumber: function(e) {
    var $input = $(e.currentTarget);
    if (Tw.FormatHelper.isEmpty($input.val())) {
      return;
    }

    $input.val(Tw.FormatHelper.conTelFormatWithDash($input.val()));
  },

  /**
   * @function
   * @desc 회선 입력란 focus Event
   * @param e - focus Event
   */
  _focusInputNumber: function(e) {
    var $input = $(e.currentTarget);
    $input.val($input.val().replace(/-/gi, ''));
  },

  /**
   * @function
   * @desc 회선 입력란 삭제 버튼 토글 처리
   * @param e - 회선 입력란 keyup|input Event
   */
  _toggleInputCancelBtn: function(e) {
    var $input = $(e.currentTarget);
    if ($input.val().length > 0) {
      $input.parent().find('.fe-btn_cancel').addClass('block');
    } else {
      $input.parent().find('.fe-btn_cancel').removeClass('block');
    }

    if ($input.val().length > 30) {
      $input.val($input.val().substr(0, 30));
    }
  },

  /**
   * @function
   * @desc 신청하기 버튼 토글
   * @param toggle - 활성화 여부
   */
  _toggleApplyBtn: function(toggle) {
    if (toggle) {
      this.$btnApply.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnApply.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 예약 상담 신청하기 실행
   * @returns {*|*|void}
   */
  _procApplyCheck: function() {
    if (!Tw.ValidationHelper.isCellPhone(this.$reservNumber.val()) && !Tw.ValidationHelper.isTelephone(this.$reservNumber.val())) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE,
        null, null, 'alert_iscellphone', this.$btnApply);
    }

    // 결합상품(개인형) 기 가입 상품 유무 체크
    if (this._typeCd === 'combine' && this._prodId === 'NH00000103') {
      return this._procExistsCheckPersonalCombine();
    }

    // 결합상품, 상품 선택 없이 상담 예약
    if (this._typeCd === 'combine' && this.$combineSelected.is(':checked') && Tw.FormatHelper.isEmpty(this._prodId)) {
      this._isNotSelectCombine = true;
      return this._popupService.openConfirmButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A31.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A31.TITLE, $.proxy(this._setNotSelectCombine, this), $.proxy(this._procNotSelectCombine, this),
        Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES, this.$btnApply);
    }

    if (this._typeCd === 'combine' && this._prodId !== 'NH00000103' &&
      this.$combineExplain.find('input[type=checkbox]').is(':checked') && !this._logged) {
      return this._popupService.openConfirmButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A36.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A36.TITLE,
        $.proxy(this._setGoLoginFlag, this), $.proxy(this._goLogin, this), Tw.BUTTON_LABEL.CLOSE, null, this.$btnApply);
    }

    // 결합상품, 상품 선택 및 추가정보 체크하여 입력 팝업 호출
    if (this._typeCd === 'combine' && this.$combineExplain.find('input[type=checkbox]').is(':checked') &&
      !Tw.FormatHelper.isEmpty(this._prodId)) {
      return this._procExplainFilePop();
    }

    // 가입 여부 체크
    if (this._typeCd !== 'combine' && !Tw.FormatHelper.isEmpty(this._isProduct) && this._isProduct[this._typeCd] ||
      this._typeCd === 'combine' && this._currentCombineProductList.indexOf(this._prodId) !== -1) {
      return this._procConfirmAdditional();
    }

    this._procApply();
  },

  /**
   * @function
   * @desc 기 결합 상품(가족) 목록 조회 API 요청
   */
  _getCurrentCombineList: function() {
    if (this._isLoadCombineList || !this._logged) {
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_05_0133, {})
      .done($.proxy(this._getCurrentCombineListRes, this));
  },

  /**
   * @function
   * @desc 기 결합 상품(가족) 목록 조회 API 응답 값 처리
   * @param resp - API 응답 값
   */
  _getCurrentCombineListRes: function(resp) {
    this._isLoadCombineList = true;
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result.combinationMemberList)) {
      return;
    }

    this._currentCombineProductList = resp.result.combinationMemberList.map(function (item) {
      return item.prodId;
    });
  },

  /**
   * @function
   * @desc 이미 해당 상품에 가입된 회선이 있을 때
   */
  _procConfirmAdditional: function() {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A40.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A40.TITLE,
      $.proxy(this._setConfirmAdditional, this), $.proxy(this._onCloseConfirmAdditional, this),
      Tw.BUTTON_LABEL.CLOSE, Tw.BUTTON_LABEL.CONFIRM, this.$btnApply);
  },

  /**
   * @function
   * @desc 기 가입된 상품이 있고, 추가 가입 상담 예약 희망하겠다고 선택했을 때
   */
  _setConfirmAdditional: function() {
    this._isConfirmAdditional = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 추가 상품 희망여부 팝업 창 종료 시
   */
  _onCloseConfirmAdditional: function() {
    if (!this._isConfirmAdditional) {
      return;
    }

    this._procApply();
  },

  /**
   * @function
   * @desc 개인형 결합상품(TB끼리 한가족할인)은 기 사용중일 경우 상담예약을 차단
   * @returns {*|void}
   */
  _procExistsCheckPersonalCombine: function() {
    if (this._currentCombineProductList.indexOf('NH00000103') !== -1 || this._currentCombineProductList.indexOf('TW00000009') !== -1) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A37.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A37.TITLE, null, null, 'exists_check', this.$btnApply);
    }

    this._procApply();
  },

  /**
   * @function
   * @desc 결합상품을 상품 선택없이 상담 예약하겠다고 선택했을 때
   */
  _setNotSelectCombine: function() {
    this._isNotSelectCombine = false;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 결합상품 상담예약 창 팝업 종료 시
   */
  _procNotSelectCombine: function() {
    if (this._isNotSelectCombine) {
      return;
    }

    this._procApply();
  },

  /**
   * @function
   * @desc 결합상품 서류제출 체크 값에 따라 신청하기 버튼 텍스트 수정
   */
  _onChangeCombineExplain: function() {
    if (this.$combineExplain.find('input[type=checkbox]').is(':checked')) {
      this.$btnApply.text(Tw.BUTTON_LABEL.NEXT);
    } else {
      this.$btnApply.text(Tw.BUTTON_LABEL.APPLY);
    }
  },

  /**
   * @function
   * @desc 서류 제출 팝업 실행을 위한 결합가족 조회
   * @returns {*|void}
   */
  _procExplainFilePop: function() {
    if (this._prodIdFamilyList.indexOf(this._prodId) === -1) {
      return this._openExplainFilePop([]);
    }

    var reqProdId = this._prodId;
    if (!Tw.FormatHelper.isEmpty(this._convertProdIds[this._prodId])) {
      reqProdId = this._convertProdIds[this._prodId];
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_05_0134, {}, {}, [reqProdId])
      .done($.proxy(this._procExpalinFilePopRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 결합가족 API 응답 처리
   * @param resp - 결합가족 API 응답 값
   * @returns {*|void}
   */
  _procExpalinFilePopRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return this._openExplainFilePop([]);
    }

    var currentSvcMgmtNum = this._svcMgmtNum,
      wirelessMemberList = resp.result.combinationWirelessMemberList.map(function(item) {
      return {
        name: item.custNm,
        number: Tw.FormatHelper.conTelFormatWithDash(item.svcNum),
        fam: {
          leader: item.relClCd === '00',
          parents: item.relClNm === Tw.PRODUCT_COMBINE_FAMILY_TYPE.parents,
          grandparents: item.relClNm === Tw.PRODUCT_COMBINE_FAMILY_TYPE.grandparents,
          grandchildren: item.relClNm === Tw.PRODUCT_COMBINE_FAMILY_TYPE.grandchildren,
          spouse: item.relClNm === Tw.PRODUCT_COMBINE_FAMILY_TYPE.spouse,
          children: item.relClNm === Tw.PRODUCT_COMBINE_FAMILY_TYPE.children,
          brother: item.relClNm === Tw.PRODUCT_COMBINE_FAMILY_TYPE.brother,
          me: item.svcMgmtNum === currentSvcMgmtNum
        }
      };
    });

    var wireMemberList = resp.result.combinationWireMemberList.map(function(item) {
      return {
        name: item.custNm,
        number: Tw.SVC_CD[item.svcCd],
        fam: {}
      };
    });

    this._openExplainFilePop($.merge(wirelessMemberList, wireMemberList));
  },

  /**
   * @function
   * @desc 서류제출 팝업 실행
   * @param familyList - 결합 가족 목록
   */
  _openExplainFilePop: function(familyList) {
    new Tw.ProductWireplanJoinReservationExplain(familyList, $.proxy(this._procApply, this));
  },

  /**
   * @function
   * @desc 상담 신청하기 처리
   * @param _combinationInfo - 결합 정보
   * @returns {*}
   */
  _procApply: function(_combinationInfo) {
    var combinationInfo = _combinationInfo || {},
      reqParams = {
        productValue: Tw.PRODUCT_RESERVATION_VALUE[this._typeCd],
        userNm: this.$reservName.val(),
        inputSvcNum: this.$reservNumber.val().replace(/[^0-9]/g, ''),
        fileUploadYn: combinationInfo.fileList && combinationInfo.fileList.length > 0 ? 'Y' : 'N'
      };

    this._isCombineInfo = false;

    Tw.CommonHelper.removeLocalStorage(Tw.LSTORE_KEY.PRODUCT_JOIN_RESERVATION);
    if (this._typeCd === 'combine' && !Tw.FormatHelper.isEmpty(combinationInfo)) {
      this._isCombineInfo = true;

      reqParams = $.extend(reqParams, {
        combGrpNewYn: combinationInfo.combGrpNewYn,
        combGrpInfo: (combinationInfo.familyList.map(function(item) {
          return [item.familyTypeText, item.name, item.number].join('/');
        })).join(';'),
        combProdNm: Tw.PRODUCT_COMBINE_PRODUCT.ITEMS[this._prodId].TITLE
      });

      return this._sendUscanAndApply(reqParams, combinationInfo.fileList);
    }

    if (this._typeCd === 'combine' && Tw.FormatHelper.isEmpty(combinationInfo)) {
      reqParams = $.extend(reqParams, {
        combGrpNewYn: '',
        combGrpInfo: '',
        combProdNm: Tw.FormatHelper.isEmpty(this._prodId) ? '' : Tw.PRODUCT_COMBINE_PRODUCT.ITEMS[this._prodId].TITLE
      });
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0076, reqParams)
      .done($.proxy(this._procApplyResult, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc USCAN 요청 처리
   * @param reqParams - USCAN 파라미터
   * @param fileList - 파일목록
   */
  _sendUscanAndApply: function(reqParams, fileList) {
    if (fileList.length < 1) {
      return;
    }

    var convFileList0 = [],
      convFileList1 = [];

    fileList.forEach(function(itemList) {
      convFileList0.push({
        fileSize: itemList[0].size,
        fileName: itemList[0].name,
        filePath: '/' + itemList[0].path
      });
      convFileList1.push({
        fileSize: itemList[1].size,
        fileName: itemList[1].name,
        filePath: '/' + itemList[1].path
      });
    });

    var apiList = [
      {
        command: Tw.API_CMD.BFF_01_0046,
        params: {
          recvFaxNum: 'skt401@sk.com',
          proMemo: Tw.PRODUCT_RESERVATION.combine,
          scanFiles: convFileList0
        }
      },
      {
        command: Tw.API_CMD.BFF_01_0046,
        params: {
          recvFaxNum: 'skt287@sk.com',
          proMemo: Tw.PRODUCT_RESERVATION.combine,
          scanFiles: convFileList1
        }
      },
      {
        command: Tw.API_CMD.BFF_10_0076,
        params: reqParams
      }
    ];

    this._apiService.requestArray(apiList)
      .done($.proxy(this._resUscanAndApply, this));
  },

  /**
   * @function
   * @desc USCAN 업로드 결과 처리
   * @param uscan0 - USCAN 첫번째 응답 값
   * @param uscan1 - USCAN 두번째 응답 값
   * @param apply - 상담예약 API 응답 값
   * @returns {*}
   */
  _resUscanAndApply: function(uscan0, uscan1, apply) {
    if (uscan0.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(uscan0.code, uscan0.msg).pop();
    }

    if (uscan1.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(uscan1.code, uscan1.msg).pop();
    }

    this._procApplyResult(apply);
  },

  /**
   * @function
   * @desc 로그인이 필요할 경우, 로그인을 하겠다고 했을 때
   */
  _setGoLoginFlag: function() {
    this._isGoLogin = true;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 로그인 여부 팝업 종료 시, 현재 입력된 값 로컬 스토리지 저장 및 로그인 이동
   */
  _goLogin: function() {
    if (!this._isGoLogin) {
      return;
    }

    this._isGoLogin = false;
    this._setLocalStorage();
    this._tidLanding.goLogin(location.href);
  },

  /**
   * @function
   * @desc 입력된 값 로컬 스토리지 저장
   */
  _setLocalStorage: function() {
    Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.PRODUCT_JOIN_RESERVATION, JSON.stringify({
      name: this.$reservName.val(),
      number: this.$reservNumber.val(),
      typeCd: this._typeCd,
      prodId: this._prodId,
      isExplain: this.$combineExplain.find('input[type=checkbox]').is(':checked'),
      expireTime: new Date().getTime() + (60000 * 10)
    }));
  },

  /**
   * @function
   * @desc 신청 결과 처리
   * @param resp - 상담 신청 API 응답 값
   * @returns {*}
   */
  _procApplyResult: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._openSuccessPop();
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   * @private
   */
  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_subtexts',
      text: Tw.PRODUCT_RESERVATION.success.text,
      typeCdName: Tw.PRODUCT_RESERVATION[this._typeCd],
      subtexts: [
        Tw.PRODUCT_RESERVATION.success.subtext_applyer + this.$reservName.val() + ' / ' + this.$reservNumber.val(),
        Tw.PRODUCT_RESERVATION.success.subtext_info
      ]
    }, $.proxy(this._bindSuccessPop, this), $.proxy(this._backToParentPage, this), 'join_reservation_success');
  },

  /**
   * @function
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindSuccessPop: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closeSuccessPop, this));
  },

  /**
   * @function
   * @desc 완료 팝어 내 닫기 버튼 클릭 시
   */
  _closeSuccessPop: function() {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료 팝업 종료 시 상담예약 이전 페이지로 이동시키기 위함
   * @returns {*|void}
   */
  _backToParentPage: function() {
    if (this._isCombineInfo) {
      return this._historyService.go(-2);
    }

    this._historyService.goBack();
  }
};
