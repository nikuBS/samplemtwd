/**
 * FileName: myt.bill.reissue.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
Tw.MyTBillReissue = function ($element) {
  var self = this;
  this.$container = $element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._rendered();
  this._bindEvent();

  setTimeout(function () {
    self._init();
  }, 0);
};

Tw.MyTBillReissue.prototype = {
  //element event bind
  _bindEvent: function () {
    // 재발행 요청
    this.$okButton.on('click', $.proxy(this._onOkClicked, this));
    // 닫기 버튼
    this.$closeButton.on('click', $.proxy(this._onCloseClicked, this));
  },

  //set selector
  _rendered: function () {
    //대표안내서
    this.$guide = this.$container.find('.txt-type');
    //시점
    this.$time = this.$container.find('[data-id=time]');
    //월
    this.$month = this.$container.find('[data-id=month]');
    //사유
    this.$reason = this.$container.find('[data-id=reason]');
    //유형
    this.$type = this.$container.find('[data-id=type]');
    //신청버튼
    this.$okButton = this.$container.find('.bt-red1');
    //닫기버튼
    this.$closeButton = this.$container.parent().siblings('#header').find('.close-step');
  },

  _init: function () {
    //최초 진입시 설정 - 첫번째 아이템 선택
    this.$time.find(':radio').eq(0).trigger('click');
    this.$month.find(':radio').eq(0).trigger('click');
    //선택적으로 노출되는 아이템
    if ( this.$reason.length > 0 ) {
      // 반송처리 선택
      this.$reason.find(':radio').eq(1).trigger('click');
    }
    if ( this.$type.length > 0 ) {
      this.$type.find(':radio').eq(0).trigger('click');
    }
  },

  _onOkClicked: function (/*event*/) {
    // 재발행 신청
    // API 호출 후 결과 값에 기 발행인 경우와 아닌 경우에 대한 처리
    // 기본적으로 설정된 값으로 표시
    var selectedItem = this.$guide.text();
    var type = null;
    if ( this.$type ) {
      //유형이 설정이 된다면 선택된 아이템에서 가져와 표시
      selectedItem = this.$type.find('[aria-checked=true]').text();
      type = this.$type.find(':checked').attr('name');
    }
    var title = Tw.MSG_MYT.BILL_GUIDE_REISSUE_00;
    var contents = selectedItem + Tw.MSG_MYT.BILL_GUIDE_REISSUE_01;
    if ( type && type === '02' ) {
      // 이메일인 경우 문구 다름
      contents = Tw.MSG_MYT.BILL_GUIDE_REISSUE_02;
    }
    else if ( type && type === '99' ) {
      // 기타(우편)인 경우
      contents = Tw.MSG_MYT.BILL_GUIDE_REISSUE_04;
    }
    // if() { //기발행인 경우
    // contents = Tw.MSG_MYT.BILL_GUIDE_REISSUE_03;
    // this._popupService.openAlert(title, contents, $.proxy(this._onOkPopupClicked, this));
    // this.isIssue = true;
    // }
    // else { //  아닌경우
    this.isIssue = false;
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, title, contents,
      null, $.proxy(this._onOkPopupClicked, this));
    //}
  },

  _onCloseClicked: function (/*event*/) {
    // 취소 방지 Alert
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_MYT.BILL_GUIDE_REISSUE_EXIT, null, null, $.proxy(this._handleClose, this));
  },

  _handleClose: function () {
    window.location.replace('/myt/bill/guidechange');
  },

  _onOkPopupClicked: function () {
    this._requestReissue();
  },

  _requestReissue: function (/*event*/) {
    // 재발행 데이터 설정
    // sReIssueType	재발행코드종류
    // sInvDt	재발행청구일자
    // TODO: 서버 API 확인 필요!!
    var data = {
      sReIssueType: this.$guide.attr('data-type') || '', // 재발행코드종류
      sInvDt: this.$month.find(':checked').attr('name') || '', // 재발행청구일자
      sReisueRsnCd: '01' //기본은 무선
    };
    // 청구서타입 유형이 2개인 경우
    if ( this.$type.length > 0 ) {
      data.sReIssueType = this.$type.find(':checked').attr('name');
    }

    // 유선인 경우 재발행 사유 추가
    if ( this.$reason.length > 0 ) {
      data.sReisueRsnCd = this.$reason.find(':checked').attr('name');
    }

    //재발행신청 API 호출
    this._apiService
      .request(Tw.API_CMD.BFF_05_0048, data)
      .done($.proxy(this._onApiSuccess, this))
      .fail($.proxy(this._onApiError, this));
  },

  _onApiSuccess: function (params) {
    Tw.Logger.info(params);
    if ( this.isIssue ) {
      // TODO: 서버 API 동작은 하나 현재 데이터 값이 Null 이라 요청( 18/07/13 )
    }
    else { //아닌경우
      var type = this.$guide.attr('data-type');
      var month = this.$month.find(':checked').attr('name') || '';
      if ( this.$type.length > 0 ) {
        type = this.$type.find(':checked').attr('name');
      }
      // 재발행 요청 완료 화면으로 이동
      // 팝업닫고 이동
      this._popupService.close();
      window.location.href = 'reissue/complete?typeCd=' + type + '&month=' + month;
    }
  },

  _onApiError: function (params) {
    // API 호출 오류
    Tw.Logger.warn(params);
  }
};