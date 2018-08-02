/**
 * FileName: myt.join.join-info
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.30
 */
Tw.MyTJoinJoinInfo = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._bindEvent();
};

Tw.MyTJoinJoinInfo.prototype = {

  _bindEvent: function () {
    this._popupService._popupClose();
    this.$container.on('click', '#fe-open-history', $.proxy(this._openHistoryPop, this));
    this.$container.on('click', '#fe-skb-link', $.proxy(this._openSKbrodbandLink, this));
  },

  // 개통/변경 이력조회 팝업
  _openHistoryPop : function (e) {
    var $_this = $(e.currentTarget);
    this._popupService.open({
      hbs: 'MY_01_02_L01',
      data: {
        list : $_this.data('history')
      }
    });
  },
  
  // SK브로드밴드 링크 클릭
  _openSKbrodbandLink : function (e) {
    var $_this = $(e.currentTarget);
    window.open($_this.data('url'),'_blank');
  }

};