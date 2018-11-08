/**
 * FileName: myt-join.suspend.temporary
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 18.
 */
Tw.MyTJoinSuspendTemporary = function (tabEl) {
  this.$container = tabEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;

  this._cachedElement();
  this._bindEvent();
};

Tw.MyTJoinSuspendTemporary.prototype = {
  _cachedElement: function () {
    this.$optionSuspendAll = this.$container.find('[data-role="fe-suspend-all"]');
    this.$optionReceiveCall = this.$container.find('[data-role="fe-accept-call-beforehand"]');
    this.$dateFrom = this.$container.find('[data-role="fe-date-from"]');
    this.$dateTo = this.$container.find('[data-role="fe-date-to"]');
    this.$btnNativeContactList = this.$container.find('.fe-btn_native_contact');
    this.$radioResetNotification = this.$container.find('[data-role="fe-radio-noti"]');
    this.$restoreNotiGroup = this.$container.find('[data-role="fe-restore-noti-group"]');
    this.$checkEmailNoti = this.$container.find('[data-noti-method="email"]');
    this.$checkSMSnoti = this.$container.find('[data-noti-method="sms"]');
    this.$inputEmail = this.$container.find('[data-id="fe-input-email"]');
    this.$inputTel = this.$container.find('[data-id="fe-input-tel"]');
    this.$btSuspend = this.$container.find('[data-id="fe-bt-suspend"]');
    this.$btReset = this.$container.find('[data-id="fe-bt-reset"]');
  },

  _bindEvent: function () {
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$radioResetNotification.on('change', $.proxy(this._onClickResetNotification, this));
    this.$checkEmailNoti.on('change', $.proxy(this._onNotiMethodChanged, this));
    this.$checkSMSnoti.on('change', $.proxy(this._onNotiMethodChanged, this));
    this.$inputTel.on('keyup', $.proxy(Tw.InputHelper.insertDashCellPhone, this, this.$inputTel));
    this.$btSuspend.on('click', $.proxy(this._onClickBtnSuspend, this));
    this.$btReset.on('click', $.proxy(this._onClickBtnReset, this));
    this.$inputEmail.on('change', $.proxy(this._checkSuspendable, this, true));
    this.$inputTel.on('change', $.proxy(this._checkSuspendable, this, true));
  },

  _onClickBtnAddr: function (e) {
    e.stopPropagation();
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      var formatted = Tw.StringHelper.phoneStringToDash(params.phoneNumber);
      this.$inputImmediatelyGift.val(formatted);
    }
  },

  /**
   * 일시정지 종료일 알림(이메일, 문자) 설정 option event handler
   * @param e
   * @private
   */
  _onClickResetNotification: function (e) {
    if ( e.currentTarget.getAttribute('data-noti') === 'true' ) {
      this.$restoreNotiGroup.show();
      if ( !this.$checkEmailNoti.attr('checked') ) {
        this.$checkEmailNoti.click();
      }

      if ( !this.$checkSMSnoti.attr('checked') ) {
        this.$checkSMSnoti.click();
      }
      this._checkSuspendable(true);
    } else {
      this.$restoreNotiGroup.hide();
      this._checkSuspendable(false);
    }

  },
  _onNotiMethodChanged: function (e) {
    if ( e.currentTarget.checked ) {
      $(e.currentTarget).parent().find('.comp-list-layout input,button').removeAttr('disabled');
    } else {
      $(e.currentTarget).parent().find('.comp-listlayout input,button').attr('disabled', 'disabled');
    }
  },

  _checkSuspendable: function (notice) {
    if ( !notice ) {
      this.$btSuspend.removeAttr('disabled');
    }
    else if ( (!this.$checkEmailNoti.attr('checked') || !_.isEmpty(this.$inputEmail.val())) &&
      (!this.$checkSMSnoti.attr('checked') || !_.isEmpty(this.$inputTel.val())) ) {
      this.$btSuspend.removeAttr('disabled');
    } else {
      this.$btSuspend.attr('disabled', '');
    }
  },

  _onClickBtnSuspend: function () {
    // validation check
    if ( this.$radioResetNotification.find('[data-noti="true"]').attr('checked') ) {
      if ( this.$checkEmailNoti.attr('checked') && !Tw.ValidationHelper.isEmail(this.$inputEmail.val()) ) {
        this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_EMAIL);
        return;
      } else if ( this.$checkSMSnoti.attr('checked') && !Tw.ValidationHelper.isCellPhone(this.$inputTel.val()) ) {
        this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_PHONE_NUMBER);
        return;
      }
    }
    this.$dateFrom = this.$container.find('[data-role="fe-date-from"]');
    this.$dateTo = this.$container.find('[data-role="fe-date-to"]');
    var duration = Tw.DateHelper.getDiffByUnit(this.$dateTo.val(), this.$dateFrom.val(), 'months');
    if ( duration > 3 ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_PERIOD);
      return;
    }

    this._popupService.openModalTypeA(Tw.MYT_JOIN_SUSPEND.CONFIRM.TITLE, Tw.MYT_JOIN_SUSPEND.CONFIRM.MESSAGE,
      Tw.MYT_JOIN_SUSPEND.CONFIRM.BTNAME, null, $.proxy(this._requestSuspend, this), null);
  },

  _onClickBtnReset: function () {
    //TODO check unpaid
    this._popupService.openModalTypeA(Tw.MYT_JOIN_SUSPEND.CONFIRM_RESET.TITLE, Tw.MYT_JOIN_SUSPEND.CONFIRM_RESET.MESSAGE,
      Tw.MYT_JOIN_SUSPEND.CONFIRM_RESET.BTNAME, null, $.proxy(this._requestReset, this), null);
  },

  _requestSuspend: function () {
    this._popupService.close();
    skt_landing.action.loading.on({ ta: 'body', co: 'grey', size: true });
    var params = {
      fromDt: this.$dateFrom.val().replace(/-/g, ''),
      toDt: this.$dateTo.val().replace(/-/g, ''),
      icallPhbYn: this.$optionSuspendAll.attr('checked') ? 'Y' : 'N',
      autoCnvtPrefrYn: this.$optionReceiveCall.attr('checked') ? 'Y' : 'N'
    };

    if ( this.$checkEmailNoti.attr('checked') ) {
      params.emailAddr = this.$inputEmail.val();
    }

    if ( this.$checkSMSnoti.attr('checked') ) {
      params.smsSvcNum = this.$inputTel.val();
    }
    this._apiService.request(Tw.API_CMD.BFF_05_0151, params)
      .done($.proxy(this._onSuccessRequestSuspend, this, params))
      .fail($.proxy(this._onError, this));
  },

  _requestReset: function () {
    this._popupService.close();
    skt_landing.action.loading.on({ ta: 'body', co: 'grey', size: true });
    this._apiService.request(Tw.API_CMD.BFF_05_0152, {})
      .done($.proxy(this._onSuccessRequestReset, this))
      .fail($.proxy(this._onError, this));
  },

  _onSuccessRequestSuspend: function (params, res) {
    skt_landing.action.loading.off({ ta: 'body' });
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      var duration = Tw.DateHelper.getFullKoreanDate(params.fromDt) + ' - ' + Tw.DateHelper.getFullKoreanDate(params.toDt);
      var type = params.icallPhbYn === 'Y' ?
        Tw.MYT_JOIN_SUSPEND.TYPE.ALL : Tw.MYT_JOIN_SUSPEND.TYPE.CALL;
      var desc = Tw.MYT_JOIN_SUSPEND.SUCCESS_SUSPEND_MESSAGE.replace('{DURATION}', duration)
        .replace('{SUSPEND_TYPE}', type);
      this._popupService.afterRequestSuccess('/myt/join/suspend#temporary', '/myt/join', null, '신청', desc);
    } else if ( res.code === 'MOD0022' ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ALERT_EXCEED.MESSAGE, Tw.MYT_JOIN_SUSPEND.ALERT_EXCEED.TITLE);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onSuccessRequestReset: function () {
    skt_landing.action.loading.off({ ta: 'body' });
    this._popupService.afterRequestSuccess('/myt/join/suspend#temporary', '/myt/join', null, '해제');
  },

  _onError: function (res) {
    skt_landing.action.loading.off({ ta: 'body' });
    Tw.Error(res.status, res.statusText).pop();
  }
};