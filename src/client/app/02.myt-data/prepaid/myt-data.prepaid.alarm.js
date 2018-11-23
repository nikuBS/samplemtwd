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
    this.typeCd = 1; // 알람 기준(1 : 시간, 2 : 잔액)
    this.term = 1; //시간: 기준항목(1:발신기간, 2:수신기간, 3:번호유지기간)
    this.day = 1; //시간: 기준일(1:1일전, 2:2일전, 3:3일전)
    this.amt = 1; //금액(1:1000원, 2:2000원, 3:3000원, 5:5000원)
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-alarm-status', $.proxy(this._onChangeStatus, this, 'status_list'));
    this.$container.on('click', '.fe-alarm-category', $.proxy(this._onChangeStatus, this, 'category_list'));
    this.$container.on('click', '.fe-alarm-date', $.proxy(this._onChangeStatus, this, 'date_list'));
    this.$container.on('click', '.fe-alarm-amount', $.proxy(this._onChangeStatus, this, 'price_list'));
    this.$container.on('click', '.fe-setting-alarm', $.proxy(this._requestAlarmSetting, this));
  },

  _onChangeStatus: function (sListName, e) {
    var fnSelectStatus = function (item) {
      return {
        value: item.text,
        option: false,
        attr: 'data-value=' + item.value
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_ALARM.title,
        data: [{
          list: Tw.MYT_PREPAID_ALARM[sListName].map($.proxy(fnSelectStatus, this))
        }]
      },
      $.proxy(this._selectPopupCallback, this, sListName, $(e.currentTarget)),
      null
    );
  },

  _selectPopupCallback: function (sListName, $target, $layer) {
    $layer.on('click', '[data-value]', $.proxy(this._setSelectedValue, this, sListName, $target));
  },

  _setSelectedValue: function (sListName, $target, e) {
    if ( sListName === 'status_list' ) {
      this.typeCd = $(e.currentTarget).data('value');

      if ( this.typeCd === 1 ) {
        $('.tpl_time').show();
        $('.tpl_amount').hide();
        $('.tpl_default').hide();
      } else {
        $('.tpl_amount').show();
        $('.tpl_default').hide();
        $('.tpl_time').hide();
      }

      $('.fe-alarm-status').text($.trim($(e.currentTarget).text()));
      $('.fe-alarm-status').data($(e.currentTarget).data('value'));
    }

    if ( sListName === 'category_list' ) {
      this.term = $(e.currentTarget).data('value');
    }

    if ( sListName === 'date_list' ) {
      this.day = $(e.currentTarget).data('value');
      $('.fe-setting-alarm').prop('disabled', false);
    }

    if ( sListName === 'price_list' ) {
      this.amt = $(e.currentTarget).data('value');
      $('.fe-setting-alarm').prop('disabled', false);
    }

    $target.data($(e.currentTarget).data());
    $target.text($.trim($(e.currentTarget).text()));

    this._popupService.close();
  },

  _requestAlarmSetting: function () {
    var htParams = {};

    if ( $('.tpl_time').is(':visible') ) {
      htParams = $.extend(htParams, {
        typeCd: '1',
        term: this.term.toString(),
        day: this.day.toString()
      });
    } else {
      htParams = $.extend(htParams, {
        typeCd: '2',
        amt: this.amt.toString()
      });
    }

    this._apiService.request(Tw.API_CMD.BFF_06_0064, htParams)
      .done($.proxy(this._onCompleteAlarm, this));
  },

  _onCompleteAlarm: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      //TODO Complete Page
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};