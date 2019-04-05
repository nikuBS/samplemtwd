/**
 * @file myt-join.wire.set.wire-cancel-service.info.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.12.12
 * ViewId: MS_04_08_01
 */
Tw.MyTJoinWireSetWireCancelServiceInfo = function (rootEl, data) {

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._data = data;

  this._history = new Tw.HistoryService();

  this._bindEvent();
};

Tw.MyTJoinWireSetWireCancelServiceInfo.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '#btn-abort-cancel', $.proxy(this._onclickAbortCancel, this));
  },

  /**
   * 해지신청 취소버튼 클릭시
   * @private
   */
  _onclickAbortCancel: function(){
    // 확인 2_A203
    // this._popupService.openConfirm(
    //   '해지신청을 취소하시겠습니까?',
    //   null,
    //   $.proxy(this._requestAbortCancel, this)
    // );
  },


  /**
   * 해지신청 취소 요청
   * @private
   */
  _requestAbortCancel: function(){
    Tw.CommonHelper.startLoading('.container', 'grey');

    var param = {
      svcMgmtNum : $('.myfare-list').data('svc-mgmt-num')
    };

    // console.log('svcMgmtNum : ' + svcMgmtNum);
    // console.log('svcMgmtNum : ' + svcMgmtNum);
    // console.log('svcMgmtNum : ' + svcMgmtNum);
    // console.log('svcMgmtNum : ' + svcMgmtNum);
    // console.log('svcMgmtNum : ' + svcMgmtNum);

    this._apiService.request(Tw.API_CMD.BFF_05_0159, param)
      .done($.proxy(function (resp) {

        Tw.CommonHelper.endLoading('.container');

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        // 완료처리 서브메인으로 이동
        this._historyService.goLoad('/myt-join/submain');

      }, this))
      .fail(function(err){
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });
  }

};