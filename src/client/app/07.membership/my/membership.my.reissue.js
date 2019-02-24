/**
 * FileName: membership.my.reissue.js
 * Author: SeungKyu Kim (ksk4788@pineone.com)
 * Date: 2018.01.29
 */

Tw.MembershipMyReissue = function(rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._cachedElement();
  this._bindEvent();
};

Tw.MembershipMyReissue.prototype = {
  _cachedElement: function() {
    this.$btnReissue = this.$container.find('#fe-reissue');
    this.$btnPrevStep = this.$container.find('.prev-step');
    this.$chkReason = this.$container.find('.fe-reason-check');
  },

  _bindEvent: function() {
    this.$btnReissue.on('click', $.proxy(this._openReissueAlert, this));
    this.$btnPrevStep.on('click', $.proxy(this._goPrevStep, this));
  },

  _openReissueAlert: function() {
    var ALERT = Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A51;
    this._popupService.openConfirmButton(ALERT.MSG, ALERT.TITLE,
      $.proxy(this._handleReissueAlert, this), null, Tw.BUTTON_LABEL.CLOSE, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A51.BUTTON);
  },

  _handleReissueAlert: function() {
    var mbrChgRsnCd = '';
    this.$chkReason.each(function(){
      if($(this).prop('checked')){
        mbrChgRsnCd = $(this).attr('data-code');
      }
    });

    this._apiService
      .request(Tw.API_CMD.BFF_11_0004, { mbrChgRsnCd : mbrChgRsnCd })
      .done($.proxy(this._successReissueRequest, this))
      .fail($.proxy(this._onFail, this));
  },

  _successReissueRequest: function(res) {
    if(res.code === Tw.API_CODE.CODE_00){
      this._popupService.afterRequestSuccess('/membership/my/history', '/membership/my',
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.LINK_TITLE, Tw.ALERT_MSG_MEMBERSHIP.COMPLETE_TITLE.REISSUE,
        Tw.ALERT_MSG_MEMBERSHIP.JOIN_COMPLETE.CONTENT);
    }else{
      this._onFail(res);
    }
  },

  _goPrevStep: function(){
    this._historyService.goLoad('/membership/my');
  },

  _onFail: function(err) {
    Tw.Error(err.code,err.msg).pop();
  }

};
