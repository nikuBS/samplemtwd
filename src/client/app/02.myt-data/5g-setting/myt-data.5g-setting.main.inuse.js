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
    this._historyService.reload();
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
   * @desc 사용중 timer
   */
  _startTimer: function () {
    this.remTime = Number(this._usingInfo.remTime);
    this._updateTime(this.remTime);
    this.$time.removeClass('none');
    this.$min.removeClass('none');

    this.usingTimer = window.setInterval($.proxy(function () {
      this.remTime--;
      if (this.remTime <= 0) {
        this.remTime = 0;
        window.clearInterval(this.usingTimer);
      }
      this._updateTime(this.remTime);
    }, this), 60 * 1000);
  },

  /**
   * @function
   * @desc 화면 시간표시 update
   */
  _updateTime: function (remTime) {
    this.$time.text(this._addZero(Math.floor(remTime / 60)));
    this.$min.text(this._addZero(remTime % 60));
  }

};
