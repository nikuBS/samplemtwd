/**
 * @file 데이터 시간설정 공통
 * @author 양정규
 * @since 2019-09-17
 */

/**
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 */
Tw.MyTData5gSetting = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._nativeService = Tw.Native;

  this._cachedElement();
  this._bindEvent();
};

Tw.MyTData5gSetting.prototype = {

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$btnHistory = this.$container.find('.fe-btn_history');
    this.$btnMyTdata = this.$container.find('.fe-btn_mytdata');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$btnHistory.on('click', $.proxy(this._historyService.goLoad, this, '/myt-data/5g-setting/history'));
    this.$btnMyTdata.on('click', $.proxy(this._historyService.goLoad, this, '/myt-join/myplan'));
  }

};
