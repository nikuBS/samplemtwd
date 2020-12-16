/**
 * @file customer.email.history.detail.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.11.05
 */

Tw.CustomerEmailHistoryDetail = function (rootEl, chkSvcNumForReply) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  // this._chkSvcNumForReply = chkSvcNumForReply === 'Y' ? true : false;
  this._chkSvcNumForReply = chkSvcNumForReply === 'Y' || false; // psblReplyYn : 문의 했던 내역 회선 번호 일치 여부

  this._cachedElement();
  this._bindEvent();
  this._init();

  new Tw.XtractorService(this.$container); // 재문의 버튼 클릭 시 통계 코드 적용
};

Tw.CustomerEmailHistoryDetail.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn_retry_inquiry', $.proxy(this._retryInquiry, this));
    this.$container.on('click', '.fe-btn_remove_inquiry', $.proxy(this._removeInquiry, this));
    this.$container.on('click', '.fe-email-close', $.proxy(this._history.goBack, this));
  },

  _retryInquiry: function (e) {

    // 현재 회선 번호가 문의 할 당시의 회선번호인지 여부에 따라 재문의 불가 팝업 노출 - OP002-11435
    if (!this._chkSvcNumForReply) {
      this._popupService.openAlert(Tw.CUSTOMER_EMAIL.RETRY_INVALID_LINE);
      return;
    }

    var inqclcd = $(e.currentTarget).data('inqclcd');

    // service or membership('C') inquiry, 모든 data 타입 다 보내서 FE 서버에서 처리, inqid만 따로 보내면 FE 서버에서 스트링으로 타입 변환 해야 오류 발생하지 않음
    if ( inqclcd === 'B' || inqclcd === 'C' ) {
      this._history.replaceURL('/customer/emailconsult/service-retry?' + $.param($(e.currentTarget).data()));
    }

    // quality inquiry, 모든 data 타입 다 보내서 FE 서버에서 처리, inqid만 따로 보내면 FE 서버에서 스트링으로 타입 변환 해야 오류 발생하지 않음
    if ( inqclcd === 'Q' ) {
      this._history.replaceURL('/customer/emailconsult/quality-retry?' + $.param($(e.currentTarget).data()));
    }
  },

  _removeInquiry: function (e) {
    var inqId = $(e.currentTarget).data('inqid');
    var inqClCd = $(e.currentTarget).data('inqclcd');

    this._popupService.openConfirmButton(
      Tw.CUSTOMER_EMAIL.HISTORY_DELETE.CONTENT,
      Tw.CUSTOMER_EMAIL.HISTORY_DELETE.TITLE,
      $.proxy(this._requestRemoveInquiry, this, inqId, inqClCd),
      null,
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES,
      $(e.currentTarget)
    );
  },

  _requestRemoveInquiry: function (inqId, inqClCd) {
    this._popupService.close();

    this._apiService.request(Tw.API_CMD.BFF_08_0062, {
      inqId: inqId,
      inqClCd: inqClCd
    }).done($.proxy(this._onSuccessRemoveInquiry, this));
  },

  _onSuccessRemoveInquiry: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/emailconsult/history');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};

