/**
 * FileName: myt-fare.bill.guide.skbd.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.12.06
 */
Tw.MyTFareBillGuideSKBD = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  // 서버에서 화면 로딩후 바로 popup하니 cdn이 로딩되지 않아
  // xtractor_script.js에서 popup.hbs가 404오류가나는 현상으로
  // 아래 코드로 변경
  if( !Tw.Environment.init ) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openSkbdPopup, this));
  } else {
    this._openSkbdPopup();
  }
};

Tw.MyTFareBillGuideSKBD.prototype = {

  /**
   * sk브로드밴드인 경우 진입할 수 없다는 알림창을 오픈한다.
   */
  _openSkbdPopup: function(){
    Tw.Logger.info('cdn:', Tw.Environment.cdn);


    Tw.Popup.openModalTypeATwoButton(
      Tw.MYT_JOIN.BROADBAND_ERROR.TITLE,
      Tw.MYT_JOIN.BROADBAND_ERROR.CONTENTS,
      Tw.MYT_JOIN.BROADBAND_ERROR.LINK_TXT,
      Tw.BUTTON_LABEL.CLOSE,
      undefined,
      $.proxy(Tw.CommonHelper.openUrlExternal, this, Tw.MYT_JOIN.BROADBAND_ERROR.LINK),
      $.proxy(function () {
        Tw.CommonHelper.startLoading('.wrap', 'grey', true);
        this._historyService.goBack();
      }, this)
    );
  }
};