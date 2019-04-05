/**
 * FileName: myt-join.common.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2019.2.1
 */
Tw.MyTJoinCommon = function () {
};

Tw.MyTJoinCommon.prototype = {

  /**
   * init이 일어나는 경우 sk브로드밴드 알림창을 띄운다.
   * @param closeCallback - popup close function 또는 Tw.HistoryService
   */
  openSkbdAlertOnInit: function(closeCallback){

    if(closeCallback && typeof closeCallback === 'object'){
      var historyService = closeCallback;
      closeCallback = function(){
        historyService.goBack();
      };
    }

    if( !Tw.Environment.init ) {
      $(window).on(Tw.INIT_COMPLETE, $.proxy(this.openSkbdAlert, this,  closeCallback));
    } else {
      this.openSkbdAlert(closeCallback);
    }
  },

  /**
   * sk브로드밴드인 경우 진입할 수 없다는 알림창을 오픈한다.
   * @param fnCloseCallback - popup close function
   */
  openSkbdAlert: function(fnCloseCallback){
    // 이슈1 : 저사양 기기 문제로 setTimeout
    // 이슈2 : 저사양기기 팝업닫히지 않는 현상으로 popup.service 수정 후 -> 이곳에 setTimeout 을 적용하지 않으면 화면이 뒤로가는 현상 있으니 수정시 주의(DV001-17470)
    setTimeout(function(){
    Tw.Popup.openModalTypeATwoButton(
      Tw.MYT_JOIN.BROADBAND_ERROR.TITLE,
      Tw.MYT_JOIN.BROADBAND_ERROR.CONTENTS,
      Tw.MYT_JOIN.BROADBAND_ERROR.LINK_TXT,
      Tw.BUTTON_LABEL.CLOSE,
      undefined,
      $.proxy(Tw.CommonHelper.openUrlExternal, this, Tw.MYT_JOIN.BROADBAND_ERROR.LINK),
      fnCloseCallback
    );
    }.bind(this),200);
  }

};
