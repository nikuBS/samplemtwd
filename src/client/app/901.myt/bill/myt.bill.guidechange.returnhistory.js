/**
 * FileName: myt.bill.reissue.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
Tw.MyTBillReturnHistory = function (rootEl, svcInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._svcInfo = JSON.parse(svcInfo);
  this._myGuideChange = new Tw.MyTBillGuidechange();
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
    //확인 -> 요금안내서 메인화면으로 이동
    window.location.replace('/myt/bill/guidechange');
  },

  _onMoveClicked: function (event) {
    // 요금안내서로 이동
    // window.location.replace(url)
    var type = $(event.target).attr('data-type');
    if ( type && type === 'blank' ) {
      // 반송내역이 없는 경우 - 사용요금 및 요금안내서 화면으로 이동
      window.location.replace('/myt/bill/billguide');
    }
    else {
      // 반송내역이 있는 경우 - 요금안내서 미리보기 팝업으로 이동
      // this._popupService.open({
      //   hbs: 'MY_03_03_01_L02'// hbs의 파일명
      // });
      // 미리보기 팝업 이동 시 MytGuidechange 내 함수 호출하도록 수정
      this._myGuideChange.callOpenPreview({
        svcAttrCd: this._svcInfo.svcAttrCd,
        billType: 'P'
      });
    }
  },

  _onCloseClicked: function () {
    // -> 이전
    history.back();
  }
};