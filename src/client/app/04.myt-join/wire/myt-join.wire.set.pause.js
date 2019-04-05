/**
 * MenuName: 나의가입정보(인터넷/집전화/IPTV) > 일시 정지/해제
 * @file myt-join.wire.set.pause.js
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018. 8. 17.
 * Summary: 일시 정지/해제 신청
 */

Tw.MytJoinWireSetPause = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MytJoinWireSetPause.prototype = {
  _URL: {
    MAIN: '/myt-join/submain',
    COMPLETE: '/myt-join/submain/wire/wirestopgo/complete'
  },
  _DATE_FORMAT: {
    INPUT: 'YYYY-MM-DD',
    LABEL: 'YYYY.M.D.'
  },
  _SELECTABLE_PAUSE_RANGE: 93, // 정지종료일 선택가능 기간(일)
  _DAYS_PER_MONTH: 31, // 1개월 추정 일 수
  _SVC_ST_CD: {
    AC: 'AC', // 사용중
    SP: 'SP'  // 정지
  },
  _startDate: null, // 정지 시작일
  _endDate: null, // 정지 종료일
  // _isDirty: false,

  _cachedElement: function () {
    this._$inputEndDate = this.$container.find('.fe-input-end-date');
    this._$pauseRangeInfo = this.$container.find('.fe-pause-range-info');
    this._$btnSubmit = this.$container.find('.fe-btn-submit');
  },

  _bindEvent: function () {

    if ( Tw.BrowserHelper.isIos() ) {
      this.$container.on('blur', '.fe-input-start-date', $.proxy(this._onChangeInputStartDate, this));
      this.$container.on('blur', '.fe-input-end-date', $.proxy(this._onChangeInputEndDate, this));
    } else {
      this.$container.on('change', '.fe-input-start-date', $.proxy(this._onChangeInputStartDate, this));
      this.$container.on('change', '.fe-input-end-date', $.proxy(this._onChangeInputEndDate, this));
    }

    // this.$container.on('change', '.fe-input-start-date', $.proxy(this._onChangeInputStartDate, this));
    // this.$container.on('change', '.fe-input-end-date', $.proxy(this._onChangeInputEndDate, this));
    this.$container.on('click', '.fe-btn-submit', $.proxy(this._onClickBtnSubmit, this));
    // this.$container.on('click', '.fe-btn-back', $.proxy(this._onClickBtnBack, this));
  },

  _init: function () {
    // SK브로드밴드 가입자의 경우 얼럿 && 화면 진입안됨
    if ( this._options.isBroadbandJoined === 'Y' ) {
      (new Tw.MyTJoinCommon()).openSkbdAlertOnInit(this._historyService);
    }
    this._setStartDate();
    this._setEndDateRange();
  },

  /**
   * 이용정지 시작 날짜 변수 세팅
   * @private
   */
  _setStartDate: function () {
    this._startDate = this._options.startDateMin;
  },

  /**
   * 이용정지 가능 기간 반환
   * @return {
   *   min: 시작날짜
   *   max: 끝날짜
   * }
   * @private
   */
  _getEndDateRange: function () {
    var maxDate = Tw.DateHelper.getShortDateWithFormatAddByUnit(this._startDate, this._SELECTABLE_PAUSE_RANGE, 'days',
      this._DATE_FORMAT.INPUT, this._DATE_FORMAT.INPUT);
    var startDate = Tw.DateHelper.getShortDateWithFormat(this._startDate, this._DATE_FORMAT.INPUT);

    return {
      min: startDate,
      max: maxDate
    };
  },

  /**
   * 이용정지 시작 날짜 화면 세팅
   * @private
   */
  _setEndDateRange: function () {
    var endDateRange = this._getEndDateRange();
    this._$inputEndDate.attr('min', endDateRange.min);
    this._$inputEndDate.attr('max', endDateRange.max);
    this._$inputEndDate.prop('disabled', false);
  },

  /**
   * 이용정지 범위 노출 (시작날짜부터 93일까지)
   * @private
   */
  _showPauseRangeInfo: function () {
    var $pauseDate = this._$pauseRangeInfo.find('.fe-pause-date');
    var $pauseRange = this._$pauseRangeInfo.find('.fe-pause-range');
    var startDateStr = Tw.DateHelper.getShortDateWithFormat(this._startDate, this._DATE_FORMAT.LABEL, this._DATE_FORMAT.INPUT);
    var endDateStr = Tw.DateHelper.getShortDateWithFormat(this._endDate, this._DATE_FORMAT.LABEL, this._DATE_FORMAT.INPUT);
    var refDiffDays = Tw.DateHelper.getDiffByUnit(this._endDate, this._startDate, 'days');
    var diffMonth = Math.floor(refDiffDays / this._DAYS_PER_MONTH);
    var diffDays = refDiffDays;
    var rangeStr = '';
    if ( !!diffMonth ) {
      rangeStr = diffMonth + Tw.MYT_JOIN_WIRE_SET_PAUSE.MONTH;
      diffDays = refDiffDays % this._DAYS_PER_MONTH;
    }
    if ( !!diffDays ) {
      rangeStr += diffDays + Tw.MYT_JOIN_WIRE_SET_PAUSE.DAY;
    }
    $pauseDate.text(startDateStr + ' ~ ' + endDateStr);
    $pauseRange.text(rangeStr);
    this._$pauseRangeInfo.show();
  },

  /**
   * 신청버튼 상태 변경
   * @private
   */
  _setSubmitBtnStatus: function () {
    var disabled = !(this._startDate && this._endDate);
    this._$btnSubmit.prop('disabled', disabled);
  },

  /**
   * 날짜가 유효한 범위내에 있는지 판단
   * @param val
   * @param min
   * @param max
   * @return Boolean
   * @private
   */
  _isValidDateInRange: function (val, min, max) {
    return moment(val).isBetween(min, max, null, '[]');
  },

  /**
   * 정지 시작일 인풋 변경 시 호출
   * @param event
   * @private
   */
  _onChangeInputStartDate: function (event) {
    var $currentTarget = $(event.currentTarget);
    var currentTargetVal = $currentTarget.val();
    // 선택한 날짜가 범위(당일 ~ 30일이내)를 벗어나면 당일로 변경 후 얼럿
    if ( !this._isValidDateInRange(currentTargetVal, this._options.startDateMin, this._options.startDateMax) ) {
      $currentTarget.val(this._options.startDateMin);
      this._startDate = this._options.startDateMin;
      this._popupService.openAlert(Tw.MYT_JOIN_WIRE_SET_PAUSE.SET.DATE_SELECT_ERROR);
    } else {
      this._startDate = currentTargetVal;
    }
    this._setEndDateRange();
    if ( this._endDate ) {
      this._showPauseRangeInfo();
      this._setSubmitBtnStatus();
    }
    // this._isDirty = true;
  },

  /**
   * 정지 종료일 인풋 변경 시 호출
   * @param event
   * @private
   */
  _onChangeInputEndDate: function (event) {
    var $currentTarget = $(event.currentTarget);
    var currentTargetVal = $currentTarget.val();
    var endDateRange = this._getEndDateRange();
    // 선택한 날짜가 범위(정지 시작일 ~ 93일이내)를 벗어나면 이용정지 가능 기간의 최소일로 변경 후 얼럿
    if ( !this._isValidDateInRange(currentTargetVal, endDateRange.min, endDateRange.max) ) {
      $currentTarget.val(endDateRange.min);
      this._endDate = endDateRange.min;
      this._popupService.openAlert(Tw.MYT_JOIN_WIRE_SET_PAUSE.SET.DATE_SELECT_ERROR);
    } else {
      this._endDate = currentTargetVal;
    }
    this._showPauseRangeInfo();
    this._setSubmitBtnStatus();
    // this._isDirty = true;
  },

  /**
   * 일시 정지 신청/해제 버튼 클릭시 호출
   * @private
   */
  _onClickBtnSubmit: function () {
    var title, contents, btName, closeBtName, apiCmd, params;
    switch ( this._options.svcStCd ) {
      // 이용중인 경우 일시정지 신청
      case this._SVC_ST_CD.AC:
        var sDate = Tw.DateHelper.getShortDate(this._startDate);
        var eDate = Tw.DateHelper.getShortDate(this._endDate);
        title = Tw.MYT_JOIN_WIRE_SET_PAUSE.SET.TITLE;
        contents = Tw.MYT_JOIN_WIRE_SET_PAUSE.SET.CONTENTS;
        contents = contents.replace('[sDate]', sDate);
        contents = contents.replace('[eDate]', eDate);
        btName = null;
        closeBtName = Tw.BUTTON_LABEL.CLOSE;
        apiCmd = Tw.API_CMD.BFF_05_0170;
        params = {
          lfr: Tw.DateHelper.getCurrentShortDate(this._startDate),
          lto: Tw.DateHelper.getCurrentShortDate(this._endDate)
        };
        break;
      // 정지중인 경우 일시정지 해제 신청
      case this._SVC_ST_CD.SP:
        title = Tw.MYT_JOIN_WIRE_SET_PAUSE.CANCEL.TITLE;
        contents = null;
        btName = null;
        closeBtName = null;
        apiCmd = Tw.API_CMD.BFF_05_0171;
        params = {};
        break;
    }
    this._popupService.openModalTypeATwoButton(title, contents, btName, closeBtName, undefined, $.proxy(this._reqWireSetPause, this, apiCmd, params));
  },

  /**
   * 일시 정지 신청/해제 API호출
   * @param apiCmd{Object}
   * @param params{Object}
   * @private
   */
  _reqWireSetPause: function (apiCmd, params) {
    this._popupService.close();
    this._apiService.request(apiCmd, params)
      .done($.proxy(this._reqWireSetPauseDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  /**
   * 일시 정지 신청/해제 API호출 성공
   * @param resp
   * @private
   */
  _reqWireSetPauseDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL(this._URL.COMPLETE + '?svcStCd=' + this._options.svcStCd);

    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  /**
   * 일시 정지 신청/해제 API호출 실패
   * @param resp
   * @private
   */
  _reqFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  }

  // _onClickBtnBack: function() {
  //   if (!this._isDirty) {
  //     this._historyService.goBack();
  //     return;
  //   }
  //   this._popupService.openConfirmButton(Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG, Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
  //     $.proxy($.proxy(function () {
  //       this._popupService.close();
  //       this._historyService.goBack();
  //     }, this), this), null, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  // }

};

