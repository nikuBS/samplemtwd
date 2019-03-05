/**
 * FileName: membership.my.cancel.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.01.09
 */

Tw.MembershipMyCancel = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.MembershipMyCancel.prototype = {

  _cachedElement: function() {
    this.$btnInquire = this.$container.find('#fe-cancel');
    this.$btnPrevStep = this.$container.find('.prev-step');
  },

  _bindEvent: function() {
    this.$btnInquire.on('click', $.proxy(this._cancelAlert, this));
    this.$btnPrevStep.on('click', $.proxy(this._goPrevStep, this));
  },

  _cancelAlert: function() {
    var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A56;
    this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE, $.proxy(this._handleCancelAlert, this),
      null, Tw.BUTTON_LABEL.CLOSE, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A56.BUTTON);
  },

  _handleCancelAlert: function() {
    this._popupService.close();
    this._apiService
      .request(Tw.API_CMD.BFF_11_0014, {})
      .done($.proxy(this._cancleComplete, this))
      .fail($.proxy(this._onFail, this));
  },

  _cancleComplete: function(res) {
    if(res.code === Tw.API_CODE.CODE_00) {
      //완료 페이지 이동
      this._popupService.afterRequestSuccess(null, '/membership/submain', null, Tw.ALERT_MSG_MEMBERSHIP.COMPLETE_TITLE.CANCEL);
    }else if(res.code === 'ZMBRE0003') { //가입 당일 해지불가 에러
      var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A71;
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
    }else{
      this._onFail(res);
    }
  },

  _goPrevStep: function(){
    this._historyService.goBack();
  },

  _onFail: function(err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
