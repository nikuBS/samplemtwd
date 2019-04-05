/**
 * @file myt-data.prepaid.alarm.js
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.11.19
 */

Tw.MyTDataPrepaidAlarm = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService();
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-setting-alarm'));

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataPrepaidAlarm.prototype = {
  _init: function () {
    this.typeCd = false; // 알람 기준(0: 설정안함 1 : 시간, 2 : 잔액)
    this.term = false; // 시간: 기준항목(1:발신기간, 2:수신기간, 3:번호유지기간)
    this.day = false; // 시간: 기준일(1:1일전, 2:2일전, 3:3일전)
    this.amt = false; // 금액(1:1000원, 2:2000원, 3:3000원, 5:5000원)

    this._getPrepaidAlarmInfo();
  },

  _cachedElement: function () {
    this.wrap_alarm = this.$container.find('.fe-wrap-alarm');
    this.tpl_alarm_date = Handlebars.compile($('#tpl_alarm_date').html());
    this.tpl_alarm_amount = Handlebars.compile($('#tpl_alarm_amount').html());
    this.tpl_alarm_delete = Handlebars.compile($('#tpl_alarm_delete').html());
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-alarm-status', $.proxy(this._onChangeStatus, this, 'status_list'));
    this.$container.on('click', '.fe-alarm-category', $.proxy(this._onChangeStatus, this, 'category_list'));
    this.$container.on('click', '.fe-alarm-date', $.proxy(this._onChangeStatus, this, 'date_list'));
    this.$container.on('click', '.fe-alarm-amount', $.proxy(this._onChangeStatus, this, 'price_list'));
    this.$container.on('click', '.fe-setting-alarm', $.proxy(this._requestAlarmSetting, this));
    this.$container.on('click', '.tw-popup-closeBtn', $.proxy(this._validateForm, this));
    this.$container.on('click', '.fe-back', $.proxy(this._goBack, this));
  },

  _getPrepaidAlarmInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0075, {})
      .done($.proxy(this._onSuccessAlarmInfo, this));
  },

  _onSuccessAlarmInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var result = res.result;

      if ( !!result.typeCd ) {
        this.typeCd = result.typeCd;
      }

      if ( !!result.term ) {
        this.term = result.term;
      }

      if ( !!result.day ) {
        this.day = result.day;
      }

      if ( !!result.amt ) {
        this.amt = result.amt;
      }
    }
  },

  _validateForm: function () {
    if ( !this.typeCd ) {
      $('.fe-alarm-status').closest('li').find('.error-txt').removeClass('blind').attr('aria-hidden', 'false');
    } else {
      $('.fe-alarm-status').closest('li').find('.error-txt').addClass('blind').attr('aria-hidden', 'true');
    }

    if ( !this.term ) {
      $('.fe-alarm-category').closest('div').find('.error-txt').removeClass('blind').attr('aria-hidden', 'false');
    } else {
      $('.fe-alarm-category').closest('div').find('.error-txt').addClass('blind').attr('aria-hidden', 'true');
    }

    if ( !this.day ) {
      $('.fe-alarm-date').closest('div').find('.error-txt').removeClass('blind').attr('aria-hidden', 'false');
    } else {
      $('.fe-alarm-date').closest('div').find('.error-txt').addClass('blind').attr('aria-hidden', 'true');
    }

    if ( !this.amt ) {
      $('.fe-alarm-amount').closest('div').find('.error-txt').removeClass('blind').attr('aria-hidden', 'false');
    } else {
      $('.fe-alarm-amount').closest('div').find('.error-txt').addClass('blind').attr('aria-hidden', 'true');
    }

    if ( this.typeCd === '1' && !!this.term && !!this.day ) {
      $('.fe-setting-alarm').prop('disabled', false);
    }

    if ( this.typeCd === '2' && !!this.amt ) {
      $('.fe-setting-alarm').prop('disabled', false);
    }
  },

  _onChangeStatus: function (sListName, e) {
    var $target = $(e.currentTarget);
    var fnSelectStatus = function ($target, item) {
      return {
        value: item.text,
        option: $.trim($target.text()) === $.trim(item.text) ? 'checked' : '',
        attr: 'data-value=' + item.value
      };
    };

    this._popupService.open({
        hbs: 'actionsheet_select_a_type',
        layer: true,
        title: Tw.MYT_PREPAID_ALARM.title,
        data: [{
          list: Tw.MYT_PREPAID_ALARM[sListName].map($.proxy(fnSelectStatus, this, $target))
        }]
      },
      $.proxy(this._selectPopupCallback, this, sListName, $target),
      null,
      null,
      $target
    );
  },

  _selectPopupCallback: function (sListName, $target, $layer) {
    $layer.on('click', '[data-value]', $.proxy(this._setSelectedValue, this, sListName, $target));
  },

  _setSelectedValue: function (sListName, $target, e) {
    this._popupService.close();

    var htParams = {
      typeCd: this.typeCd,
      term: this.term,
      day: this.day,
      amt: this.amt
    };

    if ( sListName === 'status_list' ) {
      this.typeCd = $(e.currentTarget).data('value').toString();

      if ( this.typeCd === '0' ) {
        this.wrap_alarm.html(this.tpl_alarm_delete({ params: htParams }));
      } else if ( this.typeCd === '1' ) {
        this.wrap_alarm.html(this.tpl_alarm_amount({ params: htParams }));
      } else {
        this.wrap_alarm.html(this.tpl_alarm_date({ params: htParams }));
      }

      if ( this.typeCd !== '0' ) {
        $('.fe-setting-alarm').prop('disabled', true);
        $('.fe-alarm-status').data($(e.currentTarget).data('value'));
      } else {
        $('.fe-setting-alarm').prop('disabled', false);
        $('.fe-alarm-status').data($(e.currentTarget).data('value'));
      }

      this.term = false; // 시간: 기준항목(1:발신기간, 2:수신기간, 3:번호유지기간)
      this.day = false; // 시간: 기준일(1:1일전, 2:2일전, 3:3일전)
      this.amt = false; // 금액(1:1000원, 2:2000원, 3:3000원, 5:5000원)
    }

    if ( sListName === 'category_list' ) {
      this.term = $(e.currentTarget).data('value');
      this._validateForm();
    }

    if ( sListName === 'date_list' ) {
      this.day = $(e.currentTarget).data('value');
      this._validateForm();
    }

    if ( sListName === 'price_list' ) {
      this.amt = $(e.currentTarget).data('value');
      this._validateForm();
    }

    $target.data($(e.currentTarget).data());
    $target.text($.trim($(e.currentTarget).text()));
  },

  _requestAlarmSetting: function (e) {
    var $target = $(e.currentTarget);
    var isChange = this.$container.find('.fe-setting-alarm').text() === Tw.BUTTON_LABEL.CHANGE;
    var htParams = {};
    if ( this.typeCd === '0' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A220, null, null, $.proxy(this._requestAlarm, this), null, $target);

    } else if ( this.typeCd === '1' ) {
      htParams = $.extend(htParams, {
        typeCd: this.typeCd,
        term: this.term.toString(),
        day: this.day.toString()
      });

      // 알람 설정 하시겠습니까?
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A71.MSG_1 +
        $('.fe-alarm-category').text().trim() +
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A71.MSG_2 +
        this.day.toString() + Tw.ALERT_MSG_MYT_DATA.ALERT_2_A71.MSG_3,
        isChange ? Tw.ALERT_MSG_MYT_DATA.ALERT_2_A204.TITLE : Tw.ALERT_MSG_MYT_DATA.ALERT_2_A71.TITLE,
        $.proxy(this._onCancel, this),
        $.proxy(this._requestAlarm, this, htParams),
        null,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A71.BUTTON,
        $target);

    } else {
      htParams = $.extend(htParams, {
        typeCd: '2',
        amt: this.amt.toString()
      });

      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A72.MSG_1 + $('.fe-alarm-amount').text() + Tw.ALERT_MSG_MYT_DATA.ALERT_2_A72.MSG_2,
        isChange ? Tw.ALERT_MSG_MYT_DATA.ALERT_2_A204.TITLE : Tw.ALERT_MSG_MYT_DATA.ALERT_2_A72.TITLE,
        $.proxy(this._onCancel, this),
        $.proxy(this._requestAlarm, this, htParams, $target),
        null,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A72.BUTTON,
        $target);
    }
  },

  _onCancel: function () {
    this._isCancel = true;
    this._popupService.close();
  },

  _requestAlarm: function (htParams, $target) {
    if ( this.typeCd === '0' ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0076, {})
        .done($.proxy(this._onCompleteUnsubscribeAlarm, this, $target));
    } else {
      if ( this._isCancel ) {
        this._apiService.request(Tw.API_CMD.BFF_06_0064, htParams)
          .done($.proxy(this._onCompleteAlarm, this, $target));
      }
    }
  },

  _onCompleteAlarm: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/prepaid/alarm-complete');
    } else {
      Tw.Error(res.code, res.msg).pop(null, $target);
    }
  },

  _onCompleteUnsubscribeAlarm: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A210, null, null, $.proxy(this._gotoSubmain, this), null, $target);
    } else {
      Tw.Error(res.code, res.msg).pop(null, $target);
    }
  },

  _gotoSubmain: function () {
    this._popupService.close();
    this._historyService.replaceURL('/myt-data/submain');
  },

  _goBack: function () {
    this._historyService.goBack();
  }
};