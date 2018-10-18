/**
 * FileName: myt-join.suspend.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 15.
 */

Tw.MyTJoinSuspend = function (rootEl) {
  this._children = null;
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;
  this._historyService.init();

  this._cachedElement();
  this._bindEvent();
};

Tw.MyTJoinSuspend.prototype = {
  _cachedElement: function () {
    this.$btnNativeContactList = this.$container.find('.fe-btn_native_contact');
    this.$radioResetNotification = this.$container.find('[data-role="radio-noti"]');
    this.$restoreNotiGroup = this.$container.find('[data-role="fe-restore-noti-group"]');
    this.$checkEmailNoti = this.$container.find('[data-noti-method="email"]');
    this.$checkSMSnoti = this.$container.find('[data-noti-method="sms"]');
  },

  _bindEvent: function () {
    this.$btnNativeContactList.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$radioResetNotification.on('change', $.proxy(this._onClickResetNotification, this));
    this.$checkEmailNoti.on('change', $.proxy(this._onNotiMethodChanged, this));
    this.$checkSMSnoti.on('change', $.proxy(this._onNotiMethodChanged, this));
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
  },
  _onNotiMethodChanged: function (e) {
    if ( e.currentTarget.checked ) {
      $(e.currentTarget).parent().find('.comp-list-layout input,button').removeAttr('disabled');
    } else {
      $(e.currentTarget).parent().find('.comp-list-layout input,button').attr('disabled', 'disabled');
    }
  }

};