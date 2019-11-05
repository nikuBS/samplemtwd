/**
 * @file 5g 시간설정 사용중
 * @author anklebreaker
 * @since 2019-04-05
 */

/**
 * @param rootEl
 * @param data
 * @constructor
 * @desc 초기화를 위한 class
 */
Tw.MyTData5gSettingMainInuse = function (rootEl, data) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._settingData = data;
  this._usingInfo = this._settingData.conversionsInfo;

  this._cachedElement();
  this._bindEvent();
  this._startTimer();
  this._loadAvailableTime();
};

Tw.MyTData5gSettingMainInuse.prototype = {

  remTime: 0,
  usingTimer: null,

  // [OP002-4958] - 5gx 관련 기능 개선 및 오류 수정
  // CDRS 잔여량 5분 캐시로딩으로 시간권 잔여량 실제 잔여량과 차이나는 이슈 수정
  // 데이터 시간권 사용중 페이지 내 '사용 가능 시간' 페이지 진입 시, API 호출하도록 수정
  _loadAvailableTime: function () {
    this.reqCnt = 0;
    this._requestAvailableTime();
  },

  /**
   * @function
   * @desc 사용가능 시간 조회
   */
  _requestAvailableTime: function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    Tw.MyTData5gSetting.prototype.requestAvailableTime(this.reqCnt++)
      .done($.proxy(this._onSuccessCallback, this))
      .fail(function () {
        Tw.MyTData5gSetting.prototype.onFail();
        Tw.CommonHelper.endLoading('.container');
      });
  },

  /**
   * 사용가능 시간 조회 결과 처리
   * @param resp
   * @returns {void|*}
   * @private
   */
  _onSuccessCallback: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }
    if (!resp.result || Tw.FormatHelper.isEmpty(resp.result.dataRemQty) || resp.result.brwsPsblYn !== 'Y' || resp.result.cnvtPsblYn !== 'Y') {
      // 요청 후 결과값이 전달되지 않은 경우 재호출
      Tw.CommonHelper.endLoading('.container');
      // 최대 3회 호출.
      if (this.reqCnt < 3) {
        window.setTimeout($.proxy(this._requestAvailableTime, this), 1000);
        return;
      }
      this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
      return;
    }
    // 단위변경 분 -> 초
    var availableTime = Tw.FormatHelper.convVoiceFormat(resp.result.dataRemQty * 60);
    var time = {
      hour: availableTime.hours,
      min: availableTime.min,
      html: ''
    };
    // 사용가능시간이 최대 시간인 12시간을 초과한 경우
    if (resp.result.dataRemQty > 720) {
      time.hour = 12;
      time.min = 0;
    }
    // 시 또는 분이 0이 아닌 경우에만 시간 단위 노출
    if (time.hour > 0) {
      time.html += '<b>' + time.hour + '</b>' + Tw.VOICE_UNIT.HOURS + ' ';
    }
    if (time.min > 0) {
      time.html += '<b>' + time.min + '</b>' + Tw.VOICE_UNIT.MIN;
    }
    this.$availableDate.html(time.html);
    Tw.CommonHelper.endLoading('.container');
  },

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$availableDate = this.$container.find('[data-id=available-date]');
    this.startTime = Tw.DateHelper.convDateFormat(this._usingInfo.convStaDtm);
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$btnTerminate.on('click', $.proxy(this._onClickTerminate, this));
  },

  /**
   * @function
   * @desc 사용종료 confirm
   */
  _onClickTerminate: function (e) {
    // 정기점검 중이면 토스트 띄움
    if (!this.$container.find('.fe-pm').hasClass('none')) {
      Tw.CommonHelper.toast(Tw.ALERT_MSG_5G.TOAST_PM);
      return;
    }

    // 시간권 사용시작 후 1분 이내 종료 불가
    if (Tw.DateHelper.getDiffByUnit(new Date(), this.startTime, 'minutes') < 1) {
      this._popupService.openAlert(Tw.ALERT_MSG_5G.ALERT_A2);
      return;
    }

    // 사용가능 시간이 1분이내 인 경우 종료불가
    if (this.remTime < 2) {
      this._popupService.openAlert(Tw.ALERT_MSG_5G.ALERT_A3);
      return;
    }

    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_5G.CONFIRM_TERMINATE.MSG, Tw.ALERT_MSG_5G.CONFIRM_TERMINATE.TITLE,
      $.proxy(this._procConfirm, this), null, Tw.BUTTON_LABEL.CANCEL, Tw.ALERT_MSG_5G.CONFIRM_TERMINATE.BUTTON, e);
  },

  /**
   * @function
   * @desc 사용종료 api call
   */
  _procConfirm: function () {
    this._popupService.close();
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    Tw.MyTData5gSetting.prototype.requestDelConversions()
      .done($.proxy(this._procConfirmRes, this))
      .fail(Tw.CommonHelper.endLoading('.container'));
  },

  /**
   * @function
   * @desc 사용종료 api callback
   */
  _procConfirmRes: function (resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    Tw.MyTData5gSetting.prototype.requestGetConversions()
      .done($.proxy(this._onSuccessCouponEnded, this))
      .fail(Tw.CommonHelper.endLoading('.container'));
  },

  /**
   * 5G 시간권 사용 종료 후 처리
   * @param resp
   * @private
   */
  _onSuccessCouponEnded: function (resp) {
    var result = resp.result || [];
    if (result.length > 0 && result[0].currUseYn === 'Y') {
      setTimeout($.proxy(function () {
        // 스윙에 정보가 설정되지 않는 문제로 인하여 딜레이 추가
        Tw.MyTData5gSetting.prototype.requestGetConversions()
          .done($.proxy(this._onSuccessCouponEnded, this))
          .fail(Tw.CommonHelper.endLoading('.container'));
      }, this), 1000);
    } else {
      Tw.CommonHelper.endLoading('.container');
      // 성공 후 잔여량 API 정리
      Tw.MyTData5gSetting.prototype.clearResidualQuantity()
        .done($.proxy(function () {
          this._historyService.replaceURL('/myt-data/5g-setting?remained=1');
        }, this));
    }
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
   * @desc 남은시간 차감(1분에 한번씩 실행)
   */
  _startTimer: function () {
    this.remTime = this._usingInfo.remTime; // 요청 시간중의 잔여시간
    this.usingTimer = window.setInterval(function () {
      if (--this.remTime < 1) {
        window.clearInterval(this.usingTimer);
      }
    }.bind(this), 1000 * 60);
  }

};
