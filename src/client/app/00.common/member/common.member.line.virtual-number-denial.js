
/**
 * @file common.member.line.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.27
 */

/**
 * @class
 * @desc 공통 > 회선관리
 * @param rootEl
 * @param defaultCnt
 * @constructor
 */
Tw.CommonMemberLineVirtualNumberDenial = function (rootEl, deniableLineList) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this.denialButtons = null;
  this._deniableLineList = deniableLineList
  
  this._cacheElements();
  this._bindEvent();
};

Tw.CommonMemberLineVirtualNumberDenial.prototype = {

  _cacheElements: function() {
    this.denialButtons = this.$container.find('.fe-bt-denial');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    // TODO: 거부 버튼 각각에 가입/해지 BFF 호출 후 버튼 모양 변경 이벤트 추가 
    for (var i=0 ; i < this.denialButtons.length ; i++ ) {
      $(this.denialButtons[i]).bind('click', $.proxy(function(index) { this._deniableLineList[index].svcMgmtNum }, this, i) );
    }

    this.$container.on('click', '.fe-bt-confirm', $.proxy(function() { this._historyService.goBack() }, this));
    this.$container.on('click', '.fe-bt-cancel', $.proxy(function() { this._historyService.goBack() }, this));
  }
};
