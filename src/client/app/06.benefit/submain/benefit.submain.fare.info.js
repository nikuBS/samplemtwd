/**
 * FileName: benefit.submain.fare.info.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.12.19
 */
Tw.BenefitSubmainFareInfo = function () {
  this.$container = $('.container-wrap');
  this._popupService = Tw.Popup;
  this._init();
};

Tw.BenefitSubmainFareInfo.prototype = {

  _init: function () {
    this._bindEvent();
  },

  _bindEvent: function () {
    this.$container.on('click', '#fe-external-url a', $.proxy(this._alertCharge, this));
  },

  // 과금발생 알러트
  _alertCharge: function (e) {
    e.preventDefault();

    var $target = $(e.currentTarget);
    var $this = this;
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