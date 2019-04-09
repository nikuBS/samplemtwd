/**
 * @file benefit.submain.fare.info.js
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018-12-19
 */

/**
 * @class
 * @desc 혜택할인 > 혜택/할인 > 개별안내페이지 > 단통법관련문의안내 팝업
 */
Tw.BenefitSubmainFareInfo = function () {
  this.$container = $('.container-wrap');
  this._popupService = Tw.Popup;
  this._init();
};

Tw.BenefitSubmainFareInfo.prototype = {

  /**
   * @function
   * @desc 최초 실행
   */
  _init: function () {
    this._bindEvent();
  },

  /**
   * @function
   * @desc 이벤트 설정
   */
  _bindEvent: function () {
    this.$container.on('click', '#fe-external-url a', $.proxy(this._alertCharge, this));
  },

  /**
   * @function
   * @desc 과금발생 알러트
   * @param {Object} e
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