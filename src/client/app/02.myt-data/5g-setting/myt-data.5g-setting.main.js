/**
 * @file 5g 시간설정
 * @author anklebreaker
 * @since 2019-04-05
 */

/**
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 */
Tw.MyTData5gSettingMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);

  this._initCircleDatepicker();
  this._cachedElement();
  this._bindEvent();

};

Tw.MyTData5gSettingMain.prototype = {

  DATA_HOUR: 1024,
  DATA_MINUTE: 17,
  haveData: null,
  hour: 0,
  min: 0,

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$btnTimeSetting = this.$container.find('.fe-btn_time-setting');
    this.$btn5gStart = this.$container.find('.fe-btn_5g-start');

    this.$datePicker = this.$container.find('.circle-datepicker');
    this.$timeContent = this.$container.find('.og-timeConf-wrap');
    this.$timeButton = this.$container.find('.og-start5G > button');
    this.$before = this.$container.find('.og-data-compare > .be-fore > span > strong.val-ue');
    this.$after = this.$container.find('.og-data-compare > .af-ter > span > strong.val-ue');

    this.$circlePi = this.$container.find('#circle_pi');
    this.$notice_case1 = this.$container.find('.notice_case1');
    this.$notice_case2 = this.$container.find('.notice_case2');
    this.$notice_case3 = this.$container.find('.notice_case3');
    this.$time = this.$container.find('.ti-me');
    this.$min = this.$container.find('.mi-n');

    this.haveData = parseInt(this.$after.data('haveData'), 10);
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$btnTimeSetting.on('click', $.proxy(this._openTimeSetting, this));
    this.$btn5gStart.on('click', $.proxy(this._start5g, this));
    this.$datePicker.circle_datepicker().on('timer', _.debounce($.proxy(this._onTimer, this), 10));
  },

  /**
   * @function
   * @desc 설정하기 circleDatepicker init
   */
  _initCircleDatepicker: function () {
    var pluginName = 'circle_datepicker';
    var defaults = {
      start: 12,
      end: 12,
      step: 15,
      width: 230,
      height: 230,
      step_mins: 15,
      gradation: 4.9315   // 5로 설정하면 72칸으로 00시 00분에서 11시 50분까지 선택 가능. 4.9315로 설정시 73칸으로 00시 00분에서 12시 00분까지 선택 가능
    };

    function polar_to_cartesian(cx, cy, radius, angle) {
      var radians;
      radians = (angle - 90) * Math.PI / 180.0;
      return [Math.round((cx + (radius * Math.cos(radians))) * 100) / 100, Math.round((cy + (radius * Math.sin(radians))) * 100) / 100];
    }

    function svg_arc_path(x, y, radius, range) {
      var end_xy, start_xy, longRange;
      start_xy = polar_to_cartesian(x, y, radius, range[1]);
      end_xy = polar_to_cartesian(x, y, radius, range[0]);
      longRange = range[1] - range[0] >= 180 ? 1 : 0;
      return 'M ' + start_xy[0] + ' ' + start_xy[1] + ' A ' + radius + ' ' + radius + ' 0 ' + longRange + ' 0 ' + end_xy[0] + ' ' + end_xy[1];
    }

    function angle_from_point(width, height, x, y) {
      return -Math.atan2(width / 2 - x, height / 2 - y) * 180 / Math.PI;
    }

    function time_to_angle(time) {
      return (time - 6) * 360 / 12 - 180;
    }

    function timerange_to_angle(timeRange) {
      return [time_to_angle(timeRange[0]), time_to_angle(timeRange[1])];
    }

    function angle_to_time(angle, step_mins) {
      return 6 + Math.floor((180 + angle) * 12 / 360 * (60 / step_mins)) / (60 / step_mins);
    }


    var CircleDatepicker = function (element, options) {
      this.$el = $(element);
      this.options = $.extend({}, defaults, options);
      this.$path = this.options.path_el ? $(this.options.path_el) : this.$el.find('.circle-datepicker__path');
      this.$end = this.options.end_el ? $(this.options.end_el) : this.$el.find('.circle-datepicker__end');
      this.$endBack = this.options.endBack_el ? $(this.options.endBack_el) : this.$el.find('.circle-datepicker__endBack');
      this.value = timerange_to_angle([this.options.start, this.options.end]);
      this.pressed = null;
      this.oldValues = [];
      this.angle = 0;
      this.oldCircle = 0;
      this.init();
    };

    CircleDatepicker.prototype.init = function () {
      var _this = this;

      this.draw();

      //['path', 'start', 'end'].forEach(function(el){
      ['end'].forEach(function (el) {
        $(_this['$' + el]).on('mousedown touchstart', function (e) {
          this.elMouseDown(e, el);
          _this.startTrigger.bind(_this)();
        }.bind(_this));
      });

      $(document).on('mouseup touchend', function () {
        _this.pressed = null;
      });

      $(document).on('mousemove touchmove', _this.docMouseMove.bind(_this));


      this.$el.on('circledatepickerredraw', function (e, options) {
        _this.value[0] = 0;
        _this.value[1] = options.pi;
        //_this.value[2] = options.pi / 5; // 2.5는 한칸당 5분 / 5는 한칸당 10분
        _this.value[2] = options.pi / _this.options.gradation; // 72칸이 아닌 73칸으로 만들기 위해

        _this.draw.bind(_this)();
        _this.trigger.bind(_this)();
      });
    };

    CircleDatepicker.prototype.elMouseDown = function (e, el) {
      var pageX, pageY;

      e.preventDefault();

      pageX = e.type === 'mousedown' ? e.pageX : e.originalEvent.changedTouches[0].pageX;
      pageY = e.type === 'mousedown' ? e.pageY : e.originalEvent.changedTouches[0].pageY;

      this.angle = angle_from_point(this.options.width, this.options.height, pageX - this.$el.offset().left, pageY - this.$el.offset().top);
      this.oldValues = [this.value[0], this.value[1]];
      this.pressed = el;
    };

    CircleDatepicker.prototype.docMouseMove = function (e) {
      var pageX, pageY, diff;

      if (this.pressed) {
        e.preventDefault();

        pageX = e.type === 'mousemove' ? e.pageX : e.originalEvent.changedTouches[0].pageX;
        pageY = e.type === 'mousemove' ? e.pageY : e.originalEvent.changedTouches[0].pageY;
        diff = this.angle - angle_from_point(this.options.width, this.options.height, pageX - this.$el.offset().left, pageY - this.$el.offset().top);

        if (this.pressed === 'path') {
          this.value = [this.oldValues[0] - diff, this.oldValues[1] - diff];
        } else if (this.pressed === 'start') {
          if (this.oldValues[0] - diff > this.oldValues[1]) {
            diff = diff + 360;
          }
          this.value[0] = this.oldValues[0] - diff;
        } else if (this.pressed === 'end') {
          if (this.oldValues[1] - diff < this.oldValues[0]) {
            diff = diff - 360;
          }
          this.value[1] = this.oldValues[1] - diff;
        }

        this.value[0] = this.value[0] % 360;
        this.value[1] = this.value[1] % 360;
        this.value[2] = this.value[1] % 360 / this.options.gradation;

        var _this = this;
        requestAnimationFrame(function () {
          _this.draw.bind(_this)();
          _this.trigger.bind(_this)();
          _this.oldCircle = _this.value[2];
        });
      }
    };

    CircleDatepicker.prototype.drawCircle = function (el, angle) {
      el.setAttribute('cx', polar_to_cartesian(150, 150, 115, angle)[0]);
      el.setAttribute('cy', polar_to_cartesian(150, 150, 115, angle)[1]);
    };

    CircleDatepicker.prototype.draw = function () {
      this.$path.get(0).setAttribute('d', svg_arc_path(150, 150, 115, this.value));
      this.drawCircle(this.$endBack.get(0), this.value[1]);
      this.drawCircle(this.$end.get(0), this.value[1]);
    };

    CircleDatepicker.prototype.startTrigger = function () {
      this.$el.trigger('circle-datepicker');
    };

    CircleDatepicker.prototype.trigger = function () {
      var direction;
      if (Math.round(this.oldCircle) === 0 && Math.round(this.value[2]) === 72) {
        direction = false;
      } else if (Math.round(this.oldCircle) === 72 && Math.round(this.value[2]) === 0) {
        direction = true;
      } else {
        direction = this.value[2] > this.oldCircle;
      }

      this.$el.trigger('change', [[angle_to_time(this.value[0], this.options.step_mins), angle_to_time(this.value[1], this.options.step_mins)]]);
      this.$el.trigger('timer', [[this.value[2], direction]]);
    };

    $.fn[pluginName] = function (options) {
      return this.each(function () {
        if (!$.data(this, 'plugin_#{pluginName}')) {
          $.data(this, 'plugin_#{pluginName}', new CircleDatepicker(this, options));
        }
      });
    };
  },

  /**
   * @function
   * @desc 설정하기 circle_datepicker callback
   */
  _onTimer: function (e, data) {
    var hour = Math.floor(data[0] / 6),
      minute = Math.floor(data[0] % 6) * 10,
      usedData = ((hour * this.DATA_HOUR) + (minute * this.DATA_MINUTE)) / 1024,
      after = (this.haveData - ((hour * this.DATA_HOUR) + (minute * this.DATA_MINUTE))) / 1024,
      isTime = hour > 0 || minute > 0,
      isButton = isTime && (this.haveData - ((hour * this.DATA_HOUR) + (minute * this.DATA_MINUTE))) > 170;

    this.$circlePi.val(data[0]);
    this.$timeContent.toggleClass('active', isTime).toggleClass('overflowed', isTime && !isButton);
    this.$timeButton.prop('disabled', !isButton);

    this.$notice_case1.toggle(!isTime);
    this.$notice_case2.toggle(isTime && isButton);
    this.$notice_case3.toggle(isTime && !isButton);

    this.$time.html(this._addZero(hour));
    this.$min.html(this._addZero(minute));
    //$('.time-last').html(addZero(hour) + '시간 ' + addZero(minute) + '분');

    this.$before.html(usedData.toFixed(2));
    this.$after.html(after.toFixed(2));

    this.hour = hour;
    this.min = minute;
  },

  /**
   * @function
   * @desc 버튼으로 시간설정 callback
   */
  _pickerRedraw: function (pi) {
    this.$datePicker.trigger('circledatepickerredraw', {'pi': pi});
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
   * @desc 버튼으로 시간설정 팝업오픈
   */
  _openTimeSetting: function (e) {
    e.preventDefault();
    this._popupService.open({
      hbs: 'T5G_01_02',
      data: {
        hour: this.hour,
        min: this.min
      }
    }, $.proxy(this._onOpenTimeSetting, this), null, 'time-setting');
  },

  /**
   * @function
   * @desc 버튼으로 시간설정 팝업 초기화 및 event binding
   */
  _onOpenTimeSetting: function () {
    var $openDoc = $(document),
      DATA_HOUR = 1024,
      DATA_MINUTE = 17,
      pi = $openDoc.find('#circle_pi').val(),
      hour = Math.floor(pi / 6),
      minute = Math.floor(pi % 6) * 10,
      usedData = ((hour * DATA_HOUR) + (minute * DATA_MINUTE)) / 1024,
      $btn = $('.og-settime-btns > button'),
      $hour = $('.og-ui-hour'),
      $minute = $('.og-ui-minute'),
      $data = $('.og-ui-used-data'),
      gradation = 4.9315,
      type, count = 0;

    function addZero(n) {
      return (String(n).length < 2) ? '0' + n : n;
    }

    $hour.data('hour', hour).html(addZero(hour));
    $minute.data('minute', minute).html(addZero(minute));
    $data.html(usedData.toFixed(2) + 'GB');

    $btn.on('click', function (e) {
      e.preventDefault();

      hour = $hour.data('hour');
      minute = $minute.data('minute');
      type = $(this).data('addType');

      if (type === 'hour') {
        hour = parseInt(hour, 10) + parseInt($(this).data('addTime'), 10);
        if (hour < 0) {
          hour = 0;
          minute = 0;
        } else if (hour >= 12) {
          hour = 12;
          minute = 0;
        }
      } else {
        minute = parseInt(minute, 10) + parseInt($(this).data('addTime'), 10);
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

      $hour.data('hour', hour).html(addZero(hour));
      $minute.data('minute', minute).html(addZero(minute));
      usedData = ((hour * DATA_HOUR) + (minute * DATA_MINUTE)) / 1024;
      $data.html(usedData.toFixed(2) + 'GB');

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
    });

    $('.bt-fixed-area .bt-red1 > button').on('click', $.proxy(function () {
      hour = $hour.data('hour');
      minute = $minute.data('minute');
      pi = (hour * 6 * gradation) + (minute / 10 * gradation);
      this._pickerRedraw(pi);
      this._popupService.close();
    }, this));
  },

  /**
   * @function
   * @desc 5g 사용시작
   */
  _start5g: function () {
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_5G.CONFIRM_START.MSG.replace('${time}', moment().add('hour', this.hour).add('minute', this.min).format('HH시 mm분')).replace('${data}', this.$before.html()),
      Tw.ALERT_MSG_5G.CONFIRM_START.TITLE,
      $.proxy(this._onConfirmStart, this), null, Tw.BUTTON_LABEL.CANCEL, Tw.BUTTON_LABEL.CONFIRM);
  },

  /**
   * @function
   * @desc 사용시작 api call
   */
  _onConfirmStart: function () {
    this._popupService.close();
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_06_0080, {
      timeUnit: this.hour * 60 + this.min
    })
    .done($.proxy(this._procConfirmRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 사용시작 api callback
   */
  _procConfirmRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }
    this._historyService.reload();
  }

};
