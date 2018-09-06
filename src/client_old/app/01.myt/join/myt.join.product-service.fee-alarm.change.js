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

  _data: {
    key: null,
    del: {
      API_CMD: Tw.API_CMD.BFF_05_0127,
      CONFIRM_ALERT: Tw.MSG_MYT.FEE_ALARM_ALERT_A01,
      SUCCESS_ALERT: Tw.MSG_MYT.FEE_ALARM_ALERT_A01_SUCCESS
    },
    put: {
      API_CMD: Tw.API_CMD.BFF_05_0126,
      CONFIRM_ALERT: Tw.MSG_MYT.FEE_ALARM_ALERT_A02,
      SUCCESS_ALERT: Tw.MSG_MYT.FEE_ALARM_ALERT_A02_SUCCESS
    }
  },

  _cachedElement: function() {
    this.$btnClose = this.$container.find('.fe-btn_close');
    this.$btnBack = this.$container.find('.fe-btn_back');
    this.$btnDelete = this.$container.find('.fe-btn_delete');
    this.$btnPut = this.$container.find('.fe-btn_put');
  },

  _bindEvents: function() {
    this.$btnClose.on('click', $.proxy(this._closeBack, this, true));
    this.$btnBack.on('click', $.proxy(this._closeBack, this, false));
    this.$btnDelete.on('click', $.proxy(this._proc, this, 'del'));
    this.$btnPut.on('click', $.proxy(this._proc, this, 'put'));
  },

  _closeBack: function(isClose) {
    if (isClose) {
      return this._historyService.go(-2);
    }

    this._historyService.goBack();
  },

  _proc: function(key) {
    this._data.key = key;
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, this._data[key].CONFIRM_ALERT, null, null, $.proxy(this._procRequest, this));
  },

  _procRequest: function() {
    this._popupService.close();
    this._apiService.request(this._data[this._data.key].API_CMD, {})
        .done($.proxy(this._procResult, this));
  },

  _procResult: function(res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(res.code, res.msg).pop();
    }

    this._popupService.openAlert(this._data[this._data.key].SUCCESS_ALERT, Tw.POPUP_TITLE.NOTIFY, null, $.proxy(this._reload, this));
  },

  _reload: function() {
    this._historyService.reload();
  }

};