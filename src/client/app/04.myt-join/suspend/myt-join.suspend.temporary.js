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
    this.$inputEmail.on('change', $.proxy(this._checkSuspendable, this));
    this.$inputTel.on('change', $.proxy(this._checkSuspendable, this));
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      var formatted = Tw.StringHelper.phoneStringToDash(params.phoneNumber);
      this.$inputImmediatelyGift.val(formatted);
    }
  },
  _onClickResetNotification: function (e) {
    if ( e.currentTarget.getAttribute('data-noti') === 'true' ) {
      this.$restoreNotiGroup.show();
    } else {
      this.$restoreNotiGroup.hide();
    }
    this._checkSuspendable();
  },
  _onNotiMethodChanged: function (e) {
    if ( e.currentTarget.checked ) {
      $(e.currentTarget).parent().find('.comp-list-layout input,button').removeAttr('disabled');
    } else {
      $(e.currentTarget).parent().find('.comp-list-layout input,button').attr('disabled', 'disabled');
    }
  },

  _checkSuspendable: function (e) {
    if ( (!this.$checkEmailNoti.attr('checked') || !_.isEmpty(this.$inputEmail.val())) &&
      (!this.$checkSMSnoti.attr('checked') || !_.isEmpty(this.$inputTel.val())) ) {
      this.$btSuspend.removeAttr('disabled');
    } else {
      this.$btSuspend.attr('disabled', '');
    }
  },

  _onClickBtnSuspend: function (e) {
    if ( this.$checkEmailNoti.attr('checked') && !Tw.ValidationHelper.isEmail(this.$inputEmail.val()) ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_EMAIL);
    } else if ( this.$checkSMSnoti.attr('checked') && !Tw.ValidationHelper.isCellPhone(this.$inputTel.val()) ) {
      this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.NOT_VALID_PHONE_NUMBER);
    } else {
      this._popupService.openConfirm(Tw.MYT_JOIN_SUSPEND.CONFIRM.MESSAGE, Tw.MYT_JOIN_SUSPEND.CONFIRM.TITLE, '', null,
        $.proxy(this._requestSuspend, this));
    }
  },

  _onClickBtnReset: function (e) {
  },

  _requestSuspend: function () {
  }
};