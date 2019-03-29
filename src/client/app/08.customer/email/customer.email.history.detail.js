/**
 * FileName: customer.email.history.detail.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.05
 */

Tw.CustomerEmailHistoryDetail = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
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
    var inqclcd = $(e.currentTarget).data('inqclcd');

    // service inquiry
    if ( inqclcd === 'B' ) {
      this._history.replaceURL('/customer/emailconsult/service-retry?' + $.param($(e.currentTarget).data()));
    }

    // quality inquiry
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
      this._history.replaceURL('/customer');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};

