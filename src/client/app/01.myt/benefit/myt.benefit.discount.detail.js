/**
 * FileName: myt.benefit.discount.detail.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.14
 */

Tw.MyTBenefitDisCntDetail = function(params) {
  this.$container = params.$element;
  this.data = params.data;
  this._history = new Tw.HistoryService(this.$container);

  this._rendered();
  this._bindEvent();
};

Tw.MyTBenefitDisCntDetail.prototype = {

  _rendered: function() {

  },

  _bindEvent: function() {

  }
};