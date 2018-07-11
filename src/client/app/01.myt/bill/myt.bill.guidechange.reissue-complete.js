/**
 * FileName: myt.bill.reissue.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
Tw.MyTBillReissueComplete = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._rendered();
  this._bindEvent();
};

Tw.MyTBillReissueComplete.prototype = {
  _bindEvent: function () {
    // 확인
    this.$okButton.on('click', $.proxy(this._onOkClicked, this));
    // 홈
    this.$homeButton.on('click', $.proxy(this._onHomeClicked, this));
    // 닫기
    this.$closeButton.on('click', $.proxy(this._onCloseClicked, this));
  },

  //set selector
  _rendered: function () {
    //확인버튼
    this.$okButton = this.$container.find('.bt-blue1');
    //홈버튼
    this.$homeButton = this.$container.find('.bt-link-tx');
    //닫기버튼
    this.$closeButton = this.$container.find('.close-step');
  },

  _onOkClicked: function () {

  },

  _onHomeClicked: function () {

  },

  _onCloseClicked: function () {

  }
};