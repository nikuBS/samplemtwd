/**
 * @file 5g 시간설정 공통
 * @author anklebreaker
 * @since 2019-04-05
 */

/**
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 */
Tw.MyTData5gSetting = function (rootEl, reservationInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._nativeService = Tw.Native;

  this._reservationInfo = JSON.parse(window.unescape(reservationInfo));

  this._cachedElement();
  this._bindEvent();
  setTimeout($.proxy(this._openIntro, this), 0);
};

Tw.MyTData5gSetting.prototype = {

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$btnHistory = this.$container.find('.fe-btn_history');
    this.$btnMyTdata = this.$container.find('.fe-btn_mytdata');
    this.$btnReservation = this.$container.find('.fe-btn_reservation');
    this.$btnReservationDetail = this.$container.find('.fe-btn_reservation-detail');
    this.$btnExportCalendar = this.$container.find('.fe-btn_export-calendar');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$btnHistory.on('click', $.proxy(this._historyService.goLoad, this, '/myt-data/5g-setting/history'));
    this.$btnMyTdata.on('click', $.proxy(this._historyService.goLoad, this, '/myt-join/myplan'));
    this.$btnReservation.on('click', $.proxy(this._historyService.goLoad, this, '/myt-data/5g-setting/reservation'));
    this.$btnExportCalendar.on('click', $.proxy(this._exportCalendar, this));
    this.$btnReservationDetail.on('click', $.proxy(this._openReservationDetail, this));
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
      hbs: 'popup',
      notice_has: 'og-popup-intro',
      cont_align: 'tc',
      contents: '<img src="' + Tw.Environment.cdn + '/img/t_m5g/temp/pop_intro.png" alt="인트로 안내 이미지(변경예정)" style="max-width:100%;">',
      bt_b: [{
        style_class: 'pos-left',
        txt: '다시보지 않기'
      }, {
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
   * @desc 달력 내보내기
   */
  _exportCalendar: function () {
    this._nativeService.send(Tw.NTV_CMD.SEND_CALENDAR, {
      title: '예약',
      startTimestamp: moment(this._reservationInfo.convStaDtm, 'YYYYMMDDHHmmss').format('YYYYMMDDHHmm'),
      endTimestamp: moment(this._reservationInfo.convEndDtm, 'YYYYMMDDHHmmss').format('YYYYMMDDHHmm')
    });
  },

  /**
   * @function
   * @desc 예약상세
   */
  _openReservationDetail: function () {
    this._popupService.open({
      hbs: 'T5G_02_01',
      data: {
        convData: (function (data) {
          data = Tw.FormatHelper.convDataFormat(data, Tw.DATA_UNIT.MB);
          return Tw.FormatHelper.addComma(data.data) + data.unit;
        })(this._reservationInfo.cnvtdData),
        date: moment(this._reservationInfo.convStaDtm, 'YYYYMMDDHHmmss').format('M월 D일 (ddd)'),
        startTime: this._convTimeFormat(this._reservationInfo.convStaDtm),
        endTime: this._convTimeFormat(this._reservationInfo.convEndDtm)
      }
    }, $.proxy(this._onOpenReservationDetail, this), null, 'reservation-detail');
  },

  /**
   * @function
   * @desc 예약상세 event binding
   */
  _onOpenReservationDetail: function () {
    $('.fe-btn_ok').on('click', this._popupService.close.bind(this));
    $('.fe-btn_delete').on('click', $.proxy(this._deleteReservation, this));
  },

  /**
   * @function
   * @desc 예약삭제 confirm
   */
  _deleteReservation: function () {
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_5G.CONFIRM_RESERVATION_DELETE.MSG.replace('${data}', $('.fe-data').html()),
      Tw.ALERT_MSG_5G.CONFIRM_RESERVATION_DELETE.TITLE,
      $.proxy(this._onConfirmDeleteReservation, this), null, Tw.BUTTON_LABEL.CANCEL, Tw.ALERT_MSG_5G.CONFIRM_RESERVATION_DELETE.BUTTON);
  },

  /**
   * @function
   * @desc 예약삭제 api call
   */
  _onConfirmDeleteReservation: function () {
    this._popupService.close();
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_06_0083, {})
    .done($.proxy(this._procConfirmRes, this))
    .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 예약삭제 api callback
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
   * @desc 시간 포멧 변환
   * @param time
   */
  _convTimeFormat: function (time) {
    return moment(time, 'YYYYMMDDHHmmss').format('A h시 m분').replace(' 0분', '');
  }

};
