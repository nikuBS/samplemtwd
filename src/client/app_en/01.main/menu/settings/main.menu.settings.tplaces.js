/**
 * @file T 알림 설정 화면 관련 처리
 * @author junho kwon (yamanin1@partner.sk.com)
 * @since 2019-5-22
 */

/**
 * @class
 * @param  {Object} rootEl - 최상위 element
 */
Tw.MainMenuSettingsTplaces = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._init();
  this._bindEvents();
};

Tw.MainMenuSettingsTplaces.prototype = {

  /**
   * @function
   * @desc device의 notification on/off 여부 확인하여 안내 영역 노출 결정
   */
  _init: function () {
  },

  _bindEvents: function () {
    this.$container.on('click','.popup-closeBtn',$.proxy(this._goBack,this));
    this.$container.on('click', '#fe-list .fe-list', $.proxy(this._onListItemClicked, this));
  },

  /**
   * @function
   * @member
   * @desc 뒤로가기
   * @returns {void}
   */
  _goBack : function () {
    this._historyService.goBack();
  },

  /**
   * @function
   * @desc 리스트 화면에서 지점 선택시 해당 지점의 셍세화면으로 이동
   * @param  {Object} e - click event
   */
  _onListItemClicked: function (e) {
    if (e.target.nodeName.toLowerCase() === 'a') {
      return;
    }
    var code = $(e.currentTarget).attr('value');
    this._historyService.goLoad('/customer/agentsearch/detail?code=' + code);
  }
};
