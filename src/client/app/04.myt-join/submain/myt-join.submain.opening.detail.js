/**
 * MenuName: 나의 가입정보 > 서브메인 > 개통정보 조회(MS_01)
 * @file myt-join.submain.opening.detail.js
 * @author Kim, Hansoo (skt.P148890@partner.sk.com)
 * @since 2019-12-11
 */
/**
 * @class
 * @param {jQuery} rootEl
 */
Tw.MyTJoinOpeningDetail = function (rootEl) {
  this.$container = rootEl;
  // this._apiService = Tw.Api;
  // this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._init();
};

Tw.MyTJoinOpeningDetail.prototype = {
  /**
   * @function
   * @private
   * @desc 최초 실행
   */
  _init: function () {
    // this._cachedElement();
    this._bindEvent();
  },
  /*
  /!**
   * @function
   * @private
   * @desc 변수 초기화
   * @private
   *!/
  _cachedElement: function () {
    this.$btnClose = this.$container.find('.popup-closeBtn');
  },
  */
  /**
   * @function
   * @private
   * @desc 이벤트 설정
   */
  _bindEvent: function () {
    this.$container.on('click', '.popup-closeBtn', $.proxy(this._historyService.goBack, this));
  }
};
