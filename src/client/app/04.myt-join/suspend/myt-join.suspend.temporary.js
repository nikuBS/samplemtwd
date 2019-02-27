/**
 * FileName: myt-join.suspend.temporary
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 18.
 */
Tw.MyTJoinSuspendTemporary = function (tabEl, params) {
  this.$container = tabEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;

  this._cachedElement();
  this._bindEvent();
  this._params = params;
  this._defaultDate = this.$dateTo.val();
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
  },

  _bindEvent: function () {
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$radioResetNotification.on('change', $.proxy(this._onClickResetNotification, this));
    this.$checkEmailNoti.on('change', $.proxy(this._onNotiMethodChanged, this));
    this.$checkSMSnoti.on('change', $.proxy(this._onNotiMethodChanged, this));
    this.$inputTel.on('keyup', $.proxy(Tw.InputHelper.insertDashCellPhone, this, this.$inputTel));
    this.$btSuspend.on('click', $.proxy(this._onClickBtnSuspend, this));
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
      this.$inputTel.val(formatted);
      this._checkSuspendable(true);
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
      $(e.currentTarget).parent().find('.comp-list-layout input,button').attr('disabled', 'disabled');
    }
    this._checkSuspendable(true);
  },

  /**
   * 일시정지 신청하기 버튼 활성화 여부 체크
   * @param notice
   * @private
   */
  _checkSuspendable: function (notice) {
    if ( !notice ) {
      this.$btSuspend.removeAttr('disabled');
    }
    // 이메일 또는 문자로 안내 선택, 둘 다 선택하지 않은 경우
    else if ( _.isEmpty(this.$checkEmailNoti.attr('checked')) && _.isEmpty(this.$checkSMSnoti.attr('checked')) ) {
      this.$btSuspend.attr('disabled', '');
    } else if ( !_.isEmpty(this.$checkEmailNoti.attr('checked')) && _.isEmpty(this.$inputEmail.val()) ) {
      this.$btSuspend.attr('disabled', '');
    } else if ( !_.isEmpty(this.$checkSMSnoti.attr('checked')) && _.isEmpty(this.$inputTel.val()) ) {
      this.$btSuspend.attr('disabled', '');
    } else {
      this.$btSuspend.removeAttr('disabled');
    }
  },

  _onClickBtnSuspend: function () {
    // validation check
    // 일시정지 종료일 안내 타입별 입력값 확인
    if ( this.$radioResetNotification.filter('[data-noti="true"]').attr('checked') ) {
      if ( this.$checkEmailNoti.attr('checked') && !Tw.ValidationHelper.isEmail(this.$inputEmail.val()) ) {
        this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_EMAIL);
        return;
      }
      if ( this.$checkSMSnoti.attr('checked') && !Tw.ValidationHelper.isCellPhone(this.$inputTel.val()) ) {
        this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_PHONE_NUMBER);
        return;
      }
    }

    // duration check
    this.$dateFrom = this.$container.find('[data-role="fe-date-from"]');
    this.$dateTo = this.$container.find('[data-role="fe-date-to"]');

    if ( this.$dateTo.val() < this.$dateFrom.val()) {// 종료일자가 시작일 이전일 경우
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VAILD_PERIOD_01);
      return;
    } else if (this.$dateTo.val() > this._defaultDate) {// 3개월 초과 설정
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VAILD_PERIOD_02);
      return;
    }

    this._requestSuspend();
  },

  _requestSuspend: function () {
    this._popupService.close();
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    var params = {
      fromDt: this.$dateFrom.val().replace(/-/g, ''),
      toDt: this.$dateTo.val().replace(/-/g, ''),
      icallPhbYn: this.$optionSuspendAll.attr('checked') ? 'Y' : 'N',
      autoCnvtPrefrYn: this.$optionReceiveCall.attr('checked') ? 'Y' : 'N'
    };
    if ( this.$radioResetNotification.filter('[data-noti="true"]').attr('checked') ) {
      if ( this.$checkEmailNoti.attr('checked') ) {
        params.emailAddr = this.$inputEmail.val();
      }

      if ( this.$checkSMSnoti.attr('checked') ) {
        params.smsSvcNum = this.$inputTel.val();
      }
    }
    this._apiService.request(Tw.API_CMD.BFF_05_0151, params)
      .done($.proxy(this._onSuccessRequestSuspend, this, params))
      .fail($.proxy(this._onError, this));
  },

  _onSuccessRequestSuspend: function (params, res) {
    Tw.CommonHelper.endLoading('.container');
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      params.command = 'temporary';
      this._historyService.replaceURL('/myt-join/submain/suspend/complete?' + $.param(params));
      // update svcInfo
      this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
    } else if ( res.code in Tw.MYT_JOIN_SUSPEND.ERROR ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ERROR[res.code] || res.msg);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  _onError: function (res) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(res.status, res.statusText).pop();
  },

  hasChanged: function () {
    var changed =
      !this.$optionSuspendAll.attr('checked') ||
      !this.$optionReceiveCall.attr('checked') ||
      !this.$radioResetNotification.filter('[data-noti="true"]').attr('checked') ||
      !this.$checkEmailNoti.attr('checked') ||
      !this.$checkSMSnoti.attr('checked') ||
      !_.isEmpty(this.$inputTel.val()) ||
      !_.isEmpty(this.$inputEmail.val()) ||
      this._defaultDate !== this.$dateTo.val();
    return changed;

  }
};