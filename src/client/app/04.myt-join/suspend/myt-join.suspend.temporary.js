/**
 * @file myt-join.suspend.temporary
 * @author Hyeryoun Lee
 * @since 2018-10-18
 */
/**
 * @class
 * @desc [장기/일시정지] 처리를 위한 class
 * @param {Object} tabEl - tab content wrapper
 * @param {Object} params - 서버에서 전달하는 값
 * @returns {void}
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
  // [OP002-4422] 일시정지 기간 입력 시 vaildation check
  this.toDate = this.$dateTo.val();
  this.fromDate = this.$dateFrom.val();

  new Tw.InputFocusService(tabEl, this.$btSuspend);
};

Tw.MyTJoinSuspendTemporary.prototype = {
  /**
   * @function
   * @desc Cache elements for binding events.
   * @returns {void}
   */
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
    // [OP002-4422] 일시정지 기간 입력 시 vaildation check
    this.$inputDateSelect = this.$container.find('[data-role="fe-date-select"]');
  },
  /**
   * @function
   * @desc Bind events to elements.
   */
  _bindEvent: function () {
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$radioResetNotification.on('change', $.proxy(this._onClickResetNotification, this));
    this.$checkEmailNoti.on('change', $.proxy(this._onNotiMethodChanged, this));
    this.$checkSMSnoti.on('change', $.proxy(this._onNotiMethodChanged, this));
    this.$inputTel.on('keyup', $.proxy(Tw.InputHelper.insertDashCellPhone, this, this.$inputTel));
    this.$btSuspend.on('click', $.proxy(this._onClickBtnSuspend, this));
    this.$inputEmail.on('change', $.proxy(this._checkSuspendable, this, true));
    this.$inputTel.on('change', $.proxy(this._checkSuspendable, this, true));
    // [OP002-4422] 일시정지 기간 입력 시 vaildation check
    this.$inputDateSelect.on('focus', 'input[type="date"]', $.proxy(this._onFocusDateSelect, this));
    this.$inputDateSelect.on('change', 'input[type="date"]', $.proxy(this._onChangeDateSelect, this));
  },
  /**
   * @function
   * @desc Event listener for the button click on .fe-btn_native_contact(주소록)
   */
  _onClickBtnAddr: function (e) {
    e.stopPropagation();
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },
  /**
   * @function
   * @desc Success call back for Tw.NTV_CMD.GET_CONTACT
   * @param response
   */
  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      var formatted = Tw.StringHelper.phoneStringToDash(params.phoneNumber);
      this.$inputTel.val(formatted);
      this.$inputTel.trigger('change');
      this._checkSuspendable(true);
    }
  },

  /**
   * @function
   * @desc 일시정지 종료일 알림(이메일, 문자) 설정 option event handler
   * @param e
   */
  _onClickResetNotification: function (e) {
    if ( e.currentTarget.getAttribute('data-noti') === 'true' ) {
      this.$restoreNotiGroup.show();
      this.$restoreNotiGroup.attr('aria-hidden', false);
      if ( !this.$checkEmailNoti.attr('checked') ) {
        this.$checkEmailNoti.click();
      }

      if ( !this.$checkSMSnoti.attr('checked') ) {
        this.$checkSMSnoti.click();
      }
      this._checkSuspendable(true);
    } else {
      this.$restoreNotiGroup.hide();
      this.$restoreNotiGroup.attr('aria-hidden', true);
      this._checkSuspendable(false);
    }

  },
  /**
   * @function
   * @desc Event listener for the button click on [data-noti-method="email"](일시정지 유형 변경)
   * @param e
   * @private
   */
  _onNotiMethodChanged: function (e) {
    if ( e.currentTarget.checked ) {
      $(e.currentTarget).parent().find('.comp-list-layout input,button').removeAttr('disabled');
    } else {
      $(e.currentTarget).parent().find('.comp-list-layout input,button').attr('disabled', 'disabled');
    }
    this._checkSuspendable(true);
  },
  /**
   * @function
   * @desc 일시정지 신청하기 버튼 활성화 여부 체크
   * @param notice 버튼 활성화 체크 여부
   */
  _checkSuspendable: function (notice) {
    if ( !notice ) {
      this.$btSuspend.removeAttr('disabled');
    }
    // 이메일 또는 문자로 안내 선택, 둘 다 선택하지 않은 경우
    else if ( !this.$checkEmailNoti.prop('checked') && !this.$checkSMSnoti.prop('checked') ) {
      this.$btSuspend.attr('disabled', '');
    } else if ( this.$checkEmailNoti.prop('checked') && _.isEmpty(this.$inputEmail.val()) ) {
      this.$btSuspend.attr('disabled', '');
    } else if ( this.$checkSMSnoti.prop('checked') && _.isEmpty(this.$inputTel.val()) ) {
      this.$btSuspend.attr('disabled', '');
    } else {
      this.$btSuspend.removeAttr('disabled');
    }
  },
  /**
   * @function
   * @desc Event listener for the button click on [data-id="fe-bt-suspend"](신청하기)
   * @param e
   * @private
   */
  _onClickBtnSuspend: function () {
    // validation check
    // 일시정지 종료일 안내 타입별 입력값 확인
    if ( this.$radioResetNotification.filter('[data-noti="true"]').attr('checked') ) {
      if ( this.$checkEmailNoti.attr('checked') && !Tw.ValidationHelper.isEmail(this.$inputEmail.val()) ) {
        this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_EMAIL,
          null, null, null, null, $(event.currentTarget));
        return;
      }
      if ( this.$checkSMSnoti.attr('checked') && !Tw.ValidationHelper.isCellPhone(this.$inputTel.val()) ) {
        this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_PHONE_NUMBER,
          null, null, null, null, $(event.currentTarget));
        return;
      }
    }
    // 사용자 입력으로 기한을 체크하기 때문에 접수하기 버튼 입력 이후 처리하는 부분 제거
    this._requestSuspend();
  },
  /**
   * @function
   * @desc 장기일시정지 요청
   */
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
  /**
   * @function
   * @desc Success call back for _requestSuspend
   * @param res
   */
  _onSuccessRequestSuspend: function (params, res) {
    Tw.CommonHelper.endLoading('.container');
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      params.command = 'temporary';
      this._historyService.replaceURL('/myt-join/submain/suspend/complete?' + $.param(params));
      // update svcInfo
      this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
    } else if ( res.code in Tw.MYT_JOIN_SUSPEND.ERROR ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ERROR[res.code] || res.msg,
        null, null, null, null, $(event.currentTarget));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  /**
   * @function
   * @desc Error call back
   * @param res
   */
  _onError: function (res) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(res.status, res.statusText).pop();
  },
  /**
   * @function
   * @desc 사용자 입력 내용 여부 체크
   * @returns {boolean}
   */
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

  },

  /**
   * @function
   * @desc 일시정지 기간 선택 시 값 저장 [OP002-4422]
   * @param event
   * @private
   */
  _onFocusDateSelect: function(event) {
    var role = event.target.getAttribute('data-role');
    var value = event.target.value;
    if (role === 'fe-date-to') {
      this.toDate = value;
    } else {
      this.fromDate = value;
    }
  },

  /**
   * @function
   * @desc 일시정지 기간 변경 시 기간 체크 [OP002-4422]
   * @param event
   * @private
   */
  _onChangeDateSelect: function(event) {
    //validation check
    var from, to, diff, msg;
    var targetRole = event.target.getAttribute('data-role');
    // duration check
    from = this.$container.find('[data-role="fe-date-from"]').val().replace(/-/g, '');
    to = this.$container.find('[data-role="fe-date-to"]').val().replace(/-/g, '');
    diff = Tw.DateHelper.getDiffByUnit(from,  Tw.DateHelper.getCurrentShortDate(), 'days');
    if ( diff < 0 ) {// 시작일이 오늘 이전일 경우
      msg = Tw.MYT_JOIN_SUSPEND.NOT_VALID_FROM_DATE;
    } else if ( to < from ) {// 종료일자가 시작일 이전일 경우
      msg = Tw.MYT_JOIN_SUSPEND.NOT_VAILD_PERIOD_01;
    } else if (diff > 93 ) {// -일시정지는 1회 최대 93일 까지 신청 가능
      msg = Tw.MYT_JOIN_SUSPEND.NOT_VAILD_PERIOD_02;
    }
    if (msg) {
      if (targetRole === 'fe-date-from') {
        event.target.value = this.fromDate;
      } else {
        event.target.value = this.toDate;
      }
      this._popupService.openAlert(msg, null, null, null, null, $(event.currentTarget));
    }
  }
};
