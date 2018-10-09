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
    this.$homeButton = this.$container.siblings().find('.bt-link-tx');
    //닫기버튼
    this.$closeButton = this.$container.parent().siblings('#header').find('.close-step');
  },

  _onOkClicked: function () {
    // 요금안내서 재발행 최초화면으로 이동 (MY_03_03_01)
    // back 했을 경우 현재 페이지로 넘어오지 않아야 함으로 location.replace를 호출한다.
    window.location.replace('/myt/bill/guidechange');
  },

  _onHomeClicked: function () {
    // back 했을 경우 현재 페이지로 넘어오지 않아야 함으로 location.replace를 호출한다.
    window.location.replace('/main/home');
  },

  _onCloseClicked: function (/*event*/) {
    // 이전화면으로 이동 - history back 하는게 맞을가?
    history.back();
  }
};