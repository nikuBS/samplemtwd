/**
 * FileName: customer.helpline.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.18
 */

Tw.CustomerHelpline = function(rootEl, timeInfo) {
  this.$container = rootEl;
  this._availableTimes = timeInfo.availHours;
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
    this.$container.on('click', '.prev-step', $.proxy(this._openCancelPopup, this));
    this.$container.on('click', 'span.bt-box', $.proxy(this._openContacts, this));
    this.$areaPhone.on('keyup', 'input', $.proxy(this._handleTypePhoneNumber, this));
    this.$areaPhone.on('change', 'input', $.proxy(this._validatePhoneNumber, this));
    this.$btnSubmit.on('click', $.proxy(this._handleSubmit, this));
    this.$btnType.on('click', $.proxy(this._openSelectTypePopup, this));
    this.$btnArea.on('click', $.proxy(this._openSelectAreaPopup, this));
    this.$btnTime.on('click', $.proxy(this._openSelectTimePopup, this));
  },

  _cachedElement: function() {
    this.$btnType = this.$container.find('#fe-type');
    this.$btnArea = this.$container.find('#fe-area');
    this.$btnTime = this.$container.find('#fe-time');
    this.$areaPhone = this.$container.find('.inputbox.bt-add.mt20');
    this.$btnSubmit = this.$container.find('.bt-red1 button');
  },

  _openCancelPopup: function() {
    this._popupService.openConfirm(Tw.ALERT_MSG_CUSTOMER.HELPLINE_A01, Tw.POPUP_TITLE.CANCEL_HELPLINE, $.proxy(this._handleCancel, this));
  },

  _handleCancel: function() {
    this._historyService.go(-2);
  },

  _openContacts: function() {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._handleGetContact, this));
  },

  _handleGetContact: function(resp) {
    if (resp.params && resp.params.phoneNumber) {
      this.$areaPhone.find('input').val(resp.params.phoneNumber.replace(/-/g, ''));
      this._setSubmitState();
    }
  },

  _validatePhoneNumber: function() {
    var $errorText = this.$areaPhone.find('#aria-phone-tx1'),
      $input = this.$areaPhone.find('input'),
      errorState = this.$areaPhone.hasClass('error'),
      number = $input.val(),
      isValid = Tw.ValidationHelper.isTelephone(number) || Tw.ValidationHelper.isCellPhone(number);

    if (number && !isValid) {
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

    return isValid;
  },

  _openSelectTypePopup: function() {
    var selected = this._reservationType || 0;
    var data = _.map(Tw.HELPLINE_TYPES, function(type, idx) {
      if (idx === selected) {
        return $.extend({}, type, { 'radio-attr': type['radio-attr'] + ' checked' });
      }
      return type;
    });

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: data }]
      },
      $.proxy(this._handleOpenSelectTypePopup, this)
    );
  },

  _openSelectAreaPopup: function() {
    var type = this._reservationArea || 1;
    var data = _.map(Tw.CUSTOMER_HELPLINE_AREAS, function(area) {
      if (area['radio-attr'].indexOf(type) !== -1) {
        return $.extend({}, area, { 'radio-attr': area['radio-attr'] + ' checked' });
      }
      return area;
    });

    this._popupService.open(
      {
        hbs: 'actionsheet01',
        layer: true,
        btnfloating: { class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: data }]
      },
      $.proxy(this._handleOpenSelectAreaPopup, this)
    );
  },

  _openSelectTimePopup: function() {
    var currentHours = new Date().getHours();
    var times = _.chain(this._availableTimes)
      .filter(function(time) {
        return Number(time) > currentHours;
      })
      .map(function(time) {
        if (time === this._reservationTime) {
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
        btnfloating: { class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: times }]
      },
      $.proxy(this._handleOpenSelectTimePopup, this)
    );
  },

  _handleOpenSelectTypePopup: function($layer) {
    $layer.on('click', 'li.type1', $.proxy(this._handleSelectType, this));
  },

  _handleOpenSelectAreaPopup: function($layer) {
    $layer.on('click', 'li.type1', $.proxy(this._handleSelectArea, this));
  },

  _handleOpenSelectTimePopup: function($layer) {
    $layer.on('click', 'li.type1', $.proxy(this._handlSelectTime, this));
  },

  _handleSelectType: function(e) {
    var $target = $(e.currentTarget),
      $input = $target.find('input'),
      selectedIdx = $input.data('type-idx'),
      selectedType = $target.find('.txt').text();

    if (selectedIdx !== this._reservationType) {
      this._reservationType = selectedIdx;
      this.$btnType.text(selectedType);
    }
    this._popupService.close();
  },

  _handleSelectArea: function(e) {
    var $target = $(e.currentTarget),
      $input = $target.find('input'),
      selectedArea = $input.data('area-code');

    if (selectedArea !== this._reservationArea) {
      this._reservationArea = selectedArea;
      this.$btnArea.text($target.find('.txt').text());
    }
    this._popupService.close();
  },

  _handlSelectTime: function(e) {
    var $target = $(e.currentTarget),
      $input = $target.find('input'),
      selectedHours = $input.data('time'),
      selectedTime = $target.find('.txt').text();

    if (selectedHours !== this._reservationTime) {
      this._reservationTime = selectedHours;
      this.$btnTime.text(selectedTime);
    }

    this._popupService.close();
  },

  _handleTypePhoneNumber: function(e) {
    this._reservationPhoneNum = e.target.value;
    this._setSubmitState();
  },

  _setSubmitState: function() {
    var disabled = this.$btnSubmit.attr('disabled');

    if (this._reservationPhoneNum) {
      if (disabled) this.$btnSubmit.removeAttr('disabled');
    } else {
      if (!disabled) this.$btnSubmit.attr('disabled', true);
    }
  },

  _handleSubmit: function() {
    if (!this._validatePhoneNumber()) {
      return this.$areaPhone.find('input').focus();
    }

    this._apiService
      .request(Tw.API_CMD.BFF_08_0002, {
        reserveType: (this._reservationType || 0).toString(),
        reserveArea: (this._reservationArea || 1).toString(),
        reserveTime: this._reservationDate + this._reservationTime,
        reserveSvcNum: this._reservationPhoneNum
      })
      .done($.proxy(this._successSubmit, this));
  },

  _successSubmit: function(resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      if (resp.result.historiesYn === 'Y') {
        this._popupService.openAlert(Tw.ALERT_MSG_CUSTOMER.ALERT_HELPLINE_A02, Tw.POPUP_TITLE.ALREADY_EXIST_RESERVATION);
      } else {
        this._popupService.open({
          hbs: 'CS_14_01_complete',
          data: {
            date: Tw.DateHelper.getShortDateNoDot(resp.result.date),
            weekday: resp.result.weekName,
            time: resp.result.hour.replace('00', ':00'),
            type: resp.result.reserveType,
            area: resp.result.reserveArea,
            number: Tw.FormatHelper.getDashedPhoneNumber(resp.result.reserveSvcNum)
          }
        });
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  }
};
