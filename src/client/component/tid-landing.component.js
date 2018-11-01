/**
 * FileName: tid-landing.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.06.22
 */

Tw.TidLandingComponent = function (rootEl) {
  this.$container = rootEl;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
};

Tw.TidLandingComponent.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-bt-auth-line', $.proxy(this._onClickBtnAuthLine, this));
    this.$container.on('click', '.fe-bt-account', $.proxy(this._onClickBtAccount, this));
    this.$container.on('click', '.fe-bt-auth-withdrawal-guide', $.proxy(this._onClickBtnAuthWithdrawalGuide, this));
    this.$container.on('click', '.fe-bt-find-id', $.proxy(this._onClickBtFindId, this));
    this.$container.on('click', '.fe-bt-find-pw', $.proxy(this._onClickBtFindPw, this));
    this.$container.on('click', '.fe-bt-change-pw', $.proxy(this._onClickBtChangePw, this));
  },
  _goLoad: function (nativeCommand, url, callback) {
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(nativeCommand, {}, callback);
    } else {
      this._historyService.goLoad(url);
    }
  },
  _onClickBtnAuthLine: function () {
    this._historyService.goLoad('/common/line');
  },
  _onClickBtAccount: function () {
    this._goLoad(Tw.NTV_CMD.ACCOUNT, '/common/tid/account', $.proxy(this._onNativeAccount, this));
  },
  _onClickBtnAuthWithdrawalGuide: function () {
    new Tw.CommonWithdrawal();
  },
  _onClickBtFindId: function () {
    this._goLoad(Tw.NTV_CMD.FIND_ID, '/common/tid/find-id', $.proxy(this._onNativeFindId, this));
  },
  _onClickBtFindPw: function () {
    this._goLoad(Tw.NTV_CMD.FIND_PW, '/common/tid/find-pw', $.proxy(this._onNativeFindPw, this));
  },
  _onClickBtChangePw: function () {
    this._goLoad(Tw.NTV_CMD.CHANGE_PW, '/common/tid/change-pw', $.proxy(this._onNativeChangePw, this));
  },
  _onNativeAccount: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeAccount' });
  },
  _onNativeFindId: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeFindId' });
  },
  _onNativeFindPw: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeFindPw' });
  },
  _onNativeChangePw: function () {
    this._nativeService.send(Tw.NTV_CMD.LOG, { type: Tw.NTV_LOG_T.DEBUG, message: '_onNativeChangePw' });
  }
};