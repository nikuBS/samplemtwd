/**
 * FileName: myt-fare.bill.guide.skbd.js
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.12.06
 */
Tw.MyTFareBillGuideSKBD = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  Tw.Popup.openOneBtTypeB(
    Tw.MYT_JOIN.BROADBAND_ERROR.TITLE,
    Tw.MYT_JOIN.BROADBAND_ERROR.CONTENTS,
    [{
      style_class: 'link',
      txt: Tw.MYT_JOIN.BROADBAND_ERROR.LINK_TXT
    }],
    'type1',
    $.proxy(function ($layer) {
      $layer.on('click', '.link', $.proxy(Tw.CommonHelper.openUrlExternal, this, Tw.MYT_JOIN.BROADBAND_ERROR.LINK));
    }, this), $.proxy(function () {
      Tw.CommonHelper.startLoading('.wrap', 'grey', true);
      this._historyService.goBack();
    }, this)
  );
};

Tw.MyTFareBillGuideSKBD.prototype = {
};