/**
 * FileName: customer.helpline.js
 * @author Jiyoung Jo
 * Date: 2018.10.18
 */

Tw.CustomerHelpline = function(rootEl, timeInfo) {
  this.$container = rootEl;
  this._availableTimes = _.map(timeInfo.availHours, function(time) {
    return Number(time);
  });
  this._reservationDate = Tw.DateHelper.getCurrentShortDate(timeInfo.curDate);
  this._historyService = new Tw.HistoryService(rootEl);
  this._historyService.init('hash');
  this._nativeService = Tw.Native;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerHelpline.prototype = {
  _init: function() {
    this._reservationTime = this._availableTimes[0];
  },

  _bindEvent: function() {  
    // this.$container.on('click', '.prev-step', $.proxy(this._openCancelPopup, this));
    this.$container.on('click', 'span.bt-box', $.proxy(this._openContacts, this));
    this.$areaPhone.on('keyup', 'input', $.proxy(this._validatePhoneNumber, this));
    this.$container.on('click', '.cancel', $.proxy(this._validatePhoneNumber, this));
    this.$container.on('change', '.radiobox input', $.proxy(this._validatePhoneNumber, this));
    this.$btnSubmit.click(_.debounce($.proxy(this._handleSubmit, this), 300));
    this.$phoneInput.on('focusout', $.proxy(this.handleFocusoutInput, this));
    this.$phoneInput.on('focusin', $.proxy(this.handleFocusinInput, this));
    this.$btnType.on('click', $.proxy(this._openSelectTypePopup, this));
    this.$btnArea.on('click', $.proxy(this._openSelectAreaPopup, this));
    this.$btnTime.on('click', $.proxy(this._openSelectTimePopup, this));
  },

  _cachedElement: function() {
    this.$btnType = this.$container.find('#fe-type');
    this.$btnArea = this.$container.find('#fe-area');
    this.$btnTime = this.$container.find('#fe-time');
    this.$areaPhone = this.$container.find('.inputbox.bt-add.mt20');
    this.$phoneInput = this.$areaPhone.find('input');
    this.$btnSubmit = this.$container.find('.bt-red1 button');
    this.$cellphone = this.$container.find('#fe-cellphone');
    this.$telephone = this.$container.find('#fe-telephone');
    this.$cancel = this.$container.find('#fe-cancel');
  },

  // _openCancelPopup: function() {
  //   this._popupService.openConfirmButton(Tw.ALERT_CANCEL, null, $.proxy(this._handleCancel, this), null, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  // },

  // _handleCancel: function() {
  //   this._historyService.go(-2);
  // },

  _openContacts: function() { // 주소록 native에 요청
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._handleGetContact, this));
  },

  _handleGetContact: function(resp) { // 주소록에서 특정 전화번호 선택 시
    if (resp.params && resp.params.phoneNumber) {
      var number = resp.params.phoneNumber.replace(/-/g, '');
      this.$phoneInput.val(number);
      this.$cancel.css('display', 'inline').attr('aria-hidden', false);
      if (Tw.ValidationHelper.isCellPhone(number)) {  // 선택된 번호가 핸드폰 번호 일 경우
        this.$cellphone.trigger('click');
      } else {  // 선택된 번호가 집전화 번호 일 경우
        this.$telephone.trigger('click');
      }
    }
  },

  handleFocusinInput: function() {  // 전화번호 입력에 포커스가 들어오면, 숫자만 입력가능하도록 속성 추가
    this.$phoneInput.val(this.$phoneInput.val().replace(/-/g, ''));
    this.$phoneInput.attr('type', 'number');
    this.$phoneInput.attr('pattern', '[0-9]*');
  },

  handleFocusoutInput: function() {
    this._isCheckedLen = true;
    if (this._validatePhoneNumber()) {  // 입력된 전화번호가 유효하면 dash 추가
      this.$phoneInput.attr('type', 'text');
      this.$phoneInput.removeAttr('pattern');
      this.$phoneInput.val(Tw.FormatHelper.getDashedPhoneNumber(this.$phoneInput.val()));
    }
  },

  _validatePhoneNumber: function() {  // 입력된 번호가 유효한 지 검사
    var $errorText = this.$container.find('#aria-phone-tx1'),
      $input = this.$phoneInput,
      errorState = this.$areaPhone.hasClass('error'),
      number = $input.val().replace(/-/g, ''),
      isValid = false;

    if (this._isCheckedLen && (!number || !number.length)) {
      this._isCheckedLen = false; // 휴대폰 번호가 10자리 혹은 11자리 입력되기 전까지 validation 하지 않도록 함
    }

    if (this.$cellphone.hasClass('checked')) {  // 핸드폰 번호로 체크되어 있을 때
      var validLength0 = number.indexOf('010') === 0 ? 11 : 10; // 핸드폰 번호가 010이면 11자리만 입력가능
      if (number.length > 11) { // 11자리 이상 입력되었을 때 마지막 자리 삭제
        $input.val(number.substring(0, number.length - 1));
        return;
      } else if (!this._isCheckedLen && number.length === validLength0) {
        this._isCheckedLen = true;
      }

      isValid = !this._isCheckedLen || Tw.ValidationHelper.isCellPhone(number); // 휴대폰 번호 유효성 체크
    } else {
      var validLength1 = number.indexOf('02') === 0 ? 9 : /^07|8/.test(number) ? 11 : 10;
      if (number.length > validLength1) { // 전화번호 자릿수 이상 입력되었을 때 마지막 자리 삭제
        $input.val(number.substring(0, number.length - 1));
        return;
      } else if (!this._isCheckedLen && number.length === validLength1) {
        this._isCheckedLen = true;
      }
      isValid = !this._isCheckedLen || Tw.ValidationHelper.isTelephone(number); // 집전화 번호 유효성 체크
    }

    if (!isValid) { // valid하지 않은 경우, error 메세지 설정
      if (!errorState) {
        this.$areaPhone.addClass('error');
        $errorText.removeClass('none').attr('aria-hidden', false);
      }

      this._setSubmitState(false);  // submit 버튼 비활성화
    } else { // valid하지 않은 경우, error 메세지 삭제
      if (errorState) {
        this.$areaPhone.removeClass('error');
        $errorText.addClass('none').attr('aria-hidden', true);
      }

      this._setSubmitState(this._isCheckedLen); // submit 버튼 활성화
    }

    return isValid;
  },

  _openSelectTypePopup: function() {  // 전화상담 예약 상담 유형 팝업 열기
    var selected = this._reservationType || 0;  // default 값은 일반(0)
    var data = _.map(Tw.HELPLINE_TYPES, function(type, idx) { // 현재 선택된 상담 유형 checked 추가
      if (idx === selected) {
        return $.extend({}, type, { 'radio-attr': type['radio-attr'] + ' checked' });
      }
      return type;
    });

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: data }]
      },
      $.proxy(this._handleOpenSelectTypePopup, this),
      undefined,
      undefined,
      this.$btnType
    );
  },

  _openSelectAreaPopup: function() {  // 전화상담 예약 상담 지역 팝업 열기
    var type = this._reservationArea || 1;
    var data = _.map(Tw.CUSTOMER_HELPLINE_AREAS, function(area) { // 현재 선택된 지역 checked 추가
      if (area['radio-attr'].indexOf(type) !== -1) {
        return $.extend({}, area, { 'radio-attr': area['radio-attr'] + ' checked' });
      }
      return area;
    });

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: data }]
      },
      $.proxy(this._handleOpenSelectAreaPopup, this),
      undefined,
      undefined,
      this.$btnArea
    );
  },

  _openSelectTimePopup: function() {  // 전화상담 예약 상담 시간 팝업 열기
    var selectedTime = this._reservationTime;
    var times = _.chain(this._availableTimes)
      .map(function(time) { // 현재 선택된 시간 checked 추가
        if (time === selectedTime) {
          return {
            txt: time + ':00',
            'radio-attr': 'data-time="' + time + '" checked'
          };
        } else {
          return { txt: time + ':00', 'radio-attr': 'data-time="' + time + '"' };
        }
      })
      .value();

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: times }]
      },
      $.proxy(this._handleOpenSelectTimePopup, this),
      undefined,
      undefined,
      this.$btnTime
    );
  },

  _handleOpenSelectTypePopup: function($layer) {  // 상담 유형 팝업 이벤트 추가
    $layer.on('click', 'li.type1', $.proxy(this._handleSelectType, this));
  },

  _handleOpenSelectAreaPopup: function($layer) {  // 상담 지역 팝업 이벤트 추가
    $layer.on('click', 'li.type1', $.proxy(this._handleSelectArea, this));
  },

  _handleOpenSelectTimePopup: function($layer) {  // 상담 시간 팝업 이벤트 추가
    $layer.on('click', 'li.type1', $.proxy(this._handlSelectTime, this));
  },

  _handleSelectType: function(e) {  // 상담 유형이 클릭 되면
    var $target = $(e.currentTarget),
      $input = $target.find('input'),
      selectedIdx = $input.data('type-idx'),
      selectedType = $target.find('.txt').text();

    if (selectedIdx !== this._reservationType) {  // 기선택된 상담 유형이랑 다를 경우
      this._reservationType = selectedIdx;
      this.$btnType.text(selectedType); // 상담 유형 문구를 현재 선택된 상담 유형으로 변경
    }
    this._popupService.close();
  },

  _handleSelectArea: function(e) {  // 상담 지역 클릭 되면
    var $target = $(e.currentTarget),
      $input = $target.find('input'),
      selectedArea = $input.data('area-code');

    if (selectedArea !== this._reservationArea) { // 기선택된 상담 지역이랑 다를 경우
      this._reservationArea = selectedArea;
      this.$btnArea.text($target.find('.txt').text());  // 상담 지역 문구를 현재 선택된 지역으로 변경
    }
    this._popupService.close();
  },

  _handlSelectTime: function(e) { // 상담 시간 클릭 되면 
    var $target = $(e.currentTarget),
      $input = $target.find('input'),
      selectedHours = $input.data('time'),
      selectedTime = $target.find('.txt').text();

    if (selectedHours !== this._reservationTime) {  // 기선택된 상담 시간이랑 다를 경우
      this._reservationTime = selectedHours;  
      this.$btnTime.text(selectedTime); // 상담 시간 문구를 현재 선택된 시간으로 변경
    }

    this._popupService.close();
  },

  _setSubmitState: function(enable) { // 예약하기 버튼 상태 변경, enable 이 true 이면 버튼 활성화
    if (enable) {
      this.$btnSubmit.removeAttr('disabled');
    } else {
      this.$btnSubmit.attr('disabled', true);
    }
  },

  _handleSubmit: function() { // 예약하기 버튼 클릭
    if (!this._validatePhoneNumber()) { // 유효한 번호가 아닐 경우 전화번호 입력창에 포커스
      return this.$phoneInput.focus();
    }

    this._apiService
      .request(Tw.API_CMD.BFF_08_0002, {
        reserveType: (this._reservationType || 0).toString(),
        reserveArea: (this._reservationArea || 1).toString(),
        reserveTime: this._reservationDate + this._reservationTime,
        reserveSvcNum: this.$phoneInput.val().replace(/-/g, '')
      })
      .done($.proxy(this._successSubmit, this));
  },

  _successSubmit: function(resp) {  // 전화상담 예약 완료시
    if (resp.code === Tw.API_CODE.CODE_00) {  
      if (resp.result.historiesYn === 'Y') {  // 이미 예약 내용이 있을 경우
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_HELPLINE_A02);
      } else { 
        this.$phoneInput.val('');
        this._popupService.open({
          hbs: 'complete_c_type',
          layer: true,
          title: Tw.CUSTOMER_HELPLINE_COMPLETE.TITLE,
          items: [
            { key: Tw.CUSTOMER_HELPLINE_COMPLETE.DATE, value: Tw.DateHelper.getShortDate(resp.result.date) + '(' + resp.result.weekName + ')' },
            { key: Tw.CUSTOMER_HELPLINE_COMPLETE.TIME, value: resp.result.hour.replace(/00$/, ':00') },
            { key: Tw.CUSTOMER_HELPLINE_COMPLETE.TYPE, value: resp.result.reserveType },
            { key: Tw.CUSTOMER_HELPLINE_COMPLETE.AREA, value: resp.result.reserveArea },
            { key: Tw.CUSTOMER_HELPLINE_COMPLETE.PHONE_NUMBER, value: Tw.FormatHelper.getDashedPhoneNumber(resp.result.reserveSvcNum) }
          ]
        });
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  }
};
