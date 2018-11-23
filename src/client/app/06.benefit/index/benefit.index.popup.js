/**
 * FileName: benefit.index.popup.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.11.22
 */
Tw.BenefitIndexPopup = function () {
  this._popupService = Tw.Popup;
};

Tw.BenefitIndexPopup.prototype = {

  // 단통법관련문의안내 팝업
  openPopupRestrictLaw : function () {
    this._popupService.open({ hbs: 'BS_03_01_01_01'}, $.proxy(this._openCallbackRestrictLaw, this), null, 'restrict-law');
  },

  _openCallbackRestrictLaw : function ($layer) {
    var openUrlExternal = function(href) {
      Tw.CommonHelper.openUrlExternal(href,'');
    };
    var openExternal = function (e) {
      e.preventDefault();
      var $target = $(e.currentTarget);
      var $this = this;
      var _href = $target.attr('href');
      if ( Tw.FormatHelper.isEmpty($target.attr('href')) ) {
        return;
      }

      // Tworld 는 과금발생 알러트 제외
      if ( $target.attr('data-no-alert') !== undefined ) {
        openUrlExternal(_href);
      } else {
        this._popupService.openConfirm(Tw.ALERT_MSG_BENEFIT.CONFIRM_3_A15, null, function () {
          $this._popupService.close();
          openUrlExternal(_href);
        });
      }
    };

    $layer.on('click', 'a', $.proxy(openExternal,this));

  },
  
  // 가입가능한 요금상품 팝업
  openPopupJoinableProduct : function () {
    this._popupService.open({ hbs: 'BS_03_01_01_02'}, null, null, 'joinable-product');
  }

};