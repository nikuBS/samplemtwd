/**
 * FileName: myt.benefit.discount.main.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.14
 */

Tw.MyTBenefitDisCntMain = function(params) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._inputHelper = Tw.InputHelper;

  this.$container = params.$element;
  this.data = params.data;

  this._rendered();
  this._bindEvent();
};

Tw.MyTBenefitDisCntMain.prototype = {

  _rendered: function() {

  },

  _bindEvent: function() {

  }
};