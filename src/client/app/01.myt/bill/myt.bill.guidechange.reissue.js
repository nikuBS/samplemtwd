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
  }, 100);
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
    this.$closeButton = this.$container.find('.close-step');
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
    // 기본적으로 설정된 값으로 표시
    var selectedItem = this.$guide.text();
    if ( this.$type ) {
      //유형이 설정이 된다면 선택된 아이템에서 가져와 표시
      selectedItem = this.$type.find('[aria-checked=true]').text();
    }
    var title = Tw.MSG_MYT.BILL_GUIDE_00;
    var contents = selectedItem + Tw.MSG_MYT.BILL_GUIDE_01;
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, title, contents, $.proxy(this._onSubmit, this));
  },

  _onCloseClicked: function (/*event*/) {
    // 이전화면으로 이동 - history back 하는게 맞을가?
    // history.back();
  },

  _onSubmit: function (/*event*/) {
    // 재발행 데이터 설정
    // sReIssueType	재발행코드종류
    // sRegalRepveIncldYn	법정대리인동시통보
    // sInvDt	재발행청구일자
    var data = {
      sReIssueType: '',
      sRegalRepveIncldYn: 'Y',
      sInvDt: ''
    };

    //재발행신청 API 호출
    this._apiService
      .request(Tw.API_CMD.BFF_05_0048, data)
      .done($.proxy(this._onResetHistoryData, this))
      .fail($.proxy(this._onApiError, this));
  },

  _onApiSuccess: function (/*params*/) {
    // 재발행 요청 완료 팝업
    this._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDE_00, Tw.MSG_MYT.BILL_GUIDE_02, $.proxy(this._goToMain, this));

  },

  _onApiError: function () {

  },

  _gotToComplete: function () {
    // 재발행 완료 화면으로 이동
    // 이동시 정보를 어떻게 전달하느냐?

  }
};