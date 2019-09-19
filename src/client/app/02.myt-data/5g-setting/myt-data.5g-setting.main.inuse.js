/**
 * @file 5g 시간설정 사용중
 * @author anklebreaker
 * @since 2019-04-05
 */

/**
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 */
Tw.MyTData5gSettingMainInuse = function (rootEl, usingInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);

  this._usingInfo = JSON.parse(window.unescape(usingInfo));

  this._cachedElement();
  this._bindEvent();
  this._startTimer();
};

Tw.MyTData5gSettingMainInuse.prototype = {

  remTime: 0,
  usingTimer: null,

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$btnTerminate = this.$container.find('.fe-btn_terminate');
    this.$time = this.$container.find('.ti-me');
    this.$min = this.$container.find('.mi-n');
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

    this._apiService.request(Tw.API_CMD.BFF_06_0081, {})
    .done($.proxy(this._procConfirmRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
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

    this._intervalReload();
  },

  /**
   * @function
   * @desc BE 처리하는데 시간 걸려서 요청 후 1초 주기로 재요청 하여 상태값 변경되면 페이지 이동한다.
   */
  _intervalReload: function () {
    var reqCnt = 0;
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    var interval = window.setInterval(function () {
      var callBack = function (res) {
        if (res.result.length > 0 && res.result[0].currUseYn === 'N') {
          this._historyService.replaceURL('/myt-data/5g-setting?conversionsInfo='+JSON.stringify(res));
          return;
        }
      };

      // 최대 회수만큼 호출 후 그만호출
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
   * @desc 숫자 한자리인 경우 0 추가
   */
  _addZero: function(n) {
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
