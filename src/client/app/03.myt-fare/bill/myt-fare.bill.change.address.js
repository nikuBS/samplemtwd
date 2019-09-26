/**
 * @file myt-fare.bill.change.address.js
 * @author Jayoon Kong
 * @since 2018.11.13
 * @desc 자동납부 미사용자의 연락처 및 주소 변경
 */

/**
 * @namespace
 * @desc 주소 및 연락처 변경 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTFareBillChangeAddress = function (rootEl) {
  this.$container = rootEl;
  this.$changeBtn = this.$container.find('.fe-change');
  this.$isValid = true;
  this._phoneModifyYn = 'N';
  this._addrModifyYn = 'N';
  this._firstTouch = true;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._validation = Tw.ValidationHelper;

  this._historyService = new Tw.HistoryService(rootEl);
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-change'));

  this._bindEvent();
};

Tw.MyTFareBillChangeAddress.prototype = {
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('keyup', '.required-input-field', $.proxy(this._setChangeBtnAble, this));
    this.$container.on('keyup', '.fe-phone', $.proxy(this._checkNumber, this));
    this.$container.on('blur', '.fe-phone', $.proxy(this._checkPhoneNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._setChangeBtnAble, this));
    this.$container.on('click', '.fe-post', $.proxy(this._getPostcode, this));
    // this.$container.on('click', '.fe-detail-address', $.proxy(this._deleteAddress, this)); // 19-09-26. OP002-4155 read only로 되면서 기능 제거
    this.$changeBtn.click(_.debounce($.proxy(this._changeAddress, this), 500));
  },
  /**
   * @function
   * @desc 숫자만 입력 가능
   * @param event
   */
  _checkNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.target); // 숫자만 입력 가능
    var $target = $(event.target);

    if (this._phoneModifyYn === 'N') { // 휴대폰번호 수정여부 체크
      if (Tw.InputHelper.isDeleteKey(event)) { // 삭제 시도 시 전체 지우기 (for masking)
        $target.val('');
      }

      if ($target.attr('data-origin-value') !== $target.val()) {
        this._phoneModifyYn = 'Y'; // 원래값과 다르면 폰번호 수정으로 간주
      }
    }

    $target.val(Tw.FormatHelper.conTelFormatWithDash($target.val())); // '-' 자동 입력
    this._setChangeBtnAble(); // 버튼 활성화
  },
  /**
   * @function
   * @desc check phone number
   * @param event
   */
  _checkPhoneNumber: function (event) {
    var $target = $(event.currentTarget);

    if ($target.val().indexOf('*') === -1) { // 마스킹된 폰번호일 경우 유효성 검증 제외 - 직접 수정한 휴대폰 번호에 한해 유효성 검증
      this.$isValid = this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 11), Tw.ALERT_MSG_MYT_FARE.ALERT_2_V18);

      if (this.$isValid) {
        var isPhone = this._validation.isCellPhone($target.val()) || this._validation.isTelephone($target.val());
        this.$isValid = this._validation.showAndHideErrorMsg($target, isPhone, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V9);
      }
    }
  },
  /**
   * @function
   * @desc 우편번호 조회 공통 컴포넌트 호출
   * @param e
   */
  _getPostcode: function (e) {
    new Tw.CommonPostcodeMain(this.$container, $(e.currentTarget), $.proxy(this._setAddress, this));
  },
  /**
   * @function
   * @desc 상세주소 영역 터치 시 전체 주소 삭제
   * @param e
   */
  _deleteAddress: function (e) {
    if (this._firstTouch) {
      this.$container.find('.fe-zip').val('');
      this.$container.find('.fe-main-address').val('');
      e.target.value = '';

      this._firstTouch = false;
    }
  },
  /**
   * @function
   * @desc 우편번호 검색 후 조회된 데이터 셋팅
   * @param address
   */
  _setAddress: function (address) {
    this.$container.find('.fe-zip').val(address.zip);
    this.$container.find('.fe-main-address').val(address.main);
    this.$container.find('.fe-detail-address').removeAttr('disabled').val(address.detail);

    this._addrModifyYn = 'Y'; // 주소 수정됨
    this._firstTouch = false; // 주소 삭제 방지값

    this._setChangeBtnAble();
  },
  /**
   * @function
   * @desc 버튼 활성화/비활성화 처리
   */
  _setChangeBtnAble: function () {
    if (!Tw.FormatHelper.isEmpty($.trim(this.$container.find('.fe-phone').val()))) {
      this.$container.find('.fe-change').removeAttr('disabled');
    } else {
      this.$container.find('.fe-change').attr('disabled', 'disabled');
    }
  },
  /**
   * @function
   * @desc 주소 및 연락처 변경 API 호출
   * @param e
   */
  _changeAddress: function (e) {
    var $target = $(e.currentTarget);
    if (this.$isValid) {
      this._apiService.request(Tw.API_CMD.BFF_05_0147, this._makeRequestData())
        .done($.proxy(this._changeSuccess, this, $target))
        .fail($.proxy(this._changeFail, this, $target));
    } else {
      this.$container.find('.fe-phone').focus();
    }
  },
  /**
   * @function
   * @desc 요청 파라미터 생성
   * @returns {*}
   */
  _makeRequestData: function () {
    if (this._addrModifyYn === 'N') {
      this._checkIsChangedDetailAddress();
    }

    this._changeData = {
      billSvcNum: $.trim(this.$container.find('.fe-phone').val()),
      zip: $.trim(this.$container.find('.fe-zip').val()),
      basAddr: $.trim(this.$container.find('.fe-main-address').val()),
      dtlAddr: $.trim(this.$container.find('.fe-detail-address').val()),
      svcNumChgYn: this._phoneModifyYn,
      addrChgYn: this._addrModifyYn
    };
    return this._changeData;
  },
  /**
   * @function
   * @desc 주소 변경 여부 체크
   */
  _checkIsChangedDetailAddress: function () {
    var $detailAddress = this.$container.find('.fe-detail-address');
    if ($detailAddress.attr('data-origin-value') !== $.trim($detailAddress.val())) {
      this._addrModifyYn = 'Y';
    }
  },
  /**
   * @function
   * @desc 주소 및 연락처 변경 API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _changeSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.goLoad('/myt-fare/bill/option?type=change');
    } else {
      this._changeFail($target, res);
    }
  },
  /**
   * @function
   * @desc 주소 및 연락처 변경 API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _changeFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  }
};
