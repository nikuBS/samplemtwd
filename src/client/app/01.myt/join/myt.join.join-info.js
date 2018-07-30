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
  },

  // 개통/변경 이력조회 팝업
  _openHistoryPop : function (e) {
    var $_this = $(e.currentTarget);
    var temp = $_this.data('history');
    Tw.Logger.info('>>> openPop ', temp );
    this._popupService.open({
      hbs: 'MY_01_02_L01',
      data: {
        list : JSON.parse($_this.data('history'))
      }
    }, $.proxy(this._historyPopEvent, this));
  },

  _historyPopEvent : function () {

  }

};