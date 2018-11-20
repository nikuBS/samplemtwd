/**
 * FileName: myt-data.prepaid.alarm.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.19
 */

Tw.MyTDataPrepaidAlarm = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidAlarm.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-alarm-status', $.proxy(this._onChangeStatus, this));
    this.$container.on('click', '.fe-alarm-category', $.proxy(this._onChangeStatus, this));
    this.$container.on('click', '.fe-alarm-date', $.proxy(this._onChangeStatus, this));
    this.$container.on('click', '.fe-alarm-amount', $.proxy(this._onChangeStatus, this));
  },

  _onChangeStatus: function (e) {
    var fnSelectStatus = function (item) {
      return {
        value: item.title,
        option: false,
        attr: 'data-value=' + item.value
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_AMOUNT.title,
        data: [{ list: Tw.MYT_PREPAID_AMOUNT.list.map($.proxy(fnSelectStatus, this)) }]
      },
      $.proxy(this._selectPopupCallback, this),
      null
    );
  },

  _selectPopupCallback: function ($target, $layer) {
    $layer.on('click', '[data-value]', $.proxy(this._setSelectedValue, this, $target));
  },

  _requestAlarmSetting: function () {

  }
};