/**
 * FileName: benefit.index.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.26
 */
Tw.BenefitIndex = function (rootEl) {
  this.$container = rootEl || $('.wrap');
  this._apiService = Tw.Api;
  this._init();
};

Tw.BenefitIndex.prototype = {
  _init : function() {
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {

  },
  _bindEvent: function () {

  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
