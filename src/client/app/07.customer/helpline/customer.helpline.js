/**
 * FileName: customer.helpline.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.18
 */


Tw.CustomerHelpline = function (rootEl, timeInfo) {
  this.$container = rootEl;
  this._availableTimes = timeInfo.availHours;
  this._reservationDate = timeInfo.curDate;
  this._historyService = new Tw.HistoryService(rootEl);
  this._historyService.init('hash');

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;


  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerHelpline.prototype = {
  _init: function () {
    this._reservationTime = this._availableTimes[0];
  },

  _bindEvent: function () {
    this.$container.on('click', '.prev-step', $.proxy(this._openCancelPopup, this));
    this.$areaPhone.on('keyup', 'input', $.proxy(this._handleTypePhone, this));
    this.$areaPhone.on('change', 'input', $.proxy(this._validatePhone, this));
    this.$btnSubmit.on('click', $.proxy(this._handleSubmit, this));
    this.$btnType.on('click', $.proxy(this._openSelectTypePopup, this));
    this.$btnArea.on('click', $.proxy(this._openSelectAreaPopup, this));
    this.$btnTime.on('click', $.proxy(this._openSelectTimePopup, this));
  },

  _cachedElement: function () {
    this.$btnType = this.$container.find('.fe-type');
    this.$btnArea = this.$container.find('.fe-area');
    this.$btnTime = this.$container.find('.fe-time');
    this.$areaPhone = this.$container.find('.inputbox.bt-add.mt20');
    this.$btnSubmit = this.$container.find('.bt-red1 button');
  },

  _openCancelPopup: function () {
    this._popupService.openConfirm(Tw.MSG_CUSTOMER.HELPLINE_A01, Tw.POPUP_TITLE.CANCEL_HELPLINE, $.proxy(this._clearData, this));
  },

  _clearData: function () {
    delete this._reservationType;
    delete this._reservationArea;
    
    this.$btnType.text(Tw.HELPLINE_TYPE.GENERAL);
    this.$btnArea.text(Tw.HELPLINE_AREA.CAPITAL);

    var currentHours = (new Date()).getHours();
    this._availableTimes = _.filter(this._availableTimes, function (time) {
      return Number(time) > currentHours;
    });
    
    this._reservationTime = this._availableTimes[0];
    this.$btnTime.text(this._availableTimes[0] + ':00');
    this.$areaPhone.find('input').val('');
    this._validatePhone();
    this._setSubmitState();
    this._popupService.close();
  },

  _validatePhone: function () {
    var $errorText = this.$areaPhone.find('#aria-phone-tx1');
    var $input = this.$areaPhone.find('input');
    var errorState = this.$areaPhone.hasClass('error');
    var number = $input.val();

    this.isValidated = Tw.ValidationHelper.isTelephone(number) || Tw.ValidationHelper.isCellPhone(number);

    if (number && !this.isValidated) {
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

  _openSelectTypePopup: function () {
    var data = Tw.HELPLINE_TYPES.slice();
    data[this._reservationType || 0] = { value: data[this._reservationType || 0].value, option: 'checked' };

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SET_HELPLINE_TYPE,
      data:[{ list: data }]
    }, $.proxy(this._handleOpenSelectTypePopup, this));
  },

  _openSelectAreaPopup: function () {
    var data = Tw.HELPLINE_AREAS.slice();
    var type = this._reservationType || "1";
    data = _.map(data, function (area) {
      if (area.attr.indexOf(type) >= 0) {
        return {
          value: area.value,
          attr: area.attr,
          option: 'checked'
        };
      }
      return area;
    });

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SET_HELPLINE_AREA,
      data:[{ list: data }]
    }, $.proxy(this._handleOpenSelectAreaPopup, this));
  },

  _openSelectTimePopup: function () {
    var currentHours = (new Date()).getHours();
    var time = this._reservationTime;
    var times = _.chain(this._availableTimes).filter(function (time) {
      return Number(time) > currentHours;
    }).map(function (time) {
      if (time === this._reservationTime) {
        return {
          option: 'checked',
          value: time + ':00'
        };
      } else {
        return { value: time + ':00' };
      }
    }).value();

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.SET_TIME,
      data:[{ list: times }]
    }, $.proxy(this._handleOpenSelectTimePopup, this));
  },

  _handleOpenSelectTypePopup: function ($layer) {
    $layer.on('click', 'li', $.proxy(this._handleSelectType, this, $layer));
  },

  _handleOpenSelectAreaPopup: function ($layer) {
    $layer.on('click', 'button', $.proxy(this._handleSelectArea, this));
  },

  _handleOpenSelectTimePopup: function ($layer) {
    $layer.on('click', 'button', $.proxy(this._handlSelectTime, this));
  },


  _handleSelectType: function ($layer, e) {
    var $target = $(e.currentTarget);
    var selectedIdx = $layer.find('li').index($target);
    var selectedType = $target.find('span.info-value').text();

    if (selectedIdx !== this._reservationType) {
      this._reservationType = selectedIdx;
      this.$btnType.text(selectedType);
    }
    this._popupService.close();
  },

  _handleSelectArea: function (e) {
    var selectedArea = e.currentTarget.getAttribute('data-area-code');

    if (selectedArea !== this._reservationArea) {
      this._reservationArea = selectedArea;
      this.$btnArea.text(e.target.innerText);
    }
    this._popupService.close();
  },

  _handlSelectTime: function (e) {
    var selectedTime = $(e.currentTarget).find('span.info-value').text();
    var selectedHours = selectedTime.slice(0,2);
    
    if (selectedHours !== this._reservationTime) {
      this._reservationTime = selectedHours;
      this.$btnTime.text(selectedTime);
    }

    this._popupService.close();
  },


  _handleTypePhone: function (e) {
    this._reservationPhoneNum = e.target.value;
    this._setSubmitState();
  },

  _setSubmitState: function () {
    var disabled = this.$btnSubmit.attr('disabled');

    if (this._reservationPhoneNum) {
      if (disabled) this.$btnSubmit.removeAttr('disabled');
    } else {
      if (!disabled) this.$btnSubmit.attr('disabled', true);
    }
  },


  _handleSubmit: function () {
    if (!this.isValidated) {
      this.$areaPhone.find('input').focus();
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0002, {
      reserveType: (this._reservationType || 0).toString(),
      reserveArea: this._reservationArea || "1",
      reserveTime: this._reservationDate.replace(/\./g, '') + this._reservationTime,
      reserveSvcNum: this._reservationPhoneNum
    })
      .done($.proxy(this._successSubmit, this));
  },

  _successSubmit: function (resp) {    
    if (resp.code === Tw.API_CODE.CODE_00) {
      if (resp.result.historiesYn === 'Y') {
        this._clearData();
        this._popupService.openConfirm(
          Tw.ALERT_MSG_CUSTOMER.ALERT_HELPLINE_A02,
          Tw.POPUP_TITLE.ALREADY_EXIST_RESERVATION,
          $.proxy(this._go, this, '/main/home') // TODO: 나의 예약현황보기로 이동
        );
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
  },

  _go: function (url) {
    this._historyService.goLoad(url);
  }
};