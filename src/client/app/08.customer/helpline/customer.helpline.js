/**
 * FileName: customer.helpline.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.25
 */

Tw.CustomerHelpline = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerHelpline.prototype = {
  _init: function () {
    this._availableTimes = this.$btnTime.data('available-times');
    this._reservationTime = this._availableTimes[0];
    this._reservationDate = this.$container.find('.inputbox.bt-add2 input').val();
    this._reservationType = 0;
  },

  _bindEvent: function () {
    this.$container.on('click', '.form-cell button', $.proxy(this._openSelectPopup, this));
    this.$container.on('click', '.bt-slice.item-two .bt-white2', $.proxy(this._openCancelPopup, this));
    this.$container.on('click', '.close-step', $.proxy(this._openClosePopup, this));
    this.$areaPhone.on('keyup', 'input', $.proxy(this._handlePhoneType, this));
    this.$areaPhone.on('change', 'input', $.proxy(this._validatePhone, this));
    this.$btnSubmit.on('click', $.proxy(this._handleSubmit, this));
  },

  _cachedElement: function () {
    this.$btnType = this.$container.find('.fe-type');
    this.$btnArea = this.$container.find('.fe-area');
    this.$btnTime = this.$container.find('.fe-time');
    this.$btnSubmit = this.$container.find('.bt-red1 button');
    this.$areaPhone = this.$container.find('.inputbox.mt10');
  },

  _openSelectPopup: function (e) {
    var $target = $(e.currentTarget);
    if ($target.hasClass('fe-type')) {
      this._openSelectTypePopup();
    } else if ($target.hasClass('fe-area')) {
      this._openSelectAreaPopup();
    } else if ($target.hasClass('fe-time')) {
      this._openSelectTimePopup();
    }
  },

  _openSelectTypePopup: function () {
    this._popupService.open({
      'hbs': 'select',
      'title': Tw.POPUP_TITLE.SET_HELPLINE_TYPE,
      'select': [
        {
          'options': [
            { 'title': Tw.HELPLINE_TYPE.GENERAL, checked: this._reservationType === 0, value: 0, text: Tw.HELPLINE_TYPE.GENERAL },
            { 'title': Tw.HELPLINE_TYPE.ROAMING, checked: this._reservationType === 1, value: 1, text: Tw.HELPLINE_TYPE.ROAMING },
            { 'title': Tw.HELPLINE_TYPE.QUALITY, checked: this._reservationType === 2, value: 2, text: Tw.HELPLINE_TYPE.QUALITY }
          ]
        }
      ],
      'bt_num': 'one',
      'type': [{
        style_class: 'bt-red1',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._handleSelectType, this));
  },

  _openSelectAreaPopup: function () {
    this._popupService.open({
      'hbs': 'choice',
      'title': Tw.POPUP_TITLE.SET_HELPLINE_AREA,
      'close_bt': true,
      'list': [
        { 'attr': 'data-area-code="1"', text: Tw.HELPLINE_AREA.CAPITAL },
        { 'attr': 'data-area-code="5"', text: Tw.HELPLINE_AREA.CENTER },
        { 'attr': 'data-area-code="4"', text: Tw.HELPLINE_AREA.EAST },
        { 'attr': 'data-area-code="3"', text: Tw.HELPLINE_AREA.DAEGU },
        { 'attr': 'data-area-code="2"', text: Tw.HELPLINE_AREA.BUSAN }
      ]
    }, $.proxy(this._handleSelectArea, this));
  },

  _openSelectTimePopup: function () {
    var times = this._availableTimes.map($.proxy(this._getTimeData, this));

    this._popupService.open({
      'hbs': 'select',
      'title': Tw.POPUP_TITLE.SET_HELPLINE_TIME,
      'select': [{ 'options': times }],
      'bt_num': 'one',
      'type': [{
        style_class: 'bt-red1',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._handleSelectTime, this));
  },

  _handleSelectType: function ($layer) {
    $layer.on('click', '.btn-box button', $.proxy(this._handleConfirmType, this, $layer));
  },

  _handleSelectArea: function ($layer) {
    $layer.on('click', '.popup-choice-list button', $.proxy(this._handleAreaClick, this));
  },

  _handleSelectTime: function ($layer) {
    $layer.on('click', '.btn-box button', $.proxy(this._handleConfirmTime, this, $layer));
  },

  _handleAreaClick: function (e) {
    var selectedArea = e.target.getAttribute('data-area-code');

    if (selectedArea !== this._reservationArea) {
      this._reservationArea = selectedArea;
      this.$btnArea.text(e.target.innerText);
      this.$btnArea.removeClass('placeholder');
    }
    this._setSubmitState();
    this._popupService.close();
  },

  _handleConfirmTime: function ($layer) {
    var selectedTime = $layer.find('.select-list li.checked input').attr('value');

    if (selectedTime !== this._reservationTime) {
      this._reservationTime = selectedTime;
      this.$btnTime.text(selectedTime + ':00');
    }
    this._setSubmitState();
    this._popupService.close();
  },

  _handleConfirmType: function ($layer) {
    var selectedItem = $layer.find('.select-list li.checked input');
    var selectedType = selectedItem.attr('value');

    if (selectedType !== this._reservationType) {
      this._reservationType = selectedType;
      this.$btnType.text(selectedItem.attr('title'));
    }
    this._setSubmitState();
    this._popupService.close();
  },

  _handlePhoneType: function (e) {
    this._reservationPhoneNum = e.target.value;
    this._setSubmitState();
  },

  _validatePhone: function () {
    var $errorText = this.$areaPhone.find('#aria-exp-desc3');
    var $input = this.$areaPhone.find('input');
    var errorState = this.$areaPhone.hasClass('error');

    var isValidated = Tw.ValidationHelper.isTelephone(this._reservationPhoneNum) || Tw.ValidationHelper.isCellPhone(this._reservationPhoneNum);

    if (this._reservationPhoneNum && !isValidated) {
      if (!errorState) {
        this.$areaPhone.addClass('error');
        $input.attr('aria-describedby', 'aria-exp-desc2 aria-exp-desc3');
        $errorText.removeClass('none');
      }
    } else {
      if (errorState) {
        this.$areaPhone.removeClass('error');
        $input.attr('aria-describedby', 'aria-exp-desc2');
        $errorText.addClass('none');
      }
    }
  },

  _setSubmitState: function () {
    var disabled = this.$btnSubmit.attr('disabled');

    if (this._reservationArea && this._reservationPhoneNum) {
      if (disabled) this.$btnSubmit.attr('disabled', false);
    } else {
      if (!disabled) this.$btnSubmit.attr('disabled', true);
    }
  },

  _openCancelPopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, Tw.MSG_CUSTOMER.HELPLINE_A01, undefined, undefined, $.proxy(this._clearData, this));
  },

  _clearData: function () {
    this._reservationType = 0;
    this._reservationArea = '';
    this._reservationTime = this._availableTimes[0];
    this._reservationPhoneNum = '';

    this.$btnType.text(Tw.HELPLINE_TYPE.GENERAL);
    this.$btnArea.text(Tw.MSG_CUSTOMER.HELPLINE_A02);
    this.$btnArea.addClass('placeholder');
    this.$btnTime.text(this._availableTimes[0] + ':00');
    this.$areaPhone.find('input').val('');
    this._validatePhone();
    this._popupService.close();
  },

  _handleSubmit: function () {
    this._fillReservationInfo();
    this._history.setHistory();
    this._history.goHash('complete');
  },

  _fillReservationInfo: function () {
    var phoneNum = this._reservationPhoneNum;
    var formattedNum = Tw.FormatHelper.getDashedPhoneNumber(phoneNum);
    this.$container.find('.fe-number').text(formattedNum);
    this.$container.find('.fe-date').text(this._reservationDate + '(' + Tw.DateHelper.getDayOfWeek(this._reservationDate) + ')');
  },

  _openClosePopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, Tw.MSG_CUSTOMER.HELPLINE_A03, undefined, undefined, $.proxy(this._handleClose, this));
  },

  _handleClose: function () {
    this._clearData();
    this._history.goBack();
  },

  _getTimeData: function (time) {
    return {
      title: time + Tw.TIME_UNIT.HOUR,
      checked: time === this._reservationTime,
      value: time,
      text: time + ':00'
    };
  }
};