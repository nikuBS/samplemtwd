/**
 * @file 5g 시간설정 예약
 * @author anklebreaker
 * @since 2019-04-05
 */

/**
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 */
Tw.MyTData5gSettingReservation = function (rootEl, dataInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._nativeService = Tw.Native;

  this._dataInfo = JSON.parse(window.unescape(dataInfo));

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTData5gSettingReservation.prototype = {

  /**
   * @member (Number) DATA_HOUR 시간 당 데이터 1024MB
   */
  DATA_HOUR: 1024,
  /**
   * @member (Number) DATA_MINUTE 분 당 데이터 17MB
   */
  DATA_MINUTE: 17,

  /**
   * @member (Number) usedData 총 사용 데이터
   */
  usedData: 0,
  /**
   * @member (Number) usedTime 총 사용 시간
   */
  usedTime: 0,

  /**
   * @function
   * @desc 초기화
   */
  _init: function () {
    this.$container.find('.og-mod-btns .btn-round2').eq(2).trigger('click');
    this._calTime();
  },

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$input = this.$container.find('.og-time-set > input');
    this.$hour = this.$container.find('.og-time-display > .ti-me');
    this.$minute = this.$container.find('.og-time-display > .mi-n');
    this.$btn = this.$container.find('.og-mod-btns > button');
    this.$radioNoon = this.$container.find('input[name=og-noon]');
    this.$endDisplay = this.$container.find('.og-end-display > .ti-me > strong');
    this.$btnClose = this.$container.find('.popup-closeBtn');
    this.$btnReservation = this.$container.find('.fe-btn_reservation');
    this.$usedData = this.$container.find('.used-data > .og-ui-used-data');
    this.$checkNoti5Min = this.$container.find('.fe-check_noti');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$radioNoon.on('change', $.proxy(this._calTime, this));
    this.$input.on('input', $.proxy(this._onInput, this)).on('focusout', $.proxy(this._onFocusout, this));
    this.$btn.on('click', $.proxy(this._onBtnClick, this));
    this.$btnClose.on('click', Tw.PopupService.prototype._goBack);
    this.$btnReservation.on('click', $.proxy(this._onClickReservation, this));
  },

  /**
   * @function
   * @desc 숫자 한자리인 경우 0 추가
   */
  _addZero: function (n) {
    return (String(n).length < 2) ? '0' + n : n;
  },

  /**
   * @function
   * @desc 사용시간 계산
   */
  _calTime: function () {
    var apm = this.$radioNoon.filter(function (i, item) {
        return item.checked;
      }).val(),
      thisHour = this.$input.eq(0).val() === '' ? 0 : parseInt(this.$input.eq(0).val(), 10),
      thisMinute = this.$input.eq(1).val() === '' ? 0 : parseInt(this.$input.eq(1).val(), 10),
      addHour = parseInt(this.$hour.data('hour'), 10),
      addMinute = parseInt(this.$minute.data('minute'), 10),
      apmTxt, calHour, calMinute;

    // 시작 시간과 이용 시간 더하기
    calHour = thisHour + addHour;
    calMinute = thisMinute + addMinute;

    // 60분 초과시 시간 추가 및 60분 감소
    if (calMinute >= 60) {
      calHour = calHour + Math.floor(calMinute / 60);
      calMinute = calMinute - 60;
    }

    // 12시간 초과시 12시간 삭제후 오전/오후 변경
    if (calHour > 11) {
      calHour = calHour - 12;
      apm = (apm === '0') ? '1' : '0';
    }

    apmTxt = ((apm % 2) === 0) ? '오전 ' : '오후 ';
    this.$endDisplay.html(apmTxt + this._addZero(calHour) + '시 ' + this._addZero(calMinute) + '분');

    this._calData();
  },

  /**
   * @function
   * @desc 사용 데이터 계산
   */
  _calData: function () {
    var usedHour = this.$hour.data('hour'),
      usedMinute = this.$minute.data('minute');

    // 시작 시간과 이용 시간 더하기
    this.usedData = ((usedHour * this.DATA_HOUR) + (usedMinute * this.DATA_MINUTE));
    this.$usedData.html((this.usedData / 1024).toFixed(2) + 'GB');
  },

  /**
   * @function
   * @desc 시작시간 oninput
   */
  _onInput: function (e) {
    var $this = $(e.currentTarget);
    if ($this.val().length > $this.attr('maxLength')) {
      $this.val($this.val().slice(0, $this.attr('maxLength')));
    }

    this.$btn.prop('disabled', true);

    if (this.$input.eq(0).val() !== '' && this.$input.eq(1).val() !== '') {
      this.$btn.prop('disabled', false);
      this._calTime();
    }
  },

  /**
   * @function
   * @desc 시작시간 onfocusout
   */
  _onFocusout: function (e) {
    var $this = $(e.currentTarget);
    if (Number($this.val()) < Number($this.attr('min'))) {
      $this.val($this.attr('min'));
    } else if (Number($this.val()) > Number($this.attr('max'))) {
      $this.val($this.attr('max'));
    }
    $this.val(this._addZero($this.val()));
  },

  /**
   * @function
   * @desc 시간 증감 버튼 onclick
   */
  _onBtnClick: function (e) {
    e.preventDefault();

    var $this = $(e.currentTarget);
    var hour = this.$hour.data('hour');
    var minute = this.$minute.data('minute');
    var type = $this.data('addType');
    var count = 0;

    if (type === 'hour') {
      hour = parseInt(hour, 10) + parseInt($this.data('addTime'), 10);
      if (hour < 0) {
        hour = 0;
        minute = 0;
      } else if (hour >= 12) {
        hour = 12;
        minute = 0;
      }
    } else {
      minute = parseInt(minute, 10) + parseInt($this.data('addTime'), 10);
      if (minute < 0) {
        minute = hour - 1 < 0 ? 0 : 50;
        hour = hour - 1 < 0 ? 0 : hour - 1;
      } else if (minute >= 60) {
        hour = hour + 1 < 12 ? hour + 1 : 12;
        minute = 0;
      } else if (hour === 12 && minute > 0) {
        minute = 0;
      }
    }

    this.$hour.data('hour', hour).html(this._addZero(hour));
    this.$minute.data('minute', minute).html(this._addZero(minute));
    setTimeout(function () {
      if (hour === 12 && minute === 0) {
        if (count > 0) {
          window.alert('1회 최대 12시간 까지\n선택 가능합니다.');
        }
        count++;
      } else {
        count = 0;
      }
    }, 0);
    this._calTime();
    this.usedTime = hour * 60 + minute;
    this.$btnReservation.attr('disabled', this.usedTime === 0 || this.usedData > this._dataInfo.dataRemQty);
  },

  /**
   * @function
   * @desc 예약버튼 클릭 팝업호출
   */
  _onClickReservation: function () {
    var m = moment();
    var apm = Number(this.$radioNoon.filter(function (i, item) {
      return item.checked;
    }).val());
    var hour = Number(this.$input.eq(0).val());
    var min = Number(this.$input.eq(1).val());
    m.set('hours', hour + 12 * apm).set('minutes', min);

    if (this.usedData > this._dataInfo.dataRemQty) {
      this._popupService.openAlert(
        Tw.ALERT_MSG_5G.ALERT_A1.MSG,
        Tw.ALERT_MSG_5G.ALERT_A1.TITLE);
      return;
    } else if (m.isBefore(moment(), 'minutes')) {
      this._popupService.openAlert(
        Tw.ALERT_MSG_5G.ALERT_A3.MSG,
        Tw.ALERT_MSG_5G.ALERT_A3.TITLE);
      return;
    } else if (m.isBefore(moment().add(10, 'minutes'), 'minutes')) {
      this._popupService.openAlert(
        Tw.ALERT_MSG_5G.ALERT_A10.MSG,
        Tw.ALERT_MSG_5G.ALERT_A10.TITLE);
      return;
    }

    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_5G.CONFIRM_RESERVATION.MSG.replace('${data}', this.$usedData.html()),
      Tw.ALERT_MSG_5G.CONFIRM_RESERVATION.TITLE,
      $.proxy(this._onConfirmReservation, this), null,
      Tw.BUTTON_LABEL.CANCEL, Tw.ALERT_MSG_5G.CONFIRM_RESERVATION.BUTTON);
  },

  /**
   * @function
   * @desc 예약팝업 콜백 api call
   */
  _onConfirmReservation: function () {
    this._popupService.close();
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_06_0082, {
      staHhmm: this.$input.eq(0).val() + ':' + this.$input.eq(1).val(),
      timeUnit: this.usedTime
    })
    .done($.proxy(this._procConfirmRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 예약 api callback
   */
  _procConfirmRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    // 5분 미리알림 선택 시
    if (this.$checkNoti5Min.prop('checked')) {
      var m = moment();
      var apm = Number(this.$radioNoon.filter(function (i, item) {
        return item.checked;
      }).val());
      var hour = Number(this.$input.eq(0).val());
      var min = Number(this.$input.eq(1).val());
      var params = {
        startTimeStamp: this._dataInfo.today + m.set('hours', hour + 12 * apm).set('minutes', min).format('HHmm'),
        isEnabled: true
      };
      this._nativeService.send(Tw.NTV_CMD.ALARM_5G_CONVERSION, params);
    }

    this._nativeService.send(Tw.NTV_CMD.TOAST, {message: Tw.ALERT_MSG_5G.TOAST_RESERVATION});
    this._historyService.replaceURL('/myt-data/5g-setting');
  }

};
