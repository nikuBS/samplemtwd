/**
 * FileName: myt.bill.reissue.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
Tw.MyTBillReturnHistory = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._rendered();
  this._bindEvent();
};

Tw.MyTBillReturnHistory.prototype = {
  _bindEvent: function () {
    // 확인
    this.$okButton.on('click', $.proxy(this._onOkClicked, this));
    // 요금안내서 이동
    this.$mvGuideButton.on('click', $.proxy(this._onMoveClicked, this));
    // back버튼
    this.$closeButton.on('click', $.proxy(this._onCloseClicked, this));
  },

  //set selector
  _rendered: function () {
    //확인버튼
    this.$okButton = this.$container.find('.bt-blue1');
    //요금안내서 이동
    this.$mvGuideButton = this.$container.find('.bt-link-tx');
    //back버튼
    this.$closeButton = this.$container.parent().siblings('#header').find('.prev-step');
  },

  _onOkClicked: function () {
    //확인 -> 요금안내서 미리보기 팝업 연동
  },

  _onMoveClicked: function () {
    // 요금안내서로 이동
    // window.location.replace(url)
  },

  _onCloseClicked: function () {
    // -> 이전
    history.back();
  }
};