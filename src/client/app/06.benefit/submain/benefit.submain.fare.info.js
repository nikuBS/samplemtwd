/**
 * @file benefit.submain.fare.info.js
 * @author 양정규 (skt.P130715@partner.sk.com)
 * 단통법관련문의안내 팝업
 * @since 2018.12.19
 */
Tw.BenefitSubmainFareInfo = function () {
  this.$container = $('.container-wrap');
  this._popupService = Tw.Popup;
  this._init();
};

Tw.BenefitSubmainFareInfo.prototype = {

  /**
   * 최초 실행
   * @private
   */
  _init: function () {
    this._bindEvent();
  },

  /**
   * 이벤트 설정
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '#fe-external-url a', $.proxy(this._alertCharge, this));
  },

  /**
   * 과금발생 알러트
   * @param e
   * @private
   */
  _alertCharge: function (e) {
    e.preventDefault();

    var $target = $(e.currentTarget);
    var _href = $target.attr('href');

    if (Tw.FormatHelper.isEmpty($target.attr('href'))) {
      return;
    }

    // Tworld 는 과금발생 알러트 제외
    if ($target.attr('data-no-alert') !== undefined || !Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.openUrlExternal(_href);
    } else {
      Tw.CommonHelper.showDataCharge($.proxy(function(){
        Tw.CommonHelper.openUrlExternal(_href);
      },this));
    }
  }
};