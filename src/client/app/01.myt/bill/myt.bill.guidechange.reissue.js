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
    //기본
    this.$time.on('change', $.proxy(this._onTimeChanged, this));
    this.$month.on('change', $.proxy(this._onMonthChanged, this));
    //선택적으로 노출되는 아이템
    if ( this.$reason.length > 0 ) {
      this.$reason.on('change', $.proxy(this._onReasonChanged, this));
    }
    if ( this.$type.length > 0 ) {
      this.$type.on('change', $.proxy(this._onTypeChanged, this));
    }
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

  _onTimeChanged: function (/*event*/) {
    Tw.Logger.info('time changed');
  },

  _onMonthChanged: function (/*event*/) {
    Tw.Logger.info('month changed');
  },

  _onReasonChanged: function (/*event*/) {
    Tw.Logger.info('reason changed');
  },

  _onTypeChanged: function (/*event*/) {
    Tw.Logger.info('type changed');
  },

  _onOkClicked: function (/*event*/) {
    // 재발행 신청
    this._requestReissue();
  },

  _onCloseClicked: function (/*event*/) {
    // 이전화면으로 이동 - history back 하는게 맞을가?
    history.back();
  },

  _onOkPopupClicked: function () {
    if ( this.isIssue ) {
      //기발행인경우 서버API 동작이 되어야 확인 가능함...
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

  _requestReissue: function (/*event*/) {
    // 재발행 데이터 설정
    // sReIssueType	재발행코드종류
    // sRegalRepveIncldYn	법정대리인동시통보
    // sInvDt	재발행청구일자
    var data = {
      sReIssueType: this.$guide.attr('data-type') || '',
      sRegalRepveIncldYn: 'Y',
      sInvDt: this.$month.find(':checked').attr('name') || '',
      sReisueRsnCd: '01' //기본은 무선
      //재발행청구시점 정보가 빠져있음 (this.$time.find(':checked').attr('name') || '')
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
    // API 호출 후 결과 값에 기 발행인 경우와 아닌 경우에 대한 처리
    // 기본적으로 설정된 값으로 표시
    var selectedItem = this.$guide.text();
    if ( this.$type ) {
      //유형이 설정이 된다면 선택된 아이템에서 가져와 표시
      selectedItem = this.$type.find('[aria-checked=true]').text();
    }
    Tw.Logger.warn(params);
    var title = Tw.MSG_MYT.BILL_GUIDE_00;
    var contents = selectedItem + Tw.MSG_MYT.BILL_GUIDE_01;
    // if() { //기발행인 경우
    // contents = Tw.MSG_MYT.BILL_GUIDE_03;
    // this._popupService.openAlert(title, contents, $.proxy(this._onOkPopupClicked, this));
    // this.isIssue = true;
    // }
    // else { //  아닌경우
    this.isIssue = false;
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, title, contents,
      null, $.proxy(this._onOkPopupClicked, this));
    //}
  },

  _onApiError: function (params) {
    // API 호출 오류
    Tw.Logger.warn(params);
  }
};