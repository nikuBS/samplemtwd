/**
 * FileName: myt.join.product-service.fee-alarm.change.js
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.08.17
 */

Tw.MyTJoinProductServiceFeeAlarmChange = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._cachedElement();
  this._bindEvents();
};

Tw.MyTJoinProductServiceFeeAlarmChange.prototype = {

  _cachedElement: function() {
    this.$btnClose = this.$container.find('.fe-btn_close');
    this.$btnBack = this.$container.find('.fe-btn_back');
    this.$btnDelete = this.$container.find('.fe-btn_delete');
    this.$btnPut = this.$container.find('.fe-btn_put');
  },

  _bindEvents: function() {
    this.$btnClose.on('click', $.proxy(this._closeBack, this, true));
    this.$btnBack.on('click', $.proxy(this._closeBack, this, false));
    this.$btnDelete.on('click', $.proxy(this._delete, this));
    this.$btnPut.on('click', $.proxy(this._put, this));
  },

  _closeBack: function(isClose) {
    isClose ? this._historyService.go(-2) : this._historyService.goBack();
  },

  _delete: function() {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, Tw.MSG_MYT.FEE_ALARM_ALERT_A01, null, null, function() {
      this._popupService.close();
      this._apiService.request(Tw.API_CMD.BFF_05_0126, {})
        .done($.proxy(this._deleteResult, this));
    }.bind(this));
  },

  _deleteResult: function(res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return this._apiError(res);
    }

    this._popupService.openAlert(Tw.MSG_MYT.FEE_ALARM_ALERT_A01_SUCCESS, Tw.POPUP_TITLE.NOTIFY, null, function() {
      location.reload();
    }.bind(this));
  },

  _put: function() {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, Tw.MSG_MYT.FEE_ALARM_ALERT_A02, null, null, function() {
      this._popupService.close();
      this._apiService.request(Tw.API_CMD.BFF_05_0127, {})
          .done($.proxy(this._putResult, this));
    }.bind(this));
  },

  _putResult: function(res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return this._apiError(res);
    }

    this._popupService.openAlert(Tw.MSG_MYT.FEE_ALARM_ALERT_A02_SUCCESS, Tw.POPUP_TITLE.NOTIFY, null, function() {
      location.reload();
    }.bind(this));
  },

  _apiError: function (res) {
    this._popupService.openAlert(res.code + ' ' + res.msg);
    return false;
  }

};