/**
 * @file TB끼리 온가족프리 < 나의 결합상품 < 나의 가입 정보 < MyT
 * @author Jiyoung Jo
 * @since 2018.11.01
 */

Tw.MyTJoinCombinationsTBFree = function (rootEl, svcInfo) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._member = svcInfo;

  this.$container = rootEl;
  this._bindEvent();
};

Tw.MyTJoinCombinationsTBFree.prototype = {  // TB끼리 온가족 프리
  /**
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-benefit', $.proxy(this._openChangeBenefitPopup, this));
  },

  /**
   * @desc 헤택 1 또는 혜택 2 변경하기 버튼 클릭 시
   * @param {Event} e 클릭 이벤트
   * @private
   */
  _openChangeBenefitPopup: function (e) {
    this.$changeBtn = $(e.target);
    this._bIdx = e.target.getAttribute('data-index'); // 혜택 1 변경인 지 혜택 2 변경인 지
    this._benefit = e.target.getAttribute('data-benefit');  // 현재 설정된 혜택 값

    this._popupService.open(  // 혜택 변경하기 팝업 오픈
      {
        hbs: 'MS_07_01_04_01_0' + this._bIdx,
        name: this._member.mbrNm,
        number: Tw.FormatHelper.getDashedCellPhoneNumber(this._member.svcNum),
        benefit: this._bIdx === '1' ? this._benefit === '2053-DAT1G' : this._benefit
      },
      $.proxy(this._handleOpenChangeBenefitPopup, this),
      null,
      'benefit' + this._bIdx,
      this.$changeBtn
    );
  },

  /**
   * @desc 혜택 변경 팝업 이벤트 바인딩
   * @param $layer 팝업 jquery object
   * @private
   */
  _handleOpenChangeBenefitPopup: function ($layer) {
    $layer.on('click', '.bt-red1', $.proxy(this._submitChangeBenefit, this, $layer));

    if ( this._bIdx === '2' ) {
      var $input = $layer.find('input');
      var $error = $layer.find('.val-txt');
      var $submitBtn = $layer.find('.bt-red1 button');
      $input.on('click', $.proxy(this._removeDash, this, $input));
      $input.on('focusout', $.proxy(this._handleFocusoutInput, this, $input, $error));
      $input.on('keyup', $.proxy(this._handleTypeInput, this, $input, $error, $submitBtn));
    }
  },

  /**
   * @desc 혜택 변경 버튼 클릭 시 서버에 요청
   * @param $layer 팝업 레이어 jquery object
   * @private
   */
  _submitChangeBenefit: function ($layer) {
    var value = '';
    var code = 0;

    if ( this._bIdx === '1' ) { // 혜택 1 변경 시
      code = 6;
      value = $layer.find('li[aria-checked="true"]').data('code');

      if ( this._benefit === value ) {  // 기존 혜택과 동일할 때
        var ALERT = Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A11;
        return this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
      }
    } else {  // 혜택 2 변경 시
      code = 5;
      value = $layer
        .find('#flab01')
        .val()
        .replace(/-/g, '');

      if ( this._benefit === value ) {  // 기존 혜택과 동일할 때
        return this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A13.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A13.TITLE);
      }
    }

    this._benefit = value;

    this._apiService
      .request(Tw.API_CMD.BFF_05_0135, {
        chgOpCd: code,
        benefitVal: value
      })
      .done($.proxy(this._successChangeBenefit, this));
  },

  /**
   * @desc 혜택 변경 요청에 대한 BFF 응답 시
   * @param {object} resp BFF 응답
   * @private
   */
  _successChangeBenefit: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var ALERT = Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A12;
      var parent = this.$changeBtn
        .parent()
        .contents()
        .filter(function () {
          return this.nodeType === 3;
        })[0];  // 바닥 페이지 혜택 관련 정보 변경을 위해서 기존 혜택이 설정되어 있는 element 찾음

      this.$changeBtn.attr('data-benefit', this._benefit);
      // 바닥페이지에 입력된 혜택 값 변경
      if ( this._bIdx === '1' ) {
        parent.textContent = parent.textContent.replace(/.+\s/, Tw.MYT_JOIN_TB_FREE_BENEFIT[this._benefit] + ' ');
      } else {
        parent.textContent = parent.textContent.replace(/[0-9\-\*]+/, Tw.FormatHelper.getDashedCellPhoneNumber(this._benefit));
      }

      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, $.proxy(this._closePopup, this));
    } else if ( resp.code === 'PRD0024' ) { // 혜택 2에 등록한 번호가 가족 번호일 때
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A14.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A14.TITLE);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @desc 혜택 변경 팝업 닫기
   * @private
   */
  _closePopup: function () {
    this._popupService.close();
  },

  /**
   * @desc 혜택2변경 핸드폰 번호 유효성 검사
   * @param value 인풋 입력 값
   * @param $error 에러 표시 jquery 객체
   * @private
   */
  _validPhoneNumber: function (value, $error) {
    var number = value.replace(/-/g, '');

    if ( number.indexOf('010') === 0 ) {
      if ( number.length !== 11 ) { // 입력번호가 010 번호이면 11자리
        this._setInvalidInput($error, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V18);
        return false;
      }
    } else if ( number.length !== 11 && number.length !== 10 ) {  // 입력번호가 010 번호가 아니면 11자리 또는 10자리
      this._setInvalidInput($error, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V18);
      return false;
    }

    if ( !Tw.ValidationHelper.isCellPhone(number) ) { // 핸드폰 번호인지 유효성 검사
      this._setInvalidInput($error, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_V9);
      return false;
    } else {  // 입력된 번호 유효할 때
      if ( !$error.hasClass('none') ) {
        $error.addClass('none').attr('aria-hidden', true);
      }
      return true;
    }
  },

  /**
   * @desc 인풋이 포커스를 잃었을 때
   * @param $input 인풋 jquery 객체
   * @param $error 에러 표시 jquery 객체
   */
  _handleFocusoutInput: function ($input, $error) {
    var value   = $input.val(),
        isValid = this._validPhoneNumber(value, $error);

    if ( isValid ) {  // 입력한 번호가 유효하면 Dash 추가
      $input.val(Tw.FormatHelper.getDashedCellPhoneNumber(value));
    }
  },

  /**
   * @desc 에러 스테이트 설정
   * @param $error 에러 표시 jquery 객체
   * @param {string} msg 에러메세지
   * @private
   */
  _setInvalidInput: function ($error, msg) {
    if ( $error.hasClass('none') ) {
      $error.removeClass('none').attr('aria-hidden', false);
    }
    $error.text(msg);
  },

  /**
   * @desc 입력에 포커스가 되면 대쉬 지움
   * @param $input 인풋 jquery 객체
   * @private
   */
  _removeDash: function ($input) {
    $input.val(($input.val() || '').replace(/-/g, ''));
  },

  /**
   * @desc 인풋에 입력 시
   * @param  $input
   * @param  $error
   * @param  $submitBtn
   * @private
   */
  _handleTypeInput: function ($input, $error, $submitBtn) {
    var value = $input
      .val()
      .replace(/[^0-9]/g, '');

    $input.val(value);

    var validLenth = value.indexOf('010') === 0 ? 11 : 10;

    if ( this._isCheckedLen && (!value || !value.length) ) {  // 인풋에 핸드폰 번호 자릿수가 입력되기 전까지 유효성 검사하지 않도록 함
      this._isCheckedLen = false;
    } else if ( !this._isCheckedLen && value.length === validLenth ) {
      this._isCheckedLen = true;
    }

    if ( this._isCheckedLen && this._validPhoneNumber(value, $error) ) {  // 인풋에 들어온 값이 유효하면 submit 버튼 활성화
      $submitBtn.removeAttr('disabled');
    } else {
      $submitBtn.attr('disabled', true);
    }
  }
};
