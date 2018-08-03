/**
 * FileName: myt.usage.pattern.detail.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.03
 *
 */

Tw.MyTUsagePatternDetail = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._basFee = params.data.basFee;
  this._domTcFee = params.data.domTcFee;
  this._dataTcFee = params.data.dataTcFee;
  this._infoUseFee = params.data.infoUseFee;
  this._optFee = params.data.optFee;
  this._msgUseFee = params.data.msgUseFee;
  this._suplSvcUseFee = params.data.suplSvcUseFee;
  this._othrCoUseFee = params.data.othrCoUseFee;
  this._empty = params.data.empty;
  this._defaultChartSetting = {
    min: 0, //Min크기
    max: 250, //Max크기
    spd: 0.05, //애니메이션 속도
    h: 250, //세로크기
    caption: Tw.MSG_MYT.USAGE_PATTERN.CAPTION,//숨겨진표에 사용 접근성관련이슈
    tf_txt: Tw.MSG_MYT.USAGE_PATTERN.TF,//숨겨진표에 사용 접근성관련이슈
    td_txt: Tw.MSG_MYT.USAGE_PATTERN.TD//숨겨진표에 사용 접근성관련이슈
  };
  this._rendered();
  this._bindEvent();

  setTimeout($.proxy(this._initialize, this), 200);
};

Tw.MyTUsagePatternDetail.prototype = {
  _initialize: function () {
    this._initFeeCharts();
  },

  //element event bind
  _bindEvent: function () {
  },

  // set selector
  _rendered: function () {
  },

  _initFeeCharts: function() {

  }
};