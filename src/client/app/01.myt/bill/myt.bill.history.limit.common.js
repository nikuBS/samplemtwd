/**
 * FileName: myt.bill.history.limit.common.js
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.02
 */

Tw.MyTBillHistoryLimitCommon = function (rootEl, type) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this.common = new Tw.MyTBillHistoryCommon(rootEl);
  this.type = type;

  this._cachedElement();

  this._init();
};

Tw.MyTBillHistoryLimitCommon.prototype = {
  _cachedElement: function () {
    this.rest = this.$container.find('#fe-limit-rest');
    this.usedLimit = this.$container.find('#fe-limit-usedLimit');
    this.use = this.$container.find('#fe-limit-use');
    this.prepay = this.$container.find('#fe-limit-prepay');
    this.max = this.$container.find('#fe-prepay-max');
  },

  _init: function () {
    switch(this.type) {
      case 'contents':
        this.apiName = Tw.API_CMD.BFF_07_0081;
        this._currentCallback = this._updateContentsLimitUI;
        break;
      case 'micro':
        this.apiName = Tw.API_CMD.BFF_07_0073;
        this._currentCallback = this._updateMicroLimitUI;
        break;
      default:
        break;
    }
    // this.apiName
    (new this.common.getLimit())._init(this.apiName, $.proxy(this._currentCallback, this));
  },

  _updateMicroLimitUI: function(res) {
    this.rest.html(Tw.FormatHelper.addComma(res.result.remainUseLimit));
    this.usedLimit.html(Tw.FormatHelper.addComma(res.result.microPayLimitAmt));
    this.use.html(Tw.FormatHelper.addComma(res.result.tmthUseAmt));
    this.prepay.html(Tw.FormatHelper.addComma(res.result.tmthChrgAmt));
    this.max.html(Tw.FormatHelper.addComma(res.result.tmthChrgPsblAmt));
  },

  _updateContentsLimitUI: function (res) {
    console.log(res);
    this.rest.html(Tw.FormatHelper.addComma(res.result.remainUseLimit));
    this.usedLimit.html(Tw.FormatHelper.addComma(res.result.useContentsPayLimitAmt));
    this.use.html(Tw.FormatHelper.addComma(res.result.tmthUseAmt));
    this.prepay.html(Tw.FormatHelper.addComma(res.result.tmthChrgAmt));
    this.max.html(Tw.FormatHelper.addComma(res.result.tmthChrgPsblAmt));
  }
};
