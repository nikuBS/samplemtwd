/**
 * FileName: myt.benefit.discount.detail.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.14
 */

Tw.MyTBenefitDisCntDetail = function(params) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._inputHelper = Tw.InputHelper;

  this.$container = params.$element;
  this.data = params.data;

  this._rendered();
  this._bindEvent();
};

Tw.MyTBenefitDisCntDetail.prototype = {

  _rendered: function() {

  },

  _bindEvent: function() {

  }
};