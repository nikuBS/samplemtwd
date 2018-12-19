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
  $(window).on(Tw.INIT_COMPLETE, $.proxy(this._openSkbdPopup, this));

};

Tw.MyTFareBillGuideSKBD.prototype = {

  _openSkbdPopup: function(){
    Tw.Logger.info('cdn:', Tw.Environment.cdn);

    this._popupService.openOneBtTypeB(
      Tw.MYT_JOIN.BROADBAND_ERROR.TITLE,
      Tw.MYT_JOIN.BROADBAND_ERROR.CONTENTS,
      [{
        style_class: 'link',
        txt: Tw.MYT_JOIN.BROADBAND_ERROR.LINK_TXT
      }],
      'type1',
      $.proxy(function ($layer) {
        $layer.on('click', '.link', $.proxy(Tw.CommonHelper.openUrlExternal, this, Tw.MYT_JOIN.BROADBAND_ERROR.LINK));
      }, this),
      $.proxy(function () {
        Tw.CommonHelper.startLoading('.wrap', 'grey', true);
        this._historyService.goBack();
      }, this)
    );
  }
};