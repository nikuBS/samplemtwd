/**
 * FileName: myt-fare.bill.change.address.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.13
 * Annotation: 자동납부 미사용자의 연락처 및 주소 변경
 */

Tw.MyTFareBillChangeAddress = function (rootEl) {
  this.$container = rootEl;
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
  _bindEvent: function () {
    this.$container.on('keyup', '.required-input-field', $.proxy(this._setChangeBtnAble, this));
    this.$container.on('keyup', '.fe-phone', $.proxy(this._checkNumber, this));
    this.$container.on('blur', '.fe-phone', $.proxy(this._checkPhoneNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._setChangeBtnAble, this));
    this.$container.on('click', '.fe-post', $.proxy(this._getPostcode, this));
    this.$container.on('click', '.fe-detail-address', $.proxy(this._deleteAddress, this));
    this.$container.on('click', '.fe-change', $.proxy(this._changeAddress, this));
  },
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
  _getPostcode: function (e) {
    new Tw.CommonPostcodeMain(this.$container, $(e.currentTarget), $.proxy(this._setAddress, this)); // 우편번호 조회 공통 컴포넌트
  },
  _deleteAddress: function (e) {
    if (this._firstTouch) { // 상세주소 영역 터치 시 전체 주소 삭제
      this.$container.find('.fe-zip').val('');
      this.$container.find('.fe-main-address').val('');
      e.target.value = '';

      this._firstTouch = false;
    }
  },
  _setAddress: function (address) {
    // 우편번호 검색 후 조회된 데이터 셋팅
    this.$container.find('.fe-zip').val(address.zip);
    this.$container.find('.fe-main-address').val(address.main);
    this.$container.find('.fe-detail-address').removeAttr('disabled').val(address.detail);

    this._addrModifyYn = 'Y'; // 주소 수정됨
    this._firstTouch = false; // 주소 삭제 방지값

    this._setChangeBtnAble();
  },
  _setChangeBtnAble: function () {
    if (!Tw.FormatHelper.isEmpty($.trim(this.$container.find('.fe-phone').val()))) {
      this.$container.find('.fe-change').removeAttr('disabled');
    } else {
      this.$container.find('.fe-change').attr('disabled', 'disabled');
    }
  },
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
  _makeRequestData: function () {
    if (this._addrModifyYn === 'N') {
      this._checkIsChangedDetailAddress();
    }

    // 요청 파라미터
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
  _checkIsChangedDetailAddress: function () {
    // 주소 변경 여부 체크
    var $detailAddress = this.$container.find('.fe-detail-address');
    if ($detailAddress.attr('data-origin-value') !== $.trim($detailAddress.val())) {
      this._addrModifyYn = 'Y';
    }
  },
  _changeSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.goLoad('/myt-fare/bill/option?type=change');
    } else {
      this._changeFail($target, res);
    }
  },
  _changeFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  }
};