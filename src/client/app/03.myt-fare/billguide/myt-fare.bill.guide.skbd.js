/**
 * MenuName: 나의 요금 > 요금안내서 > SK브로드밴드
 * FileName: myt-fare.bill.guide.skbd.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.12.06
 * Summary: 대표청구가 SK브로드밴드 회선인 경우
 * Description: 대표청구는 요금을 내는 기준 회선을 말함,
 *    회선이 skb이지만 대표청구가 skt인 경우는 이 화면으로 오지 않고, 통합(일반)청구 화면으로 조회
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
  _openSkbdPopup: function() {
    Tw.Logger.info('cdn:', Tw.Environment.cdn);

    // 일부 구형 기기에서 화면에서 바로 popup을 띄울경우 location.hash가 history에 쌓이지 않아 timeout을 줌
    setTimeout(function(){

    Tw.Popup.openModalTypeATwoButton(
      Tw.MYT_JOIN.BROADBAND_ERROR.TITLE,
      Tw.MYT_JOIN.BROADBAND_ERROR.CONTENTS,
      Tw.MYT_JOIN.BROADBAND_ERROR.LINK_TXT,
      Tw.BUTTON_LABEL.CLOSE,
      undefined,
      $.proxy(Tw.CommonHelper.openUrlExternal, this, Tw.MYT_JOIN.BROADBAND_ERROR.LINK),
      $.proxy(function () {

        // this._historyService.goBack();
        // 주의! - 동일 화면에서 회선변경 등으로 들어오는 경우 back하면 동일화면으로 이동되기 때문에 서브메인가도록 수정
        this._historyService.goLoad('/myt-fare/submain');
      }, this)
    );
    }.bind(this),200);
  }
};