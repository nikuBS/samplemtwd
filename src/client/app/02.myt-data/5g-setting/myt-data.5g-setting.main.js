/**
 * @file 데이터 시간권 설정 (미이용중)
 * @author 양정규
 * @since 2019-09-17
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
  this._loadRemainTime();
  this._bindEvent();
  if ( !Tw.Environment.init ) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openIntro, this));
  } else {
    this._openIntro();
  }
};

Tw.MyTData5gSettingMain.prototype = {
  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$btnTimeSetting = this.$container.find('.fe-btn_time-setting');
    this.$timeSetButton = this.$container.find('.fe-btn_5g-start');
    this.$datePicker = this.$container.find('.circle-datepicker');
    this.$timeConf = this.$container.find('.og-timeConf-wrap');
    this.$timePicker = this.$container.find('.og-time-display-init > .time-count > a');
    this.$timePicked = this.$container.find('.og-timeConf-wrap > .og-time-picked > p');
    this.$timeButton = this.$container.find('.og-time-setdata > .btns > button');
    this.$usedTime = this.$container.find('.fe-used-time > span');
    this.$time = this.$container.find('.ti-me');
    this.$min = this.$container.find('.mi-n');
    this.hour = 0;
    this.min = 0;
    this.loadTime = 0; // 사용가능시간 처음 로드시간
    this.isTimeOver = false;  // "데이터 시간권 사용" 클릭 했을 때, 사용가능시간 조회 한지 2분이 지났는지 여부
    this.remainTime = 0; // 사용가능시간 (단위: 초)
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$timeSetButton.on('click', $.proxy(this._start5g, this));
    this.$timePicker.on('click', $.proxy(this._onClickTime, this));
    this.$timeButton.on('click', $.proxy(this._addTime, this));
    this.$datePicker.circle_datepicker().on('timer', _.debounce($.proxy(this._onTimer, this), 10));
    this.$container.on('click','.fe-time-search', _.debounce($.proxy(this._loadRemainTime, this), 10));
  },

  /**
   * @function
   * @desc open intro popup
   */
  _openIntro: function () {
    if (localStorage['dont.again'] === 'do not again') {
      return;
    }
    this._popupService.open({
      url: '/hbs/',
      hbs: 'popup',
      'notice_has':'og-popup-intro',
      'cont_align':'tc',
      'contents': '<img src="'+ Tw.Environment.cdn+'/img/t_m5g/og_pop_intro.png" alt="5GX 0Plan 시간권으로 데이터를 이용하세요! 사용량 걱정 없이 원하는 시간만큼 쓰는 방법!" style="max-width:100%;">',
      'bt_b': [{
        style_class: 'pos-left',
        txt: '다시보지 않기'
      },{
        style_class: 'bt-red1 pos-right',
        txt: '시작하기'
      }]
    }, $.proxy(function () {
      $('.pos-left').on('click', function () {
        localStorage['dont.again'] = 'do not again';
        Tw.Popup.close();
      });
      $('.pos-right').on('click', Tw.Popup.close);
    }, this));
  },

  /**
   * @function
   * @desc 화면 진입시 사용가능시간 조회하기
   */
  _loadRemainTime : function () {
    // 초기화
    this.reqCnt = 0;
    this.$timeConf.addClass('disabled');
    this.$timePicked.hide().eq(0).show();
    this.$usedTime.eq(0).show().siblings().addClass('none');
    this.$timeButton.prop('disabled', true);
    this.$usedTime.eq(0).children().eq(0).addBack('block').show().next().addClass('none');
    var $comment = this.$timePicked.children().eq(0);
    $comment.text($comment.data('defText'));

    // 사용 가능 시간 조회
    this._requestAvailableTime();
  },

  /**
   * @function
   * @desc 사용가능 시간 조회
   */
  _requestAvailableTime: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0079, { reqCnt: this.reqCnt++ })
      .done($.proxy(this._onSucessAvailableTime, this))
      .fail(this._onFail);
  },

  /**
   * @function
   * @param resp
   * @returns {void|*}
   * @desc 사용가능시간 조회 콜백
   */
  _onSucessAvailableTime: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }
    if ( !resp.result || Tw.FormatHelper.isEmpty(resp.result.dataRemQty) || resp.result.brwsPsblYn !== 'Y' || resp.result.cnvtPsblYn !== 'Y') {
      // 최대 3회 호출.
      if (this.reqCnt < 3) {
        window.setTimeout($.proxy(this._requestAvailableTime, this), 1000);
        return;
      }
      // 3회 호출해도 값이 없으면 조회하기 버튼 노출
      this.$usedTime.eq(0).children().eq(0).removeClass('block').hide().next().removeClass('none');
      // 다아얼 상단 텍스트 문구 변경 (조회 실패시 '사용 가능 시간을 다시 조회해 주세요.)
      var $comment = this.$timePicked.children().eq(0);
      $comment.text($comment.data('failText'));
      return;
    }

    // 응답 받은 후 로직..
    this.remainTime = resp.result.dataRemQty * 60;  // 단위변경 분 -> 초
    this.loadTime = new Date();
    var availableTime = Tw.FormatHelper.convVoiceFormat(this.remainTime);
    var isOverTime = +resp.result.dataRemQty > 720; // 사용가능시간이 최대 시간인 12시간을 초과한 경우 유무
    var maxHour = isOverTime ? 12 : availableTime.hours, maxMin = isOverTime ? 0 : availableTime.min;

    var $usableTime = this.$usedTime; // 다이얼 밑에 "사용가능시간" 영역
    // 사용가능 최대 시간 입력 부분 (사용가능 시간이 12시간 초과이면 12시간 까지만 입력)
    var timeText = maxHour > 0 ? maxHour + Tw.VOICE_UNIT.HOURS + ' ' : '';
    timeText += maxMin > 0 ? maxMin + Tw.VOICE_UNIT.MIN : '';
    timeText = timeText.trim();

    // 다이얼 사용 가능시간 세팅
    this.$timeConf.data('maxHour', maxHour).data('maxMinute',maxMin);
    this.$timePicked.hide().eq(1).show().siblings().eq(1).find('span').prepend(timeText); // timeText="HH시간 MM분까지 선택가능"

    // 다이얼 밑에 "사용가능시간" 영역
    if (availableTime.hours > 0) {
      $usableTime.find('b:first').text(availableTime.hours).parent().removeClass('none');
    }
    if (availableTime.min > 0) {
      $usableTime.find('b:eq(1)').text(availableTime.min).parent().removeClass('none');
    }

    // 하단 사용가능시간 영역 텍스트 ("조회 중입니다." 비노출 & 사용 가능시간 노출)
    $usableTime.eq(0).hide().next().removeClass('none');
    this.$timeConf.removeClass('disabled');
    this.$timeButton.prop('disabled', false);

    // 조회요청 시간 초과된 후 "데이터 시간권 사용" 버튼 클릭한 경우, 사용가능시간 조회 완료 후 다시 데이터시간권 사용 컨펌 창 노출.
    if (this.isTimeOver) {
      this.isTimeOver = false;
      this._onConfirmStart5G();
    }
  },

  _togglePicker: function(index) {
    this.$timeConf.data('type', index);
    this.$timePicker.removeClass('on').eq(index).addClass('on');
    var pi = (index === 0) ? this.$timeConf.data('hour') : this.$timeConf.data('minute');
    this._pickerRedraw(pi);
  },

  // 시간 or 분 선택 시
  _onClickTime : function(e) {
    e.preventDefault();
    var idx =  this.$timePicker.index($(e.currentTarget));
    this._togglePicker(idx);
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
      gradation: 1
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
      var temp = 6 + Math.floor((180 + angle) * 12 / 360 * (60 / step_mins)) / (60 / step_mins);
      return temp;
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
        // _this.value[2] = options.pi / 2.5; // 2.5는 한칸당 5분 / 5는 한칸당 10분
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
      el.setAttribute('cx', polar_to_cartesian(128, 128, 105, angle)[0]);
      el.setAttribute('cy', polar_to_cartesian(128, 128, 105, angle)[1]);
    };

    CircleDatepicker.prototype.draw = function () {
      this.$path.get(0).setAttribute('d', svg_arc_path(128, 128, 105, this.value));
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
   * @desc 서클 드래그시 설정
   */
  _onTimer: function (e, data) {
    var $timeConf = this.$timeConf,
      hourPi = 360 / 13,
      minutePi = 360 / 6,
      time = 0,
      $hour = this.$time,
      $minute = this.$min,
      $timePicked = this.$timePicked,
      maxHour = $timeConf.data('maxHour'),
      maxMinute = $timeConf.data('maxMinute')
    ;
    // 시간
    if ($timeConf.data('type') === 0) {
      time = parseInt((data[0] / hourPi), 10);
      // 시간이 12시간 이상이면 분설정 0 설정
      if (time === 12) {
        $minute.html('00');
        $timeConf.data('minute', 0);
      }
      $hour.html(this._addZero(time));
      $timeConf.data('hour', data[0]);
      this.hour = time;
    } else { // 분
      time = parseInt((data[0] / minutePi), 10);
      // 전체 선택 버튼 클릭한 경우
      var maxMin = $timeConf.data('maxMin') || '00';
      var minPrefix = maxMin.charAt(0); // 숫자 맨 앞자리
      if (time === parseInt(minPrefix, 10)) {
        time = parseInt(maxMin,10);
      } else {
        time = time*10;
        $timeConf.data('maxMin','');
      }

      // 50 분에서 다이얼을 오른쪽으로 돌려서 다시 0부터 시작인 경우, "시간" 1시간 추가됨.
      if(this.min === 50 && time === 0){
        // 최대 시간은 12시
        if (this.hour < 12){
          $hour.html(this._addZero(++this.hour));
          $timeConf.data('hour', hourPi * this.hour);
        }
      }
      // 0분인 상태에서 다이얼을 왼쪽으로 돌리면 시간에서 1시간 빼줌.
      if(this.min === 0 && time === 50){
        if (this.hour > 0) {
          $hour.html(this._addZero(--this.hour));
          $timeConf.data('hour', hourPi * this.hour);
        }
      }
      this.min = time;
      $minute.html(this._addZero(time));
      $timeConf.data('minute', data[0]);
    }

    var hour = parseInt($hour.html(), 10),
      min = parseInt($minute.html(), 10);

    this.hour = hour;
    this.min = min;

    // 시간 변경에 따른 디자인 및 텍스트 변경
    if (parseInt($hour.html(), 10) === 0 && parseInt($minute.html(), 10) === 0) {
      this.$timeSetButton.prop('disabled', true);
      $timeConf.removeClass('active');
      $timePicked.hide().eq(1).show();
    } else {
      $timeConf.addClass('active');
      if (parseInt($hour.html(), 10) > maxHour || (parseInt($hour.html(), 10) === maxHour && parseInt($minute.html(), 10) > maxMinute)) {
        this.$timeSetButton.prop('disabled', true);
        $timePicked.hide().eq(3).show();
      } else {
        this.$timeSetButton.prop('disabled', false);
        $timePicked.hide().eq(2).show();
      }
    }

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
    return (String(n).length < 2) ? '0' + n : n.toString();
  },

  /**
   * @function
   * @param e
   * @desc 시간 설정 버튼 클릭시
   */
  _addTime : function (e) {
    var
      $this = $(e.currentTarget),
      $timeConf = this.$timeConf,
      hourPi = 360 / 13,
      minutePi = 360 / 6,
      time = 0,
      pi = 0,
      $hour = this.$time,
      $minute = this.$min,
      maxHour = $timeConf.data('maxHour'),
      maxMinute = $timeConf.data('maxMinute')
    ;
    switch ($this.index()) {
      case 0 :
        // 분단위 시간 설정 클릭시
        pi = (parseInt($timeConf.data('minute') + minutePi, 10) >= 360) ? 0 : parseInt($timeConf.data('minute') + minutePi, 10);
        time = parseInt(pi / minutePi, 10);
        $timeConf.data('minute', pi);
        this._togglePicker(1);
        break;
      case 1 :
        // 시단위 시간 설정 클릭시
        // 13으로 나누다 보니 00 ~ 00시까지 생김. 첫번째 00시는 없애야함.
        pi = (parseInt($timeConf.data('hour') + hourPi, 10) >= 360) ? 0 : parseInt($timeConf.data('hour') + hourPi, 10);
        pi = (pi === parseInt(hourPi, 10)) ? pi + hourPi : pi;
        time = parseInt(pi / hourPi, 10);
        // "전체" 선택 후 "1시간" 추가 버튼 클릭 시 시간 안맞는거 보정.
        if (time !== 0 && time < (this.hour+1)) {
          pi += hourPi;
        }
        $timeConf.data('hour', pi);
        this._togglePicker(0);
        break;
      default :
        // 전체 시간 설정 클릭시
        if ($this.data('type') === 'ALL') {
          $this.data('type', '').html(Tw.COMMON_STRING.ALL);
          maxHour = 0;
          maxMinute = 0;
        } else {
          $this.data('type', 'ALL').html(Tw.COMMON_STRING.RESET);
        }

        // 사용가능 시간이 12시간 초과인 경우 최대 12시간만 체크함.
        if ( maxHour * 60 + maxMinute > 720) {
          maxHour = 12;
          maxMinute = 0;
        }
        $timeConf.data('maxMin', this._addZero(maxMinute));
        $timeConf.data('minute', (maxMinute / 10) * minutePi);
        $timeConf.data('hour', maxHour * hourPi);
        $hour.html(this._addZero(maxHour));
        $minute.html(this._addZero(maxMinute));
        this._togglePicker(0);
        break;
    }
  },

  /**
   * @function
   * @desc 데이터 시간권 사용시작
   */
  _start5g: function () {
    // 정기점검 중이면 토스트 띄움
    if (!this.$container.find('.fe-pm').hasClass('none')) {
      Tw.CommonHelper.toast(Tw.ALERT_MSG_5G.TOAST_PM);
      return;
    }

    // 사용가능 시간 오버 됐는지 확인(처음 요청 후 2분 이내에 사용해야 된다고 함.BE 검토사항) 다시 사용가능시간 조회한다.
    if (Tw.DateHelper.getDiffByUnit(new Date(), this.loadTime, 'minutes') > 2) {
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_5G.CONFIRM_TIME_OVER.MSG,
        Tw.ALERT_MSG_5G.CONFIRM_TIME_OVER.TITLE,
        $.proxy(function () {
          this._popupService.close();
          this.isTimeOver = true;
          this._loadRemainTime();
        }, this), null, Tw.BUTTON_LABEL.CANCEL, Tw.BUTTON_LABEL.CONFIRM);
      return;
    }
    // 사용가능 시간 오버 확인 끝

    // 시간권 사용 요청
    this._onConfirmStart5G();
  },

  _onConfirmStart5G: function () {
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_5G.CONFIRM_START.MSG,
      Tw.ALERT_MSG_5G.CONFIRM_START.TITLE,
      $.proxy(this._requestStart5g, this), null, Tw.BUTTON_LABEL.CANCEL, Tw.BUTTON_LABEL.CONFIRM);
  },

  /**
   * @function
   * @desc 데이터 시간권 사용시작 api call
   */
  _requestStart5g: function () {
    this._popupService.close();
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_06_0080, {
      timeUnit: this.hour * 60 + this.min
    }).done($.proxy(this._procConfirmRes, this))
    .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc 데이터 시간권 사용시작 api callback
   */
  _procConfirmRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }
    this._intervalReload();
  },

  /**
   * @function
   * @desc BE 처리하는데 시간 걸려서 요청 후 1초 주기로 재요청 하여 상태값 변경되면 페이지 이동한다.
   */
  _intervalReload: function () {
    var reqCnt = 0;
    // 사용가능 시간에서 시간권 요청 한 시간을 빼준다.
    this.remainTime -= (this.hour * 60 + this.min) * 60;
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    var interval = window.setInterval(function () {
      var callBack = function (res) {
        if (res.result.length > 0 && res.result[0].currUseYn === 'Y') {
          this._historyService.replaceURL('/myt-data/5g-setting?remainTime='+this.remainTime+'&conversionsInfo='+JSON.stringify(res));
          return;
        }
      };

      if (reqCnt++ > 2){
        window.clearInterval(interval);
      }

      this._apiService.request(Tw.API_CMD.BFF_06_0078, {})
        .done($.proxy(callBack, this))
        .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));

    }.bind(this), 1000);
  },

  /**
   * @function
   * @desc API Fail
   * @param {JSON} err
   */
  _onFail: function (err) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code, err.msg).pop();
  }

};
