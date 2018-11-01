/**
 * FileName: membership.info.grade.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.31
 */
Tw.MembershipInfoGrade = function (rootEl) {
  this.$container = rootEl || $('.wrap');
  this._membershipLayerPopup = new Tw.MembershipInfoLayerPopup(this.$container);
  this._init();
};

Tw.MembershipInfoGrade.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },

  _initVariables: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '#fe-expire-info', $.proxy(this._openExpireInfo,this));
  },

  // 가입중지 카드(TPLE, Couple 카드) 팝업 오픈
  _openExpireInfo : function (e) {
    this._membershipLayerPopup.open('BE_04_01_L01');
  }


};
