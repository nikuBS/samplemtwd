/**
 * FileName: myt.usage.tdatashare-close.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.27
 */

Tw.MytUsageTdatashareClose = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);

  this._assign();
  this._bindEvent();
  this._init();
};

Tw.MytUsageTdatashareClose.prototype = {
  _assign: function () {
    this._$main = this.$container.find('#fe-main');
    this._$complete = this.$container.find('#fe-complete');
    this._cSvcMgmtNum = this.$container.data('csvcmgmtnum');
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-close-submit', $.proxy(this._closeSubmit, this));
    this.$container.on('click', '.fe-ico-back', $.proxy(this._onClickIcoBack, this));
    this.$container.on('click', '.fe-btn-back', $.proxy(this._onClickBtnBack, this));
  },

  _init: function () {

  },

  _closeSubmit: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0011, {}, {}, this._cSvcMgmtNum)
      .done($.proxy(this._requestDone, this))
      .fail($.proxy(this._requestFail, this));
  },

  _requestDone: function (resp) {
    if ( resp.code === '00' ) {
      this._showComplete();
    } else {
      if ( resp.data ) {
        this._showErrorAlert(resp.data && resp.data.msg);
      } else {
        if ( resp.error ) {
          this._showErrorAlert(resp.error.msg);
        } else {
          this._showErrorAlert(resp.msg);
        }
      }
    }
  },

  _requestFail: function (resp) {
    this._showErrorAlert(resp.data && resp.data.msg);
  },

  _showErrorAlert: function (msg) {
    this._popupService.openAlert(msg);
  },

  _onClickBtnBack: function () {
    this._handleBack();
  },

  _onClickIcoBack: function () {
    if ( this._isComplete ) {
      this._handleBack();
    } else {
      this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, Tw.MSG_MYT.TDATA_SHARE.A01, undefined, undefined, $.proxy(this._handleBack, this));
    }
  },

  _showComplete: function () {
    this._isComplete = true;
    this._$complete.show();
    this._$main.hide();
  },

  _handleBack: function () {
    this._popupService.close();
    this._history.goBack();
  }

};

