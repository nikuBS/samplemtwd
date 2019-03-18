/**
 * FileName: myt-fare.info.cancel-draw.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 9. 17
 */

Tw.MyTFareInfoCancelDraw = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._bankList = new Tw.MyTFareBillBankList(this.$container);
  
  this._init();
  this._cachedElement();
  this._bindEvent();
};

Tw.MyTFareInfoCancelDraw.prototype = {
  _init: function () {
    this.rootPathName = this._historyService.pathname;
  },

  _cachedElement: function () {
    this.$cancelBtn = this.$container.find('.fe-btn-cancel');

    // page로 이동해서 정보 없을 가능성 전송버튼 disable
    if (Tw.FormatHelper.isEmpty(this.data.bankCd) || Tw.FormatHelper.isEmpty(this.data.bankAccount)) {
      this.$cancelBtn.find('button').prop('disabled', true);
    } 
  },

  _bindEvent: function () {
    this.$cancelBtn.on('click', 'button', $.proxy(this._processAutoWithdrawalCancel, this));
  },

  // 해지신청
  _processAutoWithdrawalCancel: function (e) {
    this._apiService.request(Tw.API_CMD.BFF_07_0069, {
      bankCd: this.data.bankCd,
      bankSerNum: this.data.bankAccount
    }).done($.proxy(this._successCancelAccount, this, $(e.currentTarget)))
      .fail($.proxy(this._apiError, this, $(e.currentTarget)));
  },

  _successCancelAccount: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.openAlert(
        Tw.MYT_FARE_HISTORY_PAYMENT.CANCEL_AUTO_WITHDRAWAL,
        Tw.POPUP_TITLE.NOTIFY, 
        Tw.BUTTON_LABEL.CONFIRM, 
        $.proxy(this._closePopAndBack, this),
        $.proxy(this._closePopAndBack, this),
        $target
      );
      // Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_PAYMENT.CANCEL_AUTO_WITHDRAWAL);      
    } else {
      this._apiError($target, res);
    }
  },

  _closePopAndBack: function() {
    this._popupService.closeAll();
    this._historyService.goBack();
  },

  _apiError: function ($target, err) {
    // Tw.Logger.error(err.code, err.msg);
    Tw.Error(err.code, Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.msg).pop(null, $target);
    // this._popupService.openAlert(Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg);
    return false;
  }
};
