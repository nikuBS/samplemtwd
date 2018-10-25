/**
 * FileName: mmyt-fare.bill.set.complete.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 10. 05
 */
Tw.MyTFareBillSetComplete = function (rootEl) {
  this.$container = rootEl;
  this._init();
};

Tw.MyTFareBillSetComplete.prototype = {
  _init : function() {
    this._initVariables();
    this._bindEvent();
  },

  _initVariables: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.complete-closeBtn', $.proxy(this._goMain,this));
  },

  _goMain : function () {
    window.location.replace('/myt/fare/bill/set');
  }

};