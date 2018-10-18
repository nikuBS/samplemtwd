/**
 * FileName: myt-join.wire.set.pause.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 8. 17.
 */

Tw.MytJoinWireSetPause = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MytJoinWireSetPause.prototype = {
  _DATE_FORMAT: {
    INPUT: 'YYYY-MM-DD',
    LABEL: 'YYYY.MM.DD'
  },
  _SELECTABLE_PAUSE_RANGE: 93, // 정지종료일 선택가능 기간(일)
  _DAYS_PER_MONTH: 31, // 1개월 추정 일 수
  _SVC_ST_CD: {
    AC: 'AC', // 사용중
    SP: 'SP'  // 정지
  },
  _startDate: null, // 정지 시작일
  _endDate: null, // 정지 종료일

  _cachedElement: function () {
    this._$inputEndDate = this.$container.find('.fe-input-end-date');
    this._$pauseRangeInfo = this.$container.find('.fe-pause-range-info');
    this._$btnSubmit = this.$container.find('.fe-btn-submit');
  },

  _bindEvent: function () {
    this.$container.on('change', '.fe-input-start-date', $.proxy(this._onChangeInputStartDate, this));
    this.$container.on('change', '.fe-input-end-date', $.proxy(this._onChangeInputEndDate, this));
    this.$container.on('click', '.fe-btn-submit', $.proxy(this._onClickBtnSubmit, this));
  },

  _init: function () {
    this._setStartDate();
    this._setEndDateRange();
  },

  _setStartDate: function () {
    this._startDate = this._options.startDate;
  },

  _setEndDateRange: function () {
    var maxDate = Tw.DateHelper.getShortDateWithFormatAddByUnit(this._startDate, this._SELECTABLE_PAUSE_RANGE, 'days',
      this._DATE_FORMAT.INPUT, this._DATE_FORMAT.INPUT);
    var startDate = Tw.DateHelper.getShortDateWithFormatAddByUnit(this._startDate, 1, 'days',
      this._DATE_FORMAT.INPUT, this._DATE_FORMAT.INPUT);
    this._$inputEndDate.attr('min', startDate);
    this._$inputEndDate.attr('max', maxDate);
    this._$inputEndDate.prop('disabled', false);
  },

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

  _setSubmitBtnStatus: function () {
    var disabled = !(this._startDate && this._endDate);
    this._$btnSubmit.prop('disabled', disabled);
  },

  _onChangeInputStartDate: function (event) {
    var $currentTarget = $(event.currentTarget);
    this._startDate = $currentTarget.val();
    this._setEndDateRange();
    if ( this._endDate ) {
      this._showPauseRangeInfo();
      this._setSubmitBtnStatus();
    }
  },

  _onChangeInputEndDate: function (event) {
    var $currentTarget = $(event.currentTarget);
    this._endDate = $currentTarget.val();
    this._showPauseRangeInfo();
    this._setSubmitBtnStatus();
  },

  _onClickBtnSubmit: function () {
    var title, contents, btName, apiCmd, params;
    switch ( this._options.svcStCd ) {
      case this._SVC_ST_CD.AC:
        var sDate = Tw.DateHelper.getShortDateNoDot(this._startDate);
        var eDate = Tw.DateHelper.getShortDateNoDot(this._endDate);
        title = Tw.MYT_JOIN_WIRE_SET_PAUSE.SET.TITLE;
        contents = Tw.MYT_JOIN_WIRE_SET_PAUSE.SET.CONTENTS;
        contents = contents.replace('[sDate]', sDate);
        contents = contents.replace('[eDate]', eDate);
        btName = Tw.MYT_JOIN_WIRE_SET_PAUSE.SET.BTNAME;
        apiCmd = Tw.API_CMD.BFF_05_0170;
        params = {
          lfr: Tw.DateHelper.getCurrentShortDate(this._startDate),
          lto: Tw.DateHelper.getCurrentShortDate(this._endDate)
        };
        break;
      case this._SVC_ST_CD.SP:
        title = Tw.MYT_JOIN_WIRE_SET_PAUSE.CANCEL.TITLE;
        contents = null;
        btName = Tw.MYT_JOIN_WIRE_SET_PAUSE.CANCEL.BTNAME;
        apiCmd = Tw.API_CMD.BFF_05_0171;
        params = {};
        break;
    }
    Tw.Popup.openModalTypeA(title, contents, btName, undefined, $.proxy(this._reqWireSetPause, this, apiCmd, params));
  },

  _reqWireSetPause: function (apiCmd, params) {
    this._apiService.request(apiCmd, params)
      .done($.proxy(this._reqWireSetPauseDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  _reqWireSetPauseDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var toastMsg;
      switch ( this._options.svcStCd ) {
        case this._SVC_ST_CD.AC:
          toastMsg = Tw.MYT_JOIN_WIRE_SET_PAUSE.SET.SUCCESS_TOAST;
          break;
        case this._SVC_ST_CD.SP:
          toastMsg = Tw.MYT_JOIN_WIRE_SET_PAUSE.CANCEL.SUCCESS_TOAST;
          break;
      }
      Tw.CommonHelper.toast(toastMsg);
      // TODO: 화면 이동
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  _reqFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  }

};

